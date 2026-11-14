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
