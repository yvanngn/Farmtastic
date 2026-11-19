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

test('actions : plus de bac (19/11), maison = sommeil', () => {
  const { g, S } = makeGame({ state: { inv: { wheat: 1 }, money: 0 } });
  assert.notEqual(act(g, 8, 4), 'sell');
  assert.equal(S.money, 0, 'rien n’est vendu sans choisir');
  const d = S.day; assert.notEqual(act(g, 3, 3), 'sleep', 'trop tôt pour dormir'); assert.equal(S.day, d);
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

test('chaque joueur a sa ferme : on ne voit sur la sienne que ceux du même emplacement ; ailleurs on se croise', async () => {
  const { applyPos, sceneOut } = await import('../src/net/multiplayer.js');
  assert.equal(sceneOut('farm', 2), 'farm:2'); assert.equal(sceneOut('town', 2), 'town');
  const others = {};
  applyPos(others, { id: 'a', x: 1, y: 1, s: 'farm:1' }, 0, 0);
  assert.notEqual(others.a.scene, 'farm', 'sur une autre ferme : pas chez moi');
  applyPos(others, { id: 'a', x: 1, y: 1, s: 'farm:0' }, 0, 0);
  assert.equal(others.a.scene, 'farm');
  applyPos(others, { id: 'a', x: 1, y: 1, s: 'quartier' }, 0, 0);
  assert.equal(others.a.scene, 'quartier');
});

test('Farmwest 2d : ferme → forêt (à l’est) → caverne (fermée)', async () => {
  const { SCENES } = await import('../src/world/scenes.js');
  const { FARM_LINKS } = await import('../src/data/buildings.js'); assert.equal(FARM_LINKS[0].E, 'foret', '19/11 : la forêt à l’est de la ferme principale');
  assert.equal(SCENES.farm.doors.some(d => d.to === 'town' || d.to === 'wild'), false);
  assert.ok(SCENES.foret.doors.some(d => d.to === 'lot' && d.lot === 0) && SCENES.foret.doors.some(d => d.to === 'wild'));
  const { g, S } = makeGame({ state: { scene: 'foret' } });
  assert.equal(act(g, 29, 9), 'locked', 'la caverne est fermée');
  assert.equal(act(g, 0, 9), 'door'); assert.equal(S.scene, 'farm');
});
