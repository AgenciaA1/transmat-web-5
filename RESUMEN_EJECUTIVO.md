# Propuesta Web Transmat 5.0 (2026–2030) — Resumen ejecutivo

**Cliente:** Transmat Chile · **Agencia:** A1 / Auno (web@auno.cl)
**Fecha:** 14 de octubre de 2026 · **Publicada:** 26 de octubre de 2026 · **Estado:** enfoque aprobado por A1 el 30-oct-2026; en curso la fase 1 (arquitectura, mapa de sitio y contenido: `docs/01_ARQUITECTURA_MAPA_DE_SITIO_Y_CONTENIDO.md`) sobre el sistema web de A1 (Next.js, referencia agea.cl)
**Demo interactiva:** <https://transmat-web-5.web-6f2.workers.dev> (pública, Cloudflare de la agencia) · **Código:** <https://github.com/AgenciaA1/transmat-web-5> (repo público) · copia privada en claude.ai: <https://claude.ai/artifact/6XSQaGcurua2GUbraXcvxj> · ver §14

---

## 1. La idea en una frase

**Transmat 5.0 es una plataforma, no una vitrina.** Un sitio que planifica una operación en cuatro pasos, muestra la flota a escala real, abre el proyecto del cliente en línea y mide cada solicitud — construido con la mejor tecnología disponible y con un límite claro: todo lo que sorprende también ayuda a decidir.

Lo llamamos **Centro de Mando**: el sitio aplica al visitante el mismo criterio de ingeniería con que Transmat opera (radio operativo, configuración, trazabilidad).

## 2. Punto de partida (Auditoría 360 A+, agosto 2026)

| Dato | Valor | Lectura |
|---|---|---|
| Sesiones en doce meses | 124.953 | El sitio tiene audiencia |
| Interacción del tráfico orgánico vs. promedio | 3,25× (39 s vs. 12 s) | El contenido con datos funciona |
| Usuarios que inician el video vs. el formulario | 15 % vs. 0,6 % | Atención sin ruta comercial |
| Abandono del único formulario | 86,4 % (44 inicios, 6 envíos / 28 días) | El sitio no recibe solicitudes |
| Páginas de servicio con formulario | 0 de 4 | La intención no tiene dónde caer |
| Contradicciones de cifra activas | 2 ("10/+15 años", "+30/+80 líneas") | Resta credibilidad al comprador técnico |

**Se protege:** el video (activo con más interacción), el contenido con datos y el CGO como argumento de venta.
**Se corrige:** navegación por producto (no por industria), falta de formularios calificadores, cifras inconsistentes, conversión medida como carga de página.

## 3. Concepto y principios

1. **Cada pantalla resuelve una decisión técnica.** Entrada por industria o necesidad, no por organigrama.
2. **El dato manda.** Cada cifra, modelo y proyecto sale de un registro único; si no está verificado, no se publica.
3. **Todo lo que se promete, se mide.** Cada acción tiene un contrato de evento; la conversión es una solicitud real.

Cinco capas: Experiencia · Datos · Inteligencia · Medición · Plataforma.

## 4. Ocho piezas de firma

| # | Pieza | Qué hace | Estado en la demo |
|---|---|---|---|
| 01 | Planificador de operación | 4 preguntas → equipos candidatos → solicitud calificada con consentimiento | Funcional |
| 02 | Flota a escala real | Geometría de pluma (radio/altura) hoy; gemelo 3D con configuraciones reales en Fase 3 | Funcional |
| 03 | Entrada por industria | Minería, Energía, Construcción, Ferroviaria, Portuaria, Desalinización; marca brechas de contenido | Funcional |
| 04 | Portal de proyecto | Etapas, GPS, checklist y estado de pago desde el CGO (solo lectura) | Simulación |
| 05 | Asistente técnico con límites | Responde desde el registro, cita fuente, deriva; no cotiza | Funcional |
| 06 | Casos como secuencia de maniobra | Cada proyecto se narra paso a paso al hacer scroll | Concepto |
| 07 | Modo faena | Alto contraste, fichas sin señal, controles para guantes | Concepto |
| 08 | Transmat en vivo | Operaciones y toneladas en movimiento, agregadas del CGO, sin nombrar faenas | Concepto (depende del CGO) |

## 5. Estructura de datos: una sola fuente de verdad

Registro maestro con relaciones explícitas: **equipos · proyectos · industrias · servicios · normativa · cifras**. Siete salidas: sitio, JSON-LD, fichas HTML/PDF, asistente, parrilla de contenidos, reportes, API de lectura.
Ejemplo verificable en la demo: el grafo (industria → proyecto → equipo) y la tabla de cifras se dibujan desde el mismo archivo `js/data.js`; ninguna cifra está escrita dos veces.

## 6. Inteligencia aplicada, con límites escritos

- Solo responde desde el registro; cita la fuente; **no entrega precios, plazos ni disponibilidad**.
- Deriva con contexto (WhatsApp/correo llegan con la consulta resumida).
- No guarda datos personales en la capa de datos; las consultas sin respuesta se convierten en brechas de contenido.
- Agentes externos: marcado estructurado y fichas densas en datos hoy; `llms.txt` y WebMCP en observación (evidencia débil / estándar experimental).

## 7. Medición

- Contrato de eventos: `rfq_start → rfq_step → rfq_result_shown → rfq_submit` (clave), `whatsapp_click`, `phone_click`, `emergency_route`, `asistente_handoff` (clave), `video_cta_click`, `ficha_equipo_view`, `industria_view`.
- Oportunidad calificada del CRM → conversión offline a Google Ads (la puja optimiza hacia negocio).
- Consentimiento denegado por defecto y con acción afirmativa, cubriendo Chile (hoy solo cubre el EEE).
- Línea base (ago-2026): 6 solicitudes/28 días · 86,4 % abandono · 0/4 páginas de servicio con formulario · Core Web Vitals no medidos. Metas numéricas se fijan tras un trimestre de datos limpios.

## 8. Plataforma: propia, construida para durar hasta 2030

**WordPress deja de ser requisito.** Recomendación: **Opción C — plataforma propia** (CMS headless + registro maestro + frontend moderno en el borde). Es la única que llega al nivel pedido (mejor interacción y UI/UX de la categoría) y deja los datos fuera del CMS. El sitio actual queda solo como fuente de migración.

| Criterio | A · Evolutivo | B · Híbrido | **C · Propia** |
|---|---|---|---|
| Nivel de UI e interacción | 2 | 4 | **5** |
| Techo de experiencia | 2 | 3 | **5** |
| Datos reutilizables | 1 | 4 | **5** |
| Protección del posicionamiento | 5 | 4 | **4** |
| Autonomía editorial | 5 | 4 | **4** |
| Tiempo al primer valor | 4 | 3 | **2** |
| Costo y mantención | 4 | 3 | **2** |

**Stack de referencia (se confirma en Fase 1):** frontend con renderizado híbrido y TypeScript (Next.js o Astro), sistema de diseño propio, animación nativa por scroll y transiciones de vista, 3D bajo demanda (three.js), PWA con modo faena · CMS headless con vista previa (Sanity o Payload) · registro maestro en base de datos propia con API y JSON-LD · video propio con streaming adaptativo · asistente con recuperación sobre el registro (Claude) · etiquetado del lado servidor, GA4, conversiones offline, CWV en usuarios reales.

**Migración sin perder posiciones:** inventario y mapa 301 → artículos conservan URL y contenido → salen primero las piezas nuevas → migración por secciones con paridad medida → corte final reversible. Nada se despliega sin autorización expresa de Transmat.

**Presupuesto de calidad:** LCP ≤ 2,0 s en móvil (umbral Google 2,5 s) · INP ≤ 200 ms · CLS ≤ 0,1 · WCAG 2.2 AA · fichas sin conexión · CSP estricta.

## 9. Radar tecnológico (octubre 2026)

- **Adoptar:** plataforma propia en el borde + CMS headless; sistema de diseño; registro con JSON-LD; presupuesto de rendimiento; medición con contrato de eventos; consentimiento explícito; PWA/modo faena; video propio; WCAG 2.2 AA; casos por scroll y transiciones de vista (mejora progresiva).
- **Piloto:** asistente RAG; conversiones offline CRM→Ads; gemelo de flota 3D; portal de cliente (CGO); Transmat en vivo (CGO).
- **Observar:** WebMCP (prueba de origen en Chrome, borrador W3C); `llms.txt` (evidencia débil).
- **Descartar:** recorridos VR/3D inmersivos; chatbot que cotiza; efectos de cursor, parallax pesado y carruseles automáticos.

## 10. Hoja de ruta

| Fase | Período | Foco | Hito de salida |
|---|---|---|---|
| 0 · Puente | Oct–Dic 2026 | Corregir medición y formularios del sitio actual; ficha única de cifras; 301 | El sitio actual mide solicitudes reales |
| 1 · Fundaciones | Q4 2026–Q1 2027 | Registro maestro, sistema de diseño y prototipo, stack, CRM operativo, arquitectura por industria | Datos, diseño y stack aprobados |
| 2 · Núcleo 5.0 | Q1–Q2 2027 | Home, industrias, flota, casos, planificador, migración de artículos, modo faena, piloto 3D | Sitio nuevo en producción |
| 3 · Plataforma | H2 2027 | Portal de cliente, Transmat en vivo, gemelo completo, asistente, inglés, conversiones offline | El cliente ve su proyecto en línea |
| 4 · Escala | 2028–2030 | Experimentación con regla de decisión, nuevos verticales, revisión anual del radar | Pipeline digital medido |

## 11. Límites (lo que decidimos no hacer)

Sorprender sin pagar con rendimiento · nada que dependa de buena señal · la IA informa, no cotiza · sin afirmaciones no verificables · sin dependencias frágiles · sin clientes nuevos sin aprobación · consentimiento real · tono de informe de ingeniería.

## 12. Decisiones y dependencias para pasar a Fase 1

| # | Decisión | Quién |
|---|---|---|
| D1 | Aprobar la plataforma propia (opción C) y su presupuesto; stack en Fase 1 | Transmat + A1 |
| D2 | Tablas de carga oficiales (XCMG, Grove, Liebherr) para que el planificador filtre por radio, no solo por capacidad nominal | Transmat |
| D3 | API de solo lectura del CGO (habilita portal de cliente y Transmat en vivo) | Transmat |
| D4 | CRM y responsable comercial con plazo de respuesta declarado | Transmat |
| D5 | Ficha única de cifras validada, con fecha y responsable | Transmat |
| D6 | Fotografía y video propios de faena (reemplazar stock) | Transmat + A1 |
| D7 | Alcance del inglés (URL, hreflang) | Transmat |
| D8 | Estado de la Ley 21.719 (vigencia 1-dic-2026 con proyecto de postergación a 2027 en el Senado) | Transmat + asesoría legal |

## 13. Qué es real y qué es ilustrativo en la demo

- **Real:** cifras corporativas, modelos de flota con sus capacidades y plumas, proyectos publicados/aprobados, datos de contacto, hallazgos de auditoría.
- **Ilustrativo:** resultados del planificador (capacidad nominal, no tabla de carga), respuestas del asistente (predefinidas), portal de proyecto (simulado), fotografías de stock.
- **Pendiente de dato:** longitud de pluma de LTM 1250-5.1, XCA160 y XCT100 (marcadas como "dato pendiente").

## 14. Cómo presentar (12 minutos)

1. Abrir la demo publicada: <https://transmat-web-5.web-6f2.workers.dev> (pública, no requiere cuenta). Sin internet: desde la raíz del repositorio, `python3 -m http.server 8765` y entrar a `http://localhost:8765/`; no abrir `index.html` como archivo suelto.
2. Hero (1 min): la frase, el radar de 150 m, los cinco datos duros.
3. Partida (2 min): 124.953 sesiones, 15 % vs 0,6 %, 86,4 %. "El sitio recibe atención, no solicitudes."
4. Planificador en vivo (3 min): izaje y transporte, 120 t, Minería, Antofagasta → equipos candidatos → formulario con consentimiento → abrir el **registro de eventos** (esquina inferior izquierda) y mostrar `rfq_submit`.
5. Flota y grafo (2 min): mover el ángulo; seleccionar un nodo y mostrar el JSON-LD. "Una cifra, una fuente."
6. Asistente (1 min): preguntar "¿cuánto cuesta arrendar una grúa?" → no cotiza, deriva con contexto.
7. Plataforma y ruta (2 min): opción C, Fase 0 empieza ahora sobre el sitio actual.
8. Cerrar con las 8 decisiones (1 min).

## Fuentes

Auditoría Estratégica 360 A+ Transmat (ago-2026, v2.1) · `CONTEXTO_TRANSMAT_AGENTE_COPY.md` (ago-2026) · `DESARROLLO_PROTOTIPO_2027.md` · Chrome Developers, WebMCP (jun-2026) · PPC Land / Ahrefs sobre `llms.txt` (2026) · Usercentrics y Diario Constitucional sobre Ley 21.719 (2026).
