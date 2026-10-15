// Prueba drawingamemaps contra UNA web de mapa en un Brave sin ventana con perfil propio
// (no toca el Brave del usuario). Uso: node harness.js <url> <carpetaSalida> <etiqueta>
// Imprime al final una línea "RESULT {json}".
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');

const [url, outDir, tag] = process.argv.slice(2);
const EXT = path.join(__dirname, 'ext'); // copia de la extensión con host_permissions (la prepara vigilante.js)
const BRAVE = 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe';
const res = { url, tag, ok: false, kind: null, options: [], w: null, h: null, error: null, seconds: 0 };
const t0 = Date.now();

async function main() {
  const prof = path.join(__dirname, 'profiles', tag);
  fs.rmSync(prof, { recursive: true, force: true });
  const ctx = await chromium.launchPersistentContext(prof, {
    executablePath: BRAVE, headless: false, viewport: { width: 1280, height: 720 },
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`, '--headless=new', ...(process.env.UILANG ? [`--lang=${process.env.UILANG}`] : [])],
  });
  try {
    const sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker', { timeout: 15000 });
    const extId = new URL(sw.url()).host;
    const page = ctx.pages()[0] || await ctx.newPage();
    await page.goto(url, { waitUntil: 'commit', timeout: 60000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(15000);
    res.title = await page.title();
    if (/just a moment|un momento|attention required|access denied/i.test(res.title)) {
      res.error = 'Bloqueado por Cloudflare/antibots en el navegador de pruebas (en un Brave normal puede ir)';
      res.blocked = true;
      return;
    }
    const tabId = await sw.evaluate(async (u) => (await chrome.tabs.query({})).find((t) => t.url === u)?.id, page.url());
    const openPop = async () => {
      const p = await ctx.newPage();
      await p.goto(`chrome-extension://${extId}/popup.html?tab=${tabId}`);
      await p.waitForSelector('.opt', { timeout: 30000 });
      await p.waitForTimeout(500);
      res.options = await p.$$eval('.opt', (bs) => bs.map((b) => b.querySelector('b').textContent));
      return p;
    };
    let pop = await openPop();
    let main = await pop.$eval('.opt.main', (b) => b.dataset.kind);
    if (main === 'capture') {
      // Mismo camino que "Recargar y analizar": el registro temprano ya quedó puesto al abrir el popup.
      await pop.close();
      await page.reload({ waitUntil: 'commit', timeout: 60000 });
      await page.waitForTimeout(15000);
      pop = await openPop();
      main = await pop.$eval('.opt.main', (b) => b.dataset.kind);
    }
    if (main === 'capture') {
      res.kind = 'captura';
      res.error = 'Solo captura: no se detecta mapa descargable';
      await page.screenshot({ path: path.join(outDir, tag + '.jpg'), type: 'jpeg', quality: 70 });
      return;
    }
    const mainLabel = await pop.$eval('.opt.main b', (b) => b.textContent);
    const edP = ctx.waitForEvent('page', { timeout: 20000 });
    await pop.click('.opt.main');
    const ed = await edP;
    await ed.setViewportSize({ width: 1280, height: 720 });
    const r = await Promise.race([
      ed.waitForSelector('#jobGo:not([hidden])', { timeout: 150000 }).then(() => 'go'),
      ed.waitForFunction(() => !location.hash.startsWith('#job='), null, { timeout: 150000 }).then(() => 'done'),
    ]);
    if (r === 'go') {
      // Nivel moderado para que la prueba sea rápida: el mayor con ≤1024 teselas (o 8192 px si es SVG).
      if (await ed.$('#jobBody input[name=res]')) await ed.check('#jobBody input[value="8192"]');
      else {
        const vals = await ed.$$eval('#jobBody label', (ls) => ls.map((l) => [l.querySelector('input').value, +l.dataset.tiles || 0]));
        let v = vals[0][0];
        for (const [z, n] of vals) if (n <= 1024) v = z;
        await ed.check(`#jobBody input[value="${v}"]`);
      }
      await ed.click('#jobGo');
    }
    await ed.waitForFunction(() => !location.hash.startsWith('#job='), null, { timeout: 400000 });
    const msg = await ed.$eval('#jobMsg', (e) => e.textContent);
    const m = await ed.evaluate(async () => {
      const db = await import('./db.js');
      const meta = await db.getMeta(location.hash.slice(1));
      return meta && { kind: meta.kind, w: meta.w, h: meta.h, tiles: !!meta.tiles };
    });
    if (!m) { res.error = 'La descarga no terminó: ' + msg; return; }
    res.kind = m.tiles ? 'teselas' : 'imagen';
    res.option = mainLabel;
    res.w = Math.round(m.w);
    res.h = Math.round(m.h);
    await ed.waitForTimeout(3000);
    await ed.screenshot({ path: path.join(outDir, tag + '.jpg'), type: 'jpeg', quality: 70 });
    res.ok = res.w > 300 && res.h > 300;
    if (!res.ok) res.error = `Mapa demasiado pequeño (${res.w}×${res.h})`;
  } finally {
    await ctx.close().catch(() => {});
    fs.rmSync(prof, { recursive: true, force: true });
  }
}

main()
  .catch((e) => { res.error = (res.error ? res.error + ' · ' : '') + e.message.split('\n')[0]; })
  .finally(() => { res.seconds = Math.round((Date.now() - t0) / 1000); console.log('RESULT ' + JSON.stringify(res)); });
