// Lot 32 (21/11) : décors dessinés d'après les planches fournies par l'utilisateur (docs/sprites/decors/*.jpg →
// assets/decors/*.png, outil tools/decors-from-planches.py). Qualité d'origine : l'image est réduite une seule fois à la
// taille d'affichage réelle (pixels de l'écran), puis gardée en cache. Tant qu'une image n'est pas chargée, l'ancien
// dessin par code sert de secours.
export const DECORS = ['cactus_grand', 'cactus_petit', 'broussaille', 'sapin', 'cypres', 'arbre_fleurs', 'rocher_grand', 'rocher_bas', 'cailloux', 'caillou', 'roche_plate', 'roche_pilier',
  'filon_cuivre', 'filon_etain', 'filon_argent', 'filon_fer', 'filon_or', 'filon_or2', 'filon_cobalt', 'filon_zinc', 'filon_nickel', 'saloon', 'fontaine',
  'diligence_droite', 'diligence_gauche', 'diligence_face', 'diligence_dos', 'roue'];
// 21/11 : roues de la diligence (dans l'image d'origine, 626 px de large) : centre x, centre y, rayon — elles tournent à part.
export const COACH_WHEELS = { diligence_droite: [[83, 186, 62], [302, 186, 58]], diligence_gauche: [[543, 186, 62], [324, 186, 58]] };
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
// La diligence : caisse, chevaux qui trottent (corps et têtes qui dodelinent, en décalé), puis les roues qui tournent.
// Coordonnées des roues et des chevaux données dans l'image d'origine (626 px de large).
const COACH_W0 = 626, HORSE_X0 = 385, HEAD_X0 = 540;
export function drawCoachDecor(c, n, cx, by, w, now, moving = true) {
  const src = decor(n); if (!src || !decor('roue')) return false;
  const k = w / COACH_W0, h = w * src.naturalHeight / src.naturalWidth, x0 = cx - w / 2, y0 = by - h, left = n === 'diligence_gauche';
  const s = Math.abs(c.getTransform().a) || 1, im = scaled(n, Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s)));
  const sx = im.width / w, part = (a, b, dy) => { const xa = left ? w - b * k : a * k, xb = left ? w - a * k : b * k; c.drawImage(im, xa * sx, 0, (xb - xa) * sx, im.height, x0 + xa, y0 + dy, xb - xa, h); };
  const t = now / (moving ? 95 : 260), body = Math.round(Math.sin(t)) * (moving ? 1 : .5), head = Math.round(Math.sin(t + 1.4) * (moving ? 1.5 : 1));
  part(0, HORSE_X0, 0); part(HORSE_X0, HEAD_X0, body); part(HEAD_X0, COACH_W0, body + head);
  const ang = moving ? (now / 1000) * 5 * (left ? -1 : 1) : 0;
  for (const [wx, wy, r] of COACH_WHEELS[n] || []) drawDecorRot(c, 'roue', x0 + wx * k, y0 + wy * k * (COACH_W0 / src.naturalWidth) * (src.naturalWidth / COACH_W0), 2 * r * k, ang * 62 / r);
  return true;
}
