// Lot 8 : début de partie (aucun outil, accueil du chef, grange-tunnels).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { defaultState, migrate } from '../src/core/state.js';
import { act } from '../src/systems/actions.js';
import { hasTool, canUpgrade } from '../src/systems/skills.js';
import { autoPickup, PICKUPS } from '../src/systems/grange.js';
import { registerNPC, placeNPC } from '../src/systems/social.js';
import { CHEF, OUT_FROM, OUT_TO } from '../src/data/npcs.js';
import { isSolid, ground } from '../src/world/map.js';

const start = (extra = {}) => makeGame({ state: { tools: {}, intro: { met: false }, grange: { found: [], broken: [] }, ...extra } });

test('nouvelle partie : aucun outil, arrivée en train, cabane et grange délabrées', () => {
  const S = defaultState();
  assert.deepEqual(S.tools, { hammer: 1 }, 'seulement le marteau');
  assert.equal(S.intro.arrived, false);
  assert.ok(isPlatform(Math.floor(S.x), Math.floor(S.y)), 'sur le quai de la gare');
  assert.equal(isRepaired(S, 'house'), false);
  assert.equal(isRepaired(S, 'grange'), false);
  assert.equal(hasTool(S, 'hand'), true);
  assert.equal(hasTool(S, 'axe'), false);
});
test('sans hache : on ne coupe pas, et pas d’indice précis sur l’emplacement', () => {
  const { g, S, toasts } = start({ sel: 'hand' });
  S.objs['30,20'] = { t: 'tree', k: 'oak', g: 3, hp: 3 };
  S.x = 30.5; S.y = 21.5; S.dir = 1;
  act(g, 30, 20);
  assert.match(toasts().at(-1), /outil pour couper/);
  assert.equal(canUpgrade(S, 'axe').why, 'missing');
});

test('dehors : la pioche contre la grange, la hache parmi les arbres du sud', () => {
  const { g, S } = start({ tools: {} });
  for (const t of FIELD_TOOLS) { assert.equal(act(g, t.x, t.y), 'pick'); assert.equal(S.tools[t.tool], 1); }
  assert.equal(fieldToolAt(S, 14, 3), null, 'une seule fois');
  const trees = AXE_GROVE.filter(([x, y]) => genObjects()[x + ',' + y]?.t === 'tree').length;
  assert.equal(trees, AXE_GROVE.length, 'la hache est cachée parmi des arbres');
});

test('grange (une fois réparée) : les planches, la faucille, l’éboulis, la pelle', () => {
  const { g, S } = start({ tools: { axe: 1, pick: 1 } });
  assert.equal(act(g, 12, 4), 'door');
  assert.equal(S.scene, 'grange');
  assert.equal(isSolid(S, 9, 2), true);
  assert.equal(act(g, 9, 2), 'break');
  assert.equal(isSolid(S, 9, 2), false, 'le passage est ouvert');
  assert.equal(act(g, 12, 3), 'sickle');
  assert.equal(act(g, 13, 7), 'break', 'éboulis à la pioche');
  assert.equal(act(g, 18, 9), 'shovel');
  assert.deepEqual(S.grange.found.sort(), PICKUPS.map(p => p.tool).sort());
  assert.equal(act(g, 20, 8), 'collapse', 'la suite des tunnels reste fermée');
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

import { buyAnimal, build, canBuyAnimal } from '../src/systems/economy.js';
import { FARM_LOTS } from '../src/data/buildings.js';
import { applyPresence } from '../src/net/multiplayer.js';
import { LAYOUTS } from '../src/world/scenes.js';

test('chiens : il faut un chenil, puis ils vivent en liberté', () => {
  const { g, S } = makeGame({ state: { money: 1e5, inv: { wood: 99, stone: 99 }, animals: [], built: { coop: false, pigsty: false, kennel: false, barn: false } } });
  assert.equal(canBuyAnimal(S, 'dog').why, 'home');
  assert.equal(build(g, 'kennel'), true);
  assert.equal(buyAnimal(g, 'dog'), true);
  assert.equal(S.animals[0].type, 'dog');
});

test('forêt : champignons de saison au pied des arbres, gros et rares plus chers', () => {
  let k = 11; const { g, S } = makeGame({ rnd: () => ((k = (k * 9301 + 49297) % 233280) / 233280), state: { scene: 'foret', season: 2, inv: {}, tools: { knife: 1 } } });
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
  assert.equal(g.npcs.luna.scene, 'quartier', 'pas tous les jours');
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

// ---- 15/11 soir : cabane délabrée, Myst, gare, villa du maire ----
import { REPAIRS, FIELD_TOOLS, AXE_GROVE, REPAIR_STEP } from '../src/data/repairs.js';
import { isRepaired, contribute, repairNear, fieldToolAt } from '../src/systems/repair.js';
import { isPlatform, isStation, genObjects } from '../src/world/map.js';
import { MYST } from '../src/data/npcs.js';
import { mystTick } from '../src/systems/social.js';
import { LAYOUTS as LAY } from '../src/world/scenes.js';

const ruined0 = () => ({ repair: { house: { wood: 0, stone: 0 }, grange: { wood: 0, stone: 0 } }, intro: { met: true, myst: false, arrived: true } });

test('cabane délabrée : on ne peut pas entrer, on dépose bois et pierres jusqu’à remplir les jauges', () => {
  const { g, S, toasts } = start({ ...ruined0(), inv: { wood: 30, stone: 3 }, sel: 'hammer' });
  S.x = 5.5; S.y = 6.6;
  assert.equal(repairNear(S), 'house', 'la fenêtre des besoins s’affiche devant');
  assert.equal(act(g, 5, 4), 'repair', 'la porte ne s’ouvre pas : on dépose');
  assert.equal(S.scene, 'farm');
  assert.deepEqual(S.repair.house, { wood: 1, stone: 1 }, 'un seul bois et une seule pierre par coup : c’est lent');
  assert.equal(S.inv.wood, 30 - REPAIR_STEP);
  while (S.inv.wood) act(g, 3, 2);
  assert.equal(act(g, 3, 2), 'missing'); assert.match(toasts().at(-1), /manque/);
  S.inv.wood = 200; S.inv.stone = 200;
  while (!isRepaired(S, 'house')) assert.equal(act(g, 3, 2), 'repair');
  assert.deepEqual(S.repair.house, REPAIRS.house.need, 'jamais plus que nécessaire');
  assert.equal(S.inv.wood, 200 - (100 - 30));
  assert.equal(act(g, 5, 4), 'door', 'on peut entrer');
});

test('grange délabrée : fermée jusqu’à sa réparation', () => {
  const { g, S } = start({ ...ruined0(), inv: {}, sel: 'hammer' });
  assert.equal(act(g, 12, 4), 'missing');
  assert.equal(S.scene, 'farm');
  S.repair.grange = { ...REPAIRS.grange.need };
  assert.equal(act(g, 12, 4), 'door');
});

test('Myst attend sur le quai, vient parler après les pensées du héros (plan, tente, tâches, outil), puis redescend au quartier', () => {
  const { g, S } = start({ ...ruined0(), minute: 600, x: 2, y: 20.6 });
  S.intro.myst = 'wait'; S.intro.arrived = false;
  registerNPC(g, MYST); const n = g.npcs.myst;
  placeNPC(n, S, OUT_FROM, OUT_TO);
  assert.equal(n.scene, 'farm'); assert.equal(S.intro.myst, 'wait', 'il attend que le héros ait fini de penser');
  S.intro.arrived = true; placeNPC(n, S, OUT_FROM, OUT_TO);
  assert.equal(S.intro.myst, 'talk');
  const said = [], maps = []; g.bus.on('say', d => said.push(d)); g.bus.on('showMap', () => maps.push(1));
  assert.equal(mystTick(g), true); assert.equal(mystTick(g), false, 'une seule fois');
  const all = said[0].lines.join(' ');
  for (const re of [/plan/, /Déployer/, /tâches/, /outil/, /quartier/]) assert.match(all, re);
  assert.doesNotMatch(all, /sud.*hache|hache.*sud/, 'pas d’indice précis sur la hache');
  said[0].onEnd(); assert.equal(maps.length, 1, 'il montre le plan');
  for (let i = 0; i < 3000 && S.intro.myst === 'leaving'; i++) placeNPC(n, S, OUT_FROM, OUT_TO);
  assert.equal(S.intro.myst, 'done'); assert.equal(n.scene, 'none');
  S.minute = 1200; placeNPC(n, S, OUT_FROM, OUT_TO); assert.equal(n.scene, 'quartier', 'il sort le soir, devant chez lui au fond du quartier');
  assert.ok(LAY.quartier[24].slice(3, 9) === 'XXXXXX' && LAY.quartier[20][4] === 'T', 'sa maison est tout en bas à gauche, à l’écart derrière une rangée d’arbres');
  assert.equal(MYST.look.tall && MYST.look.coat, true, 'grand, long manteau');
});
test('gare à l’ouest : quai, chemin vers la ferme et le village ; la villa du maire au sud de la ville', () => {
  assert.ok(isStation(2, 15) && isPlatform(1, 20));
  assert.equal(isSolid({ scene: 'farm' }, 0, 20), true, 'la voie ferrée');
  for (let x = 3; x <= 16; x++) assert.equal(ground(x, 20), 'path');
  assert.ok(LAY.town.slice(21).some(r => r.includes('W')), 'villa au sud de la place');
});

test('vieilles sauvegardes : cabane et grange déjà debout', () => {
  const s = migrate({ name: 'x', tools: { axe: 1 }, intro: { met: true } });
  assert.equal(isRepaired(s, 'house'), true); assert.equal(isRepaired(s, 'grange'), true);
  assert.equal(s.intro.myst, 'done');
});

// ---- 15/11 soir (5) : quartier résidentiel au sud, centre-ville à droite ----
import { SCENES } from '../src/world/scenes.js';
import { LUNA, FRANCK } from '../src/data/npcs.js';


test('quartier au sud de la ferme : Luna et Franck y habitent', () => {
  const { g, S } = start({ minute: 600 });
  assert.equal(act(g, 16, 35), 'door'); assert.equal(S.scene, 'quartier');
  assert.ok(LAY.quartier.some(r => r.includes('X')));
  registerNPC(g, LUNA); placeNPC(g.npcs.luna, S, OUT_FROM, OUT_TO);
  assert.equal(g.npcs.luna.scene, 'quartier', 'Luna sort dans le quartier');
  S.social.luna = { ...(S.social.luna || {}), points: 1250 };
  S.x = 8.5; S.y = 6.6; assert.equal(act(g, 8, 5), 'door'); assert.equal(S.scene, 'luna');
  assert.equal(SCENES.franck.doors[0].to, 'quartier');
  assert.equal(SCENES.farm.doors.some(d => d.to === 'luna' || d.to === 'franck'), false, 'plus de maisons d’habitants sur la ferme');
});

test('le centre-ville est à droite : la route de l’est y mène', () => {
  const { g, S } = start();
  for (let x = 2; x <= 46; x++) assert.equal(ground(x, 5), 'path');
  assert.equal(act(g, 47, 5), 'door'); assert.equal(S.scene, 'town');
  assert.ok(SCENES.town.doors.some(d => d.x === 0 && d.to === 'farm'), 'on arrive en ville par l’ouest');
});

test('la route de l’est va jusqu’au bord de la ferme (on voit qu’elle continue)', () => {
  assert.equal(ground(47, 5), 'path');
});

test('champignons : sans couteau, le héros préfère ne pas les cueillir à la main', async () => {
  const { pickShroom: pick } = await import('../src/systems/foret.js');
  const { g, S, toasts } = start({ scene: 'foret', inv: {} });
  S.foret = { day: null, shrooms: { '5,5': { sp: 'cepe', size: 'm' } } };
  assert.equal(pick(g, 5, 5), false);
  assert.ok(S.foret.shrooms['5,5'], 'il reste par terre');
  assert.match(toasts().at(-1), /idée reçue/);
});

test('réparer demande le marteau', () => {
  const { g, S } = start({ ...ruined0(), inv: { wood: 5, stone: 5 }, sel: 'hand' });
  assert.equal(act(g, 3, 2), 'needHammer'); assert.equal(S.repair.house.wood, 0);
  S.sel = 'hammer'; assert.equal(act(g, 3, 2), 'repair');
});
