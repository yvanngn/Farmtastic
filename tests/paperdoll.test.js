import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HATC, PD_W, PD_H } from '../src/render/paperdoll.js';
import * as N from '../src/data/npcs.js';

test('18/11 : poupée — chaque chapeau porté par un habitant est dessiné, plus aucune planche utilisée', () => {
  const npcs = Object.values(N).filter(n => n && n.look && n.name);
  assert.ok(npcs.length >= 11);
  for (const n of npcs) {
    if (n.look.hat) assert.ok(HATC[n.look.hat], `${n.name} : chapeau « ${n.look.hat} » inconnu`);
    assert.equal(n.look.sheet, undefined, `${n.name} : plus de planche, dessiné par le code`);
  }
  assert.equal(PD_W, 36); assert.equal(PD_H, 60);
});

test('18/11 : design A de Jade (nœuds, manches bouffantes, short-salopette, chaussettes, poche cœur)', () => {
  const j = Object.values(N).find(n => n && n.id === 'jade').look;
  for (const k of ['ribbons', 'puffy', 'shorts', 'socks', 'kid']) assert.ok(j[k], k);
  assert.equal(j.pocket, 'heart'); assert.equal(j.hair, 5);
});
