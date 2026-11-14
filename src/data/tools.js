// Paliers d'outils et niveaux de minage.
export const TIER_NAMES = ['', 'Base', 'Cuivre', 'Fer', 'Or', 'Iridium'];
export const MAX_TIER = 5;
export const UPGRADABLE = ['axe', 'pick', 'sickle', 'sword'];
// XP totale pour atteindre le niveau i+1 (niveau 1 à 10).
export const MINING_XP = [0, 30, 80, 160, 280, 450, 700, 1000, 1400, 2000];
// Coût pour passer du palier `tier` au suivant.
export const upgradeCost = tier => ({ money: 250 * tier * tier, stone: 15 * tier, minLvl: tier * 2 });
// Palier de pioche minimal par type de roche.
export const MIN_PICK = { rock: 1, boulder: 2 };
// Énergie par coup selon le palier de l'outil.
export const energyCost = tier => (tier >= 3 ? 0.5 : 1);
export const MINING_GAIN = { hit: 2, rock: 5, boulder: 15 };
