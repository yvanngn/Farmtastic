import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { defaultState, migrate } from '../src/core/state.js';
import { act } from '../src/systems/actions.js';
import { sleepTent, foldTent, TENT_ENERGY } from '../src/systems/camp.js';
import { isSolid } from '../src/world/map.js';

test('nouvelle partie : un sac à dos et une tente dans l’inventaire, pas encore de lit', () => {
  const S = defaultState();
  assert.equal(S.inv.backpack, 1); assert.equal(S.inv.tent, 1); assert.equal(S.bed, false);
  assert.equal(migrate({ name: 'x' }).bed, true, 'anciennes parties : le lit existe');
});

test('la tente se pose à côté de la cabane, pas n’importe où', () => {
  const { g, S } = makeGame({ state: { inv: { tent: 1 }, sel: 'tent', bed: false } });
  assert.equal(act(g, 30, 20), 'missing', 'trop loin');
  assert.equal(act(g, 8, 7), 'pitch');
  assert.deepEqual(S.tent, { x: 8, y: 7 }); assert.equal(S.inv.tent || 0, 0);
  assert.equal(isSolid(S, 8, 7), true);
});

test('dormir sous la tente : nouvelle journée mais 50 % d’énergie ; on peut la replier', () => {
  const { g, S } = makeGame({ state: { tent: { x: 8, y: 7 }, minute: 1200, energy: 10, money: 100, inv: {}, bed: false } });
  const said = []; g.bus.on('say', d => said.push(d));
  assert.equal(act(g, 8, 7), 'tent');
  said[0].onChoose(0);
  assert.equal(S.day, 2); assert.equal(S.energy, Math.round(S.maxE * TENT_ENERGY)); assert.equal(S.money, 100, 'pas d’amende');
  S.minute = 600; assert.equal(sleepTent(g), false, 'trop tôt');
  assert.equal(foldTent(g), true); assert.equal(S.tent, null); assert.equal(S.inv.tent, 1);
});

test('maison réparée mais sans lit : on ne peut pas y dormir', () => {
  const { g, S } = makeGame({ state: { scene: 'house', minute: 1200, bed: false } });
  const bed = (() => { for (let y = 0; y < 10; y++) for (let x = 0; x < 12; x++) if (act(g, x, y) === 'nobed') return true; return false; })();
  assert.equal(bed, true); assert.equal(S.day, 1);
});
