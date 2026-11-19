import { cueillir } from './nature.js';
// Forêt : chaque jour, des champignons de la saison poussent au pied des arbres.
// Taille petite / moyenne / grosse (la grosse est rare) ; une espèce rare et chère par saison.
import { LAYOUTS, FOREST_CHEST, syncForest } from '../world/scenes.js';
import { key } from '../world/map.js';
import { MUSHROOMS, ITEMS } from '../data/items.js';
import { add } from './inventory.js';
import { gainPxp, XP } from './level.js';

export const SHROOMS_PER_DAY = 8, P_RARE = 0.12, P_BIG = 0.1, P_MEDIUM = 0.3;

export function ensureShrooms(g) {
  const S = g.S, day = S.year + '-' + S.season + '-' + S.day;
  syncForest(S);   // lot 11 : labyrinthe de la saison
  if (S.foret.day === day) return S.foret.shrooms;
  const L = LAYOUTS.foret, out = {}, sp = MUSHROOMS[S.season];
  const nearTree = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => L[y + b] && L[y + b][x + a] === 'T');
  for (let tries = 0, n = 0; n < SHROOMS_PER_DAY && tries < 600; tries++) {
    const x = 1 + (g.rnd() * 28 | 0), y = 1 + (g.rnd() * 16 | 0), k = key(x, y);
    if (L[y][x] !== '.' || out[k] || !nearTree(x, y) || x > 25) continue;
    const m = g.rnd() < P_RARE ? sp[1] : sp[0], v = g.rnd(), size = v < P_BIG ? 'l' : v < P_BIG + P_MEDIUM ? 'm' : 's';
    out[k] = { sp: m.id, size }; n++;
  }
  S.foret.day = day; S.foret.shrooms = out;
  return out;
}

// Ramasser le champignon d'une case (en marchant dessus ou avec le bouton d'action).
// Le couteau (à venir) sert à cueillir les champignons.
export const KNIFE_LINE = "Je préfère ne pas les ramasser à la main… même si c'est sûrement une idée reçue. Il me faudrait un couteau.";
export function pickShroom(g, x, y) {
  const S = g.S, k = key(x, y), m = S.foret && S.foret.shrooms[k];
  if (!m) return null;
  const c = cueillir(g, x, y, `🍄 ${KNIFE_LINE}`); if (c !== true) return c;   // couteau + jauge (lot 5)
  delete S.foret.shrooms[k];
  gainPxp(g, XP.small, 'shroom');   // lot 8 : champignon cueilli
  const id = `${m.sp}_${m.size}`;
  add(g, id, 1);
  g.bus.emit('sfx', 'collect');
  g.bus.emit('pop', { t: '+🍄', x, y });
  if (m.size === 'l') g.bus.emit('toast', 'Un gros champignon ! 🍄');
  return id;
}

// Arbres de la forêt : on peut les couper (hache) comme à la ferme ; ils repoussent en TREE_GROW_DAYS jours.
// Les arbres du bord restent (ils ferment la carte). État : S.foret.cut = { 'x,y': jourCoupé }, S.foret.hits = { 'x,y': coups }.
import { TREE_GROW_DAYS, STUMP_DAYS, STUMP_WOOD } from '../data/forest.js';
import { TREE_HP } from '../world/map.js';
import { scatter } from './inventory.js';
import { useEnergy } from './player.js';
import { toolTier, hasTool } from './skills.js';
import { energyCost, hitReady } from '../data/tools.js';
const dayN = S => (S.year - 1) * 112 + S.season * 28 + S.day;
const W = () => LAYOUTS.foret[0].length, H = () => LAYOUTS.foret.length;
export const isForestTree = (x, y) => x > 0 && y > 0 && x < W() - 1 && y < H() - 1 && LAYOUTS.foret[y][x] === 'T';
const seasonN = S => (S.year - 1) * 4 + S.season;
// 19/11 : coupé = souche pendant 4 jours (puis l'arbre repousse) ; souche coupée = rien jusqu'à la saison suivante.
export const forestGone = (S, x, y) => { const v = S.foret && S.foret.gone && S.foret.gone[key(x, y)]; return v != null && v === seasonN(S); };
export const forestStump = (S, x, y) => { const d = S.foret && S.foret.cut && S.foret.cut[key(x, y)]; return d != null && dayN(S) - d < STUMP_DAYS && !forestGone(S, x, y); };
export const forestCut = (S, x, y) => forestStump(S, x, y) || forestGone(S, x, y);
export function chopStump(g, x, y) {
  const S = g.S; if (S.scene !== 'foret' || !isForestTree(x, y) || !forestStump(S, x, y)) return false;
  if (S.sel !== 'axe') { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', 'Il faut la hache 🪓 pour arracher la souche.'); return false; }
  if (!hitReady(g)) return 'wait';
  if (!useEnergy(g, energyCost(toolTier(S, 'axe')))) return false;
  (S.foret.gone ||= {})[key(x, y)] = seasonN(S);
  const n = STUMP_WOOD[0] + (g.rnd() * (STUMP_WOOD[1] - STUMP_WOOD[0] + 1) | 0); scatter(g, 'wood', n, x, y);
  g.bus.emit('swing', 'axe'); g.bus.emit('sfx', 'break'); g.bus.emit('pop', { t: '+' + n + '🪵', x, y });
  return true;
}
export const forestTreeAt = (S, x, y) => S.scene === 'foret' && isForestTree(x, y) && !forestCut(S, x, y);
export function chopForest(g, x, y) {
  const S = g.S, k = key(x, y);
  if (!forestTreeAt(S, x, y)) return false;
  if (S.sel !== 'axe') { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', hasTool(S, 'axe') ? 'Il faut la hache 🪓 : ouvre la roue des outils 🛠️' : 'Il me faudrait une hache pour couper ces arbres.'); return false; }
  const tier = toolTier(S, 'axe');
  if (!hitReady(g)) return 'wait';   // le geste précédent n'est pas fini
  if (!useEnergy(g, energyCost(tier))) return false;
  S.foret ||= { day: null, shrooms: {} }; const hits = (S.foret.hits ||= {}), cut = (S.foret.cut ||= {});
  hits[k] = (hits[k] || 0) + tier;
  g.bus.emit('swing', 'axe'); g.bus.emit('objHit', { x, y, t: 'tree', broken: hits[k] >= TREE_HP });
  if (hits[k] < TREE_HP) { g.bus.emit('sfx', 'chop'); return true; }
  delete hits[k]; cut[k] = dayN(S);
  gainPxp(g, XP.small, 'tree');   // lot 8
  g.bus.emit('sfx', 'break');
  const n = 3 + (g.rnd() * 3 | 0); scatter(g, 'wood', n, x, y);
  g.bus.emit('pop', { t: '+' + n + '🪵', x, y });
  return true;
}

// Lot 8 : le coffre au bout du labyrinthe. Contenu (demande de l'utilisateur) : de l'or et des composants simples au hasard.
// Il se remplit de nouveau à chaque saison (💡).
export const CHEST_GOLD = [80, 160], CHEST_PARTS = ['wood', 'stone', 'berry', 'mure', 'copper_ore'], CHEST_PICKS = 3;   // 💡 quantités
const seasonId = S => S.year + '-' + S.season;
export const forestChestFull = S => !(S.foret && S.foret.chest === seasonId(S));
export const isForestChest = (x, y) => x === FOREST_CHEST.x && y === FOREST_CHEST.y;
export function openForestChest(g) {
  const S = g.S;
  if (!forestChestFull(S)) { g.bus.emit('toast', '📦 Le coffre est vide. Il sera peut-être de nouveau rempli à la prochaine saison…'); return false; }
  S.foret ||= { day: null, shrooms: {} }; S.foret.chest = seasonId(S);
  const gold = CHEST_GOLD[0] + (g.rnd() * (CHEST_GOLD[1] - CHEST_GOLD[0] + 1) | 0), got = {};
  S.money += gold;
  for (let i = 0; i < CHEST_PICKS; i++) { const id = CHEST_PARTS[g.rnd() * CHEST_PARTS.length | 0], n = 2 + (g.rnd() * 4 | 0); add(g, id, n); got[id] = (got[id] || 0) + n; }
  g.bus.emit('sfx', 'collect'); g.bus.emit('pop', { t: '+' + gold + '$', x: FOREST_CHEST.x, y: FOREST_CHEST.y });
  g.bus.emit('toast', `📦 Le coffre au bout du labyrinthe ! +${gold} $ et ${Object.entries(got).map(([id, n]) => n + ' ' + ((ITEMS[id] && ITEMS[id].n) || id)).join(', ')}`);
  g.bus.emit('chestOpened', { gold, got });
  return { gold, got };
}
