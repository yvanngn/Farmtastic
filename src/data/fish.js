// Poissons (💡 espèces, prix, saisons, heures) : où (etang = étang de la ferme, mer = plage, lac = lac gelé de la montagne),
// quand (saisons 0-3, heures en minutes), rareté (poids) et difficulté (vitesse du poisson dans le combat).
export const FISH = [
  { id: 'gardon', n: 'Gardon', i: '🐟', p: 20, zones: ['etang'], seasons: [0, 1, 2], from: 360, to: 1320, w: 10, diff: 1, size: [10, 25] },
  { id: 'carpe', n: 'Carpe', i: '🐟', p: 45, zones: ['etang'], seasons: [0, 1, 2, 3], from: 360, to: 1560, w: 6, diff: 1.6, size: [25, 70] },
  { id: 'brochet', n: 'Brochet', i: '🐊', p: 110, zones: ['etang'], seasons: [2, 3], from: 1080, to: 1560, w: 2, diff: 2.6, size: [50, 110] },
  { id: 'anguille', n: 'Anguille', i: '🐍', p: 90, zones: ['etang', 'mer'], seasons: [0, 1, 2, 3], from: 1260, to: 1560, w: 2, diff: 2.3, size: [40, 100] },
  { id: 'sardine', n: 'Sardine', i: '🐟', p: 18, zones: ['mer'], seasons: [0, 1, 2, 3], from: 360, to: 1140, w: 12, diff: .9, size: [10, 20] },
  { id: 'maquereau', n: 'Maquereau', i: '🐟', p: 35, zones: ['mer'], seasons: [0, 1], from: 360, to: 1260, w: 8, diff: 1.4, size: [20, 40] },
  { id: 'dorade', n: 'Dorade', i: '🐠', p: 60, zones: ['mer'], seasons: [1, 2], from: 480, to: 1080, w: 5, diff: 1.8, size: [25, 50] },
  { id: 'thon', n: 'Thon', i: '🐟', p: 160, zones: ['mer'], seasons: [1], from: 600, to: 960, w: 1, diff: 3, size: [80, 200] },
  { id: 'pieuvre', n: 'Pieuvre', i: '🐙', p: 140, zones: ['mer'], seasons: [2, 3], from: 1140, to: 1560, w: 1.5, diff: 2.8, size: [40, 120] },
  { id: 'omble', n: 'Omble des glaces', i: '🐟', p: 80, zones: ['lac'], seasons: [0, 1, 2, 3], from: 360, to: 1560, w: 6, diff: 1.9, size: [20, 50] },
  { id: 'truite_givre', n: 'Truite givrée', i: '🐟', p: 120, zones: ['lac'], seasons: [3], from: 360, to: 1080, w: 2, diff: 2.5, size: [30, 70] },
  { id: 'lotte_bleue', n: 'Lotte bleue', i: '🐡', p: 220, zones: ['lac'], seasons: [3], from: 1200, to: 1560, w: .6, diff: 3.2, size: [40, 90] }
];
export const ZONE_NAMES = { etang: "l'étang de la ferme", mer: 'la mer (plage)', lac: 'le lac gelé (montagne)' };
