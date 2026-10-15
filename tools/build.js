// Genera los paquetes publicables a partir de src/ (que es la versión Chromium):
//   dist/chromium/  + dist/drawingamemaps-chromium-<versión>.zip   → Chrome Web Store, Edge, Brave, Opera…
//   dist/firefox/   + dist/drawingamemaps-firefox-<versión>.zip    → addons.mozilla.org (Firefox, Zen, LibreWolf…)
// Uso: node tools/build.js
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const GECKO_ID = 'drawingamemaps@javimentallab';

const manifest = JSON.parse(fs.readFileSync(path.join(SRC, 'manifest.json'), 'utf8'));
const version = manifest.version;

function copySrc(dst) {
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(SRC, dst, { recursive: true, filter: (p) => !/(^|[\\/])\.|\.bak$/.test(path.basename(p)) });
}

function zip(dir, out) {
  fs.rmSync(out, { force: true });
  // tar de Windows (bsdtar) sabe hacer zip; los ficheros quedan en la raíz del zip, como piden las tiendas.
  // (se listan los ficheros en vez de "." para que no queden rutas "./manifest.json", que AMO rechaza)
  execFileSync(path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe'), ['-a', '-c', '-f', out, '-C', dir, ...fs.readdirSync(dir)]);
}

fs.mkdirSync(DIST, { recursive: true });

// ---------- Chromium ----------
const chromium = path.join(DIST, 'chromium');
copySrc(chromium);
zip(chromium, path.join(DIST, `drawingamemaps-chromium-${version}.zip`));

// ---------- Firefox ----------
// Diferencias con Chromium:
//  · Firefox (MV3) no admite service_worker en segundo plano: usa background.scripts.
//  · Necesita un id fijo (browser_specific_settings.gecko) y declarar que no recoge datos.
//  · Su espacio de nombres con promesas es `browser`; el shim hace que el código use ese.
const firefox = path.join(DIST, 'firefox');
copySrc(firefox);
const fx = structuredClone(manifest);
fx.background = { scripts: ['browser-shim.js', 'background.js'] };
fx.browser_specific_settings = {
  gecko: {
    id: GECKO_ID,
    strict_min_version: '128.0', // scripting con world MAIN y declarativeNetRequest completos
    data_collection_permissions: { required: ['none'] },
  },
};
fs.writeFileSync(path.join(firefox, 'manifest.json'), JSON.stringify(fx, null, 2) + '\n');
fs.writeFileSync(path.join(firefox, 'browser-shim.js'),
  `// Firefox: usar la API "browser" (promesas) también donde el código dice "chrome".
if (typeof browser !== 'undefined' && globalThis.chrome !== browser) {
  try { globalThis.chrome = browser; } catch {}
  if (globalThis.chrome !== browser) Object.defineProperty(globalThis, 'chrome', { value: browser, configurable: true });
}
`);
for (const page of ['popup.html', 'editor.html']) {
  const f = path.join(firefox, page);
  const html = fs.readFileSync(f, 'utf8');
  if (!html.includes('browser-shim.js')) fs.writeFileSync(f, html.replace('<script type="module"', '<script src="browser-shim.js"></script>\n<script type="module"'));
}
zip(firefox, path.join(DIST, `drawingamemaps-firefox-${version}.zip`));

console.log(`drawingamemaps ${version}:`);
for (const f of fs.readdirSync(DIST)) console.log('  dist/' + f + (f.endsWith('.zip') ? `  (${Math.round(fs.statSync(path.join(DIST, f)).size / 1024)} KB)` : '/'));
