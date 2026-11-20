// 19/11 (demande de l'utilisateur) : la forêt n'est plus bloquée par le niveau mais par un énorme arbre en travers du chemin,
// qu'il faut abattre avec une hache en cuivre (au moins) ; le gros rocher devant le passage de la carrière demande une pioche
// en cuivre. Sinon : « ma hache / ma pioche n'est pas assez costaude ». Logique pure.
import { toolTier, hasTool, lacks, gainXp } from './skills.js';
import { useEnergy } from './player.js';
import { energyCost, hitReady, NEED, WOOD_GAIN } from '../data/tools.js';
import { scatter } from './inventory.js';
export const FOREST_TREE_HP = 12, NEED_TIER = 2;   // (NEED_TIER : ancien palier, plus utilisé ; voir NEED dans data/tools.js)
export const forestOpen = S => !!(S.flags && S.flags.foretTree);
export const TOO_WEAK = { axe: '🪓 Ma hache n’est pas assez costaude pour ce tronc… Il me faudrait une hache en cuivre (forge d’Igor).', pick: '⛏️ Ma pioche n’est pas assez costaude pour ce rocher… Il me faudrait une pioche en cuivre (forge d’Igor).' };
// Coup de hache sur l'arbre qui barre le chemin de la forêt. Renvoie 'blocked' / 'weak' / 'hit' / 'open'.
export function chopForestBlocker(g, x, y) {
  const S = g.S;
  if (forestOpen(S)) return 'open';
  if (S.sel !== 'axe') { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', '🌳 Un énorme arbre est tombé en travers du chemin de la forêt. Il faudrait le couper…'); return 'blocked'; }
  { const weak = lacks(S, NEED.forestTree); if (weak) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', weak); return 'weak'; } }   // 20/11 : niveau de bûcheron
  if (!hitReady(g)) return 'wait';
  if (!useEnergy(g, energyCost(toolTier(S, 'axe')))) return 'tired';
  (S.flags ||= {}).foretHits = (S.flags.foretHits || 0) + toolTier(S, 'axe');
  g.bus.emit('swing', 'axe'); g.bus.emit('sfx', 'chop'); gainXp(g, 'wood', WOOD_GAIN.blocker);
  if (S.flags.foretHits >= FOREST_TREE_HP) { S.flags.foretTree = true; scatter(g, 'wood', 12, x, y); g.bus.emit('sfx', 'break'); g.bus.emit('toast', '🌲 Le gros arbre est tombé : le chemin de la forêt est ouvert !'); return 'open'; }
  return 'hit';
}
