# Genera src/_locales/<idioma>/messages.json desde esta tabla (en, es) y tools/i18n-more.py (el resto).
# Uso: python tools/i18n-messages.py
import json, re, os

M = {  # clave: (inglés, español)
    'extDesc': ("Download the whole map from video game map sites and draw on it with zoom and pan.", "Descarga el mapa entero de webs de mapas de videojuegos y dibuja encima con zoom y desplazamiento."),
    'cmdDesc': ("Open drawingamemaps", "Abrir drawingamemaps"),
    'menuMyMaps': ("My maps", "Mis mapas"),
    'searching': ("Looking for the map…", "Buscando el mapa…"),
    'hint': ("Not getting the whole map? Pan or zoom the map and open this again, or press “Reload and analyze”.", "¿No sale el mapa entero? Mueve o haz zoom en el mapa y vuelve a abrir esto, o pulsa «Recargar y analizar»."),
    'reload': ("Reload and analyze", "Recargar y analizar"),
    'reloadTitle': ("Reloads the page, watching from the start which images it loads", "Recarga la página vigilando desde el principio qué imágenes carga"),
    'noAccess': ("This page can’t be read (browser internal pages, extension store…).", "Esta página no deja leer su contenido (páginas internas del navegador, tienda de extensiones…)."),
    'optTiles': ("Whole map", "Mapa entero"),
    'optTilesSub': ("tiles from $1 · $2 seen", "teselas de $1 · $2 vistas"),
    'optSvg': ("Vector map (SVG)", "Mapa vectorial (SVG)"),
    'optSvgSub': ("$1 · $2 KB · zooms without losing sharpness", "$1 · $2 KB · se amplía sin perder nitidez"),
    'optImage': ("Full image $1", "Imagen completa $1"),
    'optCapture': ("Just what’s visible", "Solo lo que se ve"),
    'optCaptureSub': ("screenshot of the current view", "captura de la pantalla actual"),
    'errorX': ("Error: $1", "Error: $1"),
    'needPerm': ("To download the map, permission to read $1 is needed.", "Para descargar el mapa hace falta permiso para leer $1."),
    'grant': ("Grant permission", "Dar permiso"),
    'permDenied': ("Without that permission the map can’t be downloaded. You can go back and use “Just what’s visible”.", "Sin ese permiso no se puede descargar. Puedes volver y usar «Solo lo que se ve»."),
    'dlImage': ("Downloading the image…", "Descargando la imagen…"),
    'errNoImage': ("The server didn’t return the image.", "El servidor no ha devuelto la imagen."),
    'preparing': ("Preparing the map: $1 / $2", "Preparando el mapa: $1 / $2"),
    'dlSvg': ("Downloading the vector map…", "Descargando el mapa vectorial…"),
    'errStatus': ("The server responded $1.", "El servidor ha respondido $1."),
    'errSvg': ("The file isn’t a valid SVG.", "El fichero no es un SVG válido."),
    'errSvgSize': ("Can’t tell the size of this SVG.", "No sé el tamaño de este SVG."),
    'svgPick': ("It’s a vector map: you can zoom in as much as you like. Choose the maximum resolution.", "Es un mapa vectorial: se puede ampliar tanto como quieras. Elige la resolución máxima."),
    'nTiles': ("$1 tiles", "$1 teselas"),
    'analyzing': ("Analyzing the map…", "Analizando el mapa…"),
    'analyzingN': ("Analyzing the map… ($1 probes)", "Analizando el mapa… ($1 pruebas)"),
    'errNoTiles': ("The server doesn’t return this map’s tiles.", "El servidor no devuelve las teselas de este mapa."),
    'pickLevel': ("Choose the level of detail. More detail = more zoom without pixelation, but a bigger download.", "Elige el nivel de detalle. Más detalle = más zoom sin pixelarse, pero más descarga."),
    'noEdges': ("The map doesn’t seem to have edges; the area has been limited.", "El mapa no parece tener bordes; se ha limitado la zona."),
    'level': ("Level $1 · $2", "Nivel $1 · $2"),
    'levelSub': ("≤$1 tiles · $2", "≤$1 teselas · $2"),
    'dlLevel': ("Downloading level $1 of $2: $3 / $4", "Descargando nivel $1 de $2: $3 / $4"),
    'errNoLevel': ("Couldn’t download any tile of the chosen level.", "No se ha podido descargar ninguna tesela del nivel elegido."),
    'assembling': ("Assembling the map…", "Montando el mapa…"),
    'dlGrid': ("Downloading the tile grid…", "Descargando la rejilla de teselas…"),
    'dlGridN': ("Downloading the tile grid: $1", "Descargando la rejilla de teselas: $1"),
    'errTiles': ("Couldn’t make sense of this site’s tiles. Try “Just what’s visible”.", "No he sabido interpretar las teselas de esta web. Prueba con «Solo lo que se ve»."),
    'download': ("Download", "Descargar"),
    'cancel': ("Cancel", "Cancelar"),
    'close': ("Close", "Cerrar"),
    'confirmClear': ("Delete all strokes on this map?", "¿Borrar todos los trazos de este mapa?"),
    'copied': ("Image copied. Paste it into Discord, TeamSpeak, WhatsApp… with Ctrl+V.", "Imagen copiada. Pégala en Discord, TeamSpeak, WhatsApp… con Ctrl+V."),
    'copyFail': ("Couldn’t copy: $1", "No se ha podido copiar: $1"),
    'noShare': ("This browser can’t share files. Use “Copy” and paste with Ctrl+V.", "Este navegador no permite compartir archivos. Usa «Copiar» y pega con Ctrl+V."),
    'shareFail': ("Couldn’t share: $1", "No se ha podido compartir: $1"),
    'assemblingFull': ("Assembling the whole map…", "Montando el mapa entero…"),
    'downloaded': ("Downloaded.", "Descargado."),
    'fullSuffix': (" (whole)", " (entero)"),
    'deleteMap': ("Delete map", "Borrar mapa"),
    'confirmDelete': ("Delete “$1” and its strokes?", "¿Borrar «$1» y sus trazos?"),
    'noMaps': ("No maps yet.", "Todavía no hay mapas."),
    'untitled': ("Untitled", "Sin nombre"),
    'empty': ("Open a map and press Alt+Shift+M (or the extension icon).", "Abre un mapa y pulsa Alt+Shift+M (o el icono de la extensión)."),
    'tGallery': ("My maps (G)", "Mis mapas (G)"),
    'tPan': ("Pan (H) · also Space, right button or middle button", "Mover (H) · también espacio, botón derecho o rueda pulsada"),
    'tPen': ("Pencil (P)", "Lápiz (P)"),
    'tLine': ("Line (L) · Shift snaps the angle", "Línea (L) · Mayús fija el ángulo"),
    'tArrow': ("Arrow (A) · Shift snaps the angle", "Flecha (A) · Mayús fija el ángulo"),
    'tRect': ("Rectangle (R) · Shift = square", "Rectángulo (R) · Mayús = cuadrado"),
    'tCircle': ("Circle (C)", "Círculo (C)"),
    'tText': ("Text (T)", "Texto (T)"),
    'tErase': ("Erase stroke (E)", "Borrar trazo (E)"),
    'tColor': ("Other color", "Otro color"),
    'tWidth': ("Thickness", "Grosor"),
    'tUndo': ("Undo (Ctrl+Z)", "Deshacer (Ctrl+Z)"),
    'tRedo': ("Redo (Ctrl+Y)", "Rehacer (Ctrl+Y)"),
    'tFit': ("Fit (F)", "Encajar (F)"),
    'tClear': ("Delete all strokes", "Borrar todos los trazos"),
    'tShare': ("Copy, download or share (Ctrl+C copies what’s visible)", "Copiar, descargar o compartir (Ctrl+C copia lo que se ve)"),
    'tSource': ("Open the original site", "Abrir la web original"),
    'mCopyView': ("📋 Copy what’s visible", "📋 Copiar lo que se ve"),
    'mCopyFull': ("📋 Copy the whole map", "📋 Copiar el mapa entero"),
    'mDlView': ("⬇ Download what’s visible", "⬇ Descargar lo que se ve"),
    'mDlFull': ("⬇ Download the whole map", "⬇ Descargar el mapa entero"),
    'mShare': ("📤 Share what’s visible…", "📤 Compartir lo que se ve…"),
    'mHint': ("For Discord, TeamSpeak or WhatsApp: copy and paste into the chat with Ctrl+V.", "Para Discord, TeamSpeak o WhatsApp: copia y pega en el chat con Ctrl+V."),
}

root = os.path.join(os.path.dirname(__file__), '..', 'src', '_locales')

# Más idiomas: tools/i18n-more.py, una línea "clave|texto" por mensaje (mismas claves que M).
here = os.path.dirname(os.path.abspath(__file__))
more = {}
exec(open(os.path.join(here, 'i18n-more.py'), encoding='utf-8').read(), more)
TABLES = {'en': {k: v[0] for k, v in M.items()}, 'es': {k: v[1] for k, v in M.items()}}
for loc, block in more['LANGS'].items():
    t = {}
    for line in block.split('\n'):
        if line.strip():
            k, v = line.split('|', 1)  # el texto se guarda tal cual: " (entero)" lleva espacio delante
            t[k] = v
    missing, extra = set(M) - set(t), set(t) - set(M)
    assert not missing and not extra, (loc, sorted(missing), sorted(extra))
    for k in M:
        assert set(re.findall(r'\$\d', t[k])) == set(re.findall(r'\$\d', M[k][0])), (loc, k)
    assert len(t['extDesc']) <= 132, (loc, 'extDesc', len(t['extDesc']))  # tope de Chrome
    TABLES[loc] = t

for loc, table in TABLES.items():
    out = {}
    for k, msg in table.items():
        n = len(set(re.findall(r'\$(\d)', msg)))
        if n:  # Chrome/Firefox: $1 en el texto → placeholder $P1$ con contenido $1
            out[k] = {'message': re.sub(r'\$(\d)', r'$P\1$', msg), 'placeholders': {f'p{j}': {'content': f'${j}'} for j in range(1, n + 1)}}
        else:
            out[k] = {'message': msg}
    os.makedirs(os.path.join(root, loc), exist_ok=True)
    with open(os.path.join(root, loc, 'messages.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
print(len(M), 'textos ×', len(TABLES), 'idiomas en', root)
