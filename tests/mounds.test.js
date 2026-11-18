import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame, seq } from './helpers.js';
import { ensureMounds, moundAt, digMound, pickLoot, MOUND_ZONES, MOUNDS_PER_ZONE, MOUND_LOOT } from '../src/systems/mounds.js';
import { act } from '../src/systems/actions.js';
import { isSolid } from '../src/world/map.js';

const first = M => Object.keys(M.at)[0].split(',').map(Number);

test('lot 12 : une vingtaine de petits tas par zone extérieure (pas à la gare ni en ville), nouvelles places chaque jour', () => {
  assert.ok(!MOUND_ZONES.includes('gare') && !MOUND_ZONES.includes('town'));
  const { S } = makeGame({ state: { day: 3 } });
  for (const sc of MOUND_ZONES) { const M = ensureMounds(S, sc); assert.equal(Object.keys(M.at).length, MOUNDS_PER_ZONE, sc); }
  assert.equal(ensureMounds(S, 'gare'), null);
  const today = Object.keys(S.mounds.plage.at).join();
  assert.equal(Object.keys(ensureMounds(S, 'plage').at).join(), today, 'les mêmes toute la journée');
  S.day = 4; assert.notEqual(Object.keys(ensureMounds(S, 'plage').at).join(), today, 'de nouvelles places le lendemain');
  const [x, y] = first(S.mounds.plage); assert.equal(isSolid({ ...S, scene: 'plage' }, x, y), false, 'on marche dessus');
});

test('lot 12 : butin des tas (rien 10 %, pierres 30 %, bois 25 %, champignons 20 %, os 15 %)', () => {
  assert.equal(Math.round(MOUND_LOOT.reduce((a, [, p]) => a + p, 0) * 100), 100);
  assert.equal(pickLoot(.05), 'rien'); assert.equal(pickLoot(.2), 'stone'); assert.equal(pickLoot(.5), 'wood'); assert.equal(pickLoot(.7), 'champignon'); assert.equal(pickLoot(.9), 'bone');
});

test('lot 12 : creuser un tas à la pelle (pas sans pelle) ; il disparaît jusqu’au lendemain', () => {
  const { g, S, toasts } = makeGame({ rnd: seq(.9), state: { scene: 'plage', tools: { hammer: 1 }, sel: 'hand', inv: {} } });
  const [x, y] = first(ensureMounds(S, 'plage'));
  assert.equal(act(g, x, y), 'noshovel'); assert.ok(toasts().some(t => t.includes('pelle')));
  S.tools.shovel = 1; S.sel = 'shovel';
  assert.equal(act(g, x, y), 'dig'); assert.equal(S.inv.bone, 1, 'un os (tirage à 0,9)'); assert.equal(moundAt(S, 'plage', x, y), false);
  assert.equal(digMound(g, x, y), null, 'plus rien à creuser ici aujourd’hui');
});
