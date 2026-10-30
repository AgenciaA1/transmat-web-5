# Transmat Web 5.0 — Propuesta 2026–2030

Propuesta de Agencia A1 para el nuevo sitio de Transmat Chile: una plataforma que planifica una
operación en cuatro pasos, muestra la flota a escala real, abre el proyecto del cliente en línea y
mide cada solicitud. Este repositorio contiene la **demo interactiva** y el **resumen ejecutivo**.

> Repositorio público por decisión de Agencia A1 (26-oct-2026). Contiene métricas internas del
> cliente (Auditoría 360, ago-2026) que Transmat ya conoce; no agregar datos que el cliente no haya
> aprobado para publicar.

| Qué | Dónde |
|---|---|
| **Demo para el cliente** (Cloudflare Workers, cuenta de la agencia) | <https://transmat-web-5.web-6f2.workers.dev> — pública, sin cuenta; no indexada |
| Resumen ejecutivo y guion de presentación (12 min) | [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) |
| Repositorio | <https://github.com/AgenciaA1/transmat-web-5> (público) |
| Copia en claude.ai (artefacto) | <https://claude.ai/artifact/6XSQaGcurua2GUbraXcvxj> — privada; opcional, para revisar con comentarios |

## Documentos de fase (`docs/`)

El sitio se construye sobre el sistema web de A1 (Next.js + TypeScript + Tailwind, contenido como
código, OpenNext en Cloudflare Workers; referencia agea.cl) en tres fases: arquitectura → tres
variantes de Home → sitio completo.

| Documento | Qué es |
|---|---|
| [docs/00_SISTEMA_BASE_AGEA.md](docs/00_SISTEMA_BASE_AGEA.md) | Análisis técnico del sistema base (agea-web) y qué se reutiliza |
| [docs/01_ARQUITECTURA_MAPA_DE_SITIO_Y_CONTENIDO.md](docs/01_ARQUITECTURA_MAPA_DE_SITIO_Y_CONTENIDO.md) | Fase 1: arquitectura, mapa de sitio, modelo de contenido, redirecciones, plan de contenido y trazabilidad de recomendaciones |
| [docs/inventario/](docs/inventario/INVENTARIO_CONTENIDO_ACTUAL.md) | Inventario exacto de transmat.cl (REST + sitemap + HTML) generado con `tools/inventario_transmat_cl.py`; base de la migración |

## Correr la demo en local

El sitio no tiene dependencias ni build. Desde la raíz del repo:

```bash
python3 -m http.server 8765
```

(o `npm run dev`, que hace lo mismo)

y abrir <http://localhost:8765/>. En Claude Code: `preview_start` con el servidor `propuesta`
(`.claude/launch.json`). No abrir `index.html` como archivo suelto: las rutas relativas y las
fuentes no se comportan igual.

## Estructura

- `index.html` — la propuesta: 11 secciones, cinco demos funcionales (planificador, flota,
  industrias, grafo, asistente), portal CGO simulado, radar tecnológico, ruta y decisiones.
- `js/data.js` — **registro maestro**: cifras, flota, proyectos, industrias, contrato de eventos,
  radar, ruta, límites y decisiones. Una cifra, una fuente: todo lo demás se dibuja desde aquí.
- `js/app.js` — demos y medición (eventos al `dataLayer`, visibles en el panel inferior izquierdo).
  Sin dependencias externas.
- `css/styles.css` — sistema visual "Centro de Mando": negro, rojo `#DF0821`, blanco; Roboto y
  Roboto Mono.
- `assets/` — logo y fotografías de stock optimizadas (WebP), provisorias hasta contar con
  fotografía propia de faena.
- `wrangler.toml`, `.assetsignore`, `package.json` — despliegue en Cloudflare Workers como archivos
  estáticos; `.assetsignore` deja fuera docs, herramientas y configuración.
- `tools/build_artifact.py` — genera `dist/artifact.html` para la copia en claude.ai.
- `CLAUDE.md` — reglas para trabajar en este repo con Claude Code.

## Publicar después de un cambio

1. Editar `index.html`, `css/` o `js/` y verificar en local (`node --check js/app.js`; revisar a
   1440 px y 375 px).
2. `npm install` (una vez) y `npm run deploy`: sube `index.html`, `css/`, `js/` y `assets/` al Worker
   `transmat-web-5` de la cuenta Cloudflare de la agencia. La primera vez en una máquina nueva hay
   que entrar con `npx wrangler login` usando esa cuenta. **Solo con autorización de Felipe**: esa
   URL es la que ve el cliente.
3. Opcional, la copia en claude.ai: `npm run build:artifact` escribe `dist/artifact.html` (el visor
   pone su propio `<html>/<head>/<body>`, así que el script deja solo título, fuentes, estilos y
   contenido); publicarlo con los archivos de `css/`, `js/` y `assets/` sobre la misma URL (desde
   Claude Code: herramienta Artifact con `url`).

## Qué es real y qué es ilustrativo

- **Real:** cifras corporativas, modelos de flota con capacidad y pluma, proyectos publicados o
  aprobados, datos de contacto y hallazgos de la Auditoría 360 (ago-2026).
- **Ilustrativo:** resultados del planificador (capacidad nominal, no tabla de carga), respuestas
  del asistente (predefinidas), portal de proyecto (simulado) y fotografías de stock.
- **Pendiente de dato:** longitud de pluma de LTM 1250-5.1, XCA160 y XCT100 (marcadas así en la demo).

## Reglas

Ver [CLAUDE.md](CLAUDE.md). En corto: no inventar datos; paleta y tono de marca; no desplegar ni
compartir fuera del equipo sin autorización de Felipe (web@auno.cl). El contexto maestro del
cliente (`CONTEXTO_TRANSMAT_AGENTE_COPY.md`) vive en el proyecto A1, no en este repo.

## Siguiente paso

Fase 0 (oct–dic 2026) sobre el sitio actual: corregir la medición y los formularios. Las ocho
decisiones que dependen del cliente están en el resumen ejecutivo (§12).
