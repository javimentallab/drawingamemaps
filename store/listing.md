# Store listing — drawingamemaps

Texts for addons.mozilla.org (AMO; submitted with `web-ext sign --amo-metadata store/amo-metadata.json`). The Chrome Web Store is not used for now (it charges a $5 developer fee): Chromium users install from the GitHub release. The Chrome texts are kept here in case that changes.

- **Name:** drawingamemaps
- **Homepage / support:** https://github.com/javimentallab/drawingamemaps
- **Privacy policy:** https://github.com/javimentallab/drawingamemaps/blob/main/PRIVACY.md
- **Category:** Chrome → *Tools* (alternative: *Fun*) · AMO → *Games & Entertainment*
- **Images:** `icon-512.png` (store icon; Chrome also uses the 128 px one in the package), `screenshot-1..5-*.png` (1280×800)
- **Packages:** `dist/drawingamemaps-chromium-<v>.zip` (Chrome) · `dist/drawingamemaps-firefox-<v>.zip` (AMO), built with `node tools/build.js`

## Short description (Chrome ≤ 132 chars · AMO summary ≤ 250)

**EN:** Download the whole map from video game map sites and draw on it with zoom and pan. Copy it straight into Discord or TeamSpeak.

**ES:** Descarga el mapa entero de webs de mapas de videojuegos y dibuja encima con zoom. Cópialo directamente a Discord o TeamSpeak.

## Detailed description

### EN

Plan your route, mark the loot, show your squad where to go.

drawingamemaps grabs the WHOLE map from interactive game map websites — not just a screenshot of what's on screen — so you can zoom in and pan across the entire map and draw on it. Your strokes stay glued to the terrain at any zoom level.

HOW IT WORKS
Open a game map site and press Alt+Shift+M (or click the icon). The extension detects how the site serves its map and offers the best option:
• Whole map (tiles) — works out the tile pattern, zoom levels and map extent, and downloads the full map at the level of detail you choose. Works with Map Genie, IGN, th.gl, Leaflet, OpenLayers, Deep Zoom and custom viewers.
• Vector map (SVG) — rendered at the resolution you want, sharp at any zoom.
• Full image — when the site uses one big picture.
• Just what's visible — a screenshot, for anything else.

DRAW
Pencil, line, arrow, rectangle, circle, text and eraser, with colors, thickness, undo and redo. Your maps and drawings are saved in your browser under "My maps".

SHARE
Copy what you see (Ctrl+C) or the whole map and paste it into Discord, TeamSpeak, WhatsApp… Or download it as PNG.

TESTED WITH
DayZ, Escape from Tarkov, PUBG, Warzone, ARC Raiders, Gray Zone Warfare, Marathon, SCUM, ARK, Conan Exiles, Soulmask, Myth of Empires, AION 2, Project Zomboid, Palworld, Elden Ring, GTA V, Red Dead Redemption 2, Zelda, Genshin Impact, The Witcher 3, Skyrim, Fallout 4, Satisfactory, Fortnite, World of Warcraft and more.

PRIVACY
No data collection, no tracking, no account. Everything stays in your browser; the extension only connects to the map sites you choose. Open source (MIT).

### ES

Planea la ruta, marca el loot, enséñale a tu escuadra por dónde ir.

drawingamemaps descarga el mapa ENTERO de las webs de mapas interactivos de videojuegos (no solo una captura de lo que se ve), para que puedas ampliar, moverte por todo el mapa y dibujar encima. Los trazos se quedan pegados al terreno con cualquier zoom.

CÓMO FUNCIONA
Abre una web de mapa y pulsa Alt+Shift+M (o el icono). La extensión detecta cómo sirve la web su mapa y te ofrece la mejor opción:
• Mapa entero (teselas): averigua el patrón de teselas, los niveles de zoom y la extensión del mapa, y lo descarga entero al nivel de detalle que elijas. Funciona con Map Genie, IGN, th.gl, Leaflet, OpenLayers, Deep Zoom y visores propios.
• Mapa vectorial (SVG): se genera a la resolución que quieras, nítido con cualquier zoom.
• Imagen completa: cuando la web usa una sola imagen grande.
• Solo lo que se ve: una captura, para todo lo demás.

DIBUJA
Lápiz, línea, flecha, rectángulo, círculo, texto y goma, con colores, grosor, deshacer y rehacer. Tus mapas y dibujos se guardan en el navegador, en «Mis mapas».

COMPARTE
Copia lo que se ve (Ctrl+C) o el mapa entero y pégalo en Discord, TeamSpeak, WhatsApp… O descárgalo en PNG.

PRIVACIDAD
No recoge datos, no rastrea, no necesita cuenta. Todo se queda en tu navegador; solo se conecta a las webs de mapas que tú eliges. Código abierto (MIT).

## Chrome Web Store — Privacy practices tab

**Single purpose:** Let users download the full map from a video game map website and draw annotations on it.

**Permission justifications:**
- `activeTab` — When the user clicks the extension on a map page, read which map images that page has loaded and capture the visible tab for the "Just what's visible" option.
- `scripting` — Inject a read-only script into the current tab (only after the user clicks) to list the image URLs the page loaded, so the map tiles can be identified.
- `storage` — Pass the chosen download job from the popup to the editor tab.
- `unlimitedStorage` — Whole game maps (thousands of tiles) are stored locally in IndexedDB so the user can reopen them.
- `contextMenus` — Adds a "My maps" item to the extension icon's menu.
- `declarativeNetRequestWithHostAccess` — While downloading, the extension's own download tab sends the map site as Referer, because many map sites block image downloads without it. The rule is limited to that tab and removed afterwards.
- `clipboardWrite` — Copy the annotated map so the user can paste it into Discord, TeamSpeak, etc.
- Host permissions (optional, requested per site at download time) — Download the map images from the site the user chose.

**Remote code:** No. All code is in the package.

**Data usage:** The extension does not collect or transmit any user data. (Tick none of the data categories.) Certify: not sold, not used for unrelated purposes, not used for creditworthiness.

## AMO — Notes for reviewers

No build step, minifier or bundler: the package is the plain source from https://github.com/javimentallab/drawingamemaps (`src/`), with the Firefox manifest generated by `tools/build.js` (adds `background.scripts`, `browser_specific_settings` and a 5-line `browser-shim.js`). To test: open https://dayz.xam.nu/hashima, press Alt+Shift+M, choose "Whole map", grant the permission for static.xam.nu, pick a level, Download.
