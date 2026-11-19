import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { listItem, standTick, standNewDay, used, STAND_CAP, saleDelay, ensureOffers, buyOffer, stand } from '../src/systems/stand.js';
import { ITEMS } from '../src/data/items.js';

test('étal : 10 objets au plus, vendu en quelques minutes au prix bas, la nuit au prix fort', () => {
  const { g, S, clock } = makeGame({ state: { money: 0, inv: { wood: 30, wheat: 5 } } });
  assert.ok(listItem(g, 'wheat', 4, 0.5)); assert.equal(S.inv.wheat, 1);
  assert.ok(listItem(g, 'wood', 3, 1)); assert.ok(listItem(g, 'wood', 3, 2)); assert.equal(used(S), STAND_CAP, 'limité à 10');
  assert.ok(!listItem(g, 'wood', 1, 1), 'étal plein');
  assert.equal(standTick(g), 0); clock.t += 3 * 60000 + 1; assert.equal(standTick(g), 1, '× 0,5 : 2 à 3 min');
  assert.equal(S.money, 4 * Math.max(1, Math.round(ITEMS.wheat.p * .5)));
  clock.t += 3600000; assert.equal(standTick(g), 0, 'prix normal : pas avant la nuit');
  standNewDay(g); assert.equal(used(S), 3, 'après 1 nuit : le × 1 est vendu, le × 2 attend');
  standNewDay(g); assert.equal(used(S), 0, 'le × 2 part au bout de 2 jours');
  assert.ok(saleDelay(.5, 1) < saleDelay(.75, 0)); assert.equal(saleDelay(1, 0), Infinity);
});
test('étal : offres des habitants, plus chères', () => {
  const { g, S } = makeGame({ state: { money: 10000 } });
  const o = ensureOffers(g); assert.equal(o.length, 3);
  const { id, n, price } = o[0]; assert.ok(price >= ITEMS[id].p * 2 * n);
  const before = S.inv[id] || 0; assert.ok(buyOffer(g, 0)); assert.equal(S.inv[id], before + n); assert.equal(stand(S).offers.length, 2);
});
