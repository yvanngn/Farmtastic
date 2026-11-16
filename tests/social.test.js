import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { registerNPC, talk, gift, hearts, socialNewDay } from '../src/systems/social.js';
import { add } from '../src/systems/inventory.js';

const NPC = { id: 'test', name: 'Testeur', dialog: ['Bonjour'], loves: ['egg'], x: 10, y: 10 };

test('parler : +20 une seule fois par jour', () => {
  const { g, S } = makeGame();
  registerNPC(g, NPC);
  talk(g, 'test'); talk(g, 'test');
  assert.equal(S.social.test.points, 20);
  socialNewDay(S);
  talk(g, 'test');
  assert.equal(S.social.test.points, 40);
});

test('cadeau aimé +80, un par jour', () => {
  const { g, S } = makeGame({ state: { inv: { egg: 2 } } });
  registerNPC(g, NPC);
  assert.equal(gift(g, 'test', 'egg', add), 'adore');
  assert.equal(gift(g, 'test', 'egg', add), false);
  assert.equal(S.social.test.points, 80);
  assert.equal(S.inv.egg, 1);
});

test('cœurs : 250 points = 1 cœur', () => {
  assert.equal(hearts({ points: 520 }), 2);
  assert.equal(hearts({ points: -10 }), 0);
});

// ---- Lot 6 : Luna ----
import { LUNA, OUT_FROM, OUT_TO } from '../src/data/npcs.js';
import { placeNPC, POINTS_PER_HEART, answer, GIFT_PTS } from '../src/systems/social.js';
import { act } from '../src/systems/actions.js';
import { isSolid } from '../src/world/map.js';

function withLuna(state = {}) {
  const t = makeGame({ state: { minute: 600, scene: 'quartier', ...state } });
  registerNPC(t.g, LUNA); placeNPC(t.g.npcs.luna, t.S, OUT_FROM, OUT_TO);
  const said = []; t.g.bus.on('say', d => said.push(...d.lines));
  return { ...t, said };
}

test('Luna : sa vie se dévoile une réplique par jour, et seulement avec assez d’amitié', () => {
  const { g, S, said } = withLuna();
  S.social.luna.asked = LUNA.questions.map(q => q.id); // pas de question pour ce test
  talk(g, 'luna');
  assert.equal(said[0], LUNA.story[0].t);
  talk(g, 'luna');
  assert.equal(said[1], LUNA.story[0].t, 'le même jour, elle répète');
  for (let d = 0; d < 5; d++) { socialNewDay(S); talk(g, 'luna'); }
  assert.deepEqual(S.social.luna.seen, [0, 1, 2], 'sans cœur, seulement les 3 premières');
  assert.ok(LUNA.chat.includes(said.at(-1)));
  S.social.luna.points = 2 * POINTS_PER_HEART; socialNewDay(S); talk(g, 'luna');
  assert.equal(said.at(-1), LUNA.story[3].t, 'au premier cœur : son ancien métier');
});

test('Luna : une question une discussion sur trois ; la réponse change un peu l’amitié, une seule fois', () => {
  const { g, S, said } = withLuna();
  const asks = []; g.bus.on('say', d => d.choices && LUNA.questions.some(q => q.q === d.lines[0]) && asks.push(d));
  talk(g, 'luna'); socialNewDay(S); talk(g, 'luna'); socialNewDay(S); talk(g, 'luna');
  assert.equal(asks.length, 1);
  assert.equal(asks[0].lines[0], LUNA.questions[0].q);
  const before = S.social.luna.points;
  asks[0].onChoose(0);
  assert.equal(S.social.luna.points, before + 12);
  assert.equal(said.at(-1), LUNA.questions[0].a[0].r);
  assert.equal(answer(g, 'luna', 'terre', 0), false, 'pas deux fois');
});

test('cadeaux par degrés : adore +80, aime +45, neutre +20, n’aime pas −20, déteste −40 ; le goût est découvert', () => {
  const { g, S } = withLuna({ inv: { carrot_seed: 1, bread: 1, egg: 1, stone: 1, slime: 1 } });
  const r = S.social.luna, pts = [];
  for (const it of ['carrot_seed', 'bread', 'egg', 'stone', 'slime']) { const p0 = r.points; r.gifted = false; gift(g, 'luna', it, add); pts.push(r.points - p0); }
  assert.deepEqual(pts, [80, 45, 20, -20, -40]);
  assert.deepEqual(r.known, { carrot_seed: 'adore', bread: 'aime', egg: 'neutre', stone: 'naime', slime: 'deteste' });
  assert.equal(GIFT_PTS.aime, 45);
});

test('Luna : l’IA a remplacé son poste (2 cœurs), sa ferme et l’argent ensuite', () => {
  const tiers = LUNA.story.map(l => l.h);
  assert.deepEqual(tiers, [0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4]);
  assert.match(LUNA.story[5].t, /IA/);
  assert.match(LUNA.story[7].t, /ferme/);
  assert.match(LUNA.story[9].t, /argent/);
});

test('Luna : parler au bouton d’action, offrir l’objet tenu (un cadeau par jour)', () => {
  const { g, S, said } = withLuna({ inv: { bread: 2 }, sel: 'hand' });
  const n = g.npcs.luna, tx = Math.floor(n.x), ty = Math.floor(n.y - .3);
  assert.equal(act(g, tx, ty), 'talk');
  S.sel = 'bread';
  assert.equal(act(g, tx, ty), 'gift');
  assert.equal(S.inv.bread, 1);
  assert.equal(said.at(-1), LUNA.react.aime, 'elle aime le pain');
  act(g, tx, ty);
  assert.equal(said.at(-1), LUNA.already);
  assert.equal(S.inv.bread, 1);
});

test('Luna : dehors le jour devant sa maison (quartier), chez elle le soir ; sa maison est solide', () => {
  const { g, S } = withLuna();
  assert.equal(g.npcs.luna.scene, 'quartier');
  S.minute = 1200; placeNPC(g.npcs.luna, S, OUT_FROM, OUT_TO);
  assert.equal(g.npcs.luna.scene, 'luna');
  assert.equal(isSolid(S, 7, 4), true);
  S.minute = 600; S.social.luna.points = 1250; assert.equal(act(g, 8, 5), 'door');
  assert.equal(S.scene, 'luna');
});

// ---- Lot 11 : Franck ----
import { FRANCK } from '../src/data/npcs.js';
import { questProgress } from '../src/systems/quests.js';

test('Franck reste chez lui ; à 2 cœurs il sort s’asseoir devant chez lui en fin de journée', () => {
  const { g, S } = makeGame({ state: { minute: 1060 } });
  registerNPC(g, FRANCK); const n = g.npcs.franck;
  placeNPC(n, S, OUT_FROM, OUT_TO);
  assert.equal(n.scene, 'franck', 'timide : il reste à l’intérieur');
  S.social.franck.points = 2 * POINTS_PER_HEART; placeNPC(n, S, OUT_FROM, OUT_TO);
  assert.equal(n.scene, 'quartier');
  assert.equal(n.justOut, true, 'première sortie annoncée');
  S.minute = 700; placeNPC(n, S, OUT_FROM, OUT_TO);
  assert.equal(n.scene, 'franck', 'pas en pleine journée');
});

test('Franck ne parle jamais de son traumatisme ; la quête avance avec la confiance', () => {
  assert.ok(FRANCK.story.every(l => !/(accident|mort|perdu|abandon)/i.test(l.t)), 'on ne saura jamais ce qui s’est passé');
  const { g, S } = makeGame({ state: { minute: 600 } });
  registerNPC(g, FRANCK);
  assert.equal(questProgress(S, 'franck').cur, 0);
  S.scene = 'franck'; placeNPC(g.npcs.franck, S, OUT_FROM, OUT_TO); talk(g, 'franck');
  assert.equal(questProgress(S, 'franck').cur, 1);
  S.social.franck.points = 4 * POINTS_PER_HEART;
  assert.equal(questProgress(S, 'franck').cur, 4, 'reste : l’objet à fabriquer');
});

test('maison de Franck à côté de celle de Luna, on y entre par sa porte', () => {
  const { g, S } = makeGame({ state: { minute: 600, scene: 'quartier' } });
  assert.equal(isSolid(S, 9, 13), true);
  S.social.franck = { points: 1250 }; assert.equal(act(g, 10, 14), 'door');
  assert.equal(S.scene, 'franck');
});

// ---- Dialogues à choix (comme Witch'rok) et Manuel ----
import { CHEF } from '../src/data/npcs.js';

test('parler : la réplique du jour en tête, puis les sujets et « Rien. »', () => {
  const { g, S } = withLuna();
  S.social.luna.asked = LUNA.questions.map(q => q.id);
  const all = []; g.bus.on('say', d => all.push(d));
  talk(g, 'luna');
  assert.equal(all[0].choices.at(-1), 'Rien.');
  assert.equal(all[0].choices[0], LUNA.topics[0].t);
  assert.equal(all[0].choices.length, 2, 'le sujet sur l’argent attend 3 cœurs');
  all[0].onChoose(0);
  assert.deepEqual(all.at(-1).lines, LUNA.topics[0].lines);
  const n = all.length; all[0].onChoose(1); assert.equal(all.length, n, '« Rien. » ferme la discussion');
});

test('Manuel, le chef du village : élu à l’unanimité, il aime ses villageois', () => {
  assert.equal(CHEF.name, 'Manuel');
  assert.ok(CHEF.story.some(l => /unanimité/.test(l.t)));
  assert.ok(CHEF.story.some(l => /villageois/.test(l.t)));
});

test('16/11 : on entre dans toutes les maisons, Myst compris', () => {
  const { g, S } = makeGame({ state: { minute: 600, scene: 'quartier' } });
  assert.equal(act(g, 10, 14), 'door'); assert.equal(S.scene, 'franck');
  S.scene = 'quartier'; assert.equal(act(g, 5, 26), 'door'); assert.equal(S.scene, 'myst');
});

test('Igor le forgeron : il cherche son bijou (derrière la cabane) et nous apprend le coffre', async () => {
  const { IGOR } = await import('../src/data/npcs.js');
  const { JEWEL, jewelHere, pickJewel } = await import('../src/systems/igor.js');
  const { talk: tk, registerNPC: reg } = await import('../src/systems/social.js');
  const { questProgress } = await import('../src/systems/quests.js');
  const { HAND_RECIPES } = await import('../src/data/recipes.js');
  const { g, S } = makeGame({ state: { minute: 600, day: 3, scene: 'quartier', recipes: ['campfire'], inv: {} } });
  reg(g, IGOR); placeNPC(g.npcs.igor, S, OUT_FROM, OUT_TO);
  assert.equal(g.npcs.igor.scene, 'quartier', 'il traîne dans le quartier');
  const said = []; g.bus.on('say', d => said.push(d));
  S.scene = 'farm'; assert.equal(jewelHere(S), false, 'pas de bijou tant qu’il n’en a pas parlé');
  tk(g, 'igor'); assert.match(said[0].lines.join(' '), /cabane/);
  assert.equal(jewelHere(S), true);
  assert.equal(act(g, JEWEL.x, JEWEL.y), 'pick'); assert.equal(S.inv.igor_bijou, 1);
  assert.equal(questProgress(S, 'igor').cur, 2);
  tk(g, 'igor');
  assert.ok(S.recipes.includes('chest')); assert.deepEqual(HAND_RECIPES.chest.in, { wood: 80, stone: 20 });
  assert.equal(S.inv.igor_bijou || 0, 0); assert.equal(questProgress(S, 'igor').cur, 3);
  assert.ok(IGOR.story.some(l => /olympiques/i.test(l.t)) && IGOR.story.some(l => /armes/.test(l.t)));
});

test('Manuel sort de sa villa à 8h et marche jusqu’à la place (et rentre le soir)', async () => {
  const { CHEF: C } = await import('../src/data/npcs.js');
  const { registerNPC: reg } = await import('../src/systems/social.js');
  const { g, S } = makeGame({ state: { minute: OUT_FROM - 10 } });
  reg(g, C); const n = g.npcs.chef;
  placeNPC(n, S, OUT_FROM, OUT_TO); assert.equal(n.scene, 'none', 'encore chez lui');
  S.minute = OUT_FROM + 1; placeNPC(n, S, OUT_FROM, OUT_TO);
  assert.equal(n.scene, 'town'); assert.ok(n.walking); assert.ok(n.y > 20, 'il part de la villa, au sud');
  S.minute = OUT_FROM + 20; placeNPC(n, S, OUT_FROM, OUT_TO); const mid = n.y;
  assert.ok(mid < 26 && mid > 12.6, 'il est en chemin');
  S.minute = OUT_FROM + 60; placeNPC(n, S, OUT_FROM, OUT_TO); assert.deepEqual([n.x, n.y], [C.day.x, C.day.y]); assert.ok(!n.walking);
  S.minute = OUT_TO + 20; placeNPC(n, S, OUT_FROM, OUT_TO); assert.ok(n.walking && n.y > 12.6, 'le soir, il rentre');
});

test('lot 3 : quête du coffre d’Igor pas avant le 3e jour', async () => {
  const { talk: tk, registerNPC: reg } = await import('../src/systems/social.js');
  const { IGOR } = await import('../src/data/npcs.js');
  const { g, S } = makeGame({ state: { minute: 600, day: 2, scene: 'quartier', inv: {} } });
  reg(g, IGOR); placeNPC(g.npcs.igor, S, OUT_FROM, OUT_TO);
  tk(g, 'igor'); assert.ok(!S.quests?.igor?.asked, 'pas de bijou le 2e jour');
  S.day = 3; S.social.igor.talked = false; tk(g, 'igor'); assert.ok(S.quests.igor.asked);
});

test('16/11 : routine de Hailey — clinique le jour, déjeuner variable, repos 1 jour sur 7', async () => {
  const { HAILEY } = await import('../src/data/npcs.js');
  const { routinePlace } = await import('../src/systems/social.js');
  const at = (day, minute) => routinePlace(HAILEY, { year: 1, season: 0, day, minute });
  assert.equal(at(1, 380), 'maison'); assert.equal(at(1, 600), 'clinique'); assert.equal(at(1, 1430), 'maison');
  const lunch = new Set([1, 2, 3, 4, 5, 6].map(d => at(d, 740)));
  assert.ok(lunch.size >= 2, 'le déjeuner change selon le jour');
  assert.equal(at(7, 600), 'maison', 'jour de repos : grasse matinée'); assert.equal(at(7, 900), 'foret');
});

test('16/11 : le bar d’Ed au centre-ville et la maison à étages de sa famille', async () => {
  const { registerNPC: reg } = await import('../src/systems/social.js');
  const { ED, SUZIE, JADE } = await import('../src/data/npcs.js');
  const { g, S } = makeGame({ state: { minute: 900, scene: 'town' } });
  reg(g, ED); reg(g, SUZIE); reg(g, JADE);
  placeNPC(g.npcs.ed, S, OUT_FROM, OUT_TO); assert.equal(g.npcs.ed.scene, 'bar', 'Ed travaille au bar l’après-midi');
  placeNPC(g.npcs.jade, S, OUT_FROM, OUT_TO); assert.equal(g.npcs.jade.scene, 'ed_etage');
  assert.equal(act(g, 11, 15), 'door'); assert.equal(S.scene, 'bar');
  S.scene = 'quartier'; assert.equal(act(g, 34, 14), 'door'); assert.equal(S.scene, 'ed');
  assert.equal(act(g, 7, 2), 'door'); assert.equal(S.scene, 'ed_etage', 'l’escalier mène à l’étage');
  S.minute = 1430; placeNPC(g.npcs.ed, S, OUT_FROM, OUT_TO); assert.equal(g.npcs.ed.scene, 'ed', 'le soir, chez lui');
});
