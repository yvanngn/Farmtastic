import { CFG } from '../config.js';
// Paliers d'outils et niveaux de minage.
export const TIER_NAMES = ['', 'Base', 'Cuivre', 'Fer', 'Or', 'Iridium'];
export const MAX_TIER = 5;
export const UPGRADABLE = ['axe', 'pick', 'sickle', 'sword'];
// XP totale pour atteindre le niveau i+1 (niveau 1 à 10).
// Progression ralentie (15/11, demande de l'utilisateur) : environ 3 fois plus d'expérience par niveau 💡
export const MINING_XP = [0, 100, 260, 520, 900, 1450, 2200, 3200, 4500, 6200];
// Coût pour passer du palier `tier` au suivant.
export const upgradeCost = tier => ({ money: 600 * tier * tier, stone: 30 * tier, minLvl: tier * 2 });   // améliorations de la pioche / hache plus chères 💡
// Palier de pioche minimal par type de roche.
export const MIN_PICK = { rock: 1, rock_big: 1, boulder: 2 };
// Énergie par coup selon le palier de l'outil.
// Énergie par coup (abaissée : les coups sont plus lents, un arbre de base coûte 4 ⚡ au lieu de 8) 💡
export const energyCost = tier => (tier >= 3 ? 0.3 : 0.5);
// Un coup de hache ou de pioche à la fois : on attend la fin du geste (CFG.HIT_MS) avant le suivant.
export function hitReady(g) {
  const ms = CFG.HIT_MS, t = g.now();
  if (ms && g.lastHit != null && t - g.lastHit < ms) return false;
  g.lastHit = t; return true;
}
export const MINING_GAIN = { hit: 2, rock: 5, rock_big: 8, boulder: 15 };
