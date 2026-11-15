import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { defaultState } from '../src/core/state.js';
import { act } from '../src/systems/actions.js';
import { craftHand, cookTick, knows } from '../src/systems/cooking.js';
import { consume } from '../src/systems/player.js';
import { BUSHES, COOK_MS, HAND_RECIPES } from '../src/data/recipes.js';
import { isSolid } from '../src/world/map.js';

test('au début, on ne connaît qu’une recette : le feu (5 bois + 2 cailloux)', () => {
  const S = defaultState();
  assert.deepEqual(S.recipes, ['campfire']);
  assert.deepEqual(HAND_RECIPES.campfire.in, { wood: 5, stone: 2 });
  const { g, S: S2 } = makeGame({ state: { inv: { wood: 5, stone: 1 } } });
  assert.equal(craftHand(g, 'campfire'), false, 'il manque un caillou');
  S2.inv.stone = 2;
  assert.equal(craftHand(g, 'campfire'), true);
  assert.equal(S2.inv.campfire, 1); assert.equal(S2.inv.wood || 0, 0);
  assert.equal(knows(S2, 'bed'), false);
});

test('poser le feu, puis griller des baies en restant 5 secondes à côté', () => {
  const { g, S, clock } = makeGame({ state: { inv: { campfire: 1, berry: 2 }, sel: 'campfire', x: 20.5, y: 20.6 } });
  assert.equal(act(g, 21, 20), 'fire');
  assert.equal(isSolid(S, 21, 20), true);
  S.sel = 'berry';
  assert.equal(act(g, 21, 20), 'cook');
  clock.t += COOK_MS - 100; assert.equal(cookTick(g), 'cooking');
  clock.t += 200; assert.equal(cookTick(g), 'done');
  assert.equal(S.inv.berry, 1); assert.equal(S.inv.berry_cooked, 1);
  S.x = 30; assert.equal(cookTick(g), 'stop', 'on s’éloigne : la cuisson s’arrête');
});

test('baies : +1 énergie crues, +5 cuites ; les buissons repoussent en 2 jours', () => {
  const { g, S } = makeGame({ state: { inv: { berry: 1, berry_cooked: 1 }, energy: 10 } });
  consume(g, 'berry'); assert.equal(S.energy, 11);
  consume(g, 'berry_cooked'); assert.equal(S.energy, 16);
  const [x, y] = BUSHES[0];
  assert.equal(isSolid(S, x, y), true);
  assert.equal(act(g, x, y), 'berries'); assert.ok(S.inv.berry >= 2);
  assert.equal(act(g, x, y), 'empty');
  S.day += 2; assert.equal(act(g, x, y), 'berries');
});
