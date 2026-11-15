import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame, seq } from './helpers.js';
import { act } from '../src/systems/actions.js';
import { isSolid } from '../src/world/map.js';
import { facingTile } from '../src/systems/movement.js';
import { interactAnimal, animalsNewDay, feedAll } from '../src/systems/animals.js';
import { buyAnimal } from '../src/systems/economy.js';
import { fulfillOrder, ensureOrders, discardOrder, timeLeft, fmtDelay, RENEW_MS } from '../src/systems/market.js';
import { applyPos } from '../src/net/multiplayer.js';

test('entrer et sortir de la maison, dormir dans le lit', () => {
  const { g, S, sounds } = makeGame({ state: { minute: 1200 } });
  assert.equal(act(g, 5, 4), 'door');
  assert.equal(S.scene, 'house');
  assert.ok(isSolid(S, 0, 0) && !isSolid(S, 5, 7));
  assert.equal(act(g, 10, 2), 'sleep');
  assert.equal(act(g, 5, 8), 'door');
  assert.equal(S.scene, 'farm');
  assert.ok(sounds().includes('door'));
});

test('poulailler : la mangeoire nourrit tous les animaux', () => {
  const { g, S } = makeGame({ state: { inv: { hay: 1 } } });
  act(g, 24, 7);
  assert.equal(S.scene, 'coop');
  assert.equal(act(g, 3, 2), 'feedAll');
  assert.equal(S.animals[0].fed, true);
  assert.equal(S.inv.hay, undefined);
});

test('bouton action : tuile en face du joueur', () => {
  assert.deepEqual(facingTile({ x: 6.5, y: 6.8, dir: 0 }), { tx: 6, ty: 7 });
  assert.deepEqual(facingTile({ x: 6.5, y: 6.8, dir: 1 }), { tx: 6, ty: 5 });
  assert.deepEqual(facingTile({ x: 6.5, y: 6.8, dir: 2 }), { tx: 5, ty: 6 });
  assert.deepEqual(facingTile({ x: 16.5, y: 34.4, dir: 0 }), { tx: 16, ty: 35 }, 'pieds en haut de la case');
});

test('mouton : laine tous les 3 jours s’il est nourri', () => {
  const { g, S } = makeGame({ state: { money: 2000, animals: [] } });
  buyAnimal(g, 'sheep');
  const m = S.animals[0];
  for (let d = 0; d < 3; d++) { m.fed = true; animalsNewDay(S); }
  assert.equal(m.produced, true);
  S.inv = {};
  assert.equal(interactAnimal(g, m), 'collect');
  assert.equal(S.inv.wool, 1);
});

test('chat : se caresse, ne se nourrit pas, ne produit rien', () => {
  const { g, S, sounds } = makeGame({ state: { money: 300, animals: [], sel: 'hay' } });
  buyAnimal(g, 'cat');
  const c = S.animals[0];
  assert.equal(interactAnimal(g, c), 'pet');
  assert.equal(c.love, 15);
  assert.ok(sounds().includes('meow'));
  animalsNewDay(S);
  assert.equal(c.produced, false);
  assert.equal(feedAll(g), 0);
});

test('lapin : sac plein → produit gardé', () => {
  const { g, S } = makeGame({ state: { animals: [{ id: 'r', type: 'rabbit', x: 20, y: 9, produced: true, love: 0 }], inv: { a: 1, b: 1 }, invSlots: 2 } });
  assert.equal(interactAnimal(g, S.animals[0]), 'full');
  assert.equal(S.animals[0].produced, true);
});

test('panneau du village : 6 demandes, place vide 2 h après livraison', () => {
  const { g, S, clock } = makeGame({ rnd: seq(0), state: { money: 0 } });
  const slots = ensureOrders(g);
  assert.equal(slots.length, 6);
  const o = slots[0].order;
  assert.equal(o.item, 'wheat');
  assert.ok(o.price >= 7, 'mieux payé que le bac');
  assert.equal(fulfillOrder(g, o.id), false, 'pas assez de blé');
  S.inv.wheat = o.qty;
  assert.equal(fulfillOrder(g, o.id), true);
  assert.equal(S.money, o.qty * o.price);
  assert.equal(slots[0].order, null);
  clock.t += RENEW_MS - 1000; ensureOrders(g);
  assert.equal(slots[0].order, null, 'encore vide avant 2 h');
  clock.t += 1000; ensureOrders(g);
  assert.ok(slots[0].order, 'nouvelle demande après 2 h');
});

test('panneau : jeter une demande libère aussi la place pour 2 h', () => {
  const { g, clock } = makeGame();
  const slots = ensureOrders(g), id = slots[2].order.id;
  assert.equal(discardOrder(g, id), true);
  assert.equal(slots[2].order, null);
  assert.equal(timeLeft(g, slots[2]), RENEW_MS);
  assert.equal(fmtDelay(RENEW_MS), '2 h 00');
  clock.t += RENEW_MS; ensureOrders(g);
  assert.ok(slots[2].order);
});

test('ancienne sauvegarde (commandes du jour) migrée vers le panneau', () => {
  const { g, S } = makeGame({ state: { market: { day: 3, orders: [{ id: 'x' }] } } });
  assert.equal(ensureOrders(g).length, 6);
  assert.ok(Array.isArray(S.market.slots));
});

test('village : portail, halle du marché et panneau d’affichage', () => {
  const { g, S } = makeGame();
  const opened = []; g.bus.on('open', w => opened.push(w));
  assert.ok(isSolid(S, 16, 35), 'portail');
  assert.equal(act(g, 16, 35), 'door');
  assert.equal(S.scene, 'town');
  assert.equal(act(g, 6, 4), 'market');
  assert.equal(act(g, 15, 3), 'board');
  assert.deepEqual(opened, ['market', 'board']);
  assert.ok(!isSolid(S, 12, 6), 'la place est praticable');
  assert.equal(act(g, 12, 0), 'door');
  assert.equal(S.scene, 'farm');
});

test('multijoueur : la scène voyage avec la position', () => {
  const others = {};
  applyPos(others, { id: 'b', x: 1, y: 1, d: 0, f: 0, s: 'house' }, 0);
  assert.equal(others.b.scene, 'house');
});

test('village : le magasin d’amélioration ouvre son interface', async () => {
  const { UI_TILES, tileAt } = await import('../src/world/scenes.js');
  assert.equal(tileAt('town', 18, 3), 'U');
  assert.equal(UI_TILES.U, 'upgrades');
});
