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
  assert.equal(o.kind, 'chantier');
  assert.ok(o.price >= ITEMS[o.item].p, 'au moins le prix du bac');
  assert.equal(fulfillOrder(g, o.id), false, 'pas assez de blé');
  S.inv[o.item] = o.qty;
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
  assert.equal(act(g, 47, 5), 'door', 'la route de l’est mène en ville');
  assert.equal(S.scene, 'town');
  assert.equal(act(g, 6, 4), 'market');
  assert.equal(act(g, 15, 3), 'board');
  assert.deepEqual(opened, ['market', 'board']);
  assert.ok(!isSolid(S, 12, 6), 'la place est praticable');
  assert.equal(act(g, 0, 10), 'door');
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

// ---- Lot 7 : demandes à code couleur ----
import { newOrder, village, currentProject, unlock, isUnlocked } from '../src/systems/market.js';
import { PROJECTS, FESTIVAL_GOAL, UNLOCKS } from '../src/data/requests.js';
import { LUNA } from '../src/data/npcs.js';
import { ITEMS } from '../src/data/items.js';
import { registerNPC } from '../src/systems/social.js';
import { canBuyAnimal, buy as buyItem } from '../src/systems/economy.js';
import { canUpgrade } from '../src/systems/skills.js';

const freshState = () => ({ caravan: { tokens: 0, unlocked: [] } });

test('demandes : 4 familles, l’habitant demande ce qu’il aime', () => {
  let k = 7; const { g } = makeGame({ state: freshState(), rnd: () => ((k = (k * 9301 + 49297) % 233280) / 233280) });
  registerNPC(g, LUNA);
  const kinds = new Set();
  for (let i = 0; i < 80; i++) { const o = newOrder(g, 0); kinds.add(o.kind); if (o.kind === 'habitant') assert.ok([...LUNA.taste.adore, ...LUNA.taste.aime].includes(o.item)); }
  assert.deepEqual([...kinds].sort(), ['caravane', 'chantier', 'fete', 'habitant']);
});

test('chantier : la jauge commune avance, le chantier fini paie et passe au suivant', () => {
  const { g, S } = makeGame({ state: { ...freshState(), money: 0, inv: { wood: 10 } } });
  village(S);
  S.market = { slots: [{ order: { id: 'a', kind: 'chantier', item: 'wood', qty: PROJECTS[0].goal, price: 1, bot: 'x' }, next: 0 }] };
  assert.equal(fulfillOrder(g, 'a'), false, 'pas assez de bois');
  S.inv.wood = PROJECTS[0].goal;
  assert.equal(fulfillOrder(g, 'a'), true);
  assert.deepEqual(S.village.done, ['lampadaires']);
  assert.equal(currentProject(S).id, 'place');
  assert.equal(S.money, PROJECTS[0].goal + PROJECTS[0].reward);
});

test('fête de saison : jauge par saison, remise à zéro à la saison suivante', () => {
  const { g, S } = makeGame({ state: { ...freshState(), inv: { wheat: FESTIVAL_GOAL } } });
  village(S);
  S.market = { slots: [{ order: { id: 'f', kind: 'fete', item: 'wheat', qty: FESTIVAL_GOAL, price: 1, bot: 'x' }, next: 0 }] };
  fulfillOrder(g, 'f');
  assert.equal(S.festival.done, true);
  S.season = 1; village(S);
  assert.equal(S.festival.pts, 0);
});

test('habitant : livrer donne de l’amitié ; caravane : des jetons qui débloquent', () => {
  const { g, S } = makeGame({ state: { ...freshState(), inv: { bread: 1, wool: 2 } } });
  registerNPC(g, LUNA); village(S);
  S.market = { slots: [
    { order: { id: 'h', kind: 'habitant', npc: 'luna', item: 'bread', qty: 1, price: 1, bot: 'Luna' }, next: 0 },
    { order: { id: 'c', kind: 'caravane', item: 'wool', qty: 2, price: 1, tokens: 2, bot: 'x' }, next: 0 }] };
  fulfillOrder(g, 'h'); fulfillOrder(g, 'c');
  assert.equal(S.social.luna.points, 40);
  assert.equal(S.caravan.tokens, 2);
  assert.equal(isUnlocked(S, 'carrot_seed'), false);
  assert.equal(unlock(g, 'carrot_seed'), true);
  assert.equal(isUnlocked(S, 'carrot_seed'), true);
  assert.equal(S.caravan.tokens, 0);
});

test('caravane : sans déblocage, pas de lapin, pas de graines de maïs, pas de forge Or', () => {
  const { g, S } = makeGame({ state: { ...freshState(), money: 1e6, inv: { stone: 999 }, tools: { axe: 3, pick: 3, sickle: 3, sword: 3 }, skills: { mining: { xp: 99999 } } } });
  assert.equal(canBuyAnimal(S, 'rabbit').why, 'locked');
  assert.equal(buyItem(g, 'corn_seed'), false);
  assert.equal(canUpgrade(S, 'axe').why, 'plans');
  S.caravan.unlocked = UNLOCKS.map(u => u.id);
  assert.equal(canBuyAnimal(S, 'rabbit').ok, true);
  assert.equal(canUpgrade(S, 'axe').ok, true);
});

test('demandes : jamais un objet qu’on ne peut pas encore produire', () => {
  let k = 3; const { g } = makeGame({ state: { ...freshState(), built: { coop: false, pigsty: false, barn: false } }, rnd: () => ((k = (k * 9301 + 49297) % 233280) / 233280) });
  for (let i = 0; i < 100; i++) assert.ok(!['wool', 'rabbit_wool', 'truffle', 'egg', 'corn', 'carrot'].includes(newOrder(g, 0).item));
});
