import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { genObjects, isSolid, isPlot, isFence } from '../src/world/map.js';
import { tryMove } from '../src/systems/movement.js';
import { act } from '../src/systems/actions.js';
import { applyPos, applyPresence, pruneStale, lerpOthers, STALE_MS } from '../src/net/multiplayer.js';

test('carte déterministe et zones réservées vides', () => {
  const a = genObjects(), b = genObjects();
  assert.deepEqual(a, b);
  for (const k in a) { const [x, y] = k.split(',').map(Number); assert.ok(!isPlot(x, y)); }
  assert.ok(isFence(18, 6) && !isFence(18, 9), 'portail ouvert');
});

test('collisions : bords, maison, obstacles', () => {
  const { S } = makeGame();
  assert.ok(isSolid(S, -1, 0));
  assert.ok(isSolid(S, 3, 2));
  S.objs['7,7'] = { t: 'rock', hp: 2 };
  assert.ok(isSolid(S, 7, 7));
  S.x = 6.5; S.y = 7.5;
  tryMove(S, 1, 0);
  assert.equal(S.x, 6.5, 'bloqué par le rocher');
});

test('actions : bac = vente, maison = sommeil', () => {
  const { g, S } = makeGame({ state: { inv: { wheat: 1 }, money: 0 } });
  assert.equal(act(g, 8, 4), 'sell');
  assert.equal(S.money, 6);
  assert.equal(act(g, 3, 3), 'none', 'trop tôt pour dormir');
});

test('multijoueur : position, présence, départ', () => {
  const others = {};
  applyPresence(others, { me: [{}], bob: [{ name: 'Bob', look: { skin: '#fff' } }] }, 'me', 0);
  assert.deepEqual(Object.keys(others), ['bob']);
  applyPos(others, { id: 'bob', x: 10, y: 5, d: 2, f: 1 }, 0);
  lerpOthers(others, 1);
  assert.equal(others.bob.x, 10);
  assert.equal(others.bob.dir, 2);
  applyPresence(others, { me: [{}] }, 'me', 0);
  assert.equal(others.bob, undefined, 'Bob est parti');
});

test('multijoueur : joueurs muets supprimés', () => {
  const others = { x: { ts: 0 } };
  pruneStale(others, STALE_MS + 1);
  assert.deepEqual(others, {});
});
