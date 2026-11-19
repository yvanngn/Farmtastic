// Lot 9 : quêtes secondaires de fabrication. Les habitants (en discutant : « Une demande ? ») et le panneau d'affichage
// demandent un objet que le joueur sait fabriquer : confitures et plats du chaudron, grillades au feu, objets des recettes.
// Rythme (demande de l'utilisateur) : une demande par habitant et par semaine ; le panneau aussi, une par semaine.
// Récompense : de l'argent, l'XP d'une quête secondaire et, pour un habitant, des points d'amitié. Logique pure (pas de DOM).
import { HAND_RECIPES, RECIPES, COOK } from '../data/recipes.js';
import { POT_RECIPES } from '../data/patterns.js';
import { ITEMS } from '../data/items.js';
import { knows } from './cooking.js';
import { knowsPot } from './pots.js';
import { recipeOpen, gainPxp, XP } from './level.js';
import { add, has } from './inventory.js';

export const CRAFT_HEART_PTS = 60;   // 💡 points d'amitié pour une demande livrée (250 points = 1 cœur)
export const BOARD = 'panneau';
const dayNo = S => (S.year - 1) * 120 + S.season * 30 + S.day;
export const weekNo = S => Math.floor((dayNo(S) - 1) / 7);
// 💡 récompense : deux fois la valeur de vente, plus 20 $ pour la peine.
export const craftReward = (out, qty) => 2 * ((ITEMS[out] && ITEMS[out].p) || 5) * qty + 20;

// Ce que le joueur sait fabriquer en ce moment (au niveau actuel) : [{ out, qty }].
export function craftables(S) {
  const out = [];
  for (const id in HAND_RECIPES) { const r = HAND_RECIPES[id]; if (knows(S, id) && recipeOpen(S, r) && !['chest', 'chaudron'].includes(r.out)) out.push({ out: r.out, qty: 1 }); }
  for (const id in POT_RECIPES) { const r = POT_RECIPES[id]; if (knowsPot(S, id)) out.push({ out: r.out, qty: r.out === 'bread' ? 2 : 1 }); }
  if (knows(S, 'campfire') && recipeOpen(S, HAND_RECIPES.campfire)) for (const k in COOK) out.push({ out: COOK[k], qty: 2 });
  if (S.workbench) for (const r of RECIPES) if (recipeOpen(S, r) && r.out !== 'hay') out.push({ out: r.out, qty: r.out === 'fence' ? 3 : 1 });
  return out.filter((x, i, a) => ITEMS[x.out] && a.findIndex(y => y.out === x.out) === i);
}

// La demande de la semaine pour un habitant (id) ou le panneau ; null si on ne sait encore rien fabriquer.
export function craftRequest(g, who) {
  const S = g.S, w = weekNo(S), all = (S.craftQ ||= {});
  const cur = all[who];
  if (cur && cur.week === w) return cur;
  const pool = craftables(S);
  if (!pool.length) return null;
  const p = pool[g.rnd() * pool.length | 0];
  return (all[who] = { week: w, item: p.out, qty: p.qty, reward: craftReward(p.out, p.qty), done: false });
}
export const craftReady = (S, q) => !!q && !q.done && has(S, q.item, q.qty);

// Livrer la demande : objets retirés, argent, XP (quête secondaire), amitié pour un habitant.
export function deliverCraft(g, who) {
  const S = g.S, q = S.craftQ && S.craftQ[who];
  if (!q || q.week !== weekNo(S) || !craftReady(S, q)) { g.bus.emit('sfx', 'denied'); return false; }
  add(g, q.item, -q.qty); S.money += q.reward; q.done = true;
  if (who !== BOARD && S.social[who]) S.social[who].points += CRAFT_HEART_PTS;
  gainPxp(g, XP.quest, 'craftQuest');
  g.bus.emit('sfx', 'coin');
  g.bus.emit('toast', `🛠️ Demande livrée : +${q.reward} $${who !== BOARD ? ' et un peu d’amitié 💚' : ''}. Une autre la semaine prochaine !`);
  return true;
}
export const craftLabel = q => `${q.qty} × ${(ITEMS[q.item] || {}).n || q.item}`;
