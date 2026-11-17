import { test } from 'node:test';
import assert from 'node:assert/strict';
import { autotile, canopy } from '../src/render/terrain.js';

const fakeCtx = () => { const px = new Map(); return { px, set fillStyle(c) { this.c = c; }, fillRect(x, y, w, h) { for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) px.set((x + i) + ',' + (y + j), this.c); } }; };

test('lot 11a : auto-tuilage — l’herbe déborde sur le chemin en liseré, coins intérieurs arrondis, jamais l’inverse', () => {
  const M = ['ggg', 'g..', 'g..'], g = fakeCtx();
  autotile(g, 3, 3, (x, y) => (M[y] || '')[x] === '.' ? 'chemin' : (M[y] || '')[x] === 'g' ? 'herbe' : null, { chemin: 1, herbe: 2 }, { herbe: '#00ff00' });
  const inTile = (tx, ty) => [...g.px.keys()].filter(k => { const [x, y] = k.split(',').map(Number); return x >> 4 === tx && y >> 4 === ty; });
  assert.equal(inTile(0, 0).length, 0, 'l’herbe ne reçoit rien');
  assert.ok(inTile(1, 1).length > 40, 'le chemin du coin reçoit le liseré');
  assert.ok(g.px.has('16,16') && g.px.has('19,19'), 'coin intérieur comblé');
  assert.ok(!g.px.has('31,31'), 'le reste du chemin reste du chemin');
  assert.ok(inTile(2, 2).length === 0, 'case entourée de chemin : rien');
});

test('lot 11b : canopée continue sur les arbres, lisière ombrée au sud', () => {
  const g = fakeCtx(); canopy(g, 3, 3, (x, y) => y === 0, 0);
  assert.ok(g.px.has('24,8'), 'feuillage sur la rangée d’arbres');
  assert.equal(g.px.get('8,17'), 'rgba(20,30,10,.3)', 'ombre sous la lisière');
});

test('lot 11g : palette unique (48 couleurs + 5 accents) ; chaque couleur ramenée à la plus proche', async () => {
  const { PALETTE, nearest } = await import('../src/render/pixel.js');
  assert.equal(PALETTE.length, 53); assert.equal(new Set(PALETTE).size, 53);
  assert.deepEqual(nearest(0x86, 0xa5, 0x42), [0x86, 0xa5, 0x42], 'une couleur de la palette reste elle-même');
  const p = nearest(10, 200, 30); assert.ok(PALETTE.includes('#' + p.map(v => v.toString(16).padStart(2, '0')).join('')));
});
