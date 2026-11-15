// Scènes : la ferme (extérieur) et les intérieurs des bâtiments.
// Intérieurs décrits en texte : # mur, W mur (face, fenêtre), . sol, D porte, B lit,
// K plan de travail, T table, R tapis, P plante, C coffre, H mangeoire, N nid.
import { CFG } from '../config.js';

export const LAYOUTS = {
  house: [
    '############',
    '#WWWWWWWWWW#',
    '#KK.......B#',
    '#........PB#',
    '#..TT......#',
    '#..TT.RRR..#',
    '#.....RRR.C#',
    '#........EE#',
    '#####D######'
  ],
  coop: [
    '##########',
    '#WWWWWWWW#',
    '#HHHHHH.N#',
    '#.......N#',
    '#........#',
    '#........#',
    '####D#####'
  ],
  // Grange-tunnels : p planches (hache), r éboulis (pioche), E grand éboulement (plus tard), O torche
  grange: [
    '######################',
    '#WWWWWWWW#WWWWW#######',
    '#........p.....#######',
    '#........#.....#######',
    '#........#.....#######',
    '#........###.###WWWWW#',
    '#####D######.##......#',
    '############.r.......#',
    '###############.....E#',
    '###############......#',
    '######################'
  ],
  // Maison de Franck : rideaux tirés, fauteuil près de la fenêtre (A), lit (B)
  franck: [
    '#########',
    '#WWWWWWW#',
    '#B......#',
    '#B..AA..#',
    '#.......#',
    '#.......#',
    '####D####'
  ],
  // X cartons de déménagement
  luna: [
    '#########',
    '#WWWWWWW#',
    '#XX...PB#',
    '#X.....B#',
    '#..TT...#',
    '#.......#',
    '####D####'
  ],
  // G boue, Y foin
  pigsty: [
    '##########',
    '#WWWWWWWW#',
    '#HHHH..YY#',
    '#........#',
    '#.GGG....#',
    '#.GGG....#',
    '####D#####'
  ],
  barn: [
    '############',
    '#WWWWWWWWWW#',
    '#........YY#',
    '#........YY#',
    '#..........#',
    '#..........#',
    '#..........#',
    '#####D######'
  ]
};
// Centre du village (extérieur) : g herbe, . pavés, M halle du marché, O boulangerie, V boucherie, Z poissonnerie, Q panneau d'affichage,
// U magasin d'amélioration, J charpentier, A marchand d'animaux, F fontaine, T arbre, L lampadaire, b banc, f jardinière, D sortie vers la ferme.
function buildTown() {
  const W = 24, H = 22;
  const m = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x < 2 || x > 21 || y < 1 || y > 20 ? 'g' : '.')));
  const put = (ch, x0, y0, w = 1, h = 1) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) m[y][x] = ch; };
  put('D', 12, 0);
  for (const y of [1, 4, 7, 10, 13, 16, 19]) { put('T', 0, y); put('T', 23, y); }
  for (const x of [3, 9, 15, 21]) put('T', x, 21);
  put('M', 4, 2, 7, 3);       // halle du marché
  put('Q', 14, 3, 3, 1);      // panneau d'affichage, juste à côté
  put('U', 17, 2, 4, 3);      // magasin d'amélioration
  put('J', 4, 11, 4, 3);      // charpentier
  put('A', 17, 11, 3, 3);     // marchand d'animaux
  put('O', 4, 16, 4, 3);      // boulangerie
  put('V', 10, 16, 4, 3);     // boucherie
  put('Z', 17, 16, 4, 3);     // poissonnerie
  put('F', 11, 8, 3, 3);      // fontaine
  for (const [x, y] of [[3, 7], [20, 7], [3, 12], [20, 12]]) put('L', x, y);
  for (const [x, y] of [[8, 9], [16, 9], [8, 12], [16, 12]]) put('b', x, y);
  for (const [x, y] of [[2, 3], [21, 3], [2, 20], [21, 20]]) put('f', x, y);
  return m.map(r => r.join(''));
}
LAYOUTS.town = buildTown();
// Terres sauvages : 3 × 2 salles bordées d'arbres (T) et de rochers (#), passages entre salles, sortie D.
function buildWild() {
  const RW = 10, RH = 8, W = RW * 3, H = RH * 2;
  const m = Array.from({ length: H }, () => Array(W).fill('.'));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const lx = x % RW, ly = y % RH;
    if (lx === 0 || lx === RW - 1 || ly === 0 || ly === RH - 1) m[y][x] = 'T';
  }
  // passages : entre salles voisines, deux cases
  for (let ry = 0; ry < 2; ry++) for (let rx = 0; rx < 2; rx++) for (const dy of [3, 4]) { m[ry * RH + dy][rx * RW + RW - 1] = '.'; m[ry * RH + dy][(rx + 1) * RW] = '.'; }
  for (let rx = 0; rx < 3; rx++) for (const dx of [4, 5]) { m[RH - 1][rx * RW + dx] = '.'; m[RH][rx * RW + dx] = '.'; }
  m[4][0] = 'D'; // retour à la ferme
  // décor : quelques rochers et arbres dans les salles
  for (const [x, y, c] of [[3, 2, '#'], [6, 5, 'T'], [13, 2, '#'], [14, 2, '#'], [16, 5, 'T'], [23, 2, 'T'], [26, 5, '#'], [3, 11, 'T'], [7, 13, '#'], [12, 10, '#'], [16, 13, 'T'], [22, 10, '#'], [23, 10, '#'], [27, 13, 'T']]) m[y][x] = c;
  return m.map(r => r.join(''));
}
LAYOUTS.wild = buildWild();
export const SOLID_TILES = '#WDBKTPCHNYXMQUJAOVZFLfprE';  // A = fauteuil (Franck) / marchand d'animaux (village)
// Tuiles qui ouvrent une interface.
export const UI_TILES = { M: 'market', Q: 'board', U: 'upgrades', J: 'carpenter', A: 'animals', O: 'bakery', V: 'butcher', Z: 'fishmonger' };

export const SCENES = {
  farm: { W: CFG.W, H: CFG.H, doors: [
    { x: 5, y: 4, to: 'house', spawn: { x: 5.5, y: 7.4 } },
    { x: 24, y: 7, to: 'coop', spawn: { x: 4.5, y: 5.4 } },
    { x: 20, y: 7, to: 'pigsty', spawn: { x: 4.5, y: 5.4 } },
    { x: 28, y: 7, to: 'barn', spawn: { x: 5.5, y: 6.4 } },
    { x: 12, y: 4, to: 'grange', spawn: { x: 5.5, y: 5.2 } },
    { x: 27, y: 31, to: 'franck', spawn: { x: 4.5, y: 5.4 } },
    { x: 20, y: 31, to: 'luna', spawn: { x: 4.5, y: 5.4 } },
    { x: 47, y: 18, to: 'wild', spawn: { x: 1.6, y: 4.5 } },
    { x: 16, y: 35, to: 'town', spawn: { x: 12.5, y: 1.8 } }
  ] },
  town: { W: 24, H: 22, outdoor: true, doors: [{ x: 12, y: 0, to: 'farm', spawn: { x: 16.5, y: 34.4 } }] },
  house: { W: 12, H: 9, doors: [{ x: 5, y: 8, to: 'farm', spawn: { x: 5.5, y: 5.9 } }] },
  coop: { W: 10, H: 7, doors: [{ x: 4, y: 6, to: 'farm', spawn: { x: 24.5, y: 8.9 } }] },
  wild: { W: 30, H: 16, outdoor: true, rooms: { w: 10, h: 8 }, doors: [{ x: 0, y: 4, to: 'farm', spawn: { x: 46.4, y: 18.5 } }] },
  grange: { W: 22, H: 11, dark: true, doors: [{ x: 5, y: 6, to: 'farm', spawn: { x: 12.5, y: 5.6 } }] },
  franck: { W: 9, H: 7, doors: [{ x: 4, y: 6, to: 'farm', spawn: { x: 27.5, y: 32.6 } }] },
  luna: { W: 9, H: 7, doors: [{ x: 4, y: 6, to: 'farm', spawn: { x: 20.5, y: 32.6 } }] },
  pigsty: { W: 10, H: 7, doors: [{ x: 4, y: 6, to: 'farm', spawn: { x: 20.5, y: 8.9 } }] },
  barn: { W: 12, H: 8, doors: [{ x: 5, y: 7, to: 'farm', spawn: { x: 28.5, y: 8.9 } }] }
};

export const tileAt = (scene, x, y) => (LAYOUTS[scene] && LAYOUTS[scene][y] && LAYOUTS[scene][y][x]) || '#';
export const doorAt = (scene, x, y) => SCENES[scene].doors.find(d => d.x === x && d.y === y) || null;
