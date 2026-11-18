// Lot 13 (décrit par l'utilisateur le 18/11) : Golgolas, vieil elfe ermite, a un centre au sud de la gare (zone cachée, barrée au
// début). Une météorite l'a écrasé. Dès le niveau 5, une lettre de lui arrive dans la boîte aux lettres de la ferme : en la lisant,
// le chemin s'ouvre. Il faut d'abord casser la météorite (≈ 5000 coups de pioche, 1 caillou tous les 10 coups, énergie normale),
// puis apporter beaucoup de matériaux (niveau 1 : 500 bois, 500 pierres, 200 champignons). Le centre réparé remplace le magasin :
// c'est lui qui agrandit les piles du sac (niveau 1 : 15 objets par case ; niveau 2 à définir). Logique pure.
import { level } from './level.js';
import { add } from './inventory.js';
import { useEnergy } from './player.js';
import { hasTool } from './skills.js';
import { energyCost, hitReady } from '../data/tools.js';
import { toolTier } from './skills.js';
import { ITEMS } from '../data/items.js';
import { gainPxp, XP } from './level.js';

export const LETTER_LEVEL = 5;
export const METEOR_HITS = 5000, STONE_EVERY = 10;
export const CENTER_NEEDS = [{ wood: 500, stone: 500, mush: 200 }];   // niveau 2 : à définir par l'utilisateur
export const CENTER_STACKS = [10, 15];                                 // piles du sac selon le niveau du centre
export const MAILBOX = { x: 8, y: 5 };                                  // boîte aux lettres de la ferme (devant la cabane)
const G = S => (S.golgo ||= { letter: false, read: false, hits: 0, lvl: 0, given: {} });
export const golgo = S => S.golgo || { letter: false, read: false, hits: 0, lvl: 0, given: {} };
export const zoneOpen = S => !!golgo(S).read;
export const meteorDone = S => golgo(S).hits >= METEOR_HITS;
export const isMush = id => !!(ITEMS[id] && ITEMS[id].mush);

// Chaque jour (et au chargement) : la lettre arrive dès le niveau 5.
export function letterTick(g) {
  const S = g.S, st = G(S);
  if (st.letter || level(S) < LETTER_LEVEL) return false;
  st.letter = true;
  g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', '📬 Du courrier t’attend dans la boîte aux lettres de la ferme !');
  return true;
}
// Lire la lettre (toucher la boîte aux lettres) : le chemin au sud de la gare s'ouvre.
export const LETTER = [
  "« Bien le bonjour, jeune bâtisseur. On m'a parlé de toi : il paraît que tu sais retaper ce que d'autres laissent tomber.",
  "Je m'appelle Golgolas. Je vis depuis longtemps dans un centre caché, au sud de la gare. Je me débrouillais bien… jusqu'à ce qu'une météorite l'écrase.",
  "Seul, je n'y arriverai pas. J'ai retiré les planches qui barraient le chemin, au sud de la gare. Viens, je t'en prie. — Golgolas »"
];
export function readLetter(g) {
  const S = g.S, st = G(S);
  if (!st.letter) { g.bus.emit('toast', '📭 La boîte aux lettres est vide.'); return 'empty'; }
  g.bus.emit('say', { name: 'Lettre de Golgolas', color: '#c8b8e8', lines: LETTER });
  if (!st.read) { st.read = true; g.bus.emit('toast', '📜 Nouvelle quête principale : Le centre de Golgolas'); }
  return 'letter';
}
// Casser la météorite : pioche en main, énergie normale, 1 caillou tous les 10 coups.
export function hitMeteor(g) {
  const S = g.S, st = G(S);
  if (meteorDone(S)) return 'done';
  if (!hasTool(S, 'pick') || S.sel !== 'pick') { g.bus.emit('toast', '⛏️ Il faut une pioche en main pour attaquer la météorite.'); return 'nopick'; }
  if (!hitReady(g)) return 'wait';
  if (!useEnergy(g, energyCost(toolTier(S, 'pick')))) return 'tired';
  st.hits = Math.min(METEOR_HITS, st.hits + 1);
  g.bus.emit('swing', 'pick'); g.bus.emit('sfx', 'pick');
  if (st.hits % STONE_EVERY === 0) add(g, 'stone', 1);
  if (meteorDone(S)) { gainPxp(g, XP.step, 'meteor'); g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', '💥 La météorite vole en éclats ! Va parler à Golgolas.'); }
  return 'hit';
}
export const centerNeeds = S => CENTER_NEEDS[golgo(S).lvl] || null;
// Donner des matériaux à Golgolas (après la météorite) : tout ce qu'on porte, jusqu'à remplir le niveau.
export function contributeCenter(g) {
  const S = g.S, st = G(S), need = centerNeeds(S);
  if (!meteorDone(S) || !need) return null;
  const moved = {};
  for (const k of ['wood', 'stone']) { const give = Math.min(S.inv[k] || 0, need[k] - (st.given[k] || 0)); if (give > 0) { add(g, k, -give); st.given[k] = (st.given[k] || 0) + give; moved[k] = give; } }
  for (const id of Object.keys(S.inv)) if (isMush(id)) { const give = Math.min(S.inv[id] || 0, need.mush - (st.given.mush || 0)); if (give > 0) { add(g, id, -give); st.given.mush = (st.given.mush || 0) + give; moved.mush = (moved.mush || 0) + give; } }
  const done = Object.entries(need).every(([k, v]) => (st.given[k] || 0) >= v);
  if (done) { st.lvl++; st.given = {}; g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', `🏛️ Le centre de Golgolas est remis en état ! Les piles du sac passent à ${CENTER_STACKS[st.lvl]} objets.`); g.bus.emit('inv'); return 'done'; }
  return Object.keys(moved).length ? moved : 'nothing';
}
// Parler à Golgolas : selon l'avancée (météorite, matériaux, centre réparé).
export function golgolasTalk(g, n) {
  const S = g.S, st = G(S), say = lines => g.bus.emit('say', { name: n.name, color: n.color, voice: n.voice, lines });
  if (!meteorDone(S)) { say(st.hits ? [`Courage ! Encore ${METEOR_HITS - st.hits} coups environ… Cette pierre est plus têtue qu'un nain.`] : n.meteor); return true; }
  const need = centerNeeds(S);
  if (!need) return false;   // niveau 2 à venir : discussion normale
  const r = contributeCenter(g);
  if (r === 'done') { say(n.thanks); return true; }
  const left = k => Math.max(0, need[k] - (st.given[k] || 0));
  say([...(r === 'nothing' ? n.need : n.merci), `Il me manque encore ${left('wood')} bois, ${left('stone')} pierres et ${left('mush')} champignons.`]);
  return true;
}
