import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { weekdayName, isWeekend } from '../src/systems/time.js';
import { ED } from '../src/data/npcs.js';
import { registerNPC, placeNPC } from '../src/systems/social.js';

test('19/11 : semaine du lundi au dimanche ; le week-end, Ed ne travaille pas au saloon', () => {
  const { g, S } = makeGame({ state: { day: 1, minute: 720 } });
  assert.equal(weekdayName(S), 'Lundi'); S.day = 6; assert.equal(weekdayName(S), 'Samedi'); assert.ok(isWeekend(S));
  S.day = 31; S.season = 0;
  registerNPC(g, ED); S.day = 3; placeNPC(g.npcs.ed, S, 480, 1140); assert.equal(g.npcs.ed.scene, 'bar', 'mercredi : au travail');
  S.day = 6; placeNPC(g.npcs.ed, S, 480, 1140); assert.notEqual(g.npcs.ed.scene, 'bar', 'samedi : il se promène');
});
