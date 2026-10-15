// IndexedDB:
//   meta  → nombre, url, tipo, miniatura, trazos (uno por mapa)
//   blobs → imagen completa (mapas de imagen única y capturas)
//   tiles → teselas, clave "id/z/a/b" (a y b son los índices tal como van en la URL)
const DB_NAME = 'drawingamemaps';
let dbp;

function open() {
  return dbp ??= new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () => {
      const d = r.result;
      d.createObjectStore('meta', { keyPath: 'id' });
      d.createObjectStore('blobs');
      d.createObjectStore('tiles');
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

const req = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const done = (t) => new Promise((res, rej) => { t.oncomplete = () => res(); t.onerror = t.onabort = () => rej(t.error); });

export const tileKey = (id, z, a, b) => `${id}/${z}/${a}/${b}`;

export async function saveSnap(meta, blob) {
  const t = (await open()).transaction(['meta', 'blobs'], 'readwrite');
  t.objectStore('meta').put(meta);
  if (blob) t.objectStore('blobs').put(blob, meta.id);
  return done(t);
}

export async function putMeta(meta) {
  const t = (await open()).transaction('meta', 'readwrite');
  t.objectStore('meta').put(meta);
  return done(t);
}

export async function getMeta(id) {
  return req((await open()).transaction('meta').objectStore('meta').get(id));
}

export async function getBlob(id) {
  return req((await open()).transaction('blobs').objectStore('blobs').get(id));
}

// entries: [[key, blob], ...]
export async function putTiles(entries) {
  const t = (await open()).transaction('tiles', 'readwrite');
  const s = t.objectStore('tiles');
  for (const [k, b] of entries) s.put(b, k);
  return done(t);
}

export async function getTile(key) {
  return req((await open()).transaction('tiles').objectStore('tiles').get(key));
}

export async function listMeta() {
  const all = await req((await open()).transaction('meta').objectStore('meta').getAll());
  return all.sort((a, b) => b.ts - a.ts);
}

export async function remove(id) {
  const t = (await open()).transaction(['meta', 'blobs', 'tiles'], 'readwrite');
  t.objectStore('meta').delete(id);
  t.objectStore('blobs').delete(id);
  t.objectStore('tiles').delete(IDBKeyRange.bound(id + '/', id + '/￿'));
  return done(t);
}
