# transmat-web-5 — Propuesta Web Transmat 2026–2030 (Agencia A1)

Repositorio de la propuesta "Transmat 5.0": demo interactiva (`index.html`), resumen ejecutivo
(`RESUMEN_EJECUTIVO.md`) y documentos de fase en `docs/`. Cliente: Transmat Chile (izajes y
transportes de alta complejidad, B2B industrial). Lee `README.md` primero: ahí están los enlaces
publicados, la estructura y cómo correrla.

El sitio definitivo se construye en un repo aparte (`transmat-web`) sobre el **sistema web de A1**
(Next.js + TypeScript + Tailwind v4, contenido como código, OpenNext en Cloudflare Workers; referencia
`~/Claude/Projects/Agea/web 2.0/agea-web` y https://agea.cl). Fases: arquitectura (`docs/01_…`) →
tres variantes de Home → sitio completo. El inventario del sitio actual (`docs/inventario/`, generado
por `tools/inventario_transmat_cl.py`) es la base de contenido y de la migración: no inventar lo que
no esté ahí o en el contexto maestro.

## Reglas que no se negocian
- **Ninguna cifra, modelo de equipo, proyecto ni dato de contacto se inventa.** La única fuente es
  `js/data.js`, que a su vez sale del contexto maestro del cliente (`CONTEXTO_TRANSMAT_AGENTE_COPY.md`,
  en el proyecto A1, fuera de este repo). Si un dato no está, se marca como pendiente, no se rellena.
- Una cifra, una fuente: las tablas y demos se dibujan desde `js/data.js`; no escribir cifras a mano
  en `index.html`.
- Paleta vigente: rojo `#DF0821`, negro `#0A0A0A`, blanco. Verde `#35933D` y azul `#2D5294` solo como
  estado. El rojo `#DF0A24` es legacy y no se usa. Tipografía Roboto; títulos en mayúsculas, peso 900.
- Tono: español de Chile, B2B industrial, informe de ingeniería. Sin épica, sin "los mejores",
  sin precios, plazos ni disponibilidad, sin clientes o faenas no aprobados.
- Las demos no envían ni guardan datos personales: solo emiten eventos al `dataLayer`.
- **No desplegar, publicar ni compartir fuera del equipo sin autorización expresa de Felipe
  (web@auno.cl).** Esto incluye republicar el artefacto y cambiar la visibilidad del repo.

## Cómo trabajar
- Correr local: `python3 -m http.server 8765` desde la raíz → `http://localhost:8765/`.
  En Claude Code: `preview_start` con el servidor `propuesta` (`.claude/launch.json`). No abrir
  `index.html` como archivo suelto: las rutas relativas y el `fetch` de fuentes no se comportan igual.
- Verificar: `node --check js/app.js` y una pasada en 1440 px y 375 px. Sin dependencias ni build
  para el sitio; `tools/build_artifact.py` solo genera `dist/artifact.html` para publicar en claude.ai.
- Commits en español, un cambio por commit. Rama `main`.
