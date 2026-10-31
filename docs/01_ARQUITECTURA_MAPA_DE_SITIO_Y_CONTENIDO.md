# Transmat 5.0 — Arquitectura, mapa de sitio y estructura de contenido

**Cliente:** Transmat Chile · **Agencia:** A1 / Auno · **Versión:** 1.0 · **Fecha:** 30 de octubre de 2026
**Estado:** para revisión de Felipe y luego del cliente · **Fase:** 1 de 3 (arquitectura → tres variantes de Home → sitio completo)
**Sistema base:** el estándar web de A1 (Next.js + TypeScript + Tailwind, contenido como código, OpenNext en Cloudflare Workers), referencia agea.cl · detalle técnico en [`00_SISTEMA_BASE_AGEA.md`](00_SISTEMA_BASE_AGEA.md)
**Fuentes:** inventario exacto de transmat.cl del 30-oct-2026 ([`inventario/`](inventario/INVENTARIO_CONTENIDO_ACTUAL.md), [`textos`](inventario/TEXTOS_PAGINAS_CLAVE.md)), `CONTEXTO_TRANSMAT_AGENTE_COPY.md` (ago-2026), Auditoría 360 A+ (ago-2026), propuesta Transmat 5.0 (oct-2026)

---

## 0. Qué decide este documento y qué no

**Decide:** la arquitectura de información (qué secciones existen y cómo se relacionan), el mapa de sitio con URLs, la navegación, el modelo de contenido (entidades y campos), el plan de contenido (qué se conserva, qué se reformula, qué se crea), las redirecciones desde el sitio actual, la base de medición/SEO/legal y la trazabilidad de cada recomendación aplicada.

**No decide:** el look (diagramación, estilo visual, tipografía, colores, movimiento). Eso se resuelve en la fase 2 con **tres variantes de Home** sobre esta misma arquitectura; aprobado el look, se desarrolla el sitio completo.

**Regla de contenido:** el sitio nuevo contiene todo el contenido del sitio actual, reformulado y optimizado. Lo que no existe hoy se marca como **recomendación** (R-nn) y se trabaja con el cliente. Ninguna cifra, modelo ni cliente se inventa.

---

## 1. Sistema base (resumen)

| Capa | Decisión | Por qué |
|---|---|---|
| Framework | **Next.js 16** (React 19) con App Router, **TypeScript** | Es el sistema de A1 desde 2026; el mismo de agea.cl |
| Estilos y movimiento | **Tailwind CSS v4** con tokens propios; motion CSS primero, con Lenis y Motion donde aporte (agea-web tiene GSAP instalado sin uso); `prefers-reduced-motion` respetado | Igual que agea-web; el look se define en la fase 2 |
| Contenido | **Como código**: entidades en `data/*.ts` (flota, industrias, servicios, cifras, proyectos cortos), textos largos en **MDX** (`content/articulos`, `content/proyectos`) | Sin CMS ni base de datos; una cifra, una fuente; versionado en Git |
| Formularios | react-hook-form + zod → ruta `app/api` → correo transaccional + CRM; página `/gracias` | Patrón de agea-web; permite el planificador calificador |
| SEO | `metadata` por ruta, `sitemap.ts`, `robots.ts`, JSON-LD por entidad, `llms.txt` | Control total, sin plugins |
| Publicación | **OpenNext sobre Cloudflare Workers**, cuenta Cloudflare de la agencia (igual que agea.cl y que la demo de esta propuesta) | Borde global, costo mínimo, sin servidor que mantener |
| Código | GitHub `AgenciaA1`; repo nuevo **`transmat-web`** para el sitio (este repo, `transmat-web-5`, queda para propuesta y documentos, como `agea-propuestas` frente a `agea-web`) | Separar presentación de producto |
| Equipo | Felipe (dirección), Tomás Roetti (desarrollo), Claude Code (desarrollo y documentación) | Mismo flujo que AGEA |

**Autonomía editorial del cliente:** el contenido lo opera A1 (parrilla mensual + artículos), como hoy. Si Transmat pidiera editar solo, se agrega un CMS headless encima del mismo modelo de datos; no se vuelve a WordPress.

---

## 2. Lo que hay hoy (síntesis del inventario)

Inventario completo, exacto y reproducible: `tools/inventario_transmat_cl.py` → [`docs/inventario/`](inventario/). Resumen:

| Dimensión | Dato | Lectura |
|---|---|---|
| Páginas | 19 (13 reales, 6 de prueba/duplicadas: `mailing-cgo-2`, dos "tarjetas editables", `proyectos-45`, landing `traslado-caex`, listado de flota vacío) | Limpiar al migrar |
| Posts | 81: 60 artículos, 2 noticias, 19 proyectos | Se conservan todos |
| Flota | Tabla en `/equipamiento/`: **36 grúas** (1 sobre orugas, 26 todo terreno, 9 rough terrain), **13 semirremolques**, **6 tractocamiones**, **1 camión pluma**, **4 grúas horquilla**, con 54 fichas PDF. Los 4 tipos de contenido de flota de WordPress están vacíos (placeholders) | La flota real es ~60 equipos, no 9: el modelo de contenido debe escalar |
| Medios | 801 archivos (65 PDF); **701 imágenes sin texto alternativo** | Migración selectiva con alt y WebP |
| Taxonomía | 366 categorías/etiquetas para 81 posts; el sitemap declara **100 páginas de categoría + 320 de etiqueta + 3 de autor** | Contenido delgado indexable; consolidar en 5 temas |
| Servicios | 4 páginas de 109 a 296 palabras, sin formulario, CTA genérico "Contáctanos" (rental: "Ver equipamiento") | Reescribir con datos y planificador |
| Formularios | Contacto: nombre, ubicación, teléfono, e-mail, mensaje (sin consentimiento, sin origen). Trabaja con nosotros: nombre, teléfono, e-mail, área, CV | Rehacer como calificadores (auditoría H-008, H-011, H-013) |
| Medición | GTM `GTM-KVKGS78S` en todas las páginas (contenedor vacío según la auditoría) + Google tag por Site Kit | Una sola vía, eventos reales |
| Cifras contradictorias | "+15 años" (home) · "10 años impulsando a la industria" (home) · "fundación en 2005" (corporativo = 21 años) · "+30 grúas" (home) vs 36 en la tabla · "35 a 800 t" vs máximo listado 750 t (XCA750SA) · "+30 líneas modulares" (sitio) vs "+80" (dossier) | Ficha única de cifras validada por el cliente (D5) |

Navegación actual: Inicio · Arriendo de grúas · Emergencias · Ingeniería y montaje · Transporte de cargas especiales · Equipamiento (anclas por tipo) · Artículos/Noticias · Tecnología y vanguardia · Proyectos · CGO Transmat · Corporativo · Contáctanos · Trabaja con nosotros. Es navegación por producto y por estructura interna; no hay entrada por industria ni por necesidad (auditoría H-005).

---

## 3. Principios de arquitectura

1. **Dos puertas de entrada: por industria y por necesidad.** El visitante elige "Minería" o "necesito mover 120 t", no "Equipamiento". Cada página de industria se compone desde el registro (proyectos, equipos, artículos de esa industria).
2. **El dato manda.** Cada cifra, modelo y proyecto sale de una sola fuente (`data/*.ts`, MDX). Si no está verificado, no se publica.
3. **Toda ruta termina en una acción medible.** Servicios, industrias, equipos y proyectos llevan al **planificador** (solicitud calificada), a WhatsApp o al teléfono, y cada uno emite un evento.
4. **La flota es contenido de primera clase.** Una página por modelo, con especificaciones, ficha PDF, casos donde se usó y geometría de pluma (2D ahora, 3D después).
5. **Los casos son evidencia, no galería.** Cada proyecto se escribe como ficha técnica: qué se movió, cuántas toneladas, con qué equipos y configuración, dónde, cuándo.
6. **Límites B2B.** Sin efectos que cuesten rendimiento, sin IA que cotice, sin promesas de precio o plazo, sin clientes no aprobados, tono de informe de ingeniería.

---

## 4. Mapa de sitio propuesto

Español en el lanzamiento; inglés (`/en/`) en fase 3. Entre paréntesis, el origen: **(hoy)** existe y se conserva o reformula; **(R-nn)** es contenido nuevo recomendado.

```
/                                   Home
├── /industrias/                    Hub de industrias (R-01)
│   ├── /industrias/mineria/                         (R-01) gran y mediana minería, paradas de planta, CAEX, chancadores
│   ├── /industrias/energia/                         (R-01) solar, eólica, termosolar, transmisión, BESS, combustibles
│   ├── /industrias/construccion-y-montaje/          (R-01) obras civiles, montaje industrial, puentes, estructuras
│   ├── /industrias/puertos-y-logistica/             (R-01) carga de proyecto, Angamos, Mejillones, Antofagasta
│   ├── /industrias/ferroviaria/                     (R-01) material rodante, EFE
│   └── /industrias/agua-y-desalinizacion/           (R-01) plantas desaladoras, componentes, corredores hídricos
├── /servicios/                     Hub de servicios (R-02)
│   ├── /arriendo-de-gruas/                          (hoy) rental Transkrane: flota por tonelaje y configuración
│   ├── /transporte-de-cargas-especiales/            (hoy) Transtruck: líneas modulares, camas bajas, permisos, escolta
│   ├── /ingenieria-y-montaje/                       (hoy) estudios de carga, simulación, rigging, montaje
│   ├── /emergencias/                                (hoy) 24/7, rescate de equipos; landing de llamada directa
│   └── /servicios/logistica-de-proyectos-y-almacenamiento/  (R-03) gestión integral, bodegaje y cross-docking en La Negra (16.200 m²)
├── /flota/                         Catálogo (hoy /equipamiento/) con filtros por tipo y capacidad
│   ├── /flota/gruas-moviles/                        (hoy) AT, RT y crawler · 36 modelos
│   │   └── /flota/gruas-moviles/<marca-modelo>/     (R-04) ficha por modelo: specs, PDF, geometría, casos
│   ├── /flota/semirremolques/                       (hoy) camas bajas, ramplas, líneas modulares · 13 + líneas
│   ├── /flota/tractocamiones/                       (hoy) 6 modelos (+ Actros 3363 a validar)
│   ├── /flota/camiones-pluma/                       (hoy) 1 modelo
│   └── /flota/gruas-horquilla/                      (hoy) 4 modelos, 10 a 32 t
├── /proyectos/                     Casos con filtros por industria, servicio y equipo (hoy)
│   └── /proyectos/<slug>/                           (hoy) 19 casos; se amplían a ficha técnica (R-05) + caso CAEX Mantoverde (R-06)
├── /planificador/                  Planificador de operación / cotizador (R-07) — la pieza de firma
├── /cgo/                           CGO Transmat como promesa de trazabilidad (hoy /centro-de-gestion-operacional-transmat/)
│   └── /cgo/portal/                                 (R-08, fase 3) portal de cliente, solo lectura
├── /transmat/                      Quiénes somos (hoy /corporativo-…/): desde 2005, La Negra, sucursales, valores, equipo
│   ├── /transmat/tecnologia/                        (hoy /tecnologia-y-vanguardia/) GPS, control remoto, cámaras 360°, Moasure, dron
│   ├── /transmat/seguridad-y-certificaciones/       (R-09) SGI 2026, políticas PDF, ASME B30.5 / ISO 9927, Euro 6
│   ├── /transmat/sostenibilidad/                    (R-10) Euro 6, renovables, huella (hoy párrafo en corporativo)
│   └── /trabaja-con-nosotros/                       (hoy) formulario con CV + cultura y beneficios (R-11)
├── /articulos/                     Hub (hoy /articulos-noticias/) con 5 temas
│   ├── /articulos/<slug>/                           (hoy) 60 artículos, URLs intactas
│   └── /articulos/tema/<mineria|energia|logistica-y-transporte|equipos-y-tecnologia|transmat>/  (R-12) reemplaza 420 páginas de taxonomía
├── /noticias/                      (hoy /noticia/) 2 noticias; URLs nuevas con 301
├── /contacto/                      (hoy) datos, mapa, WhatsApp, teléfonos, formulario calificador corto
├── /gracias/                       (R-13) confirmación con evento de conversión y plazo de respuesta declarado
├── /privacidad/  /cookies/  /terminos/              (hoy privacidad; R-14 cookies y términos, Ley 21.719)
├── /sitemap.xml  /robots.txt  /llms.txt  /404       utilitarios
└── /en/ …                                           (fase 3) versión en inglés
```

**Se elimina o se saca del sitio:** `/mailing-cgo-2/` (pieza de correo), `/tarjeta-editable-html-transmat/` y `-v2/` (firmas de correo: se sirven desde una ruta interna no indexable o fuera del sitio), `/proyectos-45/` (duplicado), los 5 ítems vacíos de flota, las 100 categorías, 320 etiquetas y 3 páginas de autor.

---

## 5. Navegación

**Header (escritorio):** Industrias ▾ · Servicios ▾ · Flota ▾ · Proyectos · Transmat ▾ · Artículos · **Emergencias 24/7** (teléfono visible) · **[Planificar operación]**

- *Industrias ▾* (mega-menú, referencia Mortenson): las 6 industrias con un caso destacado cada una.
- *Servicios ▾*: 5 servicios con una línea de alcance cada uno.
- *Flota ▾*: 5 tipos con rango de capacidad ("Grúas móviles · 35 a 750 t") y enlace al catálogo con filtros.
- *Transmat ▾*: Quiénes somos · Tecnología · Seguridad y certificaciones · Sostenibilidad · CGO · Trabaja con nosotros.

**Móvil:** menú completo + barra fija inferior con **Llamar · WhatsApp · Planificar**.

**Footer:** Industrias · Servicios · Flota · Transmat · Contacto (dirección La Negra, Calama, teléfonos, WhatsApp, correo) · Legales · Redes (LinkedIn, Instagram, Facebook, YouTube) · firma "Transmat, expertos en cada movimiento."

---

## 6. Modelo de contenido

Dónde vive cada entidad y qué campos tiene. Los campos marcados ⚑ requieren dato del cliente.

| Entidad | Dónde | Campos principales | Relaciones | JSON-LD |
|---|---|---|---|---|
| **Industria** | `data/industrias.ts` | id, nombre, slug, lead, problemas típicos, servicios aplicables, equipos típicos, imagen ⚑, SEO | → Proyectos, Equipos, Artículos, Servicios | `Service` (areaServed Chile) |
| **Servicio** | `data/servicios.ts` | id, nombre, slug, marca (Transmat / Transkrane / Transtruck), alcance (bullets), proceso, normativa, FAQ, CTA | → Industrias, Equipos, Proyectos | `Service` |
| **CategoríaEquipo** | `data/flota.ts` | id (gruas-moviles, semirremolques, tractocamiones, camiones-pluma, gruas-horquilla), nombre, rango de capacidad, descripción | → Equipos | `ItemList` |
| **Equipo** | `data/flota.ts` (~60 ítems) | marca, modelo, slug, categoría, subtipo (AT/RT/crawler/cama baja/rampla/línea modular), capacidad nominal (t), pluma principal (m) ⚑, jib/configuraciones ⚑, contrapeso ⚑, ejes ⚑, ficha PDF (URL actual), tabla de carga ⚑ (D2), imagen ⚑, estado (operativo/rental), `destacado` | → Categoría, Proyectos | `Product` + `PropertyValue` |
| **Proyecto** | `content/proyectos/*.mdx` (19 + nuevos) | título, slug (actual), fecha, industria(s), servicio(s), equipos usados, carga (qué, toneladas), origen → destino / faena, configuración técnica (jib, radio, tándem), cliente ⚑ (solo aprobado), ubicación, cuerpo MDX, galería ⚑, video, `destacado` | → Industria, Servicio, Equipo | `CreativeWork` (contentLocation) |
| **Artículo** | `content/articulos/*.mdx` (60) | título, slug (actual, puede tener subcarpeta), fecha, tema (1 de 5), resumen, imagen, autor "Transmat", SEO (title, description actuales de Yoast), cuerpo MDX | → Industria opcional, Equipo opcional | `Article` |
| **Noticia** | `content/noticias/*.mdx` (2) | como Artículo + lugar/evento | — | `NewsArticle` |
| **Cifra corporativa** | `data/cifras.ts` | clave, valor, unidad, fuente, fecha de validación ⚑, responsable ⚑, nota | usadas por Home, Transmat, Servicios | `Organization` |
| **Sucursal** | `data/sucursales.ts` | nombre, dirección, comuna, mapa, teléfono, horario ⚑ | — | `LocalBusiness` |
| **Tecnología** | `data/tecnologias.ts` (6 hoy) | nombre, descripción, equipos donde aplica, imagen ⚑ | → Equipos | — |
| **Política / Certificación** | `data/politicas.ts` | nombre, PDF (4 actuales), vigencia ⚑, norma de referencia | — | — |
| **Cliente** | `data/clientes.ts` | nombre, logo ⚑, aprobación ⚑ (solo los ya publicados: Codelco DRT, ENAMI, Thiess, Techint, Altonorte, Cerro Dominador, AES Andes, EFE, Komatsu, Cimtec, Mall Plaza) | → Proyectos | — |
| **FAQ** | `data/faq.ts` | pregunta, respuesta, páginas donde aparece | → Servicio/Industria | `FAQPage` |
| **Evento de medición** | `lib/analytics.ts` | nombre, parámetros, destino, clave | — | — |

**Flota: punto de partida real.** La tabla de `/equipamiento/` ya entrega marca, modelo, tipo, capacidad y PDF de 60 equipos (36 grúas, 13 semirremolques, 6 tractocamiones, 1 camión pluma, 4 grúas horquilla). El contexto maestro agrega pluma y configuraciones de 9 grúas y los Actros 3363 y líneas modulares. Falta del cliente: lista vigente (qué sigue operativo), pluma y configuraciones del resto, tablas de carga (D2) y fotos propias.

**Proyectos: de 100 palabras a ficha.** Los 19 casos actuales tienen ~65–140 palabras. Cada uno pasa a una ficha con campos técnicos; los datos faltantes (toneladas, equipos, configuración, fecha) se piden al cliente caso por caso. Lo ya publicado se conserva literal como base.

---

## 7. Mapa de URLs y redirecciones

Regla: **ninguna URL con tráfico se pierde**. Se conservan intactas las URLs de los 60 artículos y los 19 proyectos (incluidas las dos con subcarpeta), y las de los 4 servicios, contacto, emergencias y trabaja con nosotros. El resto se redirige 301.

| Actual | Nueva | Acción |
|---|---|---|
| `/` | `/` | conservar |
| `/arriendo-de-gruas/`, `/transporte-de-cargas-especiales/`, `/ingenieria-y-montaje/`, `/emergencias/` | mismas | conservar (reformular contenido) |
| `/equipamiento/` y `/equipamiento/#gruas-moviles` … | `/flota/` y `/flota/<tipo>/` | 301 (las anclas no viajan: enlazar directo) |
| `/grua-movil/…`, `/camion-pluma/…`, `/semirremolque/…`, `/tracto-camion/…` (placeholders) | `/flota/<tipo>/` | 301 |
| `/proyectos/` | `/proyectos/` | conservar |
| `/proyectos-45/` | `/proyectos/` | 301 |
| `/proyectos/<slug>/` (19) | mismas | conservar |
| `/traslado-caex/` | `/proyectos/traslado-camiones-caex-hitachi-mantoverde/` | 301 (R-06) |
| `/articulos-noticias/` | `/articulos/` | 301 |
| `/articulos/<slug>/` (60, con subcarpetas) | mismas | conservar |
| `/noticia/<slug>/` (2) | `/noticias/<slug>/` | 301 |
| `/category/*` (100), `/tag/*` (320), `/author/*` (3) | `/articulos/tema/<tema>/` o `/articulos/` | 301 al tema correspondiente; etiquetas sin equivalente → `/articulos/` |
| `/centro-de-gestion-operacional-transmat/` | `/cgo/` | 301 |
| `/tecnologia-y-vanguardia/` | `/transmat/tecnologia/` | 301 |
| `/corporativo-expertos-en-cada-movimiento/` | `/transmat/` | 301 |
| `/contacto/`, `/trabaja-con-nosotros/` | mismas | conservar |
| `/contactanos/` (404 hoy, auditoría H-009) | `/contacto/` | 301 |
| `/politica-de-privacidad/` | `/privacidad/` | 301 |
| `/mailing-cgo-2/`, `/tarjeta-editable-html-transmat/`, `…-v2/` | fuera del sitio o ruta interna `noindex` | 410 o mover |
| `/wp-content/uploads/…` (PDF y fotos enlazadas) | `/archivos/…` o R2 | 301 por archivo: las fichas PDF están enlazadas desde fuera |

Las 528 URLs del sitemap actual se cruzan una a una contra esta tabla en la migración (`inventario/raw/sitemap.json`).

---

## 8. Plan de contenido

### 8.1 Se conserva (migración literal, con mejora de SEO y formato)

- **60 artículos** y **2 noticias** → MDX, misma URL, mismo título, mismo texto; se conservan `title` y `description` de Yoast; se asigna 1 de 5 temas; se migran imágenes a WebP con alt.
- **19 proyectos** → MDX, misma URL; el texto actual queda como base y se amplía a ficha (8.3).
- **Fichas técnicas PDF (54)** y **políticas (4: Alcohol y Drogas, RSE, SSOMA, Política SGI 2026)** → se mantienen descargables con redirección por archivo.
- **Datos de contacto, dirección, mapa, redes** → `data/sucursales.ts` y `data/cifras.ts`.
- **Video Traslado CAEX** (YouTube, ya publicado) → caso de proyecto (R-06) con CTA al planificador (auditoría H-025).

### 8.2 Se reformula (sobre la copia actual)

| Página | Hoy | Nuevo |
|---|---|---|
| **Home** | 1.013 palabras, 64 imágenes, cifras contradictorias, CGO como lista de funciones | Hero con tagline oficial "Expertos en cada movimiento" (hoy ausente del hero: auditoría), 4 entradas por necesidad, 6 industrias, cifras de la ficha única, 3 casos destacados con datos, flota por rango, CGO como promesa, planificador, artículos recientes |
| **Arriendo de grúas** | 137 palabras, CTA "Ver equipamiento" | 500–800 palabras: flota por tonelaje y configuración (SuperLift, Wind Power Jib, Luffing), modalidad rental, operadores certificados, **planificador embebido** (auditoría H-011) |
| **Transporte de cargas especiales** | 112 palabras | Líneas modulares (+80), camas bajas 30–126 t, ramplas, permisos y escoltas, GPS, Actros 3363, casos EFE / AES Andes / CAEX, planificador |
| **Ingeniería y montaje** | 109 palabras | Proceso (evaluación, estudio de carga, simulación CRANEbee, rigging, ejecución), normativa ASME B30.5 / ISO 9927, casos Mall Plaza y Cerro Dominador, planificador |
| **Emergencias 24/7** | 296 palabras, CTA a formulario | Landing de llamada: teléfono y WhatsApp arriba, qué cubre (rescate, recuperación, logística en carretera), caso Ruta B-400, sin formulario |
| **Equipamiento → Flota** | Tabla en una página, PDFs, sin fotos | Catálogo filtrable + ficha por modelo (R-04) |
| **Tecnología y vanguardia** | 371 palabras, 6 tecnologías | Mismo contenido reordenado por beneficio para el cliente (seguridad, precisión, trazabilidad), enlazado a equipos |
| **CGO** | 298 palabras de funcionalidades | Promesa: "ves tu proyecto en línea" (etapas, GPS, reportes PDF por OT, estado de pago); portal en fase 3 |
| **Corporativo → Transmat** | 363 palabras, fundación 2005, 16.200 m², +250 clientes/año | Historia, instalaciones, sucursales, valores (dossier), equipo humano ⚑, cifras validadas |
| **Contacto** | Formulario de 5 campos sin consentimiento | Datos directos + formulario corto calificador con consentimiento (Ley 21.719), origen UTM, `/gracias` |
| **Trabaja con nosotros** | 30 palabras + formulario con CV | Cultura, áreas, beneficios ⚑ + formulario con consentimiento |

Reglas de redacción: las del contexto maestro (§5.1): primera persona plural, dato exacto, modelo exacto, faena y ubicación, el porqué técnico, seguridad concreta, cierre con firma, sin épica ni exclamaciones.

### 8.3 Se crea (recomendaciones para trabajar con el cliente)

| ID | Qué | Por qué | Qué necesitamos del cliente |
|---|---|---|---|
| **R-01** | 6 páginas de industria + hub | Entrada por industria (Mortenson; auditoría H-005); el 7,6 % del tráfico con mejor interacción llega buscando temas de industria | Validar las 6 y sus casos emblemáticos |
| **R-02** | Hub `/servicios/` | Hoy `/servicios/` no existe como página; los 4 servicios cuelgan sueltos | — |
| **R-03** | Servicio "Logística de proyectos y almacenamiento" | El sitio menciona bodegaje en La Negra (16.200 m²) y el dossier habla de cross-docking; no tiene página | Confirmar alcance y capacidad de bodegaje |
| **R-04** | ~60 fichas de equipo | La flota es el activo más buscado (keywords de modelo); hoy es una tabla con PDFs | Lista vigente, pluma/configuraciones, tablas de carga (D2), fotos |
| **R-05** | Ficha técnica por proyecto (19) | Los casos tienen ~100 palabras; el comprador técnico quiere toneladas, equipos y configuración | Datos faltantes por caso; autorización de nombres |
| **R-06** | Caso "Traslado de dos CAEX Hitachi a Minera Mantoverde" | Existe el video y la landing; no existe el caso | Toneladas, equipos, fecha, aprobación de nombrar Mantoverde |
| **R-07** | **Planificador de operación** (cotizador) | Pieza de firma aprobada por Felipe; convierte intención técnica en solicitud calificada (auditoría H-011, H-022) | Campos que usa el comercial; responsable y plazo de respuesta (D4) |
| **R-08** | Portal de cliente CGO (fase 3) | Diferencial difícil de copiar | API de lectura del CGO (D3) |
| **R-09** | Seguridad y certificaciones | Hoy 4 PDF sueltos; en izaje crítico la seguridad decide la compra | Certificaciones vigentes, normas aplicadas, indicadores si se publican |
| **R-10** | Sostenibilidad | Euro 6, renovables, Cerro Dominador: hoy un párrafo | Flota Euro 6 (cuántos), política ambiental |
| **R-11** | Trabaja con nosotros ampliado | Marca empleadora (talento técnico escaso) | Áreas, beneficios, proceso |
| **R-12** | 5 temas de artículos en vez de 366 términos | 420 páginas de taxonomía delgadas compiten con el contenido real | — |
| **R-13** | Página de gracias con evento | Hoy no existe; sin ella no hay conversión medible (auditoría H-008) | Plazo de respuesta a declarar |
| **R-14** | Cookies y términos; consentimiento en formularios | Ley 21.719 (vigencia 1-dic-2026, con postergación en trámite) | Validación legal |
| **R-15** | Ficha única de cifras | Cuatro contradicciones activas (años, grúas, 800 t, líneas) | Decidir: ¿+15 años, 21 años desde 2005?, ¿+30 o 36 grúas?, ¿800 t? |
| **R-16** | Clientes y testimonios | Hay 11 clientes ya nombrados en casos publicados; no hay logos ni testimonios | Logos y aprobación por cliente; 2–3 testimonios |
| **R-17** | FAQ técnico por servicio | Responde lo que hoy pregunta la gente por WhatsApp; base del asistente futuro | Las 10 preguntas más frecuentes del comercial |
| **R-18** | Versión en inglés (fase 3) | Contratistas y fabricantes internacionales | Decisión de alcance (D7) |

### 8.4 Taxonomía nueva de artículos

Cinco temas: **Minería** · **Energía** (solar, eólica, BESS, transmisión, hidrógeno, geotermia) · **Logística y transporte** (puertos, rutas, permisos, líneas modulares) · **Equipos y tecnología** (fichas, XCMG, Liebherr, drones, Moasure, CRANEbee) · **Transmat** (corporativo, hitos, Exponor, CGO). Cada artículo lleva un tema; las etiquetas desaparecen; cada tema es una página hub con sus artículos y sus industrias relacionadas.

---

## 9. Trazabilidad: dónde se aplica cada recomendación

| Origen | Recomendación | Dónde queda en el sitio |
|---|---|---|
| Auditoría H-002 | Corregir "10 años" / "+15 años" y "+30" / "+80 líneas" | `data/cifras.ts` con fuente y fecha; R-15 |
| Auditoría H-004 | Paleta vigente `#DF0821`, no `#DF0A24` | tokens de Tailwind (fase 2) |
| Auditoría H-005 | Arquitectura por industria (Mortenson) | §4 `/industrias/`, mega-menú §5, R-01 |
| Auditoría H-006 | Prototipo de 306 MB no publicable | Sistema base §1: imágenes WebP optimizadas, sin base64 |
| Auditoría H-008 | Formulario sin origen, consentimiento ni plazo | Planificador y contacto con UTM, consentimiento, `/gracias` con plazo (R-07, R-13, R-14) |
| Auditoría H-009 | `/contactanos/` 404 | 301 en §7 |
| Auditoría H-011 | Ninguna página de servicio con formulario; rental lleva al catálogo | Planificador embebido en 5 servicios, 6 industrias, fichas y casos (§8.2, R-07) |
| Auditoría H-013 / H-024 | Ley 21.719 y Consent Mode sin Chile | R-14; consentimiento denegado por defecto que cubre Chile (§10) |
| Auditoría H-017 | Enlazado interno desde artículos a servicios | Cada artículo enlaza a su industria y servicio (modelo §6) |
| Auditoría H-019 | Posiciones por marcas de competidores | Fichas de equipo por modelo y temas (R-04, R-12); seguimiento de canasta (§10) |
| Auditoría H-020 / H-021 / H-022 | GTM vacío; conversión = carga de página; `form_submit` no es clave | Contrato de eventos §10; una sola vía de etiquetado |
| Auditoría H-023 | Google Ads fuera del reporting | Conversiones offline CRM → Ads (§10) |
| Auditoría H-025 | El video no conduce a nada | Caso CAEX con CTA al planificador (R-06) |
| Auditoría §13 roadmap | Fichas técnicas en HTML en paralelo a los PDF; desagregar equipamiento por categoría | R-04, §4 `/flota/<tipo>/` |
| Propuesta 5.0 · pieza 01 | Planificador de operación | R-07, `/planificador/` + módulos embebidos |
| Propuesta 5.0 · pieza 02 | Flota a escala (2D hoy, 3D después) | Ficha de equipo con geometría de pluma; 3D en fase 3 |
| Propuesta 5.0 · pieza 03 | Entrada por industria | §4, R-01 |
| Propuesta 5.0 · pieza 04 | Portal de proyecto (CGO) | R-08 fase 3 |
| Propuesta 5.0 · pieza 05 | Asistente técnico con límites | Fase 3; FAQ (R-17) como base de conocimiento |
| Propuesta 5.0 · pieza 06 | Casos como secuencia de maniobra | Plantilla de proyecto (R-05) con pasos; motion en fase 2 |
| Propuesta 5.0 · pieza 07 | Modo faena (sin señal, alto contraste) | Fichas de equipo instalables (PWA), definido en fase 2 |
| Propuesta 5.0 · pieza 08 | Transmat en vivo | Fase 3, depende de D3 |
| Propuesta 5.0 · registro maestro | Una cifra, una fuente | `data/*.ts` + MDX (§6) |
| Propuesta 5.0 · límites | Sin IA que cotice, sin efectos caros, sin clientes no aprobados | §3.6; `data/clientes.ts` con aprobación |
| Propuesta 5.0 · decisiones D1–D8 | Plataforma, tablas de carga, API CGO, CRM, cifras, fotos, inglés, Ley 21.719 | D1 resuelta (sistema A1); el resto en §8.3 "qué necesitamos" |

---

## 10. Base de medición, SEO y legal

**Medición.** Una sola vía de etiquetado (GTM o Google tag, no ambos). Contrato de eventos heredado de la propuesta: `rfq_start`, `rfq_step`, `rfq_result_shown`, **`rfq_submit`** (clave), **`whatsapp_click`**, **`phone_click`**, **`emergency_route`**, `video_cta_click`, `ficha_equipo_view`, `industria_view`, `cv_submit`. Cada envío lleva origen (UTM, referrer, página). Oportunidad calificada del CRM → conversión offline a Google Ads. Core Web Vitals medidos en usuarios reales con metas LCP ≤ 2,0 s (móvil), INP ≤ 200 ms, CLS ≤ 0,1.

**SEO.** `metadata` por ruta con los `title`/`description` actuales de Yoast como punto de partida; JSON-LD por entidad (§6); `sitemap.ts` solo con páginas reales; 301 por URL (§7); canónicas; `noindex` hasta el lanzamiento; seguimiento de posiciones con canasta declarada (marca, modelos de grúa, "arriendo de grúas Antofagasta", "transporte de cargas sobredimensionadas", marcas de competidores).

**Legal (Ley 21.719).** Consentimiento explícito y no premarcado en cada formulario, finalidad declarada, enlace a `/privacidad/`, mecanismo de revocación, consentimiento de cookies denegado por defecto para Chile, sin datos personales en la capa de datos. Fecha de vigencia a confirmar con asesoría legal (1-dic-2026, con postergación a 2027 en trámite).

**Accesibilidad.** WCAG 2.2 AA: contraste, foco visible, teclado, alt en todas las imágenes (hoy 701 sin alt), `prefers-reduced-motion`.

---

## 11. Fases y siguiente paso

| Fase | Entregable | Estado |
|---|---|---|
| **1 · Arquitectura** | Este documento + inventario + sistema base | Entregado para revisión |
| **2 · Tres variantes de Home** | Tres rutas en el repo `transmat-web` (`/propuesta-home-a`, `-b`, `-c`), misma arquitectura y contenido, tres direcciones de look; documento comparativo como en AGEA | Siguiente, al aprobar la fase 1 |
| **3 · Sitio completo** | Todas las secciones de §4 sobre el look aprobado; migración con paridad de posiciones; Fase 0 de medición sobre el sitio actual en paralelo | Tras aprobar el Home |

**Direcciones propuestas para las tres variantes de Home** (se detallan en la fase 2): **A · Centro de mando**, fondo negro y datos en primer plano, como la demo de la propuesta; **B · Faena**, fotográfica y editorial, con la operación real como protagonista y fondos claros; **C · Ingeniería**, planos, cotas y geometría de pluma como lenguaje visual, el radar de la propuesta llevado a sistema.

**Lo que necesitamos del cliente antes de la fase 3** (puede avanzar en paralelo a la fase 2): ficha única de cifras (R-15), lista vigente de flota con pluma y configuraciones (R-04), datos de los 19 casos (R-05), aprobación de nombres de clientes (R-16), fotografía propia de faena, acceso de lectura al CGO (R-08) y responsable comercial con plazo de respuesta (R-07).

---

## Anexos

- [`inventario/INVENTARIO_CONTENIDO_ACTUAL.md`](inventario/INVENTARIO_CONTENIDO_ACTUAL.md) — inventario completo (páginas, posts, flota, medios, sitemap, hallazgos).
- [`inventario/TEXTOS_PAGINAS_CLAVE.md`](inventario/TEXTOS_PAGINAS_CLAVE.md) — copia literal de las 13 páginas clave, tabla de flota con capacidades y 54 fichas PDF.
- `inventario/raw/*.json` — datos crudos (REST, sitemap, navegación, medios) para la migración.
- [`00_SISTEMA_BASE_AGEA.md`](00_SISTEMA_BASE_AGEA.md) — análisis técnico del sistema base.
- [`../RESUMEN_EJECUTIVO.md`](../RESUMEN_EJECUTIVO.md) — propuesta Transmat 5.0 (oct-2026) y demo publicada.
