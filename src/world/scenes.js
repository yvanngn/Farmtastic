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
    '#..........#',
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
  ]
};
// Centre du village (extérieur) : g herbe, . pavés, M halle du marché, Q panneau d'affichage,
// U magasin d'amélioration, J charpentier, A marchand d'animaux, F fontaine, T arbre, L lampadaire, b banc, f jardinière, D sortie vers la ferme.
function buildTown() {
  const W = 24, H = 16;
  const m = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x < 2 || x > 21 || y < 1 || y > 14 ? 'g' : '.')));
  const put = (ch, x0, y0, w = 1, h = 1) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) m[y][x] = ch; };
  put('D', 12, 0);
  for (const y of [1, 4, 7, 10, 13]) { put('T', 0, y); put('T', 23, y); }
  for (const x of [3, 7, 17, 21]) put('T', x, 15);
  put('M', 4, 2, 7, 3);       // halle du marché
  put('Q', 14, 3, 3, 1);      // panneau d'affichage, juste à côté
  put('U', 17, 2, 4, 3);      // magasin d'amélioration
  put('J', 4, 11, 4, 3);      // charpentier
  put('A', 17, 11, 3, 3);     // marchand d'animaux
  put('F', 11, 8, 3, 3);      // fontaine
  for (const [x, y] of [[3, 7], [20, 7], [3, 12], [20, 12]]) put('L', x, y);
  for (const [x, y] of [[8, 9], [16, 9], [8, 12], [16, 12]]) put('b', x, y);
  for (const [x, y] of [[2, 3], [21, 3], [2, 14], [21, 14]]) put('f', x, y);
  return m.map(r => r.join(''));
}
LAYOUTS.town = buildTown();
export const SOLID_TILES = '#WDBKTPCHNMQUJAFLf';
// Tuiles qui ouvrent une interface.
export const UI_TILES = { M: 'market', Q: 'board', U: 'upgrades', J: 'carpenter', A: 'animals' };

export const SCENES = {
  farm: { W: CFG.W, H: CFG.H, doors: [
    { x: 5, y: 4, to: 'house', spawn: { x: 5.5, y: 7.4 } },
    { x: 24, y: 7, to: 'coop', spawn: { x: 4.5, y: 5.4 } },
    { x: 16, y: 35, to: 'town', spawn: { x: 12.5, y: 1.8 } }
  ] },
  town: { W: 24, H: 16, outdoor: true, doors: [{ x: 12, y: 0, to: 'farm', spawn: { x: 16.5, y: 34.4 } }] },
  house: { W: 12, H: 9, doors: [{ x: 5, y: 8, to: 'farm', spawn: { x: 5.5, y: 5.9 } }] },
  coop: { W: 10, H: 7, doors: [{ x: 4, y: 6, to: 'farm', spawn: { x: 24.5, y: 8.9 } }] }
};

export const tileAt = (scene, x, y) => (LAYOUTS[scene] && LAYOUTS[scene][y] && LAYOUTS[scene][y][x]) || '#';
export const doorAt = (scene, x, y) => SCENES[scene].doors.find(d => d.x === x && d.y === y) || null;
