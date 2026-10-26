# Transmat Web 5.0 — Propuesta 2026–2030

Propuesta de Agencia A1 para el nuevo sitio de Transmat Chile: una plataforma que planifica una
operación en cuatro pasos, muestra la flota a escala real, abre el proyecto del cliente en línea y
mide cada solicitud. Este repositorio contiene la **demo interactiva** y el **resumen ejecutivo**.

> Documento confidencial: contiene métricas internas del cliente (Auditoría 360, ago-2026).
> El repositorio es privado y la demo publicada solo la ven las personas con acceso.

| Qué | Dónde |
|---|---|
| Demo publicada, para presentar al cliente | <https://claude.ai/artifact/6XSQaGcurua2GUbraXcvxj> — privada; Felipe comparte el acceso desde el menú *Share* de la página |
| Resumen ejecutivo y guion de presentación (12 min) | [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) |
| Repositorio | <https://github.com/AgenciaA1/transmat-web-5> (privado) |

## Correr la demo en local

Sin dependencias ni build. Desde la raíz del repo:

```bash
python3 -m http.server 8765
```

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
- `tools/build_artifact.py` — genera `dist/artifact.html` para publicar en claude.ai (ver abajo).
- `CLAUDE.md` — reglas para trabajar en este repo con Claude Code.

## Republicar después de un cambio

1. Editar `index.html`, `css/` o `js/` y verificar en local (`node --check js/app.js`; revisar a
   1440 px y 375 px).
2. `python3 tools/build_artifact.py` → escribe `dist/artifact.html`. El visor de artefactos pone su
   propio `<html>/<head>/<body>`, así que el script deja solo título, fuentes, estilos y contenido.
3. Publicar `dist/artifact.html` junto con los archivos de `css/`, `js/` y `assets/` **sobre la misma
   URL** (desde Claude Code: herramienta Artifact con `url`). Solo con autorización de Felipe.

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
