import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { buyPattern, placePot, usePot, potAt } from '../src/systems/pots.js';
import { craftHand } from '../src/systems/cooking.js';
import { buy } from '../src/systems/economy.js';

test('lot 2 : patron du chaudron à 50 🪙, louche, jauge de cuisson', () => {
  const { g, S } = makeGame({ state: { scene: 'farm', money: 100, x: 20.5, y: 20.5, inv: { stone: 20, wood: 10, berry: 4 } } });
  assert.equal(buyPattern(g, 'p_chaudron'), true); assert.equal(S.money, 50);
  assert.equal(buyPattern(g, 'p_chaudron'), false, 'une seule fois');
  assert.equal(craftHand(g, 'chaudron'), true); assert.equal(S.inv.chaudron, 1);
  S.sel = 'chaudron'; assert.equal(placePot(g, 21, 20), true);
  const p = potAt(S, 21, 20); assert.ok(p);
  assert.equal(usePot(g, p), 'need', 'sans louche');
  assert.equal(buy(g, 'louche'), true); S.sel = 'louche';
  const said = []; g.bus.on('say', d => said.push(d));
  assert.equal(usePot(g, p), 'menu'); said.at(-1).onChoose(0);
  assert.equal(S.inv.berry || 0, 0);
  let r; for (let i = 0; i < 10; i++) r = usePot(g, p);
  assert.equal(r, 'done'); assert.equal(S.inv.soupe_baies, 1); assert.equal(p.cook, null);
});
