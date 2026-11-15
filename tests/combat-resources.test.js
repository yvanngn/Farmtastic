import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame, seq } from './helpers.js';
import { attack, updateEnemies, spawnEnemies } from '../src/systems/combat.js';
import { hitObject } from '../src/systems/resources.js';
import { useEnergy, consume } from '../src/systems/player.js';

test('3 coups d’épée tuent un slime et donnent de la gelée', () => {
  const { g, S } = makeGame();
  const e = { x: S.x + 1, y: S.y, hp: 100, cd: 0, hit: 0 };
  g.enemies.push(e);
  attack(g, e); attack(g, e); attack(g, e);
  assert.equal(g.enemies.length, 0);
  assert.equal(S.inv.slime, 1);
  assert.equal(S.energy, 98.5);
});

test('contact ennemi : -10 PV, puis K.O. à 0', () => {
  const { g, S } = makeGame({ state: { hp: 10, money: 100 } });
  g.enemies.push({ x: S.x, y: S.y + 0.3, hp: 100, cd: 0, hit: 0 });
  updateEnemies(g, 0.016);
  assert.equal(S.hp, 50);
  assert.equal(S.money, 90);
  assert.equal(g.enemies.length, 0);
});

test('pas de monstre le jour par beau temps', () => {
  const { g } = makeGame({ rnd: seq(0) });
  spawnEnemies(g, 1);
  assert.equal(g.enemies.length, 0);
});

test('arbre : hache obligatoire, 3 coups, bois récolté', () => {
  const { g, S, toasts } = makeGame({ rnd: seq(0.9) });
  S.objs['30,20'] = { t: 'tree', hp: 3 };
  assert.equal(hitObject(g, 30, 20), false);
  assert.match(toasts()[0], /hache/);
  S.sel = 'axe';
  hitObject(g, 30, 20); hitObject(g, 30, 20); hitObject(g, 30, 20);
  assert.equal(S.objs['30,20'], undefined);
  assert.equal(S.inv.wood, 5);
  assert.equal(S.energy, 97, '1 énergie par coup');
});

test('énergie insuffisante bloque l’action', () => {
  const { g, S } = makeGame({ state: { energy: 1 } });
  assert.equal(useEnergy(g, 2), false);
  assert.equal(S.energy, 1);
});

test('manger restaure, sans dépasser le maximum', () => {
  const { g, S } = makeGame({ state: { energy: 95, hp: 50, inv: { egg: 1 } } });
  assert.equal(consume(g, 'egg'), true);
  assert.equal(S.energy, 100);
  assert.equal(S.hp, 55);
});

// ---- Lot 3 : bois de l'est ----
import { regrow, forestCount, treeKind } from '../src/systems/resources.js';
import { FOREST, TREE_GROW_DAYS, ROCK_DAYS } from '../src/data/forest.js';
import { genObjects } from '../src/world/map.js';

test('bois de l’est : de nouvelles pousses n’apparaissent que dans la zone, sans dépasser le maximum', () => {
  let i = 0; const { g, S } = makeGame({ rnd: () => ((i = (i * 9301 + 49297) % 233280) / 233280) });
  for (let d = 0; d < 60; d++) regrow(g);
  const c = forestCount(S);
  assert.ok(c.trees <= FOREST.MAX_TREES && c.trees > 30, 'arbres : ' + c.trees);
  assert.ok(c.rocks <= FOREST.MAX_ROCKS && c.rocks > 10, 'pierres : ' + c.rocks);
  for (const k in S.objs) assert.ok(+k.split(',')[0] >= FOREST.x0, 'rien ne repousse hors du bois : ' + k);
  const kinds = new Set(Object.entries(S.objs).filter(([, o]) => o.t === 'tree').map(([k, o]) => o.k));
  assert.deepEqual([...kinds].sort(), ['birch', 'oak', 'pine'], '3 essences');
});

test('un arbre met 3 jours à pousser avant de donner du bois', () => {
  const { g, S, toasts } = makeGame({ state: { sel: 'axe', inv: {} } });
  S.objs['40,10'] = { t: 'tree', k: 'pine', g: 0, hp: 3 };
  S.x = 40.5; S.y = 11.5;
  assert.equal(hitObject(g, 40, 10), false);
  assert.match(toasts().at(-1), /sapin pousse encore \(3 j\)/);
  for (let d = 0; d < TREE_GROW_DAYS; d++) regrow(g);
  assert.equal(S.objs['40,10'].g, 3);
  hitObject(g, 40, 10); hitObject(g, 40, 10); hitObject(g, 40, 10);
  assert.ok(S.inv.wood >= 3, 'le sapin donne du bois');
});

test('pierres : la petite donne 1 pierre, la plus grosse 2', () => {
  const { g, S } = makeGame({ state: { sel: 'pick', inv: {}, tools: { axe: 1, pick: 3, sickle: 1, sword: 1 } } });
  S.objs['40,10'] = { t: 'rock', hp: 2 }; S.objs['41,10'] = { t: 'rock_big', hp: 3 };
  hitObject(g, 40, 10);
  assert.equal(S.inv.stone, 1);
  hitObject(g, 41, 10);
  assert.equal(S.inv.stone, 3);
});

test('une pierre prévue sort de terre au bout de 3 jours', () => {
  const { g, S } = makeGame();
  S.objs = {}; S.rockQueue = [{ k: '44,20', d: ROCK_DAYS, big: true }];
  regrow(g); regrow(g);
  assert.equal(S.objs['44,20'], undefined);
  regrow(g);
  assert.equal(S.objs['44,20'].t, 'rock_big');
});

test('carte de départ : le bois respecte ses limites ; anciens arbres = adultes', () => {
  const S = { objs: genObjects() }, c = forestCount(S);
  assert.ok(c.trees <= FOREST.MAX_TREES && c.rocks <= FOREST.MAX_ROCKS, JSON.stringify(c));
  assert.ok(['oak', 'pine', 'birch'].includes(treeKind({ t: 'tree' }, 3, 4)));
});
