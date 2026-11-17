// Sprites pixel art procéduraux, ombrés et contourés, mis en cache.
import { CFG } from '../config.js';
import { CROPS } from '../data/crops.js';
import { cropProgress } from '../systems/farming.js';
import { shade, disc, canvas, outline, makeCache, groundShadow, hex6, harmonize } from './pixel.js';
import { rng } from '../world/map.js';
const T = CFG.T;
const cache = makeCache(400);
const SHOE = '#4a2e1e', EYE = '#2a1d18';
export const WALK_N = 8;   // marche : cycle de 8 images (walkFrame 1..8, 0 = à l'arrêt)
const f4 = f => f ? [1, 2, 3, 0][(f - 1) >> 1] : 0;   // face / dos : 4 poses tirées des 8 images

/* ---------------- Personnage façon Stardew (16 × 31, contour coloré inclus : canvas 18 × 33) ---------------- */
// Grosse tête (10 × 10), yeux avec du blanc, 3 tons par couleur (lumière en haut à gauche), contour brun.
// L.body : 'h' | 'f' ; L.bottom : 'pant' | 'skirt' | 'robe' ; L.hair : 0 court, 1 long, 2 épis, 3 chignon, 4 queue, 5 couettes.
// d : 0 face, 1 dos, 3 profil droit (2 = miroir) ; f : 0 à l'arrêt, 1..8 marche.
function rawChar(c, L, d, f, blink, noArm = false) {
  const r = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(1 + x, 1 + y, w, h); };
  const S = hex6(L.skin), Sd = shade(S, .84), Sh = hex6(L.shirt), Shd = shade(Sh, .74), Shl = shade(Sh, 1.2);
  const P = hex6(L.pants), Pd = shade(P, .72), Pl = shade(P, 1.18), H = hex6(L.hairC), Hl = shade(H, 1.4), Hd = shade(H, .7);
  const fem = L.body === 'f', robe = L.bottom === 'robe', skirt = L.bottom === 'skirt' || robe, st = L.hair, long = st === 1;
  const CH = '#8a5a32', SP = '#e8c26a', B = SHOE, Bl = shade(SHOE, 1.4), LIPS = '#c8586a', BLUSH = '#f0907a';
  const walking = !!f, ph = walking ? (f - 1) / WALK_N * Math.PI * 2 : 0;
  const bob = walking && Math.abs(Math.sin(ph)) > .7 ? 1 : 0;   // le corps descend quand les jambes sont écartées
  const u = (x, y, w, h, col) => r(x, y + bob, w, h, col);
  // ----- jambes et pieds
  const legs = () => {
    if (d === 3) {
      const leg = (p, dark) => { const sw = walking ? Math.round(Math.sin(p) * 2) : 0, lift = walking && -Math.cos(p) > .3 ? 1 : 0, col = skirt ? (dark ? Sd : S) : L.chaps ? (dark ? shade(CH, .8) : CH) : (dark ? Pd : P);
        r(6 + sw, 22 + bob, 3, 5 - lift, col); r(6 + sw, 27 - lift, 4, 2, dark ? shade(B, .8) : B); r(6 + sw, 27 - lift, 4, 1, Bl); if (L.spurs) r(5 + sw, 28 - lift, 1, 1, SP); };
      leg(ph + Math.PI, true); leg(ph, false); return;
    }
    const g4 = walking ? [1, 2, 3, 0][(f - 1) >> 1] : 0, l1 = g4 === 1 ? 1 : 0, l2 = g4 === 3 ? 1 : 0;
    if (skirt) { r(5, 25 - l1, 2, 2, S); r(9, 25 - l2, 2, 2, Sd); r(4, 27 - l1, 3, 2, B); r(9, 27 - l2, 3, 2, B); r(4, 27 - l1, 3, 1, Bl); return; }
    const LC = L.chaps ? CH : P;
    r(4, 22, 4, 5 - l1, LC); r(8, 22, 4, 5 - l2, L.chaps ? shade(CH, .85) : Pd); r(4, 22, 1, 5 - l1, L.chaps ? '#c99560' : Pl); r(7, 23, 1, 4 - l1, Pd);
    r(3, 27 - l1, 5, 2, B); r(8, 27 - l2, 5, 2, shade(B, .85)); r(3, 27 - l1, 5, 1, Bl); r(8, 27 - l2, 5, 1, B);   // bottes
    if (L.spurs) { r(2, 28 - l1, 1, 1, SP); r(13, 28 - l2, 1, 1, SP); }
  };
  // ----- buste, bras
  const body = () => {
    if (d === 3) {
      const a = walking ? Math.round(Math.sin(ph + Math.PI) * 2) : 0;
      if (!noArm) { /* bras arrière */ }
      u(5, 13, 6, 9, Sh); u(5, 13, 1, 9, Shl); u(10, 13, 1, 9, Shd);
      if (L.plaid) { u(5, 15, 6, 1, Shd); u(5, 18, 6, 1, Shd); u(7, 13, 1, 9, Shd); }
      if (L.coat) { u(4, 13, 7, 13, Sh); u(4, 13, 1, 13, Shl); u(10, 13, 1, 13, Shd); }
      if (L.vest) { u(5, 13, 3, 8, L.vest); u(5, 13, 1, 8, shade(L.vest, 1.15)); }
      if (L.bandana) u(8, 13, 3, 2, L.bandana);
      if (skirt) { u(4, 20, 8, 4, P); u(3, 23, 10, 2, Pd); u(4, 20, 1, 4, Pl); if (robe) { u(3, 24, 10, 2, P); u(3, 26, 10, 1, '#f4ead2'); } }
      else u(5, 21, 6, 1, Pd);
      if (!noArm) { u(7 + a, 14, 2, 6, Shd); u(7 + a, 20, 2, 2, S); }   // bras qui balance
      return;
    }
    const g4 = walking ? [1, 2, 3, 0][(f - 1) >> 1] : 0, s1 = g4 === 1 ? 1 : g4 === 3 ? -1 : 0, tw = fem ? 1 : 0;
    u(3, 13, 10, 9, Sh); u(3 + tw, 19, 1, 3, Sh); u(3, 13, 1, 7, Shl); u(4, 13, 3, 1, Shl); u(11, 14, 2, 8, Shd);
    if (fem) { u(3, 19, 1, 3, Sh); }
    if (L.plaid) { for (const y of [15, 18]) u(3, y, 10, 1, Shd); for (const x of [6, 9]) u(x, 13, 1, 9, Shd); }
    if (d === 0) { u(6, 13, 4, 1, S); u(7, 14, 2, 1, S); }   // col ouvert
    if (L.coat) { u(2, 13, 12, 14, Sh); u(2, 13, 1, 14, Shl); u(12, 13, 2, 14, Shd); if (d === 0) { u(7, 14, 2, 13, Shd); u(6, 13, 4, 1, S); } }
    if (L.vest) { const V = L.vest; if (d === 1) u(3, 13, 10, 8, V); else { u(3, 13, 3, 8, V); u(10, 13, 3, 8, V); } u(3, 13, 1, 8, shade(V, 1.15)); }
    if (L.bandana && d === 0) { u(5, 13, 6, 2, L.bandana); u(7, 15, 2, 1, L.bandana); }
    if (skirt) { u(3, 20, 10, 3, P); u(2, 23, 12, 2, Pd); u(3, 20, 1, 3, Pl); if (robe) { u(2, 24, 12, 2, P); u(1, 26, 14, 1, '#f4ead2'); for (let k = 2; k < 14; k += 3) u(k, 24, 1, 2, Pd); } }
    else u(3, 21, 10, 1, Pd);   // ceinture
    u(1, 14 + s1, 2, 6, Shd); u(1, 14 + s1, 1, 5, Sh); u(1, 20 + s1, 2, 2, S);                // bras gauche
    if (!noArm) { u(13, 14 - s1, 2, 6, Shd); u(14, 14 - s1, 1, 5, shade(Shd, .85)); u(13, 20 - s1, 2, 2, Sd); }   // bras droit
  };
  // ----- tête
  const head = () => {
    if (d === 3) {
      u(4, 2, 9, 10, S); u(5, 1, 7, 1, S); u(12, 4, 1, 7, Sd); u(5, 11, 7, 1, Sd); u(13, 7, 1, 2, S);   // nez
      if (blink) u(10, 8, 2, 1, EYE); else { u(10, 6, 1, 3, EYE); u(11, 6, 1, 2, '#ffffff'); }
      u(11, 10, 2, 1, fem ? LIPS : shade(S, .7)); if (!L.sad) u(9, 9, 1, 1, BLUSH);
      // cheveux (derrière et dessus)
      u(4, 0, 8, 3, H); u(3, 1, 3, 9, H); u(4, 3, 3, 4, H); u(6, 0, 4, 1, Hl); u(3, 2, 1, 6, Hd);
      if (long) u(2, 4, 3, 11, H); if (st === 4) { u(1, 3, 3, 9, H); u(1, 4, 1, 7, Hd); u(2, 3, 2, 1, '#e8c26a'); }
      if (st === 5) { u(2, 6, 2, 7, H); u(2, 6, 2, 1, '#e8c26a'); } if (st === 3) { u(1, -1, 5, 4, H); u(2, -1, 2, 1, Hl); }
      if (st === 2) { u(5, -1, 1, 1, H); u(8, -1, 1, 1, H); u(11, 0, 1, 1, H); }
      return;
    }
    u(3, 2, 10, 10, S); u(4, 1, 8, 1, S); u(4, 12, 8, 1, Sd); u(12, 3, 1, 9, Sd); u(3, 11, 1, 1, Sd);
    u(7, 12, 2, 1, Sd);   // cou
    if (d === 0) {
      if (blink) { u(5, 8, 2, 1, EYE); u(9, 8, 2, 1, EYE); }
      else { u(5, 6, 1, 3, '#ffffff'); u(6, 6, 1, 3, EYE); u(9, 6, 1, 3, EYE); u(10, 6, 1, 3, '#ffffff'); u(6, 6, 1, 1, '#5a4a6a'); u(9, 6, 1, 1, '#5a4a6a'); if (fem) { u(5, 5, 2, 1, EYE); u(9, 5, 2, 1, EYE); } }
      if (L.sad) { u(5, 4, 2, 1, Hd); u(9, 4, 2, 1, Hd); u(7, 10, 2, 1, shade(S, .62)); u(6, 11, 1, 1, shade(S, .7)); u(9, 11, 1, 1, shade(S, .7)); }
      else { u(7, 10, 2, 1, fem ? LIPS : shade(S, .66)); u(4, 9, 1, 1, BLUSH); u(11, 9, 1, 1, BLUSH); }
    }
    // cheveux
    if (d === 1) { u(3, 0, 10, 11, H); u(4, 1, 3, 2, Hl); u(11, 2, 2, 9, Hd); if (long) u(3, 11, 10, 5, H); if (st === 4) { u(7, 10, 3, 7, H); u(7, 10, 3, 1, '#e8c26a'); } if (st === 3) { u(6, -2, 4, 3, H); u(7, -2, 2, 1, Hl); } if (st === 5) { u(0, 5, 2, 8, H); u(14, 5, 2, 8, H); } return; }
    u(3, 0, 10, 3, H); u(2, 2, 2, 6, H); u(12, 2, 2, 6, H); u(4, 3, 3, 1, H); u(9, 3, 3, 1, H); u(7, 3, 2, 2, H);   // frange
    u(5, 0, 4, 1, Hl); u(4, 1, 2, 1, Hl); u(13, 3, 1, 5, Hd);
    if (long) { u(1, 5, 3, 11, H); u(12, 5, 3, 11, H); u(1, 5, 1, 11, Hd); u(14, 5, 1, 11, Hd); }
    if (st === 2) { u(4, -1, 1, 1, H); u(7, -1, 2, 1, H); u(11, -1, 1, 1, H); }
    if (st === 3) { u(6, -2, 4, 3, H); u(7, -2, 2, 1, Hl); }
    if (st === 4) { u(13, 4, 2, 8, H); u(14, 4, 1, 8, Hd); }
    if (st === 5) { u(0, 5, 2, 8, H); u(14, 5, 2, 8, H); u(0, 5, 2, 1, '#e8c26a'); u(14, 5, 2, 1, '#e8c26a'); }
  };
  legs(); body(); head();
}

function charSprite(L, d, f, blink, noArm = false) {
  const k = (noArm ? 'n' : 'c') + L.body + L.bottom + L.skin + L.hair + L.hairC + L.shirt + L.pants + (L.sad ? 's' : '') + (L.coat ? 'k' : '') + (L.hat || '') + (L.vest || '') + (L.bandana || '') + (L.plaid ? 'p' : '') + (L.chaps ? 'j' : '') + (L.spurs ? 'e' : '') + d + f + blink;
  return cache(k, () => {
    const s = canvas(18, 33), c = s.getContext('2d');
    if (d === 2) { c.translate(18, 0); c.scale(-1, 1); }
    rawChar(c, L, d === 2 ? 3 : d, f, blink, noArm);
    if (L.hat) drawHat(c, L, d === 2 ? 3 : d, f);
    return outline(s, shade(hex6(L.hairC || '#5a3a22'), .45));   // contour coloré (teinte des cheveux, jamais noir)
  });
}

// Farmwest (7e) : chapeaux western — 'cowboy' (bords relevés, ruban), 'melon' (rond, noir), 'paille'.
export const HATS = { cowboy: ['#8a5a32', '#6a4426', '#3a2a20'], melon: ['#2a2630', '#1a1820', '#8a2a2a'], paille: ['#e6c870', '#c9a84a', '#a83a2a'] };
function drawHat(c, L, d, f) {
  const [A, Bc, rib] = HATS[L.hat] || HATS.cowboy, r = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(1 + x, 1 + y, w, h); };
  const ph = f ? (f - 1) / WALK_N * Math.PI * 2 : 0, by = f && Math.abs(Math.sin(ph)) > .7 ? 1 : 0;
  if (L.hat === 'melon') { r(2, 2 + by, 12, 1, A); r(4, -2 + by, 8, 4, A); r(5, -3 + by, 6, 1, A); r(4, 1 + by, 8, 1, rib); r(5, -2 + by, 2, 1, shade(A, 1.7)); return; }
  if (d === 3) { r(1, 2 + by, 14, 1, Bc); r(1, 1 + by, 1, 1, Bc); r(14, 1 + by, 1, 1, Bc); r(4, -2 + by, 9, 4, A); r(6, -3 + by, 5, 1, A); r(4, 1 + by, 9, 1, rib); r(5, -2 + by, 2, 1, shade(A, 1.3)); return; }
  r(0, 2 + by, 16, 1, Bc); r(0, 1 + by, 1, 1, Bc); r(15, 1 + by, 1, 1, Bc); r(3, -2 + by, 10, 4, A); r(4, -3 + by, 3, 1, A); r(9, -3 + by, 3, 1, A); r(3, 1 + by, 10, 1, rib); r(4, -2 + by, 2, 1, shade(A, 1.3));
}
// ox, oy : coin haut-gauche de l'ancien gabarit 12 × 20 (les pieds en oy + 18). t : horloge pour le clignement.
export function drawChar(c, ox, oy, L, d, f, t = 0, noArm = false) {
  groundShadow(c, ox + 6, oy + 19, 6, 2);
  const blink = (t % 4200) < 130, spr = charSprite(L, d, f || 0, blink, noArm), x = ox - 3, y = oy - 12;
  if (L.kid) {   // enfant : tête entière, buste et jambes raccourcis
    c.drawImage(spr, 0, 0, 18, 15, x, y + 6, 18, 15);
    c.drawImage(spr, 0, 20, 18, 13, x, y + 20, 18, 13);
  } else if (L.tall) {   // grand : buste allongé de 3 pixels
    c.drawImage(spr, 0, 0, 18, 20, x, y - 3, 18, 20);
    c.drawImage(spr, 0, 17, 18, 16, x, y + 17, 18, 16);
  } else c.drawImage(spr, x, y);
}

/* ---------------- Icônes pixel des outils (roues, bouton d'action) ---------------- */
// Renvoie une URL d'image 16×16 (null pour la main, qui garde son émoji).
export function toolIcon(id) {
  if (!TOOL_PIX[id]) return null;
  return cache('icon' + id, () => {
    const s = canvas(17, 22), c = s.getContext('2d');
    c.translate(8, 14); TOOL_PIX[id](c); // l'outil entier, pixels nets
    return outline(s, '#1b1226').toDataURL();
  });
}

/* ---------------- Outils tenus en main (animation de coup) ---------------- */
export function drawToolPix(c, id) { const f = TOOL_PIX[id]; if (f) f(c); }
// Outils dessinés pixel par pixel (13 × 21, la main du héros en (0, 0), la tête de l'outil vers le haut).
// b bois, B bois foncé, h bois clair, s acier, S acier foncé, w reflet, g laiton, r rouge, k noir, l fil, c liège, e cuir.
const TP = { b: '#8a5a32', B: '#5b3a22', h: '#c08a54', s: '#a8afb8', S: '#5e646e', w: '#f2f6fa', g: '#e8c26a', G: '#a8842a', r: '#d8402e', k: '#2a2228', l: '#e8eef4', c: '#f4f0e6', e: '#6a3a22' };
const TOOL_ART = {
  axe: [           // hache (16/11) : lame verticale à gauche, tranchant clair, collier et talon autour du manche
    '.SSS.........', 'SwssS........', 'SwssBhbBS....', 'SwssshbsS....', 'SwssBhbBS....', 'SwssShb......', '.SSS.hb......', '.....hb......', '.....hb......', '.....hb......', '.....hb......', '.....hb......', '.....hb......', '.....hb......', '.....hb......', '.....hB......', '.....hb......', '.....eB......', '.....ee......', '.....eB......', '.....ee......'],
  pick: [          // pioche (16/11) : tête en arc au-dessus du manche, deux pointes vers le bas
    '....SSSSS....', '..SSswwwsSS..', '.SssSBhBSssS.', 'Sss..BhB..ssS', 'Ss...hb....sS', 'S....hb.....S', '.....hb......', '.....hb......', '.....hb......', '.....hb......', '.....hb......', '.....hb......', '.....hb......', '.....hb......', '.....hb......', '.....hB......', '.....hb......', '.....eB......', '.....ee......', '.....eB......', '.....ee......'],
  hammer: [        // marteau : tête carrée d'un côté, panne fendue (arrache-clou) de l'autre
    '.............', '.............', 'SS.SSSSSSS...', 'Ss.SwwsssSS..', 'SssSwsssssS..', '.SsSssssssS..', '..SSSSSSSS...', '.....hb......',
    '.....hb......', '.....hb......', '.....hB......', '.....hb......', '.....hb......', '.....eB......', '.....ee......', '.....eB......', '.....hb......', '.....hb......', '.....BB......', '.............', '.............'],
  shovel: [        // pelle : fer arrondi, manche, poignée en D
    '....SSSSS....', '...SswwssS...', '...SswsssS...', '...SswsssS...', '...SssssS....', '....SsssS....', '.....SgS.....', '.....hb......',
    '.....hb......', '.....hb......', '.....hb......', '.....hB......', '.....hb......', '.....hb......', '.....hb......', '....BhbB.....', '...B...B.....', '...BhhhB.....', '....BBB......', '.............', '.............'],
  sword: [         // épée : lame fine à arête claire, garde dorée, poignée de cuir, pommeau
    '......w......', '.....wsS.....', '.....wsS.....', '.....wsS.....', '.....wsS.....', '.....wsS.....', '.....wsS.....', '.....wsS.....',
    '.....wsS.....', '.....wsS.....', '.....wsS.....', '.....wsS.....', '..GggggggG...', '...GGgGG.....', '.....ee......', '.....eB......', '.....ee......', '.....gG......', '.............', '.............', '.............'],
  rod: [           // canne à pêche : scion fin, anneaux, moulinet, bouchon rouge et blanc au bout du fil
    '..........h..', '.........hl..', '........hb.l.', '........hb..l', '.......hb...l', '.......hb..rr', '......hb...cc', '......hb.....',
    '.....hb......', '.....hb......', '....hbSSk....', '....hbSwSk...', '....hbSSk....', '....eB.......', '....ee.......', '....eB.......', '....ee.......', '....BB.......', '.............', '.............', '.............'],
  knife: [         // couteau du cuistot : lame large à pointe, tranchant clair, mitre, manche de bois rivé
    '......S......', '.....SwS.....', '.....wsS.....', '.....wsS.....', '....SwsS.....', '....wssS.....', '....wssS.....', '....wssS.....', '....SSSS.....', '...gGGGGg....', '.....eB......', '.....eg......', '.....eB......', '.....ee......', '.....eg......', '.....BB......', '.............', '.............', '.............', '.............', '.............'],
  sickle: [        // faucille : lame en croissant
    '...SSSS......', '..Swwwss.....', '.Sw....sS....', 'Sw......sS...', 'Sw.......sS..', 'Sw.......sS..', '.S.......sS..', '........SsS..',
    '.......SsS...', '......hgS....', '......hb.....', '......hb.....', '......hB.....', '......hb.....', '......eB.....', '......ee.....', '......BB.....', '.............', '.............', '.............', '.............']
};
const TOOL_PIX = {};
for (const [id, rows] of Object.entries(TOOL_ART)) TOOL_PIX[id] = c => {
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) { const k = rows[y][x]; if (k !== '.') { c.fillStyle = TP[k]; c.fillRect(x - 6, y - 13, 1, 1); } }
};
TOOL_PIX.hand = null;
// Hache, pioche, faucille, épée : arc de mouvement selon la direction (p de 0 à 1).
export function drawSwing(c, S, tool, p) {
  const draw = TOOL_PIX[tool]; if (!draw) return;
  const hx = [6, 6, 3, 9][S.dir], hy = [13, 10, 12, 12][S.dir];
  const e = p < .35 ? -(p / .35) * .3 : (p - .35) / .65; // petit élan puis coup
  const arcs = { 0: [-.3, 2.9], 1: [.2, -.3], 2: [.4, -1.8], 3: [-.4, 1.8] };
  const [a0, a1] = arcs[S.dir], a = a0 + (a1 - a0) * Math.max(0, e);
  const step = Math.round(a / (Math.PI / 8)) * (Math.PI / 8); // angles quantifiés : rendu pixel net
  const ox = Math.round(S.x * T - 6), oy = Math.round(S.y * T - 19), L = S.look || {};
  const armPix = (pts, hand) => {   // bras : contour sombre, manche, puis avant-bras et main
    c.fillStyle = '#241a14'; for (const [x, y] of pts) c.fillRect(x - 2, y - 2, 4, 4);
    c.fillStyle = shade(L.shirt || '#d04a3a', .78); pts.slice(0, -2).forEach(([x, y]) => c.fillRect(x - 1, y - 1, 2, 2));
    c.fillStyle = L.skin || '#f6d2b0'; pts.slice(-3).forEach(([x, y]) => c.fillRect(x - 1, y - 1, 2, 2)); c.fillRect(hand[0] - 1, hand[1] - 1, 3, 3);
  };
  if (S.dir < 2) { // de face / de dos : l'outil monte au-dessus de la tête puis s'abat vers l'avant (vu en raccourci)
    const th = -0.5 + (S.dir === 0 ? 3.1 : 2.4) * Math.max(0, e), f = Math.round(Math.cos(th) * 4) / 4;
    const sx = ox + 9, sy = oy + 11, hy = Math.round(sy - 7 * f);
    const pts = []; for (let k = 0; k <= 7; k++) pts.push([sx, Math.round(sy + (hy - sy) * k / 7)]);
    if (S.dir === 0) armPix(pts, [sx, hy]);
    c.save(); c.translate(sx + 2, hy); c.scale(1, Math.abs(f) < .25 ? (f < 0 ? -.25 : .25) : f); draw(c); c.restore();
    if (S.dir === 1) armPix(pts, [sx, hy]);
    return;
  }
  // de profil : le bras suit l'outil, levé pendant l'élan, abaissé pendant le coup
  const sh = [[6, 11], [6, 10], [4, 11], [8, 11]][S.dir];
  const dx = Math.sin(step), dy = -Math.cos(step);
  const AL = 7, hxp = Math.round(ox + sh[0] + dx * AL), hyp = Math.round(oy + sh[1] + dy * AL);
  const pt = k => [Math.round(ox + sh[0] + dx * k), Math.round(oy + sh[1] + dy * k)];
  c.fillStyle = '#241a14'; for (let k = 0; k <= AL; k++) { const [x, y] = pt(k); c.fillRect(x - 2, y - 2, 4, 4); }   // contour sombre : le bras se détache du corps
  c.fillStyle = shade(L.shirt || '#d04a3a', .78); for (let k = 0; k <= AL - 2; k++) { const [x, y] = pt(k); c.fillRect(x - 1, y - 1, 2, 2); }   // manche
  c.fillStyle = L.skin || '#f6d2b0'; for (let k = AL - 2; k <= AL; k++) { const [x, y] = pt(k); c.fillRect(x - 1, y - 1, 2, 2); }   // avant-bras et main
  c.fillRect(hxp - 1, hyp - 1, 3, 3);
  c.save(); c.translate(hxp, hyp); c.rotate(step);
  draw(c); c.restore();
}

/* ---------------- Arbres ---------------- */
const TREE_PAL = [
  ['#2c5f2a', '#4a8f36', '#78bd4a', '#f3a6c4'],
  ['#234f25', '#3b7f31', '#62a73f', null],
  ['#7e3417', '#c25e1d', '#eea13a', null],
  ['#4f5d63', '#7d9096', '#eef5f7', null]
];
export function treeSprite(season, v) {
  return cache('t' + season + v, () => {
    const s = canvas(34, 44), c = s.getContext('2d'), p = TREE_PAL[season], r = rng(v * 97 + 3);   // 7d : canopée sur 0-31
    // tronc + racines
    c.fillStyle = '#5b3a22'; c.fillRect(14, 26, 6, 16); c.fillRect(11, 39, 12, 3);
    c.fillStyle = '#7a4f2e'; c.fillRect(15, 26, 2, 15);
    c.fillStyle = '#3f2615'; c.fillRect(19, 27, 1, 14); c.fillRect(16, 32, 1, 2);
    // Farmwest (7d) : feuillage plus volumineux, lumière en haut à gauche, ombre en bas à droite
    const cx = 17 + (v % 3) - 1, dk = shade(p[0], .78);
    c.fillStyle = '#7a4f2e'; c.fillRect(11, 25, 4, 2); c.fillRect(20, 24, 4, 2);   // branches
    for (const [x, y, rad] of [[cx, 18, 13], [cx - 9, 21, 8], [cx + 9, 21, 8], [cx, 9, 10], [cx - 7, 12, 7], [cx + 7, 12, 7]]) disc(c, x, y, rad, dk);
    for (const [x, y, rad] of [[cx, 17, 12], [cx - 9, 20, 7], [cx + 8, 20, 7], [cx, 9, 9], [cx - 6, 12, 6], [cx + 7, 12, 6]]) disc(c, x, y, rad, p[0]);
    for (const [x, y, rad] of [[cx - 2, 15, 9], [cx - 9, 18, 5], [cx + 5, 17, 5], [cx - 1, 8, 7], [cx - 7, 11, 4]]) disc(c, x, y, rad, p[1]);
    for (const [x, y, rad] of [[cx - 4, 6, 4], [cx - 9, 15, 3], [cx + 1, 12, 3], [cx - 5, 13, 2], [cx + 4, 8, 2]]) disc(c, x, y, rad, p[2]);
    for (const [x, y] of [[cx + 4, 25], [cx - 3, 26], [cx + 10, 23]]) { c.fillStyle = dk; c.fillRect(x, y, 3, 1); }   // dessous dans l'ombre
    // tramage pour la texture
    for (let i = 0; i < 40; i++) { const x = 6 + r() * 22 | 0, y = 2 + r() * 26 | 0; c.fillStyle = r() < .5 ? p[0] : p[2]; if (c.getImageData(x, y, 1, 1).data[3]) c.fillRect(x, y, 1, 1); }
    if (p[3]) for (let i = 0; i < 8; i++) { const x = 6 + r() * 22 | 0, y = 4 + r() * 20 | 0; if (c.getImageData(x, y, 1, 1).data[3]) { c.fillStyle = p[3]; c.fillRect(x, y, 2, 2); } }
    return outline(s, '#1e2a17');
  });
}
// Sapin : étages de branches en triangle, reste vert l'hiver (neige sur les branches).
const PINE_PAL = [['#1f4a34', '#2f6b47', '#4f9461'], ['#1c4530', '#2b6342', '#468a58'], ['#1f4a34', '#2f6b47', '#5a9461'], ['#1f4234', '#2c5c45', '#eef5f7']];
export function pineSprite(season, v) {
  return cache('p' + season + v, () => {
    const s = canvas(34, 46), c = s.getContext('2d'), p = PINE_PAL[season], r = rng(v * 53 + 11);
    c.fillStyle = '#5b3a22'; c.fillRect(15, 34, 4, 10); c.fillStyle = '#7a4f2e'; c.fillRect(15, 34, 1, 10);
    for (let k = 0; k < 4; k++) {
      const top = 2 + k * 8, h = 13, half = 6 + k * 3;
      for (let y = 0; y < h; y++) {
        const w = Math.round(1 + (y / h) * half);
        c.fillStyle = p[0]; c.fillRect(17 - w, top + y, w * 2, 1);
        c.fillStyle = p[1]; c.fillRect(17 - w, top + y, w, 1);
        if (y === h - 1 || y === h - 2) { c.fillStyle = p[2]; c.fillRect(17 - w + 1, top + y, Math.max(1, w - 2), 1); }
      }
    }
    for (let i = 0; i < 30; i++) { const x = 4 + r() * 26 | 0, y = 4 + r() * 34 | 0; if (c.getImageData(x, y, 1, 1).data[3]) { c.fillStyle = r() < .5 ? p[0] : p[2]; c.fillRect(x, y, 1, 1); } }
    return outline(s, '#13281c');
  });
}
// Bouleau : tronc blanc tacheté de noir, feuillage léger et clair.
const BIRCH_PAL = [['#4f8a35', '#79b54a', '#b4dc6e'], ['#47802f', '#6fa843', '#a2d062'], ['#b8761a', '#e6ad2c', '#ffe07a'], [null, null, null]];
export function birchSprite(season, v) {
  return cache('b' + season + v, () => {
    const s = canvas(34, 46), c = s.getContext('2d'), p = BIRCH_PAL[season], r = rng(v * 31 + 7);
    c.fillStyle = '#e9e4d6'; c.fillRect(15, 18, 4, 26); c.fillStyle = '#c9c2b0'; c.fillRect(18, 18, 1, 26);
    c.fillStyle = '#2d2a26'; for (const [a, b] of [[15, 22], [17, 27], [16, 32], [15, 37], [17, 41]]) c.fillRect(a, b, 2, 1);
    c.fillStyle = '#e9e4d6'; c.fillRect(19, 24, 5, 1); c.fillRect(11, 28, 4, 1);
    if (p[0]) {
      const cx = 17 + (v % 3) - 1;
      for (const [x, y, rad] of [[cx, 14, 10], [cx - 7, 19, 7], [cx + 7, 18, 7], [cx + 1, 6, 7]]) disc(c, x, y, rad, p[0]);
      for (const [x, y, rad] of [[cx - 1, 12, 8], [cx - 7, 17, 5], [cx + 6, 16, 5], [cx, 5, 5]]) disc(c, x, y, rad, p[1]);
      for (let i = 0; i < 34; i++) { const x = 6 + r() * 22 | 0, y = 1 + r() * 24 | 0; if (c.getImageData(x, y, 1, 1).data[3]) { c.fillStyle = p[2]; c.fillRect(x, y, 1, 1); } }
    } else {
      c.strokeStyle = '#8a8478'; c.lineWidth = 1; c.beginPath();
      for (const [a, b, d, e] of [[17, 18, 9, 6], [17, 20, 26, 8], [17, 14, 14, 2], [17, 16, 22, 3], [12, 11, 7, 7]]) { c.moveTo(a, b); c.lineTo(d, e); }
      c.stroke(); c.fillStyle = '#eef5f7'; for (const [x, y] of [[9, 6], [25, 8], [14, 2], [21, 3]]) c.fillRect(x - 1, y, 3, 1);
    }
    return outline(s, '#1e2a17');
  });
}
// Farmwest (7d) : cactus saguaro (bras levés, côtes, épines, fleur au printemps) et petites pierres du désert.
export function cactusSprite(season, v) {
  return cache('cac' + season + v, () => {
    const s = canvas(22, 34), c = s.getContext('2d'), G = '#3f8a4a', D = '#2c6638', Lt = '#6cb86a';
    const col = (x, y, w, h) => { c.fillStyle = G; c.fillRect(x, y, w, h); c.fillStyle = D; c.fillRect(x + w - 2, y, 2, h); c.fillStyle = Lt; c.fillRect(x + 1, y + 1, 1, h - 2); disc(c, x + w / 2, y, w / 2, G); c.fillStyle = Lt; c.fillRect(x + 1, y - 1, 2, 1); };
    col(8, 6, 6, 27);
    if (v % 2 === 0) { col(2, 12, 4, 8); c.fillStyle = G; c.fillRect(2, 18, 7, 3); }
    if (v !== 1) { col(16, 9, 4, 9 + v); c.fillStyle = G; c.fillRect(13, 16 + v, 7, 3); }
    c.fillStyle = '#f0ecd0'; for (const [x, y] of [[9, 10], [12, 15], [9, 21], [12, 27], [3, 15], [17, 13]]) c.fillRect(x, y, 1, 1);
    if (season === 0) { disc(c, 11, 4, 2, '#f07ab0'); c.fillStyle = '#ffe07a'; c.fillRect(11, 4, 1, 1); }
    if (season === 3) { c.fillStyle = '#eef5f7'; c.fillRect(8, 3, 6, 2); }
    return outline(s, '#16301c');
  });
}
export function pebbleSprite(v) {
  return cache('peb' + v, () => {
    const s = canvas(14, 10), c = s.getContext('2d');
    disc(c, 6, 6, 4, '#a0663e'); disc(c, 5, 5, 3, '#c98a56'); c.fillStyle = '#e0aa78'; c.fillRect(4, 3, 2, 1);
    if (v) { disc(c, 11, 7, 2, '#8a5a36'); c.fillStyle = '#b07a48'; c.fillRect(10, 6, 1, 1); }
    return outline(s, '#4a2a18');
  });
}
export const KIND_SPRITE = { oak: treeSprite, pine: pineSprite, birch: birchSprite };
const KIND_IDS = ['oak', 'pine', 'birch'];
// Jeune arbre : pousse (jour 0), arbuste (jour 1), petit arbre (jour 2), puis adulte.
function saplingSprite(kind, stage, season) {
  return cache('s' + kind + stage + season, () => {
    const s = canvas(20, 26), c = s.getContext('2d');
    const leaf = kind === 'pine' ? PINE_PAL[season][1] : kind === 'birch' ? (BIRCH_PAL[season][1] || '#8a8478') : (TREE_PAL[season][1]);
    const light = kind === 'pine' ? PINE_PAL[season][2] : kind === 'birch' ? (BIRCH_PAL[season][2] || '#eef5f7') : TREE_PAL[season][2];
    const trunk = kind === 'birch' ? '#e9e4d6' : '#6b4429';
    if (stage === 0) {
      c.fillStyle = '#4a3020'; c.fillRect(7, 23, 6, 2);
      c.fillStyle = leaf; c.fillRect(9, 18, 2, 6); c.fillRect(6, 17, 3, 2); c.fillRect(11, 16, 3, 2);
      c.fillStyle = light; c.fillRect(6, 17, 1, 1); c.fillRect(13, 16, 1, 1);
    } else if (stage === 1) {
      c.fillStyle = trunk; c.fillRect(9, 15, 2, 10);
      if (kind === 'pine') for (let y = 0; y < 12; y++) { const w = 1 + (y / 2 | 0); c.fillStyle = leaf; c.fillRect(10 - w, 5 + y, w * 2, 1); }
      else { disc(c, 10, 11, 5, leaf); disc(c, 9, 10, 3, light); }
    } else {
      c.fillStyle = trunk; c.fillRect(9, 12, 3, 13);
      if (kind === 'pine') for (let y = 0; y < 18; y++) { const w = 1 + (y / 2 | 0) % 6 + (y / 6 | 0); c.fillStyle = y % 6 > 3 ? light : leaf; c.fillRect(10 - w, 1 + y, w * 2, 1); }
      else { disc(c, 10, 8, 7, leaf); disc(c, 6, 11, 4, leaf); disc(c, 14, 11, 4, leaf); disc(c, 9, 7, 4, light); }
    }
    return outline(s, '#1e2a17');
  });
}
export function drawTree(c, x, y, o, season, t = 0) {
  const px = x * T, py = y * T, sh = o.shake > 0 ? Math.round(Math.sin(o.shake * 40) * 1.5) : 0;
  const kind = o.k || KIND_IDS[(x * 7 + y * 3) % 3], g = o.g ?? 3;
  if (g < 3) {
    groundShadow(c, px + 8, py + 14, 3 + g * 2, 1 + (g > 0), .25);
    c.drawImage(saplingSprite(kind, g, season), px - 2 + sh, py - 10);
    return;
  }
  groundShadow(c, px + 8, py + 14, 9, 3, .3);
  c.drawImage(KIND_SPRITE[kind](season, (x * 7 + y * 3) % 4), px - 9 + sh, py - (kind === 'oak' ? 28 : 30));
}

/* ---------------- Rochers ---------------- */
function boulderSprite() {
  return cache('bould', () => {
    const s = canvas(24, 20), c = s.getContext('2d');
    disc(c, 12, 12, 9, '#4d4955'); disc(c, 11, 11, 8, '#76727f'); disc(c, 8, 8, 4, '#a7a2ad'); disc(c, 15, 13, 3, '#5d5966');
    c.fillStyle = '#3c3843'; c.fillRect(13, 7, 1, 5); c.fillRect(14, 12, 3, 1); c.fillRect(7, 14, 4, 1);
    c.fillStyle = '#c98a4a'; c.fillRect(6, 11, 2, 1); c.fillRect(16, 9, 1, 2);
    c.fillStyle = '#3a3641'; c.fillRect(6, 19, 13, 1); c.fillRect(17, 16, 3, 3);   // 7d : base dans l'ombre
    c.fillStyle = '#d9d4de'; c.fillRect(6, 5, 4, 1); c.fillRect(5, 6, 1, 2);
    c.fillStyle = '#5f8a3a'; c.fillRect(4, 15, 4, 2); c.fillRect(5, 14, 2, 1);   // mousse
    return outline(s, '#25222b');
  });
}
function bigRockSprite(v) {
  return cache('rb' + v, () => {
    const s = canvas(22, 18), c = s.getContext('2d');
    disc(c, 11, 11, 7, '#524e5a'); disc(c, 10, 10, 6, '#7b7784'); disc(c, 15, 12, 4, '#6a6672'); disc(c, 7, 7, 3, '#aba6b2');
    c.fillStyle = '#423e48'; c.fillRect(12, 6, 1, 4); c.fillRect(13, 10, 3, 1); c.fillRect(6, 13, 3, 1);
    c.fillStyle = '#433f4a'; c.fillRect(6, 16, 11, 1); c.fillRect(15, 14, 3, 2);   // 7d : ombre et facettes
    c.fillStyle = '#d6d1db'; c.fillRect(6, 5, 3, 1); c.fillRect(5, 6, 1, 2);
    if (v) { c.fillStyle = '#6f9a45'; c.fillRect(3, 15, 4, 1); c.fillRect(17, 15, 3, 1); c.fillRect(4, 14, 1, 1); }
    return outline(s, '#27232c');
  });
}
function rockSprite(v) {
  return cache('r' + v, () => {
    const s = canvas(18, 15), c = s.getContext('2d');
    disc(c, 9, 9, 6, '#57535e'); disc(c, 8, 8, 5, '#827e8a'); disc(c, 6, 6, 2, '#b4afba');
    c.fillStyle = '#4a4650'; c.fillRect(10, 7, 1, 3); c.fillRect(11, 10, 2, 1);
    c.fillStyle = '#45414c'; c.fillRect(5, 13, 8, 1); c.fillRect(12, 11, 2, 2);   // 7d : dessous dans l'ombre
    c.fillStyle = '#d6d1db'; c.fillRect(5, 5, 2, 1); c.fillRect(4, 6, 1, 1);   // reflet
    if (v) { c.fillStyle = '#6f9a45'; c.fillRect(4, 12, 3, 1); c.fillRect(5, 11, 1, 1); }
    return outline(s, '#2a2630');
  });
}
// Pierre trop dure pour la pioche actuelle : même dessin, bien plus foncé (avec des reflets violets).
const DARK = new WeakMap();
function darkOf(spr) {
  let d = DARK.get(spr);
  if (!d) { d = canvas(spr.width, spr.height); const x = d.getContext('2d'); x.drawImage(spr, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(28,20,40,.62)'; x.fillRect(0, 0, d.width, d.height); x.fillStyle = 'rgba(150,120,220,.5)'; for (let i = 3; i < d.width - 3; i += 5) x.fillRect(i, 3 + (i % 3), 1, 1); DARK.set(spr, d); }
  return d;
}
export function drawRock(c, x, y, o, hard = false) {
  const px = x * T + (o.shake > 0 ? Math.round(Math.sin(o.shake * 40)) : 0), py = y * T, sk = s => hard ? darkOf(s) : s;
  if (o.t === 'boulder') { groundShadow(c, px + 8, py + 14, 10, 3, .3); c.drawImage(sk(boulderSprite()), px - 4, py - 5); return; }
  if (o.t === 'rock_big') { groundShadow(c, px + 8, py + 14, 8, 2, .28); c.drawImage(sk(bigRockSprite((x + y) % 2)), px - 3, py - 2); return; }
  groundShadow(c, px + 8, py + 13, 7, 2, .25);
  c.drawImage(sk(rockSprite((x + y) % 2)), px - 1, py);
}

/* ---------------- Cultures ---------------- */
const STEM = '#3f7a28', LEAF = '#64ad3c', LEAF_L = '#8fd05a';
export function drawCrop(c, x, y, p, now) {
  const pr = cropProgress(p, now), px = x * T, py = y * T, R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(px + a, py + b, w, h); };
  if (pr < .25) { R(5, 10, 6, 2, '#5e391e'); R(7, 9, 2, 1, '#94643a'); return; }
  if (pr < .6) { R(7, 7, 2, 5, STEM); R(4, 6, 3, 2, LEAF); R(9, 5, 3, 2, LEAF); R(4, 6, 1, 1, LEAF_L); return; }
  const ripe = pr >= 1, b = ripe && Math.sin(now / 220 + x * 1.7) > .8 ? -1 : 0;
  if (p.crop === 'wheat') {
    const col = ripe ? '#d9a93a' : '#8fb84a', head = ripe ? '#f2d16b' : '#a9cc5c';
    for (const sx of [3, 6, 9, 12]) { R(sx, 3 + b, 1, 10, col); R(sx - 1, 1 + b, 2, 4, head); if (ripe) R(sx, 2 + b, 1, 1, '#a8781e'); }
  } else if (p.crop === 'corn') {
    R(7, -6 + b, 2, 18, STEM); R(3, 2, 4, 2, LEAF); R(9, -1, 4, 2, LEAF); R(4, 7, 3, 1, LEAF_L);
    if (ripe) { R(9, -5 + b, 3, 6, '#f2d13b'); R(9, -5 + b, 1, 6, '#c9a320'); R(12, -4 + b, 1, 5, LEAF); }
  } else if (p.crop === 'hay') {
    const col = ripe ? '#c9b04a' : '#7fae4a', top = ripe ? '#e6d27a' : '#a6cc66';
    for (const [sx, h] of [[2, 9], [4, 11], [6, 8], [8, 12], [10, 9], [12, 10]]) { R(sx, 13 - h + b, 1, h, col); R(sx, 13 - h + b, 1, 2, top); }
  } else {
    R(4, 2 + b, 2, 7, LEAF); R(7, 0 + b, 2, 9, LEAF_L); R(10, 2 + b, 2, 7, LEAF); R(6, 4 + b, 4, 3, LEAF);
    if (ripe) { R(5, 9, 6, 3, '#ef7b2a'); R(5, 9, 6, 1, '#f9a35b'); }
  }
  if (ripe && ((now / 260 | 0) + x) % 6 === 0) { R(12, 0, 1, 1, '#fff'); R(11, 1, 3, 1, '#fff9'); }
}

/* ---------------- Poule ---------------- */
function chickenSprite(flip, st = 0) {   // 7e : pattes et aile qui bougent en marchant
  return cache('k' + flip + st, () => {
    const s = canvas(14, 14), c = s.getContext('2d');
    if (flip) { c.translate(14, 0); c.scale(-1, 1); }
    const R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(a, b, w, h); };
    R(2, 6, 9, 5, '#fbf6ec'); R(2, 10, 9, 1, '#d9cfbd'); R(4, 7, 4, 3, '#e6dccb'); R(1, 5, 2, 3, '#efe7d8');
    R(8, 2, 4, 5, '#fbf6ec'); R(9, 0, 2, 2, '#d8342a'); R(12, 4, 2, 1, '#f0a020'); R(10, 3, 1, 1, '#2a1d18'); R(10, 6, 1, 2, '#d8342a');
    R(5 - st, 11, 1, 2, '#e08a1a'); R(8 + st, 11, 1, 2, '#e08a1a'); R(4 - st, 12, 1, 1, '#e08a1a'); R(9 + st, 12, 1, 1, '#e08a1a');
    R(4, 7 - st, 4, 2, '#d9cfbd'); R(1, 4 - st, 1, 2, '#e8dccb');   // aile et queue
    return outline(s, '#3a2a20');
  });
}
export function drawChicken(c, a, now) {
  const px = Math.round(a.x * T), py = Math.round(a.y * T + (a.moving ? Math.sin(now / 80) : 0));
  groundShadow(c, px, py + 5, 5, 2);
  { const im = aniSprite('chicken', !!a.f, a.moving ? (now / 120 | 0) % 2 : 0); c.drawImage(im, px - (im.width >> 1), py + 6 - im.height); }
  if (a.produced) { bubble(c, px, py - 14); c.fillStyle = '#fdf6e3'; c.fillRect(px - 2, py - 18, 4, 5); c.fillRect(px - 1, py - 19, 2, 1); }
  if (a.heart > 0) { const hy = py - 14 - (1 - a.heart) * 8; c.fillStyle = '#ff5a7a'; c.fillRect(px - 3, hy, 2, 2); c.fillRect(px + 1, hy, 2, 2); c.fillRect(px - 3, hy + 1, 6, 2); c.fillRect(px - 2, hy + 3, 4, 1); c.fillRect(px - 1, hy + 4, 2, 1); }
}
function bubble(c, x, y) {
  c.fillStyle = '#2b1b14'; c.fillRect(x - 5, y - 7, 10, 9);
  c.fillStyle = '#fff6e0'; c.fillRect(x - 4, y - 6, 8, 7); c.fillRect(x - 1, y + 1, 2, 2);
}

/* ---------------- Slime ---------------- */
function slimeSprite(hit) {
  return cache('s' + hit, () => {
    const s = canvas(16, 13), c = s.getContext('2d'), base = hit ? '#ffffff' : '#56c45a';
    disc(c, 8, 9, 6, shade(base, .8)); disc(c, 8, 8, 5, base); disc(c, 6, 6, 2, shade(base, 1.3));
    c.fillRect(2, 9, 12, 3); c.fillStyle = shade(base, .7); c.fillRect(2, 11, 12, 1);
    c.fillStyle = '#123'; c.fillRect(5, 7, 2, 2); c.fillRect(9, 7, 2, 2);
    return outline(s, '#1d3a1e');
  });
}
export function drawSlime(c, e, now) { drawJelly(c, Math.round(e.x * T), Math.round(e.y * T) + 4, '#56c45a', now, e.x, e.hit > 0, 180); }

// Slime : goutte de gelée à fond plat qui s'écrase et s'étire en sautillant, contour sombre,
// cœur translucide, gros reflet brillant, deux yeux et une petite bouche.
export function drawJelly(c, px, py, col, now, seed, hit, speed = 180) {
  const ph = Math.sin(now / speed + seed * 3), up = Math.max(0, ph) * 4 | 0;   // saut
  const sq = ph < 0 ? -ph : 0, w = Math.round(7 + sq * 2), h = Math.round(9 - sq * 2 + (up ? 1 : 0));
  const base = hit ? '#ffffff' : col, dark = shade(base, .55), mid = shade(base, .8), light = shade(base, 1.25);
  groundShadow(c, px, py, w - up / 2, 2, .3);
  const top = py - h - up, R = (x, y, ww, hh, cc) => { c.fillStyle = cc; c.fillRect(x, y, ww, hh); };
  for (let i = 0; i <= h; i++) {   // dôme rangée par rangée
    const t = (h - i) / h, hw = i === h ? w - 1 : Math.max(1, Math.round(w * Math.sqrt(1 - t * t * .92)));
    R(px - hw - 1, top + i, 1, 1, dark); R(px + hw, top + i, 1, 1, dark);
    R(px - hw, top + i, hw * 2, 1, i > h * .6 ? mid : base);
  }
  R(px - w + 1, top + h + 1, w * 2 - 2, 1, dark);                                // fond plat
  R(px - w + 2, top - 1, (w - 2) * 2, 1, dark);                                    // sommet
  c.globalAlpha = .35; R(px - 2, top + h - 4, 5, 3, light); c.globalAlpha = 1;     // cœur translucide
  R(px - w + 2, top + 2, 2, 2, '#ffffff'); R(px - w + 4, top + 1, 2, 1, light);    // reflet
  const ey = top + Math.round(h * .45);
  R(px - 3, ey, 2, 3, '#1a1420'); R(px + 2, ey, 2, 3, '#1a1420'); R(px - 3, ey, 1, 1, '#fff'); R(px + 2, ey, 1, 1, '#fff');
  R(px - 1, ey + 4, 3, 1, dark);                                                   // bouche
  if (!up) { R(px + w - 3, top + h + 1, 1, 2, mid); }                              // petite goutte
}

/* ---------------- Lapin, mouton, chat ---------------- */
// Animaux façon Stardew (dessinés en pixels, tête à gauche ; retournés selon le sens de marche) : 3 tons, contour coloré.
const ANI = {
  chicken: { pal: { o: '#6a4a3a', W: '#fffaf0', w: '#e8dccc', g: '#c8b8a6', R: '#e0402a', Y: '#f2b030', e: '#2a2030', l: '#e89a30' }, rows: [
    '......oRo.......', '.....oRRRo......', '.....oWWWWo.....', '...ooWeWWWo.....', '..oYYWWWWWo.....', '...ooRWWWWo..ooo',
    '.....oWWWWWooWWo', '....oWWWWWWWWWwo', '...oWWWWWWWWWwwo', '...oWWwwwWWWwwo.', '...oWWwggwWwwwo.', '....owwwwwwwwo..', '.....oooooooo...'],
    legs: [['.......l..l.....', '......ll.ll.....'], ['......l...l.....', '.....ll...ll....']] },
  pig: { pal: { o: '#6e3a3a', P: '#f0a8a8', p: '#d08484', q: '#ffd4d4', n: '#e68c8c', N: '#8a4a4a', e: '#2a2030' }, rows: [
    '....oo..............', '...oPPo..oooooooo...', '..oPPPPooqqqqqqqqo..', '.onnPePPPqPPPPPPPPo.', 'onNnPPPPPPPPPPPPPPo.',
    'onnnPPPPPPPPPPPPPPpo', '.onnPPPPPPPPPPPPPppo', '..oPPPPPPPPPPPPPppo.', '..opPPPPPPPPPPPpppo.', '...oppppppppppppoo..'],
    legs: [['...opo.opo..opo.opo.', '...ooo.ooo..ooo.ooo.'], ['..opo..opo...opo.opo', '..ooo..ooo...ooo.ooo']] },
  sheep: { pal: { o: '#4a3a3a', W: '#f6f2ea', V: '#d6cec2', f: '#3a3036', e: '#f2e8d0' }, rows: [
    '.......ooo.ooo.oo...', '.....ooWWWoWWWoWWo..', '..oooWWWVWWWVWWWVWo.', '.offfoWWWWWWWWWWWWWo', 'offefoWVWWWVWWWWVWWo',
    'offfffWWWWWWWWWWWWVo', '.offfoWWWVWWWWVWWWWo', '..ooooWWWWWWWWWWWWo.', '.....oVWWWVWWWVWWo..', '......ooooooooooo...'],
    legs: [['......ofo.ofo.ofo.ofo', '......ooo.ooo.ooo.ooo'], ['.....ofo..ofo..ofo.of', '.....ooo..ooo..ooo.oo']] },
  rabbit: { pal: { o: '#7a6a5a', W: '#f4efe6', w: '#ddd4c6', k: '#f2b8c6', e: '#2a2030', n: '#f08aa0' }, rows: [
    '...oo.oo........', '..oWkoWko.......', '..oWkoWko.......', '..oWWoWWo.......', '.oWWWWWWWo......', 'oeWWWWWWWoooo...',
    'onWWWWWWWWWWWo..', '.owWWWWWWWWWWWo.', '..owWWWWWWWWWWWo', '...owwWWWWWWwwo.', '....oooooooooo..'],
    legs: [['.....ow..ow.....', '.....oo..oo.....'], ['....ow....ow....', '....oo....oo....']] },
  dog: { pal: { o: '#5a3a22', C: '#c99560', c: '#a8774a', l: '#e8c08a', d: '#8a5a32', e: '#2a2030', n: '#3a2a20', R: '#c0392b' }, rows: [
    '..ooooo.............', '.oCCCCCo............', 'odCCCeCCoo..........', 'odCCCCCCCno.........', '.odCCCCCCCo.......o.',
    '..oRRRRCCCoooooooooCo', '...oRRlCCCCCCCCCCCo.', '....oClllCCCCCCCCco.', '....oCCCCCCCCCCCcco.', '.....occccccccccco..'],
    legs: [['.....odo.odo..odo.odo', '.....ooo.ooo..ooo.ooo'], ['....odo..odo.odo..odo', '....ooo..ooo.ooo..ooo']] },
  cat: { pal: { o: '#6a3a1a', O: '#e08a3a', d: '#b8642a', l: '#f5e2c8', k: '#f2b8a0', e: '#2a6a2a', n: '#f08aa0' }, rows: [
    '.o...o..........', 'oOo.oOo.........', 'okOOOkO.........', 'oOeOOeOo........', 'oOOnOOOo.....o..', '.olllOOOoooooOo.',
    '..oOdOOdOOdOOOo.', '..oOOdOOdOOdOOo.', '...oOOOOOOOOOo..'],
    legs: [['...oOo...oOo....', '...ooo...ooo....'], ['..oOo.....oOo...', '..ooo.....ooo...']] }
};
function aniSprite(type, flip, st) {
  return cache('A' + type + flip + st, () => {
    const A = ANI[type], rows = [...A.rows, ...A.legs[st ? 1 : 0]], w = Math.max(...rows.map(x => x.length)), h = rows.length;
    const s = canvas(w, h), c = s.getContext('2d');
    if (!flip) { c.translate(w, 0); c.scale(-1, 1); }   // dessiné tête à gauche : on le retourne pour regarder à droite
    rows.forEach((row, y) => [...row].forEach((ch, x) => { const col = A.pal[ch]; if (col) { c.fillStyle = col; c.fillRect(x, y, 1, 1); } }));
    return harmonize(s);
  });
}
function animalSprite(type, flip, sit, st = 0) { return aniSprite(ANI[type] ? type : 'cat', flip, st); }

const PROD_COL = { egg: '#fdf6e3', wool: '#ffffff', rabbit_wool: '#f6dfe6', truffle: '#6b4a36' };
export function drawAnimal(c, a, now, def) {
  if (a.type === 'chicken') return drawChicken(c, a, now);
  const px = Math.round(a.x * T), py = Math.round(a.y * T + (a.moving ? Math.sin(now / (a.type === 'rabbit' ? 60 : 110)) * (a.type === 'rabbit' ? 2 : 1) : 0));
  groundShadow(c, px, py + 5, a.type === 'sheep' ? 7 : 5, 2);
  { const im = animalSprite(a.type, !!a.f, 0, a.moving ? (now / 150 | 0) % 2 : 0); c.drawImage(im, px - (im.width >> 1), py + 6 - im.height); }   // pattes au sol
  if (a.produced && def && def.prod) { bubble(c, px, py - 15); c.fillStyle = PROD_COL[def.prod] || '#fff'; c.fillRect(px - 3, py - 20, 6, 4); }
  if (a.heart > 0) { const hy = py - 15 - (1 - a.heart) * 8; c.fillStyle = '#ff5a7a'; c.fillRect(px - 3, hy, 2, 2); c.fillRect(px + 1, hy, 2, 2); c.fillRect(px - 3, hy + 1, 6, 2); c.fillRect(px - 2, hy + 3, 4, 1); c.fillRect(px - 1, hy + 4, 2, 1); }
}
