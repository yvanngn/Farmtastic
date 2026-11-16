import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { ghostTick, ghostVisible, ghostQ } from '../src/systems/ghost.js';
import { questProgress } from '../src/systems/quests.js';
import { GHOST } from '../src/data/npcs.js';

test('Ghostbuster : hululement, « hoooou », puis l’esprit la 3e nuit, qui disparaît quand on approche', () => {
  const { g, S } = makeGame({ state: { scene: 'farm', day: 1, minute: 1000, x: 5.5, y: 5.5 } });
  assert.equal(ghostTick(g), null, 'pas avant la nuit');
  S.minute = GHOST.from; assert.equal(ghostTick(g), 'n1'); assert.equal(ghostTick(g), null, 'une fois par nuit');
  S.day = 2; assert.equal(ghostTick(g), 'n2');
  S.day = 3; assert.equal(ghostTick(g), 'n3'); assert.ok(ghostVisible(S));
  S.x = GHOST.x + 5.5; S.y = GHOST.y + .5; assert.equal(ghostTick(g), 'seen');
  S.x = GHOST.x + 1.5; assert.equal(ghostTick(g), 'vanish'); assert.ok(!ghostVisible(S));
  assert.equal(questProgress(S, 'ghost').cur, 4, 'reste : lui parler (plus tard)');
  assert.ok(ghostQ(S).vanish);
});
