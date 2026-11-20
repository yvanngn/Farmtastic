// 20/11 (demande de l'utilisateur) : cohérence des trajets de la carte, hache toujours accessible, visée des outils.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCENES, LAYOUTS, SOLID_TILES } from '../src/world/scenes.js';
import { genObjects, isSolid, setFarmLot, AXE_GOALS } from '../src/world/map.js';
import { farmDoor } from '../src/systems/farms.js';
import { aimTile } from '../src/systems/reach.js';
import { CFG } from '../src/config.js';

// Où mène réellement chaque porte (en tenant compte des sorties de fermes et des portes « lot »)
const resolve = (S, sc, d) => { const fd = farmDoor({ ...S, scene: sc }, d); if (fd) return fd.to ? { to: fd.to, spawn: fd.spawn } : null; return { to: d.to, spawn: d.spawn }; };
const sizeOf = sc => sc === 'farm' ? { W: CFG.W, H: CFG.H } : SCENES[sc];
const walkable = (sc, x, y) => !isSolid({ scene: sc, objs: {}, built: {} }, Math.floor(x), Math.floor(y));

test('20/11 : chaque sortie extérieure dépose sur une case praticable, au bord par lequel on revient', () => {
  setFarmLot(0); const S = { farmLot: 0 }, bad = [];
  for (const sc of Object.keys(SCENES)) {
    if (sc === 'farm:0') continue;   // c'est « farm » pour le joueur de la ferme principale
    for (const d of SCENES[sc].doors) {
      const r = resolve(S, sc, d); if (!r || !r.spawn || !SCENES[r.to]) continue;
      const B = sizeOf(r.to), { x, y } = r.spawn;
      if (x < 0 || y < 0 || x >= B.W || y >= B.H || !walkable(r.to, x, y)) { bad.push(`${sc} (${d.x},${d.y}) → ${r.to} : arrivée (${x},${y}) bloquée`); continue; }
      if (!((SCENES[sc].outdoor || sc === 'farm') && (SCENES[r.to].outdoor || r.to === 'farm'))) continue;   // la suite : entre zones extérieures
      // une porte retour doit être à 3 cases au plus de l'arrivée
      const back = SCENES[r.to].doors.filter(o => { const rb = resolve(S, r.to, o); return rb && rb.to === sc; });
      if (!back.some(o => Math.hypot(o.x + .5 - x, o.y + .5 - y) <= 3.2)) bad.push(`${sc} (${d.x},${d.y}) → ${r.to} : arrivée (${x},${y}) loin de la porte de retour`);
    }
  }
  assert.deepEqual(bad, []);
});

test('20/11 : la hache est toujours accessible depuis l’entrée de la ferme, quelle que soit la graine', () => {
  setFarmLot(0);
  for (let seed = 1; seed <= 60; seed++) {
    const o = genObjects(seed * 7919), S = { scene: 'farm', objs: o, built: {} };
    const block = (x, y) => isSolid(S, x, y) || (o[x + ',' + y] && o[x + ',' + y].t !== 'stump' ? true : !!o[x + ',' + y]);
    const seen = new Set(['16,33']), q = [[16, 33]];
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || nx < 0 || ny < 0 || nx >= CFG.W || ny >= CFG.H || block(nx, ny)) continue; seen.add(k); q.push([nx, ny]); } }
    assert.ok(AXE_GOALS.some(([x, y]) => seen.has(x + ',' + y)), 'graine ' + seed);
  }
});

test('20/11 : avec la hache, on vise l’arbre le plus proche même s’il n’est pas pile en face', () => {
  const S = { scene: 'farm', x: 10.5, y: 10.8, dir: 3, objs: { '12,9': { t: 'tree', hp: 8 } } };
  assert.deepEqual(aimTile(S, 'axe', { tx: 11, ty: 10 }) && [aimTile(S, 'axe', { tx: 11, ty: 10 }).tx, aimTile(S, 'axe', { tx: 11, ty: 10 }).ty], [12, 9]);
  S.dir = 2; assert.equal(aimTile(S, 'axe', { tx: 9, ty: 10 }), null, 'pas derrière soi');
});

test('20/11 : aucun chemin ne touche un bord sans sortie', () => {
  const bad = [];
  for (const sc of Object.keys(SCENES)) {
    if (!SCENES[sc].outdoor || !LAYOUTS[sc] || sc === 'town' || sc === 'foret') continue;
    const L = LAYOUTS[sc], H = L.length, W = L[0].length;
    for (let y = 1; y < H - 1; y++) for (const [x, bx] of [[1, 0], [W - 2, W - 1]]) if (L[y][x] === '.' && L[y][bx] !== 'D' && !(L[y - 1][x] === '.' || L[y + 1][x] === '.')) bad.push(`${sc} (${x},${y})`);
    for (let x = 1; x < W - 1; x++) for (const [y, by] of [[1, 0], [H - 2, H - 1]]) if (L[y][x] === '.' && L[by][x] !== 'D' && !((L[y][x - 1] === '.' || L[y][x + 1] === '.'))) bad.push(`${sc} (${x},${y})`);
  }
  assert.deepEqual(bad, []);
});
