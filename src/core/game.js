import { createBus } from './events.js';
import { defaultState } from './state.js';
import { genObjects } from '../world/map.js';

// Contexte de jeu passé à tous les systèmes.
// rnd et now sont injectables pour rendre les tests déterministes.
export function createGame({ state = defaultState(), rnd = Math.random, now = Date.now } = {}) {
  if (!state.objs) state.objs = genObjects();
  return {
    S: state,                 // état sauvegardé
    bus: createBus(),
    rnd, now,
    enemies: [],              // éphémère (non sauvegardé)
    others: {},               // autres joueurs
    npcs: {},                 // registre PNJ
    fx: [],                   // textes flottants
    player: { target: null, walkFrame: 0, walkT: 0 },
    timeAcc: 0
  };
}
