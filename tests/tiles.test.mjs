// How tile URLs are read and rebuilt. This is what decides whether a map can be saved at all.
import assert from 'node:assert/strict';
import { test } from 'node:test';

globalThis.chrome = { i18n: { getMessage: (k) => k, getUILanguage: () => 'en' } };
const { parseUrl, tileUrl, inferTemplates, levelOfUrl, levelInfo } = await import('../src/tiles.js');

const O = 'https://maps.example';

test('parseUrl splits a URL by its numbers', () => {
  const p = parseUrl(`${O}/tiles/3/5/7.png`);
  assert.equal(p.origin, O);
  assert.deepEqual(p.nums, ['3', '5', '7']);
  assert.deepEqual(p.parts, ['/tiles/', '/', '/', '.png']);
});

test('parseUrl: a hyphen between numbers is a separator', () => {
  assert.deepEqual(parseUrl(`${O}/x/3-1-2.png`).nums, ['3', '1', '2']);
});

test('parseUrl: a hyphen after a separator is a sign', () => {
  assert.deepEqual(parseUrl(`${O}/x/-3/2.png`).nums, ['-3', '2']);
  assert.deepEqual(parseUrl(`${O}/t?x=-3&y=2`).nums, ['-3', '2']);
});

test('parseUrl reads the query too, and rejects what is not a URL', () => {
  assert.deepEqual(parseUrl(`${O}/t?z=1&x=2&y=3`).nums, ['1', '2', '3']);
  assert.equal(parseUrl('not a url'), null);
});

const plantilla = (extra) => ({ origin: O, parts: ['/tiles/', '/', '/', '.png'], rep: ['3', '5', '7'], zi: 0, xy: [1, 2], ...extra });

test('tileUrl rebuilds the URL', () => {
  assert.equal(tileUrl(plantilla(), 4, 1, 2), `${O}/tiles/4/1/2.png`);
});

test('tileUrl keeps zero padding', () => {
  assert.equal(tileUrl(plantilla({ rep: ['3', '005', '07'] }), 4, 1, 2), `${O}/tiles/4/001/02.png`);
});

test('tileUrl keeps a negative coordinate as it is', () => {
  assert.equal(tileUrl(plantilla({ rep: ['3', '05', '07'] }), 4, -1, 2), `${O}/tiles/4/-1/02.png`);
});

test('tileUrl without zoom: a flat grid leaves the other numbers alone', () => {
  assert.equal(tileUrl(plantilla({ zi: -1 }), 9, 1, 2), `${O}/tiles/3/1/2.png`);
});

test('levels numbered backwards', () => {
  const t = plantilla({ inv: true });
  assert.equal(levelOfUrl(t, 38), 2);
  assert.equal(levelOfUrl(plantilla(), 38), 38);
  assert.equal(tileUrl(t, 2, 1, 2), `${O}/tiles/38/1/2.png`);
});

test('inferTemplates: two numbers vary, the fixed small one is the zoom', () => {
  const [t, ...resto] = inferTemplates([`${O}/t/2/0/0.png`, `${O}/t/2/0/1.png`, `${O}/t/2/1/0.png`]);
  assert.deepEqual(t.xy, [1, 2]);
  assert.deepEqual(t.zc, [0]);
  assert.equal(t.count, 3);
  assert.equal(resto.length, 0);
});

test('inferTemplates: a changing timestamp is not a coordinate', () => {
  const [t] = inferTemplates([`${O}/t/2/0/0.png?v=1700000001`, `${O}/t/2/0/1.png?v=1700000002`, `${O}/t/2/1/0.png?v=1700000003`]);
  assert.deepEqual(t.xy, [1, 2]);
});

test('inferTemplates: Deep Zoom takes the number after _files/ as the zoom', () => {
  const [t] = inferTemplates([`${O}/x_files/9/0_0.jpg`, `${O}/x_files/10/1_0.jpg`, `${O}/x_files/11/3_1.jpg`]);
  assert.deepEqual(t.zc, [0]);
  assert.deepEqual(t.xy, [1, 2]);
});

test('inferTemplates: the zoom is the number that doubles the coordinates', () => {
  const urls = [];
  for (const z of [3, 4, 5]) {
    const n = 2 ** z;
    urls.push(`${O}/m/${n - 1}/${z}/${n - 1}.png`, `${O}/m/0/${z}/0.png`);
  }
  const [t] = inferTemplates(urls);
  assert.deepEqual(t.zc, [1]);
  assert.deepEqual(t.xy, [0, 2]);
});

test('inferTemplates: a single tile counts if it looks like z/x/y', () => {
  const [t] = inferTemplates([`${O}/map/0/0/0.webp`]);
  assert.deepEqual(t.xy, [1, 2]);
  assert.deepEqual(t.zc, [0]);
});

test('inferTemplates ignores what is not a grid of tiles', () => {
  assert.deepEqual(inferTemplates([`${O}/logo.png`, `${O}/a/1/b/2.png`, 'not a url']), []);
});

test('inferTemplates puts the largest group first, and repeated URLs count once', () => {
  const a = [`${O}/a/1/0/0.png`, `${O}/a/1/0/1.png`, `${O}/a/1/1/0.png`, `${O}/a/1/1/1.png`];
  const b = [`${O}/b/1/0/0.png`, `${O}/b/1/0/1.png`, `${O}/b/1/1/0.png`];
  const out = inferTemplates([...b, ...a, ...a]);
  assert.equal(out[0].parts[0], '/a/');
  assert.equal(out[0].count, 4);
});

test('levelInfo: each level has four times the tiles of the previous one', () => {
  const info = { zmin: 2, base: [[0, 0], [1, 0], [0, 1], [1, 1]], ts: 256, avgBytes: 1048576 };
  assert.deepEqual(levelInfo(info, 2), { z: 2, maxTiles: 4, pxA: 512, pxB: 512, mb: 4 });
  assert.deepEqual(levelInfo(info, 3), { z: 3, maxTiles: 16, pxA: 1024, pxB: 1024, mb: 16 });
});

test('levelInfo: Deep Zoom halves the image per level and rounds tiles up', () => {
  const info = { dziSize: [1000, 500], zmax: 10, ts: 256, avgBytes: 1048576 };
  assert.deepEqual(levelInfo(info, 10), { z: 10, maxTiles: 8, pxA: 1000, pxB: 500, mb: 8 });
  assert.deepEqual(levelInfo(info, 9), { z: 9, maxTiles: 2, pxA: 500, pxB: 250, mb: 2 });
});
