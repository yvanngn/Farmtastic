// Héros en « poupée de sprites » (17/11) : dessiné pixel par pixel dans l'esprit des planches de l'utilisateur
// (docs/sprites/) — contour brun très sombre, 4 tons par couleur, textures (carreaux, coutures du jean) — et composé de
// calques : corps et visage, cheveux, haut, salopette, bas, bottes, chapeau. Choix en nombre limité (voir DOLL_OPTS).
// Cadre 22 × 38 ; vues : 0 face, 1 dos, 3 profil (tourné vers la gauche ; 2 = miroir). 4 images de marche.
import { canvas, makeCache, shade, hex6 } from './pixel.js';

export const DOLL_W = 22, DOLL_H = 38;
export const DOLL_OPTS = {
  skin: ['#f6d2b0', '#e8b48c', '#c8906a', '#8a5a3a'],
  eye: ['#3a6aa8', '#4a8a4a', '#6a4a2a', '#5a5a6a'],
  hair: [0, 1, 3, 4],                         // courts, longs, chignon, queue de cheval
  hairC: ['#7a4626', '#2a2026', '#c88a3a', '#a8432f', '#e8d8a8', '#5a5a62'],
  top: ['plaid', 'plain'],                    // chemise à carreaux, chemise unie
  shirt: ['#b8302a', '#2f7a46', '#3a5a9a', '#e8dcc4', '#6a3a7a', '#c88a2a'],
  overalls: ['', '#3a5a9a', '#4a6a3a', '#8a5a32'],
  bottom: ['pant', 'skirt'],
  pants: ['#3a5a8a', '#4a4a52', '#6a5236', '#8a3a2a'],
  hat: ['', 'cowboy', 'paille']
};
export const HAIR_LABELS = { 0: 'Courts', 1: 'Longs', 3: 'Chignon', 4: 'Queue' };
export const TOP_LABELS = { plaid: 'Carreaux', plain: 'Unie' };

const O = '#241612';
// Lignes centrées sur 22 colonnes (les lignes de 22 caractères sont placées telles quelles).
const put = (k, rows, y0, P, dx = 0) => rows.forEach((r, i) => { const off = r.length >= DOLL_W ? 0 : Math.floor((DOLL_W - r.length) / 2); [...r].forEach((ch, j) => { const c = P[ch]; if (c) { k.fillStyle = c; k.fillRect(off + j + dx, y0 + i, 1, 1); } }); });

// ---------- visage (sans cheveux) ----------
const FACE = {
  0: ['oooooooooo', 'osssssssssso', 'osssssssssssso', 'osssssssssssso', 'osswessssewsso', 'osswEssssEwsso', 'oSssssSsssssSo', 'oSbssssssssbSo', 'ooSsssmmsssSoo', 'ooSSssssSSoo', 'ooTSSSSToo', 'oTTTTo'],
  1: ['oooooooooo', 'osssssssssso', 'osssssssssssso', 'osssssssssssso', 'osssssssssssso', 'osssssssssssso', 'oSssssssssssSo', 'oSssssssssssSo', 'ooSsssssssSSoo', 'ooSSssssSSoo', 'ooTSSSSToo', 'oTTTTo'],
  3: ['......oooooooo........', '.....osssssssso.......', '.....ossssssssssoo....', '....osssssssssssso....', '....oswEsssssssssso...', '....oswEssssssssso....', '...osssssssssssSso....', '....oSssssssssSSo.....', '....ossmmsssssSSo.....', '.....oSsssssSSSo......', '.......oSSSSSo........', '........oTTTo.........']
};
// ---------- cheveux (calque par-dessus le visage) : courts 0, longs 1, chignon 3, queue 4 ----------
const HAIR_TOP_F = ['oooooo', 'oohhHHhhoo', 'ohhhHHHHhhho', 'ohhdhhHHHhhhdhho', 'ohdhhhhhhhhhhdho', 'ohdh..hhhh..hdho', 'odh..........hdo', 'od............do'];
const HAIR_TOP_B = ['oooooo', 'oohhHHhhoo', 'ohhhHHHHhhho', 'ohhdhhHHHhhhdhho', 'ohdhhhhhhhhhhdho', 'ohdhhhhhhhhhhdho', 'ohdhhhHhhhhhhdho', 'ohdhhhhhhhhhhdho', 'ohdhhhhhhhhhhdho', 'oohhhhhhhhhhhhoo', 'oohhhhhhhhhhoo'];
const HAIR_TOP_S = ['.......oooooo.........', '.....oohhhHHhoo.......', '....ohhhHHHHhhhho.....', '....ohhdhhHHhhhhhho...', '....ohdhhhhhhhhhhdho..', '.....o..hhhhhhhhhdho..', '..........hhhhhhhdho..', '...........hhhhhhdo...', '............hhhhhdo...', '..............hhdo....'];
const HAIR = {
  0: { 0: [HAIR_TOP_F, 2], 1: [HAIR_TOP_B, 2], 3: [HAIR_TOP_S, 2] },
  1: { 0: [[...HAIR_TOP_F, 'ohd............dho', 'ohd............dho', 'ohd............dho', 'ohd............dho', 'ohd............dho', 'oohd..........dhoo', 'ohdo..........odho', 'ohdo..........odho', 'oo..............oo'], 2],
       1: [[...HAIR_TOP_B, 'ohdhhhhhhhhhhhdho', 'ohdhhhhhhhhhhhdho', 'ohdhhhhhhhhhhhdho', 'ohdhhhhhhhhhhhdho', 'oohhhhhhhhhhhhhoo', 'oohhhhhhhhhhhoo'], 2],
       3: [[...HAIR_TOP_S, '..............hhhdo...', '.............ohhhdo...', '.............ohhhdo...', '.............ohhhdo...', '.............ohhdo....', '..............ooo.....'], 2] },
  3: { 0: [['oooo', 'ohHo', 'ohho', ...HAIR_TOP_F], -1], 1: [['oooo', 'ohHo', 'ohho', ...HAIR_TOP_B], -1], 3: [['.............ooo......', '............ohHho.....', '............ohhho.....', ...HAIR_TOP_S], -1] },
  4: { 0: [[...HAIR_TOP_F, '................', '..............do', '..............do'], 2],
       1: [[...HAIR_TOP_B, 'ohdo', 'ohHo', 'ohho', 'ohdo', 'oo'], 2],
       3: [[...HAIR_TOP_S, '..............hhdoo...', '...............ohhdo..', '...............ohhdo..', '................ohdo..', '................oo....'], 2] }
};
// ---------- chapeaux ----------
const HATS = {
  0: ['..oooooooo..', '.oaaAAAAaao.', '.oaaaaaaaao.', '.occccccccco', 'oaaaaaaaaaaaaaaaaaao', 'oAAAAAAAAAAAAAAAAAAo', '.oooooooooooooooooo.'],
  1: ['..oooooooo..', '.oaaaaaaaao.', '.oaaaaaaaao.', '.occccccccco', 'oaaaaaaaaaaaaaaaaaao', 'oAAAAAAAAAAAAAAAAAAo', '.oooooooooooooooooo.'],
  3: ['.......oooooooo.......', '......oaaAAAAaao......', '......oaaaaaaaao......', '......occcccccco......', '...oaaaaaaaaaaaaaao...', '...oAAAAAAAAAAAAAAo...', '....oooooooooooooo....']
};
const HAT_COL = { cowboy: ['#8a5a32', '#3a2a20'], paille: ['#e6c870', '#a83a2a'] };

function palette(L) {
  const s = hex6(L.skin || '#f6d2b0'), h = hex6(L.hairC || '#7a4626'), r = hex6(L.shirt || '#b8302a'), p = hex6(L.overalls || L.pants || '#3a5a8a');
  return { o: O, s, S: shade(s, .86), T: shade(s, .68), b: '#e88a78', w: '#ffffff', e: hex6(L.eye || '#3a6aa8'), E: '#1a1420', m: shade(s, .58),
    h, H: shade(h, 1.4), d: shade(h, .66), r, R: shade(r, .7), q: shade(r, 1.25), x: shade(r, .45), y: '#e8c26a', t: '#4a2e1a', p, P: shade(p, .7), j: shade(p, 1.35), k: '#5a3a22', K: '#8a5a38' };
}
// ---------- buste, bras, jambes (dessinés par code, même style) ----------
function torso(k, P, d, f, L) {
  const R = (x, y, w, h, c) => { k.fillStyle = c; k.fillRect(x, y, w, h); };
  const swing = f ? [1, 0, -1, 0][(f - 1) >> 1] : 0;
  if (d === 3) {   // profil : buste étroit, un bras qui balance
    R(6, 16, 10, 7, O); R(7, 16, 8, 6, P.r); R(7, 16, 2, 6, P.q); R(13, 16, 2, 6, P.R); R(6, 22, 10, 1, O); R(7, 22, 8, 1, P.t);
    if (L.top !== 'plain') for (let y = 17; y < 22; y += 3) R(7, y, 8, 1, P.x), R(10, 16, 1, 6, P.x);
    if (L.overalls) { R(8, 18, 6, 5, P.p); R(8, 18, 6, 1, P.j); R(11, 16, 1, 2, P.p); }
    R(9 + swing, 17, 3, 6, O); R(10 + swing, 17, 1, 5, P.R); R(9 + swing, 23, 3, 2, O); R(10 + swing, 23, 1, 1, P.S);
    return;
  }
  R(4, 16, 14, 7, O); R(5, 16, 12, 6, P.r); R(5, 16, 3, 6, P.q); R(14, 16, 3, 6, P.R);   // buste
  if (d === 0) { R(9, 16, 4, 1, P.S); R(10, 17, 2, 1, P.S); }   // col ouvert
  if (L.top !== 'plain') { for (let y = 18; y < 22; y += 3) R(5, y, 12, 1, P.x); for (const x of [7, 11, 15]) R(x, 16, 1, 6, P.x); }   // carreaux
  else if (d === 0) for (const y of [18, 20]) R(10, y, 2, 1, shade(P.r, 1.4));   // boutons
  R(4, 22, 14, 2, O); R(5, 22, 12, 1, P.t); if (d === 0) R(10, 22, 2, 1, P.y);   // ceinture
  for (const [x, s] of [[2, swing], [17, -swing]]) { R(x, 17 + s, 3, 6, O); R(x + 1, 17 + s, 1, 5, x < 10 ? P.r : P.R); R(x, 23 + s, 3, 2, O); R(x + 1, 23 + s, 1, 1, P.s); }   // bras, mains
  if (L.overalls) { R(7, 18, 8, 5, O); R(8, 18, 6, 5, P.p); R(8, 18, 6, 1, P.j); R(7, 16, 1, 2, P.p); R(14, 16, 1, 2, P.p); if (d === 0) { R(8, 19, 1, 1, P.y); R(13, 19, 1, 1, P.y); } }   // salopette
}
function legs(k, P, d, f, L) {
  const R = (x, y, w, h, c) => { k.fillStyle = c; k.fillRect(x, y, w, h); };
  if (d === 3) {   // profil : deux jambes qui avancent tour à tour
    const a = f ? [2, 0, -2, 0][(f - 1) >> 1] : 0;
    for (const [dx, dark] of [[-a, true], [a, false]]) {
      const x = 7 + dx, pc = dark ? P.P : P.p;
      if (L.bottom === 'skirt') { R(x + 1, 29, 3, 4, O); R(x + 2, 29, 1, 4, dark ? P.S : P.s); } else { R(x, 24, 7, 9, O); R(x + 1, 24, 5, 9, pc); R(x + 2, 25, 1, 7, P.j); }
      R(x - 1, 33, 8, 4, O); R(x, 33, 6, 2, P.k); R(x, 33, 6, 1, P.K);
    }
    if (L.bottom === 'skirt') { R(6, 23, 10, 7, O); R(7, 23, 8, 6, P.p); R(7, 23, 2, 6, P.j); R(13, 23, 2, 6, P.P); }
    return;
  }
  const g = f ? [1, 0, 2, 0][(f - 1) >> 1] : 0;   // 1 : jambe gauche levée, 2 : jambe droite
  for (const [x, up] of [[5, g === 1], [11, g === 2]]) {
    const u = up ? 1 : 0;
    if (L.bottom === 'skirt') { R(x + 1, 30 - u, 4, 4, O); R(x + 2, 30 - u, 2, 4, x < 10 ? P.s : P.S); }
    else { R(x, 24, 6, 10 - u, O); R(x + 1, 24, 4, 9 - u, x < 10 ? P.p : P.P); R(x + 1, 24, 1, 9 - u, x < 10 ? P.j : P.p); for (let y = 25; y < 33 - u; y += 2) R(x + 3, y, 1, 1, P.j); }
    R(x - (x < 10 ? 1 : 0), 33 - u, 7, 4, O); R(x + (x < 10 ? 0 : 1), 33 - u, 5, 2, P.k); R(x + (x < 10 ? 0 : 1), 33 - u, 5, 1, P.K);   // bottes
  }
  if (L.bottom === 'skirt') { R(4, 23, 14, 8, O); R(5, 23, 12, 7, P.p); R(5, 23, 3, 7, P.j); R(14, 23, 3, 7, P.P); for (let x = 6; x < 17; x += 3) R(x, 29, 1, 1, P.P); }
}
const CACHE = makeCache(160);
export function dollFrame(L, d, f) {
  const v = d === 2 ? 3 : d, key = JSON.stringify([L.skin, L.eye, L.hair, L.hairC, L.top, L.shirt, L.overalls, L.bottom, L.pants, L.hat, v, f || 0, d === 2]);
  return CACHE(key, () => {
    const c = canvas(DOLL_W, DOLL_H), k = c.getContext('2d'), P = palette(L), bob = f && ((f - 1) >> 1) % 2 === 0 ? 1 : 0;
    if (d === 2) { k.translate(DOLL_W, 0); k.scale(-1, 1); }
    legs(k, P, v, f, L);
    k.save(); k.translate(0, bob);
    torso(k, P, v, f, L);
    put(k, FACE[v], 4, P);
    const hs = (HAIR[L.hair] || HAIR[0])[v]; put(k, hs[0], hs[1], P);
    if (L.hat && HAT_COL[L.hat]) { const [a, c2] = HAT_COL[L.hat]; put(k, HATS[v], -1, { ...P, a, A: shade(a, .72), c: c2 }); }
    k.restore();
    return c;
  });
}
// Le héros dans le jeu : mêmes repères que les autres personnages (pieds en oy + 19, centré sur ox + 6).
export function drawDoll(c, ox, oy, L, d, f) {
  const fr = dollFrame(L, d, f); c.drawImage(fr, Math.round(ox + 6 - DOLL_W / 2), oy + 19 - DOLL_H + 2);
}
