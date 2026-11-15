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
  assert.equal(gift(g, 'test', 'egg', add), true);
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
import { placeNPC, POINTS_PER_HEART } from '../src/systems/social.js';
import { act } from '../src/systems/actions.js';
import { isSolid } from '../src/world/map.js';

function withLuna(state = {}) {
  const t = makeGame({ state: { minute: 600, ...state } });
  registerNPC(t.g, LUNA); placeNPC(t.g.npcs.luna, t.S, OUT_FROM, OUT_TO);
  const said = []; t.g.bus.on('say', d => said.push(...d.lines));
  return { ...t, said };
}

test('Luna : sa vie se dévoile une réplique par jour, et seulement avec assez d’amitié', () => {
  const { g, S, said } = withLuna();
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
  assert.equal(said.at(-1), LUNA.thanks);
  act(g, tx, ty);
  assert.equal(said.at(-1), LUNA.already);
  assert.equal(S.inv.bread, 1);
});

test('Luna : dehors le jour devant sa maison, chez elle le soir ; sa maison est solide', () => {
  const { g, S } = withLuna();
  assert.equal(g.npcs.luna.scene, 'farm');
  S.minute = 1200; placeNPC(g.npcs.luna, S, OUT_FROM, OUT_TO);
  assert.equal(g.npcs.luna.scene, 'luna');
  assert.equal(isSolid(S, 19, 30), true);
  S.minute = 600; assert.equal(act(g, 20, 31), 'door');
  assert.equal(S.scene, 'luna');
});
