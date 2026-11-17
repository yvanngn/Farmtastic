import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame, seq, ramasse } from './helpers.js';
import { add, canAdd, usedSlots, cellsOf, stackSize } from '../src/systems/inventory.js';
import { level, gainXp, canUpgrade, upgradeTool, miningLevel } from '../src/systems/skills.js';
import { hitObject } from '../src/systems/resources.js';
import { buyBag, bagCost, buyStack } from '../src/systems/economy.js';
import { attack } from '../src/systems/combat.js';
import { CFG } from '../src/config.js';

test('sac limité : 10 objets max par case', () => {
  const { g, S, toasts } = makeGame({ state: { inv: {}, invSlots: 2 } });
  assert.equal(add(g, 'wood', 5), 5);
  assert.equal(add(g, 'stone', 1), 1);
  assert.equal(add(g, 'egg', 1), 0);
  assert.match(toasts().at(-1), /Sac plein/);
  assert.equal(add(g, 'wood', 6), 5, 'la case de bois se remplit jusqu’à 10');
  assert.equal(S.inv.wood, 10);
  assert.equal(canAdd(S, 'egg'), false);
});

test('une grosse quantité occupe plusieurs cases', () => {
  const { g, S } = makeGame({ state: { inv: {}, invSlots: 3 } });
  assert.equal(add(g, 'wood', 25), 25);
  assert.equal(usedSlots(S), 3);
  assert.deepEqual(cellsOf(S).map(c => c.n), [10, 10, 5]);
  assert.equal(add(g, 'wood', 9), 5, 'reste 5 places dans la dernière case');
  add(g, 'wood', -12);
  assert.equal(usedSlots(S), 2);
});

test('magasin d’amélioration : piles plus hautes', () => {
  const { g, S } = makeGame({ state: { money: 3000, inv: {}, invSlots: 1 } });
  assert.equal(stackSize(S), 10);
  assert.equal(buyStack(g), true);
  assert.equal(stackSize(S), 20);
  assert.equal(S.money, 2200);
  assert.equal(add(g, 'wood', 25), 20);
  assert.equal(buyStack(g), true);
  assert.equal(buyStack(g), false, 'pas assez d’argent');
  S.money = 1e6; S.stackLvl = 4;
  assert.equal(buyStack(g), false, 'niveau max');
});

test('agrandir le sac', () => {
  const { g, S } = makeGame({ state: { money: 5000 } });
  const c = bagCost(S);
  assert.equal(buyBag(g), true);
  assert.equal(S.invSlots, CFG.INV_SLOTS + 6);
  assert.equal(S.money, 5000 - c);
});

test('niveaux de minage', () => {
  assert.equal(level(0), 1);
  assert.equal(level(30), 1, 'progression ralentie');
  assert.equal(level(100), 2);
  assert.equal(level(7000), 10);
});

test('casser des pierres donne de l’XP et fait monter de niveau', () => {
  const { g, S, sounds } = makeGame({ rnd: seq(0) });
  S.sel = 'pick'; S.objs['30,20'] = { t: 'rock', hp: 2 };
  hitObject(g, 30, 20); hitObject(g, 30, 20);
  assert.equal(S.skills.mining.xp, 2 + 2 + 5);
  gainXp(g, 'mining', 91);
  assert.equal(miningLevel(S), 2);
  assert.ok(sounds().includes('levelup'));
});

test('gros rocher : pioche Cuivre requise', () => {
  const { g, S, toasts } = makeGame();
  S.sel = 'pick'; S.objs['40,10'] = { t: 'boulder', hp: 6 };
  assert.equal(hitObject(g, 40, 10), false);
  assert.match(toasts()[0], /Cuivre/);
  S.tools.pick = 2;
  hitObject(g, 40, 10); hitObject(g, 40, 10); hitObject(g, 40, 10);
  assert.equal(S.objs['40,10'], undefined); ramasse(g);
  assert.ok(S.inv.stone >= 8);
});

test('forge : niveau, argent et pierre requis', () => {
  const { g, S } = makeGame({ state: { money: 2800, inv: { stone: 65 } } });
  assert.equal(canUpgrade(S, 'pick').why, 'level');
  S.skills.mining.xp = 100;
  assert.equal(upgradeTool(g, 'pick'), true);
  assert.equal(S.tools.pick, 2);
  assert.equal(S.money, 2200, 'plus cher : 600 $');
  assert.equal(S.inv.stone, 35, '30 pierres');
});

test('un outil amélioré coûte moins d’énergie et frappe plus fort', () => {
  const { g, S } = makeGame({ rnd: seq(0) });
  S.sel = 'axe'; S.tools.axe = 3; S.objs['30,20'] = { t: 'tree', hp: 3 };
  hitObject(g, 30, 20);
  assert.equal(S.objs['30,20'], undefined, 'abattu en un coup');
  assert.equal(S.energy, 99.7);
  const e = { x: S.x + 1, y: S.y, hp: 100, cd: 0, hit: 0 };
  g.enemies.push(e); S.tools.sword = 3;
  attack(g, e);
  assert.equal(e.hp, 32);
});

// ---- Objets au sol et échange quand le sac est plein ----
import { pickDrops, swapDrop, dropsAt } from '../src/systems/inventory.js';

test('sac plein : le surplus tombe au sol au lieu d’être perdu', () => {
  const { g, S } = makeGame({ state: { inv: { stone: 10 }, invSlots: 1, x: 5.5, y: 6.8 } });
  assert.equal(add(g, 'wood', 3), 0);
  assert.deepEqual(dropsAt(S, 5, 6).map(d => [d.id, d.n]), [['wood', 3]]);
  add(g, 'stone', -4);
  assert.equal(pickDrops(g, 5, 6).length, 1, 'toujours plein (une case de pierre)');
  add(g, 'stone', -6);
  assert.equal(pickDrops(g, 5, 6).length, 0);
  assert.equal(S.inv.wood, 3);
});

test('échanger une case du sac avec l’objet au sol', () => {
  const { g, S } = makeGame({ state: { inv: { stone: 10 }, invSlots: 1, x: 5.5, y: 6.8 } });
  add(g, 'ruby', 1);
  const d = dropsAt(S, 5, 6)[0];
  assert.equal(swapDrop(g, d, 'stone'), true);
  assert.equal(S.inv.ruby, 1);
  assert.equal(S.inv.stone, undefined);
  assert.deepEqual(dropsAt(S, 5, 6).map(x => [x.id, x.n]), [['stone', 10]]);
});
