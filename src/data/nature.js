// Nature : fleurs à cueillir, cailloux et filons à piocher, partout sauf en ville.
// Filons : du cuivre (courant) à l'or (rare). Même nombre de coups quel que soit le minerai.
export const VEINS = {
  // 20/11 : minerais de base (cuivre, zinc), métaux ferreux (fer, cobalt, nickel), précieux (argent, or) ;
  // niveau de minage requis : NEED.vein (src/data/tools.js). w = chance relative d'apparition 💡
  copper: { n: 'Filon de cuivre', ore: 'copper_ore', w: 40, c: '#d07a3a' },
  zinc: { n: 'Filon de zinc', ore: 'zinc_ore', w: 30, c: '#a8b4bc' },
  iron: { n: 'Filon de fer', ore: 'iron_ore', w: 14, c: '#6a5048' },
  cobalt: { n: 'Filon de cobalt', ore: 'cobalt_ore', w: 7, c: '#3a5ac8' },
  nickel: { n: 'Filon de nickel', ore: 'nickel_ore', w: 5, c: '#b8b090' },
  silver: { n: "Filon d'argent", ore: 'silver_ore', w: 3, c: '#e8eef4' },
  gold: { n: "Filon d'or", ore: 'gold_ore', w: 1, c: '#f2c832' },
  tin: { n: "Filon d'étain", ore: 'tin_ore', w: 0, c: '#c8ccd2' }   // anciennes parties seulement (n'apparaît plus)
};
export const VEIN_HP = 16;         // coups de pioche (pioche de base) ; un caillou en demande 4
export const VEIN_ORE = [2, 4];    // minerais par filon
export const ROCK_HP = 6;
// Par lieu : fleurs du jour, cailloux et filons au maximum, nouveaux par jour.
export const NATURE = {
  farm: { flowers: 6, rocks: 0, rocksDay: 0, veins: 0, veinP: 0 },   // 19/11 : plus de cailloux à la ferme, tout est à la carrière
  carriere: { flowers: 0, rocks: 90, rocksDay: 12, veins: 5, veinP: 0.3, rich: 0.4, richVein: 0.5 },   // lot 29 : grand dédale (💡 90 cailloux au plus, 12 par jour) ; 21/11 : filons rares et précieux (5 au plus, une chance sur 3 d'en voir un nouveau chaque jour, plutôt dans les grandes salles)   // 19/11 : la carrière vidée se remplit petit à petit (6 cailloux par jour)
  dedale: { flowers: 10, rocks: 80, rocksDay: 10, veins: 8, veinP: 0.5, veinW: { copper: 26, zinc: 22, iron: 22, cobalt: 12, nickel: 9, silver: 6, gold: 3 } },   // lot 30b : premier sous-sol, filons un peu moins rares 💡
  foret: { flowers: 8, rocks: 12, rocksDay: 2, veins: 2, veinP: 0.5 },
  montagne: { flowers: 0, rocks: 8, rocksDay: 3, veins: 5, veinP: 0.9 },   // plus de filons qu'ailleurs
  plage: { flowers: 0, rocks: 3, rocksDay: 1, veins: 0, veinP: 0 },
  wild: { flowers: 0, rocks: 0, rocksDay: 0, veins: 6, veinP: 0.9 }   // pas de fleurs dans la caverne
};
export const P_RARE_FLOWER = 0.15, P_MID_FLOWER = 0.35;
// Arc-en-ciel : certains jours de pluie, un trésor au pied de l'arc (sur la ferme).
export const RAINBOW = { p: 0.35, from: [780, 960], length: 180, money: [150, 400] };
