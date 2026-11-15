import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { useEnergy } from '../src/systems/player.js';
import { newDay, sleep } from '../src/systems/time.js';
import { act } from '../src/systems/actions.js';
import { deployTent, nightTip } from '../src/systems/camp.js';
import { questProgress } from '../src/systems/quests.js';
import { registerNPC, placeNPC } from '../src/systems/social.js';
import { HAILEY, OUT_FROM, OUT_TO } from '../src/data/npcs.js';
import { SCENES, LAYOUTS } from '../src/world/scenes.js';

const fresh = st => makeGame({ state: { repair: { house: { wood: 0, stone: 0 }, grange: { wood: 0, stone: 0 } }, intro: { met: true, myst: false, arrived: true }, bed: false, tent: null, inv: { tent: 1 }, tools: {}, ...st } });

test('énergie à 0 : réveil à la clinique, 10 % de frais', () => {
  const { g, S } = makeGame({ state: { energy: 3, money: 1000, scene: 'farm' } });
  const said = []; g.bus.on('clinic', d => said.push(d));
  assert.equal(useEnergy(g, 3), true);
  assert.equal(S.scene, 'clinique'); assert.equal(S.money, 900); assert.ok(S.energy > 0);
  assert.equal(said[0].fee, 100);
});

test('ne pas dormir : aucune énergie récupérée le lendemain (et pas d’amende)', () => {
  const { g, S } = makeGame({ state: { energy: 40, money: 1000 } });
  newDay(g, false);
  assert.equal(S.energy, 40); assert.equal(S.money, 1000);
});

test('quête « Premiers pas » : déployer la tente depuis le sac, puis dormir, outils, feu, cabane', () => {
  const { g, S } = fresh({ x: 5.5, y: 7.2 });
  assert.equal(questProgress(S, 'debut').cur, 0);
  assert.equal(deployTent(g), true); assert.ok(S.tent);
  assert.equal(questProgress(S, 'debut').cur, 1);
  S.minute = 1000; assert.equal(nightTip(g), false, 'pas avant 18h');
  S.minute = 1080; const said = []; g.bus.on('say', d => said.push(d));
  assert.equal(nightTip(g), true); assert.ok(said[0].lines.some(l => /clinique/.test(l))); assert.equal(nightTip(g), false, 'une seule fois');
  act(g, S.tent.x, S.tent.y); said.at(-1).onChoose(0);
  assert.equal(questProgress(S, 'debut').cur, 2);
  S.tools = { pick: 1, axe: 1 }; assert.equal(questProgress(S, 'debut').cur, 3);
  S.fires = [{ x: 9, y: 9 }]; assert.equal(questProgress(S, 'debut').cur, 4);
});

test('déployer la tente loin de la cabane : refusé avec une explication', () => {
  const { g, S } = fresh({ x: 30, y: 20 });
  assert.equal(deployTent(g), false); assert.equal(S.tent, null);
});

test('Hailey travaille à la clinique du quartier de 7h à 23h', () => {
  const { g, S } = makeGame({ state: { minute: 600 } });
  registerNPC(g, HAILEY); const n = g.npcs.hailey;
  placeNPC(n, S, OUT_FROM, OUT_TO); assert.equal(n.scene, 'clinique');
  S.minute = 1400; placeNPC(n, S, OUT_FROM, OUT_TO); assert.equal(n.scene, 'none');
  assert.ok(SCENES.quartier.doors.some(d => d.to === 'clinique'));
  assert.equal(LAYOUTS.quartier[5].slice(18, 22), 'XXXX');
  assert.ok(HAILEY.story.some(s => /burn-out/.test(s.t)), 'son histoire va jusqu’au burn-out');
});
