// Lot 8 : expérience (XP) et niveaux du joueur. Logique pure (pas de DOM) ; l'XP vit dans S.pxp.
// Gains (demande de l'utilisateur) : 1 XP par petit objet cassé (arbre, caillou), fleur ou champignon cueilli ;
// 5 XP par objet fabriqué ; plusieurs dizaines par quête résolue, plus pour une quête principale.
// Niveaux : le niveau 1 vient vite, puis la courbe est exponentielle ; niveau 10 maximum pour l'instant.
export const MAX_LEVEL = 10;
export const XP = { small: 1, craft: 5, quest: 40, questMain: 100, step: 10, daily: 30 };   // 💡 quêtes : 40 / 100, étape d'une quête principale 10, quête du jour 30
// XP totale pour atteindre chaque niveau : LEVELS[n] (LEVELS[0] = 0). 10 pour le niveau 1, puis l'écart grandit de × 1,75
// jusqu'au niveau 6 ; 20/11 (demande de l'utilisateur) : la hausse ralentit ensuite (× 1,3, 1,2, 1,15, 1,1) pour que les
// niveaux hauts restent atteignables (niveau 10 vers le 100e jour pour un joueur moyen, d'après tools/equilibrage.mjs).
export const LEVEL_GROWTH = [1.75, 1.75, 1.75, 1.75, 1.3, 1.2, 1.15, 1.1];   // croissance de l'écart, du niveau 2→3 au 9→10
export const LEVELS = (() => { const L = [0, 10]; let need = 25; for (let n = 2; n <= MAX_LEVEL; n++) { L.push(L[n - 1] + Math.round(need)); need *= LEVEL_GROWTH[n - 2] ?? 1.1; } return L; })();
export function levelOf(xp) { let n = 0; while (n < MAX_LEVEL && (xp || 0) >= LEVELS[n + 1]) n++; return n; }
export const level = S => levelOf(S.pxp || 0);
// Barre d'XP : progression vers le niveau suivant (0 → 1), pleine au niveau maximum.
export function xpBar(S) {
  const xp = S.pxp || 0, n = levelOf(xp);
  if (n >= MAX_LEVEL) return { level: n, cur: xp - LEVELS[n], need: 0, p: 1 };
  const cur = xp - LEVELS[n], need = LEVELS[n + 1] - LEVELS[n];
  return { level: n, cur, need, p: cur / need };
}
// Ce qui se débloque à chaque niveau (demande de l'utilisateur : forêt niveau 3, caverne niveau 5 — une quête l'ouvrira —,
// la plupart des recettes selon le niveau, celles du début au niveau 1). La suite sera décidée plus tard.
export const UNLOCKS = { 1: ['Les recettes du début'], 5: ['La caverne sombre (une quête l’ouvrira)'] };
export const ZONE_LEVEL = { foret: 3, wild: 5 };
export const zoneOpen = (S, scene) => level(S) >= (ZONE_LEVEL[scene] || 0);
export const recipeOpen = (S, r) => level(S) >= ((r && r.lvl) || 0);

export function gainPxp(g, n, why) {
  const S = g.S, before = level(S);
  if (!n) return before;
  S.pxp = (S.pxp || 0) + n;
  const after = level(S);
  g.bus.emit('xp', { n, why, xp: S.pxp, level: after });
  for (let l = before + 1; l <= after; l++) {
    g.bus.emit('levelUp', { level: l, unlocks: unlocksAt(l) });
    g.bus.emit('sfx', 'levelup');
    g.bus.emit('toast', `⭐ Niveau ${l} !` + (unlocksAt(l).length ? ' Débloqué : ' + unlocksAt(l).join(', ') : ''));
  }
  return after;
}
// Débloqué à un niveau : zones et recettes (les recettes sont passées par l'appelant pour éviter les dépendances circulaires).
let RECIPE_LEVELS = [];
export function registerRecipeLevels(list) { RECIPE_LEVELS = list; }   // [{ n: 'Nom', lvl }]
export const unlocksAt = l => [...(UNLOCKS[l] || []), ...RECIPE_LEVELS.filter(r => r.lvl === l && l > 1).map(r => 'recette « ' + r.n + ' »')];

// Quêtes : XP quand une étape d'une quête principale est faite, et quand une quête entière est résolue.
// Les quêtes se déduisent de l'état : on retient ce qui a déjà rapporté de l'XP (S.xpQuests), pour ne payer qu'une fois.
export function questXpTick(g, QUESTS) {
  const S = g.S, seen = (S.xpQuests ||= {});
  let total = 0;
  for (const id in QUESTS) {
    const q = QUESTS[id];
    q.steps.forEach((st, i) => { const k = id + ':' + i; if (!seen[k] && !st.locked && st.done(S)) { seen[k] = 1; if (q.main) total += XP.step; } });
    if (!seen[id] && q.steps.every(st => st.done(S))) { seen[id] = 1; total += q.main ? XP.questMain : XP.quest; }
  }
  if (total) gainPxp(g, total, 'quest');
  return total;
}
// Partie déjà en cours avant le lot 8 : on marque les quêtes déjà faites sans rapporter d'XP d'un coup.
export function seedQuestXp(S, QUESTS) {
  const seen = (S.xpQuests ||= {});
  for (const id in QUESTS) { const q = QUESTS[id]; q.steps.forEach((st, i) => { if (st.done(S)) seen[id + ':' + i] = 1; }); if (q.steps.every(st => st.done(S))) seen[id] = 1; }
}
