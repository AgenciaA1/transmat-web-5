#!/usr/bin/env python3
"""Genera dist/artifact.html a partir de index.html para publicarlo como artefacto en claude.ai.

El visor de artefactos envuelve la página en su propio <!doctype html><html><head>…</head><body>
(con charset y viewport), así que el archivo publicado no debe traer esas etiquetas: solo <title>,
enlaces a fuentes, la hoja de estilos y el contenido del <body>. Las rutas relativas (css/, js/,
assets/) se conservan: esos archivos se publican junto a la página.

index.html sigue siendo la única fuente. Uso:
    python3 tools/build_artifact.py        → escribe dist/artifact.html (dist/ no se versiona)
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / 'index.html'
OUT = ROOT / 'dist' / 'artifact.html'

# Metas que el visor ya aporta o que no aplican dentro de él.
DROP = re.compile(r'<meta\s+(charset=|name="(viewport|robots|theme-color|description)")')


def main() -> int:
    html = SRC.read_text(encoding='utf-8')
    head = re.search(r'<head>(.*?)</head>', html, re.S)
    body = re.search(r'<body>(.*?)</body>', html, re.S)
    if not head or not body:
        print('index.html: no se encontró <head> o <body>', file=sys.stderr)
        return 1

    keep = [line.strip() for line in head.group(1).splitlines() if line.strip()]
    keep = [line for line in keep if not DROP.match(line)]
    # El <title> va primero: el visor solo lee los primeros 8 KB para nombrar el artefacto.
    keep.sort(key=lambda line: 0 if line.startswith('<title>') else 1)
    if not keep or not keep[0].startswith('<title>'):
        print('index.html: falta <title>', file=sys.stderr)
        return 1

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text('\n'.join(keep) + '\n' + body.group(1).strip() + '\n', encoding='utf-8')
    print(f'{OUT.relative_to(ROOT)}: {OUT.stat().st_size:,} bytes')
    return 0


if __name__ == '__main__':
    sys.exit(main())
