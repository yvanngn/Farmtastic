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
