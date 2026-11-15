import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { plant, harvest, farmAction, cropProgress, rainBoost } from '../src/systems/farming.js';

test('planter consomme une graine sur une parcelle vide', () => {
  const { g, S } = makeGame();
  assert.equal(plant(g, 5, 9, 'wheat_seed'), true);
  assert.equal(S.inv.wheat_seed, 9);
  assert.equal(S.plots['5,9'].crop, 'wheat');
  assert.equal(plant(g, 5, 9, 'wheat_seed'), false, 'parcelle occupée');
});

test('impossible de planter hors parcelle ou sans graine', () => {
  const { g } = makeGame({ state: { inv: {} } });
  assert.equal(plant(g, 0, 0, 'wheat_seed'), false);
  assert.equal(plant(g, 5, 9, 'wheat_seed'), false);
});

test('récolte seulement à maturité, en temps réel', () => {
  const { g, S, clock } = makeGame();
  plant(g, 5, 9, 'wheat_seed');
  assert.equal(harvest(g, 5, 9), false);
  clock.t += 60_000;
  assert.equal(cropProgress(S.plots['5,9'], clock.t), 1);
  assert.equal(harvest(g, 5, 9), true);
  assert.equal(S.inv.wheat, 2);
  assert.equal(S.plots['5,9'], undefined);
});

test('farmAction (glisser) : graine sélectionnée = plante, faucille = récolte', () => {
  const { g, S, clock } = makeGame();
  S.sel = 'wheat_seed';
  for (let x = 4; x <= 7; x++) assert.equal(farmAction(g, x, 8), true);
  clock.t += 61_000; S.sel = 'sickle';
  for (let x = 4; x <= 7; x++) farmAction(g, x, 8);
  assert.equal(S.inv.wheat, 8);
});

test('la pluie accélère la pousse', () => {
  const { g, S } = makeGame({ state: { weather: 'rain' } });
  plant(g, 5, 9, 'wheat_seed');
  const t0 = S.plots['5,9'].t0;
  rainBoost(g, 4);
  assert.equal(S.plots['5,9'].t0, t0 - 1000);
});

// ---- Lot 9 : champ à bêcher, foin à planter ----
import { till, isTilled } from '../src/systems/farming.js';
import { defaultState, migrate } from '../src/core/state.js';
import { SHOPS } from '../src/data/shops.js';

test('le champ n’est pas prêt au départ : il faut le bêcher à la pelle', () => {
  assert.deepEqual(defaultState().tilled, {});
  const { g, S, toasts } = makeGame({ state: { tilled: {}, inv: { hay_seed: 2 }, sel: 'hay_seed' } });
  assert.equal(plant(g, 5, 9, 'hay_seed'), false);
  assert.match(toasts().at(-1), /bêcher/);
  S.sel = 'shovel';
  assert.equal(farmAction(g, 5, 9), true);
  assert.equal(isTilled(S, 5, 9), true);
  assert.equal(till(g, 20, 20), false, 'hors du champ');
  assert.equal(plant(g, 5, 9, 'hay_seed'), true);
});

test('foin : graines à l’étal, récolte de foin pour les animaux', () => {
  assert.ok(SHOPS.stall.sells.includes('hay_seed'));
  const { g, S, clock } = makeGame({ state: { tilled: { '5,9': 1 }, inv: { hay_seed: 1 } } });
  plant(g, 5, 9, 'hay_seed'); clock.t += 91_000;
  assert.equal(harvest(g, 5, 9), true);
  assert.equal(S.inv.hay, 3);
});

test('ancienne sauvegarde : le champ reste bêché', () => {
  const s = migrate({ name: 'x' });
  assert.equal(s.tilled['4,8'], 1);
  assert.equal(s.tilled['13,13'], 1);
});
