// Trabajos de descarga lanzados desde el popup: permiso de host → análisis → elegir nivel → descarga.
import * as db from './db.js';
import { t, num } from './i18n.js';
import { prober, resolveZoom, explore, levelInfo, downloadLevels, detectOrientation, readDzi, fetchImage, tileUrl } from './tiles.js';

const $ = (id) => document.getElementById(id);
const box = $('job'), msg = $('jobMsg'), body = $('jobBody'), bar = $('jobBar'), go = $('jobGo'), cancel = $('jobCancel');

let unsetRef = null;
const say = (t) => { msg.textContent = t; };
const fmtPx = (w, h) => `${num(Math.round(w))}×${num(Math.round(h))} px`;
const fmtMb = (mb) => (mb < 1 ? '<1 MB' : mb < 1024 ? `~${Math.round(mb)} MB` : `~${(mb / 1024).toFixed(1)} GB`);
const hostOf = (u) => { try { return new URL(u).hostname; } catch { return ''; } };

function waitClick(btn) {
  return new Promise((res) => { btn.onclick = () => res(); });
}

async function ensurePermission(origin) {
  const origins = [origin + '/*'];
  if (await chrome.permissions.contains({ origins })) return true;
  say(t('needPerm', new URL(origin).hostname));
  body.replaceChildren();
  const b = document.createElement('button');
  b.className = 'main';
  b.textContent = t('grant');
  body.append(b);
  for (;;) {
    await waitClick(b);
    if (await chrome.permissions.request({ origins })) { body.replaceChildren(); return true; }
    say(t('permDenied'));
  }
}

// Muchas webs protegen sus teselas contra "hotlinking": solo responden si el Referer es la web
// del mapa. Mientras dura la descarga, las peticiones de esta pestaña a ese host lo llevan.
async function setReferer(job, origin) {
  const tab = await chrome.tabs.getCurrent();
  let ref;
  try {
    const page = new URL(job.url);
    ref = page.origin === origin ? job.url : page.origin + '/';
  } catch { return async () => {}; }
  const rule = {
    id: tab.id,
    priority: 1,
    action: { type: 'modifyHeaders', requestHeaders: [{ header: 'Referer', operation: 'set', value: ref }] },
    condition: { tabIds: [tab.id], requestDomains: [new URL(origin).hostname], resourceTypes: ['xmlhttprequest', 'other'] },
  };
  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [tab.id], addRules: [rule] });
  return () => chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [tab.id] }).catch(() => {});
}

async function thumbFrom(draw, w, h) {
  const tw = 320, th = Math.max(1, Math.round(h * tw / w));
  const c = new OffscreenCanvas(tw, th), x = c.getContext('2d');
  x.fillStyle = '#18181b';
  x.fillRect(0, 0, tw, th);
  x.scale(tw / w, th / h);
  await draw(x);
  return c.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
}

async function imageJob(job, signal) {
  await ensurePermission(new URL(job.src).origin);
  unsetRef = await setReferer(job, new URL(job.src).origin);
  say(t('dlImage'));
  bar.hidden = false;
  bar.removeAttribute('value');
  const blob = await fetchImage(job.src, signal);
  if (!blob) throw new Error(t('errNoImage'));
  const bmp = await createImageBitmap(blob);
  const base = { name: job.title || hostOf(job.url), url: job.url, host: hostOf(job.url) };
  try {
    // Imágenes enormes: a teselas, para no tener un bitmap gigante en memoria.
    if (Math.max(bmp.width, bmp.height) > 8192) {
      const M = 256 * 2 ** Math.ceil(Math.log2(Math.max(bmp.width, bmp.height) / 256));
      return await buildPyramid(base, bmp.width, bmp.height, M, (x, sx, sy, sw, sh, dw, dh) => x.drawImage(bmp, sx, sy, sw, sh, 0, 0, dw, dh), signal);
    }
    const thumb = await thumbFrom((x) => x.drawImage(bmp, 0, 0), bmp.width, bmp.height);
    const id = crypto.randomUUID();
    await db.saveSnap({ id, ts: Date.now(), kind: 'image', ...base, w: bmp.width, h: bmp.height, thumb, shapes: [] }, blob);
    return id;
  } finally {
    bmp.close();
  }
}

// Construye una pirámide de teselas 256×256 a partir de una fuente que sabemos pintar a cualquier
// escala (SVG o imagen grande). srcW×srcH: tamaño de la fuente; M: lado máximo del nivel más fino.
// draw(ctx, sx, sy, sw, sh, dw, dh) pinta el rectángulo de la fuente en (0,0,dw,dh).
async function buildPyramid(base, srcW, srcH, M, draw, signal) {
  const TS = 256, CH = 2048; // se pinta en trozos de 2048 px y se corta en teselas
  const zmax = Math.round(Math.log2(M / TS));
  const k0 = M / Math.max(srcW, srcH);
  const W = Math.ceil(srcW * k0), H = Math.ceil(srcH * k0);
  const id = crypto.randomUUID();
  const chunk = new OffscreenCanvas(CH, CH), cx = chunk.getContext('2d');
  const tile = new OffscreenCanvas(TS, TS), tx = tile.getContext('2d');
  let total = 0, done = 0;
  for (let z = 0; z <= zmax; z++) {
    const lw = Math.ceil(W / 2 ** (zmax - z)), lh = Math.ceil(H / 2 ** (zmax - z));
    total += Math.ceil(lw / CH) * Math.ceil(lh / CH);
  }
  bar.hidden = false;
  bar.max = total;
  try {
    for (let z = 0; z <= zmax; z++) {
      const f = 2 ** (zmax - z), lw = Math.ceil(W / f), lh = Math.ceil(H / f), k = k0 / f; // k: px de nivel por unidad de fuente
      for (let cy0 = 0; cy0 < lh; cy0 += CH) {
        for (let cx0 = 0; cx0 < lw; cx0 += CH) {
          if (signal.aborted) throw new DOMException('Cancelado', 'AbortError');
          const cw = Math.min(CH, lw - cx0), chh = Math.min(CH, lh - cy0);
          cx.clearRect(0, 0, CH, CH);
          await draw(cx, cx0 / k, cy0 / k, cw / k, chh / k, cw, chh);
          const out = [];
          for (let ty = 0; ty < chh; ty += TS) {
            for (let tx0 = 0; tx0 < cw; tx0 += TS) {
              const w = Math.min(TS, cw - tx0), h = Math.min(TS, chh - ty);
              tile.width = w; // tamaño real: las del borde son más pequeñas
              tile.height = h;
              tx.drawImage(chunk, tx0, ty, w, h, 0, 0, w, h);
              out.push([db.tileKey(id, z, (cx0 + tx0) / TS, (cy0 + ty) / TS), await tile.convertToBlob({ type: 'image/webp', quality: 0.9 })]);
            }
          }
          await db.putTiles(out);
          bar.value = ++done;
          say(t('preparing', done, total));
          await new Promise((r) => setTimeout(r));
        }
      }
    }
    const thumb = await thumbFrom((x) => draw(x, 0, 0, srcW, srcH, W, H), W, H);
    await db.saveSnap({
      id, ts: Date.now(), kind: 'tiles', ...base, w: W, h: H,
      tiles: { zmin: 0, zmax, ts: TS, overlap: 0, swap: false, flip: false, ox: 0, oy: 0 }, thumb, shapes: [],
    });
    return id;
  } catch (e) {
    await db.remove(id).catch(() => {});
    throw e;
  }
}

async function svgJob(job, signal) {
  const origin = new URL(job.src).origin;
  await ensurePermission(origin);
  unsetRef = await setReferer(job, origin);
  say(t('dlSvg'));
  bar.hidden = false;
  bar.removeAttribute('value');
  const r = await fetch(job.src, { credentials: 'include', signal });
  if (!r.ok) throw new Error(t('errStatus', r.status));
  const doc = new DOMParser().parseFromString(await r.text(), 'image/svg+xml');
  const svg = doc.documentElement;
  if (svg.nodeName !== 'svg') throw new Error(t('errSvg'));
  // Sin width/height explícitos el navegador no sabe su tamaño: sacarlo del viewBox.
  const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
  let sw = parseFloat(svg.getAttribute('width')), sh = parseFloat(svg.getAttribute('height'));
  if (!(sw > 0 && sh > 0) || /%/.test(svg.getAttribute('width') || '')) { sw = vb[2]; sh = vb[3]; }
  if (!(sw > 0 && sh > 0)) throw new Error(t('errSvgSize'));
  svg.setAttribute('width', sw);
  svg.setAttribute('height', sh);
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(doc)], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();

    bar.hidden = true;
    say(t('svgPick'));
    body.replaceChildren();
    const opts = [4096, 8192, 16384, 32768];
    for (const M of opts) {
      const k = M / Math.max(sw, sh);
      const lab = document.createElement('label');
      const rd = document.createElement('input');
      rd.type = 'radio';
      rd.name = 'res';
      rd.value = M;
      rd.checked = M === 16384;
      const s = document.createElement('span');
      s.textContent = fmtPx(sw * k, sh * k);
      const sm = document.createElement('small');
      sm.textContent = t('nTiles', num(Math.ceil(sw * k / 256) * Math.ceil(sh * k / 256)));
      lab.append(rd, s, sm);
      body.append(lab);
    }
    go.hidden = false;
    await waitClick(go);
    go.hidden = true;
    const M = +body.querySelector('input:checked').value;
    body.replaceChildren();
    const base = { name: job.title || hostOf(job.url), url: job.url, host: hostOf(job.url) };
    return await buildPyramid(base, sw, sh, M, (x, a, b, c, d, dw, dh) => x.drawImage(img, a, b, c, d, 0, 0, dw, dh), signal);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function tilesJob(job, signal) {
  const cand = job.tmpl;
  await ensurePermission(cand.origin);
  unsetRef = await setReferer(job, cand.origin);
  bar.hidden = false;
  bar.removeAttribute('value');
  say(t('analyzing'));
  const get = prober(signal);
  const tp = await resolveZoom(cand, get);
  if (!tp) return flatJob(job, cand, signal);
  const dzi = await readDzi(tp);
  let info;
  if (dzi) {
    // Deep Zoom: el descriptor da tamaño real y nº de niveles (el nivel 0 mide 1×1 px, así que
    // explorar como en las demás webs daría estimaciones absurdas). Se empieza en el nivel más
    // alto que aún cabe en una sola tesela.
    const top = Math.ceil(Math.log2(Math.max(dzi.w, dzi.h)));
    const zmin = Math.max(0, top - Math.ceil(Math.log2(Math.max(dzi.w, dzi.h) / dzi.ts)));
    let bytes = 0, n = 0;
    for (const p of get.cache.values()) { const b = await p; if (b) { bytes += b.size; n++; } }
    info = { zmin, zmax: top, base: [[0, 0]], ts: dzi.ts, avgBytes: n ? bytes / n : 60000, dziSize: [dzi.w, dzi.h], capped: false };
    if (!(await get(tileUrl(tp, zmin, 0, 0)))) throw new Error(t('errNoTiles'));
  } else {
    info = await explore(tp, get, () => say(t('analyzingN', get.cache.size)));
  }
  bar.hidden = true;

  // Elegir nivel de detalle.
  const levels = [];
  for (let z = info.zmin; z <= info.zmax; z++) levels.push(levelInfo(info, z));
  let pick = levels[0];
  for (const L of levels) if (L.maxTiles <= 4096) pick = L;
  say(t('pickLevel') + (info.capped ? ' ' + t('noEdges') : ''));
  body.replaceChildren();
  for (const L of levels) {
    const lab = document.createElement('label');
    const r = document.createElement('input');
    r.type = 'radio';
    r.name = 'lvl';
    r.value = L.z;
    r.checked = L === pick;
    const s = document.createElement('span');
    s.textContent = t('level', L.z - info.zmin + 1, fmtPx(L.pxA, L.pxB));
    const sm = document.createElement('small');
    sm.textContent = t('levelSub', num(L.maxTiles), fmtMb(L.mb));
    lab.dataset.tiles = L.maxTiles; // para las pruebas
    lab.append(r, s, sm);
    body.append(lab);
  }
  go.hidden = false;
  await waitClick(go);
  go.hidden = true;
  const zsel = +body.querySelector('input:checked').value;
  body.replaceChildren();

  // Descargar.
  const id = crypto.randomUUID();
  const sample = Math.min(zsel, info.zmin + 3);
  const sampleTiles = new Map(), finest = [];
  let buf = [];
  const flush = async () => { const b = buf; buf = []; if (b.length) await db.putTiles(b); };
  bar.hidden = false;
  try {
    const counts = await downloadLevels(tp, info, zsel, get, {
      signal,
      onTile: async (z, a, b, blob) => {
        buf.push([db.tileKey(id, z, a, b), blob]);
        if (z === sample && sampleTiles.size < 400) sampleTiles.set(`${a},${b}`, blob);
        if (z === zsel) finest.push([a, b]);
        if (buf.length >= 64) await flush();
      },
      onProgress: (z, n, total) => {
        bar.max = total;
        bar.value = n;
        say(t('dlLevel', z - info.zmin + 1, zsel - info.zmin + 1, num(n), num(total)));
      },
    });
    await flush();
    if (!counts[zsel]) throw new Error(t('errNoLevel'));

    say(t('assembling'));
    bar.removeAttribute('value');
    const o = dzi ? { swap: false, flip: false } : await detectOrientation(sampleTiles);
    const T = { zmin: info.zmin, zmax: zsel, ts: info.ts, overlap: dzi?.overlap || 0, swap: o.swap, flip: o.flip };
    const cr = info.base.map(([a, b]) => toColRow(T, a, b));
    const f0 = 2 ** (zsel - info.zmin), S0 = T.ts * f0;
    const minC = Math.min(...cr.map((p) => p[0])), maxC = Math.max(...cr.map((p) => p[0]));
    const minR = Math.min(...cr.map((p) => p[1])), maxR = Math.max(...cr.map((p) => p[1]));
    T.ox = minC * S0;
    T.oy = minR * S0;
    let w = (maxC - minC + 1) * S0, h = (maxR - minR + 1) * S0;
    if (dzi) {
      const top = Math.ceil(Math.log2(Math.max(dzi.w, dzi.h)));
      w = Math.ceil(dzi.w / 2 ** (top - zsel));
      h = Math.ceil(dzi.h / 2 ** (top - zsel));
    } else {
      // Recortar márgenes transparentes (teselas de borde vacías) mirando el nivel mínimo.
      const cw = (maxC - minC + 1) * T.ts, ch = (maxR - minR + 1) * T.ts;
      if (cw * ch <= 64e6) {
        const oc = new OffscreenCanvas(cw, ch), x = oc.getContext('2d', { willReadFrequently: true });
        for (const [a, b] of info.base) {
          const blob = await db.getTile(db.tileKey(id, info.zmin, a, b));
          if (!blob) continue;
          const bm = await createImageBitmap(blob);
          const [col, row] = toColRow(T, a, b);
          x.drawImage(bm, (col - minC) * T.ts, (row - minR) * T.ts);
          bm.close();
        }
        const d = x.getImageData(0, 0, cw, ch).data;
        // Fondo neutro opaco (negro en Map Genie/IGN, gris en otras): si las cuatro esquinas son
        // del mismo color sin tono, ese color también cuenta como vacío. Un fondo con tono (el mar
        // azul de DayZ) se deja: es parte del mapa.
        const px4 = (px, py) => d.slice((py * cw + px) * 4, (py * cw + px) * 4 + 4);
        const corners = [px4(0, 0), px4(cw - 1, 0), px4(0, ch - 1), px4(cw - 1, ch - 1)];
        const c0 = corners[0];
        const neutral = (p) => Math.max(p[0], p[1], p[2]) - Math.min(p[0], p[1], p[2]) < 12;
        const bg = corners.every((p) => p[3] >= 16 && neutral(p) && Math.abs(p[0] - c0[0]) + Math.abs(p[1] - c0[1]) + Math.abs(p[2] - c0[2]) < 18) ? c0 : null;
        const empty = (i) => d[i + 3] < 16 || (bg && Math.abs(d[i] - bg[0]) < 10 && Math.abs(d[i + 1] - bg[1]) < 10 && Math.abs(d[i + 2] - bg[2]) < 10);
        let x0 = cw, y0 = ch, x1 = -1, y1 = -1;
        for (let py = 0; py < ch; py++) {
          for (let px = 0; px < cw; px++) {
            if (empty((py * cw + px) * 4)) continue;
            if (px < x0) x0 = px;
            if (px > x1) x1 = px;
            if (py < y0) y0 = py;
            if (py > y1) y1 = py;
          }
        }
        if (x1 >= 0) {
          T.ox += x0 * f0;
          T.oy += y0 * f0;
          w = (x1 - x0 + 1) * f0;
          h = (y1 - y0 + 1) * f0;
        }
      }
      // Y por las teselas que existen en el nivel descargado: hay webs cuyas teselas de poco
      // detalle son opacas (fondo negro) aunque fuera del mapa no haya nada.
      let c0 = Infinity, c1 = -Infinity, r0 = Infinity, r1 = -Infinity;
      for (const [a, b] of finest) {
        const [col, row] = toColRow(T, a, b);
        c0 = Math.min(c0, col); c1 = Math.max(c1, col); r0 = Math.min(r0, row); r1 = Math.max(r1, row);
      }
      const L = Math.max(T.ox, c0 * T.ts), R = Math.min(T.ox + w, (c1 + 1) * T.ts);
      const Tp = Math.max(T.oy, r0 * T.ts), B = Math.min(T.oy + h, (r1 + 1) * T.ts);
      if (R > L && B > Tp) {
        T.ox = L;
        T.oy = Tp;
        w = R - L;
        h = B - Tp;
      }
    }
    const thumb = await thumbFrom(async (x) => {
      for (const [a, b] of info.base) {
        const blob = await db.getTile(db.tileKey(id, info.zmin, a, b));
        if (!blob) continue;
        const bm = await createImageBitmap(blob);
        const [col, row] = toColRow(T, a, b);
        x.drawImage(bm, col * S0 - T.ox, row * S0 - T.oy, bm.width * f0, bm.height * f0);
        bm.close();
      }
    }, w, h);
    await db.saveSnap({
      id, ts: Date.now(), kind: 'tiles', name: job.title || hostOf(job.url), url: job.url, host: hostOf(job.url),
      w, h, tiles: T, tmpl: { origin: tp.origin, parts: tp.parts, rep: tp.rep, xy: tp.xy, zi: tp.zi, inv: tp.inv }, thumb, shapes: [],
    });
    return id;
  } catch (e) {
    await db.remove(id).catch(() => {});
    throw e;
  }
}

// Rejilla plana (un solo nivel, sin número de zoom en la URL, p. ej. "World_03_05.webp"):
// se recorre por vecinas, se averigua qué índice es columna y cuál fila, y con buildPyramid se
// generan los niveles alejados para que el visor no tenga que pintar cientos de teselas.
async function flatJob(job, cand, signal) {
  const tp = { ...cand, zi: -1 };
  const [A, B] = cand.xy;
  const tiles = new Map(), seen = new Set();
  const queue = cand.samples.map((s) => [+s[A], +s[B]]);
  for (const [a, b] of queue) seen.add(a + ',' + b);
  const LIMIT = 10000;
  bar.hidden = false;
  bar.removeAttribute('value');
  say(t('dlGrid'));
  while (queue.length && tiles.size < LIMIT) {
    if (signal.aborted) throw new DOMException('Cancelado', 'AbortError');
    const batch = queue.splice(0, 16);
    const res = await Promise.all(batch.map(([a, b]) => fetchImage(tileUrl(tp, 0, a, b), signal)));
    batch.forEach(([a, b], i) => {
      if (!res[i]) return;
      tiles.set(a + ',' + b, res[i]);
      for (const [na, nb] of [[a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]]) {
        const k = na + ',' + nb;
        if (!seen.has(k)) { seen.add(k); queue.push([na, nb]); }
      }
    });
    say(t('dlGridN', tiles.size));
  }
  if (tiles.size < 2) throw new Error(t('errTiles'));

  say(t('assembling'));
  const o = await detectOrientation(tiles);
  const cells = new Map();
  let c0 = Infinity, c1 = -Infinity, r0 = Infinity, r1 = -Infinity;
  for (const [k, blob] of tiles) {
    const [a, b] = k.split(',').map(Number);
    const [col, row] = toColRow(o, a, b);
    cells.set(col + ',' + row, blob);
    c0 = Math.min(c0, col); c1 = Math.max(c1, col); r0 = Math.min(r0, row); r1 = Math.max(r1, row);
  }
  const first = await createImageBitmap(tiles.values().next().value);
  const tw = first.width, th = first.height;
  first.close();
  const srcW = (c1 - c0 + 1) * tw, srcH = (r1 - r0 + 1) * th;

  const lru = new Map();
  const bitmap = async (key) => {
    if (lru.has(key)) { const v = lru.get(key); lru.delete(key); lru.set(key, v); return v; }
    const blob = cells.get(key);
    const bm = blob ? await createImageBitmap(blob) : null;
    lru.set(key, bm);
    if (lru.size > 96) { const [k0, v0] = lru.entries().next().value; v0?.close(); lru.delete(k0); }
    return bm;
  };
  const draw = async (x, sx, sy, sw, sh, dw, dh) => {
    const k = dw / sw;
    for (let row = Math.floor(sy / th); row <= Math.floor((sy + sh - 1e-6) / th); row++) {
      for (let col = Math.floor(sx / tw); col <= Math.floor((sx + sw - 1e-6) / tw); col++) {
        const bm = await bitmap((col + c0) + ',' + (row + r0));
        if (bm) x.drawImage(bm, (col * tw - sx) * k, (row * th - sy) * k, tw * k + 0.5, th * k + 0.5);
      }
    }
  };
  const M = 256 * 2 ** Math.ceil(Math.log2(Math.max(srcW, srcH) / 256));
  const base = { name: job.title || hostOf(job.url), url: job.url, host: hostOf(job.url) };
  try {
    return await buildPyramid(base, srcW, srcH, M, draw, signal);
  } finally {
    for (const v of lru.values()) v?.close();
  }
}

function toColRow(T, a, b) {
  const col = T.swap ? b : a, r = T.swap ? a : b;
  return [col, T.flip ? -r - 1 : r];
}

// Devuelve el id del mapa creado, o null si se cancela o falla.
export async function runJob(jobId) {
  const key = 'job:' + jobId;
  const job = (await chrome.storage.session.get(key))[key];
  if (!job) return null;
  const ctrl = new AbortController();
  box.hidden = false;
  $('jobTitle').textContent = job.title || hostOf(job.url);
  body.replaceChildren();
  go.hidden = true;
  bar.hidden = true;
  let cancelled = false;
  cancel.textContent = t('cancel');
  cancel.onclick = () => { cancelled = true; ctrl.abort(); };
  try {
    const run = job.type === 'tiles' ? tilesJob(job, ctrl.signal) : job.type === 'svg' ? svgJob(job, ctrl.signal) : imageJob(job, ctrl.signal);
    // Si cancelan mientras se espera un clic (permiso, nivel), salir igualmente.
    const id = await Promise.race([run, new Promise((_, rej) => ctrl.signal.addEventListener('abort', () => rej(new DOMException('Cancelado', 'AbortError'))))]);
    await chrome.storage.session.remove(key);
    box.hidden = true;
    return id;
  } catch (e) {
    if (cancelled) {
      await chrome.storage.session.remove(key);
      box.hidden = true;
      return null;
    }
    console.error(e);
    say(e.message || String(e));
    body.replaceChildren();
    go.hidden = true;
    bar.hidden = true;
    cancel.textContent = t('close');
    await waitClick(cancel);
    await chrome.storage.session.remove(key);
    box.hidden = true;
    return null;
  } finally {
    await unsetRef?.();
    unsetRef = null;
  }
}
