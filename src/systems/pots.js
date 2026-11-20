// Patrons (achetés en magasin → recette apprise) et chaudron : on le pose sur la ferme, on y met des ingrédients,
// ça cuit, on récupère le plat (20/11 : façon Breath of the Wild). Logique pure.
import { PATTERNS, POT_RECIPES, POT_STIR, MAX_POTS } from '../data/patterns.js';
import { isSolid, isPath, key } from '../world/map.js';
import { add, has, canAdd } from './inventory.js';
import { ITEMS } from '../data/items.js';
import { gainJob } from './jobs.js';
import { gainPxp, XP, recipeOpen } from './level.js';
export const knowsPot = (S, id) => !recipeOpen(S, POT_RECIPES[id]) ? false : !!POT_RECIPES[id].base ? (S.recipes || []).includes('chaudron') : (S.recipes || []).includes(id);

export const hasPattern = (S, id) => (S.recipes || []).includes(PATTERNS[id].recipe);
export function buyPattern(g, id) {
  const S = g.S, p = PATTERNS[id];
  if (!p || p.soon || hasPattern(S, id) || S.money < p.price) { g.bus.emit('sfx', 'denied'); return false; }
  S.money -= p.price; if (p.recipe === 'chaudron') { /* les confitures de baies et de mûres viennent avec */ }
  S.recipes = [...new Set([...(S.recipes || []), p.recipe])];
  g.bus.emit('sfx', 'buy'); g.bus.emit('toast', `📜 Nouvelle recette : ${ITEMS[p.recipe] ? ITEMS[p.recipe].n : p.n.replace('Patron : ', '')} ${p.pot ? ' — à préparer au chaudron 🍲' : ' — onglet 📜 Recettes'}`);
  g.bus.emit('inv');
  return true;
}

export const potAt = (S, x, y) => (S.scene || 'farm') === 'farm' && (S.pots || []).find(p => p.x === x && p.y === y) || null;
export function placePot(g, x, y) {
  const S = g.S;
  if ((S.scene || 'farm') !== 'farm' || !(S.inv.chaudron > 0)) return false;
  const pots = (S.pots ||= []);
  if (pots.length >= MAX_POTS || isSolid(S, x, y) || isPath(x, y) || (S.plots && S.plots[key(x, y)]) || (S.fires || []).some(f => f.x === x && f.y === y) || Math.hypot(x + .5 - S.x, y + .5 - S.y) > 2.5) {
    g.bus.emit('sfx', 'denied'); g.bus.emit('toast', pots.length >= MAX_POTS ? `Pas plus de ${MAX_POTS} chaudrons.` : 'Pose le chaudron sur l’herbe, tout près de toi.'); return false;
  }
  add(g, 'chaudron', -1); pots.push({ x, y, cook: null });
  if (S.sel === 'chaudron' && !(S.inv.chaudron > 0)) S.sel = 'hand';
  g.bus.emit('sfx', 'craft'); g.bus.emit('toast', '🍲 Chaudron posé ! Touche-le pour y mettre des ingrédients.');
  return true;
}
export const canCookPot = (S, id) => Object.entries(POT_RECIPES[id].in).every(([k, n]) => has(S, k, n));
// 20/11 (demande de l'utilisateur) : cuisine façon Breath of the Wild — on met des ingrédients dans le chaudron, ça cuit,
// et on découvre le plat (la recette s'ajoute au menu 📜 Recettes). Plus de louche ni de choix du plat.
export const COOK_MS = 4000;   // 💡 temps de cuisson
export const POT_MAX = 5;      // ingrédients au plus dans le chaudron
// Quel plat donnent ces ingrédients ? (le plus complet dont tous les ingrédients sont là ; null sinon)
export function matchRecipe(S, picks) {
  let best = null;
  for (const [id, r] of Object.entries(POT_RECIPES)) {
    if (!recipeOpen(S, r) || !Object.entries(r.in).every(([k, n]) => (picks[k] || 0) >= n)) continue;
    const size = Object.values(r.in).reduce((a, b) => a + b, 0);
    if (!best || size > best.size) best = { id, size };
  }
  return best && best.id;
}
export function cookPot(g, pot, picks) {
  const S = g.S;
  for (const [k, n] of Object.entries(picks)) if (!has(S, k, n)) { g.bus.emit('sfx', 'denied'); return null; }
  const id = matchRecipe(S, picks);
  if (!id || pot.cook) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', '🍲 Hmm… ces ingrédients ne donnent rien. Essaie un autre mélange !'); return null; }
  for (const [k, n] of Object.entries(POT_RECIPES[id].in)) add(g, k, -n);
  pot.cook = { r: id, t0: g.now() };
  g.bus.emit('sfx', 'craft'); g.bus.emit('toast', '🍲 Ça mijote…');
  return id;
}
export const potReady = (g, pot) => !!pot.cook && (pot.cook.t0 == null || g.now() - pot.cook.t0 >= COOK_MS);   // (anciennes parties : prêt tout de suite)
// Toucher le chaudron : 'menu' (choisir les ingrédients), 'cooking' (ça mijote), 'done' (plat récupéré), 'full'.
export function usePot(g, pot) {
  const S = g.S;
  if (!pot.cook) { g.potOpen = pot; g.bus.emit('open', 'pot'); return 'menu'; }
  if (!potReady(g, pot)) { g.bus.emit('toast', '🍲 Ça mijote encore un peu…'); return 'cooking'; }
  const r = POT_RECIPES[pot.cook.r];
  if (!canAdd(S, r.out, r.q)) { g.bus.emit('toast', 'Sac plein ! Le plat attend dans le chaudron.'); return 'full'; }
  const fresh = !(S.recipes || []).includes(pot.cook.r);
  add(g, r.out, r.q); S.recipes = [...new Set([...(S.recipes || []), pot.cook.r])]; pot.cook = null;
  g.bus.emit('sfx', fresh ? 'levelup' : 'collect'); g.bus.emit('pop', { t: `+${r.q} ${ITEMS[r.out].i}`, x: pot.x, y: pot.y });
  if (fresh) g.bus.emit('toast', `📜 Nouvelle recette découverte : ${ITEMS[r.out].n} (menu → Recettes)`);
  gainJob(g, r.job); ((S.quests ||= {}).debut ||= {}).cuisine = true;
  gainPxp(g, XP.craft, 'craft');   // lot 8 : plat préparé = objet fabriqué
  return 'done';
}
