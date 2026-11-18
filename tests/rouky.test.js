import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { ROUKY } from '../src/data/npcs.js';
import { registerNPC, placeNPC, talk } from '../src/systems/social.js';
import { roxPos, roxAt, petRox } from '../src/systems/rouky.js';
import { questVisible, questProgress } from '../src/systems/quests.js';
import { LAYOUTS, SCENES } from '../src/world/scenes.js';
import { act } from '../src/systems/actions.js';

test('lot 12 : la cabane du pêcheur remplace la station balnéaire ; Rouky dort dehors le jour et rentre le soir', () => {
  assert.ok(LAYOUTS.plage.some(r => r.includes('X')), 'la cabane'); assert.ok(SCENES.plage.doors.some(d => d.to === 'rouky')); assert.ok(SCENES.rouky);
  const { g, S } = makeGame({ state: { minute: 600 } });
  registerNPC(g, ROUKY); const n = g.npcs.rouky;
  placeNPC(n, S, 480, 1140); assert.equal(n.scene, 'plage'); assert.equal(n.sleeping, true, 'la sieste');
  assert.equal(roxPos(n).scene, 'plage', 'Rox à côté de lui');
  S.minute = 1200; placeNPC(n, S, 480, 1140); assert.equal(n.scene, 'rouky', 'le soir chez lui'); assert.equal(n.sleeping, false);
});

test('lot 12 : quête « La canne de Rouky » : le voir, trouver un os, le donner à Rox → canne sommaire (une seule fois)', () => {
  const { g, S } = makeGame({ state: { minute: 600, scene: 'plage', tools: { hammer: 1, shovel: 1 }, inv: {} } });
  registerNPC(g, ROUKY); placeNPC(g.npcs.rouky, S, 480, 1140);
  assert.equal(questVisible(S, 'rouky'), false, 'cachée tant qu’on n’a pas vu Rouky');
  talk(g, 'rouky'); assert.ok(questVisible(S, 'rouky')); assert.equal(questProgress(S, 'rouky').cur, 1);
  const p = roxPos(g.npcs.rouky), rx = Math.floor(p.x), ry = Math.floor(p.y);
  assert.ok(roxAt(g, rx, ry)); assert.equal(petRox(g), 'rox'); assert.ok(!S.tools.rod, 'pas d’os, pas de canne');
  S.inv.bone = 1; assert.equal(act(g, rx, ry), 'bone');
  assert.equal(S.tools.rod, 1, 'canne sommaire'); assert.equal(S.rodFound, true); assert.equal(S.inv.bone || 0, 0);
  assert.ok(questProgress(S, 'rouky').done.every(Boolean));
  S.inv.bone = 1; assert.equal(petRox(g), 'rox', 'une seule canne'); assert.equal(S.inv.bone, 1);
});
