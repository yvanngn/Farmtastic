import { CFG } from '../src/config.js';
CFG.ACCES_TEST = false; // les tests décrivent le jeu normal (le mode test est vérifié à part)
// Outils communs : partie déterministe, horloge contrôlable, capture des événements.
import { createGame } from '../src/core/game.js';
import { defaultState } from '../src/core/state.js';

export function seq(...vals) { let i = 0; return () => vals[i++ % vals.length]; }

export function makeGame({ state = {}, rnd = seq(0.5), time = 1_000_000 } = {}) {
  const clock = { t: time };
  // Par défaut, une ferme déjà équipée (tous les bâtiments + une poule) ; les tests du lot 4 partent de defaultState().
  const equipped = { workbench: true, tilled: Object.fromEntries(Array.from({ length: 60 }, (_, i) => [(4 + i % 10) + ',' + (8 + (i / 10 | 0)), 1])), tools: { axe: 1, pick: 1, sickle: 1, shovel: 1, sword: 1 }, intro: { met: true }, caravan: { tokens: 0, unlocked: ['carrot_seed', 'corn_seed', 'rabbit', 'pig', 'sheep', 'forge_or'] }, built: { coop: true, pigsty: true, barn: true }, animals: [{ id: 'a1', type: 'chicken', x: 21.5, y: 9.5, fed: false, petted: false, love: 20, produced: false }] };
  const S = Object.assign(defaultState(), { objs: {} }, equipped, state);
  const g = createGame({ state: S, rnd, now: () => clock.t });
  const events = [];
  for (const e of ['toast', 'pop', 'inv', 'newDay', 'sfx']) g.bus.on(e, d => events.push([e, d]));
  return { g, S, clock, events, toasts: () => events.filter(e => e[0] === 'toast').map(e => e[1]),
    sounds: () => events.filter(e => e[0] === 'sfx').map(e => e[1]) };
}
