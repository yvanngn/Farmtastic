// 18/11 (soir) : décors animés au niveau des personnages « pixel moderne » : même moteur (formes vectorielles → pixels,
// 4 tons par couleur, contour teinté). Diligence (caisse, roues qui tournent, chevaux au trot, cocher), locomotive et wagons,
// fontaines. Chaque image n'est calculée qu'une fois (cache).
import { renderPixel, folkSprite, CAST } from './folk.js';

const P2 = f => { const p = new Path2D(); f(p); p.closePath(); return p; };
const E = (cx, cy, rx, ry) => P2(p => p.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2));
const RR = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };
const POLY = (...a) => P2(p => { p.moveTo(a[0], a[1]); for (let i = 2; i < a.length; i += 2) p.lineTo(a[i], a[i + 1]); });
const CACHE = new Map();
const cached = (k, f) => { if (typeof document === 'undefined') return null; let v = CACHE.get(k); if (!v) { v = f(); CACHE.set(k, v); } return v; };
const draw = (parts, mats, W, H, pattern = {}, feat = []) => renderPixel({ parts, feat, mats, pattern }, W, H, { s: 1, shade: 1, deep: true, selout: true, inner: true, noStrands: true });

// ---------- diligence (vue de côté, vers la droite) : 104 × 72 (le cocher dépasse au-dessus) ----------
const COACH_MATS = { lac: '#9a2c22', lacL: '#c04a34', gold: '#e8c26a', wood: '#6a4426', woodL: '#8a5a32', roof: '#3a2414', win: '#ffe8a8', curtain: '#c84a3a', lamp: '#3a2414', light: '#ffd98a', luggage: '#a8774a', bag: '#3e5a7a', iron: '#3a3036', seat: '#5a3a22' };
export function coachBody() {
  return cached('coach', () => {
    const p = [], A = (path, mat, z) => p.push({ path, mat, z });
    A(RR(10, 14, 50, 34, 4), 'lac', 3);                                                 // caisse laquée
    A(POLY(8, 14, 62, 14, 66, 10, 4, 10), 'roof', 4); A(RR(12, 4, 44, 7, 2), 'luggage', 2); A(RR(18, 0, 14, 6, 2), 'luggage', 2.5); A(RR(36, 1, 12, 5, 2), 'bag', 2.5);
    A(RR(10, 22, 50, 2, 1), 'gold', 5); A(RR(10, 40, 50, 2, 1), 'gold', 5);
    for (const wx of [14, 42]) { A(RR(wx, 20, 12, 12, 2), 'gold', 6); A(RR(wx + 1, 21, 10, 10, 1), 'win', 7); A(RR(wx + 1, 21, 3, 10, 1), 'curtain', 8); A(RR(wx + 8, 21, 3, 10, 1), 'curtain', 8); }
    A(RR(28, 18, 12, 28, 2), 'lacL', 6); A(E(37, 32, 1.2, 1.2), 'gold', 7);           // porte
    A(RR(62, 30, 22, 4, 1), 'wood', 2); A(RR(64, 22, 14, 9, 2), 'seat', 2.2);          // banc du cocher
    A(RR(4, 22, 5, 8, 1), 'lamp', 6); A(RR(5, 23, 3, 4, 1), 'light', 7); A(RR(61, 22, 5, 8, 1), 'lamp', 6); A(RR(62, 23, 3, 4, 1), 'light', 7);
    A(RR(14, 47, 46, 3, 1), 'iron', 2); A(RR(84, 31, 20, 2, 1), 'wood', 1);           // châssis, timon
    const im = draw(p, COACH_MATS, 104, 64), o = document.createElement('canvas'); o.width = 104; o.height = 72; const g = o.getContext('2d');
    // le cocher (personnage « pixel moderne », haut du corps, de profil) assis sur le banc, derrière le dossier
    const ch = folkSprite(CAST.cocher, 3, 0); if (ch) g.drawImage(ch, 0, 0, 32, 40, 60, 0, 24, 30);
    g.drawImage(im, 0, 8);
    return o;
  });
}
export function coachWheel(r, step) {   // roue à rayons, 8 positions
  return cached('wheel' + r + ':' + step, () => {
    const p = [], A = (path, mat, z) => p.push({ path, mat, z }), c = r + 1, ring = new Path2D();
    ring.ellipse(c, c, r, r, 0, 0, Math.PI * 2); ring.ellipse(c, c, r - 2.2, r - 2.2, 0, Math.PI * 2, 0, true);
    A(ring, 'tire', 3);
    for (let k = 0; k < 6; k++) { const a = step / 8 * Math.PI / 3 + k * Math.PI / 3, dx = Math.cos(a), dy = Math.sin(a);
      A(POLY(c - dy, c + dx, c + dx * (r - 1.5) - dy, c + dy * (r - 1.5) + dx, c + dx * (r - 1.5) + dy, c + dy * (r - 1.5) - dx, c + dy, c - dx), 'spoke', 2); }
    A(E(c, c, 2.2, 2.2), 'hub', 4);
    return renderPixel({ parts: p, feat: [], mats: { tire: '#8a5a32', spoke: '#c99560', hub: '#e8c26a' }, pattern: {} }, 2 * r + 2, 2 * r + 2, { s: 1, shade: 1, selout: true, inner: true, noStrands: true });
  });
}
export function horse(coat, frame) {   // cheval au trot (4 images), 34 × 26, vers la droite
  return cached('horse' + coat + frame, () => {
    const p = [], A = (path, mat, z) => p.push({ path, mat, z }), k = [0, 1, 0, -1][frame], lift = [[3, 0], [0, 3], [0, 0], [3, 0]][frame];
    for (const [x, l, z] of [[7, lift[0], 1], [11, lift[1], 1.5], [22, lift[1], 1], [26, lift[0], 1.5]]) { A(RR(x, 15 + k, 3.4, 9 - l, 1), z === 1 ? 'coatD' : 'coat', z); A(RR(x - .3, 23 - l + k, 4, 2, .5), 'hoof', z + .1); }
    A(E(17, 12 + k, 12, 6.5), 'coat', 3); A(POLY(25, 9 + k, 30, 1 + k, 34, 3 + k, 33, 7 + k, 29, 9 + k, 28, 14 + k), 'coat', 4);   // corps, encolure et tête
    A(POLY(24, 8 + k, 29, 0 + k, 27, 0 + k, 22, 8 + k), 'mane', 5); A(POLY(5, 9 + k, 1, 12 + k, 2, 20 + k, 6, 13 + k), 'mane', 2.5);   // crinière, queue
    A(RR(14, 9 + k, 2, 8, 1), 'harness', 6); A(RR(10, 10 + k, 16, 2, 1), 'harness', 6);
    return draw(p, { coat, coatD: coat, mane: '#2a1a10', hoof: '#1a1010', harness: '#8a2a1a' }, 34, 26, {}, [{ t: 'px', x: 30, y: 2 + k, col: '#1a1010' }]);
  });
}

// ---------- train (vu de dessus, vers le sud) : locomotive 30 × 72, wagon 30 × 46 ----------
export function locoSprite() {
  return cached('loco', () => {
    const p = [], A = (path, mat, z) => p.push({ path, mat, z });
    A(RR(1, 0, 28, 70, 3), 'body', 1);                                                   // châssis
    A(RR(4, 4, 22, 42, 9), 'boiler', 2);                                                 // chaudière
    for (const b of [12, 24, 36]) A(RR(3, b, 24, 2.4, 1), 'brass', 3);                  // cerclages laiton
    A(E(15, 18, 5, 5), 'stack', 4); A(E(15, 18, 3, 3), 'soot', 5);                     // cheminée
    A(E(15, 32, 3.5, 3.5), 'brass', 4);                                                  // dôme de vapeur
    A(RR(5, 46, 20, 14, 2), 'cab', 3); A(RR(7, 48, 16, 4, 1), 'roofC', 4); A(RR(10, 53, 10, 5, 1), 'light', 4);   // cabine éclairée
    A(POLY(3, 61, 27, 61, 24, 72, 6, 72), 'cab', 3);                                    // chasse-buffle
    for (let k = 0; k < 5; k++) A(RR(7 + k * 3.6, 63, 1.8, 8, .5), 'iron', 4);
    return draw(p, { body: '#2a2a32', boiler: '#3a3a48', brass: '#e8c26a', stack: '#1e1e26', soot: '#0e0e12', cab: '#a8302b', roofC: '#6a1e1a', light: '#ffd98a', iron: '#5a5a66' }, 30, 72);
  });
}
export function wagonSprite(hero) {
  return cached('wagon' + (hero ? JSON.stringify([hero.skin, hero.hairC]) : ''), () => {
    const p = [], A = (path, mat, z) => p.push({ path, mat, z });
    A(RR(1, 1, 28, 44, 3), 'wood', 1); A(RR(3, 3, 24, 40, 2), 'roof', 2);
    for (let y = 6; y < 42; y += 5) A(RR(3, y, 24, 1.2, .5), 'roofL', 3);
    A(RR(1, 1, 28, 2.6, 1), 'iron', 3); A(RR(1, 42.4, 28, 2.6, 1), 'iron', 3);
    for (const w of [8, 18, 28, 38]) if (w < 42) A(RR(25, w - 3, 4, 5, 1), 'win', 4);   // fenêtres côté quai
    A(RR(26.5, 15, 2.5, 16, 1), 'door', 4);
    const feat = hero ? [{ t: 'px', x: 26, y: 19, w: 2, h: 2, col: hero.skin || '#e8b48c' }, { t: 'px', x: 26, y: 18, w: 2, h: 1, col: hero.hairC || '#5a3a22' }] : [];
    return draw(p, { wood: '#7a3a2a', roof: '#5a2a22', roofL: '#7a3a2a', iron: '#3a2a20', win: '#ffd98a', door: '#3a2a20' }, 30, 46, {}, feat);
  });
}

// ---------- fontaines (vue de 3/4) ----------
export function fountainSprite(r) {   // r = rayon du bassin (px)
  return cached('fountain' + r, () => {
    const W = 2 * r + 6, H = Math.round(r * 1.4) + 30, cx = W / 2, cy = H - r * .62 - 4, p = [], A = (path, mat, z) => p.push({ path, mat, z });
    A(E(cx, cy + 3, r + 1, r * .62 + 1), 'stoneD', 1); A(E(cx, cy, r + 1, r * .62 + 1), 'stone', 2);           // margelle
    A(E(cx, cy, r - 3, r * .62 - 3), 'water', 3);                                                              // bassin
    A(E(cx, cy - 1, r * .32, r * .2), 'stone', 4); A(RR(cx - 3, cy - 18, 6, 18, 2), 'stone', 5);             // colonne
    A(E(cx, cy - 18, 9, 4), 'stone', 6); A(E(cx, cy - 19, 7, 2.6), 'water', 7); A(RR(cx - 1.5, cy - 27, 3, 9, 1.5), 'jet', 8);   // vasque, jet
    const sparkles = [];
    for (let k = 0; k < 6; k++) { const a = k * 1.1; sparkles.push({ t: 'px', x: cx + Math.cos(a) * r * .6, y: cy + Math.sin(a) * r * .35, w: 3, h: 1, col: '#e1f4ff' }); }
    return draw(p, { stone: '#c8bca8', stoneD: '#8a7e70', water: '#3f86c4', jet: '#bfe3f5' }, Math.ceil(W), Math.ceil(H), {}, sparkles);
  });
}
