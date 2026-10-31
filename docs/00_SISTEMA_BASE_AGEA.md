# 00 · Sistema base de A1 (`agea-web`) — resumen y plan de reutilización para Transmat

**Fecha:** 30 de octubre de 2026 · **Alcance:** lo que Transmat hereda del sistema con que A1 construyó agea.cl
**Nota:** este es el resumen publicable. El análisis técnico completo (742 líneas, con evidencia por archivo y hallazgos de producción) describe un repositorio privado de otro cliente y se conserva como informe interno de A1, fuera de este repositorio.

---

## 1. Qué es el sistema

1. **Stack.** Next.js 16 (Turbopack) + React 19 + TypeScript estricto + Tailwind CSS v4 con tokens en `@theme` (sin `tailwind.config`), npm y Node 26 (`.nvmrc`). Sin CMS, sin base de datos.
2. **Publicación.** Cloudflare Workers con OpenNext (`server: cloudflare`, `x-opennext: 1`), imágenes en R2. La configuración de Wrangler y OpenNext no vive en el repo de AGEA: **en `transmat-web` sí se versiona** (`wrangler.jsonc`, `open-next.config.ts`, `npm run cf:deploy`).
3. **Contenido como código.** Entidades tipadas en `data/*.ts` (áreas, sectores, proyectos, etapas, clientes, cifras) y artículos en MDX. El copy de Home y Contacto va en el TSX. Relación entre entidades por `slug`; `null` significa "por confirmar".
4. **Casi todo estático.** Rutas con `generateStaticParams`; `sitemap`, `robots` y `llms.txt` generados desde los mismos datos. Lo único dinámico es el endpoint del formulario.
5. **Motion: CSS primero.** Reveals, parallax y progreso de lectura con `animation-timeline`; JavaScript solo para Lenis (scroll suave) y Motion (`LazyMotion`). GSAP está instalado sin uso, por costo medido.
6. **SEO y GEO como sistema.** `buildMetadata()` por ruta, JSON-LD tipado con grafo de `@id`, `robots.ts` que admite 13 rastreadores de IA, `llms.txt`, y en cada entidad una respuesta directa de 40–60 palabras más FAQ.
7. **Formulario.** React Hook Form + Zod → `/api/contacto` → correo transaccional (Resend por REST), con honeypot, reCAPTCHA v3 y límite por IP en memoria → `/gracias` → evento al `dataLayer`. Sin persistencia ni CRM.
8. **Método de documentación.** Carpeta `docs/` con master spec, dirección de arte y motion, comparativo de homes, planes de corrección; numeración por secciones, jerarquía de autoridad declarada y tareas numeradas.
9. **Acoplamiento a la marca.** ~700 usos del prefijo `agea-*` y URLs de CDN escritas a mano: copiar el repo exige renombrar tokens y centralizar assets. Por eso Transmat **no es un fork**: se creó limpio y se copiaron módulos.

## 2. Cómo se hicieron las variantes de Home en AGEA (método)

- Tres rutas en el mismo repo: A en `/`, B en `/propuesta-home`, C en `/propuesta-home-c`, con `noindex` y un cartel fijo que las identifica como propuesta.
- Comparación con Lighthouse y una **matriz ponderada de diez criterios** (A 61 · B 81 · C 94), documentada en `docs/COMPARATIVO_HOME_A_vs_B.md` y `docs/HOME_CONVERSION_AGEA.md`.
- La ganadora se promovió copiando su contenido a `app/page.tsx`; las dos copias divergieron después. Lección aplicada en Transmat: **una sola Home en `/`** (decisión de Felipe, 30-oct-2026) y la justificación en `docs/HOME_A_CONVERSION.md` del repo `transmat-web`.
- La Home ganadora de AGEA midió LCP móvil de 3,4 s en laboratorio; la meta de Transmat es ≤ 2,0 s: por eso sin GSAP, sin slider, fotos WebP preoptimizadas y motion CSS.

## 3. Qué se reutiliza, qué se adapta y qué no se copia

### 3.1 Reutilizado (renombrado a `tm-*`) en `transmat-web`

| Módulo | En AGEA | En Transmat |
|---|---|---|
| Utilidades | `lib/utils.ts` (`cn` con `extendTailwindMerge`) | Igual, con tokens `text-display…overline`, `duration-*` |
| Metadata | `lib/seo.ts` | Igual; título absoluto por página; `noindex` mientras `NEXT_PUBLIC_INDEXABLE` no sea `true` |
| JSON-LD | `lib/schema.ts` | `ProfessionalService` con dirección de La Negra, `Service`, `Product` + `PropertyValue` por equipo, `CreativeWork` por caso |
| Eventos | `lib/analytics.ts` | Mapa tipado del contrato `rfq_* · whatsapp_click · phone_click · emergency_route…` |
| Formulario | `lib/contacto-schema.ts` + `api/contacto` | `lib/solicitud-schema.ts` + `api/solicitud`: consentimiento no premarcado, origen (UTM, referrer), honeypot, sin datos personales en el log |
| Metadata routes | `sitemap.ts`, `robots.ts`, `llms.txt` | Iguales, derivados de `data/` |
| Config | `next.config.ts` (redirecciones por listas, cabeceras) | Redirecciones del sitio WordPress (docs/01 §7), CSP en informe, `X-Robots-Tag` en previsualización |
| CSS | `globals.css` (tokens, base, reveals, reduced-motion) | Tokens de marca Transmat, utilidades `container-tm`, `eyebrow`, `panel-hud`, `rejilla`, `reveal` |
| UI y layout | `Button`, `Reveal`, `Header`, `MobileMenu`, `Footer` | Iguales en patrón; se agrega `MobileBar` (Llamar · WhatsApp · Planificar) |
| Plataforma | `ci.yml`, `.nvmrc`, `eslint.config.mjs`, `postcss.config.mjs`, `tsconfig.json`, `.env.example` | Iguales; todas las variables opcionales y nada se rompe sin ellas |

### 3.2 Adaptado

- `areas` → `servicios`; `sectores` → `industrias`; nuevos `flota` (62 equipos generados desde el inventario), `cifras` (con fuente y validación), `sucursales`, `tecnologias`, `navegacion`, `mapa-sitio`. Proyectos y artículos pasan a MDX en la fase 3.
- El formulario de contacto se convierte en **planificador por pasos** con equipos candidatos antes de pedir datos.
- El lenguaje gráfico del círculo de AGEA se reemplaza por el de Transmat: radar de radio operativo, rejilla técnica, esquinas HUD, datos en Roboto Mono.

### 3.3 No se copia

Contenido de AGEA, redirecciones de AGEA, componentes del círculo (`CircleArcs`, `KpiBubbles`…), `HeroSlider`, GSAP, lógica de Vercel, URLs fijas a `cdn.agea.cl`, páginas legales duplicadas.

## 4. Lo que la base no resuelve y Transmat construye

| Pieza | Estado |
|---|---|
| Planificador de operación con equipos candidatos | **Fase 2, construido** (`/planificador`) |
| Barra móvil Llamar · WhatsApp · Planificar; landing de emergencias | **Fase 2, construido** |
| `Product` / `ItemList` en JSON-LD por equipo; fichas por modelo | Fase 2 (fichas base) → fase 3 (catálogo con filtros) |
| Mapa de 528 URL del sitio anterior y PDFs en R2 con 301 | Fase 3 (redirecciones principales ya en `next.config.ts`) |
| Persistencia de solicitudes (KV / CRM) y límite de tasa global | Fase 3 |
| CSP estricta, Consent Mode para Chile, una sola vía de etiquetado | Fase 3 |
| `/en`, PWA "modo faena", portal CGO | Fase 3 |

## 5. Correcciones al documento 01 derivadas del análisis

| Decía el doc 01 | Realidad verificada | Ajuste |
|---|---|---|
| "GSAP + Lenis para motion" | Lenis sí; GSAP instalado sin uso | Doc 01 §1 corregido: motion CSS primero, Lenis y Motion donde aporte |
| "Formularios → correo + CRM" | En AGEA solo correo, sin persistencia | Transmat: correo en fase 2; persistencia y CRM en fase 3 |
| "Una sola vía de etiquetado" | AGEA carga GTM y gtag | Transmat: decisión explícita antes de activar GTM |
| "Proyectos en MDX" | En AGEA los proyectos son `data/proyectos.ts`; MDX solo artículos | Transmat: `data/proyectos.ts` generado hoy; MDX cuando haya ficha técnica (fase 3) |
| Next 16.3.0 como en AGEA | El adaptador de Cloudflare exige Next ≥ 16.4.1 | `transmat-web` parte en Next 16.4.3 |

## 6. Orden de arranque aplicado

1. Repo nuevo `transmat-web` creado limpio en Next 16.4.3, React 19.2, Tailwind 4.3, zod 4.6 (no un fork de agea-web).
2. Módulos copiados y renombrados según §3.1; tokens de marca Transmat en `@theme`.
3. Datos generados desde el inventario (`tools/generar_datos.py`), no escritos a mano.
4. Configuración de OpenNext y Wrangler en el repo; `npm run cf:deploy` publica en el Worker `transmat-web` de la cuenta de la agencia.
5. CI con tipos, lint y build en cada push.
