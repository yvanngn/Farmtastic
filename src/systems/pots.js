// Patrons (achetés en magasin → recette apprise) et chaudron : on le pose sur la ferme, on choisit un plat,
// puis on remue à la louche (rester appuyé) : la jauge monte, pleine = c'est prêt. Logique pure.
import { PATTERNS, POT_RECIPES, POT_STIR, MAX_POTS } from '../data/patterns.js';
import { isSolid, isPath, key } from '../world/map.js';
import { add, has, canAdd } from './inventory.js';
import { ITEMS } from '../data/items.js';
import { gainJob } from './jobs.js';
export const knowsPot = (S, id) => !!POT_RECIPES[id].base ? (S.recipes || []).includes('chaudron') : (S.recipes || []).includes(id);

export const hasPattern = (S, id) => (S.recipes || []).includes(PATTERNS[id].recipe);
export function buyPattern(g, id) {
  const S = g.S, p = PATTERNS[id];
  if (!p || p.soon || hasPattern(S, id) || S.money < p.price) { g.bus.emit('sfx', 'denied'); return false; }
  S.money -= p.price; if (p.recipe === 'chaudron') { /* la soupe de baies vient avec */ }
  S.recipes = [...new Set([...(S.recipes || []), p.recipe])];
  g.bus.emit('sfx', 'buy'); g.bus.emit('toast', `📜 Nouvelle recette : ${ITEMS[p.recipe] ? ITEMS[p.recipe].n : p.n.replace('Patron : ', '')} ${p.pot ? ' — à préparer au chaudron 🍲' : ' — onglet 🔥 Recettes'}`);
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
  g.bus.emit('sfx', 'craft'); g.bus.emit('toast', '🍲 Chaudron posé ! Prends la louche 🥄 en main et touche-le pour cuisiner.');
  return true;
}
export const canCookPot = (S, id) => Object.entries(POT_RECIPES[id].in).every(([k, n]) => has(S, k, n));
export function startPot(g, pot, id) {
  const S = g.S, r = POT_RECIPES[id];
  if (!r || pot.cook || !knowsPot(S, id) || !canCookPot(S, id)) { g.bus.emit('sfx', 'denied'); return false; }
  for (const [k, n] of Object.entries(r.in)) add(g, k, -n);
  pot.cook = { r: id, p: 0 };
  g.bus.emit('sfx', 'ui'); g.bus.emit('toast', '🥄 Remue ! Reste appuyé sur le chaudron jusqu’à ce que la jauge soit pleine.');
  return true;
}
// Un coup de louche. Renvoie 'need' (pas de louche), 'menu' (choix du plat), 'stir', 'done'.
export function usePot(g, pot) {
  const S = g.S;
  if (S.sel !== 'louche') {
    g.bus.emit('sfx', 'denied');
    g.bus.emit('toast', (S.inv.louche > 0) ? '🥄 Prends la louche en main (sac → En main) pour cuisiner.' : '🥄 Il te faut une louche pour cuisiner (forge d’Igor).');
    return 'need';
  }
  if (!pot.cook) {
    const known = Object.keys(POT_RECIPES).filter(id => knowsPot(S, id)), ids = known.filter(id => canCookPot(S, id));
    if (!ids.length) { g.bus.emit('toast', `🍲 Il manque des ingrédients. Ex. : ${known.map(id => POT_RECIPES[id]).map(r => Object.entries(r.in).map(([k, n]) => `${n} ${ITEMS[k].i}`).join(' + ') + ' → ' + ITEMS[r.out].i).join(', ')}`); return 'missing'; }
    g.bus.emit('say', { name: 'Chaudron', color: '#ffdf8a', lines: ['Que préparer ?'], choices: [...ids.map(id => `${ITEMS[POT_RECIPES[id].out].i} ${ITEMS[POT_RECIPES[id].out].n}`), 'Rien.'],
      onChoose: i => { if (ids[i]) startPot(g, pot, ids[i]); } });
    return 'menu';
  }
  pot.cook.p = Math.min(1, Math.round((pot.cook.p + POT_STIR) * 1000) / 1000);
  g.bus.emit('sfx', 'feed');
  if (pot.cook.p < 1) return 'stir';
  const r = POT_RECIPES[pot.cook.r];
  if (!canAdd(S, r.out, r.q)) { g.bus.emit('toast', 'Sac plein ! Le plat attend dans le chaudron.'); return 'full'; }
  add(g, r.out, r.q); pot.cook = null;
  g.bus.emit('sfx', 'collect'); g.bus.emit('pop', { t: `+${r.q} ${ITEMS[r.out].i}`, x: pot.x, y: pot.y });
  gainJob(g, r.job); ((S.quests ||= {}).debut ||= {}).cuisine = true;
  return 'done';
}
