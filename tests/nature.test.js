import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame, seq, ramasse } from './helpers.js';
import { ensureNature, pickFlower, hitNature, pickVein, rollRainbow, rainbowVisible, digTreasure, freeSpot } from '../src/systems/nature.js';
import { act } from '../src/systems/actions.js';
import { isSolid } from '../src/world/map.js';
import { VEINS, VEIN_HP, ROCK_HP, NATURE } from '../src/data/nature.js';
import { FLOWERS } from '../src/data/items.js';

let k = 7; const rnd = () => ((k = (k * 9301 + 49297) % 233280) / 233280);
const game = (st = {}) => makeGame({ rnd, state: { inv: {}, season: 0, ...st } });

test('fleurs de saison partout sauf en ville, à cueillir', () => {
  for (const sc of ['farm', 'foret']) {   // pas de fleurs dans la caverne
    const { g, S } = game({ scene: sc });
    const N = ensureNature(g, sc), ids = FLOWERS[0].map(f => f.id);
    assert.ok(Object.keys(N.flowers).length > 0, sc);
    assert.ok(Object.values(N.flowers).every(f => ids.includes(f)));
    const [x, y] = Object.keys(N.flowers)[0].split(',').map(Number);
    assert.ok(pickFlower(g, x, y)); assert.equal(Object.values(S.inv).reduce((a, b) => a + b, 0), 1);
  }
  const { g } = game({ scene: 'town' });
  assert.equal(ensureNature(g, 'town'), null, 'rien en ville');
});

test('les fleurs fanent chaque jour, les cailloux restent', () => {
  const { g, S } = game({ scene: 'foret' });
  const N = ensureNature(g, 'foret'), rocks = { ...N.rocks }, f1 = JSON.stringify(N.flowers);
  S.day++; ensureNature(g, 'foret');
  assert.notEqual(JSON.stringify(N.flowers), f1);
  for (const r in rocks) assert.ok(N.rocks[r]);
  assert.ok(Object.values(N.rocks).filter(o => o.t === 'rock').length <= NATURE.foret.rocks);
});

test('filons : cuivre courant → or rare, et plus de coups de pioche que les cailloux', () => {
  const c = { copper: 0, tin: 0, iron: 0, gold: 0 };
  for (let i = 0; i < 1000; i++) c[pickVein(i / 1000)]++;
  assert.ok(c.copper > c.tin && c.tin > c.iron && c.iron > c.gold && c.gold > 0);
  assert.ok(VEIN_HP > ROCK_HP);
  const { g, S } = game({ scene: 'foret', sel: 'pick', tools: { pick: 1 }, energy: 999, maxE: 999 });
  S.nature = { foret: { day: S.year + '-' + S.season + '-' + S.day, flowers: {}, rocks: { '5,9': { t: 'vein', v: 'gold', hp: VEIN_HP } } } };
  assert.equal(isSolid(S, 5, 9), true);
  let hits = 0; while (S.nature.foret.rocks['5,9']) { assert.equal(act(g, 5, 9), 'hit'); hits++; }
  assert.equal(hits, VEIN_HP); ramasse(g);
  assert.ok(S.inv.gold_ore >= 2);
});

test('arc-en-ciel les jours de pluie, avec un trésor à son pied', () => {
  const { g, S } = makeGame({ rnd: seq(0.1, 0.5), state: { scene: 'farm', weather: 'rain', inv: {} } });
  const R = rollRainbow(g);
  assert.ok(R && freeSpot(S, 'farm', R.x, R.y) !== undefined);
  S.minute = R.from - 1; assert.equal(rainbowVisible(S), false);
  S.minute = R.from + 10; assert.equal(rainbowVisible(S), true);
  const m = S.money; assert.ok(digTreasure(g, R.x, R.y)); assert.ok(S.money > m);
  assert.equal(rainbowVisible(S), false, 'une seule fois');
  S.weather = 'sun'; assert.equal(rollRainbow(g), null, 'pas sans pluie');
});

test('caverne : des filons, mais pas de fleurs', () => {
  const { g } = game({ scene: 'wild' });
  const N = ensureNature(g, 'wild');
  assert.equal(Object.keys(N.flowers).length, 0);
});

test('16/11 : on coupe les arbres de la forêt (hache) ; souche, puis ils repoussent comme à la ferme', async () => {
  const { forestTreeAt, chopForest, isForestTree } = await import('../src/systems/foret.js');
  const { TREE_HP } = await import('../src/world/map.js');
  const { TREE_GROW_DAYS } = await import('../src/data/forest.js');
  const { LAYOUTS } = await import('../src/world/scenes.js');
  const L = LAYOUTS.foret; let x, y;
  outer: for (y = 1; y < L.length - 1; y++) for (x = 1; x < L[0].length - 1; x++) if (L[y][x] === 'T') break outer;
  const { g, S } = game({ scene: 'foret', sel: 'axe', tools: { axe: 1 }, energy: 99, inv: {} });
  assert.ok(isForestTree(x, y) && isSolid(S, x, y));
  assert.ok(!isForestTree(0, 3), 'les arbres du bord restent');
  for (let i = 0; i < TREE_HP; i++) assert.equal(act(g, x, y), 'hit');
  assert.ok(!forestTreeAt(S, x, y)); assert.equal(isSolid(S, x, y), false, 'souche : on passe');
  ramasse(g); assert.ok(S.inv.wood >= 3);
  S.day += TREE_GROW_DAYS; assert.ok(forestTreeAt(S, x, y), 'repoussé');
});
