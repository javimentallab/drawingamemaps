// Vigilante semanal de drawingamemaps.
//  1. Vuelve a probar todos los mapas de la carpeta de marcadores "mapas" de Brave → detecta webs
//     que dejan de funcionar (comparando con la semana anterior).
//  2. Descubre juegos nuevos en Map Genie, th.gl y Shackmaps y prueba su mapa.
//  3. Mira los más jugados de Steam y avisa de los populares que no tienen mapa conocido.
//  4. Deja un informe HTML en runs/<fecha>/ y manda un resumen por ntfy.
// Uso: node vigilante.js [--sin-aviso] [--solo-descubrir] [--solo-nuevos]
const fs = require('fs'), path = require('path'), { spawn, execFileSync } = require('child_process');

const DIR = __dirname;
const EXT_SRC = path.join(DIR, '..', '..', 'src');
const BOOKMARKS = path.join(process.env.LOCALAPPDATA, 'BraveSoftware', 'Brave-Browser', 'User Data', 'Default', 'Bookmarks');
const NOTIFY = 'C:\\Users\\javimental\\Scripts\\notify.ps1';
const STATE = path.join(DIR, 'state.json');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';
const PARALLEL = 3, MAX_NEW = 15;
const args = new Set(process.argv.slice(2));
const today = new Date().toISOString().slice(0, 10);
const runDir = path.join(DIR, 'runs', today);
fs.mkdirSync(runDir, { recursive: true });
const log = (...a) => { const l = `[${new Date().toLocaleTimeString('es-ES')}] ${a.join(' ')}`; console.log(l); fs.appendFileSync(path.join(runDir, 'log.txt'), l + '\n'); };

const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};
state.known ??= {};
state.results ??= {};
state.pending ??= [];
state.steamNames ??= {};
state.steamReported ??= [];
const baseline = !state.known.mapgenie;

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.text();
}
const uniq = (a) => [...new Set(a)];
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- fuentes ----------

function bookmarkMaps() {
  const b = JSON.parse(fs.readFileSync(BOOKMARKS, 'utf8'));
  const f = b.roots.bookmark_bar.children.find((c) => c.type === 'folder' && c.name.toLowerCase() === 'mapas');
  return (f?.children || []).filter((c) => c.type === 'url').map((c) => ({ name: c.name, url: c.url, source: 'marcadores' }));
}

const MG_SKIP = new Set(['login', 'register', 'about', 'contact', 'privacy-policy', 'terms', 'terms-of-service', 'pro', 'blog', 'faq', 'search', 'games', 'account', 'tos', 'upgrade', 'dmca', 'cookies']);
async function discoverMapGenie() {
  const html = await get('https://mapgenie.io/');
  return uniq([...html.matchAll(/href="https:\/\/mapgenie\.io\/([a-z0-9-]+)"/g)].map((m) => m[1])).filter((s) => !MG_SKIP.has(s));
}
async function mapGenieMapUrl(s) {
  const html = await get(`https://mapgenie.io/${s}`);
  const m = html.match(new RegExp(`https://mapgenie\\.io/${s}/maps/[a-z0-9-]+`));
  return m?.[0] || null;
}

const TH_SKIP = new Set(['www', 'a', 'app', 'static', 'cdn', 'api', 'aeternum-tracker', 'status', 'docs']);
async function discoverThgl() {
  const html = await get('https://www.th.gl/');
  return uniq([...html.matchAll(/https:\/\/([a-z0-9-]+)\.th\.gl/g)].map((m) => m[1])).filter((s) => !TH_SKIP.has(s));
}
async function thglMapUrl(sub) {
  const html = await get(`https://${sub}.th.gl/`);
  const m = html.match(/href="(\/maps\/[^"#?]+)"/);
  return m ? `https://${sub}.th.gl${m[1]}` : null;
}

async function discoverShackmaps() {
  const xml = await get('https://www.shackmaps.com/sitemap.xml');
  // Páginas de mapa concretas: /juego/mapa (las de juego a secas son índices).
  return uniq([...xml.matchAll(/<loc>(https:\/\/www\.shackmaps\.com\/[a-z0-9-]+\/[a-z0-9-]+)\/?<\/loc>/g)].map((m) => m[1]))
    .filter((u) => !/\/(about|faq|privacy-policy|terms-of-service|forum)\//.test(u));
}

async function steamTop() {
  const j = JSON.parse(await get('https://api.steampowered.com/ISteamChartsService/GetGamesByConcurrentPlayers/v1/'));
  const ranks = j.response.ranks.slice(0, 100);
  for (const r of ranks) {
    if (state.steamNames[r.appid]) continue;
    try {
      const d = JSON.parse(await get(`https://store.steampowered.com/api/appdetails?appids=${r.appid}&filters=basic,categories`))[r.appid];
      const cats = d?.data?.categories?.map((c) => c.id) || [];
      state.steamNames[r.appid] = { name: d?.data?.name || '?', mp: cats.some((c) => [1, 9, 36, 38, 49].includes(c)) };
    } catch { state.steamNames[r.appid] = { name: '?', mp: false }; }
  }
  return ranks.map((r) => ({ appid: r.appid, players: r.concurrent_in_game, ...state.steamNames[r.appid] }));
}

// ---------- pruebas ----------

function prepareExtension() {
  const dst = path.join(DIR, 'ext');
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(EXT_SRC, dst, { recursive: true });
  const mf = path.join(dst, 'manifest.json');
  const m = JSON.parse(fs.readFileSync(mf, 'utf8'));
  m.host_permissions = ['<all_urls>']; // en pruebas no hay nadie para aceptar el permiso
  fs.writeFileSync(mf, JSON.stringify(m, null, 2));
  return m.version;
}

function runOne(item, tag) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [path.join(DIR, 'harness.js'), item.url, runDir, tag], { cwd: DIR, windowsHide: true });
    let out = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (out += d));
    const kill = setTimeout(() => p.kill(), 9 * 60 * 1000);
    p.on('close', () => {
      clearTimeout(kill);
      const line = out.split('\n').find((l) => l.startsWith('RESULT '));
      const r = line ? JSON.parse(line.slice(7)) : { url: item.url, ok: false, error: 'El probador no respondió' };
      resolve({ ...item, ...r, tag });
    });
  });
}

async function runAll(items) {
  const out = [];
  let i = 0;
  await Promise.all([...Array(PARALLEL)].map(async () => {
    while (i < items.length) {
      const k = i++;
      const r = await runOne(items[k], 'm' + String(k).padStart(3, '0'));
      log(r.ok ? 'OK ' : (r.blocked ? 'BLOQ' : 'MAL'), r.name, '·', r.ok ? `${r.kind} ${r.w}×${r.h}` : r.error);
      out.push(r);
    }
  }));
  return out;
}

// ---------- informe ----------

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function writeReport(sections, version) {
  const row = (r) => `<tr class="${r.ok ? 'ok' : r.blocked ? 'bloq' : 'mal'}"><td>${r.ok ? '✅' : r.blocked ? '🔒' : r.kind === 'captura' ? '📷' : '❌'}</td>
<td><a href="${esc(r.url)}">${esc(r.name)}</a><br><small>${esc(r.source)}${r.change ? ' · <b>' + esc(r.change) + '</b>' : ''}</small></td>
<td>${r.ok ? esc(`${r.option} · ${r.kind} · ${r.w}×${r.h} px`) : esc(r.error)}</td><td>${r.seconds ?? ''} s</td>
<td>${fs.existsSync(path.join(runDir, r.tag + '.jpg')) ? `<a href="${r.tag}.jpg"><img src="${r.tag}.jpg"></a>` : ''}</td></tr>`;
  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Vigilante drawingamemaps ${today}</title>
<style>body{font:14px system-ui;background:#18181b;color:#e8e8ea;margin:20px}table{border-collapse:collapse;width:100%;margin-bottom:28px}
td{border-bottom:1px solid #333;padding:6px;vertical-align:top}img{height:70px;border-radius:4px}a{color:#4da3ff}small{color:#999}
tr.mal td:first-child,tr.bloq td:first-child{font-size:18px}h2{margin-top:28px}</style>
<h1>Vigilante drawingamemaps · ${today}</h1><p>Extensión v${esc(version)}</p>
${sections.map(([t, rows, extra]) => `<h2>${esc(t)}</h2>${extra || ''}${rows.length ? `<table>${rows.map(row).join('')}</table>` : '<p>Nada.</p>'}`).join('')}</html>`;
  fs.writeFileSync(path.join(runDir, 'informe.html'), html);
  fs.writeFileSync(path.join(DIR, 'ultimo-informe.html'), html.replace(/(src|href)="(m\d{3}\.jpg)"/g, `$1="runs/${today}/$2"`));
}

function notify(title, msg) {
  if (args.has('--sin-aviso')) return log('(aviso omitido)', title, msg);
  try {
    execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', NOTIFY, '-Title', title, '-Message', msg, '-Reintentos', '3'], { windowsHide: true, timeout: 300000 });
  } catch (e) { log('ntfy falló:', e.message); }
}

// ---------- principal ----------

(async () => {
  log('Inicio', baseline ? '(primera vez: se crea la línea base)' : '');
  const version = prepareExtension();

  // Descubrimiento
  const found = { mapgenie: [], thgl: [], shackmaps: [] };
  for (const [k, fn] of [['mapgenie', discoverMapGenie], ['thgl', discoverThgl], ['shackmaps', discoverShackmaps]]) {
    try { found[k] = await fn(); log(k, found[k].length, 'entradas'); } catch (e) { log(k, 'falló:', e.message); }
  }
  const newOnes = [];
  if (!baseline) {
    for (const s of found.mapgenie.filter((s) => !state.known.mapgenie.includes(s))) newOnes.push({ name: `Map Genie: ${s}`, resolve: () => mapGenieMapUrl(s), source: 'Map Genie (nuevo)' });
    for (const s of found.thgl.filter((s) => !state.known.thgl.includes(s))) newOnes.push({ name: `th.gl: ${s}`, resolve: () => thglMapUrl(s), source: 'th.gl (nuevo)' });
    for (const u of found.shackmaps.filter((u) => !state.known.shackmaps.includes(u))) newOnes.push({ name: `Shackmaps: ${u.split('/').slice(-2).join(' / ')}`, resolve: async () => u, source: 'Shackmaps (nuevo)' });
  }
  for (const k of Object.keys(found)) if (found[k].length) state.known[k] = uniq([...(state.known[k] || []), ...found[k]]);
  // Cada juego nuevo → URL de su mapa concreto (la portada de cada juego suele ser un índice).
  const queue = [...state.pending];
  for (const item of newOnes) {
    try {
      const url = await item.resolve();
      if (url) queue.push({ name: item.name, url, source: item.source });
      else log('Sin página de mapa:', item.name);
    } catch (e) { log('No se pudo resolver', item.name, e.message); }
  }
  const toTest = queue.slice(0, MAX_NEW);
  state.pending = queue.slice(MAX_NEW); // los que no caben esperan a la próxima semana

  // Steam
  let popularSinMapa = [];
  if (!args.has('--solo-descubrir')) {
    try {
      const top = await steamTop();
      const covered = [...state.known.mapgenie, ...state.known.thgl, ...bookmarkMaps().map((b) => slug(b.name))];
      popularSinMapa = top.filter((g) => g.mp && g.name !== '?')
        .filter((g) => { const s = slug(g.name).replace(/-(battlegrounds|remastered|enhanced|legacy)$/, ''); return !covered.some((c) => c.includes(s) || s.includes(c.split('-').slice(0, 2).join('-'))); })
        .filter((g) => !state.steamReported.includes(g.appid));
      state.steamReported = uniq([...state.steamReported, ...popularSinMapa.map((g) => g.appid)]);
    } catch (e) { log('Steam falló:', e.message); }
  }

  // Pruebas
  const marks = args.has('--solo-descubrir') || args.has('--solo-nuevos') ? [] : bookmarkMaps();
  log('Probando', marks.length, 'marcadores y', toTest.length, 'nuevos');
  const results = await runAll([...marks, ...toTest]);
  for (const r of results) {
    const prev = state.results[r.url];
    if (prev?.ok && !r.ok && !r.blocked) r.change = 'SE HA ROTO (la semana pasada funcionaba)';
    else if (prev && !prev.ok && r.ok) r.change = 'arreglado';
    state.results[r.url] = { ok: r.ok, kind: r.kind, w: r.w, h: r.h, date: today };
  }
  fs.writeFileSync(STATE, JSON.stringify(state, null, 1));

  const rMarks = results.filter((r) => r.source === 'marcadores'), rNew = results.filter((r) => r.source !== 'marcadores');
  const broken = rMarks.filter((r) => r.change?.startsWith('SE HA ROTO'));
  const steamHtml = popularSinMapa.length ? `<ul>${popularSinMapa.map((g) => `<li>${esc(g.name)} · ${g.players.toLocaleString('es-ES')} jugadores ahora</li>`).join('')}</ul>` : '';
  writeReport([
    ['Tus mapas (carpeta «mapas»)', rMarks.sort((a, b) => a.ok - b.ok)],
    ['Juegos nuevos en Map Genie / th.gl / Shackmaps', rNew],
    ['Populares en Steam sin mapa conocido', [], steamHtml || '<p>Ninguno nuevo.</p>'],
  ], version);

  const okM = rMarks.filter((r) => r.ok).length;
  let msg = `Tus mapas: ${okM}/${rMarks.length} bajan entero.`;
  if (broken.length) msg += `\n⚠️ Se han roto: ${broken.map((r) => r.name).join(', ')}`;
  if (baseline) msg += `\nLínea base creada (${state.known.mapgenie.length} Map Genie, ${state.known.thgl.length} th.gl, ${state.known.shackmaps.length} Shackmaps).`;
  else if (rNew.length) msg += `\nNuevos: ${rNew.map((r) => `${r.ok ? '✅' : '❌'} ${r.name}`).join(', ')}`;
  else msg += '\nSin juegos nuevos en las plataformas.';
  if (popularSinMapa.length) msg += `\nPopulares sin mapa: ${popularSinMapa.slice(0, 6).map((g) => g.name).join(', ')}`;
  msg += `\nInforme: ${path.join(DIR, 'ultimo-informe.html')}`;
  log(msg.replace(/\n/g, ' | '));
  notify('drawingamemaps · vigilante', msg);
  log('Fin');
})().catch((e) => { log('ERROR', e.stack); notify('drawingamemaps · vigilante', 'El vigilante ha fallado: ' + e.message); process.exit(1); });
