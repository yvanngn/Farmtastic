// Lot 32 (21/11) : décors dessinés d'après les planches fournies par l'utilisateur (docs/sprites/decors/*.jpg →
// assets/decors/*.png, outil tools/decors-from-planches.py). Qualité d'origine : l'image est réduite une seule fois à la
// taille d'affichage réelle (pixels de l'écran), puis gardée en cache. Tant qu'une image n'est pas chargée, l'ancien
// dessin par code sert de secours.
export const DECORS = ['cactus_grand', 'cactus_petit', 'broussaille', 'sapin', 'cypres', 'arbre_fleurs', 'rocher_grand', 'rocher_bas', 'cailloux', 'caillou', 'roche_plate', 'roche_pilier',
  'filon_cuivre', 'filon_etain', 'filon_argent', 'filon_fer', 'filon_or', 'filon_or2', 'filon_cobalt', 'filon_zinc', 'filon_nickel', 'saloon', 'fontaine',
  'diligence_gauche', 'diligence_face', 'diligence_dos', 'roue',
  'train_sud', 'train_nord', 'train_est', 'train_ouest'];   // 21/11 : train (vues nord, est, ouest gardées pour plus tard)
export const TRAIN_CHIMNEY = 0.825;   // hauteur de la cheminée dans train_sud (fraction depuis le haut)
export const VEIN_DECOR = { copper: 'filon_cuivre', tin: 'filon_etain', silver: 'filon_argent', iron: 'filon_fer', gold: 'filon_or', cobalt: 'filon_cobalt', zinc: 'filon_zinc', nickel: 'filon_nickel' };
const IM = {}, CACHE = new Map();
let ready = 0;
export function preloadDecors(base = 'assets/decors/') {
  return Promise.all(DECORS.map(n => new Promise(res => { const i = new Image(); i.onload = () => { ready++; res(); }; i.onerror = () => res(); i.src = base + n + '.png'; IM[n] = i; })));
}
export const decorsReady = () => ready === DECORS.length;
export const decor = n => { const i = IM[n]; return i && i.complete && i.naturalWidth ? i : null; };
// Image réduite à w × h pixels d'écran (réduction en plusieurs passes, nette).
function scaled(n, w, h) {
  const k = n + ':' + w + 'x' + h; let c = CACHE.get(k); if (c) return c;
  const src = decor(n); if (!src) return null;
  let cur = src, cw = src.naturalWidth, ch = src.naturalHeight;
  while (cw / 2 > w) { const t = document.createElement('canvas'); t.width = Math.max(w, cw >> 1); t.height = Math.max(h, ch >> 1); const tg = t.getContext('2d'); tg.imageSmoothingEnabled = true; tg.imageSmoothingQuality = 'high'; tg.drawImage(cur, 0, 0, t.width, t.height); cur = t; cw = t.width; ch = t.height; }
  c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, w, h);
  if (CACHE.size > 400) CACHE.clear();
  CACHE.set(k, c); return c;
}
// Dessine le décor n, centré en cx, posé sur by (bas de l'image), large de w pixels du monde. Renvoie false si pas chargé.
export function drawDecor(c, n, cx, by, w, flip = false) {
  const src = decor(n); if (!src) return false;
  const s = Math.abs(c.getTransform().a) || 1, h = w * src.naturalHeight / src.naturalWidth;
  const im = scaled(n, Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))); if (!im) return false;
  if (flip) { c.save(); c.translate(cx, 0); c.scale(-1, 1); c.drawImage(im, -w / 2, by - h, w, h); c.restore(); }
  else c.drawImage(im, cx - w / 2, by - h, w, h);
  return true;
}
export const decorH = (n, w) => { const i = decor(n); return i ? w * i.naturalHeight / i.naturalWidth : 0; };

// Décor tourné d'un angle (radians) autour de son centre (cx, cy), large de w pixels du monde.
export function drawDecorRot(c, n, cx, cy, w, ang) {
  const src = decor(n); if (!src) return false;
  const s = Math.abs(c.getTransform().a) || 1, im = scaled(n, Math.max(1, Math.round(w * s)), Math.max(1, Math.round(w * s))); if (!im) return false;
  c.save(); c.translate(cx, cy); c.rotate(ang); c.drawImage(im, -w / 2, -w / 2, w, w); c.restore(); return true;
}
// 21/11 : diligence d'après les 3 bandes Gemini (tools/diligence-v2.py) : 4 images de trot par vue (profil gauche, face, dos),
// profil droit = miroir ; de profil, les roues tournent à part (retirées des images, dessinées par-dessus).
export const COACH_CELL = 434;                                  // largeur d'une case du profil dans l'image d'origine
export const COACH_WHEELS = [[224, 212, 40], [372, 202, 50]];   // profil gauche : centre x, centre y, rayon (dans une case)
export const COACH_VIEW = { droite: 'diligence_gauche', gauche: 'diligence_gauche', face: 'diligence_face', dos: 'diligence_dos' };
export const COACH_W = { droite: 126, gauche: 126, face: 60, dos: 60 };
export function drawCoachDecor(c, dir, cx, by, now, moving = true) {
  const n = COACH_VIEW[dir], src = decor(n); if (!src || !decor('roue')) return false;
  const w = COACH_W[dir], cw = src.naturalWidth / 4, h = w * src.naturalHeight / cw, flip = dir === 'droite';
  const s = Math.abs(c.getTransform().a) || 1, im = scaled(n, Math.max(4, Math.round(4 * w * s)), Math.max(1, Math.round(h * s))); if (!im) return false;
  const f = moving ? (now / 120 | 0) % 4 : 0, fw = im.width / 4;
  c.save(); c.translate(cx, by - h); if (flip) c.scale(-1, 1);
  c.drawImage(im, f * fw, 0, fw, im.height, -w / 2, 0, w, h);
  if (dir === 'droite' || dir === 'gauche') {
    const k = w / COACH_CELL, d = moving ? now / 1000 * 70 : 0;   // les roues roulent sans glisser (70 px du monde par seconde)
    for (const [wx, wy, r] of COACH_WHEELS) drawDecorRot(c, 'roue', -w / 2 + wx * k, wy * k, 2 * r * k, -d / (r * k));
  }
  c.restore(); return true;
}
