// 20/11 (demande de l'utilisateur) : on vérifie qu'une nouvelle partie est jouable de bout en bout :
// intro complète (train, quai, diligence par la route, place), puis on marche et on agit sur sa ferme.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/core/game.js';
import { defaultState } from '../src/core/state.js';
import { introTick, introActive } from '../src/systems/intro.js';
import { updatePlayer } from '../src/systems/movement.js';
import { act } from '../src/systems/actions.js';

test('20/11 : nouvelle partie jouable — l’intro se termine et on peut marcher et agir', () => {
  let t = 0; const g = createGame({ state: defaultState(), rnd: () => .5, now: () => t });
  g.bus.on('say', d => { setTimeout0.push(d); });
  const setTimeout0 = [];
  let guard = 0;
  while (introActive(g.S) && guard++ < 20000) {
    introTick(g, .1); t += 100;
    while (setTimeout0.length) { const d = setTimeout0.shift(); d.onEnd && d.onEnd(); }   // on « touche l'écran » à chaque bulle
  }
  assert.equal(introActive(g.S), false, 'l’intro se termine');
  assert.equal(g.S.scene, 'farm'); assert.equal(g.introWait, false); assert.ok(!g.ride);
  g.player ||= {}; const x0 = g.S.x, y0 = g.S.y;
  for (let i = 0; i < 20; i++) { updatePlayer(g, .05, { up: true }); t += 50; }
  assert.ok(Math.hypot(g.S.x - x0, g.S.y - y0) > .5, 'le héros avance');
  assert.notEqual(act(g, Math.floor(g.S.x), Math.floor(g.S.y) - 1), undefined, 'une action répond');
});
