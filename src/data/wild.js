// Zone de combat façon Zelda Game Boy : « la Caverne sombre » (la « mine »), étage 1.
// 5 × 3 salles de 10 × 8 cases ; la caméra reste dans la salle du joueur. D'autres étages viendront.
export const ROOM_W = 10, ROOM_H = 8, ROOMS_X = 5, ROOMS_Y = 3;
export const CAVE_FLOOR = 1;
export const MOBS = {
  slime_v: { n: 'Slime vert', hp: 60, speed: 1.1, dmg: 10, drop: 'slime', color: '#56c45a' },
  slime_b: { n: 'Slime bleu', hp: 100, speed: 1.7, dmg: 15, drop: 'slime', color: '#4a8ae0' },
  pig: { n: 'Cochon qui tire', hp: 90, speed: 1.0, dmg: 10, shot: 12, reload: 2.2, money: [5, 15] }
};
// Monstres de chaque salle (index = y * 3 + x), réapparaissent quand on revient dans la salle.
export const ROOM_MOBS = [
  ['slime_v'], ['slime_v', 'slime_v'], ['slime_v', 'slime_b'], ['pig', 'slime_v'], ['slime_b', 'slime_b'],
  ['slime_v', 'slime_v', 'slime_b'], ['pig', 'slime_b'], ['slime_b', 'slime_b', 'slime_v'], ['pig', 'pig'], ['slime_b', 'pig', 'slime_b'],
  ['slime_v', 'pig'], ['slime_b', 'slime_b', 'pig'], ['pig', 'pig', 'slime_v'], ['slime_b', 'slime_b', 'slime_b'], ['pig', 'pig', 'slime_b', 'slime_b']
];
// Cailloux : 3 types (le 2 est rare, le 3 encore plus) ; minerais rares, plus fréquents sur 2 et 3.
export const ZROCKS = {
  zrock1: { n: 'Caillou', hp: 4, stone: 1, ore: 0.02 },
  zrock2: { n: 'Caillou veiné', hp: 6, stone: 2, ore: 0.08 },
  zrock3: { n: 'Caillou cristallin', hp: 8, stone: 3, ore: 0.2 }
};
export const ZROCK_COUNT = 34, ZROCK_P3 = 0.06, ZROCK_P2 = 0.25;
export const ORES = ['ruby', 'emerald'];
// Entrée : l'entrée de la caverne, tout à l'est de la ferme (fermée au début).
export const GATE = { x: 29, y: 9 };   // au bout de la forêt (scène « foret »)
