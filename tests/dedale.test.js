import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { LAYOUTS, SCENES, DEDALE_LADDER, DEDALE_ROUTE, QUARRY_W, QUARRY_H, BIG_ROCK } from '../src/world/scenes.js';
import { ensureTrees, chopDedale, updateDedale, DTREES, TREE_HITS } from '../src/systems/dedale.js';
import { hitBigRock, ROCK_HITS } from '../src/systems/bigrock.js';
import { ensureNature } from '../src/systems/nature.js';
import { startBattle, heroAct } from '../src/systems/battle.js';
import { MOBS } from '../src/data/wild.js';
import { act } from '../src/systems/actions.js';

const rand = () => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const L = LAYOUTS.dedale;
test('lot 30b : le dédale profond est plus grand que la carrière, on y descend par le trou et on remonte par l’échelle', () => {
  assert.ok(L.length * L[0].length > QUARRY_W * QUARRY_H);
  assert.equal(L[DEDALE_LADDER.y][DEDALE_LADDER.x], 'D');
  const { g, S } = makeGame({ state: { scene: 'carriere', sel: 'pick', tools: { pick: 1 }, bigRock: { hits: ROCK_HITS } } });
  let went = null; assert.equal(hitBigRock(g, (to, sp) => { went = to; S.scene = to; Object.assign(S, sp); }), 'hole'); assert.equal(went, 'dedale');
  assert.equal(act(g, DEDALE_LADDER.x, DEDALE_LADDER.y), 'door'); assert.equal(S.scene, 'carriere');
  assert.ok(Math.abs(S.x - (BIG_ROCK.x + 2)) < 1);
  // tout le dédale est relié à l'échelle
  const seen = new Set(), q = [[DEDALE_LADDER.x, DEDALE_LADDER.y]], open = L.join('').split('').filter(c => c === '.').length;
  while (q.length) { const [x, y] = q.pop(), k = x + ',' + y; if (seen.has(k) || !L[y] || !'.D'.includes(L[y][x])) continue; seen.add(k); q.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]); }
  assert.equal(seen.size, open + 1);
});
test('lot 30b : arbres et chênes (plus robustes, bois de chêne), jamais au milieu des allées ; cailloux, filons et fleurs', () => {
  const { g, S } = makeGame({ rnd: rand(), state: { scene: 'dedale', x: DEDALE_LADDER.x + .5, y: DEDALE_LADDER.y + 1.5, sel: 'axe', tools: { axe: 1 }, energy: 1e6, inv: {}, skills: { mining: { xp: 0 }, wood: { xp: 1e6 } } } });
  const st = ensureTrees(g), keys = Object.keys(st.trees);
  assert.equal(keys.length, DTREES); assert.ok(keys.some(k => st.trees[k].t === 'oak') && keys.some(k => st.trees[k].t === 'tree'));
  for (const k of keys) assert.ok(!DEDALE_ROUTE.has(k));
  const N = ensureNature(g, 'dedale'); assert.ok(Object.keys(N.rocks).length > 40 && Object.keys(N.flowers).length > 0);
  for (const k in N.rocks) assert.ok(!st.trees[k], 'pas de caillou sur un arbre');
  const oak = keys.find(k => st.trees[k].t === 'oak'), [x, y] = oak.split(',').map(Number);
  g.now = () => (g._t = (g._t || 0) + 10000);
  for (let i = 0; i < TREE_HITS.oak; i++) chopDedale(g, x, y);
  assert.equal(st.trees[oak], undefined, 'chêne abattu après ' + TREE_HITS.oak + ' coups');
});
test('lot 30b : la marmotte à grandes griffes — toucher lance le combat, butin griffes et viande', () => {
  const { g, S } = makeGame({ rnd: rand(), state: { scene: 'dedale', x: DEDALE_LADDER.x + .5, y: DEDALE_LADDER.y + 1.5, tools: { sword: 1 }, inv: {} } });
  updateDedale(g, 0.016); assert.ok(g.enemies.length >= 5 && g.enemies.every(e => e.type === 'marmotte'));
  const m = g.enemies[0]; m.x = S.x + .2; m.y = S.y; g.player.iframe = 0; updateDedale(g, 0.016);
  assert.ok(g.battle); g.battle.foes.forEach(f => { f.hp = 1; }); g.battle.turn = true;
  g.rnd = () => 0.1; heroAct(g, { act: 'tech', tech: 'balayage' });
  assert.equal(g.battle.over, 'win'); assert.ok(S.inv.griffe_marmotte >= 1 && S.inv.viande_marmotte >= 1);
  assert.ok(MOBS.marmotte.hp > MOBS.slime_b.hp, 'plus coriace que les slimes');
});
