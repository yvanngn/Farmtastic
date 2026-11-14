import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { sellAll, buy, buyAnimal, craft } from '../src/systems/economy.js';
import { add } from '../src/systems/inventory.js';
import { RECIPES } from '../src/data/recipes.js';

test('vente : graines, foin et potions sont gardés', () => {
  const { g, S } = makeGame({ state: { money: 0, inv: { wheat: 3, egg: 1, wheat_seed: 4, hay: 2, potion: 1 } } });
  assert.equal(sellAll(g), 3 * 6 + 25);
  assert.deepEqual(S.inv, { wheat_seed: 4, hay: 2, potion: 1 });
  assert.equal(S.money, 43);
});

test('achat refusé sans argent', () => {
  const { g, S } = makeGame({ state: { money: 4, inv: {} } });
  assert.equal(buy(g, 'wheat_seed'), false);
  S.money = 10;
  assert.equal(buy(g, 'wheat_seed', 2), true);
  assert.equal(S.inv.wheat_seed, 2);
  assert.equal(S.money, 0);
});

test('acheter un animal', () => {
  const { g, S } = makeGame({ state: { money: 400 } });
  const n = S.animals.length;
  assert.equal(buyAnimal(g, 'chicken'), true);
  assert.equal(S.animals.length, n + 1);
  assert.equal(buyAnimal(g, 'chicken'), false);
});

test('fabrication consomme les ingrédients', () => {
  const { g, S } = makeGame({ state: { inv: { wood: 3 } } });
  const i = RECIPES.findIndex(r => r.out === 'fence');
  assert.equal(craft(g, i), true);
  assert.deepEqual(S.inv, { wood: 1, fence: 1 });
  assert.equal(craft(g, i), false);
});

test('inventaire : à zéro l’objet disparaît et la sélection revient à la main', () => {
  const { g, S } = makeGame({ state: { inv: { hay: 1 }, sel: 'hay' } });
  add(g, 'hay', -1);
  assert.equal(S.inv.hay, undefined);
  assert.equal(S.sel, 'hand');
});
