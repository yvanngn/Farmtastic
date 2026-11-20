import { AXE_GROVE } from '../data/repairs.js';
// Bois et pierre. La puissance de l'outil (palier) retire autant de PV par coup
// et réduit l'énergie dépensée. Casser des pierres donne de l'XP de minage.
import { CFG } from '../config.js';
import { freeForObj, key, isForest, newTree, newRock, genObjects, isSolid , clearAxeAccess } from '../world/map.js';
import { TREE_KINDS, TREE_KIND_IDS, TREE_GROW_DAYS, ROCK_DAYS, STONE_YIELD, FOREST, STUMP_DAYS, STUMP_HP, STUMP_WOOD } from '../data/forest.js';
import { MIN_PICK, MINING_GAIN, TIER_NAMES, energyCost, hitReady, NEED, WOOD_GAIN } from '../data/tools.js';
import { add, scatter } from './inventory.js';
import { useEnergy } from './player.js';
import { gainXp, toolTier, hasTool, lacks } from './skills.js';
import { gainPxp, XP } from './level.js';

export const TOOL_FOR = { stump: 'axe', tree: 'axe', rock: 'pick', rock_big: 'pick', boulder: 'pick' };
export const isStone = t => t === 'rock' || t === 'rock_big' || t === 'boulder';
// Anciennes sauvegardes : arbre sans essence ni âge = adulte, essence tirée de la position.
export const treeKind = (o, x, y) => o.k || TREE_KIND_IDS[(x * 7 + y * 3) % 3];
export const isGrown = o => o.t !== 'tree' || (o.g ?? TREE_GROW_DAYS) >= TREE_GROW_DAYS;

export function hitObject(g, x, y) {
  const S = g.S, k = key(x, y), o = S.objs[k];
  if (!o) return false;
  if (o.t === 'bigtree') { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', 'Ce vieil arbre est bien trop grand pour être abattu. Il veille sur la ferme depuis toujours.'); return false; }
  const tool = TOOL_FOR[o.t];
  if (S.sel !== tool) {
    g.bus.emit('sfx', 'denied');
    const has = hasTool(S, tool), name = tool === 'axe' ? 'la hache 🪓' : 'la pioche ⛏️';
    g.bus.emit('toast', has ? `Il faut ${name} : ouvre la roue des outils 🛠️` : tool === 'axe' ? 'Il me faudrait un outil pour couper les arbres… Myst a parlé d’en avoir vu un dans les environs.' : 'Il te faut la pioche ⛏️… regarde du côté de la grange.');
    return false;
  }
  if (!isGrown(o)) {
    const left = TREE_GROW_DAYS - (o.g || 0);
    g.bus.emit('sfx', 'denied'); g.bus.emit('toast', `Ce jeune ${TREE_KINDS[treeKind(o, x, y)].n.toLowerCase()} pousse encore (${left} j) 🌱`); return false;
  }
  const tier = 1, weak = lacks(S, NEED[o.t]);
  if (weak) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', weak); return false; }   // 20/11 : la compétence, plus le palier
  if (!hitReady(g)) return 'wait';   // le geste précédent n'est pas fini
  if (!useEnergy(g, energyCost(tier))) return false;
  o.hp -= tier; o.shake = 0.25;
  g.bus.emit('swing', tool);
  g.bus.emit('objHit', { x, y, t: o.t, k: o.k, broken: o.hp <= 0 });
  g.bus.emit('sfx', o.hp <= 0 ? 'break' : o.t === 'tree' ? 'chop' : 'pick');
  if (isStone(o.t)) gainXp(g, 'mining', MINING_GAIN.hit); else gainXp(g, 'wood', WOOD_GAIN.hit);   // 20/11 : XP de bûcheron
  if (o.hp <= 0) {
    delete S.objs[k];
    if (o.t === 'stump') { const n = STUMP_WOOD[0] + (g.rnd() * (STUMP_WOOD[1] - STUMP_WOOD[0] + 1) | 0); scatter(g, 'wood', n, x, y); g.bus.emit('pop', { t: '+' + n + '🪵', x, y }); return true; }   // 19/11 : la souche
    if (o.t === 'tree') S.objs[k] = { t: 'stump', k: treeKind(o, x, y), d: 0, hp: STUMP_HP };   // 19/11 : l'arbre laisse sa souche
    gainPxp(g, o.t === 'boulder' ? 2 * XP.small : XP.small, o.t);
    if (!isStone(o.t)) gainXp(g, 'wood', o.t === 'stump' ? WOOD_GAIN.stump : WOOD_GAIN.tree);   // 20/11 : bûcheron   // lot 8 : 1 XP par petit objet cassé (💡 2 pour un gros rocher)
    if (o.t === 'tree') {
      const [a, b] = TREE_KINDS[treeKind(o, x, y)].wood, n = a + (g.rnd() * (b - a + 1) | 0); scatter(g, 'wood', n, x, y);
      g.bus.emit('pop', { t: '+' + n + '🪵', x, y });
      if (g.rnd() < 0.3) scatter(g, 'wheat_seed', 2, x, y);
    } else {
      const n = o.t === 'boulder' ? 8 + (g.rnd() * 5 | 0) : STONE_YIELD[o.t];
      scatter(g, 'stone', n, x, y);
      gainXp(g, 'mining', MINING_GAIN[o.t]);
      g.bus.emit('pop', { t: '+' + n + '🪨', x, y });
    }
  }
  return true;
}

// Chaque nuit, dans le bois de l'est uniquement :
// - les jeunes arbres grandissent d'un cran (adultes au bout de 3 jours) ;
// - de nouvelles pousses apparaissent au hasard tant que le bois n'est pas plein ;
// - les pierres prévues il y a 3 jours sortent de terre, et de nouvelles sont prévues si besoin.
export function forestCount(S) {
  let trees = 0, rocks = 0;
  for (const k in S.objs) { const [x] = k.split(',').map(Number); if (!isForest(x)) continue; const t = S.objs[k].t; if (t === 'tree') trees++; else if (t === 'rock' || t === 'rock_big') rocks++; }
  return { trees, rocks };
}
function freeForestTile(g) {
  const S = g.S;
  for (let tries = 0; tries < 30; tries++) {
    const x = FOREST.x0 + (g.rnd() * (CFG.W - 1 - FOREST.x0) | 0), y = 1 + (g.rnd() * (CFG.H - 2) | 0), k = key(x, y);
    if (freeForObj(x, y) && !S.objs[k] && Math.hypot(x - S.x, y - S.y) > 2 && !(S.rockQueue || []).some(q => q.k === k)) return k;
  }
  return null;
}
export function regrow(g) {
  const S = g.S;
  S.rockQueue = S.rockQueue || [];
  for (const k in S.objs) { const o = S.objs[k]; if (o.t === 'tree' && (o.g ?? TREE_GROW_DAYS) < TREE_GROW_DAYS) o.g = (o.g || 0) + 1; }
  for (const k in S.objs) { const o = S.objs[k]; if (o.t === 'stump' && ++o.d >= STUMP_DAYS) S.objs[k] = newTree(o.k, 0); }   // 19/11 : la souche laissée repousse (jeune pousse)
  // pierres qui sortent de terre (si la case est restée libre)
  S.rockQueue = S.rockQueue.filter(q => {
    if (--q.d > 0) return true;
    if (!S.objs[q.k]) S.objs[q.k] = newRock(q.big);
    return false;
  });
  const c = forestCount(S);
  for (let i = 0; i < FOREST.TREES_PER_DAY && c.trees < FOREST.MAX_TREES; i++) {
    const k = freeForestTile(g); if (!k) break;
    S.objs[k] = newTree(TREE_KIND_IDS[g.rnd() * 3 | 0], 0); c.trees++;
  }
  // 19/11 : plus de cailloux qui repoussent à la ferme (la carrière, au nord, s'en charge)
}

// Lot 8 : à chaque changement de saison, on remet autant d'arbres et de cailloux qu'au départ (même si la ferme a été vidée) :
// une nouvelle génération (graine de la saison) remplit les cases restées libres, sans dépasser le nombre de départ.
export function seasonRestock(g) {   // 19/11 : à chaque saison, les arbres adultes sont replacés ailleurs, au hasard (même nombre qu'au départ)
  const S = g.S, seed = (S.treeSeed || 12345) + (S.year || 1) * 4099 + (S.season || 0) * 977, fresh = genObjects(seed);
  const px = Math.floor(S.x), py = Math.floor(S.y), pots = new Set((S.pots || []).map(p => key(p.x, p.y)));
  for (const k in S.objs) { const o = S.objs[k], [x, y] = k.split(',').map(Number); if (o.t === 'tree' && !AXE_GROVE.some(([a, b]) => a === x && b === y)) delete S.objs[k]; }
  let added = 0;
  for (const k in fresh) {
    const o = fresh[k]; if (o.t !== 'tree') continue;
    const [x, y] = k.split(',').map(Number);
    if (S.objs[k] || pots.has(k) || (x === px && y === py) || !freeForObj(x, y) || isSolid({ ...S, scene: 'farm' }, x, y)) continue;
    S.objs[k] = newTree(o.k); added++;
  }
  if (!(S.tools && S.tools.axe)) clearAxeAccess(S.objs);   // 20/11 : la hache reste accessible
  return added;
}
