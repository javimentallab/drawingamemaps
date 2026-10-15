import { inferTemplates } from './tiles.js';
import { saveSnap } from './db.js';
import { t, localizeHtml } from './i18n.js';

const $ = (id) => document.getElementById(id);

// Se ejecuta dentro de la página (y sus iframes). Recoge URLs cargadas y tamaños de imágenes grandes.
// El observador se queda puesto: si el usuario mueve el mapa, la próxima vez habrá más URLs.
async function detect() {
  const st = (window.__dgm ||= { urls: new Set() });
  if (!st.obs) {
    try { performance.setResourceTimingBufferSize(20000); } catch {}
    try {
      st.obs = new PerformanceObserver((l) => { for (const e of l.getEntries()) st.urls.add(e.name); });
      st.obs.observe({ type: 'resource', buffered: true });
    } catch {}
  }
  for (const e of performance.getEntriesByType('resource')) st.urls.add(e.name);
  const sizes = new Map();
  for (const im of document.images) {
    const u = im.currentSrc || im.src;
    if (!u) continue;
    st.urls.add(u);
    if (im.naturalWidth) sizes.set(u, [im.naturalWidth, im.naturalHeight]);
  }
  // Imagen que ocupa buena parte de la pantalla (como <img> o como fondo CSS): seguramente es el
  // mapa aunque sea mediana (Wowhead pone mapas de zona de ~1000 px como fondo de un div).
  const onScreen = new Set(), area = innerWidth * innerHeight;
  for (const el of document.querySelectorAll('img, div, section, figure, a, span')) {
    const r = el.getBoundingClientRect();
    if (r.width * r.height < area * 0.15 || r.bottom < 0 || r.top > innerHeight) continue;
    let u = el.tagName === 'IMG' ? el.currentSrc || el.src : null;
    if (!u) {
      const m = getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
      if (m) try { u = new URL(m[1], location.href).href; } catch {}
    }
    if (u && /^https?:/.test(u)) { onScreen.add(u); st.urls.add(u); }
  }
  const urls = [...st.urls].filter((u) => /^https?:/.test(u));
  // Imágenes cargadas por canvas/WebGL no están en el DOM: medirlas (salen de la caché).
  const tileLike = /\/-?\d+[\/_-]-?\d+[^\/]*\.\w+(\?|$)/;
  const cand = [...new Set([...onScreen, ...urls.filter((u) => /\.(png|jpe?g|webp|avif|gif)(\?|#|$)/i.test(u) && !tileLike.test(u)).slice(0, 80)])].filter((u) => !sizes.has(u));
  await Promise.all(cand.map((u) => new Promise((res) => {
    const im = new Image();
    const to = setTimeout(res, 2500);
    im.onload = () => { sizes.set(u, [im.naturalWidth, im.naturalHeight]); clearTimeout(to); res(); };
    im.onerror = () => { clearTimeout(to); res(); };
    im.src = u;
  })));
  const isSvg = (u) => /\.svg(\?|#|$)/i.test(u);
  const big = [...sizes].filter(([u, [w, h]]) => !isSvg(u) && (w * h >= 1.5e6 || Math.max(w, h) >= 2000 || (onScreen.has(u) && Math.max(w, h) >= 500))).map(([url, [w, h]]) => ({ url, w, h, screen: onScreen.has(url) }));
  // SVG grandes (mapas vectoriales). Los iconos pesan poco; un mapa, cientos de KB.
  const svgs = [];
  for (const u of urls.filter(isSvg).slice(0, 15)) {
    try {
      const t = await (await fetch(u)).text();
      if (t.length < 80000) continue;
      const tag = t.match(/<svg\b[^>]*>/i);
      if (!tag) continue;
      const num = (re) => { const m = tag[0].match(re); return m ? parseFloat(m[1]) : 0; };
      let w = num(/\swidth\s*=\s*["']([\d.]+)(?!%)["']/i), h = num(/\sheight\s*=\s*["']([\d.]+)(?!%)["']/i);
      const vb = tag[0].match(/viewBox\s*=\s*["']([^"']+)/i);
      if (!(w && h) && vb) [, , w, h] = vb[1].split(/[\s,]+/).map(Number);
      if (w && h) svgs.push({ url: u, w: Math.round(w), h: Math.round(h), bytes: t.length });
    } catch {}
  }
  return { urls: urls.slice(-6000), big, svgs, full: performance.getEntriesByType('resource').length >= 250, title: document.title, url: location.href };
}

async function activeTab() {
  const q = new URLSearchParams(location.search).get('tab'); // para pruebas: popup.html?tab=ID
  if (q) return chrome.tabs.get(+q);
  const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
  return t;
}

// Registro temprano por web: tras recargar, la página guarda todas las entradas de recursos.
const earlyId = (origin) => 'early-' + [...origin].map((c) => c.charCodeAt(0).toString(36)).join('').slice(0, 80);
async function ensureEarly(origin) {
  const id = earlyId(origin);
  if ((await chrome.scripting.getRegisteredContentScripts({ ids: [id] })).length) return;
  await chrome.scripting.registerContentScripts([{ id, matches: [origin + '/*'], js: ['early.js'], runAt: 'document_start', world: 'MAIN', allFrames: true, persistAcrossSessions: true }]);
}

async function reloadAndAnalyze(tab) {
  const origin = new URL(tab.url).origin;
  // Si el popup se cierra con el diálogo de permiso, al reabrirlo se registra solo (ver main).
  if (!(await chrome.permissions.request({ origins: [origin + '/*'] }))) return;
  await ensureEarly(origin);
  await chrome.tabs.reload(tab.id);
  window.close();
}

async function startJob(job) {
  const id = crypto.randomUUID();
  await chrome.storage.session.set({ ['job:' + id]: job });
  await chrome.tabs.create({ url: chrome.runtime.getURL('editor.html#job=' + id) });
  window.close();
}

async function captureVisible(tab) {
  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
  const blob = await (await fetch(dataUrl)).blob();
  const bmp = await createImageBitmap(blob);
  const tw = 320, th = Math.round(bmp.height * tw / bmp.width);
  const oc = new OffscreenCanvas(tw, th);
  oc.getContext('2d').drawImage(bmp, 0, 0, tw, th);
  const thumb = await oc.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
  let host = '';
  try { host = new URL(tab.url).hostname; } catch {}
  const id = crypto.randomUUID();
  await saveSnap({ id, ts: Date.now(), kind: 'image', name: tab.title || host || 'Mapa', url: tab.url || '', host, w: bmp.width, h: bmp.height, thumb, shapes: [] }, blob);
  bmp.close();
  await chrome.tabs.create({ url: chrome.runtime.getURL('editor.html#' + id), index: tab.index + 1 });
  window.close();
}

function option(kind, title, sub, onclick, main) {
  const b = document.createElement('button');
  b.className = 'opt' + (main ? ' main' : '');
  b.dataset.kind = kind; // tiles | svg | image | capture (lo usan las pruebas, no depende del idioma)
  const h = document.createElement('b');
  h.textContent = title;
  const s = document.createElement('span');
  s.textContent = sub;
  b.append(h, s);
  b.onclick = async () => {
    b.disabled = true;
    try { await onclick(); } catch (e) { s.textContent = t('errorX', e.message); b.disabled = false; }
  };
  return b;
}

async function main() {
  const tab = await activeTab();
  const list = $('list');
  let origin = null;
  try { origin = new URL(tab.url).origin; } catch {}
  if (origin?.startsWith('http') && await chrome.permissions.contains({ origins: [origin + '/*'] })) await ensureEarly(origin).catch(() => {});
  $('reload').onclick = () => reloadAndAnalyze(tab);
  let found = { urls: [], big: [], svgs: [], title: tab.title, url: tab.url };
  try {
    const res = await chrome.scripting.executeScript({ target: { tabId: tab.id, allFrames: true }, func: detect });
    for (const r of res) {
      if (!r.result) continue;
      found.urls.push(...r.result.urls);
      found.big.push(...r.result.big);
      found.svgs.push(...r.result.svgs);
      found.full ||= r.result.full;
    }
  } catch (e) {
    list.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'dim';
    p.textContent = t('noAccess');
    list.append(p);
    return;
  }

  const templates = inferTemplates(found.urls).slice(0, 2);
  const bigs = [...new Map(found.big.map((b) => [b.url, b])).values()].sort((a, b) => (b.screen - a.screen) || (b.w * b.h - a.w * a.h)).slice(0, 2);
  const base = { title: tab.title || '', url: tab.url || '' };
  list.replaceChildren();

  templates.forEach((tp, i) => {
    const host = new URL(tp.origin).hostname;
    list.append(option('tiles', t('optTiles'), t('optTilesSub', host, tp.count), () =>
      startJob({ ...base, type: 'tiles', tmpl: { ...tp, samples: tp.samples.slice(0, 40) } }), i === 0));
  });
  const svgs = [...new Map(found.svgs.map((b) => [b.url, b])).values()].sort((a, b) => b.bytes - a.bytes).slice(0, 2);
  svgs.forEach((b, i) => {
    const file = decodeURIComponent(new URL(b.url).pathname.split('/').pop());
    list.append(option('svg', t('optSvg'), t('optSvgSub', file, Math.round(b.bytes / 1024)),
      () => startJob({ ...base, type: 'svg', src: b.url }), !templates.length && i === 0));
  });
  bigs.forEach((b, i) => {
    const file = decodeURIComponent(new URL(b.url).pathname.split('/').pop());
    list.append(option('image', t('optImage', `${b.w}×${b.h}`), file, () => startJob({ ...base, type: 'image', src: b.url, w: b.w, h: b.h }), !templates.length && !svgs.length && i === 0));
  });
  list.append(option('capture', t('optCapture'), t('optCaptureSub'), () => captureVisible(tab), !templates.length && !bigs.length && !svgs.length));
  if (!templates.length) $('hint').hidden = false;
  if (found.full && !templates.length && !svgs.length) $('reload').classList.add('strong');
}

localizeHtml();
$('gallery').onclick = () => { chrome.tabs.create({ url: chrome.runtime.getURL('editor.html') }); window.close(); };
main();
