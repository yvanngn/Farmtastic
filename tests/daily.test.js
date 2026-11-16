import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { dailyQuest, deliverDaily } from '../src/systems/daily.js';

test('lot 3 : quête du jour dès le 2e jour, simple au début, une par jour', () => {
  const { g, S } = makeGame({ state: { day: 1, money: 0, inv: { wood: 12 } } });
  assert.equal(dailyQuest(g), null, 'rien le 1er jour');
  S.day = 2; const q = dailyQuest(g);
  assert.equal(q.item, 'wood'); assert.equal(q.qty, 10);
  assert.equal(deliverDaily(g), true); assert.equal(S.money, 60); assert.equal(S.inv.wood, 2);
  assert.equal(deliverDaily(g), false, 'une seule fois par jour');
  S.day = 3; assert.equal(dailyQuest(g).done, false, 'nouvelle quête le lendemain');
});
