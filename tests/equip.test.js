import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { equip, unequip, speedMult, yvanGift, equipped } from '../src/systems/equip.js';
import { isWarm } from '../src/systems/cold.js';

test('19/11 : équipement — le manteau se porte, les bottes de vent ×4, cadeau pour Yvan', () => {
  const { g, S } = makeGame({ state: { name: 'Lucie', inv: { manteau: 1 } } });
  assert.ok(equip(g, 'manteau')); assert.equal(S.inv.manteau || 0, 0); assert.equal(equipped(S, 'corps'), 'manteau'); assert.ok(isWarm(S));
  assert.ok(unequip(g, 'corps')); assert.equal(S.inv.manteau, 1);
  assert.equal(yvanGift(g), false, 'pas pour Lucie');
  S.name = 'Yvan'; assert.ok(yvanGift(g)); assert.equal(equipped(S, 'pieds'), 'bottes_vent'); assert.equal(speedMult(S), 4);
  assert.equal(yvanGift(g), false, 'une seule fois');
});
