import { CFG } from '../config.js';

export const SPAWN = { x: 5.5, y: 6.8 };
export const inRect = (x, y, x0, y0, x1, y1) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
export const isHouse = (x, y) => inRect(x, y, 2, 1, 6, 4);
export const isBin = (x, y) => x === 8 && y === 4;
export const isPlot = (x, y) => inRect(x, y, 4, 8, 13, 13);
export const isPen = (x, y) => inRect(x, y, 19, 7, 25, 12);
export const PEN_BOUNDS = { x0: 19.5, y0: 8.5, w: 6, h: 4 };
export const ROAM_BOUNDS = { x0: 3, y0: 5.6, w: 12, h: 1.6 };
export const isCoop = (x, y) => inRect(x, y, 23, 6, 25, 7);
export const isGate = (x, y) => x === 16 && y === 35; // portail vers le village
export const isFence = (x, y) => inRect(x, y, 18, 6, 26, 13) && !isPen(x, y) && !(x === 18 && y === 9);
export const isPond = (x, y) => ((x - 12) ** 2) / 25 + ((y - 24) ** 2) / 9 < 1;
export const isPath = (x, y) => (y === 5 && x >= 2 && x <= 33) || (x === 16 && y >= 5 && y <= 35) || (y === 9 && x === 17);
export const isForest = (x) => x >= 34;
export const key = (x, y) => x + ',' + y;

export function ground(x, y) {
  return isPond(x, y) ? 'water' : isPlot(x, y) ? 'soil' : isPath(x, y) ? 'path' : 'grass';
}

import { tileAt, SOLID_TILES } from './scenes.js';

export function isSolid(S, x, y) {
  if (S.scene && S.scene !== 'farm') return SOLID_TILES.includes(tileAt(S.scene, x, y));
  if (x < 0 || y < 0 || x >= CFG.W || y >= CFG.H) return true;
  return isPond(x, y) || isHouse(x, y) || isCoop(x, y) || isGate(x, y) || isFence(x, y) || isBin(x, y) || !!(S.objs && S.objs[key(x, y)]);
}

// Générateur pseudo-aléatoire déterministe (même carte pour une même graine).
export function rng(seed) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

export function freeForObj(x, y) {
  return !isHouse(x, y) && !isPlot(x, y) && !isPond(x, y) && !isPath(x, y) && !inRect(x, y, 17, 5, 27, 14)
    && !isBin(x, y) && !inRect(x, y, 4, 5, 9, 7) && x > 0 && y > 0 && x < CFG.W - 1 && y < CFG.H - 1;
}

const KINDS = ['oak', 'pine', 'birch'];
export const newTree = (kind, grow = 3) => ({ t: 'tree', k: kind, g: grow, hp: 3 });
export const newRock = big => (big ? { t: 'rock_big', hp: 3 } : { t: 'rock', hp: 2 });

// Carte de départ : le bois de l'est est bien garni (sans dépasser ses limites), un peu de fouillis sur la ferme.
export function genObjects(seed = 12345) {
  const r = rng(seed), o = {};
  for (let y = 0; y < CFG.H; y++) for (let x = 0; x < CFG.W; x++) {
    if (!freeForObj(x, y)) continue;
    const v = r(), kind = KINDS[r() * 3 | 0];
    if (isForest(x)) {
      if (v < 0.14) o[key(x, y)] = newTree(kind);
      else if (v < 0.18) o[key(x, y)] = newRock(false);
      else if (v < 0.21) o[key(x, y)] = newRock(true);
      else if (v < 0.23) o[key(x, y)] = { t: 'boulder', hp: 6 };
    }
    else if (v < 0.04) o[key(x, y)] = newTree(kind);
    else if (v < 0.08) o[key(x, y)] = newRock(v > 0.07);
  }
  return o;
}
