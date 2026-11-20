import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { buyPattern, placePot, usePot, potAt, cookPot, COOK_MS } from '../src/systems/pots.js';
import { craftHand } from '../src/systems/cooking.js';
import { buy } from '../src/systems/economy.js';

test('20/11 : chaudron façon Breath of the Wild — ingrédients, cuisson, recette découverte', () => {
  const { g, S, clock } = makeGame({ state: { scene: 'farm', money: 100, x: 20.5, y: 20.5, inv: { stone: 20, wood: 10, berry: 5, mure: 1 }, recipes: ['chaudron'] } });
  assert.equal(craftHand(g, 'chaudron'), true); assert.equal(S.inv.chaudron, 1);
  S.sel = 'chaudron'; assert.equal(placePot(g, 21, 20), true);
  const p = potAt(S, 21, 20); assert.ok(p);
  assert.equal(usePot(g, p), 'menu', 'sans louche : on choisit les ingrédients');
  assert.equal(cookPot(g, p, { mure: 1 }), null, 'une mûre seule ne donne rien'); assert.equal(S.inv.mure, 1);
  assert.equal(cookPot(g, p, { berry: 5, mure: 1 }), 'confiture_baies'); assert.equal(S.inv.berry, 1, 'seuls les ingrédients du plat sont pris'); assert.equal(S.inv.mure, 1);
  assert.equal(usePot(g, p), 'cooking'); clock.t += COOK_MS;
  assert.equal(usePot(g, p), 'done'); assert.equal(S.inv.confiture_baies, 1); assert.ok(S.recipes.includes('confiture_baies'), 'recette découverte');
});

test('lot 4 : métiers — la cuisine fait monter le niveau de cuisinier', async () => {
  const { jobXp } = await import('../src/systems/jobs.js');
  const { SHOPS } = await import('../src/data/shops.js');
  const { g, S, clock } = makeGame({ state: { scene: 'farm', money: 1000, x: 20.5, y: 20.5, inv: { stone: 20, wood: 10, berry: 4 }, recipes: ['chaudron'] } });
  craftHand(g, 'chaudron'); assert.equal(jobXp(S, 'forgeron'), 15);
  S.sel = 'chaudron'; placePot(g, 21, 20); const p = potAt(S, 21, 20);
  cookPot(g, p, { berry: 4 }); clock.t += COOK_MS; usePot(g, p);
  assert.equal(jobXp(S, 'cuisinier'), 15);
  assert.deepEqual(SHOPS.bakery.sells, ['flour'], 'magasins : ingrédients de base seulement');
});
