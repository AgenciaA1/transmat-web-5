/* Registro maestro de datos — Transmat Web 5.0 (propuesta)
 *
 * Todas las cifras, modelos y proyectos provienen de CONTEXTO_TRANSMAT_AGENTE_COPY.md
 * (secciones 2, 3 y 8) y de material ya aprobado por el cliente.
 * Regla del proyecto: no inventar tonelajes, modelos ni fechas.
 * Cuando un dato no está verificado, el valor es null y la interfaz lo declara.
 */
window.TM = {

  /* ---------- Cifras corporativas (ficha única) ---------- */
  cifras: [
    { k: 'trayectoria', label: 'Trayectoria',            valor: '+15 años',   fuente: 'Registro corporativo', nota: 'El sitio actual publica además "10 años": contradicción a corregir.' },
    { k: 'izajes',      label: 'Izajes anuales',         valor: '+10.000',    fuente: 'Registro corporativo', nota: '' },
    { k: 'gruas',       label: 'Flota de grúas',         valor: '+30',        fuente: 'Registro corporativo', nota: '' },
    { k: 'capacidad',   label: 'Rango de capacidad',     valor: '35 a 800 t', fuente: 'Registro corporativo', nota: '' },
    { k: 'lineas',      label: 'Líneas modulares',       valor: '+80',        fuente: 'Registro corporativo', nota: 'El sitio actual publica "+30"; el dossier comercial, "+80 / 82". Se usa +80.' },
    { k: 'camas',       label: 'Camas bajas y ramplas',  valor: '30 a 126 t', fuente: 'Registro corporativo', nota: '' },
    { k: 'emergencias', label: 'Emergencias',            valor: '24/7',       fuente: 'Registro corporativo', nota: '' }
  ],

  /* ---------- Flota de grúas (nomenclatura exacta) ----------
   * cap  = capacidad nominal máxima (t)
   * pluma= longitud máxima de pluma principal (m); null = dato pendiente de carga
   */
  flota: [
    { id: 'xca750sa',  marca: 'XCMG',      modelo: 'XCA750SA',      cap: 750, pluma: 90,   tipo: 'Grúa todo terreno', config: 'SuperLift, Wind Power Jib, Luffing Jib y jib fijo' },
    { id: 'xca600',    marca: 'XCMG',      modelo: 'XCA600',        cap: 600, pluma: 90,   tipo: 'Grúa todo terreno', config: 'Pluma de 17 a 90 m (7 secciones). SuperLift, Wind Power Jib y Luffing Jib. Contrapeso combinado hasta 180 t' },
    { id: 'xca500sa',  marca: 'XCMG',      modelo: 'XCA500SA',      cap: 500, pluma: 85,   tipo: 'Grúa todo terreno', config: 'Pluma de 85 m, ampliable a 150 m con torre y plumines' },
    { id: 'xca500br',  marca: 'XCMG',      modelo: 'XCA500BR',      cap: 500, pluma: 90,   tipo: 'Grúa todo terreno', config: 'SuperLift y jib fijo. Con jib offset de 40° alcanzó 75 m de radio operativo' },
    { id: 'gmk7450',   marca: 'Grove',     modelo: 'GMK7450',       cap: 450, pluma: 60,   tipo: 'Grúa todo terreno', config: '7 ejes, Twin-Lock, Megaform' },
    { id: 'gmk6300l',  marca: 'Grove',     modelo: 'GMK6300L',      cap: 300, pluma: 80,   tipo: 'Grúa todo terreno', config: '6 ejes, MEGATRAK, contrapeso de ~92,5 t con montaje hidráulico (existen dos unidades: GMK6300L y GMK6300L-1)' },
    { id: 'ltm1250',   marca: 'Liebherr',  modelo: 'LTM 1250-5.1',  cap: 250, pluma: null, tipo: 'Grúa todo terreno', config: 'Usada en operaciones de carga de componentes mineros' },
    { id: 'xca160',    marca: 'XCMG',      modelo: 'XCA160',        cap: 160, pluma: null, tipo: 'Grúa todo terreno', config: 'Apoyo en operaciones combinadas' },
    { id: 'xct100',    marca: 'XCMG',      modelo: 'XCT100 (híbrida)', cap: 100, pluma: null, tipo: 'Grúa híbrida',  config: 'Incorporada a la flota en 2025' }
  ],

  /* ---------- Contacto verificado ---------- */
  contacto: {
    telefono: '+56 9 9774 1505',
    whatsapp: '+56 9 7485 3606',
    email: 'contacto@transmat.cl',
    direccion: 'Héctor Gómez Cobo 630, La Negra, Antofagasta'
  },

  /* ---------- Grafo: nodos y relaciones ---------- */
  grafo: {
    nodos: [
      /* Industrias */
      { id: 'i-mineria',  tipo: 'industria', label: 'Minería' },
      { id: 'i-energia',  tipo: 'industria', label: 'Energía' },
      { id: 'i-constr',   tipo: 'industria', label: 'Construcción y montaje' },
      { id: 'i-ferro',    tipo: 'industria', label: 'Ferroviaria' },

      /* Proyectos (casos ya publicados o aprobados) */
      { id: 'p-930e',     tipo: 'proyecto', label: 'Carga y traslado de chasis Komatsu 930E', sub: 'La Negra, Antofagasta' },
      { id: 'p-tandem',   tipo: 'proyecto', label: 'Izaje tándem de tolva',                   sub: 'La Negra, Antofagasta' },
      { id: 'p-caex',     tipo: 'proyecto', label: 'Traslado de dos camiones CAEX Hitachi',   sub: 'Destino: Minera Mantoverde' },
      { id: 'p-trafos',   tipo: 'proyecto', label: 'Traslado de transformadores de 218 t',    sub: 'AES Andes' },
      { id: 'p-mall',     tipo: 'proyecto', label: 'Montaje de módulos AC, techumbre',        sub: 'Mall Plaza Antofagasta' },
      { id: 'p-efe',      tipo: 'proyecto', label: 'Traslado de locomotora de 120 t',         sub: 'Puerto Angamos → Estación Central (EFE)' },

      /* Equipos */
      { id: 'e-ltm',      tipo: 'equipo', label: 'Liebherr LTM 1250-5.1', sub: '250 t' },
      { id: 'e-160',      tipo: 'equipo', label: 'XCMG XCA160',           sub: '160 t' },
      { id: 'e-500br',    tipo: 'equipo', label: 'XCMG XCA500BR',         sub: '500 t' },
      { id: 'e-6300',     tipo: 'equipo', label: 'Grove GMK6300L',        sub: '300 t' },
      { id: 'e-lm',       tipo: 'equipo', label: 'Líneas modulares',      sub: '+80 unidades' },
      { id: 'e-actros',   tipo: 'equipo', label: 'Mercedes-Benz Actros 3363', sub: 'Tractocamión' },
      { id: 'e-fh',       tipo: 'equipo', label: 'Volvo FH540',           sub: 'Tractocamión' }
    ],
    enlaces: [
      ['i-mineria', 'p-930e'], ['i-mineria', 'p-tandem'], ['i-mineria', 'p-caex'],
      ['i-energia', 'p-trafos'], ['i-constr', 'p-mall'], ['i-ferro', 'p-efe'],

      ['p-930e', 'e-ltm'], ['p-930e', 'e-160'], ['p-930e', 'e-lm'], ['p-930e', 'e-fh'],
      ['p-tandem', 'e-6300'],
      ['p-mall', 'e-500br'],
      ['p-efe', 'e-lm'], ['p-efe', 'e-actros']
    ],
    /* Atributos para el marcado estructurado de ejemplo */
    atributos: {
      'e-ltm':    { cap: 250, mfr: 'Liebherr' },
      'e-160':    { cap: 160, mfr: 'XCMG' },
      'e-500br':  { cap: 500, pluma: 90, mfr: 'XCMG' },
      'e-6300':   { cap: 300, pluma: 80, mfr: 'Grove' },
      'p-930e':   { lugar: 'La Negra, Antofagasta' },
      'p-tandem': { lugar: 'La Negra, Antofagasta' },
      'p-mall':   { lugar: 'Antofagasta' },
      'p-efe':    { lugar: 'Puerto Angamos → Estación Central' }
    }
  },

  /* ---------- Entrada por industria (mega-menú) ---------- */
  industrias: [
    {
      id: 'mineria', nombre: 'Minería', img: 'transporte.webp',
      lead: 'Traslado de equipos de gran tonelaje, izajes en faena y apoyo en paradas de planta.',
      proyectos: ['Carga y traslado de chasis Komatsu 930E · La Negra', 'Izaje tándem de tolva · La Negra', 'Traslado de dos camiones CAEX Hitachi · Minera Mantoverde'],
      equipos: ['Liebherr LTM 1250-5.1', 'XCMG XCA160', 'Grove GMK6300L', 'Líneas modulares'],
      articulos: ['Empleo en la minería chilena: estructura laboral y desafíos hacia 2034', 'Inversión 2026 para la Minería y Energía en Chile'],
      brecha: false
    },
    {
      id: 'energia', nombre: 'Energía', img: 'energia.webp',
      lead: 'Montaje y transporte para proyectos solares, eólicos, geotérmicos y de transmisión.',
      proyectos: ['Traslado de transformadores de 218 t · AES Andes'],
      equipos: ['XCMG XCA750SA y XCA600 con Wind Power Jib', 'Líneas modulares'],
      articulos: ['Antofagasta: centro de la generación eléctrica en Chile', 'Geotermia en Chile: potencial, costos de perforación y perspectivas'],
      brecha: false
    },
    {
      id: 'construccion', nombre: 'Construcción y montaje', img: 'montaje.webp',
      lead: 'Izaje y montaje de estructuras, módulos y equipos con ingeniería de maniobra.',
      proyectos: ['Montaje de módulos AC, techumbre · Mall Plaza Antofagasta'],
      equipos: ['XCMG XCA500BR (jib offset 40°, 75 m de radio operativo)'],
      articulos: [],
      brecha: true
    },
    {
      id: 'ferroviaria', nombre: 'Ferroviaria', img: 'transporte.webp',
      lead: 'Traslado de material rodante y carga de proyecto por rutas especiales.',
      proyectos: ['Traslado de locomotora de 120 t · Puerto Angamos → Estación Central (EFE)'],
      equipos: ['12 líneas modulares', '2 tractocamiones Mercedes-Benz Actros 3363'],
      articulos: [],
      brecha: true
    },
    {
      id: 'portuaria', nombre: 'Portuaria', img: 'portuaria.webp',
      lead: 'Carga de proyecto y logística desde puertos de la zona norte.',
      proyectos: ['Traslado de locomotora de 120 t · parte desde Puerto Angamos'],
      equipos: ['Líneas modulares', 'Tractocamiones Mercedes-Benz Actros 3363'],
      articulos: [],
      brecha: true
    },
    {
      id: 'desalinizacion', nombre: 'Desalinización', img: 'portuaria.webp',
      lead: 'Izaje y transporte de componentes para plantas desalinizadoras y su infraestructura.',
      proyectos: [],
      equipos: [],
      articulos: ['Proyectos de desalinización: del agua continental al océano'],
      brecha: true
    }
  ],

  /* ---------- Planificador ---------- */
  planificador: {
    industrias: ['Minería', 'Energía', 'Construcción y montaje', 'Ferroviaria', 'Portuaria', 'Industria y montajes industriales', 'Otra'],
    zonas: ['Antofagasta', 'Calama', 'Otra comuna del norte de Chile', 'Otra región']
  },

  /* ---------- Asistente técnico: respuestas sobre datos verificados ---------- */
  asistente: {
    sugerencias: [
      '¿Qué grúa tienen de 500 toneladas?',
      '¿Cuánto cuesta arrendar una grúa?',
      '¿Cómo trasladan una carga de 120 toneladas?',
      '¿Tienen servicio de emergencia?'
    ]
  },

  /* ---------- Contrato de eventos ---------- */
  eventos: [
    { ev: 'rfq_start',          cuando: 'Se inicia el planificador',                       params: 'origen, pagina',                                   clave: false, destino: 'GA4' },
    { ev: 'rfq_step',           cuando: 'Se completa un paso',                             params: 'paso, tipo_operacion',                             clave: false, destino: 'GA4' },
    { ev: 'rfq_result_shown',   cuando: 'Se muestran equipos candidatos',                  params: 'peso_t, equipos_candidatos',                       clave: false, destino: 'GA4' },
    { ev: 'rfq_submit',         cuando: 'Se envía la solicitud con consentimiento',        params: 'tipo_operacion, peso_t, industria, zona, consentimiento', clave: true,  destino: 'GA4 · Ads · CRM' },
    { ev: 'whatsapp_click',     cuando: 'Clic al WhatsApp comercial',                      params: 'ubicacion_cta, pagina',                            clave: true,  destino: 'GA4 · Ads' },
    { ev: 'phone_click',        cuando: 'Clic al teléfono',                                params: 'ubicacion_cta, pagina',                            clave: true,  destino: 'GA4 · Ads' },
    { ev: 'emergency_route',    cuando: 'Se declara una emergencia en el planificador',    params: 'origen',                                           clave: true,  destino: 'GA4 · Ads' },
    { ev: 'video_cta_click',    cuando: 'Clic al CTA que sigue al video',                  params: 'video_id, progreso',                               clave: false, destino: 'GA4' },
    { ev: 'ficha_equipo_view',  cuando: 'Se abre la ficha de un equipo',                   params: 'modelo, capacidad_t',                              clave: false, destino: 'GA4' },
    { ev: 'industria_view',     cuando: 'Se abre una página de industria',                 params: 'industria',                                        clave: false, destino: 'GA4' },
    { ev: 'asistente_pregunta', cuando: 'Se hace una consulta al asistente',               params: 'intencion',                                        clave: false, destino: 'GA4' },
    { ev: 'asistente_handoff',  cuando: 'El asistente deriva a una persona',               params: 'canal, intencion',                                 clave: true,  destino: 'GA4 · CRM' }
  ],

  /* ---------- Radar tecnológico ---------- */
  radar: [
    { t: 'Plataforma propia: frontend moderno en el borde + CMS headless', estado: 'Producción', decision: 'Adoptar', por: 'WordPress deja de ser la plataforma. El equipo editorial trabaja en un CMS headless con vista previa en vivo; el frontend se sirve desde el borde.' },
    { t: 'Sistema de diseño propio (tokens, componentes, motion)',        estado: 'Producción', decision: 'Adoptar', por: 'Coherencia visual y velocidad de construcción. Es lo que hace que el sitio se vea y se sienta de una sola pieza.' },
    { t: 'Registro maestro con marcado estructurado (JSON-LD)',         estado: 'Producción', decision: 'Adoptar',  por: 'Una cifra, una fuente. Alimenta buscadores, fichas y el asistente. Corrige las contradicciones del sitio actual.' },
    { t: 'Presupuesto de rendimiento (Core Web Vitals)',                estado: 'Producción', decision: 'Adoptar',  por: 'Umbral "bueno" de Google: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1. Internamente se exige LCP ≤ 2,0 s.' },
    { t: 'Medición con contrato de eventos y etiquetado del lado servidor', estado: 'Producción', decision: 'Adoptar', por: 'Cada CTA mide una acción real. La conversión deja de ser una carga de página.' },
    { t: 'Consentimiento explícito, no premarcado',                     estado: 'Producción', decision: 'Adoptar',  por: 'Buena práctica independiente de la fecha final de vigencia de la Ley 21.719.' },
    { t: 'PWA con fichas de flota sin conexión',                        estado: 'Producción', decision: 'Adoptar',  por: 'La conectividad en faena es irregular; la ficha técnica debe abrir sin señal.' },
    { t: 'Video propio con streaming adaptativo y respaldo',            estado: 'Producción', decision: 'Adoptar',  por: 'Es el activo con más interacción del sitio. Las redes corporativas pueden restringir plataformas externas.' },
    { t: 'Accesibilidad WCAG 2.2 AA',                                   estado: 'Producción', decision: 'Adoptar',  por: 'Contraste, foco visible, navegación por teclado y movimiento reducible.' },
    { t: 'Casos como secuencia de maniobra: animación por scroll y transiciones de vista', estado: 'Parcial', decision: 'Adoptar', por: 'Cada proyecto se cuenta paso a paso. Chrome y Safari lo soportan; Firefox no es uniforme: mejora progresiva con un estado final estático como base.' },
    { t: 'Modo faena: alto contraste, sin señal, uso con guantes',        estado: 'Producción', decision: 'Adoptar', por: 'Para quien consulta una ficha a pleno sol y sin cobertura. Es una diferenciación real en terreno, no un efecto.' },
    { t: 'Asistente técnico con recuperación sobre el registro (RAG)',  estado: 'Producción', decision: 'Piloto',   por: 'Solo responde desde datos verificados, cita su fuente y deriva a una persona. Nunca cotiza.' },
    { t: 'Conversiones offline: CRM → Google Ads',                      estado: 'Producción', decision: 'Piloto',   por: 'Requiere CRM operativo y responsable comercial. Optimiza la puja hacia oportunidades reales.' },
    { t: 'Gemelo de flota: visor 3D (glTF) con configuraciones reales', estado: 'Producción', decision: 'Piloto',   por: 'Piloto en Fase 2 con un modelo; producción en Fase 3. Carga bajo demanda; modelos del fabricante o modelados desde la ficha técnica.' },
    { t: 'Portal de cliente con lectura de proyectos del CGO',          estado: 'A construir', decision: 'Piloto',  por: 'Depende de exponer una API de lectura desde el CGO. Es el diferencial más difícil de copiar.' },
    { t: 'Transmat en vivo: operaciones agregadas del CGO en el sitio', estado: 'A construir', decision: 'Piloto',  por: 'Solo datos agregados (operaciones en curso, toneladas en movimiento), sin faenas ni clientes. Depende de la misma API del CGO (D3).' },
    { t: 'WebMCP: herramientas del sitio para agentes del navegador',   estado: 'Experimental', decision: 'Observar', por: 'Prueba de origen en Chrome 149 a 156; borrador de grupo comunitario W3C. Sin soporte público en Firefox ni Safari.' },
    { t: 'llms.txt',                                                    estado: 'Débil',      decision: 'Observar', por: 'Costo mínimo, pero la evidencia de impacto en citas de IA es débil. Pesa más el contenido denso en datos citables.' },
    { t: 'Recorridos 3D inmersivos o realidad virtual',                 estado: 'Disponible', decision: 'Descartar', por: 'Sin retorno comprobable en compra B2B industrial y con costo de carga alto en móvil.' },
    { t: 'Chatbot que cotiza o promete plazos',                         estado: 'Disponible', decision: 'Descartar', por: 'Contradice las reglas de marca: no se prometen precios, plazos ni disponibilidad.' },
    { t: 'Efectos de cursor, parallax pesado y carruseles automáticos', estado: 'Disponible', decision: 'Descartar', por: 'Cuestan rendimiento y accesibilidad sin aportar a la decisión técnica del visitante.' }
  ],

  /* ---------- Hoja de ruta ---------- */
  ruta: [
    { fase: 'Fase 0', nombre: 'Puente', periodo: 'Oct – Dic 2026', items: ['Eventos y conversión corregidos', 'Formulario calificador en las 4 páginas de servicio', 'Consentimiento y página de gracias', 'Ficha única de cifras', 'Redirecciones 301'], hito: 'El sitio actual mide solicitudes reales.' },
    { fase: 'Fase 1', nombre: 'Fundaciones', periodo: 'Q4 2026 – Q1 2027', items: ['Registro maestro y modelo de datos', 'Sistema de diseño y prototipo navegable', 'Stack y entorno de la plataforma propia', 'CRM operativo con responsable y plazo de respuesta', 'Arquitectura por industria'], hito: 'Datos, diseño y stack aprobados.' },
    { fase: 'Fase 2', nombre: 'Núcleo 5.0', periodo: 'Q1 – Q2 2027', items: ['Home, industrias, flota y casos como secuencia', 'Planificador de operación', 'Artículos migrados sin perder posiciones', 'Modo faena y fichas sin conexión', 'Piloto del gemelo de flota (un modelo 3D)', 'Lanzamiento incremental'], hito: 'Sitio nuevo en producción.' },
    { fase: 'Fase 3', nombre: 'Plataforma', periodo: 'H2 2027', items: ['Portal de cliente con lectura del CGO', 'Transmat en vivo (datos agregados)', 'Gemelo de flota completo', 'Asistente técnico en piloto', 'Versión en inglés', 'Conversiones offline hacia Ads'], hito: 'El cliente ve su proyecto en línea.' },
    { fase: 'Fase 4', nombre: 'Escala', periodo: '2028 – 2030', items: ['Experimentación continua con regla de decisión', 'Nuevos verticales (hidrógeno verde, litio, desalinización)', 'Revisión anual del radar tecnológico', 'Agentes externos si el estándar madura'], hito: 'Pipeline originado en digital, medido.' }
  ],

  /* ---------- Límites (guardarraíles B2B) ---------- */
  limites: [
    { t: 'Sorprender sin pagar con rendimiento', d: 'Cada efecto entra al presupuesto de peso y de LCP. Si lo rompe, no entra, por espectacular que sea.' },
    { t: 'Nada que dependa de buena señal', d: 'Las fichas técnicas abren sin conexión. El 3D es opcional y se carga bajo demanda.' },
    { t: 'La IA informa, no cotiza', d: 'No entrega precios, plazos ni disponibilidad. Cita su fuente y deriva a una persona.' },
    { t: 'Sin afirmaciones no verificables', d: 'Nada de "los mejores" ni "los únicos", salvo un dato entregado y firmado por el cliente.' },
    { t: 'Sin dependencias frágiles', d: 'Video propio con respaldo. Sin scripts de terceros que una red corporativa pueda bloquear.' },
    { t: 'Sin clientes nuevos sin aprobación', d: 'Solo se nombran faenas y clientes ya aprobados. Lo demás se publica con el nombre autorizado.' },
    { t: 'Consentimiento real', d: 'Casillas sin premarcar, finalidad declarada, sin datos personales en la capa de datos.' },
    { t: 'Tono de informe de ingeniería', d: 'Primera persona plural, dato exacto, cero épica. El sitio suena a Transmat.' }
  ],

  /* ---------- Decisiones y dependencias ---------- */
  decisiones: [
    { q: 'Aprobar la plataforma propia (opción C)', d: 'WordPress deja de ser requisito. La opción C define el techo de la experiencia y el presupuesto de construcción; el stack se confirma en Fase 1.', quien: 'Transmat + A1' },
    { q: 'Tablas de carga oficiales de los fabricantes', d: 'XCMG, Grove y Liebherr. Sin ellas el planificador filtra por capacidad nominal y no por radio.', quien: 'Transmat' },
    { q: 'Acceso de lectura al CGO', d: 'Una API de solo lectura habilita el portal de cliente. Hay que validarlo con quien mantiene el CGO.', quien: 'Transmat' },
    { q: 'CRM y responsable comercial con plazo de respuesta', d: 'Sin alguien que responda en un plazo declarado, un mejor formulario no cambia el resultado.', quien: 'Transmat' },
    { q: 'Validar la ficha única de cifras', d: 'Fecha y responsable por cada cifra. Elimina las contradicciones entre sitio, dossier y parrilla.', quien: 'Transmat' },
    { q: 'Fotografía y video propios de faena', d: 'Reemplazar el stock genérico. El video del sitio es el activo con más interacción.', quien: 'Transmat + A1' },
    { q: 'Alcance del idioma inglés', d: 'Hay contratistas y fabricantes internacionales en la cadena. Define estructura de URL y hreflang.', quien: 'Transmat' },
    { q: 'Estado de la Ley 21.719', d: 'Figura vigente desde el 1-dic-2026, con un proyecto en el Senado para postergarla a 2027. Confirmar con asesoría legal.', quien: 'Transmat + asesoría legal' }
  ]
};
