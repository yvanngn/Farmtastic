// Recettes connues (fabriquées n'importe où), feux de camp, cuisson et buissons à baies. Logique pure.
import { HAND_RECIPES, COOK, COOK_MS, BUSHES, BERRY_DAYS, BERRY_PICK, MAX_FIRES } from '../data/recipes.js';
import { isSolid, isPath, key } from '../world/map.js';
import { add, has, canAdd, scatter } from './inventory.js';
import { gainJob } from './jobs.js';

const dayNo = S => (S.year - 1) * 112 + S.season * 28 + S.day;
export const knows = (S, id) => (S.recipes || []).includes(id);
export const canCraftHand = (S, id) => knows(S, id) && Object.entries(HAND_RECIPES[id].in).every(([k, n]) => has(S, k, n));

export function craftHand(g, id) {
  const S = g.S, r = HAND_RECIPES[id];
  if (!r || !canCraftHand(S, id)) { g.bus.emit('sfx', 'denied'); return false; }
  for (const [k, n] of Object.entries(r.in)) add(g, k, -n);
  add(g, r.out, r.q);
  if (r.job) gainJob(g, r.job);
  g.bus.emit('sfx', 'craft'); g.bus.emit('toast', `Fabriqué : ${r.out === 'campfire' ? 'un feu de camp 🔥 (prends-le en main et pose-le)' : r.out === 'chest' ? 'un coffre 📦' : r.out}`);
  return true;
}

// Feux de camp posés sur la ferme.
export const fireAt = (S, x, y) => (S.scene || 'farm') === 'farm' && (S.fires || []).find(f => f.x === x && f.y === y) || null;
export function placeFire(g, x, y) {
  const S = g.S;
  if ((S.scene || 'farm') !== 'farm' || !(S.inv.campfire > 0)) return false;
  if ((S.fires || []).length >= MAX_FIRES || isSolid(S, x, y) || isPath(x, y) || (S.plots && S.plots[key(x, y)]) || Math.hypot(x + .5 - S.x, y + .5 - S.y) > 2.5) {
    g.bus.emit('sfx', 'denied'); g.bus.emit('toast', (S.fires || []).length >= MAX_FIRES ? `Pas plus de ${MAX_FIRES} feux à la fois.` : 'Pose le feu sur l’herbe, tout près de toi.'); return false;
  }
  add(g, 'campfire', -1); (S.fires ||= []).push({ x, y });
  if (S.sel === 'campfire' && !(S.inv.campfire > 0)) S.sel = 'hand';
  g.bus.emit('sfx', 'craft'); g.bus.emit('toast', '🔥 Feu allumé ! Tiens des baies en main près du feu pour les griller.');
  return true;
}

// Cuisson : on touche le feu avec l'aliment en main, puis on reste à côté 5 secondes.
export function startCook(g, x, y) {
  const S = g.S, out = COOK[S.sel];
  if (!out) { g.bus.emit('toast', '🔥 Un bon feu. Prends un aliment en main (des baies…) pour le cuire.'); return false; }
  if (!has(S, S.sel, 1)) return false;
  g.cooking = { x, y, item: S.sel, t0: g.now() };
  g.bus.emit('sfx', 'ui'); g.bus.emit('toast', 'Ça grille… reste près du feu ⏳');
  return true;
}
export function cookTick(g) {
  const S = g.S, c = g.cooking;
  if (!c) return null;
  const near = (S.scene || 'farm') === 'farm' && Math.hypot(c.x + .5 - S.x, c.y + .5 - S.y) < 2.2 && fireAt(S, c.x, c.y);
  if (!near || S.sel !== c.item || !has(S, c.item, 1)) { g.cooking = null; g.bus.emit('toast', 'Cuisson interrompue.'); return 'stop'; }
  if (g.now() - c.t0 < COOK_MS) return 'cooking';
  add(g, c.item, -1); add(g, COOK[c.item], 1);
  g.bus.emit('sfx', 'collect'); g.bus.emit('pop', { t: '+1 🍒', x: c.x, y: c.y });
  g.cooking = has(S, c.item, 1) ? { ...c, t0: g.now() } : null;   // continue avec la suivante tant qu'on reste
  return 'done';
}
export const cookProgress = g => g.cooking ? Math.min(1, (g.now() - g.cooking.t0) / COOK_MS) : 0;

// Buissons à baies.
export const BERRY_TIP = [
  '🫐 Des baies ! Mange-les (sac → Manger) : +1 ⚡ chacune (les mûres : +2 ⚡).',
  '🔥 Ou jette-les au feu de camp : grillées, elles rendent bien plus (+5 ⚡). Tiens-les en main et touche le feu.',
  '🍲 Et avec un chaudron, 4 baies font une soupe : +45 ⚡ !'
];
export const bushAt = (S, x, y) => (S.scene || 'farm') === 'farm' && BUSHES.some(([a, b]) => a === x && b === y);
const bushKind = (x, y) => (BUSHES.find(([a, b]) => a === x && b === y) || [])[2] === 'mure' ? 'mure' : 'berry';
export const bushRipe = (S, x, y) => { const d = (S.bushes || {})[key(x, y)]; return d == null || dayNo(S) - d >= BERRY_DAYS; };
export function pickBush(g, x, y) {
  const S = g.S;
  if (!bushAt(S, x, y)) return null;
  if (!bushRipe(S, x, y)) { g.bus.emit('toast', 'Plus de baies… elles repoussent en 2 jours 🌿'); return 0; }
  const n = BERRY_PICK[0] + (g.rnd() * (BERRY_PICK[1] - BERRY_PICK[0] + 1) | 0);
  const kind = bushKind(x, y);
  scatter(g, kind, n, x, y); (S.bushes ||= {})[key(x, y)] = dayNo(S);
  g.bus.emit('sfx', 'collect'); g.bus.emit('pop', { t: `+${n} ${kind === 'mure' ? '🍇' : '🫐'}`, x, y });
  const T = (S.tips ||= {});
  if (!T.berry) { T.berry = true; g.bus.emit('say', { name: 'Conseil', color: '#ffdf8a', lines: BERRY_TIP }); }
  return n;
}
