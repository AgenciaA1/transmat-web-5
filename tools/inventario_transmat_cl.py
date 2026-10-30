#!/usr/bin/env python3
"""Inventario completo del sitio actual transmat.cl (WordPress + Elementor + Yoast). Solo lectura.

Descarga por la REST API pública de WordPress las páginas, los posts (artículos, proyectos,
noticias), los tipos de contenido de flota (grua-movil, camion-pluma, semirremolque,
tracto-camion) y el listado de medios; lee el sitemap de Yoast; extrae de cada URL su texto,
encabezados, imágenes, PDFs, enlaces, videos y formularios; y escribe:

  <out>/raw/*.json                        datos crudos por tipo (base para la migración)
  <out>/INVENTARIO_CONTENIDO_ACTUAL.md    resumen legible (base de la arquitectura)

Uso:
  python3 tools/inventario_transmat_cl.py [--out docs/inventario] [--delay 0.35]
"""
import argparse
import html
import json
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser

BASE = 'https://transmat.cl'
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36 A1-inventario'
TIPOS_REST = ['pages', 'posts', 'grua-movil', 'camion-pluma', 'semirremolque', 'tracto-camion']
DELAY = 0.35


def log(msg):
    print(msg, file=sys.stderr, flush=True)


def fetch(url, retries=3):
    """Devuelve (bytes, headers) o (None, None) si falla."""
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': '*/*'})
            with urllib.request.urlopen(req, timeout=40) as r:
                data = r.read()
                time.sleep(DELAY)
                return data, dict(r.headers)
        except urllib.error.HTTPError as e:
            if e.code in (400, 401, 403, 404):
                log(f'  HTTP {e.code} {url}')
                return None, {'status': e.code}
            time.sleep(1.5 * (i + 1))
        except Exception as e:  # red, timeout
            log(f'  reintento {i + 1} {url}: {e}')
            time.sleep(1.5 * (i + 1))
    return None, None


def fetch_json(url):
    data, headers = fetch(url)
    if not data:
        return None, headers or {}
    try:
        return json.loads(data.decode('utf-8', 'replace')), headers
    except json.JSONDecodeError:
        return None, headers


def rest_all(tipo):
    """Pagina la REST API hasta agotar X-WP-TotalPages."""
    items, page = [], 1
    while True:
        url = f'{BASE}/wp-json/wp/v2/{tipo}?per_page=100&page={page}&_embed=wp:featuredmedia,wp:term'
        data, headers = fetch_json(url)
        if data is None:
            break
        items.extend(data)
        total_pages = int(headers.get('X-WP-TotalPages', headers.get('x-wp-totalpages', 1)) or 1)
        if page >= total_pages:
            break
        page += 1
    return items


# ---------- Extracción de HTML ----------
BLOQUES = {'p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'th', 'blockquote', 'figcaption', 'span', 'div', 'a', 'button', 'label'}
IGNORAR = {'script', 'style', 'noscript', 'svg', 'template'}


class Extractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.headings, self.textos, self.imagenes, self.enlaces, self.pdfs, self.videos, self.forms = [], [], [], [], [], [], []
        self._h, self._txt, self._ignore, self._a = None, [], 0, None
        self._form = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in IGNORAR:
            self._ignore += 1
            return
        if tag in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
            self._h = (int(tag[1]), [])
        elif tag == 'img':
            src = a.get('data-src') or a.get('src') or ''
            if src and not src.startswith('data:'):
                self.imagenes.append({'src': src, 'alt': (a.get('alt') or '').strip()})
        elif tag == 'a':
            href = a.get('href') or ''
            self._a = {'href': href, 'txt': [], 'cls': a.get('class', '')}
            if href.lower().split('?')[0].endswith('.pdf'):
                self.pdfs.append(href)
        elif tag == 'iframe':
            src = a.get('data-src') or a.get('src') or ''
            if src:
                self.videos.append(src)
        elif tag == 'form':
            self._form = {'id': a.get('id', ''), 'campos': []}
        elif tag in ('input', 'select', 'textarea') and self._form is not None:
            if a.get('type') in ('hidden', 'submit', 'button'):
                return
            self._form['campos'].append({'tag': tag, 'name': a.get('name', ''), 'type': a.get('type', ''), 'placeholder': a.get('placeholder', ''), 'required': 'required' in a})
        if tag in ('p', 'li', 'br', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'tr'):
            self._txt.append('\n')

    def handle_endtag(self, tag):
        if tag in IGNORAR:
            self._ignore = max(0, self._ignore - 1)
            return
        if tag in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6') and self._h:
            t = limpiar(' '.join(self._h[1]))
            if t:
                self.headings.append({'n': self._h[0], 't': t})
            self._h = None
        elif tag == 'a' and self._a is not None:
            t = limpiar(' '.join(self._a['txt']))
            if self._a['href'] and (t or 'button' in self._a['cls']):
                self.enlaces.append({'t': t, 'href': self._a['href'], 'btn': 'button' in self._a['cls']})
            self._a = None
        elif tag == 'form' and self._form is not None:
            self.forms.append(self._form)
            self._form = None
        if tag in ('p', 'li', 'div', 'tr'):
            self._txt.append('\n')

    def handle_data(self, data):
        if self._ignore:
            return
        if self._h is not None:
            self._h[1].append(data)
        if self._a is not None:
            self._a['txt'].append(data)
        self._txt.append(data)

    def texto(self):
        t = ''.join(self._txt)
        t = re.sub(r'[ \t\r\f\v]+', ' ', t)
        t = re.sub(r'\n\s*\n+', '\n', t)
        return t.strip()


def limpiar(s):
    return re.sub(r'\s+', ' ', html.unescape(s or '')).strip()


def extraer(html_doc, solo_main=True):
    """Extrae del documento; si solo_main, se queda con <main>…</main> o con la zona de página de Elementor."""
    doc = html_doc
    if solo_main:
        m = re.search(r'<main\b.*?</main>', html_doc, re.S | re.I)
        if not m:
            m = re.search(r'<div[^>]+data-elementor-type="(?:wp-page|single|single-post|product)".*?(?=<footer\b|<div[^>]+data-elementor-type="footer")', html_doc, re.S | re.I)
        if m:
            doc = m.group(0)
    ex = Extractor()
    try:
        ex.feed(doc)
    except Exception as e:  # HTML roto: seguimos con lo parseado
        log(f'  parser: {e}')
    return ex


def extraer_zona(html_doc, tag_regex):
    m = re.search(tag_regex, html_doc, re.S | re.I)
    return extraer(m.group(0), solo_main=False) if m else None


def palabras(texto):
    return len(re.findall(r'\w+', texto, re.U))


# ---------- Normalización de ítems REST ----------
def norm(item, tipo):
    emb = item.get('_embedded', {}) or {}
    media = (emb.get('wp:featuredmedia') or [{}])[0] or {}
    terms = [t.get('name') for grp in (emb.get('wp:term') or []) for t in grp if t.get('name')]
    y = item.get('yoast_head_json') or {}
    og = (y.get('og_image') or [{}])
    content = item.get('content', {}).get('rendered', '') if isinstance(item.get('content'), dict) else ''
    ex = extraer(content, solo_main=False) if content else None
    txt = ex.texto() if ex else ''
    return {
        'tipo': tipo, 'id': item.get('id'), 'link': item.get('link'), 'slug': item.get('slug'),
        'estado': item.get('status'), 'fecha': (item.get('date') or '')[:10], 'modificado': (item.get('modified') or '')[:10],
        'titulo': limpiar(item.get('title', {}).get('rendered', '')),
        'extracto': limpiar(re.sub('<[^>]+>', ' ', item.get('excerpt', {}).get('rendered', '')))[:300] if isinstance(item.get('excerpt'), dict) else '',
        'terminos': terms, 'parent': item.get('parent', 0), 'orden': item.get('menu_order', 0),
        'imagen_destacada': media.get('source_url', ''),
        'seo': {'title': y.get('title', ''), 'description': y.get('description', ''), 'canonical': y.get('canonical', ''),
                'robots': (y.get('robots') or {}).get('index', ''), 'og_image': (og[0] or {}).get('url', '') if og else ''},
        'acf': item.get('acf') if isinstance(item.get('acf'), dict) else None,
        'contenido_html': content,
        'contenido_texto': txt, 'palabras_contenido': palabras(txt),
        'headings_contenido': ex.headings if ex else [], 'imagenes_contenido': ex.imagenes if ex else [],
        'pdfs_contenido': ex.pdfs if ex else [], 'videos_contenido': ex.videos if ex else [],
    }


def enriquecer_con_html(it):
    """Descarga la URL pública y extrae la página renderizada (necesario en páginas Elementor)."""
    data, headers = fetch(it['link'])
    if not data:
        it['html_status'] = (headers or {}).get('status', 'error')
        return
    doc = data.decode('utf-8', 'replace')
    ex = extraer(doc, solo_main=True)
    txt = ex.texto()
    it.update({
        'html_status': 200, 'texto_pagina': txt, 'palabras_pagina': palabras(txt),
        'headings_pagina': ex.headings, 'imagenes_pagina': ex.imagenes, 'enlaces_pagina': ex.enlaces[:120],
        'pdfs_pagina': sorted(set(ex.pdfs + it.get('pdfs_contenido', []))), 'videos_pagina': sorted(set(ex.videos)),
        'formularios_pagina': ex.forms,
        'title_tag': limpiar((re.search(r'<title[^>]*>(.*?)</title>', doc, re.S | re.I) or [None, ''])[1]),
        'meta_description': limpiar((re.search(r'<meta[^>]+name="description"[^>]+content="([^"]*)"', doc, re.I) or [None, ''])[1]),
        'meta_robots': limpiar((re.search(r'<meta[^>]+name="robots"[^>]+content="([^"]*)"', doc, re.I) or [None, ''])[1]),
        'elementor': 'elementor' in doc.lower(),
        'gtm': 'googletagmanager.com' in doc, 'gtag': 'gtag(' in doc or 'gtag/js' in doc,
    })


def sitemap_urls():
    out = []
    data, _ = fetch(f'{BASE}/sitemap_index.xml')
    if not data:
        return out
    hijos = re.findall(r'<loc>(.*?)</loc>', data.decode('utf-8', 'replace'))
    for h in hijos:
        d, _ = fetch(h)
        if not d:
            continue
        for m in re.finditer(r'<url>\s*<loc>(.*?)</loc>(?:\s*<lastmod>(.*?)</lastmod>)?', d.decode('utf-8', 'replace'), re.S):
            out.append({'sitemap': h.rsplit('/', 1)[-1], 'url': html.unescape(m.group(1)), 'lastmod': (m.group(2) or '')[:10]})
    return out


def medios():
    items, page = [], 1
    while True:
        url = f'{BASE}/wp-json/wp/v2/media?per_page=100&page={page}&_fields=id,source_url,mime_type,media_details.width,media_details.height,media_details.filesize,title,alt_text,date'
        data, headers = fetch_json(url)
        if data is None:
            break
        for m in data:
            md = m.get('media_details') or {}
            items.append({'id': m.get('id'), 'url': m.get('source_url'), 'mime': m.get('mime_type'), 'w': md.get('width'), 'h': md.get('height'),
                          'bytes': md.get('filesize'), 'titulo': limpiar((m.get('title') or {}).get('rendered', '')), 'alt': m.get('alt_text', ''), 'fecha': (m.get('date') or '')[:10]})
        total_pages = int(headers.get('X-WP-TotalPages', headers.get('x-wp-totalpages', 1)) or 1)
        if page >= total_pages:
            break
        page += 1
    return items


def menu_y_footer():
    data, _ = fetch(BASE + '/')
    if not data:
        return {}, {}, ''
    doc = data.decode('utf-8', 'replace')
    nav = extraer_zona(doc, r'<header\b.*?</header>') or extraer_zona(doc, r'<nav\b.*?</nav>')
    foot = extraer_zona(doc, r'<footer\b.*?</footer>')
    def links(ex):
        vistos, out = set(), []
        for e in (ex.enlaces if ex else []):
            k = (e['t'], e['href'])
            if e['t'] and k not in vistos:
                vistos.add(k); out.append({'t': e['t'], 'href': e['href']})
        return out
    return {'enlaces': links(nav)}, {'enlaces': links(foot), 'texto': (foot.texto()[:1500] if foot else '')}, doc


# ---------- Resumen Markdown ----------
def fmt_int(n):
    return f'{n:,}'.replace(',', '.')


def tabla(filas, cab):
    out = ['| ' + ' | '.join(cab) + ' |', '|' + '---|' * len(cab)]
    for f in filas:
        out.append('| ' + ' | '.join(str(c).replace('|', '\\|').replace('\n', ' ') for c in f) + ' |')
    return '\n'.join(out)


def resumen_md(inv):
    L = []
    L.append('# Inventario de contenido — transmat.cl (sitio actual)\n')
    L.append(f"Generado el {time.strftime('%Y-%m-%d')} con `tools/inventario_transmat_cl.py` (REST API de WordPress + sitemap Yoast + HTML renderizado). Solo lectura. Base para la arquitectura del sitio 5.0 y para la migración de contenido.\n")
    c = inv['conteos']
    L.append('## 1. Resumen\n')
    L.append(tabla([[k, fmt_int(v)] for k, v in c.items()], ['Tipo', 'Cantidad']))
    L.append('')
    # Menú
    L.append('## 2. Navegación actual\n')
    L.append('**Menú principal (header):**\n')
    L.append(tabla([[e['t'], e['href']] for e in inv['menu'].get('enlaces', [])], ['Texto', 'Enlace']))
    L.append('\n**Footer:**\n')
    L.append(tabla([[e['t'], e['href']] for e in inv['footer'].get('enlaces', [])], ['Texto', 'Enlace']))
    L.append('')
    # Páginas
    L.append('## 3. Páginas\n')
    filas = []
    for p in sorted(inv['pages'], key=lambda x: x['link']):
        h1 = next((h['t'] for h in p.get('headings_pagina', []) if h['n'] == 1), '')
        forms = '; '.join(','.join(f"{c_['name'] or c_['tag']}" for c_ in f['campos']) for f in p.get('formularios_pagina', []) if f['campos'])
        filas.append([p['link'].replace(BASE, ''), p['titulo'], p['seo']['title'] or p.get('title_tag', ''), (p['seo']['description'] or p.get('meta_description') or '—')[:90], h1, p.get('palabras_pagina', 0), len(p.get('imagenes_pagina', [])), len(p.get('pdfs_pagina', [])), len(p.get('videos_pagina', [])), forms or '—', p['modificado']])
    L.append(tabla(filas, ['URL', 'Título WP', 'Title SEO', 'Meta description', 'H1', 'Palabras', 'Imgs', 'PDFs', 'Videos', 'Formulario (campos)', 'Modif.']))
    L.append('\n### 3.1 Estructura de cada página (encabezados y botones)\n')
    for p in sorted(inv['pages'], key=lambda x: x['link']):
        L.append(f"#### {p['link'].replace(BASE, '') or '/'} — {p['titulo']}")
        hs = [f"{'  ' * (h['n'] - 1)}- H{h['n']} {h['t']}" for h in p.get('headings_pagina', [])][:40]
        L.append('\n'.join(hs) if hs else '_(sin encabezados detectados)_')
        btns = [f"[{e['t']}]({e['href']})" for e in p.get('enlaces_pagina', []) if e.get('btn')][:12]
        if btns:
            L.append('\nBotones/CTA: ' + ' · '.join(btns))
        if p.get('pdfs_pagina'):
            L.append('\nPDFs: ' + ' · '.join(p['pdfs_pagina'][:10]))
        if p.get('videos_pagina'):
            L.append('\nVideos: ' + ' · '.join(p['videos_pagina'][:5]))
        L.append('')
    # Flota
    L.append('## 4. Flota (tipos de contenido propios)\n')
    for tipo in ['grua-movil', 'tracto-camion', 'semirremolque', 'camion-pluma']:
        its = inv['flota'].get(tipo, [])
        L.append(f'### {tipo} — {len(its)} ítems\n')
        filas = []
        for it in its:
            spec = (it.get('texto_pagina') or it.get('contenido_texto') or '')
            spec = re.sub(r'\s+', ' ', spec)[:220]
            filas.append([it['titulo'], it['link'].replace(BASE, ''), 'sí' if it.get('imagen_destacada') or it.get('imagenes_pagina') else 'no', len(it.get('pdfs_pagina', []) or it.get('pdfs_contenido', [])), 'sí' if it.get('acf') else 'no', spec or '—'])
        L.append(tabla(filas, ['Modelo', 'URL', 'Imagen', 'PDFs', 'Campos ACF', 'Texto (inicio)']) if filas else '_(sin ítems)_')
        L.append('')
    # Posts por categoría
    L.append('## 5. Proyectos, artículos y noticias (posts)\n')
    grupos = {}
    for p in inv['posts']:
        ruta = urllib.parse.urlparse(p['link']).path.strip('/').split('/')[0]
        grupos.setdefault(ruta, []).append(p)
    for ruta, its in sorted(grupos.items()):
        L.append(f'### /{ruta}/ — {len(its)} posts\n')
        filas = [[p['fecha'], p['titulo'], p['link'].replace(BASE, ''), ', '.join(p['terminos'][:3]), p.get('palabras_pagina') or p['palabras_contenido'], 'sí' if p['imagen_destacada'] else 'no', 'sí' if p['seo']['description'] else 'no'] for p in sorted(its, key=lambda x: x['fecha'], reverse=True)]
        L.append(tabla(filas, ['Fecha', 'Título', 'URL', 'Categorías', 'Palabras', 'Img', 'Meta desc.']))
        L.append('')
    # Medios
    L.append('## 6. Biblioteca de medios\n')
    m = inv['medios']
    por_mime = {}
    total_bytes = 0
    for x in m:
        por_mime[x['mime']] = por_mime.get(x['mime'], 0) + 1
        total_bytes += x.get('bytes') or 0
    L.append(tabla(sorted(por_mime.items(), key=lambda kv: -kv[1]), ['MIME', 'Archivos']))
    L.append(f"\nTotal: {fmt_int(len(m))} archivos" + (f", ~{total_bytes / 1_048_576:,.0f} MB declarados" if total_bytes else '') + f". Sin texto alternativo: {fmt_int(sum(1 for x in m if (x['mime'] or '').startswith('image') and not x['alt']))} imágenes.\n")
    pdfs = [x for x in m if x['mime'] == 'application/pdf']
    if pdfs:
        L.append(f'### PDFs en la biblioteca ({len(pdfs)})\n')
        L.append(tabla([[x['titulo'], x['url'], x['fecha']] for x in pdfs[:80]], ['Título', 'URL', 'Fecha']))
        L.append('')
    # Sitemap
    L.append('## 7. Sitemap Yoast (URLs indexables declaradas)\n')
    por_sm = {}
    for u in inv['sitemap']:
        por_sm.setdefault(u['sitemap'], []).append(u)
    L.append(tabla([[k, len(v)] for k, v in por_sm.items()], ['Sitemap', 'URLs']))
    L.append('')
    # Hallazgos automáticos
    L.append('## 8. Hallazgos automáticos\n')
    h = inv['hallazgos']
    for k, v in h.items():
        if v:
            L.append(f'- **{k}**: ' + '; '.join(map(str, v[:25])) + (f' … (+{len(v) - 25})' if len(v) > 25 else ''))
    L.append('')
    return '\n'.join(L)


def hallazgos(inv):
    H = {}
    titulos = {}
    for p in inv['pages'] + inv['posts']:
        titulos.setdefault(p['titulo'].lower(), []).append(p['link'])
    H['Títulos duplicados'] = [f"{t}: {', '.join(l)}" for t, l in titulos.items() if len(l) > 1]
    H['Páginas sin meta description'] = [p['link'] for p in inv['pages'] if not (p['seo']['description'] or p.get('meta_description'))]
    H['Páginas con menos de 80 palabras'] = [p['link'] for p in inv['pages'] if p.get('palabras_pagina', 0) < 80]
    H['Páginas no indexables (noindex)'] = [p['link'] for p in inv['pages'] + inv['posts'] if 'noindex' in (p.get('meta_robots') or p['seo'].get('robots') or '').lower()]
    H['URLs con sufijo numérico o de prueba'] = [p['link'] for p in inv['pages'] if re.search(r'-\d+/?$|tarjeta|mailing|prueba|test|copia', p['link'])]
    H['Posts sin imagen destacada'] = [p['link'] for p in inv['posts'] if not p['imagen_destacada']]
    H['Posts sin meta description'] = [p['link'] for p in inv['posts'] if not p['seo']['description']]
    H['Imágenes sin alt en páginas'] = [f"{p['link']} ({sum(1 for i in p.get('imagenes_pagina', []) if not i['alt'])})" for p in inv['pages'] if any(not i['alt'] for i in p.get('imagenes_pagina', []))]
    H['Formularios detectados'] = [f"{p['link']}: {', '.join(c['name'] or c['tag'] for f in p['formularios_pagina'] for c in f['campos'])}" for p in inv['pages'] if p.get('formularios_pagina') and any(f['campos'] for f in p['formularios_pagina'])]
    H['Páginas con Google Tag Manager'] = [p['link'] for p in inv['pages'] if p.get('gtm')]
    H['Ítems de flota sin texto'] = [it['link'] for tipo in inv['flota'] for it in inv['flota'][tipo] if (it.get('palabras_pagina') or it['palabras_contenido'] or 0) < 20]
    return H


def main():
    global DELAY
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='docs/inventario')
    ap.add_argument('--delay', type=float, default=DELAY)
    ap.add_argument('--sin-html', action='store_true', help='no descarga el HTML de cada URL (más rápido, menos exacto)')
    args = ap.parse_args()
    DELAY = args.delay
    out = pathlib.Path(args.out)
    (out / 'raw').mkdir(parents=True, exist_ok=True)

    inv = {'base': BASE, 'generado': time.strftime('%Y-%m-%d %H:%M'), 'pages': [], 'posts': [], 'flota': {}, 'medios': [], 'sitemap': [], 'menu': {}, 'footer': {}}

    log('sitemap…'); inv['sitemap'] = sitemap_urls()
    log('menú y footer…'); inv['menu'], inv['footer'], home_html = menu_y_footer()
    for tipo in TIPOS_REST:
        log(f'REST {tipo}…')
        items = [norm(i, tipo) for i in rest_all(tipo)]
        if tipo == 'pages':
            inv['pages'] = items
        elif tipo == 'posts':
            inv['posts'] = items
        else:
            inv['flota'][tipo] = items
    log('medios…'); inv['medios'] = medios()

    if not args.sin_html:
        objetivo = inv['pages'] + [it for its in inv['flota'].values() for it in its] + [p for p in inv['posts'] if p['palabras_contenido'] < 120]
        log(f'HTML de {len(objetivo)} URLs…')
        for n, it in enumerate(objetivo, 1):
            log(f'  [{n}/{len(objetivo)}] {it["link"]}')
            enriquecer_con_html(it)

    inv['conteos'] = {
        'Páginas (REST)': len(inv['pages']), 'Posts (REST)': len(inv['posts']),
        **{f'Flota: {k}': len(v) for k, v in inv['flota'].items()},
        'Archivos de medios': len(inv['medios']), 'URLs en sitemap Yoast': len(inv['sitemap']),
    }
    inv['hallazgos'] = hallazgos(inv)

    # Crudos (sin el HTML completo del home para no inflar)
    for k in ['pages', 'posts', 'medios', 'sitemap']:
        (out / 'raw' / f'{k}.json').write_text(json.dumps(inv[k], ensure_ascii=False, indent=1), encoding='utf-8')
    for k, v in inv['flota'].items():
        (out / 'raw' / f'flota_{k}.json').write_text(json.dumps(v, ensure_ascii=False, indent=1), encoding='utf-8')
    (out / 'raw' / 'navegacion.json').write_text(json.dumps({'menu': inv['menu'], 'footer': inv['footer']}, ensure_ascii=False, indent=1), encoding='utf-8')
    (out / 'INVENTARIO_CONTENIDO_ACTUAL.md').write_text(resumen_md(inv), encoding='utf-8')
    log(f"listo → {out / 'INVENTARIO_CONTENIDO_ACTUAL.md'}")
    print(json.dumps(inv['conteos'], ensure_ascii=False))


if __name__ == '__main__':
    main()
