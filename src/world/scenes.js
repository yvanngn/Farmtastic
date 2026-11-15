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
  clinique: [
    '#########',
    '#WWWWWWW#',
    '#m.n..cc#',
    '#m.n....#',
    '#.......#',
    '#.......#',
    '####D####'
  ],
  hailey: [
    '#########',
    '#WWWWWWW#',
    '#B....PK#',
    '#B......#',
    '#..TT...#',
    '#.......#',
    '####D####'
  ],
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
// U magasin d'amélioration, W villa du maire, J charpentier, A marchand d'animaux, F fontaine, T arbre, L lampadaire, b banc, f jardinière, D sortie vers la ferme.
function buildTown() {
  const W = 24, H = 28;
  const m = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x < 2 || x > 21 || y < 1 || y > 20 ? 'g' : '.')));
  const put = (ch, x0, y0, w = 1, h = 1) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) m[y][x] = ch; };
  put('D', 0, 10); put('.', 1, 10);   // entrée à l'ouest : la route qui vient de la ferme
  for (const y of [1, 4, 7, 13, 16, 19]) { put('T', 0, y); put('T', 23, y); }
  put('T', 23, 10);
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
  put('W', 9, 22, 6, 4);      // villa de Manuel, le maire
  for (const [x, y] of [[3, 7], [20, 7], [3, 12], [20, 12]]) put('L', x, y);
  for (const [x, y] of [[8, 9], [16, 9], [8, 12], [16, 12]]) put('b', x, y);
  for (const [x, y] of [[2, 3], [21, 3], [2, 20], [21, 20]]) put('f', x, y);
  // au sud de la place : deux allées qui contournent la villa du maire (W) et se rejoignent devant
  for (let y = 21; y <= 26; y++) { m[y][8] = '.'; m[y][16] = '.'; }
  for (let x = 8; x <= 16; x++) m[26][x] = '.';
  for (const y of [22, 25]) { m[y][0] = 'T'; m[y][23] = 'T'; }
  for (const x of [2, 5, 18, 21]) m[27][x] = 'T';
  return m.map(r => r.join(''));
}
LAYOUTS.town = buildTown();
// Quartier : g herbe, . pavés, X maison (Luna x4-8, Franck x11-15, y4-6), T arbre, D sortie vers la ferme, b banc, f jardinière.
LAYOUTS.quartier = (() => {
  const W = 38, H = 16, m = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || x === W - 1 || y === H - 1 ? 'T' : 'g')));
  for (let x = 1; x < W - 1; x++) { m[8][x] = '.'; m[9][x] = '.'; }   // la rue
  for (let y = 0; y < 8; y++) m[y][22] = '.';                          // l'allée qui monte vers la ferme
  m[0][22] = 'D'; for (const x of [6, 13]) m[7][x] = '.';              // devant les portes
  for (let y = 4; y <= 6; y++) for (let x = 4; x <= 8; x++) m[y][x] = 'X';
  for (let y = 4; y <= 6; y++) for (let x = 11; x <= 15; x++) m[y][x] = 'X';
  for (let y = 4; y <= 6; y++) for (let x = 18; x <= 21; x++) m[y][x] = 'X';   // clinique
  m[7][19] = '.';
  for (let y = 4; y <= 6; y++) for (let x = 24; x <= 27; x++) m[y][x] = 'X';   // maison de Hailey
  m[7][25] = '.';
  for (const x of [2, 10, 18, 26, 34]) m[11][x] = 'T';
  // Myst, à l'écart : une rangée d'arbres, puis sa vieille maison au fond (x31-36, y2-4, porche y5, porte x33)
  for (let y = 1; y <= 6; y++) m[y][29] = 'T';
  for (let y = 2; y <= 5; y++) for (let x = 31; x <= 36; x++) m[y][x] = (y === 5 && x === 33) ? '.' : 'X';
  for (let y = 6; y <= 7; y++) m[y][33] = '.';
  for (let x = 0; x < W; x++) if (m[0][x] === 'g' && ![4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 22].includes(x)) m[0][x] = 'T';
  return m.map(r => r.join(''));
})();
// Caverne sombre, étage 1 : 5 × 3 salles de 10 × 8 séparées par des parois (T), passages de 2 cases,
// piliers rocheux (#), sortie D juste à l'arrivée, escalier S vers l'étage suivant (bloqué pour l'instant).
export const CAVE = { RX: 5, RY: 3, RW: 10, RH: 8 };
function buildWild() {
  const { RX, RY, RW, RH } = CAVE, W = RW * RX, H = RH * RY;
  const m = Array.from({ length: H }, () => Array(W).fill('.'));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const lx = x % RW, ly = y % RH;
    if (lx === 0 || lx === RW - 1 || ly === 0 || ly === RH - 1) m[y][x] = 'T';
  }
  // passages entre salles voisines (certains fermés, pour faire un vrai labyrinthe)
  const shut = new Set(['h1,0', 'h3,1', 'v2,0', 'h0,2', 'v4,1']);
  for (let ry = 0; ry < RY; ry++) for (let rx = 0; rx < RX - 1; rx++) if (!shut.has(`h${rx},${ry}`)) for (const dy of [3, 4]) { m[ry * RH + dy][rx * RW + RW - 1] = '.'; m[ry * RH + dy][(rx + 1) * RW] = '.'; }
  for (let ry = 0; ry < RY - 1; ry++) for (let rx = 0; rx < RX; rx++) if (!shut.has(`v${rx},${ry}`)) for (const dx of [4, 5]) { m[ry * RH + RH - 1][rx * RW + dx] = '.'; m[(ry + 1) * RH][rx * RW + dx] = '.'; }
  m[4][0] = 'D'; // sortie, juste à l'arrivée
  // piliers rocheux : quelques-uns par salle, à des places fixes (jamais devant un passage)
  for (let ry = 0; ry < RY; ry++) for (let rx = 0; rx < RX; rx++) {
    const k = rx * 7 + ry * 11;
    for (const [lx, ly] of [[2 + k % 3, 2], [6 + (k >> 1) % 2, 5], [3, 5 + k % 2]]) if ((k + lx) % 3 && !(rx === 0 && ry === 0 && lx < 4)) m[ry * RH + ly][rx * RW + lx] = '#';
  }
  m[(RY - 1) * RH + 4][(RX - 1) * RW + 5] = 'S'; // escalier vers l'étage 2 (plus tard)
  return m.map(r => r.join(''));
}
LAYOUTS.wild = buildWild();
// Forêt à côté de la ferme (ouest) : grands arbres (T), clairières, sortie D vers la ferme.
function buildForest() {
  const W = 30, H = 18;
  const m = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1 ? 'T' : '.')));
  // bosquets : positions fixes pour une forêt dense mais praticable
  const groves = [[3, 3], [7, 2], [12, 4], [17, 2], [22, 4], [25, 7], [4, 8], [9, 10], [14, 8], [19, 11], [24, 13], [5, 14], [11, 14], [16, 15], [21, 15], [27, 12], [2, 11], [8, 6], [13, 12], [20, 7]];
  for (const [x, y] of groves) { m[y][x] = 'T'; if (x + 1 < W - 1 && (x + y) % 3) m[y][x + 1] = 'T'; if (y + 1 < H - 1 && (x * y) % 4 === 0) m[y + 1][x] = 'T'; }
  const keep = [[9, 7], [18, 13], [5, 12]]; // lieux de promenade des habitants
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++)
    if ((x * 13 + y * 7) % 9 === 0 && y !== 9 && !keep.some(([a, b]) => Math.abs(a - x) + Math.abs(b - y) < 2)) m[y][x] = 'T';
  for (let x = 24; x < W - 1; x++) m[9][x] = '.';
  m[9][W - 1] = 'D';
  return m.map(r => r.join(''));
}
LAYOUTS.foret = buildForest();
export const SOLID_TILES = '#WDBKTPCHNYXMQUJAOVZFLfprEmnc';   // m n lits de la clinique, c bureau  // A = fauteuil (Franck) / marchand d'animaux (village)
// Tuiles qui ouvrent une interface.
export const UI_TILES = { M: 'market', Q: 'board', U: 'upgrades', J: 'carpenter', A: 'animals', O: 'bakery', V: 'butcher', Z: 'fishmonger' };

export const SCENES = {
  farm: { W: CFG.W, H: CFG.H, doors: [
    { x: 5, y: 4, to: 'house', spawn: { x: 5.5, y: 7.4 } },
    { x: 24, y: 7, to: 'coop', spawn: { x: 4.5, y: 5.4 } },
    { x: 20, y: 7, to: 'pigsty', spawn: { x: 4.5, y: 5.4 } },
    { x: 28, y: 7, to: 'barn', spawn: { x: 5.5, y: 6.4 } },
    { x: 12, y: 4, to: 'grange', spawn: { x: 5.5, y: 5.2 } },
    { x: 0, y: 10, to: 'foret', spawn: { x: 28.2, y: 9.6 } },
    { x: 47, y: 18, to: 'wild', spawn: { x: 1.6, y: 4.5 } },
    { x: 16, y: 35, to: 'quartier', spawn: { x: 22.5, y: 1.8 } },
    { x: 47, y: 5, to: 'town', spawn: { x: 1.6, y: 10.6 } }
  ] },
  town: { W: 24, H: 28, outdoor: true, doors: [{ x: 0, y: 10, to: 'farm', spawn: { x: 45.6, y: 5.6 } }] },
  house: { W: 12, H: 9, doors: [{ x: 5, y: 8, to: 'farm', spawn: { x: 5.5, y: 5.9 } }] },
  coop: { W: 10, H: 7, doors: [{ x: 4, y: 6, to: 'farm', spawn: { x: 24.5, y: 8.9 } }] },
  foret: { W: 30, H: 18, outdoor: true, doors: [{ x: 29, y: 9, to: 'farm', spawn: { x: 1.6, y: 10.6 } }] },
  wild: { W: 50, H: 24, dark: true, cave: true, rooms: { w: 10, h: 8 }, doors: [{ x: 0, y: 4, to: 'farm', spawn: { x: 46.4, y: 18.5 } }] },
  grange: { W: 22, H: 11, dark: true, doors: [{ x: 5, y: 6, to: 'farm', spawn: { x: 12.5, y: 5.6 } }] },
  franck: { W: 9, H: 7, doors: [{ x: 4, y: 6, to: 'quartier', spawn: { x: 13.5, y: 7.8 } }] },
  clinique: { W: 9, H: 7, doors: [{ x: 4, y: 6, to: 'quartier', spawn: { x: 19.5, y: 7.8 } }] },
  hailey: { W: 9, H: 7, doors: [{ x: 4, y: 6, to: 'quartier', spawn: { x: 25.5, y: 7.8 } }] },
  luna: { W: 9, H: 7, doors: [{ x: 4, y: 6, to: 'quartier', spawn: { x: 6.5, y: 7.8 } }] },
  // Quartier résidentiel, au sud de la ferme : les maisons des habitants.
  quartier: { W: 38, H: 16, outdoor: true, doors: [{ x: 22, y: 0, to: 'farm', spawn: { x: 16.5, y: 34.4 } }, { x: 6, y: 6, to: 'luna', spawn: { x: 4.5, y: 5.4 } }, { x: 13, y: 6, to: 'franck', spawn: { x: 4.5, y: 5.4 } }, { x: 19, y: 6, to: 'clinique', spawn: { x: 4.5, y: 5.4 } }, { x: 25, y: 6, to: 'hailey', spawn: { x: 4.5, y: 5.4 } }] },
  pigsty: { W: 10, H: 7, doors: [{ x: 4, y: 6, to: 'farm', spawn: { x: 20.5, y: 8.9 } }] },
  barn: { W: 12, H: 8, doors: [{ x: 5, y: 7, to: 'farm', spawn: { x: 28.5, y: 8.9 } }] }
};

export const tileAt = (scene, x, y) => (LAYOUTS[scene] && LAYOUTS[scene][y] && LAYOUTS[scene][y][x]) || '#';
export const doorAt = (scene, x, y) => SCENES[scene].doors.find(d => d.x === x && d.y === y) || null;
