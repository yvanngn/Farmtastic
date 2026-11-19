// Nature : fleurs à cueillir, cailloux et filons à piocher, partout sauf en ville.
// Filons : du cuivre (courant) à l'or (rare). Même nombre de coups quel que soit le minerai.
export const VEINS = {
  copper: { n: 'Filon de cuivre', ore: 'copper_ore', w: 50, c: '#d07a3a' },
  tin: { n: "Filon d'étain", ore: 'tin_ore', w: 28, c: '#c8ccd2' },
  iron: { n: 'Filon de fer', ore: 'iron_ore', w: 16, c: '#6a5048' },
  gold: { n: "Filon d'or", ore: 'gold_ore', w: 6, c: '#f2c832' }
};
export const VEIN_HP = 16;         // coups de pioche (pioche de base) ; un caillou en demande 4
export const VEIN_ORE = [2, 4];    // minerais par filon
export const ROCK_HP = 6;
// Par lieu : fleurs du jour, cailloux et filons au maximum, nouveaux par jour.
export const NATURE = {
  farm: { flowers: 6, rocks: 0, rocksDay: 0, veins: 0, veinP: 0 },   // 19/11 : plus de cailloux à la ferme, tout est à la carrière
  carriere: { flowers: 0, rocks: 40, rocksDay: 3, veins: 3, veinP: 0.6 },   // 19/11 : 3 cailloux de plus par jour
  carriere2: { flowers: 0, rocks: 16, rocksDay: 3, veins: 8, veinP: 1, veinW: { tin: 15, iron: 50, gold: 35 } },   // carrière profonde : filons rares
  foret: { flowers: 8, rocks: 12, rocksDay: 2, veins: 2, veinP: 0.5 },
  montagne: { flowers: 0, rocks: 8, rocksDay: 3, veins: 5, veinP: 0.9 },   // plus de filons qu'ailleurs
  plage: { flowers: 0, rocks: 3, rocksDay: 1, veins: 0, veinP: 0 },
  wild: { flowers: 0, rocks: 0, rocksDay: 0, veins: 6, veinP: 0.9 }   // pas de fleurs dans la caverne
};
export const P_RARE_FLOWER = 0.15, P_MID_FLOWER = 0.35;
// Arc-en-ciel : certains jours de pluie, un trésor au pied de l'arc (sur la ferme).
export const RAINBOW = { p: 0.35, from: [780, 960], length: 180, money: [150, 400] };
