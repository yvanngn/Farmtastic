import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { mailNewDay, openMailbox, hasUnread, SEED_GIFT } from '../src/systems/mail.js';
import { till, plant, harvest, isRipe, cropsNewDay, canTill } from '../src/systems/farming.js';
import { ITEMS } from '../src/data/items.js';
import { QUESTS } from '../src/systems/quests.js';

test('courrier des graines : le lendemain de la pelle, puis quête et graines', () => {
  const { g, S } = makeGame({ state: { tools: { pick: 1 }, inv: {} } });
  assert.equal(mailNewDay(g), false, 'pas de pelle, pas de courrier');
  S.tools.shovel = 1;
  assert.equal(mailNewDay(g), true); assert.ok(hasUnread(S));
  assert.equal(QUESTS.champ.unlock(S), false);
  assert.equal(openMailbox(g), 'seeds');
  assert.equal(S.inv.wheat_seed, SEED_GIFT); assert.ok(!hasUnread(S)); assert.ok(QUESTS.champ.unlock(S));
  assert.equal(mailNewDay(g), false, 'une seule fois');
});

test('bêcher sur l’herbe de la ferme, semer en glissant, mûr le lendemain, tout récolter à la faucille', () => {
  const { g, S, clock } = makeGame({ state: { tilled: {}, plots: {}, objs: {}, inv: { wheat_seed: 5 } } });
  assert.ok(canTill(S, 20, 20)); assert.ok(!canTill(S, 5, 0));
  for (const x of [20, 21, 22]) assert.ok(till(g, x, 20));
  for (const x of [20, 21, 22]) assert.ok(plant(g, x, 20, 'wheat_seed'));
  assert.ok(!isRipe(S.plots['20,20'], clock.t));
  cropsNewDay(S);
  assert.ok(isRipe(S.plots['21,20'], clock.t));
  S.sel = 'sickle';
  assert.ok(harvest(g, 20, 20));
  assert.equal(Object.keys(S.plots).length, 0);
  assert.equal(S.inv.wheat, 6); assert.equal(S.inv.straw, 9);
  assert.equal(ITEMS.straw.p, 1);
  assert.ok(QUESTS.champ.steps.every(s => s.done(S) || s.id === 'courrier'));
});
