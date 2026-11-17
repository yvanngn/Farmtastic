import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { craftables, craftRequest, deliverCraft, weekNo, BOARD, CRAFT_HEART_PTS } from '../src/systems/craftquests.js';
import { registerNPC, talk } from '../src/systems/social.js';
import { NPCS, CRAFT_LINES } from '../src/data/npcs.js';
import { XP } from '../src/systems/level.js';

test('lot 9 : on ne demande que ce que le joueur sait fabriquer (au niveau actuel)', () => {
  assert.deepEqual(craftables({ recipes: [], pxp: 0, inv: {} }), []);
  const lvl1 = craftables({ recipes: ['campfire', 'chaudron'], pxp: 10, inv: {} }).map(x => x.out);
  for (const o of ['campfire', 'confiture_baies', 'confiture_mures', 'berry_cooked']) assert.ok(lvl1.includes(o), o);
  assert.ok(!lvl1.includes('bread') && !lvl1.includes('ragout'), 'pas de patron, pas de demande');
  assert.ok(!craftables({ recipes: ['campfire'], pxp: 0, inv: {} }).length, 'niveau 0 : rien encore');
  assert.ok(!craftables({ recipes: ['tisane'], pxp: 10, inv: {} }).some(x => x.out === 'tisane'), 'tisane : niveau 2 requis');
});

test('lot 9 : une demande par habitant et par semaine ; livrée = argent, XP, amitié', () => {
  const { g, S } = makeGame({ state: { recipes: ['campfire'], pxp: 100, day: 1 } });
  registerNPC(g, NPCS.luna);
  const q = craftRequest(g, 'luna'); assert.ok(q);
  S.day = 7; assert.equal(craftRequest(g, 'luna'), q, 'la même toute la semaine');
  assert.equal(deliverCraft(g, 'luna'), false, 'il faut l’objet');
  S.inv[q.item] = q.qty; const m = S.money, p = S.social.luna.points, xp = S.pxp;
  assert.equal(deliverCraft(g, 'luna'), true);
  assert.equal(S.money, m + q.reward); assert.equal(S.social.luna.points, p + CRAFT_HEART_PTS); assert.equal(S.pxp, xp + XP.quest);
  assert.equal(deliverCraft(g, 'luna'), false, 'une seule fois par semaine');
  S.day = 8; const w = craftRequest(g, 'luna'); assert.equal(w.done, false); assert.equal(w.week, weekNo(S));
  assert.ok(craftRequest(g, BOARD), 'le panneau aussi');
});

test('lot 9 : en discutant, « Une demande ? » donne la demande, puis la reprend quand on a l’objet', () => {
  const { g, S } = makeGame({ state: { recipes: ['campfire'], pxp: 100 } });
  registerNPC(g, NPCS.franck); const said = []; g.bus.on('say', d => said.push(d));
  talk(g, 'franck'); const ch = said.at(-1).choices; const i = ch.indexOf('🛠️ Une demande ?'); assert.ok(i >= 0);
  said.at(-1).onChoose(i); const q = S.craftQ.franck;
  assert.match(said.at(-1).lines[0], new RegExp(CRAFT_LINES.ask.split('{')[0].slice(0, 15)));
  S.inv[q.item] = q.qty; S.social.franck.talked = false;
  talk(g, 'franck'); said.at(-1).onChoose(said.at(-1).choices.indexOf('🛠️ Une demande ?'));
  said.at(-1).onEnd(); assert.equal(q.done, true);
});
