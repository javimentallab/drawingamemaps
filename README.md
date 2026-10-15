<p align="center"><img src="store/icon-512.png" width="128" alt="drawingamemaps icon"></p>

# drawingamemaps

Download the **whole map** from video game map websites and **draw on it** — with zoom and pan, the strokes stay glued to the terrain. Then copy, download or share the result (paste it straight into Discord, TeamSpeak, WhatsApp…).

Works in Chromium browsers (Chrome, Brave, Edge, Opera…) and Firefox-based browsers (Firefox, Zen, LibreWolf…). Interface in English and Spanish.

*[Versión en español más abajo](#español).*

## How it works

Open a game map site and press **Alt+Shift+M** (or click the extension icon). drawingamemaps looks at what the page has loaded and offers the best way to get the full map:

| Source | Examples | What it does |
|---|---|---|
| **Tiles** (`z/x/y`, Deep Zoom, flat grids…) | Map Genie, IGN, th.gl, Leaflet / OpenLayers / custom canvas viewers | Works out the URL pattern, the zoom levels and the map extent, and downloads the whole map at the level of detail you choose |
| **Vector map (SVG)** | tarkov.dev | Rasterizes it into tiles at the resolution you pick — zooms without losing sharpness |
| **Single large image** | Dark and Darker, Humanitz | Downloads it as is |
| **Just what's visible** | anything else | A screenshot of the current view |

It also copes with the usual quirks: inverted zoom numbering, `z/y/x` order, flipped rows (TMS), hotlink protection (it sends the map site as `Referer`), filler tiles outside the map, and transparent or plain borders, which it trims.

Then draw: pencil, line, arrow, rectangle, circle, text, eraser, colors and thickness, undo/redo. Everything is saved locally in your browser ("My maps").

## Tested sites

DayZ (xam.nu), Gray Zone Warfare (tcno.co), Dark and Darker, Humanitz (Point Atlas), Project Zomboid B42 (projectzomboidmap.com), Elden Ring / GTA V / Fallout 4 / Zelda BOTW (Map Genie, IGN), RDR2 Collectors Map, Escape from Tarkov (tarkov.dev), Satisfactory, Zelda TOTK object map, Genshin Impact (HoYoLAB), The Witcher 3, Skyrim (UESP), Palworld, Fortnite (fortnite.gg), PUBG (pubgmap.io), ARC Raiders, AION 2, ARK (wikily.gg), Myth of Empires, Conan Exiles and Soulmask (th.gl), SCUM, Marathon (Shackmaps), Warzone (wzhub.gg), World of Warcraft (Wowhead).

Maps that are drawn in the browser from data (Subnautica, Valheim's world generator) have no images to download: only "Just what's visible" works there.

## Install

From the stores *(coming soon)*, or from source:

- **Chromium**: `chrome://extensions` → Developer mode → *Load unpacked* → select `src/`.
- **Firefox**: run `node tools/build.js`, then `about:debugging#/runtime/this-firefox` → *Load Temporary Add-on* → `dist/firefox/manifest.json`.

## Development

```
src/                 the extension (Manifest V3, Chromium flavour, no build step, no dependencies)
tools/build.js       builds dist/chromium + dist/firefox and their .zip packages for the stores
tools/i18n-messages.py   single source for the English/Spanish texts → src/_locales
tools/make-icons.py  draws the icon
tools/vigilante/     weekly test robot: runs the extension in a headless browser against many map
                     sites, discovers new games on Map Genie / th.gl / Shackmaps and reports
```

The Firefox build differs only in the manifest (`background.scripts`, `browser_specific_settings`) and a tiny shim that maps `chrome` to `browser`.

## Privacy

drawingamemaps collects no data. Maps and drawings are stored only in your browser; it only connects to the map sites you choose to download from. See [PRIVACY.md](PRIVACY.md).

## License

[MIT](LICENSE). Built with the help of Claude (Anthropic).

---

## Español

Descarga el **mapa entero** de las webs de mapas de videojuegos y **dibuja encima** con zoom y desplazamiento; los trazos se quedan pegados al terreno. Luego copia, descarga o comparte el resultado (pégalo directamente en Discord, TeamSpeak, WhatsApp…).

Funciona en navegadores Chromium (Chrome, Brave, Edge, Opera…) y en los basados en Firefox (Firefox, Zen, LibreWolf…). Interfaz en español e inglés.

**Uso:** abre una web de mapa y pulsa **Alt+Shift+M** (o el icono). Elige **Mapa entero** (teselas), **Mapa vectorial (SVG)**, **Imagen completa** o **Solo lo que se ve**; si hace falta, elige el nivel de detalle. Dibuja con lápiz, línea, flecha, rectángulo, círculo, texto y goma. Con el botón 📤 (o **Ctrl+C**) copias lo que se ve y lo pegas en el chat.

**Instalar desde el código:** en Chromium, `chrome://extensions` → Modo desarrollador → *Cargar descomprimida* → `src/`. En Firefox, `node tools/build.js` y luego `about:debugging` → *Cargar complemento temporal* → `dist/firefox/manifest.json`.

**Privacidad:** no recoge ningún dato; todo se guarda en tu navegador. Ver [PRIVACY.md](PRIVACY.md).
