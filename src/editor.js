import * as db from './db.js';
import { runJob } from './job.js';
import { t, LOCALE, localizeHtml } from './i18n.js';

const $ = (id) => document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d');
const COLORS = ['#ff3b30', '#ff9500', '#ffd60a', '#34c759', '#0a84ff', '#bf5af2', '#ffffff', '#000000'];

// Los trazos se guardan en píxeles del mapa ("mundo": la imagen, o el nivel de teselas más
// detallado descargado); la vista los proyecta a pantalla.
// meta.kind: 'image' (imagen única o captura, en img) o 'tiles' (pirámide de teselas en IndexedDB).
let meta = null, img = null, shapes = [], hist = [], redo = [];
let view = { x: 0, y: 0, s: 1 };
let tool = 'pen', color = COLORS[0], dpr = 1;
let drag = null, cur = null, spaceDown = false, eraseBefore = null;

// ---------- vista ----------

function resize() {
  dpr = devicePixelRatio || 1;
  cv.width = Math.round(cv.clientWidth * dpr);
  cv.height = Math.round(cv.clientHeight * dpr);
  draw();
}

function fit() {
  if (!meta) return;
  const s = Math.min(cv.clientWidth / meta.w, cv.clientHeight / meta.h) * 0.98;
  view = { s, x: (cv.clientWidth - meta.w * s) / 2, y: (cv.clientHeight - meta.h * s) / 2 };
  draw();
}

// ---------- teselas ----------
// Columna/fila en pantalla ↔ índices (a, b) tal como van en la URL, según swap/flip detectados.

const toColRow = (T, a, b) => {
  const col = T.swap ? b : a, r = T.swap ? a : b;
  return [col, T.flip ? -r - 1 : r];
};
const fromColRow = (T, col, row) => {
  const r = T.flip ? -row - 1 : row;
  return T.swap ? [r, col] : [col, r];
};

// Caché de ImageBitmap con expulsión por antigüedad; el nivel mínimo no se expulsa (es el fondo
// borroso que se ve mientras cargan las teselas finas).
const bmCache = new Map(), MAX_BM = 500;
let baseKeys = new Set();

function tileBitmap(z, a, b) {
  const key = db.tileKey(meta.id, z, a, b);
  const v = bmCache.get(key);
  if (v instanceof Promise) return null;
  if (v !== undefined) {
    bmCache.delete(key);
    bmCache.set(key, v);
    return v;
  }
  const id = meta.id;
  bmCache.set(key, db.getTile(key)
    .then((blob) => (blob ? createImageBitmap(blob) : null))
    .catch(() => null)
    .then((bm) => {
      if (!meta || meta.id !== id) return bm?.close();
      bmCache.set(key, bm);
      trimCache();
      draw();
    }));
  return null;
}

function trimCache() {
  let excess = bmCache.size - MAX_BM;
  for (const [k, v] of bmCache) {
    if (excess <= 0) break;
    if (v instanceof Promise || baseKeys.has(k)) continue;
    v?.close?.();
    bmCache.delete(k);
    excess--;
  }
}

function clearCache() {
  for (const v of bmCache.values()) if (v && !(v instanceof Promise)) v.close?.();
  bmCache.clear();
}

function drawLevel(c, T, z, x0, y0, x1, y1, get) {
  const f = 2 ** (T.zmax - z), S = T.ts * f, ov = (T.overlap || 0) * f, pad = 0.6 / view.s;
  const c0 = Math.floor((x0 + T.ox) / S), c1 = Math.floor((x1 + T.ox) / S);
  const r0 = Math.floor((y0 + T.oy) / S), r1 = Math.floor((y1 + T.oy) / S);
  if ((c1 - c0 + 1) * (r1 - r0 + 1) > 4000) return;
  for (let row = r0; row <= r1; row++) {
    for (let col = c0; col <= c1; col++) {
      const [a, b] = fromColRow(T, col, row);
      const bm = get(z, a, b);
      if (!bm) continue;
      c.drawImage(bm, col * S - T.ox - (col > 0 ? ov : 0), row * S - T.oy - (row > 0 ? ov : 0), bm.width * f + pad, bm.height * f + pad);
    }
  }
}

function levelFor(T, scale) {
  return Math.max(T.zmin, Math.min(T.zmax, T.zmax + Math.ceil(Math.log2(scale) - 0.3)));
}

function zoomAt(mx, my, k) {
  const minS = meta ? Math.min(0.5, Math.min(cv.clientWidth / meta.w, cv.clientHeight / meta.h) / 4) : 0.05;
  const ns = Math.min(16, Math.max(minS, view.s * k));
  view.x = mx - (mx - view.x) * ns / view.s;
  view.y = my - (my - view.y) * ns / view.s;
  view.s = ns;
  draw();
}

function toWorld(e) {
  const r = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left - view.x) / view.s, y: (e.clientY - r.top - view.y) / view.s };
}

let raf = 0;
function draw() { if (!raf) raf = requestAnimationFrame(render); }

function render() {
  raf = 0;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, cv.width, cv.height);
  if (!meta) return;
  paintScene(ctx, view.x, view.y);
  if (cur) drawShape(ctx, cur);
  $('zoom').textContent = Math.round(view.s * 100) + '%';
}

// Pinta mapa + trazos de la vista actual en c, con el origen de la vista en (ox, oy) px de pantalla.
// Lo usan la pantalla y "copiar/descargar lo que se ve".
function paintScene(ctx, ox, oy) {
  ctx.setTransform(dpr * view.s, 0, 0, dpr * view.s, dpr * ox, dpr * oy);
  ctx.imageSmoothingQuality = 'high';
  if (meta.kind === 'tiles') {
    const T = meta.tiles;
    const x0 = Math.max(0, -view.x / view.s), y0 = Math.max(0, -view.y / view.s);
    const x1 = Math.min(meta.w - 1, (cv.clientWidth - view.x) / view.s), y1 = Math.min(meta.h - 1, (cv.clientHeight - view.y) / view.s);
    const z = levelFor(T, view.s * dpr);
    ctx.imageSmoothingEnabled = view.s * dpr * 2 ** (T.zmax - z) < 2;
    drawLevel(ctx, T, T.zmin, x0, y0, x1, y1, tileBitmap);
    if (z - 1 > T.zmin) drawLevel(ctx, T, z - 1, x0, y0, x1, y1, tileBitmap);
    if (z > T.zmin) drawLevel(ctx, T, z, x0, y0, x1, y1, tileBitmap);
  } else if (img) {
    ctx.imageSmoothingEnabled = view.s * dpr < 2;
    ctx.drawImage(img, 0, 0);
  }
  for (const sh of shapes) drawShape(ctx, sh);
}

// ---------- formas ----------

const isLight = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 150;
};

function drawShape(c, sh) {
  c.save();
  c.strokeStyle = c.fillStyle = sh.c;
  c.lineWidth = sh.w;
  c.lineCap = c.lineJoin = 'round';
  c.shadowColor = 'rgba(0,0,0,.55)';
  c.shadowBlur = 3;
  const p = sh.p;
  switch (sh.t) {
    case 'pen': {
      c.beginPath();
      c.moveTo(p[0], p[1]);
      if (p.length === 2) c.lineTo(p[0] + 0.01, p[1]);
      for (let i = 2; i < p.length - 2; i += 2) c.quadraticCurveTo(p[i], p[i + 1], (p[i] + p[i + 2]) / 2, (p[i + 1] + p[i + 3]) / 2);
      if (p.length > 2) c.lineTo(p[p.length - 2], p[p.length - 1]);
      c.stroke();
      break;
    }
    case 'line':
    case 'arrow': {
      const [x1, y1, x2, y2] = p;
      const a = Math.atan2(y2 - y1, x2 - x1), h = sh.w * 4.5 + 6;
      const back = sh.t === 'arrow' ? Math.min(h * 0.8, Math.hypot(x2 - x1, y2 - y1)) : 0;
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x2 - back * Math.cos(a), y2 - back * Math.sin(a));
      c.stroke();
      if (sh.t === 'arrow') {
        c.beginPath();
        c.moveTo(x2, y2);
        c.lineTo(x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45));
        c.lineTo(x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45));
        c.closePath();
        c.fill();
      }
      break;
    }
    case 'rect':
      c.strokeRect(Math.min(p[0], p[2]), Math.min(p[1], p[3]), Math.abs(p[2] - p[0]), Math.abs(p[3] - p[1]));
      break;
    case 'circle':
      c.beginPath();
      c.arc(p[0], p[1], Math.hypot(p[2] - p[0], p[3] - p[1]), 0, Math.PI * 2);
      c.stroke();
      break;
    case 'text':
      c.font = `600 ${sh.size}px system-ui, sans-serif`;
      c.textBaseline = 'top';
      c.shadowBlur = 0;
      c.lineWidth = sh.size / 5;
      c.strokeStyle = isLight(sh.c) ? '#000' : '#fff';
      c.strokeText(sh.s, p[0], p[1]);
      c.fillText(sh.s, p[0], p[1]);
      break;
  }
  c.restore();
}

function distSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2)) : 0;
  return Math.hypot(px - x1 - t * dx, py - y1 - t * dy);
}

function hit(sh, w) {
  const tol = 8 / view.s + sh.w / 2, p = sh.p;
  switch (sh.t) {
    case 'pen':
      if (p.length === 2) return Math.hypot(w.x - p[0], w.y - p[1]) < tol;
      for (let i = 0; i < p.length - 2; i += 2) if (distSeg(w.x, w.y, p[i], p[i + 1], p[i + 2], p[i + 3]) < tol) return true;
      return false;
    case 'line':
    case 'arrow':
      return distSeg(w.x, w.y, ...p) < tol;
    case 'rect': {
      const [x1, y1, x2, y2] = p;
      return [[x1, y1, x2, y1], [x2, y1, x2, y2], [x2, y2, x1, y2], [x1, y2, x1, y1]].some((s) => distSeg(w.x, w.y, ...s) < tol);
    }
    case 'circle':
      return Math.abs(Math.hypot(w.x - p[0], w.y - p[1]) - Math.hypot(p[2] - p[0], p[3] - p[1])) < tol;
    case 'text':
      return w.x >= p[0] - tol && w.x <= p[0] + sh.wd + tol && w.y >= p[1] - tol && w.y <= p[1] + sh.size * 1.2 + tol;
  }
  return false;
}

// ---------- historial y guardado ----------

function commit(next) {
  hist.push(shapes);
  if (hist.length > 200) hist.shift();
  redo = [];
  shapes = next;
  save();
  draw();
}

function undo() { if (!hist.length) return; redo.push(shapes); shapes = hist.pop(); save(); draw(); }
function redoIt() { if (!redo.length) return; hist.push(shapes); shapes = redo.pop(); save(); draw(); }

let saveT = 0;
function save() {
  if (!meta) return;
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    meta.shapes = shapes;
    meta.name = $('name').value.trim() || meta.name;
    db.putMeta(meta).then(() => { if (!$('gal').hidden) renderGallery(); });
  }, 400);
}

// ---------- ratón ----------

cv.addEventListener('contextmenu', (e) => e.preventDefault());

cv.addEventListener('pointerdown', (e) => {
  if (!meta || commitText()) return;
  cv.setPointerCapture(e.pointerId);
  if (e.button === 1 || e.button === 2 || tool === 'pan' || spaceDown) {
    drag = { mode: 'pan', sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y };
    cv.style.cursor = 'grabbing';
    return;
  }
  if (e.button !== 0) return;
  const w = toWorld(e);
  if (tool === 'text') return startText(e, w);
  if (tool === 'erase') {
    drag = { mode: 'erase' };
    eraseBefore = shapes;
    eraseAt(w);
    return;
  }
  const sw = +$('width').value / view.s;
  cur = tool === 'pen' ? { t: 'pen', c: color, w: sw, p: [w.x, w.y] } : { t: tool, c: color, w: sw, p: [w.x, w.y, w.x, w.y] };
  drag = { mode: 'draw' };
  draw();
});

cv.addEventListener('pointermove', (e) => {
  if (!drag) return;
  if (drag.mode === 'pan') {
    view.x = drag.vx + e.clientX - drag.sx;
    view.y = drag.vy + e.clientY - drag.sy;
    return draw();
  }
  if (drag.mode === 'erase') return eraseAt(toWorld(e));
  if (cur.t === 'pen') {
    for (const ev of e.getCoalescedEvents?.() ?? [e]) {
      const w = toWorld(ev), p = cur.p;
      if (Math.hypot(w.x - p[p.length - 2], w.y - p[p.length - 1]) > 1.5 / view.s) p.push(w.x, w.y);
    }
  } else {
    let w = toWorld(e);
    const [x1, y1] = cur.p;
    if (e.shiftKey) {
      const dx = w.x - x1, dy = w.y - y1;
      if (cur.t === 'line' || cur.t === 'arrow') {
        const a = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4), l = Math.hypot(dx, dy);
        w = { x: x1 + l * Math.cos(a), y: y1 + l * Math.sin(a) };
      } else if (cur.t === 'rect') {
        const m = Math.max(Math.abs(dx), Math.abs(dy));
        w = { x: x1 + Math.sign(dx) * m, y: y1 + Math.sign(dy) * m };
      }
    }
    cur.p[2] = w.x;
    cur.p[3] = w.y;
  }
  draw();
});

function endDrag() {
  if (!drag) return;
  if (drag.mode === 'pan') cv.style.cursor = cursorFor();
  if (drag.mode === 'erase' && shapes !== eraseBefore) {
    const after = shapes;
    shapes = eraseBefore;
    commit(after);
  }
  if (drag.mode === 'draw' && cur) {
    const p = cur.p, tiny = cur.t !== 'pen' && Math.hypot(p[2] - p[0], p[3] - p[1]) * view.s < 3;
    const sh = cur;
    cur = null;
    if (!tiny) commit([...shapes, sh]); else draw();
  }
  drag = null;
}
cv.addEventListener('pointerup', endDrag);
cv.addEventListener('pointercancel', endDrag);

function eraseAt(w) {
  const keep = shapes.filter((sh) => !hit(sh, w));
  if (keep.length !== shapes.length) { shapes = keep; draw(); }
}

cv.addEventListener('wheel', (e) => {
  e.preventDefault();
  const r = cv.getBoundingClientRect();
  zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0015)));
}, { passive: false });

// ---------- texto ----------

const textIn = $('textIn');
let textAt = null;

function startText(e, w) {
  const screenSize = 12 + +$('width').value * 2;
  textAt = { w, size: screenSize / view.s };
  Object.assign(textIn.style, { left: e.clientX + 'px', top: e.clientY + 'px', fontSize: screenSize + 'px', color });
  textIn.value = '';
  textIn.hidden = false;
  setTimeout(() => textIn.focus());
}

// Devuelve true si había un texto abierto (para que ese clic solo lo cierre).
function commitText() {
  if (textIn.hidden) return false;
  const s = textIn.value.trim();
  textIn.hidden = true;
  if (s && textAt) {
    ctx.save();
    ctx.font = `600 ${textAt.size}px system-ui, sans-serif`;
    const wd = ctx.measureText(s).width;
    ctx.restore();
    commit([...shapes, { t: 'text', c: color, w: 0, s, size: textAt.size, wd, p: [textAt.w.x, textAt.w.y] }]);
  }
  textAt = null;
  return true;
}

textIn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') commitText();
  if (e.key === 'Escape') { textIn.value = ''; commitText(); }
  e.stopPropagation();
});
textIn.addEventListener('blur', () => commitText());

// ---------- barra ----------

const cursorFor = () => (tool === 'pan' || spaceDown ? 'grab' : tool === 'text' ? 'text' : tool === 'erase' ? 'cell' : 'crosshair');

function setTool(t) {
  tool = t;
  for (const b of document.querySelectorAll('#tools button')) b.classList.toggle('on', b.dataset.tool === t);
  cv.style.cursor = cursorFor();
}

function setColor(c) {
  color = c;
  $('color').value = c;
  for (const b of document.querySelectorAll('#colors button')) b.classList.toggle('on', b.dataset.c === c);
}

for (const c of COLORS) {
  const b = document.createElement('button');
  b.dataset.c = c;
  b.style.background = c;
  b.title = c;
  b.onclick = () => setColor(c);
  $('colors').append(b);
}
$('color').oninput = (e) => setColor(e.target.value);
for (const b of document.querySelectorAll('#tools button')) b.onclick = () => setTool(b.dataset.tool);
$('bUndo').onclick = undo;
$('bRedo').onclick = redoIt;
$('bFit').onclick = fit;
$('bClear').onclick = () => { if (shapes.length && confirm(t('confirmClear'))) commit([]); };
$('bGal').onclick = toggleGallery;
$('name').addEventListener('input', save);
$('name').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); e.stopPropagation(); });

const KEYS = { h: 'pan', p: 'pen', l: 'line', a: 'arrow', r: 'rect', c: 'circle', t: 'text', e: 'erase' };
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); return e.shiftKey ? redoIt() : undo(); }
  if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); return redoIt(); }
  if ((e.ctrlKey || e.metaKey) && k === 'c' && meta) { e.preventDefault(); return copyImage(() => renderView()); }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.code === 'Space') { e.preventDefault(); if (!spaceDown) { spaceDown = true; cv.style.cursor = cursorFor(); } return; }
  if (KEYS[k]) return setTool(KEYS[k]);
  if (k === 'f') return fit();
  if (k === 'g') return toggleGallery();
  if (k === '+' || k === '=') return zoomAt(cv.clientWidth / 2, cv.clientHeight / 2, 1.25);
  if (k === '-') return zoomAt(cv.clientWidth / 2, cv.clientHeight / 2, 0.8);
});
addEventListener('keyup', (e) => { if (e.code === 'Space') { spaceDown = false; cv.style.cursor = cursorFor(); } });

// ---------- exportar y compartir ----------

const fileName = () => ($('name').value.trim() || 'mapa').replace(/[\/:*?"<>|]+/g, '_');
const toBlob = (c) => new Promise((res) => c.toBlob(res, 'image/png'));

// Lo que se ve ahora, recortado al mapa, a la resolución de la pantalla.
function renderView() {
  const cw = cv.clientWidth, ch = cv.clientHeight;
  const sx0 = Math.max(0, view.x), sy0 = Math.max(0, view.y);
  const sx1 = Math.min(cw, view.x + meta.w * view.s), sy1 = Math.min(ch, view.y + meta.h * view.s);
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round((sx1 - sx0) * dpr));
  c.height = Math.max(1, Math.round((sy1 - sy0) * dpr));
  paintScene(c.getContext('2d'), view.x - sx0, view.y - sy0);
  return c;
}

// Mapa entero con los trazos, con el lado mayor ≤ maxSide (con teselas: el nivel más fino que quepa).
async function renderFull(maxSide) {
  let k = Math.min(1, maxSide / Math.max(meta.w, meta.h));
  const c = document.createElement('canvas');
  if (meta.kind === 'tiles') {
    const T = meta.tiles;
    let z = T.zmax;
    while (z > T.zmin && Math.max(meta.w, meta.h) * 2 ** (z - T.zmax) > maxSide) z--;
    k = Math.min(k, 2 ** (z - T.zmax)) || 2 ** (z - T.zmax);
    c.width = Math.ceil(meta.w * k);
    c.height = Math.ceil(meta.h * k);
    const x = c.getContext('2d');
    x.imageSmoothingQuality = 'high';
    x.scale(k, k);
    const f = 2 ** (T.zmax - z), S = T.ts * f, loaded = new Map();
    const c0 = Math.floor(T.ox / S), c1 = Math.floor((meta.w - 1 + T.ox) / S), r0 = Math.floor(T.oy / S), r1 = Math.floor((meta.h - 1 + T.oy) / S);
    for (let row = r0; row <= r1; row++) {
      for (let col = c0; col <= c1; col++) {
        const [a, b] = fromColRow(T, col, row);
        const blob = await db.getTile(db.tileKey(meta.id, z, a, b));
        if (blob) loaded.set(`${z}/${a}/${b}`, await createImageBitmap(blob));
      }
    }
    const saved = view.s;
    view.s = 1e6; // sin relleno anti-costuras: aquí las teselas caen en píxeles enteros
    drawLevel(x, T, z, 0, 0, meta.w - 1, meta.h - 1, (zz, a, b) => loaded.get(`${zz}/${a}/${b}`));
    view.s = saved;
    for (const bm of loaded.values()) bm.close();
    for (const sh of shapes) drawShape(x, sh);
  } else if (img) {
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    const x = c.getContext('2d');
    x.imageSmoothingQuality = 'high';
    x.scale(k, k);
    x.drawImage(img, 0, 0);
    for (const sh of shapes) drawShape(x, sh);
  }
  return c;
}

function download(blob, suffix) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName() + suffix + '.png';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

let toastT = 0;
function toast(msg, ms = 3500) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => { t.hidden = true; }, ms);
}

// La imagen se genera dentro de la promesa del ClipboardItem: así la copia conserva el permiso del
// clic aunque montar el mapa entero tarde unos segundos.
async function copyImage(make) {
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': (async () => toBlob(await make()))() })]);
    toast(t('copied'));
  } catch (e) {
    toast(t('copyFail', e.message));
  }
}

async function shareView() {
  const file = new File([await toBlob(renderView())], fileName() + '.png', { type: 'image/png' });
  if (!navigator.canShare?.({ files: [file] })) return toast(t('noShare'));
  try { await navigator.share({ files: [file], title: fileName() }); } catch (e) { if (e.name !== 'AbortError') toast(t('shareFail', e.message)); }
}

const SHARE = {
  copyView: () => copyImage(() => renderView()),
  copyFull: () => copyImage(() => renderFull(4096)), // 4096 px: Discord y compañía rechazan imágenes enormes
  dlView: async () => download(await toBlob(renderView()), ''),
  dlFull: async () => { toast(t('assemblingFull'), 60000); download(await toBlob(await renderFull(8192)), t('fullSuffix')); toast(t('downloaded')); },
  share: shareView,
};

function toggleShareMenu(force) {
  const m = $('shareMenu');
  m.hidden = typeof force === 'boolean' ? !force : !m.hidden;
}
$('bShare').onclick = (e) => { e.stopPropagation(); toggleShareMenu(); };
for (const b of document.querySelectorAll('#shareMenu button')) {
  b.onclick = async () => {
    toggleShareMenu(false);
    if (meta) await SHARE[b.dataset.act]();
  };
}
addEventListener('pointerdown', (e) => { if (!e.target.closest('#shareMenu, #bShare')) toggleShareMenu(false); });
if (!navigator.canShare) document.querySelector('#shareMenu [data-act=share]').hidden = true;

// ---------- galería ----------

let thumbUrls = [];

async function renderGallery() {
  const list = await db.listMeta();
  thumbUrls.forEach(URL.revokeObjectURL);
  thumbUrls = [];
  const box = $('galList');
  box.replaceChildren();
  for (const m of list) {
    const it = document.createElement('div');
    it.className = 'item' + (meta && m.id === meta.id ? ' cur' : '');
    if (m.thumb) {
      const im = document.createElement('img');
      im.src = URL.createObjectURL(m.thumb);
      thumbUrls.push(im.src);
      it.append(im);
    }
    const n = document.createElement('div');
    n.className = 'n';
    n.textContent = m.name;
    const d = document.createElement('div');
    d.className = 'd';
    d.textContent = `${m.host} · ${new Date(m.ts).toLocaleString(LOCALE, { dateStyle: 'short', timeStyle: 'short' })}`;
    const x = document.createElement('button');
    x.className = 'x';
    x.textContent = '✕';
    x.title = t('deleteMap');
    x.onclick = async (e) => {
      e.stopPropagation();
      if (!confirm(t('confirmDelete', m.name))) return;
      await db.remove(m.id);
      if (meta && m.id === meta.id) location.hash = '';
      renderGallery();
    };
    it.append(n, d, x);
    it.onclick = () => { location.hash = m.id; };
    box.append(it);
  }
  if (!list.length) box.textContent = t('noMaps');
}

function toggleGallery(force) {
  const g = $('gal');
  g.hidden = typeof force === 'boolean' ? !force : !g.hidden;
  if (!g.hidden) renderGallery();
}

// ---------- carga ----------

function showEmpty() {
  meta = null;
  img?.close?.();
  img = null;
  clearCache();
  shapes = [];
  $('name').value = '';
  $('src').removeAttribute('href');
  document.title = 'drawingamemaps';
  $('empty').hidden = false;
  toggleGallery(true);
  draw();
}

async function load() {
  const hash = decodeURIComponent(location.hash.slice(1));
  commitText();
  cur = null;
  drag = null;
  if (hash.startsWith('job=')) {
    showEmpty();
    $('empty').hidden = true;
    toggleGallery(false);
    const id = await runJob(hash.slice(4));
    location.hash = id || '';
    return;
  }
  const m = hash ? await db.getMeta(hash) : null;
  if (!m) return showEmpty();
  img?.close?.();
  img = null;
  clearCache();
  if (m.kind === 'tiles') {
    baseKeys = new Set();
    meta = m;
    // Precargar el nivel mínimo entero: es el fondo mientras llegan las teselas finas.
    const T = m.tiles, f = 2 ** (T.zmax - T.zmin), S = T.ts * f;
    for (let row = Math.floor(T.oy / S); row <= Math.floor((m.h - 1 + T.oy) / S); row++) {
      for (let col = Math.floor(T.ox / S); col <= Math.floor((m.w - 1 + T.ox) / S); col++) {
        const [a, b] = fromColRow(T, col, row);
        baseKeys.add(db.tileKey(m.id, T.zmin, a, b));
        tileBitmap(T.zmin, a, b);
      }
    }
  } else {
    const blob = await db.getBlob(m.id);
    if (!blob) return showEmpty();
    img = await createImageBitmap(blob);
    meta = m;
  }
  shapes = m.shapes || [];
  hist = [];
  redo = [];
  $('name').value = m.name;
  if (m.url) $('src').href = m.url; else $('src').removeAttribute('href');
  document.title = m.name + ' · drawingamemaps';
  $('empty').hidden = true;
  if (!$('gal').hidden) renderGallery();
  fit();
}

localizeHtml();
addEventListener('resize', resize);
addEventListener('hashchange', load);
setTool('pen');
setColor(COLORS[0]);
resize();
load();
