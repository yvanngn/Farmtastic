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
  // 18/11 : la cabane agrandie (quête secondaire « Agrandir la cabane ») : plus grande, plus de place pour les meubles
  maison: [
    '################',
    '#WWWWWWWWWWWWWW#',
    '#KK......P....B#',
    '#.............B#',
    '#..TT.....RRR..#',
    '#..TT.....RRR..#',
    '#.........RRR.C#',
    '#P.............#',
    '#.........EE...#',
    '#..............#',
    '#######D########'
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
  // Bar d'Ed : comptoir (K), tonneaux (Z), tables (T), plante (P)
  bar: [   // 19/11 : vrai saloon — scène (X), comptoir (K) avec Ed derrière, tables (T), toilettes (u)
    '################',
    '#WWWWWWWWWWWWWW#',
    '#XXXXX.........#',
    '#XXXXX..KKKKKK.#',
    '#XXXXX.........#',
    '#..............#',
    '#.TT...TT......#',
    '#...........uu.#',
    '#.TT...TT...uu.#',
    '#...........uu.#',
    '#######D########'
  ],
  // Maison d'Ed (rez-de-chaussée) : cuisine (K), table (T), fauteuil (A), escalier (e) vers l'étage
  ed: [
    '#########',
    '#WWWWWWW#',
    '#KK...Ae#',
    '#.......#',
    '#..TT..P#',
    '#.......#',
    '####D####'
  ],
  // Étage : chambre d'Ed et Suzie (B), chambre de Jade (m, petit lit), coffre à jouets (C), escalier (e)
  ed_etage: [
    '#########',
    '#WWWWWWW#',
    '#BB..m.e#',
    '#BB..m..#',
    '#.......#',
    '#C......#',
    '#########'
  ],
  // Restaurant (lot 5) : la salle à gauche (tables T, plante P), la cuisine à droite derrière une cloison (#) ouverte :
  // four (O, en panne au début), plan de travail (K), étagère (C)
  resto: [
    '##############',
    '#WWWWWWW#WWWW#',
    '#.......#OKKC#',
    '#.TT.........#',
    '#.......#....#',
    '#P......#....#',
    '######D#######'
  ],
  // Maison de Remy Gusto : cuisine de chef (K), table (T), lit (B), plante (P)
  remy: [
    '#########',
    '#WWWWWWW#',
    '#KKK...B#',
    '#......B#',
    '#P.TT...#',
    '#.......#',
    '####D####'
  ],
  // Lot 12 : cabane de Rouky, le vieux pêcheur (lit B, table T, filets et cannes C, poêle K)
  rouky: [
    '#########',
    '#WWWWWWW#',
    '#K....CB#',
    '#......B#',
    '#.TT...P#',
    '#.......#',
    '####D####'
  ],
  // Maison du Maire au ranch : bureau (K), fauteuil (A), lit (B), plante (P), table (T)
  ranch_maison: [
    '#########',
    '#WWWWWWW#',
    '#KK..A.B#',
    '#......B#',
    '#P.TT...#',
    '#.......#',
    '####D####'
  ],
  // Maison de Myst : sombre, bibliothèque (K), fauteuil (A), lit (B), plante (P) ; la pièce secrète viendra plus tard
  myst: [
    '#########',
    '#WWWWWWW#',
    '#KK..A.B#',
    '#......B#',
    '#P.TT...#',
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
// Centre-ville réorganisé (16/11) : bâtiments espacés, pelouses entre eux, une grande rue (y10-11),
// une rue des commerces au sud (y24), une avenue (x20-21) qui descend jusqu'à la villa du maire.
export const TOWN_B = {
  M: { x: 3, y: 2, w: 7, h: 3 }, Q: { x: 12, y: 4, w: 3, h: 1 }, U: { x: 25, y: 2, w: 4, h: 3 },
  F: { x: 15, y: 6, w: 3, h: 3 }, J: { x: 3, y: 13, w: 4, h: 3 }, A: { x: 27, y: 13, w: 3, h: 3 },
  O: { x: 3, y: 20, w: 4, h: 3 }, V: { x: 13, y: 20, w: 4, h: 3 }, Z: { x: 26, y: 20, w: 4, h: 3 },
  R: { x: 9, y: 13, w: 4, h: 3 },   // 16/11 : le bar d'Ed (porte x11)
  E: { x: 3, y: 26, w: 4, h: 3 },   // Farmwest (7c) : bureau du shérif (décor)
  Y: { x: 13, y: 26, w: 5, h: 3 }   // Farmwest (lot 5) : le restaurant (porte x15), à la place de l'ancienne villa
};
export const TOWN_LAMPS = [[10, 8], [23, 8], [8, 12], [23, 12], [10, 25], [24, 25]];
function buildTown() {
  const W = 34, H = 32;
  const m = Array.from({ length: H }, () => Array(W).fill('g'));
  const pave = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) m[y][x] = '.'; };
  const put = (ch, x0, y0, w = 1, h = 1) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) m[y][x] = ch; };
  pave(0, 10, W - 1, 11);                 // grande rue (ouest → est)
  pave(12, 5, 21, 9);                     // place de la fontaine
  pave(2, 24, 31, 24);                    // rue des commerces
  pave(18, 29, 19, 29);   // trottoir du restaurant jusqu'à l'avenue
  pave(20, 12, 21, 30);   // avenue jusqu'à la sortie sud (pont → station balnéaire) ; la villa du Maire est effacée (il vit au ranch)
  for (const k of 'MUJAOVZRYE') { const b = TOWN_B[k]; pave(b.x - 1, b.y + b.h, b.x + b.w, b.y + b.h); }   // trottoir devant chaque porte
  pave(6, 5, 6, 9); pave(26, 5, 26, 9);   // halle et magasin → grande rue
  pave(7, 12, 7, 16); pave(30, 12, 30, 16); pave(4, 17, 4, 19); pave(28, 17, 28, 19); pave(15, 12, 15, 19);   // ruelles
  for (const [k, b] of Object.entries(TOWN_B)) put(k, b.x, b.y, b.w, b.h);
  put('D', 20, H - 1); put('D', 21, H - 1);   // au sud : le pont vers la station balnéaire
  put('D', 0, 10); put('D', W - 1, 10); put('g', 0, 11); put('g', W - 1, 11);   // Farmwest : à l'ouest la gare, à l'est le pont vers le rond-point
  for (let y = 0; y < H; y++) for (const x of [0, W - 1]) if (m[y][x] === 'g' || (m[y][x] === '.' && y !== 10)) m[y][x] = y % 3 === 1 ? 'T' : 'h';   // bordures : arbres et haies
  for (let x = 0; x < W; x++) for (const y of [0, H - 1]) if (m[y][x] === 'g' || (m[y][x] === '.' && m[y][x] !== 'D')) m[y][x] = x % 3 === 0 ? 'T' : 'h';
  for (const [x, y] of [[9, 3], [23, 3], [10, 15], [24, 15], [9, 21], [23, 21], [8, 28], [26, 28], [12, 14], [18, 16]]) if (m[y][x] === 'g') m[y][x] = 'T';
  for (const [x, y] of TOWN_LAMPS) put('L', x, y);
  for (const [x, y] of [[13, 5], [19, 5], [12, 9], [20, 9]]) put('b', x, y);
  for (const [x, y] of [[11, 2], [22, 2], [2, 26], [31, 26], [12, 22], [24, 22]]) if (m[y][x] === 'g') put('f', x, y);
  // Farmwest (7b) : le centre-ville sur son plateau — falaise en terrasses au nord (^), rivière à l'est et au sud (w), ponts en bois (=)
  for (let x = 0; x < W; x++) { m[0][x] = '^'; m[1][x] = '^'; }
  for (let y = 2; y < H; y++) m[y][W - 2] = y === 10 ? '=' : 'w';
  for (let x = 0; x < W - 1; x++) m[H - 2][x] = (x === 20 || x === 21) ? '=' : 'w';
  for (let y = 2; y < H - 1; y++) m[y][1] = y === 10 ? '=' : 'w';   // lot 2e : rivière à l'ouest aussi (le centre-ville est entouré d'eau), pont vers la gare
  return m.map(r => r.join(''));
}
LAYOUTS.town = buildTown();
// Parc d'attractions abandonné… ou presque (caché : au nord de la zone de la caverne, par une trouée secrète de la forêt).
// Chaque attraction : lettre, position (coin haut-gauche), taille. L'entrée est en bas.
export const PARC_B = {
  R: { x: 3, y: 2, w: 6, h: 6, n: 'Grande roue' }, I: { x: 13, y: 3, w: 5, h: 4, n: 'Carrousel' },
  x: { x: 21, y: 2, w: 10, h: 5, n: 'Montagnes russes' }, y: { x: 3, y: 12, w: 6, h: 4, n: 'Autos tamponneuses' },
  z: { x: 13, y: 12, w: 3, h: 2, n: 'Chamboule-tout' }, q: { x: 18, y: 12, w: 3, h: 2, n: 'Stand de tir' },
  j: { x: 24, y: 11, w: 6, h: 5, n: 'Maison hantée' }, u: { x: 13, y: 17, w: 2, h: 2, n: 'Barbe à papa' }
};
LAYOUTS.parc = (() => {
  const W = 34, H = 24, m = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1 ? 'T' : 'g')));
  const pave = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) m[y][x] = '.'; };
  pave(1, 9, W - 2, 10); pave(1, 19, W - 2, 20); pave(16, 9, 17, H - 1); pave(11, 1, 11, 20); pave(22, 8, 22, 10);
  for (const [k, b] of Object.entries(PARC_B)) { pave(b.x - 1, b.y + b.h, b.x + b.w, b.y + b.h); for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) m[y][x] = k; }
  m[H - 1][16] = 'D'; m[H - 1][17] = 'D';
  for (const [x, y] of [[2, 18], [8, 21], [26, 21], [31, 18], [31, 8], [20, 16]]) if (m[y][x] === 'g') m[y][x] = 'T';
  return m.map(r => r.join(''));
})();
// Montagne gelée (à l'est du quartier) : n neige, . sentier, T sapins enneigés, G grotte (on ne peut pas y entrer), w lac gelé (trous de pêche).
LAYOUTS.montagne = (() => {
  const W = 36, H = 24, m = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1 ? 'T' : 'n')));
  for (let x = 0; x < 30; x++) { m[8][x] = '.'; m[9][x] = '.'; } m[8][0] = 'D'; m[9][0] = 'D';
  for (let y = 5; y < 8; y++) { m[y][28] = '.'; m[y][29] = '.'; }
  for (let y = 1; y <= 4; y++) for (let x = 25; x <= 32; x++) m[y][x] = 'G';                 // paroi rocheuse et grotte
  for (let y = 14; y <= 19; y++) for (let x = 7; x <= 16; x++) if (Math.hypot((x - 11.5) / 5, (y - 16.5) / 3) < 1) m[y][x] = 'w';   // lac gelé
  for (let y = 10; y <= 14; y++) m[y][11] = '.';
  for (let y = 10; y < H; y++) { m[y][28] = '.'; m[y][29] = '.'; } m[H - 1][28] = 'D'; m[H - 1][29] = 'D';   // lot 2e : la route de l'est descend vers le port
  for (const [x, y] of [[4, 3], [9, 4], [15, 2], [20, 5], [5, 12], [21, 13], [24, 18], [31, 15], [32, 20], [3, 18], [19, 20], [27, 11], [33, 7]]) m[y][x] = 'T';
  return m.map(r => r.join(''));
})();
// Plage (au nord du centre-ville) : w mer, a sable mouillé, s sable, T palmiers, . passerelle de bois, D retour en ville.
LAYOUTS.plage = (() => {
  // Farmwest : station balnéaire au sud du centre-ville → on arrive par le nord, la mer est au sud (plan d'avant retourné)
  const W = 40, H = 20, m = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (y < 6 ? 'w' : y < 8 ? 'a' : 's')));
  for (let y = 6; y < H; y++) { m[y][0] = 'T'; m[y][W - 1] = 'T'; } for (let x = 0; x < W; x++) if (x < 19 || x > 20) m[H - 1][x] = 'T';
  for (let y = 9; y < H; y++) { m[y][19] = '.'; m[y][20] = '.'; } m[H - 1][19] = 'D'; m[H - 1][20] = 'D';
  for (let x = 30; x <= 33; x++) for (let y = 4; y <= 8; y++) m[y][x] = '.';                   // ponton qui avance dans la mer
  for (const [x, y] of [[4, 11], [9, 15], [14, 10], [26, 12], [35, 15], [37, 10], [6, 17], [31, 17]]) m[y][x] = 'T';
  for (let x = 21; x < W; x++) { m[9][x] = '.'; m[10][x] = '.'; } m[9][W - 1] = 'D'; m[10][W - 1] = 'D';   // lot 2e : passerelle le long de la plage jusqu'au port (à l'est)
  return m.reverse().map(r => r.join(''));
})();
// Lot 13 : la zone cachée de Golgolas, au sud de la gare : clairière, centre abandonné (C) écrasé par une météorite (m).
LAYOUTS.golgolas = (() => {
  const W = 30, H = 20, m = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === H - 1 || x === W - 1 || y === 0 ? 'T' : 'g')));
  for (let y = 0; y < 13; y++) { m[y][14] = '.'; m[y][15] = '.'; } m[0][14] = 'D'; m[0][15] = 'D';
  for (let y = 3; y <= 7; y++) for (let x = 10; x <= 19; x++) m[y][x] = 'C';
  for (let y = 9; y <= 10; y++) for (let x = 13; x <= 16; x++) m[y][x] = 'm';
  for (const [x, y] of [[3, 4], [6, 12], [24, 5], [26, 13], [4, 16], [22, 16], [9, 15], [19, 14]]) m[y][x] = 'T';
  return m.map(r => r.join(''));
})();
export const GOLGO_CENTER = { x: 10, y: 3, w: 10, h: 5 }, METEOR = { x: 13, y: 9, w: 4, h: 2 };
// Gare : un chemin descend au sud vers la zone cachée (barré tant que la lettre de Golgolas n'est pas lue).
// Lot 12 : la station balnéaire devient la cabane du pêcheur : cabane de Rouky (X) au nord de la plage, porte en (12, 4).
export const ROUKY_CABIN = { x: 10, y: 2, w: 5, h: 3, door: 12 };
LAYOUTS.plage = (() => {
  const m = LAYOUTS.plage.map(r => r.split('')), C = ROUKY_CABIN;
  for (let y = C.y; y < C.y + C.h; y++) for (let x = C.x; x < C.x + C.w; x++) m[y][x] = 'X';
  m[4][9] = 's';   // pas de palmier collé à la cabane
  return m.map(r => r.join(''));
})();
// Quartier : g herbe, . pavés, X maison (Luna x4-8, Franck x11-15, y4-6), T arbre, D sortie vers la ferme, b banc, f jardinière.
// Quartier résidentiel (agrandi le 15/11) : une maison sur la 1re ligne (Luna), la clinique près de l'entrée,
// deux maisons plus bas (Franck, Hailey), et tout en bas à gauche, à l'écart derrière des arbres, la vieille maison de Myst.
// Chaque maison : x, y = coin haut-gauche, w = largeur (3 rangées), door = colonne de la porte (rangée du bas).
export const QUARTIER = {
  W: 40, H: 31,
  luna: { x: 6, y: 3, w: 5, door: 8 },
  clinique: { x: 27, y: 3, w: 4, door: 28 },
  franck: { x: 8, y: 12, w: 5, door: 10 },
  hailey: { x: 25, y: 12, w: 4, door: 26 },
  myst: { x: 3, y: 23, w: 6, door: 5, porch: true },   // 3 rangées + un porche (rangée 4)
  ed: { x: 32, y: 12, w: 5, door: 34 },   // 16/11 : maison à étages d'Ed, Suzie et Jade (ancien terrain libre)
  remy: { x: 18, y: 22, w: 5, door: 20 },   // 17/11 : maison de Remy Gusto, le cuistot
  lot: { x: 32, y: 12 }
};
// Lot 8 : une boîte aux lettres devant chaque maison d'habitant (à droite du perron) ; on lit le nom en l'examinant.
export const MAILBOX_IDS = ['luna', 'franck', 'hailey', 'myst', 'ed', 'remy'];
export const mailboxOwner = (x, y) => MAILBOX_IDS.find(id => { const h = QUARTIER[id]; return x === h.door + 1 && y === h.y + (h.porch ? 4 : 3); }) || null;
LAYOUTS.quartier = (() => {
  const Q = QUARTIER, W = Q.W, H = Q.H, m = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || x === W - 1 || y === H - 1 || y === 0 ? 'T' : 'g')));
  for (const y of [8, 9, 17, 18]) for (let x = 1; x < W - 1; x++) m[y][x] = '.';   // deux rues
  for (let y = 0; y < 8; y++) m[y][22] = '.'; m[0][22] = 'D';                       // l'allée qui monte vers la ferme
  m[8][W - 1] = 'D'; m[9][W - 1] = 'D';                                              // à l'est : la montagne gelée
  for (let y = 10; y < 17; y++) m[y][18] = '.';                                       // ruelle entre les deux rues
  for (const id of ['luna', 'clinique', 'franck', 'hailey', 'myst', 'ed', 'remy']) {
    const h = Q[id], rows = h.porch ? 4 : 3;
    for (let y = h.y; y < h.y + rows; y++) for (let x = h.x; x < h.x + h.w; x++) m[y][x] = 'X';
    const fy = h.y + rows; m[fy][h.door] = '.';                                       // perron devant la porte
    if (h.porch) m[h.y + 3][h.door] = 'X';
  }
  m[QUARTIER.luna.y + 4][QUARTIER.luna.door] = '.'; m[QUARTIER.clinique.y + 4][QUARTIER.clinique.door] = '.';
  m[QUARTIER.franck.y + 4][QUARTIER.franck.door] = '.'; m[QUARTIER.hailey.y + 4][QUARTIER.hailey.door] = '.';
  m[QUARTIER.ed.y + 4][QUARTIER.ed.door] = '.';   // allée d'Ed jusqu'à la 2e rue
  for (let y = QUARTIER.remy.y + 3; y <= 28; y++) m[y][QUARTIER.remy.door] = '.'; for (let x = 15; x <= QUARTIER.remy.door; x++) m[28][x] = '.';   // allée de Remy jusqu'au chemin
  for (let y = QUARTIER.ed.y - 3; y < QUARTIER.ed.y; y++) for (let x = QUARTIER.ed.x; x < QUARTIER.ed.x + QUARTIER.ed.w; x++) if (m[y][x] === 'T') m[y][x] = 'g';   // rien devant le toit à étages
  // chemin de Myst : de sa porte (en bas), il longe le bas puis remonte jusqu'à la 2e rue
  const my = Q.myst; for (let x = my.door; x <= 14; x++) m[my.y + 5][x] = '.'; for (let y = 19; y <= my.y + 5; y++) m[y][14] = '.';
  for (const id of MAILBOX_IDS) { const h = Q[id]; m[h.y + (h.porch ? 4 : 3)][h.door + 1] = 'k'; }   // lot 8 : boîtes aux lettres (k), sans texte
  for (let x = 1; x <= 12; x++) if (m[20][x] === 'g') m[20][x] = 'T';                 // rangée d'arbres : il vit à l'écart
  for (let y = 21; y < H - 1; y++) for (const x of [11, 12]) if (m[y][x] === 'g') m[y][x] = 'T';
  for (const [x, y] of [[3, 11], [15, 11], [31, 6], [38, 11], [36, 20], [24, 22], [30, 25], [20, 26]]) if (m[y][x] === 'g') m[y][x] = 'T';
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
// Lot 8 : la forêt devient un labyrinthe (murs d'arbres T et de gros cailloux #), entrée à l'ouest (0,9),
// sortie vers la caverne à l'est (29,9), trouée secrète en haut (27,0) et un coffre au bout du labyrinthe.
// Labyrinthe « parfait » creusé de façon déterministe (toujours au moins un chemin), puis quelques murs ouverts en plus.
const FW = 30, FH = 18;
const FOREST_KEEP = [[10, 7], [19, 13], [19, 12], [5, 12]];   // lieux de promenade des habitants (restent ouverts)
function buildForest(seed = 8086) {   // lot 11 : allées de 2 cases (plus lisible), murs d'une case
  const m = Array.from({ length: FH }, () => Array.from({ length: FW }, () => 'T'));
  let s = seed >>> 0 || 1; const r = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const CX = 9, CY = 5, X0 = c => 1 + c * 3, Y0 = c => 3 + c * 3;   // cases de 2 × 2 : x 1-2, 4-5… 25-26 ; y 3-4, 6-7, 9-10, 12-13, 15-16
  const open = (x0, y0, w, h) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (y > 0 && y < FH - 1 && x > 0 && x < FW - 1) m[y][x] = '.'; };
  const seen = new Set(['0,2']), stack = [[0, 2]]; open(X0(0), Y0(2), 2, 2);
  while (stack.length) {   // parcours en profondeur : toujours au moins un chemin
    const [cx, cy] = stack[stack.length - 1];
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [cx + a, cy + b]).filter(([a, b]) => a >= 0 && b >= 0 && a < CX && b < CY && !seen.has(a + ',' + b));
    if (!nb.length) { stack.pop(); continue; }
    const [nx, ny] = nb[r() * nb.length | 0];
    open(Math.min(X0(cx), X0(nx)), Math.min(Y0(cy), Y0(ny)), cx !== nx ? 5 : 2, cy !== ny ? 5 : 2);   // la case et le mur entre les deux
    seen.add(nx + ',' + ny); stack.push([nx, ny]);
  }
  for (let cy = 0; cy < CY; cy++) for (let cx = 0; cx < CX - 1; cx++) if (r() < .12) open(X0(cx), Y0(cy), 5, 2);   // quelques raccourcis
  open(25, 9, 4, 2);                      // vers la sortie est (caverne)
  open(26, 1, 2, 3);   // vers la trouée secrète (27, 0)
  open(1, 9, 2, 2);
  for (const [x, y] of FOREST_KEEP) m[y][x] = '.';
  for (let y = 1; y < FH - 1; y++) for (let x = 1; x < FW - 1; x++)   // des cailloux dans les murs
    if (m[y][x] === 'T' && r() < .22) m[y][x] = '#';
  return m.map(row => row.join(''));
}
// sorties : à l'ouest (vers les fermes), à l'est (caverne), trouée secrète tout en haut à droite
const forestLayout = seed => buildForest(seed).map((r, y) => y === 0 ? r.slice(0, 27) + '.' + r.slice(28) : y === 9 ? 'D' + r.slice(1, -1) + 'D' : r);
LAYOUTS.foret = forestLayout(8086);
// Chemin le plus court entre deux cases du labyrinthe (largeur d'abord) ; null si bloqué.
export function forestPath(from, to, blocked = () => false) {
  const L = LAYOUTS.foret, ok = (x, y) => L[y] && L[y][x] && '.D'.includes(L[y][x]) && !blocked(x, y);
  const prev = { [from]: null }, q = [from];
  while (q.length) {
    const c = q.shift(); if (c === to) break;
    const [x, y] = c.split(',').map(Number);
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + a) + ',' + (y + b); if (!(k in prev) && ok(x + a, y + b)) { prev[k] = c; q.push(k); } }
  }
  if (!(to in prev)) return null;
  const out = []; for (let k = to; k; k = prev[k]) out.unshift(k); return out;
}
// Le coffre : la case du labyrinthe la plus éloignée de l'entrée (un vrai bout de labyrinthe).
function farthest() {
  const L = LAYOUTS.foret, dist = { '0,9': 0 }, q = ['0,9']; let far = '0,9';
  while (q.length) { const c = q.shift(), [x, y] = c.split(',').map(Number); const open = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => L[y + b] && '.D'.includes(L[y + b][x + a] || 'T')).length;
    if (dist[c] > dist[far] && L[y][x] === '.' && y > 0 && x <= FW - 4 && open < 4 && !FOREST_KEEP.some(([a, b]) => Math.abs(a - x) + Math.abs(b - y) < 2)) far = c;   // au bout d'une allée, loin des sorties (contre un mur)
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + a) + ',' + (y + b); if (!(k in dist) && L[y + b] && L[y + b][x + a] && '.D'.includes(L[y + b][x + a])) { dist[k] = dist[c] + 1; q.push(k); } } }
  const [x, y] = far.split(',').map(Number); return { x, y };
}
export const FOREST_CHEST = farthest();   // objet modifié sur place quand le labyrinthe change
// Cases à garder libres (les cailloux de la nature n'y poussent pas) : les chemins entrée → caverne, → trouée, → coffre.
export const FOREST_ROUTE = new Set();
const fillRoute = () => { FOREST_ROUTE.clear(); for (const t of ['29,9', '27,0', FOREST_CHEST.x + ',' + FOREST_CHEST.y]) for (const k of forestPath('0,9', t) || []) FOREST_ROUTE.add(k); };
fillRoute();
// Lot 11 : à chaque saison, un nouveau labyrinthe tiré au hasard (graine = année et saison : le même pour tous les joueurs
// d'une partie). Toujours un chemin vers la caverne, la trouée et le coffre (labyrinthe « parfait » + vérification).
export const forestSeed = (year, season) => 8086 + (year || 1) * 7919 + (season || 0) * 104729;
export let forestKey = '1-0';
export function setForestSeason(year, season) {
  const key = (year || 1) + '-' + (season || 0);
  if (key === forestKey) return false;
  for (let k = 0; k < 20; k++) {   // (par sécurité : on retire une graine si un chemin manquait)
    LAYOUTS.foret = forestLayout(forestSeed(year, season) + k * 31);
    Object.assign(FOREST_CHEST, farthest()); fillRoute();
    if (forestPath('0,9', '29,9') && forestPath('0,9', '27,0') && FOREST_CHEST.x > 0) break;
  }
  forestKey = key; return true;
}
setForestSeason(1, 0);
// Met la forêt d'une partie à la saison en cours ; au changement de labyrinthe, on oublie les arbres coupés, les champignons
// et les cailloux de la forêt (ils repoussent dans le nouveau labyrinthe, jamais sur le chemin).
export function syncForest(S) {
  if (!S) return;
  setForestSeason(S.year, S.season);
  const F = S.foret || (S.foret = { day: null, shrooms: {} });
  if (F.layout === forestKey) return;
  const first = F.layout === undefined && !F.cut && !F.hits;
  F.layout = forestKey; F.cut = {}; F.hits = {}; F.shrooms = {}; F.day = null;
  if (S.nature && S.nature.foret && !first) delete S.nature.foret;
  if (S.scene === 'foret') { const t = (LAYOUTS.foret[Math.floor(S.y)] || '')[Math.floor(S.x)]; if (t !== '.' && t !== 'D') { S.x = 1.6; S.y = 9.6; } }   // jamais coincé dans un mur
}
// ---------- Farmwest, lot 2 : nouvelles zones (d'après docs/carte-region-farmwest.jpg) ----------
// s terre ocre, g herbe, . chemin, D sortie, T arbre, F fontaine, P panneau, f clôture, H maison du ranch, B grange du ranch,
// E entrepôt du port, = planches (quai, ponton), w eau
const grid = (W, H, ch) => Array.from({ length: H }, () => Array.from({ length: W }, () => ch));
const border = (m, exits) => { const H = m.length, W = m[0].length; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x === 0 || y === 0 || x === W - 1 || y === H - 1) m[y][x] = 'T'; for (const [x, y] of exits) m[y][x] = 'D'; };
// Gare (24 × 14) : voie ferrée à l'ouest (r), quai en planches (=), bâtiment de la gare (G), route vers le centre-ville à l'est
LAYOUTS.gare = (() => {
  const W = 24, H = 14, m = grid(W, H, 's');
  for (let y = 0; y < H; y++) { m[y][1] = 'r'; m[y][2] = 'r'; for (let x = 3; x <= 5; x++) m[y][x] = '='; }
  for (let y = 1; y <= 4; y++) for (let x = 7; x <= 12; x++) m[y][x] = 'G';
  for (let x = 6; x < W; x++) { m[8][x] = '.'; m[9][x] = '.'; } for (let y = 5; y <= 7; y++) { m[y][9] = '.'; m[y][10] = '.'; }
  for (const [x, y] of [[16, 3], [19, 5], [15, 12], [20, 12], [8, 12]]) m[y][x] = 'T';
  for (let x = 6; x < W; x++) { m[0][x] = 'T'; m[H - 1][x] = 'T'; } for (let y = 0; y < H; y++) m[y][W - 1] = y === 8 || y === 9 ? 'D' : 'T';
  return m.map(r => r.join(''));
})();
// Rond-point (26 × 18) : chemins en croix, anneau autour de la fontaine (lot 8 : plus de panneaux indicateurs)
LAYOUTS.gare = (() => { const m = LAYOUTS.gare.map(r => r.split('')), H = m.length; for (let y = 10; y < H - 1; y++) { m[y][10] = '.'; m[y][11] = '.'; } m[H - 1][10] = 'D'; m[H - 1][11] = 'D'; return m.map(r => r.join('')); })();
// 19/11 : la carrière, au nord des fermes. Bordée de gros cailloux cassables (o). Trois bouches de tunnel (%) dans la paroi
// nord : chaque jour, une seule est ouverte (au hasard du jour) et mène à la carrière profonde, d'une tout autre architecture.
export const QUARRY_MOUTHS = [{ x: 6, y: 0 }, { x: 16, y: 0 }, { x: 26, y: 0 }];
LAYOUTS.carriere = (() => {
  const W = 32, H = 22, m = [];
  for (let y = 0; y < H; y++) { const r = []; for (let x = 0; x < W; x++) r.push(y === 0 || x === 0 || x === W - 1 || y === H - 1 ? '^' : (y === 1 || y === H - 2 || x === 1 || x === W - 2) ? 'o' : '.'); m.push(r); }
  for (const q of QUARRY_MOUTHS) m[q.y][q.x] = '%';
  for (const [x, y] of [[9, 7], [10, 7], [22, 12], [22, 13], [21, 13], [12, 15]]) m[y][x] = '^';   // quelques éperons rocheux
  m[H - 1][15] = 'D'; m[H - 1][16] = 'D'; m[H - 2][15] = '.'; m[H - 2][16] = '.';   // descente vers la ferme
  return m.map(r => r.join(''));
})();
// Carrière profonde : canyon de grès rouge en terrasses, couloirs étroits, filons rares (fer, or) plus nombreux.
LAYOUTS.carriere2 = [
  '^^^^^^^^^^^^^^^^^^^^^^^^^^',
  '^.....^^^.......^^^.....^^',
  '^.....^^^.......^^^......^',
  '^..^.....................^',
  '^..^^^....^^^^.....^^^...^',
  '^...^^....^^^^.....^^^...^',
  '^.........^^.........^...^',
  '^^^....................^^^',
  '^^^...^^^.......^^.....^^^',
  '^.....^^^.......^^.......^',
  '^........................^',
  '^...^^^.....^^......^^...^',
  '^...^^^.....^^......^^...^',
  '^........................^',
  '^^^^........^^.......^^^^^',
  '^^^^^.................^^^^',
  '^^^^^^^^^^^^DD^^^^^^^^^^^^'
];
LAYOUTS.rondpoint = (() => {
  const W = 26, H = 18, m = grid(W, H, 's');
  for (let y = 0; y < H; y++) { m[y][12] = '.'; m[y][13] = '.'; } for (let x = 0; x < W; x++) { m[8][x] = '.'; m[9][x] = '.'; }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const d = Math.hypot(x - 12.5, y - 8.5); if (d < 4.6 && d > 2.2) m[y][x] = '.'; if (d <= 2.2) m[y][x] = 'F'; }
  for (const [x, y] of [[3, 3], [6, 2], [20, 3], [22, 13], [4, 14], [18, 15], [8, 13], [21, 6]]) m[y][x] = 'T';
  for (let y = 0; y < H; y++) { m[y][3] = m[y][4] = (y === 8 || y === 9) ? '=' : 'w'; }   // la rivière et son pont en bois (vers le centre-ville)
  border(m, [[12, 0], [13, 0], [12, H - 1], [13, H - 1], [0, 8], [0, 9], [W - 1, 8], [W - 1, 9]]);
  return m.map(r => r.join(''));
})();
// Ranch du Maire (32 × 22) : maison et grange en haut, grand enclos à chevaux, sortie à l'est vers le port
LAYOUTS.ranch = (() => {
  const W = 32, H = 22, m = grid(W, H, 's');
  for (let y = 0; y <= 9; y++) { m[y][15] = '.'; m[y][16] = '.'; }
  for (let x = 15; x < W; x++) { m[8][x] = '.'; m[9][x] = '.'; } for (let y = 8; y <= 16; y++) { m[y][29] = '.'; m[y][30] = '.'; } m[15][31] = '.'; m[16][31] = '.';
  for (let y = 2; y <= 5; y++) for (let x = 4; x <= 9; x++) m[y][x] = 'H';
  for (let y = 2; y <= 6; y++) for (let x = 21; x <= 26; x++) m[y][x] = 'B';
  for (let x = 5; x <= 25; x++) { m[10][x] = 'f'; m[19][x] = 'f'; } for (let y = 10; y <= 19; y++) { m[y][5] = 'f'; m[y][25] = 'f'; }
  m[10][15] = '.'; m[10][16] = '.';   // portail de l'enclos
  for (let y = 11; y <= 18; y++) for (let x = 6; x <= 24; x++) if (m[y][x] === 's') m[y][x] = 'g';
  for (const [x, y] of [[2, 8], [12, 4], [28, 3], [2, 15], [28, 19], [11, 7]]) m[y][x] = 'T';
  for (let y = 20; y < H; y++) { m[y][15] = '.'; m[y][16] = '.'; }   // chemin vers la fête foraine (sud)
  border(m, [[15, 0], [16, 0], [W - 1, 15], [W - 1, 16], [15, H - 1], [16, H - 1]]);
  return m.map(r => r.join(''));
})();
// Zone portuaire (36 × 20) : entrepôts, quai en planches, pontons dans la mer
LAYOUTS.port = (() => {
  const W = 36, H = 20, m = grid(W, H, 's');
  for (const [x0, x1] of [[3, 8], [12, 17], [26, 31]]) for (let y = 2; y <= 5; y++) for (let x = x0; x <= x1; x++) m[y][x] = 'E';
  for (let x = 0; x < W; x++) { m[6][x] = '.'; m[7][x] = '.'; }
  for (let y = 9; y <= 11; y++) for (let x = 0; x < W; x++) m[y][x] = '=';
  for (let y = 12; y < H; y++) for (let x = 0; x < W; x++) m[y][x] = 'w';
  for (const [x0, len] of [[8, 5], [18, 6], [27, 5]]) for (let y = 12; y < 12 + len; y++) { m[y][x0] = '='; m[y][x0 + 1] = '='; }
  for (let y = 0; y < 9; y++) { m[y][0] = 'T'; m[y][W - 1] = 'T'; } for (let x = 0; x < W; x++) m[0][x] = 'T';
  for (let y = 9; y < 12; y++) { m[y][0] = 'T'; m[y][W - 1] = 'T'; }
  m[6][0] = 'D'; m[7][0] = 'D';
  m[10][0] = 'D'; m[11][0] = 'D';   // lot 2e : le quai rejoint la plage (à l'ouest)
  for (let y = 0; y < 6; y++) { m[y][23] = '.'; m[y][24] = '.'; } m[0][23] = 'D'; m[0][24] = 'D';   // lot 2e : la route de l'est monte vers la montagne
  return m.map(r => r.join(''));
})();

export const SOLID_TILES = '#WDBKTPCHNYXMQUJAOVZFLfprEmncwGRIxyzqjuhe^k';   // k boîte aux lettres (lot 8)   // ^ falaise (7b)   // e escalier (maison d'Ed)   // h haie de bordure   // + attractions du parc (R I x y z q j u)   // w eau (mer, lac), G grotte   // m n lits de la clinique, c bureau  // A = fauteuil (Franck) / marchand d'animaux (village)
// Tuiles qui ouvrent une interface.
export const UI_TILES = { M: 'market', Q: 'board', U: 'upgrades', J: 'carpenter', A: 'animals', O: 'bakery', V: 'butcher', Z: 'fishmonger' };

export const SCENES = {
  farm: { W: CFG.W, H: CFG.H, doors: [
    { x: 5, y: 4, to: 'house', spawn: { x: 5.5, y: 7.4 } },
    { x: 24, y: 7, to: 'coop', spawn: { x: 4.5, y: 5.4 } },
    { x: 20, y: 7, to: 'pigsty', spawn: { x: 4.5, y: 5.4 } },
    { x: 28, y: 7, to: 'barn', spawn: { x: 5.5, y: 6.4 } },
    { x: 12, y: 4, to: 'grange', spawn: { x: 5.5, y: 5.2 } },
    { x: 16, y: 0, to: 'carriere', spawn: { x: 15.9, y: 19.4 } },   // 19/11 : la carrière, au nord
    { x: 16, y: 35, to: 'rondpoint', spawn: { x: 13, y: 1.8 } }, { x: 15, y: 35, to: 'rondpoint', spawn: { x: 13, y: 1.8 } }, { x: 17, y: 35, to: 'rondpoint', spawn: { x: 13, y: 1.8 } },   // Farmwest : au sud des fermes, le rond-point
    { x: 47, y: 5, to: 'foret', spawn: { x: 1.6, y: 9.6 } }, { x: 47, y: 4, to: 'foret', spawn: { x: 1.6, y: 9.6 } }, { x: 47, y: 6, to: 'foret', spawn: { x: 1.6, y: 9.6 } }   // Farmwest : à l'est des fermes, la forêt
  ] },
  // Farmwest (lot 3) : la gare, à l'ouest du centre-ville
  golgolas: { W: 30, H: 20, outdoor: true, doors: [{ x: 14, y: 0, to: 'gare', spawn: { x: 11, y: 11.8 } }, { x: 15, y: 0, to: 'gare', spawn: { x: 11, y: 11.8 } }] },   // lot 13
  gare: { W: 24, H: 14, outdoor: true, doors: [{ x: 10, y: 13, to: 'golgolas', spawn: { x: 15, y: 1.8 } }, { x: 11, y: 13, to: 'golgolas', spawn: { x: 15, y: 1.8 } }, { x: 23, y: 8, to: 'town', spawn: { x: 1.6, y: 10.6 } }, { x: 23, y: 9, to: 'town', spawn: { x: 1.6, y: 10.6 } }] },
  // Farmwest (lot 2) : rond-point (carrefour), ranch du Maire, zone portuaire
  rondpoint: { W: 26, H: 18, outdoor: true, doors: [
    { x: 12, y: 0, to: 'farm', spawn: { x: 16.5, y: 33.8 } }, { x: 13, y: 0, to: 'farm', spawn: { x: 16.5, y: 33.8 } },
    { x: 0, y: 8, to: 'town', spawn: { x: 32.2, y: 10.6 } }, { x: 0, y: 9, to: 'town', spawn: { x: 32.2, y: 10.6 } },
    { x: 25, y: 8, to: 'quartier', spawn: { x: 22.5, y: 1.8 } }, { x: 25, y: 9, to: 'quartier', spawn: { x: 22.5, y: 1.8 } },
    { x: 12, y: 17, to: 'ranch', spawn: { x: 16, y: 1.8 } }, { x: 13, y: 17, to: 'ranch', spawn: { x: 16, y: 1.8 } }] },
  ranch: { W: 32, H: 22, outdoor: true, doors: [
    { x: 15, y: 0, to: 'rondpoint', spawn: { x: 13, y: 15.8 } }, { x: 16, y: 0, to: 'rondpoint', spawn: { x: 13, y: 15.8 } },
    { x: 31, y: 15, to: 'port', spawn: { x: 1.6, y: 7 } }, { x: 31, y: 16, to: 'port', spawn: { x: 1.6, y: 7 } },
    { x: 15, y: 21, to: 'parc', spawn: { x: 16.5, y: 22.2 } }, { x: 16, y: 21, to: 'parc', spawn: { x: 16.5, y: 22.2 } },   // au sud : la fête foraine
    { x: 6, y: 5, to: 'ranch_maison', spawn: { x: 4.5, y: 5.4 } }, { x: 7, y: 5, to: 'ranch_maison', spawn: { x: 4.5, y: 5.4 } }] },
  remy: { W: 9, H: 7, doors: [{ x: 4, y: 6, to: 'quartier', spawn: { x: 20.5, y: 25.8 } }] },
  resto: { W: 14, H: 7, doors: [{ x: 6, y: 6, to: 'town', spawn: { x: 15.5, y: 29.8 } }] },
  rouky: { W: 9, H: 7, doors: [{ x: 4, y: 6, to: 'plage', spawn: { x: 12.5, y: 5.6 } }] },   // lot 12
  ranch_maison: { W: 9, H: 7, doors: [{ x: 4, y: 6, to: 'ranch', spawn: { x: 7, y: 6.8 } }] },
  port: { W: 36, H: 20, outdoor: true, doors: [{ x: 0, y: 6, to: 'ranch', spawn: { x: 29.4, y: 16 } }, { x: 0, y: 7, to: 'ranch', spawn: { x: 29.4, y: 16 } },
    { x: 0, y: 10, to: 'plage', spawn: { x: 37.4, y: 10 } }, { x: 0, y: 11, to: 'plage', spawn: { x: 37.4, y: 10 } },   // lot 2e : le long de la plage
    { x: 23, y: 0, to: 'montagne', spawn: { x: 29, y: 21.8 } }, { x: 24, y: 0, to: 'montagne', spawn: { x: 29, y: 21.8 } }] },   // lot 2e : route de l'est
  montagne: { W: 36, H: 24, outdoor: true, cold: true, doors: [{ x: 0, y: 8, to: 'quartier', spawn: { x: 38.2, y: 8.6 } }, { x: 0, y: 9, to: 'quartier', spawn: { x: 38.2, y: 8.6 } },
    { x: 28, y: 23, to: 'port', spawn: { x: 24, y: 1.8 } }, { x: 29, y: 23, to: 'port', spawn: { x: 24, y: 1.8 } }] },   // lot 2e : la route de l'est descend au port
  plage: { W: 40, H: 20, outdoor: true, doors: [{ x: 19, y: 0, to: 'town', spawn: { x: 20.5, y: 29.8 } }, { x: 20, y: 0, to: 'town', spawn: { x: 20.5, y: 29.8 } },
    { x: 39, y: 9, to: 'port', spawn: { x: 1.6, y: 10.6 } }, { x: 39, y: 10, to: 'port', spawn: { x: 1.6, y: 10.6 } },   // lot 2e : vers le port
    { x: 12, y: 4, to: 'rouky', spawn: { x: 4.5, y: 5.4 } }] },   // lot 12 : la cabane de Rouky
  town: { W: 34, H: 32, outdoor: true, doors: [{ x: 20, y: 31, to: 'plage', spawn: { x: 19.5, y: 1.8 } }, { x: 21, y: 31, to: 'plage', spawn: { x: 20.5, y: 1.8 } }, { x: 33, y: 10, to: 'rondpoint', spawn: { x: 1.6, y: 9 } }, { x: 0, y: 10, to: 'gare', spawn: { x: 21.4, y: 9 } }, { x: 15, y: 28, to: 'resto', spawn: { x: 6.5, y: 5.4 } }, { x: 11, y: 15, to: 'bar', spawn: { x: 7.5, y: 9.3 } }] },
  house: { W: 12, H: 9, doors: [{ x: 5, y: 8, to: 'farm', spawn: { x: 5.5, y: 5.9 } }] },
  maison: { W: 16, H: 11, doors: [{ x: 7, y: 10, to: 'farm', spawn: { x: 5.5, y: 5.9 } }] },   // la cabane agrandie (même porte sur la ferme)
  coop: { W: 10, H: 7, doors: [{ x: 4, y: 6, to: 'farm', spawn: { x: 24.5, y: 8.9 } }] },
  // Forêt : à l'est du centre-ville ; au-delà (est), la zone de la Caverne sombre (fermée pour l'instant).
  parc: { W: 34, H: 24, outdoor: true, doors: [{ x: 16, y: 23, to: 'ranch', spawn: { x: 16, y: 19.8 } }, { x: 17, y: 23, to: 'ranch', spawn: { x: 16, y: 19.8 } }] },
  foret: { W: 30, H: 18, outdoor: true, doors: [{ x: 0, y: 9, to: 'farm', spawn: { x: 45.6, y: 5.6 } }, { x: 29, y: 9, to: 'wild', spawn: { x: 1.6, y: 4.5 } }] },
  wild: { W: 50, H: 24, dark: true, cave: true, rooms: { w: 10, h: 8 }, doors: [{ x: 0, y: 4, to: 'foret', spawn: { x: 28.2, y: 9.6 } }] },
  grange: { W: 22, H: 11, dark: true, doors: [{ x: 5, y: 6, to: 'farm', spawn: { x: 12.5, y: 5.6 } }] },
  franck: { W: 9, H: 7, doors: [{ x: 4, y: 6, to: 'quartier', spawn: { x: 10.5, y: 15.8 } }] },
  clinique: { W: 9, H: 7, doors: [{ x: 4, y: 6, to: 'quartier', spawn: { x: 28.5, y: 6.8 } }] },
  hailey: { W: 9, H: 7, doors: [{ x: 4, y: 6, to: 'quartier', spawn: { x: 26.5, y: 15.8 } }] },
  carriere: { W: 32, H: 22, outdoor: true, doors: [{ x: 15, y: 21, to: 'farm', spawn: { x: 16.5, y: 1.4 } }, { x: 16, y: 21, to: 'farm', spawn: { x: 16.5, y: 1.4 } }, ...QUARRY_MOUTHS.map(q => ({ x: q.x, y: q.y, to: 'carriere2', spawn: { x: 12.9, y: 14.6 } }))] },
  carriere2: { W: 26, H: 17, outdoor: true, doors: [{ x: 12, y: 16, to: 'carriere', spawn: { x: 16.5, y: 2.6 } }, { x: 13, y: 16, to: 'carriere', spawn: { x: 16.5, y: 2.6 } }] },
  bar: { W: 16, H: 11, doors: [{ x: 7, y: 10, to: 'town', spawn: { x: 11.5, y: 16.8 } }] },
  ed: { W: 9, H: 7, doors: [{ x: 4, y: 6, to: 'quartier', spawn: { x: 34.5, y: 15.8 } }, { x: 7, y: 2, to: 'ed_etage', spawn: { x: 6.5, y: 2.8 } }] },
  ed_etage: { W: 9, H: 7, doors: [{ x: 7, y: 2, to: 'ed', spawn: { x: 6.5, y: 3.4 } }] },
  myst: { W: 9, H: 7, doors: [{ x: 4, y: 6, to: 'quartier', spawn: { x: 5.5, y: 27.8 } }] },
  luna: { W: 9, H: 7, doors: [{ x: 4, y: 6, to: 'quartier', spawn: { x: 8.5, y: 6.8 } }] },
  // Quartier résidentiel, au sud de la ferme : les maisons des habitants.
  quartier: { W: 40, H: 31, outdoor: true, doors: [{ x: 22, y: 0, to: 'rondpoint', spawn: { x: 23.4, y: 9 } }, { x: 8, y: 5, to: 'luna', spawn: { x: 4.5, y: 5.4 } }, { x: 10, y: 14, to: 'franck', spawn: { x: 4.5, y: 5.4 } }, { x: 28, y: 5, to: 'clinique', spawn: { x: 4.5, y: 5.4 } }, { x: 26, y: 14, to: 'hailey', spawn: { x: 4.5, y: 5.4 } }, { x: 5, y: 26, to: 'myst', spawn: { x: 4.5, y: 5.4 } }, { x: 34, y: 14, to: 'ed', spawn: { x: 4.5, y: 5.4 } }, { x: 20, y: 24, to: 'remy', spawn: { x: 4.5, y: 5.4 } }, { x: 39, y: 8, to: 'montagne', spawn: { x: 1.6, y: 8.6 } }, { x: 39, y: 9, to: 'montagne', spawn: { x: 1.6, y: 8.6 } }] },
  pigsty: { W: 10, H: 7, doors: [{ x: 4, y: 6, to: 'farm', spawn: { x: 20.5, y: 8.9 } }] },
  barn: { W: 12, H: 8, doors: [{ x: 5, y: 7, to: 'farm', spawn: { x: 28.5, y: 8.9 } }] }
};

// La cabane du joueur : petite au début, agrandie ensuite (scène « maison »).
export const isHome = sc => sc === 'house' || sc === 'maison';
export const tileAt = (scene, x, y) => (LAYOUTS[scene] && LAYOUTS[scene][y] && LAYOUTS[scene][y][x]) || '#';
export const doorAt = (scene, x, y) => SCENES[scene].doors.find(d => d.x === x && d.y === y) || null;
