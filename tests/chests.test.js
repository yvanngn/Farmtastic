import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { act } from '../src/systems/actions.js';
import { store, takeOut, pickUpChest, chestAt } from '../src/systems/chests.js';
import { craftHand } from '../src/systems/cooking.js';
import { isSolid } from '../src/world/map.js';
import { HAND_RECIPES, RECIPE_CATS } from '../src/data/recipes.js';

test('recettes rangées par type : chaque recette a un onglet', () => {
  for (const r of Object.values(HAND_RECIPES)) assert.ok(RECIPE_CATS[r.cat], r.out);
  assert.notEqual(HAND_RECIPES.campfire.cat, HAND_RECIPES.chest.cat);
});

test('coffre : on le fabrique, on le pose au sol, on y range et on reprend ses affaires', () => {
  const { g, S } = makeGame({ state: { recipes: ['campfire', 'chest'], inv: { wood: 90, stone: 25, berry: 7 }, x: 20.5, y: 20.6 } });
  assert.equal(craftHand(g, 'chest'), true); assert.equal(S.inv.chest, 1);
  S.sel = 'chest';
  assert.equal(act(g, 21, 20), 'chestPlaced');
  assert.equal(isSolid(S, 21, 20), true); assert.equal(S.inv.chest || 0, 0);
  const c = chestAt(S, 21, 20), opened = []; g.bus.on('openChest', x => opened.push(x));
  assert.equal(act(g, 21, 20), 'chest'); assert.equal(opened[0], c, 'le toucher ouvre le coffre');
  assert.equal(store(g, c, 'wood', 10), 10); assert.equal(S.inv.wood || 0, 0);
  assert.equal(store(g, c, 'berry', 99), 7);
  assert.equal(pickUpChest(g, c), false, 'pas tant qu’il est plein');
  assert.equal(takeOut(g, c, 'wood', 4), 4); assert.equal(S.inv.wood, 4); assert.equal(c.items.wood, 6);
  takeOut(g, c, 'wood', 99); takeOut(g, c, 'berry', 99);
  assert.equal(pickUpChest(g, c), true); assert.equal(S.inv.chest, 1); assert.equal(chestAt(S, 21, 20), null);
});
