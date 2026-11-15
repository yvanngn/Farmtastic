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

// ---- Lot 4 : tout se débloque avec l'argent ----
import { build, canBuild, canBuyAnimal } from '../src/systems/economy.js';
import { defaultState, migrate } from '../src/core/state.js';
import { act } from '../src/systems/actions.js';
import { isSolid } from '../src/world/map.js';

test('nouvelle partie : pas de poulailler ni d’animaux', () => {
  const S = defaultState();
  assert.deepEqual(S.animals, []);
  assert.deepEqual(S.built, { coop: false, pigsty: false, barn: false });
});

test('marchand d’animaux : il faut le bâtiment, puis de la place', () => {
  const { g, S } = makeGame({ state: { money: 1e5, animals: [], built: { coop: false, pigsty: false, barn: false } } });
  assert.equal(canBuyAnimal(S, 'chicken').why, 'home');
  assert.equal(buyAnimal(g, 'chicken'), false);
  assert.equal(buyAnimal(g, 'cat'), true, 'le chat vit en liberté');
  S.built.coop = true;
  for (let i = 0; i < 8; i++) assert.equal(buyAnimal(g, i % 2 ? 'rabbit' : 'chicken'), true);
  assert.equal(canBuyAnimal(S, 'chicken').why, 'full');
  assert.equal(canBuyAnimal(S, 'pig').why, 'home');
});

test('charpentier : construire coûte argent, bois et pierre ; une seule fois', () => {
  const { g, S } = makeGame({ state: { money: 2000, inv: { wood: 40, stone: 5 }, built: { coop: false, pigsty: false, barn: false } } });
  assert.equal(canBuild(S, 'coop').why, 'stone');
  S.inv.stone = 10;
  assert.equal(build(g, 'coop'), true);
  assert.equal(S.money, 500);
  assert.equal(S.inv.wood, undefined);
  assert.equal(canBuild(S, 'coop').why, 'built');
});

test('poulailler non construit : pas de porte, l’emplacement reste dans l’enclos', () => {
  const { g, S } = makeGame({ state: { built: { coop: false, pigsty: false, barn: false } } });
  assert.notEqual(act(g, 24, 7), 'door');
  assert.equal(isSolid(S, 24, 7), false);
  assert.equal(isSolid(S, 24, 6), true, 'la clôture ferme l’enclos');
  S.built.coop = true;
  assert.equal(isSolid(S, 24, 6), true);
  assert.equal(act(g, 24, 7), 'door');
});

test('vieille sauvegarde : le poulailler (et la bergerie si moutons) restent construits', () => {
  const s = migrate({ name: 'x', animals: [{ type: 'sheep' }] });
  assert.deepEqual(s.built, { coop: true, pigsty: false, barn: true });
});

test('village : charpentier et marchand d’animaux', async () => {
  const { UI_TILES, tileAt } = await import('../src/world/scenes.js');
  assert.equal(UI_TILES[tileAt('town', 5, 12)], 'carpenter');
  assert.equal(UI_TILES[tileAt('town', 18, 12)], 'animals');
});
