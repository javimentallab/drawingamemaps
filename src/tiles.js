// Teselas: deducir la plantilla de URL a partir de lo que cargó la página, explorar
// niveles y extensión con peticiones de prueba, descargar y averiguar la orientación.
//
// Una plantilla es la URL partida por sus números: parts[0] n0 parts[1] n1 ... parts[k].
// zi es el índice del número que hace de zoom; xy los dos que hacen de coordenadas,
// en el orden en que salen en la URL ("a" y "b"; cuál es columna y cuál fila se decide
// al final mirando qué bordes casan).

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const half = (v) => Math.floor(v / 2);

export function parseUrl(u) {
  let url;
  try { url = new URL(u); } catch { return null; }
  const rest = url.pathname + url.search;
  const parts = [], nums = [];
  let last = 0;
  for (const m of rest.matchAll(/-?\d+/g)) {
    let i = m.index, s = m[0];
    // El guion solo es signo si va tras un separador ("/-3/"); en "3-1-2" es separador.
    if (s[0] === '-' && i > 0 && !'/=_,&?'.includes(rest[i - 1])) { i++; s = s.slice(1); }
    parts.push(rest.slice(last, i));
    nums.push(s);
    last = i + s.length;
  }
  parts.push(rest.slice(last));
  return { origin: url.origin, parts, nums };
}

const fmt = (v, rep) => (rep.length > 1 && rep[0] === '0' && v >= 0 ? String(v).padStart(rep.length, '0') : String(v));

// Internamente el nivel siempre crece con el detalle. Algunas webs numeran al revés
// (Genshin: "..._N2" = más alejado que "..._N1"); entonces nivel interno = INV - número de la URL.
const INV = 40;
const urlZ = (t, z) => (t.inv ? INV - z : z);
export const levelOfUrl = (t, zUrl) => (t.inv ? INV - zUrl : zUrl);

export function tileUrl(t, z, a, b) {
  const nums = t.rep.slice();
  if (t.zi >= 0) nums[t.zi] = fmt(urlZ(t, z), t.rep[t.zi]); // zi = -1: rejilla plana, sin zoom
  nums[t.xy[0]] = fmt(a, t.rep[t.xy[0]]);
  nums[t.xy[1]] = fmt(b, t.rep[t.xy[1]]);
  let s = t.parts[0];
  for (let i = 0; i < nums.length; i++) s += nums[i] + t.parts[i + 1];
  return t.origin + s;
}

// Agrupa URLs que solo se diferencian en sus números y se queda con los grupos donde
// varían 2 números (x, y; el zoom fijo) o 3 (zoom también). Devuelve candidatas, sin verificar.
export function inferTemplates(urls) {
  const groups = new Map();
  for (const u of new Set(urls)) {
    const p = parseUrl(u);
    if (!p || p.nums.length < 2) continue;
    const key = p.parts.join('\u0000');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }
  const out = [];
  for (const g of groups.values()) {
    if (g.length < 3) {
      // Con el zoom inicial algunos visores solo piden 1-2 teselas (th.gl: ".../0/0/0.webp").
      // Si la ruta acaba en número/número/número.imagen, probar z/x/y; las sondas lo confirmarán.
      const p = g[0], path = new URL(p.origin + p.parts.map((s, i) => s + (p.nums[i] ?? '')).join('')).pathname;
      if (!/\d+[\/_-]-?\d+[\/_-]-?\d+\.(png|jpe?g|webp|avif|gif)$/i.test(path)) continue;
      const k = parseUrl(p.origin + path).nums.length;
      out.push({ origin: p.origin, parts: p.parts, rep: p.nums, xy: [k - 2, k - 1], zc: [k - 3], samples: g.map((q) => q.nums), count: g.length });
      continue;
    }
    const n = g[0].nums.length;
    const distinct = [...Array(n)].map((_, i) => new Set(g.map((p) => p.nums[i])));
    // Números enormes que cambian = marcas de tiempo o "cache busters", no coordenadas.
    const vary = [...Array(n).keys()].filter((i) => distinct[i].size > 1 && ![...distinct[i]].some((v) => Math.abs(+v) > 1e6));
    let xy, zc;
    if (vary.length === 2) {
      xy = vary;
      // Zoom candidato: números fijos pequeños, empezando por el que va justo antes de x/y.
      const score = (i) => (i < xy[0] ? xy[0] - i : 100 + i);
      zc = [...Array(n).keys()].filter((i) => !vary.includes(i) && +g[0].nums[i] >= 0 && +g[0].nums[i] <= 30).sort((a, b) => score(a) - score(b));
    } else if (vary.length === 3) {
      // Deep Zoom (".../nombre_files/{z}/{x}_{y}.jpg"): el zoom es el número tras "_files/".
      // Si no, el que al subir 1 hace que las coordenadas se dupliquen (o se dividan, si va al
      // revés). Contar valores distintos no vale: con pocos niveles vistos la "y" puede tener menos.
      const dzi = g[0].parts.findIndex((s) => s.endsWith('_files/'));
      const score = (zi) => {
        const [o0, o1] = vary.filter((i) => i !== zi), byZ = new Map();
        for (const p of g) {
          const z = +p.nums[zi], m = byZ.get(z) || [0, 0];
          byZ.set(z, [Math.max(m[0], Math.abs(+p.nums[o0])), Math.max(m[1], Math.abs(+p.nums[o1]))]);
        }
        const zs = [...byZ.keys()].sort((a, b) => a - b);
        let err = 0, cnt = 0;
        // Entre dos niveles separados d, las coordenadas máximas deben multiplicarse por 2^d.
        for (let i = 1; i < zs.length; i++) {
          const d = zs[i] - zs[i - 1];
          if (d > 6) continue;
          const lo = byZ.get(zs[i - 1]), hi = byZ.get(zs[i]);
          for (const k of [0, 1]) {
            if (lo[k] > 0 && hi[k] > 0) { err += Math.abs(Math.abs(Math.log2(hi[k] / lo[k])) - d) / d; cnt++; }
          }
        }
        // Exigir datos en las dos coordenadas; si no, sin información (se decide por valores distintos).
        return cnt >= 2 ? err / cnt : 9;
      };
      const z = vary.includes(dzi) ? dzi : [...vary].sort((a, b) => score(a) - score(b) || distinct[a].size - distinct[b].size)[0];
      xy = vary.filter((i) => i !== z);
      zc = [z];
    } else continue;
    // Sin candidato a zoom puede ser una rejilla plana de un solo nivel (se prueba en job.js).
    out.push({ origin: g[0].origin, parts: g[0].parts, rep: g[0].nums, xy, zc, samples: g.map((p) => p.nums), count: g.length });
  }
  return out.sort((a, b) => b.count - a.count);
}

function sniff(b) {
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e) return 'image/png';
  if (b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg';
  if (b[0] === 0x52 && b[1] === 0x49 && b[8] === 0x57 && b[9] === 0x45) return 'image/webp';
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'image/gif';
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return 'image/avif';
  return null;
}

// Descarga una URL y devuelve un Blob de imagen o null (404, 403, HTML de error...).
export async function fetchImage(url, signal) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { credentials: 'include', signal });
      if (r.status === 429 || r.status >= 500) { await sleep(1000 * (attempt + 1)); continue; }
      if (!r.ok) return null;
      const buf = await r.arrayBuffer();
      const type = sniff(new Uint8Array(buf, 0, Math.min(16, buf.byteLength)));
      return type ? new Blob([buf], { type }) : null;
    } catch (e) {
      if (signal?.aborted) throw e;
      await sleep(600 * (attempt + 1));
    }
  }
  return null;
}

// Caché de sondeo: cada URL se pide una sola vez durante el análisis.
export function prober(signal) {
  const cache = new Map();
  const get = (url) => {
    if (!cache.has(url)) cache.set(url, fetchImage(url, signal));
    return cache.get(url);
  };
  get.cache = cache;
  return get;
}

// Decide qué número es el zoom: el que, al bajarlo 1 y dividir x/y entre 2, sigue dando tesela
// (o al subirlo y multiplicar).
//
// El sentido (¿el número crece con el detalle?) se decide desde la tesela más alejada del origen:
// sus coordenadas dobles solo existen en el nivel con más detalle, que abarca el doble de teselas.
// Mirar solo "¿existe la madre en coordenadas mitad?" no vale: en el nivel fino también existe.
export async function resolveZoom(cand, get) {
  const [A, B] = cand.xy;
  const sorted = cand.samples.slice().sort((p, q) => (+q[A] + +q[B]) - (+p[A] + +p[B]));
  const tries = [...new Set([sorted[0], sorted[1], sorted[sorted.length - 1], sorted[2]].filter(Boolean))];
  for (const zi of cand.zc) {
    const t0 = { ...cand, zi, inv: false }, t1 = { ...cand, zi, inv: true };
    for (const s of tries) {
      const z = +s[zi], a = +s[A], b = +s[B];
      if (!(await get(tileUrl(t0, z, a, b)))) continue;
      const kids = async (zz) => zz >= 0 && !!(await get(tileUrl(t0, zz, 2 * a, 2 * b)) || await get(tileUrl(t0, zz, 2 * a + 1, 2 * b + 1)));
      const mom = async (zz) => zz >= 0 && !!(await get(tileUrl(t0, zz, half(a), half(b))));
      const up = await kids(z + 1), down = await kids(z - 1);
      if (up && !down) return t0;
      if (down && !up) return t1;
      const pDown = await mom(z - 1), pUp = await mom(z + 1);
      if (pDown && !pUp) return t0;
      if (pUp && !pDown) return t1;
      if (up || pDown) return t0;
    }
  }
  return null;
}

// Teselas de relleno: hay servidores que fuera del mapa devuelven siempre la misma imagen
// (transparente o de un color) en vez de un 404. Se reconoce comparando bytes con una tesela
// pedida muy lejos del mapa.
async function sig(blob) {
  if (blob.size > 4096) return null;
  let h = 2166136261;
  for (const x of new Uint8Array(await blob.arrayBuffer())) { h ^= x; h = Math.imul(h, 16777619); }
  return blob.size + ':' + (h >>> 0);
}
export async function isBlank(get, blob) {
  if (!blob || !get.blank?.size) return false;
  const s = await sig(blob);
  return s !== null && get.blank.has(s);
}
// Devuelve la tesela solo si existe y no es de relleno.
const real = async (get, url) => { const b = await get(url); return b && !(await isBlank(get, b)) ? b : null; };

// Nivel mínimo, teselas que existen en él (relleno por vecinos) y nivel máximo.
export async function explore(t, get, onStep = () => {}) {
  const seeds = t.samples.map((s) => [levelOfUrl(t, +s[t.zi]), +s[t.xy[0]], +s[t.xy[1]]]);
  const valid = (z) => urlZ(t, z) >= 0;
  let best = null;
  for (const [z0, a0, b0] of seeds.slice(0, 6)) {
    let z = z0, a = a0, b = b0;
    if (!(await get(tileUrl(t, z, a, b)))) continue;
    while (valid(z - 1) && z0 - z < 12 && await get(tileUrl(t, z - 1, half(a), half(b)))) { z--; a = half(a); b = half(b); onStep(); }
    if (!best || z < best[0]) best = [z, a, b];
  }
  if (!best) throw new Error('Las teselas vistas no responden.');
  const [zmin, sa, sb] = best;
  get.blank = new Set();
  for (const d of [4099, -4099]) {
    const far = await get(tileUrl(t, zmin, sa + d, sb + d));
    const s = far && await sig(far);
    if (s) get.blank.add(s);
  }

  // Relleno por vecinos en el nivel mínimo, con tope por si el servidor responde a todo.
  const LIMIT = 400;
  const base = [], seen = new Set([sa + ',' + sb]);
  let queue = [[sa, sb]], probes = 0, capped = false;
  while (queue.length) {
    const batch = queue;
    queue = [];
    const res = await Promise.all(batch.map(([a, b]) => real(get, tileUrl(t, zmin, a, b))));
    batch.forEach(([a, b], i) => {
      if (!res[i]) return;
      base.push([a, b]);
      for (const [na, nb] of [[a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]]) {
        const k = na + ',' + nb;
        if (seen.has(k)) continue;
        seen.add(k);
        if (++probes > LIMIT) { capped = true; continue; }
        queue.push([na, nb]);
      }
    });
    onStep();
  }

  // Nivel máximo: bajar desde una tesela central mientras alguna hija exista.
  const ca = base.reduce((s, p) => s + p[0], 0) / base.length, cb = base.reduce((s, p) => s + p[1], 0) / base.length;
  let [a, b] = base.slice().sort((p, q) => Math.hypot(p[0] - ca, p[1] - cb) - Math.hypot(q[0] - ca, q[1] - cb))[0];
  let zmax = zmin;
  for (let z = zmin + 1; z <= zmin + 18 && valid(z); z++) {
    let found = null;
    for (const [da, db] of [[0, 0], [1, 1], [1, 0], [0, 1]]) {
      if (await real(get, tileUrl(t, z, a * 2 + da, b * 2 + db))) { found = [a * 2 + da, b * 2 + db]; break; }
    }
    onStep();
    if (!found) break;
    [a, b] = found;
    zmax = z;
  }

  // Tamaño de tesela y peso medio, con lo que ya está en caché.
  let ts = 0, bytes = 0, nb = 0;
  for (const [url, p] of get.cache) {
    const blob = await p;
    if (!blob || !url.startsWith(t.origin)) continue;
    bytes += blob.size;
    nb++;
    if (ts < 1024) {
      try {
        const bmp = await createImageBitmap(blob);
        ts = Math.max(ts, bmp.width, bmp.height);
        bmp.close();
      } catch {}
    }
  }
  return { zmin, zmax, base, capped, ts: ts || 256, avgBytes: nb ? bytes / nb : 30000 };
}

export function levelInfo(info, z) {
  if (info.dziSize) {
    const pxA = Math.ceil(info.dziSize[0] / 2 ** (info.zmax - z)), pxB = Math.ceil(info.dziSize[1] / 2 ** (info.zmax - z));
    const maxTiles = Math.ceil(pxA / info.ts) * Math.ceil(pxB / info.ts);
    return { z, maxTiles, pxA, pxB, mb: (maxTiles * info.avgBytes) / 1048576 };
  }
  const k = 2 ** (z - info.zmin);
  const as = info.base.map((p) => p[0]), bs = info.base.map((p) => p[1]);
  const spanA = (Math.max(...as) - Math.min(...as) + 1) * k, spanB = (Math.max(...bs) - Math.min(...bs) + 1) * k;
  const maxTiles = info.base.length * k * k;
  return { z, maxTiles, pxA: spanA * info.ts, pxB: spanB * info.ts, mb: (maxTiles * info.avgBytes) / 1048576 };
}

async function pool(items, n, fn) {
  let i = 0;
  await Promise.all([...Array(Math.min(n, items.length))].map(async () => { while (i < items.length) await fn(items[i++]); }));
}

// Descarga de zmin a zsel; cada nivel solo pide hijas de teselas que existieron en el anterior.
export async function downloadLevels(t, info, zsel, get, { onTile, onProgress, signal }) {
  let cur = info.base;
  const counts = {};
  for (let z = info.zmin; z <= zsel; z++) {
    const cand = z === info.zmin ? cur : cur.flatMap(([a, b]) => [[2 * a, 2 * b], [2 * a + 1, 2 * b], [2 * a, 2 * b + 1], [2 * a + 1, 2 * b + 1]]);
    const next = [];
    let done = 0;
    await pool(cand, 8, async ([a, b]) => {
      if (signal?.aborted) return;
      const url = tileUrl(t, z, a, b);
      const blob = get.cache.has(url) ? await get.cache.get(url) : await fetchImage(url, signal);
      get.cache.delete(url);
      if (blob && !(await isBlank(get, blob))) { await onTile(z, a, b, blob); next.push([a, b]); }
      onProgress(z, ++done, cand.length);
    });
    if (signal?.aborted) throw new DOMException('Cancelado', 'AbortError');
    counts[z] = next.length;
    cur = next;
  }
  return counts;
}

// ---------- orientación ----------
// Para cada par de teselas vecinas compara bordes: si "a+1" casa por la derecha, a es columna.
// Si "b+1" casa por abajo, b crece hacia abajo; si casa por arriba, está invertido (TMS).

async function edges(blob) {
  const bmp = await createImageBitmap(blob);
  const S = 48, c = new OffscreenCanvas(S, S), x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(bmp, 0, 0, S, S);
  bmp.close();
  const d = x.getImageData(0, 0, S, S).data;
  const g = (px, py) => { const i = (py * S + px) * 4; return d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11; };
  const e = { l: [], r: [], t: [], b: [] };
  for (let i = 0; i < S; i++) { e.l.push(g(0, i)); e.r.push(g(S - 1, i)); e.t.push(g(i, 0)); e.b.push(g(i, S - 1)); }
  const all = [...e.l, ...e.r, ...e.t, ...e.b], m = all.reduce((s, v) => s + v, 0) / all.length;
  e.var = all.reduce((s, v) => s + (v - m) ** 2, 0) / all.length;
  return e;
}

const diff = (p, q) => p.reduce((s, v, i) => s + Math.abs(v - q[i]), 0) / p.length;

// tiles: Map "a,b" → blob, todas del mismo nivel.
export async function detectOrientation(tiles) {
  const keys = [...tiles.keys()];
  const cache = new Map();
  const E = async (k) => { if (!cache.has(k)) cache.set(k, await edges(tiles.get(k))); return cache.get(k); };
  const acc = { rl0: [], rl1: [], bt0: [], bt1: [], tb0: [], tb1: [] };
  let checked = 0;
  for (const k of keys) {
    if (checked > 120) break;
    const [a, b] = k.split(',').map(Number);
    const n0 = `${a + 1},${b}`, n1 = `${a},${b + 1}`;
    if (!tiles.has(n0) || !tiles.has(n1)) continue;
    const A = await E(k);
    if (A.var < 20) continue; // teselas lisas (mar, vacío) no dicen nada
    const B0 = await E(n0), B1 = await E(n1);
    acc.rl0.push(diff(A.r, B0.l)); acc.rl1.push(diff(A.r, B1.l));
    acc.bt0.push(diff(A.b, B0.t)); acc.bt1.push(diff(A.b, B1.t));
    acc.tb0.push(diff(A.t, B0.b)); acc.tb1.push(diff(A.t, B1.b));
    checked++;
  }
  if (!checked) return { swap: false, flip: false, sure: false };
  const avg = (v) => v.reduce((s, x) => s + x, 0) / v.length;
  const m = Object.fromEntries(Object.entries(acc).map(([k, v]) => [k, avg(v)]));
  const normal = m.rl0 + Math.min(m.bt1, m.tb1);
  const swapped = m.rl1 + Math.min(m.bt0, m.tb0);
  const swap = swapped < normal;
  const flip = swap ? m.tb0 < m.bt0 : m.tb1 < m.bt1;
  return { swap, flip, sure: checked >= 3 };
}

// ---------- Deep Zoom (OpenSeadragon) ----------
// ".../nombre_files/{z}/{x}_{y}.jpg" → el descriptor ".../nombre.dzi" trae tamaño de tesela y solape.
export async function readDzi(t) {
  const full = tileUrl(t, +t.rep[t.zi], +t.rep[t.xy[0]], +t.rep[t.xy[1]]);
  const i = full.indexOf('_files/');
  if (i < 0) return null;
  const base = full.slice(0, i);
  for (const ext of ['.dzi', '.xml']) {
    try {
      const r = await fetch(base + ext, { credentials: 'include' });
      if (!r.ok) continue;
      const doc = new DOMParser().parseFromString(await r.text(), 'application/xml');
      const im = doc.querySelector('Image'), sz = doc.querySelector('Size');
      if (!im || !sz) continue;
      return { ts: +im.getAttribute('TileSize'), overlap: +im.getAttribute('Overlap') || 0, w: +sz.getAttribute('Width'), h: +sz.getAttribute('Height') };
    } catch {}
  }
  return null;
}
