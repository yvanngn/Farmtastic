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
  assert.deepEqual(S.built, { coop: false, pigsty: false, kennel: false, barn: false });
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
  const { g, S } = makeGame({ state: { money: 3500, inv: { wood: 40, stone: 5 }, built: { coop: false, pigsty: false, barn: false } } });
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

// ---- Lot 5 : commerces du village ----
import { SHOPS } from '../src/data/shops.js';
import { ITEMS } from '../src/data/items.js';
import { BUILDINGS } from '../src/data/buildings.js';

test('commerces : boulangerie, boucherie, poissonnerie, chacun avec ses produits à vendre', async () => {
  const { UI_TILES, tileAt } = await import('../src/world/scenes.js');
  for (const [id, x] of [['bakery', 5], ['butcher', 11], ['fishmonger', 18]]) {
    assert.equal(UI_TILES[tileAt('town', x, 17)], id);
    for (const k of SHOPS[id].sells) assert.ok(ITEMS[k] && ITEMS[k].buy > 0, k);
  }
  const { g, S } = makeGame({ state: { money: 200, inv: {} } });
  assert.equal(buy(g, 'bread', 5), true);
  assert.equal(S.inv.bread, 5);
  assert.equal(S.money, 0);
});

test('graines à l’étal du marché, foin chez le marchand d’animaux', () => {
  assert.ok(SHOPS.stall.sells.includes('wheat_seed'));
  assert.ok(SHOPS.feed.sells.includes('hay'));
});

test('bâtiments : prix doublés et un intérieur avec mangeoire pour chacun', () => {
  const { g, S } = makeGame({ state: { inv: { hay: 3 }, animals: [
    { id: 'p', type: 'pig', x: 20, y: 9, love: 0 }, { id: 's', type: 'sheep', x: 28, y: 9, love: 0 }, { id: 'c', type: 'chicken', x: 24, y: 9, love: 0 }] } });
  assert.deepEqual(Object.values(BUILDINGS).map(b => b.cost.money), [3000, 5000, 2000, 8000]);
  assert.equal(act(g, 20, 7), 'door');
  assert.equal(S.scene, 'pigsty');
  assert.equal(act(g, 2, 2), 'feedAll');
  assert.deepEqual(S.animals.map(a => !!a.fed), [true, false, false], 'la mangeoire de la porcherie ne nourrit que les cochons');
  act(g, 4, 6); assert.equal(S.scene, 'farm');
  act(g, 28, 7); assert.equal(S.scene, 'barn');
});

// ---- Lot 12 : établi de la maison ----
import { repairBench, canRepairBench } from '../src/systems/economy.js';

test('établi : cassé au départ, réparé par le charpentier, puis on fabrique à la maison', () => {
  assert.equal(defaultState().workbench, false);
  const { g, S, toasts } = makeGame({ state: { workbench: false, money: 1000, inv: { wood: 22, stone: 5 }, scene: 'house' } });
  const i = RECIPES.findIndex(r => r.out === 'fence');
  assert.equal(craft(g, i), false, 'pas d’établi');
  assert.equal(act(g, 9, 7), 'broken');
  assert.match(toasts().at(-1), /charpentier/);
  assert.equal(repairBench(g), true);
  assert.deepEqual([S.money, S.inv.wood, S.inv.stone], [200, 2, undefined]);
  assert.equal(canRepairBench(S).why, 'built');
  const opened = []; g.bus.on('open', w => opened.push(w));
  assert.equal(act(g, 9, 7), 'workshop');
  assert.deepEqual(opened, ['workshop']);
  assert.equal(craft(g, i), true);
  assert.equal(migrate({ name: 'x' }).workbench, true, 'ancienne partie : établi déjà là');
});

test('sac en cases : rangement à la main et tri automatique par type', async () => {
  const { invOrder, moveItem, autoSort, orderedCells, catOf } = await import('../src/systems/inventory.js');
  const { S } = makeGame({ state: { inv: { wood: 3, berry: 2, wheat_seed: 5, copper_ore: 1, tent: 1 }, invOrder: [] } });
  assert.deepEqual(invOrder(S), ['wood', 'berry', 'wheat_seed', 'copper_ore', 'tent']);
  moveItem(S, 'tent', 'wood');
  assert.deepEqual(invOrder(S).slice(0, 2), ['tent', 'wood'], 'la tente prend la place du bois');
  S.inv.paquerette = 1; assert.equal(invOrder(S).at(-1), 'paquerette', 'un nouvel objet arrive à la fin');
  autoSort(S);
  assert.deepEqual(S.invOrder.map(catOf), [...S.invOrder.map(catOf)].sort((a, b) => a - b), 'rangé par type');
  assert.equal(S.invOrder[0], 'wheat_seed');
  assert.equal(orderedCells(S)[0].id, 'wheat_seed');
});
