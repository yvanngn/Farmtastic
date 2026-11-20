import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { LEVELS, MAX_LEVEL, levelOf, level, xpBar, gainPxp, questXpTick, seedQuestXp, zoneOpen, recipeOpen, XP } from '../src/systems/level.js';
import { hitObject } from '../src/systems/resources.js';
import { craftHand, canCraftHand } from '../src/systems/cooking.js';
import { act } from '../src/systems/actions.js';
import { HAND_RECIPES } from '../src/data/recipes.js';
import { POT_RECIPES } from '../src/data/patterns.js';
import { migrate, defaultState } from '../src/core/state.js';

test('lot 8 : niveau 1 vite, puis courbe exponentielle, niveau 10 maximum', () => {
  assert.equal(LEVELS[1], 10, 'le niveau 1 en 10 XP');
  assert.equal(LEVELS.length, MAX_LEVEL + 1);
  for (let n = 2; n < MAX_LEVEL; n++) assert.ok(LEVELS[n + 1] - LEVELS[n] > (LEVELS[n] - LEVELS[n - 1]) * 1.5, 'chaque niveau demande bien plus que le précédent');
  assert.equal(levelOf(0), 0); assert.equal(levelOf(9), 0); assert.equal(levelOf(10), 1); assert.equal(levelOf(1e9), 10);
  assert.deepEqual(xpBar({ pxp: 1e9 }).p, 1);
});

test('lot 8 : 1 XP par arbre ou caillou cassé, 5 par objet fabriqué, plusieurs dizaines par quête (plus pour une principale)', () => {
  const { g, S } = makeGame({ state: { pxp: 0, sel: 'axe', energy: 100 } });
  S.objs = { '20,20': { t: 'tree', k: 'oak', g: 3, hp: 1 }, '21,20': { t: 'rock', hp: 1 } };
  S.x = 20.5; S.y = 21; hitObject(g, 20, 20); assert.equal(S.pxp, 1);
  S.sel = 'pick'; hitObject(g, 21, 20); assert.equal(S.pxp, 2);
  S.inv = { wood: 5, stone: 2 }; S.pxp = 10; assert.equal(craftHand(g, 'campfire'), true); assert.equal(S.pxp, 15);
  const Q = { a: { n: 'A', steps: [{ done: () => true }] }, b: { n: 'B', main: true, steps: [{ done: () => true }, { done: s => !!s.fin }] } };
  S.pxp = 0; S.xpQuests = {};
  assert.equal(questXpTick(g, Q), XP.quest + XP.step, 'quête secondaire résolue + une étape de la principale');
  assert.equal(questXpTick(g, Q), 0, 'une seule fois');
  S.fin = true; assert.equal(questXpTick(g, Q), XP.step + XP.questMain);
  assert.ok(XP.questMain > XP.quest && XP.quest >= 20);
  const T = { pxp: 0, fin: true }; seedQuestXp(T, Q); assert.equal(questXpTick({ S: T, bus: g.bus }, Q), 0, 'déjà fait avant le lot 8 : pas d’XP d’un coup');
});

test('lot 8 : passage de niveau annoncé ; 19/11 : forêt barrée par un gros arbre (hache en cuivre), caverne au niveau 5', () => {
  const { g, S, toasts, clock } = makeGame({ state: { pxp: 0 } });
  const ups = []; g.bus.on('levelUp', e => ups.push(e));
  gainPxp(g, LEVELS[3], 'test'); assert.deepEqual(ups.map(u => u.level), [1, 2, 3]);
  S.scene = 'farm'; S.farmLot = 0; S.sel = 'axe';
  assert.equal(act(g, 47, 5), 'locked'); assert.match(toasts().at(-1), /bûcheron niveau 3/); assert.equal(S.scene, 'farm');
  S.skills.wood = { xp: 260 }; for (let i = 0; i < 20 && S.scene === 'farm'; i++) { act(g, 47, 5); clock.t += 1000; }
  assert.equal(S.scene, 'foret', 'arbre abattu à la hache en cuivre : le chemin est ouvert');
  assert.equal(zoneOpen({ pxp: LEVELS[4] }, 'wild'), false); assert.equal(zoneOpen({ pxp: LEVELS[5] }, 'wild'), true);
  for (const id of ['campfire', 'chest', 'chaudron']) assert.equal(HAND_RECIPES[id].lvl, 1, 'recettes du début : niveau 1');
  for (const id of ['confiture_baies', 'confiture_mures']) assert.equal(POT_RECIPES[id].lvl, 1);
  const all = [...Object.values(HAND_RECIPES), ...Object.values(POT_RECIPES)];
  assert.ok(all.filter(r => r.lvl > 1).length >= all.length / 2, 'la plupart des recettes dépendent du niveau');
  const s0 = { pxp: 0, recipes: ['campfire'], inv: { wood: 9, stone: 9 } };
  assert.equal(canCraftHand(s0, 'campfire'), false, 'niveau 0 : pas encore'); s0.pxp = 10; assert.equal(canCraftHand(s0, 'campfire'), true);
  assert.equal(recipeOpen({ pxp: LEVELS[3] }, HAND_RECIPES.bague_cuivre), false);
});

test('lot 8 : nouvelle partie au niveau 0 ; anciennes parties gardent leurs accès', () => {
  assert.equal(level(defaultState()), 0);
  assert.equal(level(migrate({ name: 'x', intro: { met: true, arrived: true }, repair: { house: { wood: 80, stone: 30 } } })), 3);
  assert.equal(level(migrate({ name: 'x', intro: { met: true, arrived: true }, repair: { house: { wood: 0, stone: 0 } } })), 1);
  assert.equal(migrate({ name: 'x', pxp: 42 }).pxp, 42);
});
