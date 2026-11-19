import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { act } from '../src/systems/actions.js';
import { neighborLot } from '../src/systems/farms.js';
import { setFarmLot, isSolid } from '../src/world/map.js';

test('19/11 : les 4 fermes en carré, on passe chez la voisine selon son emplacement', () => {
  assert.equal(neighborLot(1, 'W'), 0); assert.equal(neighborLot(1, 'E'), null, 'ferme de droite : seulement à gauche');
  assert.equal(neighborLot(0, 'S'), 2); assert.equal(neighborLot(3, 'N'), 1);
  const { g, S } = makeGame({ state: { farmLot: 1, scene: 'farm', x: 1.6, y: 5.5 } }); setFarmLot(1);
  assert.equal(isSolid(S, 0, 5), false, 'passage dans la falaise à l’ouest');
  assert.equal(act(g, 0, 5), 'door'); assert.equal(S.scene, 'farm:0');
  assert.equal(act(g, 29, 9), 'door'); assert.equal(S.scene, 'farm', 'retour chez soi par l’est');
  setFarmLot(0); S.farmLot = 0; S.scene = 'farm'; assert.equal(isSolid(S, 0, 5), true, 'ferme de gauche : falaise');
  setFarmLot(0);
});
