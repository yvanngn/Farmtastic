// 19/11 (demande de l'utilisateur) : le journal, posé sur la table de la cabane. Il garde les 200 dernières activités du joueur
// (tout ce qui s'affiche en bulle d'info), et s'ouvre par onglets : activités, quêtes en cours, liens, histoire vécue.
// L'onglet choisi est gardé dans la sauvegarde. Logique pure.
import { QUESTS, questProgress, questVisible } from './quests.js';

export const JOURNAL_MAX = 200;
export const JOURNAL_TABS = ['journal', 'quests', 'social', 'histoire'];
const J = S => (S.journal ||= { log: [], tab: 'journal' });
export const journal = S => S.journal || { log: [], tab: 'journal' };
const SAI = ['Printemps', 'Été', 'Automne', 'Hiver'];
export const stamp = S => `${SAI[S.season || 0]} j${S.day || 1}, an ${S.year || 1} · ${String(Math.floor((S.minute || 0) / 60) % 24).padStart(2, '0')}h${String((S.minute || 0) % 60).padStart(2, '0')}`;

export function logActivity(S, text) {
  const t = String(text || '').trim(); if (!t) return false;
  const L = J(S).log, last = L[L.length - 1];
  if (last && last.t === t && last.w === stamp(S)) return false;   // pas de doublon immédiat
  L.push({ w: stamp(S), t });
  if (L.length > JOURNAL_MAX) L.splice(0, L.length - JOURNAL_MAX);
  return true;
}
export function setJournalTab(S, tab) { if (JOURNAL_TABS.includes(tab)) J(S).tab = tab; return J(S).tab; }
export function journalHook(g) { g.bus.on('toast', t => logActivity(g.S, t)); }

// Histoire vécue : les étapes accomplies des quêtes principales, dans l'ordre.
export function storySoFar(S) {
  const out = [];
  for (const id of Object.keys(QUESTS)) {
    const q = QUESTS[id]; if (!q.main || !questVisible(S, id)) continue;
    const { done } = questProgress(S, id), steps = q.steps.filter((s, i) => done[i]);
    if (steps.length) out.push({ i: q.i, n: q.n, steps: steps.map(s => s.t), fini: done.every(Boolean) });
  }
  return out;
}
