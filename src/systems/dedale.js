// Lot 30b (demande de l'utilisateur, 20–21/11) : le dédale profond, premier sous-sol, sous le trou de l'énorme rocher.
// Arbres ordinaires et chênes (bois de chêne, plus robuste), qui repoussent chaque jour ; marmottes à grandes griffes
// (les toucher lance le combat au tour par tour). Cailloux, filons et fleurs : src/systems/nature.js. Logique pure.
import { LAYOUTS, DEDALE_ROUTE, DEDALE_LADDER } from '../world/scenes.js';
import { key, isSolid } from '../world/map.js';
import { scatter } from './inventory.js';
import { useEnergy } from './player.js';
import { gainXp, toolTier, hasTool, lacks } from './skills.js';
import { energyCost, hitReady, WOOD_GAIN } from '../data/tools.js';
import { gainPxp, XP } from './level.js';
import { MOBS } from '../data/wild.js';
import { startBattle, JOIN_R } from './battle.js';

export const DTREES = 40, DTREES_DAY = 8, OAK_P = 0.3;        // 💡 arbres au plus, repousse par jour, part de chênes
export const TREE_HITS = { tree: 8, oak: 14 };                  // le chêne est plus robuste 💡
export const OAK_NEED = ['wood', 3];                            // niveau de bûcheron pour le chêne 💡
export const MARMOTS = 7;                                       // marmottes à chaque descente 💡
const dayId = S => S.year + '-' + S.season + '-' + S.day;
const D = S => (S.dedale ||= { day: null, trees: {} });
export const dedaleTree = (S, x, y) => (S.dedale && S.dedale.trees[key(x, y)]) || null;
const nearLadder = (x, y) => Math.abs(x - DEDALE_LADDER.x) < 5 && Math.abs(y - DEDALE_LADDER.y) < 4;
export function freeDedale(S, x, y) {
  const L = LAYOUTS.dedale, k = key(x, y);
  return !!(L[y] && L[y][x] === '.') && !DEDALE_ROUTE.has(k) && !nearLadder(x, y) && !(S.dedale && S.dedale.trees[k]) && !(S.nature && S.nature.dedale && (S.nature.dedale.rocks[k] || S.nature.dedale.flowers[k]));
}
// Une fois par jour : les arbres repoussent (tous au premier passage).
export function ensureTrees(g) {
  const S = g.S, st = D(S); if (st.day === dayId(S)) return st;
  const first = st.day == null; st.day = dayId(S);
  const L = LAYOUTS.dedale, W = L[0].length, H = L.length;
  let n = Object.keys(st.trees).length, add = Math.min(first ? DTREES : DTREES_DAY, DTREES - n);
  for (let t = 0; t < 2000 && add > 0; t++) {
    const x = 2 + (g.rnd() * (W - 4) | 0), y = 2 + (g.rnd() * (H - 4) | 0);
    if (!freeDedale(S, x, y)) continue;
    const oak = g.rnd() < OAK_P; st.trees[key(x, y)] = { t: oak ? 'oak' : 'tree', k: oak ? 'oak' : (g.rnd() < .5 ? 'pine' : 'birch'), hp: TREE_HITS[oak ? 'oak' : 'tree'] }; add--;
  }
  return st;
}
export function chopDedale(g, x, y) {
  const S = g.S, o = dedaleTree(S, x, y); if (!o) return false;
  if (S.sel !== 'axe') { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', hasTool(S, 'axe') ? 'Il faut la hache 🪓' : 'Il me faudrait une hache.'); return false; }
  if (o.t === 'oak') { const w = lacks(S, OAK_NEED); if (w) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', '🌳 Un chêne, dur comme la pierre… ' + w); return false; } }
  if (!hitReady(g)) return 'wait';
  const tier = toolTier(S, 'axe'); if (!useEnergy(g, energyCost(tier))) return false;
  o.hp -= tier; o.shake = 0.25; g.bus.emit('swing', 'axe'); gainXp(g, 'wood', WOOD_GAIN.hit);
  g.bus.emit('objHit', { x, y, t: 'tree', broken: o.hp <= 0 });
  if (o.hp > 0) { g.bus.emit('sfx', 'chop'); return true; }
  delete S.dedale.trees[key(x, y)]; gainPxp(g, XP.small, 'tree'); gainXp(g, 'wood', WOOD_GAIN.tree); g.bus.emit('sfx', 'break');
  if (o.t === 'oak') { const n = 2 + (g.rnd() * 2 | 0); scatter(g, 'oak_wood', n, x, y); scatter(g, 'wood', 1, x, y); g.bus.emit('pop', { t: `+${n} chêne +1🪵`, x, y }); }
  else { const n = 3 + (g.rnd() * 3 | 0); scatter(g, 'wood', n, x, y); g.bus.emit('pop', { t: '+' + n + '🪵', x, y }); }
  return true;
}
// Marmottes : posées à chaque descente ; elles se promènent, viennent vers le joueur quand il est proche ; au contact, combat.
export function spawnMarmots(g) {
  const S = g.S, L = LAYOUTS.dedale, W = L[0].length, H = L.length;
  g.enemies.length = 0;
  for (let n = 0, t = 0; n < MARMOTS && t < 3000; t++) {
    const x = 2 + g.rnd() * (W - 4), y = 2 + g.rnd() * (H - 4);
    if (L[y | 0][x | 0] !== '.' || Math.hypot(x - S.x, y - S.y) < 10 || isSolid(S, x | 0, y | 0)) continue;
    g.enemies.push({ type: 'marmotte', x, y, hp: MOBS.marmotte.hp, cd: 0, hit: 0, t: g.rnd() * 5, vx: 0, vy: 0 }); n++;
  }
}
export function updateDedale(g, dt) {
  const S = g.S, P = g.player;
  if (S.scene !== 'dedale') { if (g.inDedale) { g.inDedale = false; g.enemies.length = 0; } return; }
  ensureTrees(g);
  if (!g.inDedale) { g.inDedale = true; spawnMarmots(g); }
  if (g.battle) return;
  for (const e of [...g.enemies]) {
    const M = MOBS[e.type] || MOBS.marmotte; e.t += dt; e.hit -= dt;
    const dx = S.x - e.x, dy = S.y - e.y, d = Math.hypot(dx, dy) || 1;
    if (d < 5) { e.vx = dx / d; e.vy = dy / d; }
    else if ((e.t % 3) < dt * 1.5) { const a = g.rnd() * Math.PI * 2, still = g.rnd() < .4; e.vx = still ? 0 : Math.cos(a) * .5; e.vy = still ? 0 : Math.sin(a) * .5; }
    const nx = e.x + e.vx * dt * M.speed, ny = e.y + e.vy * dt * M.speed;
    if (!isSolid(S, nx | 0, ny | 0)) { e.x = nx; e.y = ny; } else { e.vx = -e.vx; e.vy = -e.vy; }
    if (d < 0.6 && !(P && P.iframe > 0)) { startBattle(g, e, g.enemies.filter(o => o !== e && Math.hypot(o.x - S.x, o.y - S.y) < JOIN_R)); return; }
  }
}
