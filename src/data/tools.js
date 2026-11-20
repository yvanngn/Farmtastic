import { CFG } from '../config.js';
// Paliers d'outils et niveaux de minage.
export const TIER_NAMES = ['', 'Base', 'Cuivre', 'Fer', 'Or', 'Iridium'];
export const MAX_TIER = 5;
export const UPGRADABLE = ['axe', 'pick', 'sickle', 'sword'];
// XP totale pour atteindre le niveau i+1 (niveau 1 à 10).
// Progression ralentie (15/11, demande de l'utilisateur) : environ 3 fois plus d'expérience par niveau 💡
export const MINING_XP = [0, 40, 160, 450, 1100, 2400, 4800, 9000, 16000, 28000];   // 20/11 : exponentiel (le niveau 2 vient vite, puis bien plus long) — même table pour le bûcheron 💡
// Coût pour passer du palier `tier` au suivant.
export const upgradeCost = tier => ({ money: 600 * tier * tier, stone: 30 * tier, minLvl: tier * 2 });   // améliorations de la pioche / hache plus chères 💡
// Palier de pioche minimal par type de roche.
export const MIN_PICK = { rock: 1, rock_big: 1, boulder: 2 };
// Énergie par coup selon le palier de l'outil.
// Énergie par coup (abaissée : les coups sont plus lents, un arbre de base coûte 4 ⚡ au lieu de 8) 💡
export const energyCost = tier => (tier >= 3 ? 0.4 : 0.65);   // 19/11 : un peu plus fatigant (0,5 → 0,65 ; 0,3 → 0,4 dès le fer)
// Un coup de hache ou de pioche à la fois : on attend la fin du geste (CFG.HIT_MS) avant le suivant.
export function hitReady(g) {
  const ms = CFG.HIT_MS, t = g.now();
  if (ms && g.lastHit != null && t - g.lastHit < ms) return false;
  g.lastHit = t; return true;
}
export const MINING_GAIN = { hit: 2, rock: 5, rock_big: 8, boulder: 15 };
// 20/11 (demande de l'utilisateur) : plus de paliers d'outils. Ce sont les compétences (niveau 1 à 10 : minage, bûcheron)
// qui débloquent les passages et permettent de casser de plus grosses choses.
export const SKILL_MAX = 10;
export const SKILL_NAMES = { mining: '⛏️ Minage', wood: '🪓 Bûcheron' };
export const WOOD_GAIN = { hit: 2, tree: 5, stump: 2, blocker: 3 };   // 💡 XP de bûcheron
export const NEED = {
  boulder: ['mining', 3],      // gros caillou (bordure de la carrière) 💡
  mouth: ['mining', 3],        // rocher devant une bouche de la carrière profonde 💡
  forestTree: ['wood', 3],     // l'arbre tombé qui barre la forêt 💡
  vein: { tin: 4, copper: 3, zinc: 4, iron: 5, cobalt: 6, nickel: 7, silver: 8, gold: 10 }   // niveau de minage par filon
};
