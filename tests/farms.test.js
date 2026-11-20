import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { act } from '../src/systems/actions.js';
import { neighborLot } from '../src/systems/farms.js';
import { setFarmLot, isSolid } from '../src/world/map.js';

test('19/11 : nouvelle disposition des fermes (principale au nord de la place, 3 fermes à l’ouest)', () => {
  assert.equal(neighborLot(0, 'W'), 2); assert.equal(neighborLot(2, 'N'), 3); assert.equal(neighborLot(2, 'S'), 1); assert.equal(neighborLot(1, 'E'), null, 'à l’est de la ferme du Sud-Ouest : la place');
  const { g, S } = makeGame({ state: { farmLot: 0, scene: 'farm', x: 1.6, y: 18.5 } }); setFarmLot(0);
  assert.equal(isSolid(S, 0, 18), false, 'passage dans la falaise à l’ouest (au milieu)');
  assert.equal(act(g, 0, 18), 'door'); assert.equal(S.scene, 'farm:2');
  assert.equal(act(g, 15, 0), 'door'); assert.equal(S.scene, 'farm:3');
  assert.equal(act(g, 29, 9), 'door'); assert.equal(S.scene, 'carriere', 'à l’est de la ferme du Nord-Ouest : la carrière');
  assert.equal(act(g, 15, 21), 'door'); assert.equal(S.scene, 'farm', 'au sud de la carrière : ma ferme');
  S.scene = 'farm:2'; assert.equal(act(g, 15, 21), 'door'); assert.equal(S.scene, 'farm:1');
  assert.equal(act(g, 29, 9), 'door'); assert.equal(S.scene, 'place');
  assert.equal(act(g, 0, 8), 'door'); assert.equal(S.scene, 'farm:1');
  S.scene = 'farm:1'; act(g, 0, 9); assert.equal(S.scene, 'farm:1', 'pas de sortie à l’ouest');
  setFarmLot(1); S.farmLot = 1; S.scene = 'farm'; assert.equal(isSolid(S, 0, 18), true, 'ferme du Sud-Ouest : falaise à l’ouest');
  setFarmLot(0);
});
test('19/11 : seule la ferme principale a une cabane ; ailleurs un tas de planches qui coûte le double', async () => {
  const { needOf, isPlankPile } = await import('../src/systems/repair.js');
  const { REPAIRS } = await import('../src/data/repairs.js');
  const { LAYOUTS } = await import('../src/world/scenes.js');
  assert.equal(isPlankPile({ farmLot: 0 }), false); assert.equal(isPlankPile({ farmLot: 2 }), true);
  assert.equal(needOf({ farmLot: 3 }, 'house').wood, REPAIRS.house.need.wood * 2);
  assert.equal(needOf({ farmLot: 3 }, 'grange').wood, REPAIRS.grange.need.wood);
  assert.ok(LAYOUTS['farm:0'].join('').includes('H')); for (const l of [1, 2, 3]) assert.ok(!LAYOUTS['farm:' + l].join('').includes('H') && LAYOUTS['farm:' + l].join('').includes('K'));
});

