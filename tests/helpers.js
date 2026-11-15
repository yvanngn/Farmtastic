// Outils communs : partie déterministe, horloge contrôlable, capture des événements.
import { createGame } from '../src/core/game.js';
import { defaultState } from '../src/core/state.js';

export function seq(...vals) { let i = 0; return () => vals[i++ % vals.length]; }

export function makeGame({ state = {}, rnd = seq(0.5), time = 1_000_000 } = {}) {
  const clock = { t: time };
  // Par défaut, une ferme déjà équipée (tous les bâtiments + une poule) ; les tests du lot 4 partent de defaultState().
  const equipped = { built: { coop: true, pigsty: true, barn: true }, animals: [{ id: 'a1', type: 'chicken', x: 21.5, y: 9.5, fed: false, petted: false, love: 20, produced: false }] };
  const S = Object.assign(defaultState(), { objs: {} }, equipped, state);
  const g = createGame({ state: S, rnd, now: () => clock.t });
  const events = [];
  for (const e of ['toast', 'pop', 'inv', 'newDay', 'sfx']) g.bus.on(e, d => events.push([e, d]));
  return { g, S, clock, events, toasts: () => events.filter(e => e[0] === 'toast').map(e => e[1]),
    sounds: () => events.filter(e => e[0] === 'sfx').map(e => e[1]) };
}
