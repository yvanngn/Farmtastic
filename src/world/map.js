import { CFG } from '../config.js';

export const SPAWN = { x: 5.5, y: 6.8 };
export const inRect = (x, y, x0, y0, x1, y1) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
export const isHouse = (x, y) => inRect(x, y, 2, 1, 6, 4);
export const isBin = () => false;   // 19/11 : plus de bac de vente (l'étal du centre-ville le remplace)
export const isPlot = (x, y) => inRect(x, y, 4, 8, 13, 13);
export const isPen = (x, y) => inRect(x, y, 19, 7, 32, 12);
export const PEN_BOUNDS = { x0: 19.5, y0: 8.5, w: 13, h: 4 };
export const ROAM_BOUNDS = { x0: 3, y0: 5.6, w: 12, h: 1.6 };
import { BUILDINGS, BUILD_Y0, BUILD_Y1, FARM_LINKS } from '../data/buildings.js';
export { FARM_LINKS };
// Bâtiment construit sur cette case (null sinon). built = S.built.
export function buildingAt(built, x, y) {
  if (!built || y < BUILD_Y0 || y > BUILD_Y1) return null;
  for (const id in BUILDINGS) if (built[id] && x >= BUILDINGS[id].x0 && x <= BUILDINGS[id].x1) return id;
  return null;
}
export const isCoop = (x, y, built = { coop: true }) => buildingAt(built, x, y) === 'coop';
// Maison de Luna, au bord du chemin, près du portail (porte en 20,31).
export const isLunaHouse = () => false;   // Luna et Franck habitent maintenant le quartier (scène « quartier »)
export const isLunaLot = () => false;
// Maison de Franck, juste à côté (porte en 27,31).
export const isFranckHouse = () => false;
// Grange de la maison (x10-13, y1-4), porte en 12,4 : l'entrée des tunnels.
export const isGrange = (x, y) => inRect(x, y, 10, 1, 13, 4);
export const isGate = (x, y) => x === 16 && y === 35; // portail vers le village
export const isFence = (x, y, built) => inRect(x, y, 18, 6, 33, 13) && !isPen(x, y) && !(x === 18 && y === 9) && !buildingAt(built, x, y);
export const isPond = (x, y) => ((x - 12) ** 2) / 25 + ((y - 24) ** 2) / 9 < 1;
export const isPath = (x, y) => (y === 5 && x >= 2 && x <= 47) || (y === 20 && x >= 3 && x <= 15) || (x === 42 && y === 4) || (x === 16 && y >= 0 && y <= 35) || (y === 9 && x === 17)
  || (y >= 33 && x >= 15 && x <= 17) || (y === 18 && x >= 1 && x <= 46) || (x >= 45 && y >= 17 && y <= 19) || (x <= 2 && y >= 17 && y <= 19);   // 20/11 : sorties est (forêt) et ouest (ferme de l'Ouest) au milieu
export const isForest = (x) => x >= 34;
// Haies sur les bords de la ferme qui ne mènent nulle part (bas et droite), pour voir où sont les sorties.
// 19/11 : les 4 fermes (2 × 2). La ferme du joueur s'ouvre vers ses voisines : à l'est (colonne de gauche) ou à l'ouest
// (colonne de droite), au sud (rangée du haut) ou au nord (rangée du bas), par un portail en x 30-31.
export let FARM_LOT = 0;
export const setFarmLot = l => { FARM_LOT = (l | 0) % 4; };
export const farmLotNow = () => FARM_LOT;
export const lotCR = l => ({ c: l % 2, r: l >> 1 });
// 19/11 : sorties de chaque ferme (N, S, E, O) : n° de ferme voisine ou zone ; absent = fermé (haie, barrière, falaise)
const linkOf = dir => (FARM_LINKS[FARM_LOT] || {})[dir] != null;
export const FARM_MID = [17, 19];   // 20/11 : rangées des sorties est / ouest (au milieu)
export const isFarmGap = (x, y) => linkOf('W') && x === 0 && y >= FARM_MID[0] && y <= FARM_MID[1];
const closedEdge = (x, y) => (!linkOf('S') && y === 35 && x >= 15 && x <= 17) || (!linkOf('E') && x === 47 && y >= FARM_MID[0] && y <= FARM_MID[1]);
export const isHedge0 = (x, y) => (y === 35 && (x < 15 || x > 17)) || (x === 47 && y < 35 && (y < 17 || y > 19));
// Bord nord de la ferme : une barrière en bois ; bord ouest (au-dessus de la gare) : une falaise rocheuse.
export const isHedge = (x, y) => (isHedge0(x, y) && !isFarmGap(x, y)) || closedEdge(x, y);
export const isFarmFence = (x, y) => y === 0 && x > 0 && x < 47 && (x !== 16 || !linkOf('N'));   // 19/11 : passage vers la carrière
export const isCliff = (x, y) => x === 0 && !isFarmGap(x, y);   // lot 8 : plus de gare dans la ferme, la falaise court sur tout le bord ouest
// Lot 8 : plus de gare dans la ferme (la gare est une zone à part, à l'ouest du centre-ville).
export const isStation = () => false;
export const isPlatform = () => false;
// Maison de Myst (au nord-est, un peu à l'écart) : x40-45, y1-3, porche y4.
export const isMystHouse = () => false;   // Myst habite maintenant au fond du quartier (scène « quartier »)
const AXE_SPOT = (x, y) => inRect(x, y, 5, 30, 7, 32);
export const key = (x, y) => x + ',' + y;

export function ground(x, y) {
  return isPond(x, y) ? 'water' : isPlot(x, y) ? 'soil' : isPath(x, y) ? 'path' : 'grass';
}

import { quarryMouthOpen } from './quarrymouth.js';
import { tileAt, SOLID_TILES, FOREST_CHEST, syncForest } from './scenes.js';
import { AXE_GROVE, BIG_TREE } from '../data/repairs.js';
import { BUSHES } from '../data/recipes.js';
import { TREE_GROW_DAYS, FOREST } from '../data/forest.js';
const BUSH_SET = new Set(BUSHES.map(([x, y]) => x + ',' + y));

export function isSolid(S, x, y) {
  if ((S.scene || 'farm') === 'farm' && (isHedge(x, y) || isFarmFence(x, y) || isCliff(x, y))) return true;
  const N = S.nature && S.nature[S.scene || 'farm'];
  if (N && N.rocks && N.rocks[x + ',' + y]) return true;   // cailloux et filons
  if (S.tent && (S.scene || 'farm') === 'farm' && S.tent.x === x && S.tent.y === y) return true;   // tente
  if ((S.scene || 'farm') === 'farm' && (BUSH_SET.has(x + ',' + y) || (S.fires || []).some(f => f.x === x && f.y === y) || (S.chests || []).some(c => c.x === x && c.y === y))) return true;   // buissons, feux, coffres
  if (S.scene === 'wild' && S.wild && S.wild.rocks && S.wild.rocks[x + ',' + y]) return true;
  if (S.scene === 'foret') syncForest(S);   // lot 11 : labyrinthe de la saison
  if (S.scene === 'foret' && x === FOREST_CHEST.x && y === FOREST_CHEST.y) return true;   // lot 8 : le coffre du labyrinthe
  if (S.scene === 'foret' && S.foret && S.foret.shrooms && S.foret.shrooms[x + ',' + y]) return false;
  if (S.scene === 'foret' && S.foret && ((S.foret.cut && S.foret.cut[x + ',' + y] != null && (S.year - 1) * 120 + S.season * 30 + S.day - S.foret.cut[x + ',' + y] < 4) || (S.foret.gone && S.foret.gone[x + ',' + y] === (S.year - 1) * 4 + S.season))) return false;   // arbre coupé : souche 4 jours, ou souche arrachée jusqu'à la saison suivante (19/11)
  if (S.scene && S.scene !== 'farm') { const t = tileAt(S.scene, x, y); if (t === '%') return !quarryMouthOpen(S, x, y);   // 19/11 : bouche de tunnel ouverte ce jour-là
    if (S.scene === 'grange' && (t === 'p' || t === 'r') && S.grange && S.grange.broken.includes(x + ',' + y)) return false; return SOLID_TILES.includes(t); }
  if (x < 0 || y < 0 || x >= CFG.W || y >= CFG.H) return true;
  return isPond(x, y) || isHouse(x, y) || isGrange(x, y) || isCliff(x, y) || isMystHouse(x, y) || isFranckHouse(x, y) || isLunaHouse(x, y) || !!buildingAt(S.built, x, y) || isGate(x, y) || isFence(x, y, S.built) || isBin(x, y) || !!(S.objs && S.objs[key(x, y)]);
}

// Générateur pseudo-aléatoire déterministe (même carte pour une même graine).
export function rng(seed) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

export function freeForObj(x, y) {
  return !isHouse(x, y) && !isPlot(x, y) && !isPond(x, y) && !isPath(x, y) && !inRect(x, y, 17, 5, 33, 14)
    && !isBin(x, y) && !isLunaLot(x, y) && !inRect(x, y, 9, 0, 14, 5) && !inRect(x, y, 44, 16, 47, 20) && !inRect(x, y, 4, 5, 9, 7) && !inRect(x, y, 39, 0, 47, 6) && !AXE_SPOT(x, y) && !BUSH_SET.has(x + ',' + y) && x > 0 && y > 0 && x < CFG.W - 1 && y < CFG.H - 1;
}

const KINDS = ['oak', 'pine', 'birch'];
export const TREE_HP = 8, ROCK_HPS = { rock: 6, rock_big: 9, boulder: 14 };   // plus long à casser : un meilleur outil va plus vite (dégâts = palier)   // coups (pioche/hache de base) 💡
export const newTree = (kind, grow = 3) => ({ t: 'tree', k: kind, g: grow, hp: TREE_HP });
export const newRock = big => (big ? { t: 'rock_big', hp: ROCK_HPS.rock_big } : { t: 'rock', hp: ROCK_HPS.rock });

// Carte de départ : le bois de l'est est bien garni (sans dépasser ses limites), un peu de fouillis sur la ferme.
export function genObjects(seed = 12345) {
  const r = rng(seed), o = {};
  let trees = 0, rocks = 0; // limites du bois (cf. FOREST dans data/forest.js) ; lot 8 : bien plus garni partout
  for (let y = 0; y < CFG.H; y++) for (let x = 0; x < CFG.W; x++) {
    if (!freeForObj(x, y)) continue;
    const v = r(), kind = KINDS[r() * 3 | 0];
    if (isForest(x)) {
      if (v < 0.30) { if (trees++ < FOREST.MAX_TREES) o[key(x, y)] = newTree(kind); }
      // 19/11 : plus de cailloux ni de gros rochers à la ferme : tout est à la carrière, au nord
    }
    else if (v < 0.10) o[key(x, y)] = newTree(kind);
  }
  for (const [x, y] of AXE_GROVE) o[key(x, y)] = newTree(KINDS[(x + y) % 3]);   // petit bois du sud
  for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1], [-1, 1], [-1, 0], [1, 2], [0, 2], [-1, 2]]) delete o[key(BIG_TREE.x + dx, BIG_TREE.y + dy)];
  o[key(BIG_TREE.x, BIG_TREE.y)] = { t: 'bigtree' };   // le grand arbre (incassable) ; la hache est posée à son pied
  return o;
}
