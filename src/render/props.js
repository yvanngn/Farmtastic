// 18/11 (soir) : décors animés au niveau des personnages « pixel moderne » : même moteur (formes vectorielles → pixels,
// 4 tons par couleur, contour teinté). Diligence (caisse, roues qui tournent, chevaux au trot, cocher), locomotive et wagons,
// fontaines. Chaque image n'est calculée qu'une fois (cache).
import { renderPixel, folkSprite, CAST, tones } from './folk.js';

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
    A(E(16, 13 + k, 11, 6), 'coat', 3);   // corps
    A(POLY(21, 10 + k, 24, 3 + k, 28, 2 + k, 28, 8 + k, 26, 14 + k), 'coat', 4);   // 19/11 : encolure
    A(POLY(25, 2 + k, 28, 0 + k, 31, 1 + k, 34, 6 + k, 33, 9 + k, 30, 9 + k, 26, 6 + k), 'coat', 4.5);   // tête allongée
    A(E(32.4, 7.6 + k, 1.8, 1.5), 'muzzle', 4.7); A(POLY(26, 2 + k, 26.5, -1 + k, 28.5, 1 + k), 'coatD', 4.6);   // museau, oreille
    A(POLY(20, 10 + k, 24, 2 + k, 26.5, 1 + k, 23, 9 + k, 22, 12 + k), 'mane', 5); A(POLY(5, 10 + k, 1, 12 + k, 2, 20 + k, 6, 14 + k), 'mane', 2.5);   // crinière, queue
    A(RR(13, 9 + k, 2, 8, 1), 'harness', 6); A(RR(9, 10 + k, 14, 2, 1), 'harness', 6); A(RR(27, 4 + k, 5, 1.2, .5), 'harness', 6);
    return draw(p, { coat, coatD: coat, mane: '#2a1a10', hoof: '#1a1010', harness: '#8a2a1a', muzzle: '#3a2418' }, 34, 26, {}, [{ t: 'px', x: 29, y: 3 + k, col: '#1a1010' }]);
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

// ---------- façade western (centre-ville) : fausse façade en gradins, planches, corniche, fenêtres de l'étage, auvent sur poteaux,
// vitrines éclairées et porte. Image (uw + 12) × (hauteur), origine en (ux - 6, top - 8). L'enseigne et la déco restent dessinées par town.js.
export function facadeSprite(w, trim, trim2, opt = {}) {
  const uw = w * 16, tall = opt.tall || 0, H0 = 28 + tall;   // hauteur au-dessus de la ligne du bâtiment
  return cached('facade' + JSON.stringify([w, trim, trim2, opt.wall, tall, opt.step, opt.balcony, !!opt.door]), () => {
    const W = uw + 12, H = H0 + 8 + 50, ox = 6, oy = H0 + 8, p = [], A = (path, mat, z) => p.push({ path, mat, z }), top = oy - H0;
    const step = opt.step !== false;
    A(RR(ox + 6, top + 2, uw - 12, 12, 2), 'roof', 0.5);                                       // toit derrière la façade
    A(RR(ox, top + 7, uw, oy + 46 - top - 7, 1), 'wall', 1);
    if (step) { A(RR(ox + 10, top, uw - 20, 9, 1), 'wall', 1); A(RR(ox + uw / 2 - 8, top - 4, 16, 6, 1), 'wall', 1); }
    A(RR(ox - 2, top + 6, uw + 4, 4, 1), 'trim', 3); if (step) { A(RR(ox + 9, top - 1, uw - 18, 2.5, 1), 'trim', 3); A(RR(ox + uw / 2 - 9, top - 5, 18, 2.5, 1), 'trim2', 3); }
    A(RR(ox + uw / 2 - 18, top + 13, 36, 13, 2), 'board', 2);                                  // panneau de l'enseigne
    if (!opt.balcony) for (const wx of (w > 3 ? [ox + 7, ox + uw - 19] : [ox + uw / 2 - 6])) {
      A(RR(wx - 4, top + 26, 4, 14, 1), 'shutter', 2); A(RR(wx + 12, top + 26, 4, 14, 1), 'shutter', 2);
      A(RR(wx - 1, top + 27, 14, 12, 1), 'frame', 2); A(RR(wx, top + 28, 12, 10, 1), 'glass', 3); A(RR(wx + 1, top + 28, 2.5, 6, 1), 'curtain', 4); A(RR(wx + 8.5, top + 28, 2.5, 6, 1), 'curtain', 4);
      A(RR(wx + 5.5, top + 28, 1.2, 10, .5), 'frame', 4); A(RR(wx - 2, top + 38, 16, 3, 1), 'box', 4);
    }
    if (opt.balcony) { A(RR(ox - 2, top + 34, uw + 4, 3, 1), 'trim', 3); for (let k = 0; k < uw; k += 5) A(RR(ox + k, top + 28, 1.6, 7, .5), 'trim', 3.1); A(RR(ox - 2, top + 27, uw + 4, 2, 1), 'trim', 3.1); }
    const ay = oy + 10;                                                                         // auvent et poteaux
    A(POLY(ox - 4, ay, ox + uw + 4, ay, ox + uw + 6, ay + 6, ox - 6, ay + 6), 'awning', 6);
    A(RR(ox - 3, ay + 6, 3, 34, 1), 'post', 6); A(RR(ox + uw - 1, ay + 6, 3, 34, 1), 'post', 6);
    const dx = ox + uw / 2 - 8;
    if (!opt.door) { A(RR(dx - 1, oy + 19, 18, 28, 1), 'frame', 2); A(RR(dx, oy + 20, 7.5, 26, 1), 'door', 3); A(RR(dx + 8.5, oy + 20, 7.5, 26, 1), 'door', 3); }
    const win = (wx, ww) => { A(RR(wx - 1, oy + 20, ww + 2, 15, 1), 'frame', 2); A(RR(wx, oy + 21, ww, 13, 1), 'lit', 3); A(RR(wx + ww / 2 - .5, oy + 21, 1.2, 13, .5), 'frame', 4); A(RR(wx - 2, oy + 34, ww + 4, 2.5, 1), 'trim', 3); };
    if (uw - 16 > 34) { win(ox + 4, 13); win(ox + uw - 17, 13); } else win(ox + 3, 9);
    const wall = opt.wall || '#9a6a3c';
    const im = draw(p, { roof: tones(trim).sh, wall, trim, trim2, board: tones(wall).sh, shutter: tones(trim).sh, frame: tones(wall).dk, glass: '#7aa4c0', curtain: '#e8d4ac', box: '#7a4f2e',
      awning: tones(trim2).base, post: '#7a4f2e', door: '#6a4428', lit: '#ffd98a' }, W, H, { wall: { type: 'planks' }, awning: { type: 'awning', col: tones(trim2).hi } });
    return { im, ox: -6, oy: -H0 - 8 };
  });
}

// ---------- maison / bâtiment générique (vue de face) : bardage à clin, toit à deux pans en bardeaux (ou fausse façade),
// fenêtres à volets, porte en planches, véranda sur poteaux, cheminée. Origine (0, 0) = coin haut-gauche du mur ; l'image
// déborde de 6 px sur les côtés et monte de roofH + 8 au-dessus du mur.
export function houseSprite(o) {
  return cached('house' + JSON.stringify(o), () => {
    const { w, h } = o, roofH = o.falseFront ? 16 : (o.roofH || 22), PX = 6, PY = roofH + 10, W = w + 12, H = h + PY + 6, p = [], A = (path, mat, z) => p.push({ path, mat, z });
    const X = x => x + PX, Y = y => y + PY;
    A(RR(X(0), Y(0), w, h, 1), 'wall', 1);
    A(RR(X(0), Y(0), 3, h, 1), 'trim', 2); A(RR(X(w - 3), Y(0), 3, h, 1), 'trim', 2);                       // poteaux d'angle
    if (o.storeyY) A(RR(X(0), Y(o.storeyY), w, 3, 1), 'trim', 2);
    if (o.falseFront) { A(RR(X(0), Y(-14), w, 15, 1), 'wall', 1); A(RR(X(-2), Y(-16), w + 4, 3, 1), 'trim', 3); A(RR(X(w / 2 - 10), Y(-20), 20, 5, 1), 'trim', 3); }
    else A(POLY(X(-5), Y(2), X(w / 2), Y(-roofH), X(w + 5), Y(2)), 'roof', 3);                              // pignon en bardeaux
    if (o.chimney != null) { A(RR(X(o.chimney), Y(-roofH + 2), 7, roofH - 4, 1), 'stone', 2.5); A(RR(X(o.chimney - 1), Y(-roofH + 1), 9, 2.5, 1), 'stoneD', 2.6); }
    if (o.gableWin) { A(E(X(w / 2), Y(-roofH * .45), 5, 4), 'frame', 4); A(E(X(w / 2), Y(-roofH * .45), 3.5, 2.8), o.lit ? 'lit' : 'glass', 5); }
    for (const [wx, wy] of o.windows || []) {
      if (o.shutters !== false) { A(RR(X(wx - 4), Y(wy - 1), 3.5, 13, 1), 'shutter', 4); A(RR(X(wx + 12.5), Y(wy - 1), 3.5, 13, 1), 'shutter', 4); }
      A(RR(X(wx - 1), Y(wy - 1), 14, 13, 1), 'frame', 4); A(RR(X(wx), Y(wy), 12, 11, 1), o.lit ? 'lit' : 'glass', 5);
      A(RR(X(wx + 5.4), Y(wy), 1.2, 11, .5), 'frame', 6); A(RR(X(wx), Y(wy + 5), 12, 1.2, .5), 'frame', 6); A(RR(X(wx - 2), Y(wy + 11), 16, 2.5, 1), 'trim', 6);
    }
    if (o.porch) { const ay = h - 22; A(POLY(X(-4), Y(ay), X(w + 4), Y(ay), X(w + 5), Y(ay + 5), X(-5), Y(ay + 5)), 'roof', 7); for (const px of o.posts || [-2, w - 1]) A(RR(X(px), Y(ay + 5), 3, h - ay - 5, 1), 'trim', 7);
      A(RR(X(-4), Y(h - 3), w + 8, 4, 1), 'deck', 7); }
    if (o.door) { const d = o.door; A(RR(X(d.x - 1), Y(h - d.h - 1), d.w + 2, d.h + 1, 1), 'frame', 6.5); A(RR(X(d.x), Y(h - d.h), d.w, d.h, 1), 'door', 6.6);
      if (d.cross) { A(POLY(X(d.x + 1), Y(h - d.h + 1), X(d.x + 3.5), Y(h - d.h + 1), X(d.x + d.w - 1), Y(h - 1.5), X(d.x + d.w - 3.5), Y(h - 1.5)), 'trim', 6.8); A(POLY(X(d.x + d.w - 1), Y(h - d.h + 1), X(d.x + d.w - 3.5), Y(h - d.h + 1), X(d.x + 1), Y(h - 1.5), X(d.x + 3.5), Y(h - 1.5)), 'trim', 6.8); } }
    const im = draw(p, { wall: o.wall, trim: o.trim, roof: o.roof, stone: '#8a8078', stoneD: '#5a524a', frame: tones(o.trim).dk, glass: '#8ab8d4', lit: '#ffd98a', shutter: tones(o.trim).sh,
      door: o.doorCol || '#7a4f2e', deck: '#a8774a' }, W, H, { wall: { type: o.planks ? 'planks' : 'boards' }, roof: { type: 'boards' }, door: { type: 'planks' } });
    return { im, ox: -PX, oy: -PY };
  });
}

// 19/11 : dessine un bâtiment (ou un lampadaire) dans le décor ET le retient : quand le héros passe derrière, seuls les
// pixels du bâtiment (toit compris, sans le sol autour) sont redessinés par-dessus lui (renderer.js).
export function blit(g, im, x, y) {
  g.drawImage(im, x, y);
  (g.canvas.__over ||= []).push({ im, x: Math.round(x), y: Math.round(y), w: im.width, h: im.height, base: Math.round(y) + im.height });
}
