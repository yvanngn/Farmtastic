// Bois et pierre. La puissance de l'outil (palier) retire autant de PV par coup
// et réduit l'énergie dépensée. Casser des pierres donne de l'XP de minage.
import { CFG } from '../config.js';
import { freeForObj, key, isForest, newTree, newRock, genObjects, isSolid } from '../world/map.js';
import { TREE_KINDS, TREE_KIND_IDS, TREE_GROW_DAYS, ROCK_DAYS, STONE_YIELD, FOREST } from '../data/forest.js';
import { MIN_PICK, MINING_GAIN, TIER_NAMES, energyCost, hitReady } from '../data/tools.js';
import { add, scatter } from './inventory.js';
import { useEnergy } from './player.js';
import { gainXp, toolTier, hasTool } from './skills.js';
import { gainPxp, XP } from './level.js';

export const TOOL_FOR = { tree: 'axe', rock: 'pick', rock_big: 'pick', boulder: 'pick' };
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
  const tier = toolTier(S, tool), need = MIN_PICK[o.t] || 1;
  if (tier < need) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', `${({ pick: 'Il faut une meilleure pioche', axe: 'Il faut une meilleure hache', sickle: 'Il faut une meilleure faucille' })[tool] || 'Il faut un meilleur outil'} (forge d’Igor).`); return false; }   // 19/11 : on ne nomme plus le palier
  if (!hitReady(g)) return 'wait';   // le geste précédent n'est pas fini
  if (!useEnergy(g, energyCost(tier))) return false;
  o.hp -= tier; o.shake = 0.25;
  g.bus.emit('swing', tool);
  g.bus.emit('objHit', { x, y, t: o.t, k: o.k, broken: o.hp <= 0 });
  g.bus.emit('sfx', o.hp <= 0 ? 'break' : o.t === 'tree' ? 'chop' : 'pick');
  if (isStone(o.t)) gainXp(g, 'mining', MINING_GAIN.hit);
  if (o.hp <= 0) {
    delete S.objs[k];
    gainPxp(g, o.t === 'boulder' ? 2 * XP.small : XP.small, o.t);   // lot 8 : 1 XP par petit objet cassé (💡 2 pour un gros rocher)
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
export function seasonRestock(g) {
  const S = g.S, start = genObjects(), fresh = genObjects(12345 + (S.year || 1) * 4 + (S.season || 0) * 977);
  const count = o => { let t = 0, r = 0; for (const k in o) { const x = o[k].t; if (x === 'tree') t++; else if (x === 'rock' || x === 'rock_big') r++; } return { t, r }; };
  const want = count(start), have = count(S.objs); let added = 0;
  const px = Math.floor(S.x), py = Math.floor(S.y), queued = new Set((S.rockQueue || []).map(q => q.k)), pots = new Set((S.pots || []).map(p => key(p.x, p.y)));
  for (const k in fresh) {
    const o = fresh[k], tree = o.t === 'tree', rock = o.t === 'rock' || o.t === 'rock_big';
    if (!(tree || rock) || (tree ? have.t >= want.t : have.r >= want.r)) continue;
    const [x, y] = k.split(',').map(Number);
    if (S.objs[k] || queued.has(k) || pots.has(k) || (x === px && y === py) || !freeForObj(x, y) || isSolid({ ...S, scene: 'farm' }, x, y)) continue;
    S.objs[k] = tree ? newTree(o.k) : newRock(o.t === 'rock_big'); tree ? have.t++ : have.r++; added++;
  }
  return added;
}
