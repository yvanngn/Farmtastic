// Lot 8 : début de partie (aucun outil, accueil du chef, grange-tunnels).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { defaultState, migrate } from '../src/core/state.js';
import { act, smartTool } from '../src/systems/actions.js';
import { hasTool, canUpgrade } from '../src/systems/skills.js';
import { autoPickup, PICKUPS } from '../src/systems/grange.js';
import { registerNPC, placeNPC, welcome } from '../src/systems/social.js';
import { CHEF, OUT_FROM, OUT_TO } from '../src/data/npcs.js';
import { isSolid } from '../src/world/map.js';

const start = (extra = {}) => makeGame({ state: { tools: {}, intro: { met: false }, grange: { found: [], broken: [] }, ...extra } });

test('nouvelle partie : aucun outil, accueil à faire, grange intacte', () => {
  const S = defaultState();
  assert.deepEqual(S.tools, {});
  assert.equal(S.intro.met, false);
  assert.equal(hasTool(S, 'hand'), true);
  assert.equal(hasTool(S, 'axe'), false);
});

test('sans hache : on ne coupe pas, le message parle de la grange', () => {
  const { g, S, toasts } = start({ sel: 'hand' });
  S.objs['30,20'] = { t: 'tree', k: 'oak', g: 3, hp: 3 };
  assert.equal(smartTool(g, 30, 20), 'hand');
  S.x = 30.5; S.y = 21.5; S.dir = 1;
  act(g, 30, 20);
  assert.match(toasts().at(-1), /grange/);
  assert.equal(canUpgrade(S, 'axe').why, 'missing');
});

test('grange : la hache à l’entrée, les planches, la faucille et la pioche, l’éboulis, la pelle', () => {
  const { g, S } = start();
  assert.equal(act(g, 12, 4), 'door');
  assert.equal(S.scene, 'grange');
  assert.equal(act(g, 9, 2), 'blocked', 'planches sans hache');
  S.x = 3.5; S.y = 3.6; assert.equal(autoPickup(g), 'axe');
  assert.equal(isSolid(S, 9, 2), true);
  assert.equal(act(g, 9, 2), 'break');
  assert.equal(isSolid(S, 9, 2), false, 'le passage est ouvert');
  assert.equal(act(g, 12, 3), 'sickle');
  assert.equal(act(g, 13, 4), 'pick');
  assert.equal(act(g, 13, 7), 'break', 'éboulis à la pioche');
  assert.equal(act(g, 18, 9), 'shovel');
  assert.deepEqual(S.grange.found.sort(), PICKUPS.map(p => p.tool).sort());
  assert.equal(act(g, 20, 8), 'collapse', 'la suite des tunnels reste fermée');
  assert.equal(hasTool(S, 'sword'), false, 'pas d’épée dans la grange');
});

test('le chef accueille le joueur près de la maison, puis va sur la place du village', () => {
  const { g, S } = start({ minute: 600 });
  registerNPC(g, CHEF); placeNPC(g.npcs.chef, S, OUT_FROM, OUT_TO);
  assert.equal(g.npcs.chef.scene, 'farm');
  const said = []; g.bus.on('say', d => said.push(d));
  assert.equal(welcome(g), true);
  assert.equal(said[0].lines.length, CHEF.welcomeLines.length);
  said[0].onChoose(0);
  assert.equal(S.intro.met, true);
  placeNPC(g.npcs.chef, S, OUT_FROM, OUT_TO);
  assert.equal(g.npcs.chef.scene, 'town');
  assert.equal(welcome(g), false, 'une seule fois');
});

test('ancienne sauvegarde : outils gardés, pas d’accueil', () => {
  const s = migrate({ name: 'x', tools: { axe: 2, pick: 1, sickle: 1, sword: 1 } });
  assert.equal(s.tools.axe, 2);
  assert.equal(s.intro.met, true);
  assert.equal(migrate({ name: 'y' }).tools.sword, 1);
});

// ---- 15/11 midi : maire, chiens, forêt, emplacements de ferme ----
import { ensureShrooms, pickShroom } from '../src/systems/foret.js';
import { MUSHROOMS, ITEMS } from '../src/data/items.js';
import { LUNA, FRANCK } from '../src/data/npcs.js';
import { buyAnimal, build, canBuyAnimal } from '../src/systems/economy.js';
import { FARM_LOTS } from '../src/data/buildings.js';
import { applyPresence } from '../src/net/multiplayer.js';
import { LAYOUTS } from '../src/world/scenes.js';

test('après l’accueil (même passé avec « Passer »), le maire redescend vers le village', () => {
  const { g, S } = start({ minute: 600 });
  registerNPC(g, CHEF); const n = g.npcs.chef;
  const said = []; g.bus.on('say', d => said.push(d));
  assert.equal(welcome(g), true); said.at(-1).onEnd();   // fermé sans répondre
  assert.equal(S.intro.met, true);
  for (let i = 0; i < 2000 && n.leaving; i++) placeNPC(n, S, OUT_FROM, OUT_TO);
  assert.equal(n.leaving, false, 'il est arrivé au portail du village');
  placeNPC(n, S, OUT_FROM, OUT_TO);
  assert.equal(n.scene, 'town');
});

test('chiens : il faut un chenil, puis ils vivent en liberté', () => {
  const { g, S } = makeGame({ state: { money: 1e5, inv: { wood: 99, stone: 99 }, animals: [], built: { coop: false, pigsty: false, kennel: false, barn: false } } });
  assert.equal(canBuyAnimal(S, 'dog').why, 'home');
  assert.equal(build(g, 'kennel'), true);
  assert.equal(buyAnimal(g, 'dog'), true);
  assert.equal(S.animals[0].type, 'dog');
});

test('forêt : champignons de saison au pied des arbres, gros et rares plus chers', () => {
  let k = 11; const { g, S } = makeGame({ rnd: () => ((k = (k * 9301 + 49297) % 233280) / 233280), state: { scene: 'foret', season: 2, inv: {} } });
  const all = {};
  for (let d = 1; d <= 30; d++) { S.day = d; Object.assign(all, Object.fromEntries(Object.entries(ensureShrooms(g)).map(([kk, m]) => [d + ':' + kk, m]))); }
  const ms = Object.values(all), autumn = MUSHROOMS[2].map(m => m.id);
  assert.ok(ms.every(m => autumn.includes(m.sp)), 'seulement les espèces d’automne');
  const count = sz => ms.filter(m => m.size === sz).length;
  assert.ok(count('s') > count('m') && count('m') > count('l') && count('l') > 0, 'gros = rare');
  assert.ok(ms.filter(m => m.sp === 'truffe_blanche').length < ms.filter(m => m.sp === 'cepe').length, 'espèce rare = rare');
  assert.ok(ITEMS.cepe_l.p > ITEMS.cepe_s.p && ITEMS.truffe_blanche_s.p > ITEMS.cepe_l.p);
  const L = LAYOUTS.foret;
  for (const kk of Object.keys(S.foret.shrooms)) { const [x, y] = kk.split(',').map(Number); assert.ok([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => L[y + b][x + a] === 'T'), 'au pied d’un arbre'); }
  const [x, y] = Object.keys(S.foret.shrooms)[0].split(',').map(Number);
  assert.ok(pickShroom(g, x, y));
  assert.equal(Object.values(S.inv).reduce((a, b) => a + b, 0), 1);
});

test('forêt : des habitants s’y promènent à certaines heures', () => {
  const { g, S } = start({ minute: 970, day: 2 });
  registerNPC(g, LUNA); registerNPC(g, FRANCK);
  placeNPC(g.npcs.luna, S, OUT_FROM, OUT_TO);
  assert.equal(g.npcs.luna.scene, 'foret');
  S.day = 3; placeNPC(g.npcs.luna, S, OUT_FROM, OUT_TO);
  assert.equal(g.npcs.luna.scene, 'farm', 'pas tous les jours');
  S.minute = 400; S.day = 2; placeNPC(g.npcs.franck, S, OUT_FROM, OUT_TO);
  assert.equal(g.npcs.franck.scene, 'franck', 'Franck, trop timide au début');
  for (const n of [LUNA, FRANCK, CHEF]) for (const w of n.walks) assert.equal(LAYOUTS.foret[Math.floor(w.at.y)][Math.floor(w.at.x)], '.');
});

test('une ferme de départ par joueur : 4 emplacements, chacun annonce le sien', () => {
  assert.equal(FARM_LOTS.length, 4);
  assert.equal(defaultState().farmLot, 0);
  const others = {}; applyPresence(others, { a: [{ name: 'Léa', look: {}, farmLot: 2 }] }, 'moi', 0);
  assert.equal(others.a.farmLot, 2);
});

test('l’entrée de la forêt est à l’ouest de la ferme', () => {
  const { g, S } = start();
  assert.equal(act(g, 0, 20), 'door');
  assert.equal(S.scene, 'foret');
});
