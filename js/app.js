/* Transmat Web 5.0 — Propuesta · app.js
 * Demos funcionales de la propuesta. Sin dependencias externas.
 * Ninguna demo envía ni guarda datos personales: solo emite eventos de medición
 * con parámetros no identificables al dataLayer (visible en la esquina inferior izquierda).
 */
(function () {
  'use strict';

  /* ---------- Utilidades ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtInt = n => Math.round(n).toLocaleString('es-CL');
  const fmt1 = n => Number(n).toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TM = window.TM || {};
  const CONTACT = {
    tel: 'tel:+56997741505',
    telLabel: '+56 9 9774 1505',
    wa: txt => 'https://wa.me/56974853606' + (txt ? '?text=' + encodeURIComponent(txt) : '')
  };
  const pJSON = o => esc(JSON.stringify(o));
  function safe(name, fn) { try { fn(); } catch (err) { console.error('[propuesta] módulo ' + name + ':', err); } }

  /* ---------- Medición: dataLayer y registro visible ---------- */
  window.dataLayer = window.dataLayer || [];
  const KEY = new Set((TM.eventos || []).filter(e => e.clave).map(e => e.ev));
  const dlList = $('#dl-list'), dlCount = $('#dl-count'), dlBtn = $('#dl-btn');
  let dlN = 0;
  function track(ev, params) {
    const rec = Object.assign({ event: ev }, params || {});
    window.dataLayer.push(rec);
    if (!dlList) return;
    dlN++;
    const empty = dlList.querySelector('.empty'); if (empty) empty.remove();
    const li = document.createElement('li');
    const t = new Date().toLocaleTimeString('es-CL', { hour12: false });
    const p = Object.assign({}, rec); delete p.event;
    li.innerHTML = '<span class="t">' + t + '</span><span class="e' + (KEY.has(ev) ? ' key' : '') + '">' + esc(ev) + '</span> ' + esc(JSON.stringify(p));
    dlList.prepend(li);
    while (dlList.children.length > 60) dlList.lastElementChild.remove();
    if (dlCount) dlCount.textContent = dlN;
    if (dlBtn) { dlBtn.classList.remove('pulse'); void dlBtn.offsetWidth; dlBtn.classList.add('pulse'); }
  }
  window.TM_track = track;

  safe('dl', () => {
    const box = $('#dl'); if (!box || !dlBtn) return;
    dlBtn.addEventListener('click', () => {
      const open = box.classList.toggle('open');
      dlBtn.setAttribute('aria-expanded', String(open));
    });
    const clr = $('#dl-clear');
    if (clr) clr.addEventListener('click', () => {
      dlList.innerHTML = '<li class="empty">Registro limpio. Usa las demos.</li>';
      dlN = 0; if (dlCount) dlCount.textContent = '0';
    });
  });

  /* Elementos con data-ev emiten su evento al hacer clic (teléfono, WhatsApp, CTAs). */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-ev]'); if (!el) return;
    let p = {}; try { p = el.dataset.p ? JSON.parse(el.dataset.p) : {}; } catch (_) { p = {}; }
    track(el.dataset.ev, p);
    if (el.dataset.handoff) {
      track('asistente_handoff', { canal: el.dataset.ev === 'phone_click' ? 'telefono' : 'whatsapp', intencion: el.dataset.handoff });
    }
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-track]'); if (!a) return;
    const k = a.dataset.track;
    if (k === 'hero_cta_planner') { track('cta_click', { ubicacion_cta: 'hero', destino: 'planificador' }); if (window.TM_plannerStart) window.TM_plannerStart('hero'); }
    else if (k === 'video_cta_click') { track('video_cta_click', { video_id: 'caex-mantoverde', progreso: 100 }); if (window.TM_plannerStart) window.TM_plannerStart('video'); }
    else if (k === 'cta_final_contacto') { track('cta_click', { ubicacion_cta: 'cierre', destino: 'email' }); }
  });

  /* ---------- Revelado al hacer scroll ---------- */
  safe('reveal', () => {
    /* Todo es visible en reposo. Solo se oculta lo que queda bajo el primer viewport, y solo
       cuando hay observador y el visitante no pidió movimiento reducido. */
    if (!('IntersectionObserver' in window) || reduced) return;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.reveal').forEach(e => {
      if (e.getBoundingClientRect().top > vh) { e.classList.add('pre'); io.observe(e); }
    });
  });

  /* ---------- Contadores ---------- */
  safe('count', () => {
    const els = $$('[data-count]'); if (!els.length) return;
    const run = el => {
      const target = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
      if (reduced) { el.textContent = pre + fmtInt(target) + suf; return; }
      const t0 = performance.now(), dur = 1400;
      const f = t => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = pre + fmtInt(target * e) + suf;
        if (k < 1) requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    };
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
    }), { threshold: 0.5 });
    els.forEach(e => io.observe(e));
  });

  /* ---------- Barra de progreso (respaldo si no hay animación por scroll nativa) ---------- */
  safe('scrollbar', () => {
    const bar = $('#scrollbar'); if (!bar) return;
    if (window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()')) return;
    const f = () => {
      const h = document.documentElement;
      const p = h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1);
      bar.style.transform = 'scaleX(' + p + ')';
    };
    window.addEventListener('scroll', f, { passive: true }); f();
  });

  /* ---------- Rail y navegación activa ---------- */
  safe('rail', () => {
    const rail = $('#rail');
    const secs = $$('section[data-rail]');
    if (rail) rail.innerHTML = secs.map(s => '<a href="#' + s.id + '"><i></i><span>' + esc(s.dataset.rail) + '</span></a>').join('');
    const all = $$('main section[id]');
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      const id = '#' + en.target.id;
      $$('.rail a, .nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === id));
    }), { rootMargin: '-35% 0px -55% 0px' });
    all.forEach(s => io.observe(s));
  });

  /* ---------- Radar del hero ---------- */
  safe('radar-hero', () => {
    const t = $('#ticks'), w = $('#wedge'); if (!t) return;
    let h = '';
    for (let i = 0; i < 36; i++) {
      const a = i * 10 * Math.PI / 180, r1 = 360, r2 = i % 3 === 0 ? 346 : 353;
      h += '<line class="r-tick" x1="' + (400 + r1 * Math.sin(a)).toFixed(1) + '" y1="' + (400 - r1 * Math.cos(a)).toFixed(1) +
        '" x2="' + (400 + r2 * Math.sin(a)).toFixed(1) + '" y2="' + (400 - r2 * Math.cos(a)).toFixed(1) + '"/>';
    }
    t.innerHTML = h;
    if (w) w.innerHTML = '<path d="M400 400 L276.1 223.1 A216 216 0 0 1 400 184 Z" fill="rgba(223,8,33,.12)"/>' +
      '<path d="M400 400 L362.5 187.3 A216 216 0 0 1 400 184 Z" fill="rgba(223,8,33,.16)"/>';
  });

  /* ---------- Puntos de valoración ---------- */
  safe('dots', () => {
    $$('.dots[data-n]').forEach(d => {
      const n = +d.dataset.n;
      d.setAttribute('role', 'img'); d.setAttribute('aria-label', n + ' de 5');
      d.innerHTML = [1, 2, 3, 4, 5].map(i => '<i class="' + (i <= n ? 'f' : '') + '"></i>').join('');
    });
  });

  /* ---------- Tablas y listas dibujadas desde el registro ---------- */
  safe('cifras', () => {
    const b = $('#cifras-body'); if (!b || !TM.cifras) return;
    b.innerHTML = TM.cifras.map(c => '<tr><td>' + esc(c.label) + '</td><td class="m">' + esc(c.valor) + '</td><td>' + esc(c.fuente) + '</td><td>' +
      (c.nota ? esc(c.nota) : '<span style="color:var(--txt-3)">—</span>') + '</td><td>' +
      (c.nota ? '<span class="badge amber">Contradicción activa</span>' : '<span class="badge mute">Pendiente: fecha y responsable</span>') + '</td></tr>').join('');
  });
  safe('eventos', () => {
    const b = $('#eventos-body'); if (!b || !TM.eventos) return;
    b.innerHTML = TM.eventos.map(e => '<tr class="' + (e.clave ? 'key' : '') + '"><td class="m">' + esc(e.ev) + '</td><td>' + esc(e.cuando) + '</td><td class="m">' + esc(e.params) +
      '</td><td>' + (e.clave ? '<span class="badge green">Sí</span>' : '<span class="badge mute">No</span>') + '</td><td>' + esc(e.destino) + '</td></tr>').join('');
  });
  safe('radar-tabla', () => {
    const body = $('#radar-body'), filt = $('#radar-filters'); if (!body || !TM.radar) return;
    const EST = { 'Producción': 'green', 'Parcial': 'blue', 'A construir': 'amber', 'Experimental': 'amber', 'Débil': 'mute', 'Disponible': 'mute' };
    const DEC = { 'Adoptar': 'green', 'Piloto': 'blue', 'Observar': 'amber', 'Descartar': 'red' };
    body.innerHTML = TM.radar.map(r => '<tr data-dec="' + esc(r.decision) + '"><td>' + esc(r.t) + '</td><td><span class="badge ' + (EST[r.estado] || 'mute') + '">' + esc(r.estado) +
      '</span></td><td><span class="badge ' + (DEC[r.decision] || '') + '">' + esc(r.decision) + '</span></td><td>' + esc(r.por) + '</td></tr>').join('');
    if (!filt) return;
    const F = ['Todas', 'Adoptar', 'Piloto', 'Observar', 'Descartar'];
    filt.innerHTML = F.map((f, i) => '<button type="button" aria-pressed="' + (i === 0) + '" data-f="' + f + '">' + f + '</button>').join('');
    filt.addEventListener('click', e => {
      const b = e.target.closest('button[data-f]'); if (!b) return;
      $$('button', filt).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      const f = b.dataset.f;
      $$('tr', body).forEach(tr => { tr.style.display = (f === 'Todas' || tr.dataset.dec === f) ? '' : 'none'; });
    });
  });
  safe('ruta', () => {
    const r = $('#road'); if (!r || !TM.ruta) return;
    r.innerHTML = TM.ruta.map((f, i) => '<div class="phase ' + (i === 0 ? 'p0' : '') + '"><span class="f">' + esc(f.fase) + '</span><h3>' + esc(f.nombre) + '</h3><span class="per">' + esc(f.periodo) +
      '</span><ul>' + f.items.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul><div class="hito"><b>Hito de salida</b>' + esc(f.hito) + '</div></div>').join('');
  });
  safe('limites', () => {
    const l = $('#limits'); if (!l || !TM.limites) return;
    l.innerHTML = TM.limites.map((x, i) => '<div class="limit"><b>LÍMITE ' + String(i + 1).padStart(2, '0') + '</b><h3>' + esc(x.t) + '</h3><p>' + esc(x.d) + '</p></div>').join('');
  });
  safe('decisiones', () => {
    const d = $('#decs'); if (!d || !TM.decisiones) return;
    d.innerHTML = TM.decisiones.map((x, i) => {
      const cls = /A1/.test(x.quien) ? 'blue' : /legal/.test(x.quien) ? 'amber' : 'red';
      return '<li><span class="dn">D' + String(i + 1).padStart(2, '0') + '</span><div><h3>' + esc(x.q) + '</h3><p>' + esc(x.d) + '</p></div><span class="badge ' + cls + '">' + esc(x.quien) + '</span></li>';
    }).join('');
  });

  /* ---------- Planificador de operación ---------- */
  safe('planificador', () => {
    const root = $('#planner-main'); if (!root || !TM.flota) return;
    const S = { step: 1, op: '', emerg: false, emergSent: false, peso: 120, largo: '', ancho: '', alto: '', tipo: '', industria: '', zona: '', ventana: '', started: false, done: false };
    const OPS = [
      { v: 'izaje', b: 'Izaje', s: 'Elevar y posicionar una carga con grúa.' },
      { v: 'transporte', b: 'Transporte de carga especial', s: 'Traslado por ruta con líneas modulares, camas bajas o ramplas.' },
      { v: 'combinada', b: 'Izaje y transporte', s: 'Carga, traslado y descarga en una sola operación.' },
      { v: 'montaje', b: 'Montaje con ingeniería', s: 'Estudio de carga, simulación de maniobra y montaje.' }
    ];
    const OPL = { izaje: 'izaje', transporte: 'transporte', combinada: 'izaje y transporte', montaje: 'montaje' };
    const TIPOS = ['Equipo minero (camión, pala, chasis)', 'Transformador o equipo eléctrico', 'Estructura o módulo', 'Material rodante', 'Componente eólico o solar', 'Estanque o recipiente', 'Otro'];
    const VENT = [
      { v: '7d', b: 'Menos de 7 días', s: 'Requiere disponibilidad inmediata.' },
      { v: '2-4s', b: '2 a 4 semanas', s: 'Ruta, permisos y asignación de equipos.' },
      { v: '1-3m', b: '1 a 3 meses', s: 'Estudio de carga y simulación de maniobra.' },
      { v: '3m+', b: 'Más de 3 meses', s: 'Planificación de proyecto.' }
    ];
    const ventLabel = () => (VENT.find(v => v.v === S.ventana) || {}).b || '';
    const waTxt = () => 'Hola Transmat, necesito planificar ' + (OPL[S.op] || 'una operación') + ' de ' + S.peso + ' t' + (S.tipo ? ' (' + S.tipo + ')' : '') + (S.industria ? ' en ' + S.industria : '') + (S.zona ? ', zona ' + S.zona : '') + '.';

    function start(origen) { if (S.started) return; S.started = true; track('rfq_start', { origen: origen || 'planificador', pagina: 'propuesta' }); }
    window.TM_plannerStart = start;

    const steps = () => '<div class="steps" aria-hidden="true">' + [1, 2, 3, 4].map(i => '<i class="' + (i <= S.step ? 'on' : '') + '"></i>').join('') + '</div>';
    const opt = (name, v, b, s, on) => '<div class="opt"><input type="radio" name="' + name + '" id="' + name + '-' + v + '" value="' + esc(v) + '"' + (on ? ' checked' : '') +
      '><label for="' + name + '-' + v + '"><b>' + esc(b) + '</b><span>' + esc(s) + '</span></label></div>';
    const sel = (id, label, arr, cur, ph) => '<label class="field"><span>' + label + '</span><select class="inp" id="' + id + '"><option value="">' + ph + '</option>' +
      arr.map(o => '<option' + (o === cur ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select></label>';
    const emergBox = () => '<div class="callout red" id="emerg-box"><b>Ruta de emergencia.</b> No pasa por un formulario. Transmat opera un servicio de emergencias 24/7: llama o escribe ahora y un ejecutivo coordina el rescate o la maniobra.' +
      '<div class="chips" style="margin-top:12px;gap:10px"><a class="btn btn-red btn-sm" href="' + CONTACT.tel + '" data-ev="phone_click" data-p="' + pJSON({ ubicacion_cta: 'planificador_emergencia', pagina: 'propuesta' }) + '">Llamar ' + CONTACT.telLabel + '</a>' +
      '<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="' + CONTACT.wa('Hola Transmat, tengo una emergencia y necesito coordinar una maniobra de rescate.') + '" data-ev="whatsapp_click" data-p="' + pJSON({ ubicacion_cta: 'planificador_emergencia', pagina: 'propuesta' }) + '">WhatsApp</a></div></div>';

    function candidatos() {
      const w = S.peso, out = [];
      const needCrane = S.op !== 'transporte', needTransport = S.op === 'transporte' || S.op === 'combinada';
      if (needCrane) {
        const cr = TM.flota.filter(f => f.cap >= w).sort((a, b) => a.cap - b.cap).slice(0, 3);
        cr.forEach(f => out.push({ id: f.id, b: f.marca + ' ' + f.modelo, cap: f.cap + ' t nominal' + (f.pluma ? ' · pluma ' + f.pluma + ' m' : ''), small: f.config, ratio: w / f.cap }));
        if (!cr.length) out.push({ b: 'Sobre 750 t: izaje tándem o configuración especial', cap: 'Evaluación de ingeniería', small: 'Transmat ha ejecutado izajes tándem (dos grúas sobre la misma carga). Requiere estudio de carga y simulación de maniobra.', ratio: null });
      }
      if (needTransport) {
        if (w <= 126) out.push({ id: 'camas', b: 'Camas bajas y ramplas extensibles', cap: '30 a 126 t', small: 'Semirremolques de plataforma rebajada o de largo variable.', ratio: w / 126 });
        if (w > 100) out.push({ id: 'lineas', b: 'Líneas modulares', cap: '+80 unidades · cargas de más de 100 t', small: 'Ejes múltiples, dirección independiente por eje, acoplables en ancho y largo.', ratio: null });
        if (w > 250) out.push({ id: 'actros', b: 'Mercedes-Benz Actros 3363', cap: 'Configuraciones especiales sobre 250 t', small: 'Motor OM473 de 625 hp y 3.000 Nm. Dos de las únicas unidades en Chile.', ratio: null });
        else out.push({ id: 'tracto', b: 'Tractocamión Volvo FH540 o Mercedes-Benz Actros 3363', cap: 'Según configuración y ruta', small: 'La asignación depende de las líneas, la pendiente de la ruta y los permisos.', ratio: null });
      }
      return out;
    }
    const card = c => '<div class="cand"><b>' + esc(c.b) + '</b><span class="cap">' + esc(c.cap) + '</span><small>' + esc(c.small) + '</small>' +
      (c.ratio != null ? '<div class="bar" role="img" aria-label="Utilización nominal ' + Math.round(c.ratio * 100) + ' por ciento"><i data-w="' + Math.min(100, Math.round(c.ratio * 100)) + '"></i></div><small class="mono">Utilización nominal: ' + Math.round(c.ratio * 100) + ' %</small>' : '') + '</div>';

    function resultHTML() {
      const c = candidatos();
      return '<h3>Equipos candidatos</h3><p class="hint">Para <b>' + esc(OPL[S.op]) + '</b> de <b>' + S.peso + ' t</b>' + (S.tipo ? ' · ' + esc(S.tipo) : '') + ' · ' + esc(S.industria) + ' · ' + esc(S.zona) + ' · ' + esc(ventLabel()) + '.</p>' +
        '<div class="cands">' + c.map(card).join('') + '</div>' +
        '<div class="callout"><b>Capacidad nominal, no capacidad real.</b> La capacidad a tu radio operativo y la configuración (contrapeso, SuperLift, jib) las valida ingeniería con la tabla de carga del fabricante.' +
        (S.op !== 'izaje' ? ' El transporte incluye gestión de rutas, permisos de carga sobredimensionada y coordinación en ruta.' : '') + '</div>' +
        '<form id="rfq" novalidate><h3 style="font-size:20px;margin-top:26px">Solicitar ficha de pre-factibilidad</h3><p class="hint">Tres datos y un consentimiento. La solicitud llega con origen, equipos candidatos y ventana de fecha.</p>' +
        '<div class="cols-2" style="gap:12px"><label class="field"><span>Nombre</span><input class="inp" id="nombre" autocomplete="name" required></label><label class="field"><span>Empresa</span><input class="inp" id="empresa" autocomplete="organization"></label>' +
        '<label class="field"><span>Correo</span><input class="inp" id="correo" type="email" autocomplete="email" required></label><label class="field"><span>Teléfono (opcional)</span><input class="inp" id="fono" type="tel" autocomplete="tel"></label></div>' +
        '<label class="check"><input type="checkbox" id="consent"><span>Autorizo a Transmat a usar estos datos solo para responder esta solicitud. Puedo revocarlo en cualquier momento.</span></label>' +
        '<p class="note" id="rfq-err" role="alert" style="margin-top:8px;color:#FF5A6B"></p>' +
        '<div class="p-nav"><button type="button" class="btn btn-ghost" data-prev>Volver</button><div class="chips" style="gap:10px"><a class="btn btn-ghost" target="_blank" rel="noopener" href="' + CONTACT.wa(waTxt()) + '" data-ev="whatsapp_click" data-p="' + pJSON({ ubicacion_cta: 'planificador_resultado', pagina: 'propuesta' }) + '">Prefiero WhatsApp</a><button type="submit" class="btn btn-red">Solicitar ficha</button></div></div></form>';
    }
    function doneHTML() {
      const names = candidatos().map(c => c.b).join(' · ');
      return '<div class="done"><div class="ok-ico" aria-hidden="true">✓</div><h3>Solicitud registrada (demostración)</h3>' +
        '<p class="hint" style="margin-top:8px">' + esc(OPL[S.op]) + ' de ' + S.peso + ' t · ' + esc(S.industria) + ' · ' + esc(S.zona) + ' · ' + esc(ventLabel()) + '.<br>Equipos candidatos: ' + esc(names) + '.</p>' +
        '<div class="callout green"><b>En el sitio productivo:</b> la solicitud entra al CRM con origen, consentimiento y equipos candidatos, dispara el evento clave <span class="mono">rfq_submit</span> y un ejecutivo de Transmat la valida con la tabla de carga y la ventana de fecha.</div>' +
        '<p class="note">Esta demostración no envía ni guarda datos personales. Solo se registró el evento de medición con parámetros no identificables.</p>' +
        '<div class="p-nav"><button type="button" class="btn btn-ghost" data-reset>Nueva simulación</button><a class="btn btn-red" href="#datos">Seguir con la propuesta</a></div></div>';
    }
    function render(focus) {
      let h = '';
      if (S.done) h = doneHTML();
      else if (S.step === 1) {
        h = steps() + '<h3>¿Qué necesitas resolver?</h3><p class="hint">Elige la operación principal. Si combina izaje y traslado, elige la operación combinada.</p>' +
          '<div class="opts" role="radiogroup" aria-label="Tipo de operación">' + OPS.map(o => opt('op', o.v, o.b, o.s, S.op === o.v)).join('') + '</div>' +
          '<label class="check" style="margin-top:20px"><input type="checkbox" id="emerg"' + (S.emerg ? ' checked' : '') + '><span><b>Es una emergencia</b>: rescate de carga, equipo detenido o parada no programada.</span></label>' +
          (S.emerg ? emergBox() : '') +
          '<div class="p-nav"><span class="note">Paso 1 de 4</span><button type="button" class="btn btn-red" data-next' + (S.op ? '' : ' disabled') + '>Continuar</button></div>';
      } else if (S.step === 2) {
        h = steps() + '<h3>La carga</h3><p class="hint">Peso estimado y, si lo sabes, dimensiones. No necesitas la ficha exacta: ingeniería la valida después.</p>' +
          '<div class="field"><span>Peso estimado</span><div class="range-row"><input type="range" id="peso" min="5" max="800" step="5" value="' + S.peso + '" aria-label="Peso estimado en toneladas">' +
          '<div style="display:flex;align-items:center;gap:8px"><input class="inp num" type="number" id="peso-n" min="1" max="800" value="' + S.peso + '" aria-label="Peso en toneladas" style="text-align:right"><span class="mono">t</span></div></div></div>' +
          '<div class="field"><span>Dimensiones (opcional, en metros)</span><div class="dims"><input class="inp" type="number" step="0.1" min="0" id="largo" placeholder="Largo" value="' + esc(S.largo) + '" aria-label="Largo en metros">' +
          '<input class="inp" type="number" step="0.1" min="0" id="ancho" placeholder="Ancho" value="' + esc(S.ancho) + '" aria-label="Ancho en metros"><input class="inp" type="number" step="0.1" min="0" id="alto" placeholder="Alto" value="' + esc(S.alto) + '" aria-label="Alto en metros"></div></div>' +
          sel('tipo', 'Tipo de carga', TIPOS, S.tipo, 'Selecciona (opcional)') +
          '<div class="p-nav"><button type="button" class="btn btn-ghost" data-prev>Volver</button><button type="button" class="btn btn-red" data-next>Continuar</button></div>';
      } else if (S.step === 3) {
        const ok = S.industria && S.zona && S.ventana;
        h = steps() + '<h3>La faena</h3><p class="hint">Dónde y cuándo. Define la ruta, los permisos y qué equipos conviene asignar.</p>' +
          sel('industria', 'Industria', TM.planificador.industrias, S.industria, 'Selecciona') + sel('zona', 'Zona de la faena', TM.planificador.zonas, S.zona, 'Selecciona') +
          '<div class="field"><span>Ventana de fecha</span><div class="opts" role="radiogroup" aria-label="Ventana de fecha">' + VENT.map(v => opt('ventana', v.v, v.b, v.s, S.ventana === v.v)).join('') + '</div></div>' +
          '<div class="p-nav"><button type="button" class="btn btn-ghost" data-prev>Volver</button><button type="button" class="btn btn-red" data-next' + (ok ? '' : ' disabled') + '>Ver equipos candidatos</button></div>';
      } else h = steps() + resultHTML();
      root.innerHTML = h;
      if (focus) { const hd = root.querySelector('h3'); if (hd) { hd.tabIndex = -1; hd.focus({ preventScroll: true }); } }
    }
    function goto(n) {
      S.step = Math.max(1, Math.min(4, n));
      track('rfq_step', { paso: S.step, tipo_operacion: S.op || 'sin_definir' });
      render(true);
      if (S.step === 4) {
        const c = candidatos();
        track('rfq_result_shown', { peso_t: S.peso, equipos_candidatos: c.filter(x => x.id).map(x => x.id).join(',') || 'evaluacion_ingenieria' });
        requestAnimationFrame(() => requestAnimationFrame(() => $$('.bar i', root).forEach(i => { i.style.width = i.dataset.w + '%'; })));
      }
    }
    root.addEventListener('change', e => {
      const t = e.target; start('planificador');
      if (t.name === 'op') { S.op = t.value; const b = $('[data-next]', root); if (b) b.disabled = false; }
      else if (t.id === 'emerg') { S.emerg = t.checked; if (S.emerg && !S.emergSent) { S.emergSent = true; track('emergency_route', { origen: 'planificador' }); } render(false); const c = $('#emerg', root); if (c) c.focus(); }
      else if (t.id === 'peso') { S.peso = +t.value; const n = $('#peso-n', root); if (n) n.value = S.peso; }
      else if (t.id === 'peso-n') { const v = Math.max(1, Math.min(800, Math.round(+t.value || 1))); S.peso = v; t.value = v; const r = $('#peso', root); if (r) r.value = v; }
      else if (['largo', 'ancho', 'alto', 'tipo', 'industria', 'zona'].indexOf(t.id) >= 0) { S[t.id] = t.value; }
      else if (t.name === 'ventana') { S.ventana = t.value; }
      if (S.step === 3) { const b = $('[data-next]', root); if (b) b.disabled = !(S.industria && S.zona && S.ventana); }
    });
    root.addEventListener('input', e => {
      if (e.target.id === 'peso') { S.peso = +e.target.value; const n = $('#peso-n', root); if (n) n.value = S.peso; }
    });
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-next],[data-prev],[data-reset]'); if (!b) return;
      if (b.hasAttribute('data-next')) goto(S.step + 1);
      else if (b.hasAttribute('data-prev')) goto(S.step - 1);
      else { Object.assign(S, { step: 1, op: '', emerg: false, peso: 120, largo: '', ancho: '', alto: '', tipo: '', industria: '', zona: '', ventana: '', done: false }); render(true); }
    });
    root.addEventListener('submit', e => {
      if (e.target.id !== 'rfq') return;
      e.preventDefault();
      const f = e.target, err = $('#rfq-err', f);
      const nombre = $('#nombre', f).value.trim(), correo = $('#correo', f).value.trim(), consent = $('#consent', f).checked;
      if (!nombre || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) { err.textContent = 'Necesitamos un nombre y un correo válido.'; return; }
      if (!consent) { err.textContent = 'Marca el consentimiento para enviar la solicitud.'; return; }
      track('rfq_submit', { tipo_operacion: S.op, peso_t: S.peso, industria: S.industria, zona: S.zona, ventana: S.ventana, consentimiento: true });
      S.done = true; render(true);
    });
    render(false);
  });

  /* ---------- Flota interactiva: geometría de la pluma ---------- */
  safe('flota', () => {
    const list = $('#fleet-list'), svg = $('#reach'), ang = $('#angle'); if (!list || !svg || !TM.flota) return;
    let cur = TM.flota[0];
    const W = 640, H = 400, PX = 3.6, OX = 80, OY = 352, BASE = OY - 14;
    list.innerHTML = TM.flota.map(f => '<button type="button" data-id="' + f.id + '" aria-pressed="' + (f === cur) + '"><b>' + esc(f.marca + ' ' + f.modelo) + '</b><span class="cp">' + f.cap + ' t</span><small>' +
      (f.pluma ? 'Pluma ' + f.pluma + ' m' : 'Pluma: dato pendiente') + ' · ' + esc(f.tipo) + '</small></button>').join('');
    list.addEventListener('click', e => {
      const b = e.target.closest('button[data-id]'); if (!b) return;
      cur = TM.flota.find(f => f.id === b.dataset.id) || cur;
      $$('button', list).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      draw(); track('ficha_equipo_view', { modelo: cur.modelo, capacidad_t: cur.cap });
    });
    ang.addEventListener('input', draw);
    function set(id, v) { const el = $(id); if (el) el.innerHTML = v; }
    function draw() {
      const a = +ang.value, L = cur.pluma;
      let h = '';
      for (let m = 0; m <= 140; m += 20) {
        const x = OX + m * PX;
        h += '<line class="g-line" x1="' + x + '" y1="20" x2="' + x + '" y2="' + OY + '"/>';
        h += '<text class="g-txt" x="' + x + '" y="' + (OY + 14) + '" text-anchor="middle">' + m + '</text>';
      }
      for (let m = 20; m <= 80; m += 20) {
        const y = BASE - m * PX;
        h += '<line class="g-line" x1="' + OX + '" y1="' + y + '" x2="630" y2="' + y + '"/><text class="g-txt" x="' + (OX - 8) + '" y="' + (y + 3) + '" text-anchor="end">' + m + '</text>';
      }
      h += '<line x1="20" y1="' + OY + '" x2="630" y2="' + OY + '" stroke="rgba(255,255,255,.45)" stroke-width="1.5"/>';
      h += '<text class="g-txt" x="630" y="22" text-anchor="end">RADIO DESDE EL EJE DE GIRO · M</text><text class="g-txt" x="' + (OX - 60) + '" y="' + (OY + 30) + '">ALTURA · M</text>';
      h += '<rect x="' + (OX - 34) + '" y="' + BASE + '" width="68" height="14" fill="#1a1a1c" stroke="rgba(255,255,255,.4)"/><circle cx="' + OX + '" cy="' + BASE + '" r="4" fill="#fff"/>';
      if (L) {
        const rad = a * Math.PI / 180, r = L * Math.cos(rad), hh = L * Math.sin(rad);
        const tx = OX + r * PX, ty = BASE - hh * PX;
        h += '<line x1="' + OX + '" y1="' + BASE + '" x2="' + tx.toFixed(1) + '" y2="' + ty.toFixed(1) + '" stroke="#DF0821" stroke-width="7" stroke-linecap="round"/>';
        h += '<line x1="' + OX + '" y1="' + BASE + '" x2="' + tx.toFixed(1) + '" y2="' + ty.toFixed(1) + '" stroke="rgba(255,255,255,.35)" stroke-width="1"/>';
        h += '<line x1="' + tx.toFixed(1) + '" y1="' + ty.toFixed(1) + '" x2="' + tx.toFixed(1) + '" y2="' + (OY - 38) + '" stroke="rgba(255,255,255,.6)" stroke-width="1" stroke-dasharray="3 4"/>';
        h += '<rect x="' + (tx - 10).toFixed(1) + '" y="' + (OY - 38) + '" width="20" height="14" fill="none" stroke="#fff" stroke-width="1.2"/>';
        h += '<line class="g-dim" x1="' + OX + '" y1="' + (OY + 30) + '" x2="' + tx.toFixed(1) + '" y2="' + (OY + 30) + '"/>';
        h += '<text class="g-txt" x="' + ((OX + tx) / 2).toFixed(1) + '" y="' + (OY + 44) + '" text-anchor="middle" style="fill:#FF5A6B">r = ' + fmt1(r) + ' m</text>';
        h += '<line class="g-dim" x1="' + (tx + 14).toFixed(1) + '" y1="' + ty.toFixed(1) + '" x2="' + (tx + 14).toFixed(1) + '" y2="' + BASE + '"/>';
        h += '<text class="g-txt" x="' + (tx + 20).toFixed(1) + '" y="' + ((ty + BASE) / 2).toFixed(1) + '" style="fill:#FF5A6B">h = ' + fmt1(hh) + ' m</text>';
        set('#ro-l', L + '<small>m</small>'); set('#ro-a', a + '<small>°</small>'); set('#ro-r', fmt1(r) + '<small>m</small>'); set('#ro-h', fmt1(hh) + '<small>m</small>');
        set('#reach-note', 'Pluma principal de ' + L + ' m a ' + a + '°: radio de ' + fmt1(r) + ' m y altura de punta de ' + fmt1(hh) + ' m sobre el eje de giro. La capacidad a ese radio la define la tabla de carga de ' + esc(cur.marca) + ' (dependencia D2).');
      } else {
        h += '<text class="g-txt" x="' + (OX + 20) + '" y="150" style="fill:#fff;font-size:12px">' + esc(cur.marca + ' ' + cur.modelo) + '</text><text class="g-txt" x="' + (OX + 20) + '" y="170">LONGITUD DE PLUMA PRINCIPAL PENDIENTE DE CARGA (DEPENDENCIA D2)</text>';
        set('#ro-l', '—'); set('#ro-a', a + '<small>°</small>'); set('#ro-r', '—'); set('#ro-h', '—');
        set('#reach-note', esc(cur.marca + ' ' + cur.modelo) + ': ' + esc(cur.config) + '. La longitud de pluma principal se carga desde la ficha del fabricante.');
      }
      svg.innerHTML = h;
      svg.setAttribute('aria-label', 'Esquema de la pluma de ' + cur.marca + ' ' + cur.modelo + (L ? ' a ' + a + ' grados' : ''));
    }
    draw();
  });

  /* ---------- Entrada por industria ---------- */
  safe('industrias', () => {
    const tabs = $('#ind-tabs'), panel = $('#ind-panel'); if (!tabs || !panel || !TM.industrias) return;
    let cur = TM.industrias[0].id;
    tabs.innerHTML = TM.industrias.map(i => '<button type="button" role="tab" id="tab-' + i.id + '" aria-selected="' + (i.id === cur) + '" aria-controls="ind-panel" data-id="' + i.id + '">' + esc(i.nombre) + '<i aria-hidden="true">→</i></button>').join('');
    tabs.addEventListener('click', e => {
      const b = e.target.closest('button[data-id]'); if (!b) return;
      cur = b.dataset.id; $$('button', tabs).forEach(x => x.setAttribute('aria-selected', String(x === b)));
      show(); track('industria_view', { industria: cur });
    });
    tabs.addEventListener('keydown', e => {
      if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].indexOf(e.key) < 0) return;
      const bs = $$('button', tabs), i = bs.findIndex(b => b.dataset.id === cur);
      const n = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? (i + 1) % bs.length : (i - 1 + bs.length) % bs.length;
      bs[n].focus(); bs[n].click(); e.preventDefault();
    });
    function show() {
      const d = TM.industrias.find(i => i.id === cur);
      const li = (arr, empty) => arr.length ? arr.map(x => '<li>' + esc(x) + '</li>').join('') : '<li style="color:var(--txt-3)">' + empty + '</li>';
      panel.setAttribute('aria-labelledby', 'tab-' + cur);
      panel.innerHTML = '<div class="ind-img" style="background-image:url(\'assets/' + d.img + '\')"><span class="tagp">Imagen de stock provisoria · se reemplaza por fotografía de faena</span></div>' +
        '<div class="ind-body"><h3>' + esc(d.nombre) + '</h3><p>' + esc(d.lead) + '</p>' +
        '<div class="ind-col"><h4>Proyectos publicados</h4><ul>' + li(d.proyectos, 'Sin caso publicado todavía') + '</ul></div>' +
        '<div class="ind-col"><h4>Equipos asignados en esos casos</h4><ul>' + li(d.equipos, 'Se define con el primer caso') + '</ul></div>' +
        '<div class="ind-col"><h4>Artículos</h4><ul>' + li(d.articulos, 'Sin artículo todavía') + '</ul></div>' +
        (d.brecha ? '<span class="gap-flag">Brecha de contenido: el registro marca qué falta antes de publicar</span>' : '<span class="gap-flag none">Contenido suficiente para lanzar la página</span>') +
        '<div style="margin-top:20px"><a class="btn btn-red btn-sm" href="#planificador">Planificar una operación en ' + esc(d.nombre.toLowerCase()) + '</a></div></div>';
    }
    show();
  });

  /* ---------- Portal de proyecto (simulación CGO) ---------- */
  safe('cgo', () => {
    const box = $('#cgo'); if (!box) return;
    const stages = $('#cgo-stages'), check = $('#cgo-check'), done = $('#cgo-done'), dot = $('#cgo-dot'), pct = $('#cgo-pct'), gps = $('#cgo-gps');
    if (!stages || !done || !dot) return;
    const ST = [['Creación de OT', 'Solicitud ingresada y validada'], ['Ingreso', 'Alcance, ruta y matriz de riesgos'], ['Programación de recursos', '12 líneas modulares · 2 Actros 3363 · escolta'], ['Ejecución', 'Reporte diario vía app · GPS en tiempo real'], ['Finalización y estado de pago', 'Cierre de servicio en línea']];
    stages.innerHTML = ST.map((s, i) => '<li class="' + (i < 3 ? 'done' : i === 3 ? 'now' : '') + '">' + esc(s[0]) + '<small>' + esc(s[1]) + '</small></li>').join('');
    const CK = [['Orden de trabajo', 'Creada'], ['Recursos programados', '12 líneas · 2 tractocamiones'], ['Checklist de equipamiento', 'Completo'], ['Permisos de ruta y escolta', 'Vigentes'], ['Reporte diario vía app', 'En curso'], ['Incidentes reportados', '0'], ['Estado de pago', 'Al cierre']];
    if (check) check.innerHTML = CK.map(c => '<li><span>' + esc(c[0]) + '</span><span class="badge ' + (c[1] === 'En curso' ? 'red' : 'mute') + '">' + esc(c[1]) + '</span></li>').join('');
    const len = done.getTotalLength();
    done.style.strokeDasharray = len;
    function set(p) {
      done.style.strokeDashoffset = len * (1 - p);
      const pt = done.getPointAtLength(len * p);
      dot.setAttribute('cx', pt.x.toFixed(1)); dot.setAttribute('cy', pt.y.toFixed(1));
      if (pct) pct.innerHTML = Math.round(p * 100) + '<small>%</small>';
      if (gps) gps.textContent = 'hace ' + Math.max(1, Math.round(6 - p * 5)) + ' min';
    }
    if (reduced) { set(0.62); return; }
    const DUR = 22000, HOLD = 2500;
    let running = false, acc = 0, last = 0, raf = 0;
    function frame(t) {
      if (!running) return;
      acc += t - last; last = t;
      const e = acc % (DUR + HOLD);
      set(Math.min(1, e / DUR) * 0.78);
      raf = requestAnimationFrame(frame);
    }
    const io = new IntersectionObserver(es => es.forEach(en => {
      running = en.isIntersecting;
      if (running) { last = performance.now(); raf = requestAnimationFrame(frame); } else cancelAnimationFrame(raf);
    }), { threshold: 0.2 });
    io.observe(box); set(0);
  });

  /* ---------- Grafo de conocimiento ---------- */
  safe('grafo', () => {
    const svg = $('#graph'), panel = $('#entity'); if (!svg || !panel || !TM.grafo) return;
    const NS = 'http://www.w3.org/2000/svg', G = TM.grafo;
    const cols = { industria: { x: 20, w: 200, h: 42 }, proyecto: { x: 330, w: 310, h: 50 }, equipo: { x: 760, w: 200, h: 46 } };
    const byType = { industria: [], proyecto: [], equipo: [] };
    G.nodos.forEach(n => byType[n.tipo].push(n));
    const pos = {};
    Object.keys(byType).forEach(t => {
      const arr = byType[t], c = cols[t], gap = (560 - 60) / arr.length;
      arr.forEach((n, i) => { pos[n.id] = { x: c.x, y: 40 + gap * i + (gap - c.h) / 2, w: c.w, h: c.h }; });
    });
    const mk = (tag, attrs, parent) => { const el = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach(k => el.setAttribute(k, attrs[k])); (parent || svg).appendChild(el); return el; };
    const txt = (x, y, s, cls) => { const t = mk('text', { x: x, y: y, 'class': cls || '' }); t.textContent = s; return t; };
    txt(20, 24, 'INDUSTRIA', 'gh'); txt(330, 24, 'PROYECTO', 'gh'); txt(760, 24, 'EQUIPO', 'gh');
    const links = [], nodes = new Map();
    const lg = mk('g');
    G.enlaces.forEach(([a, b]) => {
      const A = pos[a], B = pos[b]; if (!A || !B) return;
      const x1 = A.x + A.w, y1 = A.y + A.h / 2, x2 = B.x, y2 = B.y + B.h / 2;
      const p = mk('path', { 'class': 'link', d: 'M' + x1 + ' ' + y1 + ' C ' + (x1 + 70) + ' ' + y1 + ', ' + (x2 - 70) + ' ' + y2 + ', ' + x2 + ' ' + y2 }, lg);
      links.push({ el: p, a: a, b: b });
    });
    G.nodos.forEach(n => {
      const P = pos[n.id];
      const g = mk('g', { 'class': 'node t-' + n.tipo, tabindex: '0', role: 'button', 'aria-label': n.label + (n.sub ? ', ' + n.sub : ''), transform: 'translate(' + P.x + ' ' + P.y + ')' });
      mk('rect', { width: P.w, height: P.h, rx: 2 }, g);
      const t = mk('text', { x: 12, y: n.sub ? 20 : P.h / 2 + 4 }, g); t.textContent = n.label;
      if (n.sub) { const s = mk('text', { x: 12, y: 36, 'class': 's' }, g); s.textContent = n.sub; }
      g.addEventListener('click', () => select(n.id));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(n.id); } });
      nodes.set(n.id, g);
    });
    const byId = id => G.nodos.find(n => n.id === id);
    const TL = { industria: 'Industria', proyecto: 'Proyecto', equipo: 'Equipo' };
    function neighbors(id) { const s = new Set(); G.enlaces.forEach(([a, b]) => { if (a === id) s.add(b); if (b === id) s.add(a); }); return s; }
    function ld(n) {
      const A = (G.atributos || {})[n.id] || {}, nb = Array.from(neighbors(n.id)).map(byId);
      const org = { '@type': 'Organization', name: 'Transmat', url: 'https://transmat.cl/' };
      if (n.tipo === 'equipo') {
        const props = [];
        if (A.cap) props.push({ '@type': 'PropertyValue', name: 'Capacidad nominal', value: A.cap, unitText: 't' });
        if (A.pluma) props.push({ '@type': 'PropertyValue', name: 'Pluma principal', value: A.pluma, unitText: 'm' });
        return { '@context': 'https://schema.org', '@type': 'Product', name: n.label, description: n.sub, manufacturer: A.mfr ? { '@type': 'Organization', name: A.mfr } : undefined, additionalProperty: props.length ? props : undefined, subjectOf: nb.filter(x => x.tipo === 'proyecto').map(x => ({ '@type': 'CreativeWork', name: x.label })) };
      }
      if (n.tipo === 'proyecto') {
        return { '@context': 'https://schema.org', '@type': 'CreativeWork', additionalType: 'Caso de proyecto', name: n.label, contentLocation: { '@type': 'Place', name: A.lugar || n.sub }, about: nb.filter(x => x.tipo === 'equipo').map(x => ({ '@type': 'Product', name: x.label })), provider: org, inLanguage: 'es-CL' };
      }
      return { '@context': 'https://schema.org', '@type': 'Service', name: 'Izajes y transportes de alta complejidad · ' + n.label, serviceType: 'Izaje, transporte de cargas especiales, ingeniería y montaje', provider: org, areaServed: { '@type': 'Country', name: 'Chile' }, subjectOf: nb.map(x => ({ '@type': 'CreativeWork', name: x.label })) };
    }
    function hl(obj) {
      const val = v => /^&quot;/.test(v) ? v.replace(/^(&quot;.*&quot;)(,?)$/, '<span class="s">$1</span>$2') : /^\d/.test(v) ? v.replace(/^(\d+(?:\.\d+)?)(,?)$/, '<span class="n">$1</span>$2') : v;
      return esc(JSON.stringify(obj, null, 2)).split('\n').map(l => {
        let m = l.match(/^(\s*)(&quot;.*?&quot;)(\s*:\s*)(.*)$/); if (m) return m[1] + '<span class="k">' + m[2] + '</span>' + m[3] + val(m[4]);
        m = l.match(/^(\s*)(&quot;.*?&quot;)(,?)$/); if (m) return m[1] + '<span class="s">' + m[2] + '</span>' + m[3];
        return l;
      }).join('\n');
    }
    function select(id) {
      const nb = neighbors(id);
      nodes.forEach((g, nid) => { g.classList.toggle('sel', nid === id); g.classList.toggle('rel', nid !== id && nb.has(nid)); g.classList.toggle('dim', nid !== id && !nb.has(nid)); });
      links.forEach(l => { const on = l.a === id || l.b === id; l.el.classList.toggle('on', on); l.el.classList.toggle('dim', !on); });
      const n = byId(id), rel = Array.from(nb).map(byId);
      const grp = t => rel.filter(x => x.tipo === t);
      let h = '<span class="tp">' + TL[n.tipo] + '</span><h3>' + esc(n.label) + '</h3>' + (n.sub ? '<p class="note">' + esc(n.sub) + '</p>' : '');
      ['industria', 'proyecto', 'equipo'].forEach(t => {
        const g = grp(t); if (!g.length) return;
        h += '<div><span class="kicker" style="margin-bottom:4px">' + TL[t] + (g.length > 1 ? 's' : '') + ' relacionad' + (t === 'industria' ? 'as' : 'os') + '</span><ul>' + g.map(x => '<li>' + esc(x.label) + (x.sub ? ' <span style="color:var(--txt-3)">· ' + esc(x.sub) + '</span>' : '') + '</li>').join('') + '</ul></div>';
      });
      h += '<div><span class="kicker" style="margin-bottom:6px">Marcado estructurado generado (JSON-LD)</span><pre class="code">' + hl(ld(n)) + '</pre></div>';
      panel.innerHTML = h;
    }
    select('p-930e');
  });

  /* ---------- Asistente técnico (respuestas predefinidas) ---------- */
  safe('asistente', () => {
    const msgs = $('#chat-msgs'), form = $('#chat-form'), input = $('#chat-input'), chips = $('#chat-chips'); if (!msgs || !form || !input) return;
    const INTENTS = [
      { k: /(emergenc|urgent|rescate|24\/7|ahora mismo|volcad|detenid)/i, i: 'emergencia', emergency: true, src: ['Servicio de emergencias 24/7'], acts: [['Llamar ' + CONTACT.telLabel, 'tel'], ['WhatsApp', 'wa']],
        a: 'Para una emergencia no uses el formulario. Transmat mantiene un <b>servicio de emergencias 24/7</b> para rescate de cargas y equipos detenidos, con base en La Negra, Antofagasta, y sucursal en Calama. Llama o escribe ahora y un ejecutivo coordina la maniobra.' },
      { k: /(precio|cuesta|cuánto|cuanto|tarifa|valor|cotiz|arriend|arrend|rental|presupuesto)/i, i: 'precio', handoff: true, src: ['Regla del asistente: sin precios ni plazos'], acts: [['WhatsApp con contexto', 'wa'], ['Planificar la operación', '#planificador']],
        a: 'No entrego precios, plazos ni disponibilidad: dependen del radio operativo, la configuración, la ruta y la fecha, y los define un ejecutivo de Transmat. Puedo dejarle tu consulta resumida por WhatsApp o preparar una <b>ficha de pre-factibilidad</b> con el planificador.' },
      { k: /\b500\b/, i: 'flota_500', src: ['Ficha XCMG XCA500SA', 'Ficha XCMG XCA500BR', 'Proyecto: techumbre Mall Plaza Antofagasta'], acts: [['Ver flota interactiva', '#experiencia'], ['Planificar la operación', '#planificador']],
        a: '<b>Dos modelos de 500 t.</b> XCMG <b>XCA500SA</b>: pluma de 85 m, ampliable a 150 m con torre y plumines; motores Mercedes-Benz y monitoreo de presión en estabilizadores en tiempo real. XCMG <b>XCA500BR</b>: pluma de 90 m con SuperLift y jib fijo; con jib offset de 40° alcanzó 75 m de radio operativo en el montaje de la techumbre del Mall Plaza Antofagasta. La capacidad a tu radio la define la tabla de carga.' },
      { k: /(750|más grande|mas grande|mayor capacidad|máxima|maxima|mayor grúa|mayor grua)/i, i: 'flota_max', src: ['Ficha XCMG XCA750SA', 'Ficha XCMG XCA600'],
        a: 'La mayor capacidad de la flota es la XCMG <b>XCA750SA</b>: 750 t nominales, pluma de 90 m, con SuperLift, Wind Power Jib, Luffing Jib y jib fijo. Le sigue la XCMG <b>XCA600</b>: 600 t, pluma de 17 a 90 m en 7 secciones y contrapeso combinado de hasta 180 t.' },
      { k: /(120|locomotora|traslad|transport|mover|carga|líneas modulares|lineas modulares|cama baja|rampla)/i, i: 'transporte_120', src: ['Proyecto: locomotora de 120 t, EFE', 'Ficha líneas modulares', 'Ficha Mercedes-Benz Actros 3363'], acts: [['Planificar la operación', '#planificador']],
        a: 'Para una carga de 120 t usamos <b>líneas modulares</b> (+80 unidades, cargas de más de 100 t) traccionadas por tractocamión. Caso de referencia: traslado de una locomotora de 120 t desde Puerto Angamos a Estación Central (EFE) con 12 líneas modulares y 2 Mercedes-Benz Actros 3363. El servicio incluye planificación de ruta, permisos de carga sobredimensionada y supervisión en terreno.' },
      { k: /(dónde|donde|ubicaci|antofagasta|calama|la negra|sucursal|direcci)/i, i: 'ubicacion', src: ['Datos de contacto verificados'],
        a: 'Base operativa en el Sector Industrial <b>La Negra, Antofagasta</b> (Héctor Gómez Cobo 630), con sucursal en <b>Calama</b> para cobertura de la zona norte.' },
      { k: /(cgo|seguimiento|gps|trazabilidad|estado de pago|orden de trabajo|portal)/i, i: 'cgo', src: ['CGO · Centro de Gestión Operacional'],
        a: 'El <b>CGO</b> (Centro de Gestión Operacional) controla las órdenes de trabajo en terreno: programación de recursos, reporte diario vía app, GPS en tiempo real, checklist de equipamiento, reporte de incidentes y estados de pago en línea. En el sitio 5.0, el cliente vería su proyecto en un portal de solo lectura.' },
      { k: /(norma|asme|iso|seguridad|certific)/i, i: 'normativa', src: ['ASME B30.5', 'ISO 9927'],
        a: 'Las operaciones de izaje crítico se planifican con referencia a <b>ASME B30.5</b> (grúas móviles) e <b>ISO 9927</b> (inspección de grúas), con control de carga continuo, verificación de estabilidad y supervisión operacional.' },
      { k: /(grúa|grua|flota|modelos|equipos|capacidad)/i, i: 'flota', src: ['Registro de flota'], acts: [['Ver flota interactiva', '#experiencia']],
        a: '<b>+30 grúas</b> de alto tonelaje, de 35 a 800 t. Modelos documentados: XCMG XCA750SA (750 t), XCA600 (600 t), XCA500SA y XCA500BR (500 t), Grove GMK7450 (450 t), Grove GMK6300L (300 t, dos unidades), Liebherr LTM 1250-5.1 (250 t), XCMG XCA160 (160 t) y XCT100 híbrida (100 t).' }
    ];
    const DEF = { i: 'sin_respuesta', handoff: true, src: ['Sin dato verificado en el registro'], acts: [['WhatsApp con contexto', 'wa'], ['Registrar brecha de contenido', 'gap']],
      a: 'No tengo ese dato verificado en el registro de Transmat y no voy a inventarlo. Puedo derivarte a un ejecutivo con tu consulta resumida, o registrarla como brecha de contenido para que se publique.' };
    const match = q => INTENTS.find(it => it.k.test(q)) || DEF;
    function actBtn(lbl, kind, o) {
      const p = pJSON({ ubicacion_cta: 'asistente', pagina: 'propuesta' });
      if (kind === 'wa') return '<a class="btn btn-red btn-sm" target="_blank" rel="noopener" href="' + CONTACT.wa('Hola Transmat, consulté al asistente del sitio: «' + (o.q || '') + '». Quisiera hablar con un ejecutivo.') + '" data-ev="whatsapp_click" data-p="' + p + '" data-handoff="' + esc(o.intent || '') + '">' + esc(lbl) + '</a>';
      if (kind === 'tel') return '<a class="btn btn-red btn-sm" href="' + CONTACT.tel + '" data-ev="phone_click" data-p="' + p + '" data-handoff="' + esc(o.intent || '') + '">' + esc(lbl) + '</a>';
      if (kind === 'gap') return '<button type="button" class="btn btn-ghost btn-sm" data-gap="1">' + esc(lbl) + '</button>';
      return '<a class="btn btn-ghost btn-sm" href="' + esc(kind) + '">' + esc(lbl) + '</a>';
    }
    function addMsg(role, html, o) {
      o = o || {};
      const d = document.createElement('div'); d.className = 'msg ' + role;
      let inner = role === 'u' ? esc(html) : html;
      if (o.src && o.src.length) inner += '<div class="src">' + o.src.map(s => '<span class="chip">' + esc(s) + '</span>').join('') + '</div>';
      if (o.acts && o.acts.length) inner += '<div class="acts">' + o.acts.map(a => actBtn(a[0], a[1], o)).join('') + '</div>';
      d.innerHTML = inner; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d;
    }
    function ask(q) {
      q = String(q || '').trim(); if (!q) return;
      addMsg('u', q); input.value = '';
      const it = match(q);
      track('asistente_pregunta', { intencion: it.i });
      if (it.emergency) track('emergency_route', { origen: 'asistente' });
      const tp = addMsg('a', '<span class="typing" aria-label="Escribiendo"><i></i><i></i><i></i></span>');
      setTimeout(() => { tp.remove(); addMsg('a', it.a, { src: it.src, acts: it.acts, q: q, intent: it.i }); }, reduced ? 0 : 650);
    }
    addMsg('a', 'Soy el asistente técnico de Transmat (demostración). Respondo desde el registro verificado, cito la fuente y derivo a una persona cuando corresponde. <b>No entrego precios ni plazos.</b> ¿Qué necesitas resolver?');
    if (chips && TM.asistente) chips.innerHTML = TM.asistente.sugerencias.map(s => '<button type="button" class="chip" data-q="' + esc(s) + '">' + esc(s) + '</button>').join('');
    form.addEventListener('submit', e => { e.preventDefault(); ask(input.value); });
    document.addEventListener('click', e => {
      const c = e.target.closest('[data-q]'); if (c) { ask(c.dataset.q); return; }
      const g = e.target.closest('[data-gap]'); if (g && msgs.contains(g)) {
        g.disabled = true; track('asistente_pregunta', { intencion: 'brecha_registrada' });
        addMsg('a', 'Registrado como <b>brecha de contenido</b>. En el sitio productivo, las consultas sin respuesta se revisan cada mes y se convierten en fichas o artículos.');
      }
    });
  });
})();
