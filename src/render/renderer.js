import { drawDecor, decor, VEIN_DECOR } from './decors.js';
import { folkSprite, CAST } from './folk.js';
import { coachBody, coachWheel, horse, locoSprite, wagonSprite, fountainSprite, houseSprite } from './props.js';
import { MAILBOX, METEOR_HITS } from '../systems/golgolas.js';
import { hasUnread } from '../systems/mail.js';
import { GOLGO_CENTER, METEOR } from '../world/scenes.js';
import { isHouse as _isHouse, isGrange as _isGrange, buildingAt as _bAt, setFarmLot } from '../world/map.js';
const ROOF_TILES = 'MUJRAHBEXCGNKOVZLPY';
// 18/11 : tuile de bâtiment (le toit déborde au-dessus) : le héros derrière passe sous le toit, en transparence
function isBuildingTile(S, scene, x, y) { if (scene === 'farm') return _isHouse(x, y) || _isGrange(x, y) || !!_bAt(S.built, x, y); const r = LAYOUTS[scene]; return !!(r && r[y] && ROOF_TILES.includes(r[y][x] || '')); }
import { disc } from './pixel.js';
import { getZoom, zoomScale, getEco } from '../ui/settingsPanel.js';
import { QUARTIER, PARC_B } from '../world/scenes.js';
// Caverne : la lumière du jour entre par la sortie ; quelques cristaux luisent.
const CAVE_LIGHTS = [{ x: 8, y: 72, r: 60 }, { x: 25 * 16, y: 12 * 16, r: 18 }, { x: 44 * 16, y: 20 * 16, r: 18 }];
import { toolTier, lacks } from '../systems/skills.js';
import { MIN_PICK, NEED } from '../data/tools.js';
// Rendu : caméra, culling, tri en profondeur, eau animée, lumière dynamique,
// étalonnage météo, particules, vignettage. Responsive (devicePixelRatio, échelle entière).
import { CFG } from '../config.js';
import { TEST_SWORD, testSwordHere } from '../systems/wild.js';
import { rainbowVisible } from '../systems/nature.js';
import { roxPos } from '../systems/rouky.js';
import { isRepaired, fieldToolAt } from '../systems/repair.js';
import { FIELD_TOOLS, BIG_TREE } from '../data/repairs.js';
import { BUSHES } from '../data/recipes.js';
import { bushRipe, cookProgress } from '../systems/cooking.js';
import { ghostVisible } from '../systems/ghost.js';
import { SCATTER_MS } from '../systems/inventory.js';
import { isForestTree, forestCut, forestGone, forestChestFull } from '../systems/foret.js';
import { CUEILLE_HITS } from '../systems/nature.js';
import { GHOST } from '../data/npcs.js';
// Buisson à baies (baies bleues quand il y en a).
function drawBush(c, x, y, ripe, mure) {
  const px = x * T, py = y * T;
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(px + 1, py + 12, 14, 3);
  c.fillStyle = '#2f6a2a'; c.fillRect(px + 1, py + 5, 14, 9); c.fillRect(px + 3, py + 2, 10, 3);
  c.fillStyle = '#4a9a3a'; c.fillRect(px + 3, py + 4, 5, 4); c.fillRect(px + 9, py + 6, 4, 3); c.fillStyle = '#68b84c'; c.fillRect(px + 4, py + 4, 2, 1);
  if (ripe) for (const [a, b] of [[3, 7], [7, 5], [11, 8], [5, 11], [10, 11], [13, 6]]) { c.fillStyle = mure ? '#3a1a3a' : '#3a4ad0'; c.fillRect(px + a, py + b, 2, 2); c.fillStyle = mure ? '#8a4a8a' : '#9aa8ff'; c.fillRect(px + a, py + b, 1, 1); }
}
// Coffre en bois cerclé de fer, posé au sol.
function drawChest(c, x, y) {
  const px = x * T, py = y * T;
  c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(px + 1, py + 13, 14, 3);
  c.fillStyle = '#6a3e1e'; c.fillRect(px + 1, py + 5, 14, 9); c.fillStyle = '#8a5428'; c.fillRect(px + 1, py + 3, 14, 4); c.fillStyle = '#a8703a'; c.fillRect(px + 2, py + 3, 12, 1);
  c.fillStyle = '#3a3640'; c.fillRect(px + 1, py + 7, 14, 1); c.fillRect(px + 3, py + 3, 1, 11); c.fillRect(px + 12, py + 3, 1, 11);
  c.fillStyle = '#e8c26a'; c.fillRect(px + 7, py + 7, 2, 3); c.fillStyle = '#4a2a14'; c.fillRect(px + 1, py + 13, 14, 1);
}
// Feu de camp : pierres en cercle, bûches, flammes qui dansent.
// Esprit d'une vieille femme qui pleure : silhouette pâle et transparente qui flotte, chignon, châle, larmes.
function drawGhost(c, x, y, now) {
  { const im = folkSprite(CAST.esprit, 0, 0); if (im) { const w = 24, h = 48, px = Math.round(x * T + 8 - w / 2), py = Math.round(y * T + 15 - h + Math.sin(now / 500) * 1.5 - 3);   // 18/11 : l'esprit en « pixel moderne »
    c.save(); c.globalAlpha = .7 + Math.sin(now / 700) * .12; c.fillStyle = 'rgba(120,190,255,.25)'; c.beginPath(); c.ellipse(x * T + 8, y * T + 15, 7, 2, 0, 0, 7); c.fill(); c.drawImage(im, px, py, w, h); c.restore(); return; } }
  { const im = ghostSheet(); if (im) { const S = SHEETS.esprit, px = x * T + 8 - S.fw / 2, py = y * T + 14 - S.fh + Math.round(Math.sin(now / 500) * 1.5) - 3;   // planche de référence
    c.save(); c.globalAlpha = .6 + Math.sin(now / 700) * .12; c.fillStyle = 'rgba(120,190,255,.25)'; c.beginPath(); c.ellipse(x * T + 8, y * T + 15, 7, 2, 0, 0, 7); c.fill(); c.drawImage(im, 0, 0, S.fw, S.fh, px, py, S.fw, S.fh); c.restore(); return; } }   // l'esprit de la vieille femme (planche de l'utilisateur) : robe d'époque bleutée, chignon, translucide, flotte
  const px = x * T, py = y * T + Math.round(Math.sin(now / 500) * 1.5) - 14, R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(px + a, py + b, w, h); };
  c.save(); c.globalAlpha = .55 + Math.sin(now / 700) * .12;
  c.fillStyle = 'rgba(120,190,255,.25)'; c.beginPath(); c.ellipse(px + 8, py + 30, 7, 2, 0, 0, 7); c.fill();   // halo au sol
  const L = '#d8ecff', M = '#a8d0f4', D = '#6a9ad0', O = '#4a7ab0';
  R(3, 1, 10, 3, M); R(3, 3, 2, 12, M); R(11, 3, 2, 12, M); R(4, 2, 8, 7, O); R(5, 3, 6, 6, L); R(5, 2, 6, 1, M);   // tête, longs cheveux qui tombent
  R(6, 5, 1, 1, '#3a5a8a'); R(9, 5, 1, 1, '#3a5a8a'); R(7, 7, 2, 1, D);   // yeux baissés, bouche
  R(6, 9, 4, 2, L); R(6, 9, 4, 1, M);                                    // col montant
  R(3, 10, 10, 7, O); R(4, 11, 8, 6, M); R(7, 11, 2, 6, L); for (const y of [12, 14]) R(7, y, 2, 1, D);   // corsage boutonné
  R(1, 11, 3, 4, M); R(12, 11, 3, 4, M); R(1, 15, 2, 3, L); R(13, 15, 2, 3, L);   // manches bouffantes, mains
  R(2, 17, 12, 8, O); R(3, 17, 10, 8, M); R(3, 17, 2, 8, L); R(5, 19, 1, 6, D); R(10, 19, 1, 6, D);   // jupe longue
  for (let i = 0; i < 5; i++) R(3 + i * 2, 25, 2, 1 + ((now / 160 + i) | 0) % 3, M);   // bas qui s'efface
  c.fillStyle = '#7ac8ff'; const k = (now / 250 | 0) % 3; c.fillRect(px + 6, py + 6 + k, 1, 1); c.fillRect(px + 9, py + 7 + (k + 1) % 3, 1, 1);   // larmes
  c.restore();
}
// Chaudron en fonte sur trois pieds, bûches dessous ; vapeur quand un plat cuit.
function drawPot(c, x, y, now, busy) {
  const px = x * T, py = y * T;
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(px + 2, py + 13, 12, 2);
  c.fillStyle = '#6a4424'; c.fillRect(px + 3, py + 12, 10, 2);
  if (busy) { c.fillStyle = (now / 120 | 0) % 2 ? '#f2a03a' : '#e0602a'; c.fillRect(px + 5, py + 11, 6, 2); }
  c.fillStyle = '#2a2a30'; c.fillRect(px + 3, py + 6, 10, 6); c.fillRect(px + 2, py + 5, 12, 2); c.fillRect(px + 4, py + 12, 1, 2); c.fillRect(px + 11, py + 12, 1, 2);
  c.fillStyle = '#4a4a56'; c.fillRect(px + 4, py + 7, 2, 3);
  c.fillStyle = busy ? '#b0603a' : '#3a3a44'; c.fillRect(px + 3, py + 5, 10, 1);
  if (busy) { c.fillStyle = 'rgba(255,255,255,.5)'; const k = (now / 200 | 0) % 3; c.fillRect(px + 6 + k, py + 2 - k % 2, 1, 2); c.fillRect(px + 9 - k, py + 1 + k % 2, 1, 2); }
}
function drawFire(c, x, y, now) {
  const px = x * T, py = y * T, f = (now / 120 | 0) % 3;
  c.fillStyle = 'rgba(255,170,60,.18)'; c.fillRect(px - 4, py - 2, 24, 20);
  for (const [a, b] of [[1, 11], [4, 13], [9, 13], [13, 11], [2, 8], [13, 8]]) { c.fillStyle = '#8f887f'; c.fillRect(px + a, py + b, 3, 2); }
  c.fillStyle = '#6a4426'; c.fillRect(px + 3, py + 11, 10, 2); c.fillRect(px + 5, py + 9, 6, 2);
  c.fillStyle = '#e8501f'; c.fillRect(px + 5, py + 4 + f, 6, 7 - f); c.fillStyle = '#f6a43a'; c.fillRect(px + 6, py + 2 + (2 - f), 4, 8 - (2 - f));
  c.fillStyle = '#ffe28a'; c.fillRect(px + 7, py + 6, 2, 4);
}
import { VEINS } from '../data/nature.js';
import { FLOWERS } from '../data/items.js';
const FLOWER_COL = Object.fromEntries(FLOWERS.flat().map(f => [f.id, f.c]));
// Petite fleur : tige, feuilles et corolle qui se balance un peu.
// 19/11 : souche (cernes, racines) ; un petit rejet vert apparaît quand elle va repousser.
function drawStump(c, x, y, o) {
  const px = x * T + (o.shake > 0 ? Math.round(Math.sin(o.shake * 40)) : 0), py = y * T, R = (a, b, w, h, k) => { c.fillStyle = k; c.fillRect(px + a, py + b, w, h); };
  R(2, 13, 12, 2, 'rgba(20,12,8,.3)'); R(4, 7, 8, 7, '#6e4426'); R(3, 12, 10, 2, '#5b3a22'); R(2, 13, 3, 1, '#5b3a22'); R(11, 13, 3, 1, '#5b3a22');
  R(4, 5, 8, 3, '#d9a870'); R(5, 6, 6, 1, '#b07a48'); R(7, 6, 2, 1, '#8a5a32'); R(4, 7, 1, 6, '#8a5a32'); R(10, 8, 1, 5, '#4a2c18');
  if ((o.d || 0) >= 2) { R(11, 2, 1, 4, '#4f9a3a'); R(12, 2, 2, 1, '#7ac04a'); if (o.d >= 3) { R(9, 1, 2, 1, '#7ac04a'); R(10, 1, 1, 4, '#4f9a3a'); } }
}
function drawFlower(c, x, y, col, now) {   // 19/11 : fleurs plus grosses (5 pétales de 2 × 2, cœur, deux feuilles)
  const px = x * T + 8, py = y * T + 14, s = Math.round(Math.sin(now / 700 + x * 3 + y) * .8), D = shade(col, .78);
  c.fillStyle = 'rgba(20,30,10,.25)'; c.fillRect(px - 3, py, 7, 2);
  c.fillStyle = '#3f7a28'; c.fillRect(px, py - 7, 1, 7); c.fillStyle = '#64ad3c'; c.fillRect(px - 3, py - 3, 3, 2); c.fillRect(px + 1, py - 4, 3, 2); c.fillStyle = '#3f7a28'; c.fillRect(px - 3, py - 2, 3, 1);
  const cx = px + s, cy = py - 10;
  for (const [dx, dy] of [[-1, -3], [-3, -1], [1, -1], [-2, 1], [0, 1]]) { c.fillStyle = col; c.fillRect(cx + dx, cy + dy, 2, 2); c.fillStyle = D; c.fillRect(cx + dx, cy + dy + 1, 2, 1); }
  c.fillStyle = col; c.fillRect(cx - 1, cy - 1, 3, 3);
  c.fillStyle = '#f6d24a'; c.fillRect(cx, cy, 1, 1); c.fillStyle = '#c89a20'; c.fillRect(cx, cy + 1, 1, 1);
}
// Filon : gros rocher sombre strié de la couleur du minerai.
// 19/11 : filons plus gros (rocher de 20 × 18), veines de couleur du minerai ; les filons rares (fer, or) montrent un
// morceau de métal qui scintille (éclat en étoile animé) pour qu'on les repère de loin.
const RARE_VEIN = { iron: ['#9aa4b0', '#e8eef4'], gold: ['#f2c832', '#fff4b0'] };
function drawVein(c, x, y, o, col, now = 0) {
  const px = x * T - 2 + (o.shake > 0 ? Math.round(Math.sin(o.shake * 40)) : 0), py = y * T - 4, P = (a, b, w, h, k) => { c.fillStyle = k; c.fillRect(px + a, py + b, w, h); };
  if (VEIN_DECOR[o.v]) { c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(px + 10, py + 18, 10, 3, 0, 0, 7); c.fill(); if (drawDecor(c, VEIN_DECOR[o.v], px + 10, py + 20, 22)) return; }   // lot 32 : filons de la planche fournie
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(px + 10, py + 18, 10, 3, 0, 0, 7); c.fill();
  P(3, 4, 14, 14, '#4a4650'); P(1, 7, 18, 10, '#4a4650'); P(5, 2, 10, 3, '#5a5662');
  P(4, 3, 9, 3, '#6a6674'); P(2, 7, 3, 6, '#5e5a68'); P(1, 15, 18, 2, '#302d36'); P(16, 7, 3, 9, '#38353e');
  P(0, 7, 1, 9, '#24222a'); P(19, 7, 1, 9, '#24222a'); P(3, 1, 12, 1, '#24222a'); P(1, 17, 18, 1, '#24222a');   // contour
  const D = shade(col, .7), Lc = shade(col, 1.25);
  for (const [a, b, w] of [[4, 8, 4], [6, 9, 3], [10, 6, 3], [11, 7, 4], [12, 11, 3], [5, 12, 4], [14, 9, 2]]) { P(a, b, w, 1, col); P(a, b + 1, w, 1, D); P(a, b, 1, 1, Lc); }
  const rare = RARE_VEIN[o.v];
  if (rare) {   // morceau de métal brut, brillant
    P(8, 8, 5, 4, rare[0]); P(9, 7, 3, 1, rare[0]); P(8, 8, 2, 1, rare[1]); P(12, 10, 1, 2, shade(rare[0], .7)); P(9, 12, 4, 1, shade(rare[0], .6));
    const ph = (now / 900 + x * .37 + y * .61) % 1, a = Math.max(0, Math.sin(ph * Math.PI * 2));
    c.save(); c.globalAlpha = .35 + .65 * a; c.fillStyle = '#ffffff';
    const sx = px + 10, sy = py + 8, l = 1 + Math.round(a * 3);
    c.fillRect(sx - l, sy, 2 * l + 1, 1); c.fillRect(sx, sy - l, 1, 2 * l + 1); c.fillStyle = rare[1]; c.fillRect(sx - 1, sy - 1, 3, 3); c.fillStyle = '#ffffff'; c.fillRect(sx, sy, 1, 1);
    if (a > .7) { c.fillRect(px + 4, py + 5, 1, 1); c.fillRect(px + 15, py + 12, 1, 1); }
    c.restore();
  } else P(9, 5, 1, 1, '#ffffff');
}
// Arc-en-ciel : grand arc dont un pied touche le trésor ; il apparaît puis s'efface en douceur.
function drawRainbow(c, fx, fy, minute, R) {
  const t = (minute - R.from) / (R.to - R.from), a = Math.min(1, t * 6, (1 - t) * 6) * .45;
  const r0 = 150, cx = fx - r0;
  c.save(); c.globalAlpha = a;
  ['#e04040', '#f0902a', '#f2d23a', '#5ac04a', '#3a8ae0', '#6a4ac8', '#a050c8'].forEach((col, i) => {
    c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.arc(cx, fy, r0 - i * 3, Math.PI, 0); c.stroke();
  });
  c.restore();
}
import { buildGround, drawWaterShimmer, LIGHTS, drawSoil } from './ground.js';
import { heroToolSheet, drawHeroPick, drawChar, drawTree, drawRock, drawCrop, drawAnimal, drawSlime, drawSwing, treeSprite, KIND_SPRITE } from './sprites.js';
import { buildInterior } from './interiors.js';
import { buildParc, buildBiome, buildQuartier, buildTown, TOWN_LIGHTS } from './town.js';
import { buildWest } from './west.js';
import { buildQuarry } from './quarry.js';
import { forestOpen } from '../systems/blockers.js';
import { eating, EAT_MS } from '../systems/player.js';
import { itemArt } from './itemart.js';
const ART_IM = {};
const artImage = id => { if (ART_IM[id] !== undefined) return ART_IM[id]; const u = itemArt(id); if (!u) return (ART_IM[id] = null); const im = new Image(); im.src = u; return (ART_IM[id] = im); };
import { BIG_ROCK } from '../world/scenes.js';
import { ROCK_HITS } from '../systems/bigrock.js';
import { TOWN_B as TOWN_B2 } from '../world/scenes.js';
import { STAND_POS, DUMP_POS, SHOP_VENDOR, VENDOR_POS } from '../world/scenes.js';
import { IGOR, HARRY, SUZIE } from '../data/npcs.js';
import { suzieAtStand, SUZIE_STAND } from '../systems/etal.js';
import { PICKUPS, isBroken } from '../systems/grange.js';
import { buildWild, drawMob, drawZRock, drawShroom, drawForestTree } from './wild.js';
import { MUSHROOMS } from '../data/items.js';
import { LAYOUTS, FOREST_CHEST, syncForest, forestKey } from '../world/scenes.js';
import { toolIcon, drawToolPix, heroSheetName } from './sprites.js';
// Farmwest : le grand arbre de la ferme (incassable) : tronc large, racines, feuillage en trois étages qui ondule un peu.
const BIG_LEAF = [['#3f7a32', '#5a9a46', '#7ab85a'], ['#4a8a3a', '#6aaa4a', '#8ac862'], ['#c87a2a', '#e09a3a', '#f2c25a'], ['#8a8a7a', '#a8a898', '#d8dcd4']];
function drawBigTree(c, x, y, season, now) {
  const px = x * 16 + 8, py = y * 16 + 14, R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(px + a), Math.round(py + b), w, h); }, L = BIG_LEAF[season] || BIG_LEAF[0], sway = Math.round(Math.sin(now / 1400) * 1);
  R(-22, -2, 44, 6, 'rgba(20,30,10,.3)');
  R(-7, -30, 14, 30, '#5b3a22'); R(-5, -30, 4, 30, '#7a4f2e'); R(-10, -4, 6, 4, '#5b3a22'); R(4, -4, 7, 4, '#5b3a22'); R(-3, -18, 2, 6, '#3f2615');   // tronc et racines
  const blob = (bx, by, r, col) => disc(c, Math.round(px + bx + sway), Math.round(py + by), r, col);   // disques pixel (bords nets)
  for (const [bx, by, r] of [[-16, -36, 13], [16, -36, 13], [0, -44, 16], [-9, -54, 11], [10, -54, 11], [0, -62, 10]]) blob(bx, by, r, L[0]);
  for (const [bx, by, r] of [[-14, -40, 9], [14, -40, 9], [-2, -48, 11], [-7, -58, 7], [7, -58, 7]]) blob(bx, by, r, L[1]);
  for (const [bx, by, r] of [[-17, -44, 4], [9, -46, 5], [-5, -60, 4], [3, -52, 3]]) blob(bx, by, r, L[2]);
}
// 20/11 : motif de bordure (forêt dense ou roche) pour l'extérieur des zones
const EDGE_PAT = {};
function edgePattern(kind, season) {
  const k = kind + season; if (EDGE_PAT[k] !== undefined) return EDGE_PAT[k];
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  if (kind === 'roche') { g.fillStyle = '#5a5058'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 40; i++) { const x = (i * 53) % 128, y = (i * 37) % 128, r = 6 + (i * 7) % 10; g.fillStyle = ['#6a6068', '#7a7078', '#4a4248'][i % 3]; g.beginPath(); g.ellipse(x, y, r, r * .7, 0, 0, 7); g.fill(); } }
  else { g.fillStyle = '#2c5a2a'; g.fillRect(0, 0, 128, 128); for (let y = -24; y < 128; y += 14) for (let x = -16; x < 128; x += 16) { const im = treeSprite(season, ((x * 7 + y * 13) & 0xffff) % 4); if (im) g.drawImage(im, x + ((y / 14) % 2 ? 8 : 0) - 8, y - 20); } }
  return (EDGE_PAT[k] = g.createPattern(c, 'repeat'));
}
// Farmwest : locomotive à vapeur qui entre en gare par le nord sur la voie (x1-2) et s'arrête le long du quai.
function drawLoco(c, t, now, hero, leave = 0) {   // 18/11 (soir) : locomotive et wagons « pixel moderne » (src/render/props.js)
  const x = 16, stopY = 6 * 16, y0 = stopY - (t < 3 ? (3 - t) * (3 - t) * 50 : 0) + leave * leave * 40;   // lot 8 : repart vers le sud en accélérant
  const im = trainImage(), top = Math.round(y0 + 70 - TRAIN_IMG.h);   // 20/11 : train fourni par l'utilisateur (vu de dessus, locomotive devant)
  if (im) { c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x + 3, top + 4, TRAIN_IMG.w, TRAIN_IMG.h); c.drawImage(im, x, top); }
  else { const L = locoSprite(), W0 = wagonSprite(hero), W1 = wagonSprite(null); if (W1) c.drawImage(W1, x, Math.round(y0 - 98)); if (W0) c.drawImage(W0, x, Math.round(y0 - 52)); if (L) c.drawImage(L, x, Math.round(y0)); }
  const moving = t < 3 || leave > 0, puff = moving ? 1 : .35, cy = im ? top + TRAIN_IMG.chimney : y0 + 16;   // fumée : forte quand il roule, légère à l'arrêt
  for (let k = 0; k < (moving ? 10 : 6); k++) { const ph = (now / (moving ? 420 : 600) + k / (moving ? 10 : 6)) % 1, py = cy - ph * (moving ? 60 : 44), sz = 4 + ph * (moving ? 15 : 11); c.fillStyle = `rgba(235,232,228,${(1 - ph) * .6 * puff})`; c.beginPath(); c.arc(x + 15 + Math.sin(k * 2 + now / 400) * 4 + (moving ? ph * 6 : 0), py, sz / 2, 0, 7); c.fill(); }
}
let TRAIN_EL; const trainImage = () => { if (TRAIN_EL === undefined && typeof Image !== 'undefined') { TRAIN_EL = null; const im = new Image(); im.onload = () => { TRAIN_EL = im; }; im.src = TRAIN_IMG.url; } return TRAIN_EL; };
// Farmwest : diligence tirée par deux chevaux, cocher en chapeau sur le siège ; roues qui tournent.
function drawCoach(c, wx, wy, now) {   // 18/11 (soir) : diligence « pixel moderne » (src/render/props.js) : caisse, cocher, chevaux au trot, roues qui tournent
  const X = Math.round(wx * 16), Y = Math.round(wy * 16), fr = (now / 110 | 0) % 4, st = (now / 70 | 0) % 8;
  c.fillStyle = 'rgba(30,15,5,.3)'; c.beginPath(); c.ellipse(X + 12, Y + 9, 52, 5, 0, 0, 7); c.fill();
  if (drawDecor(c, 'diligence_droite', X + 18, Y + 11 + ((now / 160 | 0) % 2), 126)) return;   // lot 32 : diligence de la planche fournie (petit cahot)
  const h1 = horse('#5a3a22', fr), h2 = horse('#8a5a32', (fr + 2) % 4), body = coachBody(), wb = coachWheel(10, st), wf = coachWheel(8, st);
  if (h1) c.drawImage(h1, X + 40, Y - 21);
  if (body) c.drawImage(body, X - 40, Y - 64);
  if (wb) c.drawImage(wb, X - 31, Y - 10); if (wf) c.drawImage(wf, X + 1, Y - 6);
  if (h2) c.drawImage(h2, X + 46, Y - 17);
  c.strokeStyle = '#3a2414'; c.lineWidth = 1; c.beginPath(); c.moveTo(X + 34, Y - 30); c.lineTo(X + 72, Y - 14); c.stroke();   // rênes
}
import { SCENES } from '../world/scenes.js';
import { ANIMALS } from '../data/animals.js';
import { ITEMS } from '../data/items.js';
import { darkness, timeTint, sunShadow } from '../systems/weather.js';
import { SHADOW, harmonize, shade, clearAllCaches } from './pixel.js';
import { SHEETS } from './sheets.js';
import { TRAIN_IMG } from './trainimg.js';
let GHOST_IMG; const ghostSheet = () => { if (GHOST_IMG === undefined && typeof Image !== 'undefined') { GHOST_IMG = null; const im = new Image(); im.onload = () => { GHOST_IMG = im; }; im.src = SHEETS.esprit.url; } return GHOST_IMG; };
import { SIGN_SINK } from './pixfont.js';
const T = CFG.T;
const MAX_FX = 160;
// Torches des tunnels (px).
const GRANGE_LIGHTS = [[2, 1], [7, 1], [12, 1], [17, 5], [12, 7]].map(([x, y]) => ({ x: x * 16 + 8, y: y * 16 + 6, r: 70 }));

export function createRenderer(cv, g) {
  const ctx = cv.getContext('2d');
  let scale = 3, dpr = 1, cache = null, cacheSeason = -1, cacheScene = '', cacheForest = '';
  const interiors = {};
  let farm = null, farmSeason = -1;
  function farmGround() { setFarmLot(g.S.farmLot); const b = g.S.built || {}, fx = { house: isRepaired(g.S, 'house'), grange: isRepaired(g.S, 'grange') }, key = g.S.season + JSON.stringify(b) + fx.house + fx.grange + ':' + (g.S.farmLot || 0); if (farmSeason !== key) { farm = buildGround(g.S.season, b, fx); farmSeason = key; } return farm; }
  let vignette = null, light = null, lastStep = 0;
  const cam = { x: 0, y: 0 }, screenFx = [], worldFx = [];
  const LQ = 4;
let trans = 0; const TRANS_MS = 650;
let swing = null;
  const SEASON_LEAF = ['#4a8f36', '#3b7f31', '#e08a2a', '#eef5f7'];
  // Animation de l'outil (coup) et effets d'impact : copeaux, éclats, chute d'arbre.
  g.bus.on('swing', tool => { swing = { tool, p: 0 }; });
  g.bus.on('decors', () => invalidate());   // lot 32 : les décors fournis sont chargés → on redessine les fonds
  g.bus.on('scene', () => { trans = performance.now(); });   // transition d'entrée dans une zone
  g.bus.on('objHit', ({ x, y, t, broken, k }) => {
    const cx = x * T + 8, cy = y * T + (t === 'tree' ? 6 : 9), stone = t !== 'tree';
    const n = broken ? 14 : 5, cols = stone ? ['#9a958c', '#c2bdb4', '#6a6670'] : ['#c9955a', '#8a5a32', SEASON_LEAF[g.S.season]];
    for (let i = 0; i < n && worldFx.length < MAX_FX; i++) {
      const a = Math.random() * Math.PI * 2, v = 20 + Math.random() * (broken ? 45 : 25);
      worldFx.push({ k: 'chip', x: cx, y: cy, vx: Math.cos(a) * v, vy: -Math.abs(Math.sin(a)) * v - 15, col: cols[i % cols.length], life: .5 + Math.random() * .3, floor: cy + 6 });
    }
    if (broken && t === 'tree') worldFx.push({ k: 'fall', kind: k || ['oak', 'pine', 'birch'][(x * 7 + y * 3) % 3], x, y, season: g.S.season, v: (x * 7 + y * 3) % 4, dir: g.S.x < x + .5 ? 1 : -1, life: 1, t: 0 });
    if (broken && stone) for (let i = 0; i < 6; i++) worldFx.push({ k: 'dust', x: cx + (Math.random() * 12 - 6), y: cy + Math.random() * 4, life: .7 });
  });

  function resize() {
    // 19/11 (performances) : résolution plafonnée (2×, 1,5× en économie d'énergie) et au plus ~2,3 millions de pixels :
    // un écran de téléphone à 3× faisait dessiner 3 fois plus de pixels pour un rendu pixel art identique.
    const w = cv.clientWidth || innerWidth, h = cv.clientHeight || innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, getEco() ? 1.5 : 2);
    if (w * h * dpr * dpr > 2.3e6) dpr = Math.sqrt(2.3e6 / (w * h));   // lot 8 : la scène s'arrête au-dessus de la bande d'outils
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    // ~12 tuiles sur le plus petit côté (réglable : Proche 9 / Normal 12 / Loin 15)
    scale = zoomScale(Math.min(cv.width, cv.height), getZoom(), T);   // 1 possible : « Très loin » sur petit écran
    ctx.imageSmoothingEnabled = false;
    vignette = document.createElement('canvas'); vignette.width = cv.width; vignette.height = cv.height;
    const v = vignette.getContext('2d'), gr = v.createRadialGradient(cv.width / 2, cv.height / 2, Math.min(cv.width, cv.height) * .35, cv.width / 2, cv.height / 2, Math.hypot(cv.width, cv.height) / 2);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(10,6,20,.38)');
    v.fillStyle = gr; v.fillRect(0, 0, cv.width, cv.height);
    light = document.createElement('canvas'); light.width = Math.ceil(cv.width / LQ); light.height = Math.ceil(cv.height / LQ);   // carte de lumière en basse résolution (dégradés doux : invisible à l'œil, 16× moins de pixels)
    initWeather();
  }

  function initWeather() {
    screenFx.length = 0;
    const w = g.S.weather, n = w === 'rain' ? 140 : w === 'storm' ? 220 : w === 'snow' ? 110 : 0;
    for (let i = 0; i < n; i++) screenFx.push(drop(w === 'snow', true));
    if (g.S.season === 2) for (let i = 0; i < 14; i++) screenFx.push(leaf(true));
    if (g.S.season === 0 && n === 0) for (let i = 0; i < 10; i++) screenFx.push({ ...leaf(true), col: ['#f8b8d0', '#ffffff', '#f4a0c0'][i % 3] });   // 7g : pétales au printemps
    if (n === 0 && g.S.season !== 3) for (let i = 0; i < 16; i++) screenFx.push(mote(true));   // 7g : poussière dorée qui flotte
  }
  const mote = anywhere => ({ k: 'mote', x: Math.random() * cv.width, y: anywhere ? Math.random() * cv.height : cv.height + 5, ph: Math.random() * 6, sp: 6 + Math.random() * 10 });
  const drop = (snow, anywhere) => ({ k: snow ? 'snow' : 'rain', x: Math.random() * (cv.width + 200), y: anywhere ? Math.random() * cv.height : -20, end: cv.height * (.2 + Math.random() * .8) });
  const leaf = anywhere => ({ k: 'leaf', x: Math.random() * cv.width, y: anywhere ? Math.random() * cv.height : -10, ph: Math.random() * 6, col: ['#e08a2a', '#c25e1d', '#eea13a'][Math.random() * 3 | 0] });

  function update(dt, now) {
    const u = dpr;
    for (let i = screenFx.length - 1; i >= 0; i--) {
      const p = screenFx[i];
      if (p.k === 'rain') { p.y += 620 * dt * u; p.x -= 140 * dt * u; if (p.y > p.end) { screenFx.push({ k: 'splash', x: p.x, y: p.y, life: .18 }); Object.assign(p, drop(false, false)); } }
      else if (p.k === 'snow') { p.y += 38 * dt * u; p.x += Math.sin(p.y / 40) * .6 * u; if (p.y > cv.height) Object.assign(p, drop(true, false)); }
      else if (p.k === 'mote') { p.ph += dt; p.y -= p.sp * dt * u; p.x += Math.sin(p.ph) * 8 * dt * u + 6 * dt * u; if (p.y < -5 || p.x > cv.width + 5) Object.assign(p, mote(false), { x: Math.random() * cv.width }); }
      else if (p.k === 'leaf') { p.ph += dt * 2; p.y += 30 * dt * u; p.x += (Math.sin(p.ph) * 40 + 20) * dt * u; if (p.y > cv.height || p.x > cv.width + 10) Object.assign(p, leaf(false)); }
      else if (p.k === 'splash') { p.life -= dt; if (p.life <= 0) screenFx.splice(i, 1); }
    }
    // poussière de pas
    const P = g.player;
    if (P.walkFrame && P.walkFrame !== lastStep && (P.walkFrame === 1 || P.walkFrame === 5) && worldFx.length < MAX_FX)
      worldFx.push({ k: 'dust', x: g.S.x * T + (Math.random() * 4 - 2), y: g.S.y * T + 1, life: .45 });
    lastStep = P.walkFrame;
    // lucioles la nuit (printemps / été, temps sec)
    const S = g.S, fireflies = !!(SCENES[S.scene || 'farm'] || {}).outdoor && darkness(S) > .3 && S.season < 2 && S.weather !== 'rain' && S.weather !== 'storm';
    if (fireflies && worldFx.filter(f => f.k === 'fly').length < 14)
      worldFx.push({ k: 'fly', x: (S.x + (Math.random() - .5) * 18) * T, y: (S.y + (Math.random() - .5) * 12) * T, ph: Math.random() * 6, life: 6 + Math.random() * 6 });
    if (swing) { swing.p += dt / (['axe', 'pick'].includes(swing.tool) ? CFG.HIT_MS / 1000 * .9 : .36);   /* hache et pioche : geste plus lent, calé sur le délai entre deux coups */ if (swing.p >= 1) swing = null; }
    for (let i = worldFx.length - 1; i >= 0; i--) {
      const f = worldFx[i]; f.life -= dt;
      if (f.k === 'chip') { f.vy += 160 * dt; f.x += f.vx * dt; f.y += f.vy * dt; if (f.y > f.floor) { f.y = f.floor; f.vx *= .5; f.vy *= -.3; } }
      if (f.k === 'fall') { f.t += dt; if (f.life <= 0) for (let j = 0; j < 16; j++) { const a = Math.random() * 6.28, v = 15 + Math.random() * 35; worldFx.push({ k: 'chip', x: (f.x + .5 + f.dir * 1.6) * T, y: f.y * T + 8, vx: Math.cos(a) * v, vy: -Math.abs(Math.sin(a)) * v, col: SEASON_LEAF[f.season], life: .6 + Math.random() * .4, floor: f.y * T + 14 }); } }
      if (f.k === 'dust') f.y -= dt * 6;
      if (f.k === 'fly') { f.ph += dt; f.x += Math.cos(f.ph * 1.3) * dt * 6; f.y += Math.sin(f.ph) * dt * 5; }
      if (f.life <= 0 || (f.k === 'fly' && !fireflies)) worldFx.splice(i, 1);
    }
  }

  const toolImgs = {};
  function toolImg(id) { if (!toolImgs[id]) { toolImgs[id] = new Image(); toolImgs[id].src = toolIcon(id); } return toolImgs[id]; }

  function label(t, x, y) {
    ctx.font = 'bold 6px Georgia'; const w = Math.ceil(ctx.measureText(t).width);
    ctx.fillStyle = 'rgba(20,14,36,.75)'; ctx.fillRect(Math.round(x - w / 2 - 3), y - 7, w + 6, 9);
    ctx.fillStyle = '#e8c26a'; ctx.fillRect(Math.round(x - w / 2 - 3), y + 2, w + 6, 1);
    ctx.fillStyle = '#f5ecd6'; ctx.fillText(t, Math.round(x - w / 2), y);
  }

  function brackets(tx, ty, now) {
    const p = Math.round(Math.sin(now / 160)), x = tx * T - p, y = ty * T - p, s = T + p * 2;
    ctx.fillStyle = '#f2cf73';
    for (const [cx, cy, dx, dy] of [[x, y, 1, 1], [x + s, y, -1, 1], [x, y + s, 1, -1], [x + s, y + s, -1, -1]]) {
      ctx.fillRect(dx > 0 ? cx : cx - 4, dy > 0 ? cy : cy - 1, 4, 1);
      ctx.fillRect(dx > 0 ? cx : cx - 1, dy > 0 ? cy : cy - 4, 1, 4);
    }
  }

  // Lot 12 : petit tas de terre fraîchement retournée (on marche dessus, on le creuse à la pelle).
  function drawMound(c, x, y) {
    const px = x * T, py = y * T, R = (u, v, w, h, col) => { c.fillStyle = col; c.fillRect(px + u, py + v, w, h); };
    R(3, 11, 11, 2, 'rgba(40,25,10,.22)'); R(4, 8, 9, 4, '#7a5232'); R(5, 6, 7, 3, '#8e6440'); R(6, 5, 4, 2, '#a07450');
    R(5, 7, 2, 1, '#b8885c'); R(10, 9, 2, 1, '#5e3e24'); R(8, 6, 1, 1, '#c8a070');
  }

  function render(now) {
    const S = g.S;
    const scene = S.scene || 'farm', outside = scene === 'farm', sky = outside || !!SCENES[scene].outdoor, SC = SCENES[scene];
    { const sh = sky ? sunShadow(S.minute) : { dx: 0, sx: 1 }; SHADOW.dx = sh.dx; SHADOW.sx = sh.sx; }   // 7g : ombres selon l'heure
    if ((scene === 'house' || scene === 'maison') && cacheScene === scene && cache !== interiors[scene + !!S.workbench + (S.bed !== false)]) cacheScene = ''; // établi réparé
    if (scene === 'foret') syncForest(S);
    if (cacheSeason !== S.season || cacheScene !== scene || (scene === 'foret' && cacheForest !== forestKey)) {   // lot 11 : nouveau labyrinthe
      cacheForest = forestKey;
      SIGN_SINK.list = [];
      cache = outside ? farmGround() : scene === 'wild' ? (interiors['wild' + S.season] ||= buildWild(S.season)) : scene === 'foret' ? (interiors['foret' + forestKey + ':' + S.season] ||= buildWild(S.season, 'foret')) : scene === 'town' ? (interiors['town' + S.season] ||= buildTown(S.season)) : scene === 'quartier' ? (interiors['quartier' + S.season] ||= buildQuartier(S.season)) : (scene === 'montagne' || scene === 'plage') ? (interiors[scene] ||= buildBiome(scene, S.season)) : scene === 'parc' ? (interiors['parc' + S.season] ||= buildParc(S.season)) : (scene === 'carriere' || scene === 'dedale') ? (interiors[scene + S.season] ||= buildQuarry(scene, S.season)) : (scene === 'rondpoint' || scene === 'place' || scene === 'route' || scene === 'route_ville' || scene === 'route_plage' || scene === 'ranch' || scene === 'port' || scene === 'gare' || scene === 'golgolas' || /^farm:\d$/.test(scene)) ? (interiors[scene + S.season] ||= buildWest(scene, S.season)) : (scene === 'resto' ? (interiors['resto' + !!(S.resto && S.resto.oven)] ||= buildInterior(scene, S)) : (scene === 'house' || scene === 'maison') ? (interiors[scene + !!S.workbench + (S.bed !== false)] ||= buildInterior(scene, S)) : (interiors[scene] ||= buildInterior(scene, S)));
      if (!cache.__signs) cache.__signs = SIGN_SINK.list; SIGN_SINK.list = null;   // enseignes de ce décor
      if (cacheSeason !== S.season) initWeather();
      cacheSeason = S.season; cacheScene = scene;
    }
    if (outside) cache = farmGround(); // reconstruit si un bâtiment vient d'être construit
    const vw = cv.width / scale, vh = cv.height / scale, MW = SC.W * T, MH = SC.H * T;
    cam.x = MW <= vw && !sky ? (MW - vw) / 2 : S.x * T - vw / 2;   // 20/11 : la caméra suit le héros jusqu'aux bords (l'interface ne cache plus rien)
    cam.y = MH <= vh && !sky ? (MH - vh) / 2 : S.y * T - vh / 2; // la caméra ne bouge plus quand un dialogue s'ouvre
    if (SC.rooms) { // salles façon Game Boy : la caméra reste centrée sur la salle du joueur
      const rw = SC.rooms.w * T, rh = SC.rooms.h * T;
      cam.x = Math.floor(S.x * T / rw) * rw - (vw - rw) / 2; cam.y = Math.floor(S.y * T / rh) * rh - (vh - rh) / 2;
    }
    const camX = Math.round(cam.x * scale) / scale, camY = Math.round(cam.y * scale) / scale;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#16121f'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.setTransform(scale, 0, 0, scale, -camX * scale, -camY * scale);
    if (sky && (camX < 0 || camY < 0 || camX + vw > MW || camY + vh > MH)) {   // 20/11 : au-delà du bord, des arbres (ou des rochers) plutôt que du noir
      const pat = edgePattern(scene === 'carriere' || scene === 'dedale' || scene === 'montagne' ? 'roche' : 'bois', S.season);
      if (pat) { ctx.fillStyle = pat; const x0 = Math.floor(camX) - T, y0 = Math.floor(camY) - T, x1 = camX + vw + T, y1 = camY + vh + T;
        if (x0 < 0) ctx.fillRect(x0, y0, -x0, y1 - y0); if (x1 > MW) ctx.fillRect(MW, y0, x1 - MW, y1 - y0);
        if (y0 < 0) ctx.fillRect(0, y0, MW, -y0); if (y1 > MH) ctx.fillRect(0, MH, MW, y1 - MH); }
    }
    ctx.imageSmoothingEnabled = false;
    if (!cache.__pal) { const col = scene !== 'wild' && scene !== 'grange'; harmonize(cache, col); for (const o of cache.__over || []) { const k = document.createElement('canvas'); k.width = o.w; k.height = o.h; k.getContext('2d').drawImage(o.im, 0, 0); o.im = harmonize(k, col) || k; } }   // 19/11 : bâtiments retenus, mêmes couleurs que le décor   // lot 11g : palette unique + contours colorés (une fois par décor)
    ctx.drawImage(cache, 0, 0);
    const drawSigns = (only) => { if (!(cache.__signs && cache.__signs.length)) return;   // enseignes nettes (19/11 : redessinées si un toit vient de recouvrir le héros)   // enseignes réécrites nettes, à la résolution de l'écran (lisibles à tout zoom)
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      for (const sg of cache.__signs) { if (only && !only.some(r => sg.x < r[2] && sg.x + sg.w > r[0] && sg.y < r[3] && sg.y + sg.h > r[1])) continue;
        const sx = Math.round((sg.x - camX) * scale), sy = Math.round((sg.y - camY) * scale), sw = Math.round(sg.w * scale), sh = Math.round(sg.h * scale);
        if (sx > cv.width || sy > cv.height || sx + sw < 0 || sy + sh < 0) continue;
        ctx.fillStyle = '#3f2615'; ctx.fillRect(sx, sy, sw, sh); ctx.fillStyle = '#e8c26a'; ctx.fillRect(sx + scale, sy + scale, sw - 2 * scale, sh - 2 * scale);
        ctx.fillStyle = '#f6dc94'; ctx.fillRect(sx + scale, sy + scale, sw - 2 * scale, scale);
        let fs = Math.floor(sh * .62); ctx.font = `700 ${fs}px "Pixelify Sans", "Trebuchet MS", sans-serif`;
        while (fs > 6 && ctx.measureText(sg.text).width > sw - 3 * scale) { fs--; ctx.font = `700 ${fs}px "Pixelify Sans", "Trebuchet MS", sans-serif`; }
        ctx.fillStyle = '#3b2414'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(sg.text, sx + sw / 2, sy + sh / 2 + scale * .3);
      }
      ctx.restore(); ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
    };
    drawSigns();
    const x0 = Math.max(0, (cam.x / T | 0) - 2), y0 = Math.max(0, (cam.y / T | 0) - 1);
    const x1 = Math.min(SC.W - 1, ((cam.x + vw) / T | 0) + 2), y1 = Math.min(SC.H - 1, ((cam.y + vh) / T | 0) + 3);
    if (outside) drawWaterShimmer(ctx, x0, y0, x1, y1, now);
    else if (LAYOUTS[scene] && SC.outdoor) drawWaterShimmer(ctx, x0, y0, x1, y1, now, (x, y) => (LAYOUTS[scene][y] || '')[x] === 'w');   // lot 11d : rivière et mer animées
    const wall = g.now();
    if (outside) for (const k in S.tilled || {}) { const [x, y] = k.split(',').map(Number); if (x >= x0 && x <= x1 && y >= y0 && y <= y1) drawSoil(ctx, x, y); }
    if (outside) for (const k in S.plots) { const [x, y] = k.split(',').map(Number); if (x >= x0 && x <= x1 && y >= y0 && y <= y1) drawCrop(ctx, x, y, S.plots[k], wall); }
    for (const f of worldFx) if (f.k === 'dust') { ctx.fillStyle = `rgba(214,196,160,${f.life})`; ctx.fillRect(Math.round(f.x), Math.round(f.y), 2, 2); }

    const list = [], pickTier = lacks(S, NEED.boulder) ? 1 : 9;   // 20/11 : gros caillou « verrouillé » tant que le minage est trop bas
    if (outside) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const o = S.objs[x + ',' + y];
      if (o) list.push({ z: y + .9, d: () => o.t === 'bigtree' ? drawBigTree(ctx, x, y, S.season, now) : o.t === 'stump' ? drawStump(ctx, x, y, o) : o.t === 'tree' ? drawTree(ctx, x, y, o, S.season, now) : drawRock(ctx, x, y, o, (MIN_PICK[o.t] || 1) > pickTier) });
    }
    if (outside) for (const a of S.animals) list.push({ z: a.y, d: () => drawAnimal(ctx, a, now, ANIMALS[a.type]) });
    if (outside) for (const e of g.enemies) list.push({ z: e.y, d: () => drawSlime(ctx, e, now) });
    if (scene === 'foret') {
      for (let y = Math.max(1, y0); y <= Math.min(LAYOUTS.foret.length - 2, y1 + 2); y++) for (let x = Math.max(1, x0 - 1); x <= Math.min(LAYOUTS.foret[0].length - 2, x1 + 1); x++)
        if (isForestTree(x, y) && !forestGone(S, x, y)) { const cut = forestCut(S, x, y); list.push({ z: y + .9, d: () => drawForestTree(ctx, x, y, S.season, cut) }); }
      list.push({ z: FOREST_CHEST.y + .8, d: () => { drawChest(ctx, FOREST_CHEST.x, FOREST_CHEST.y); if (forestChestFull(S)) { ctx.fillStyle = 'rgba(255,240,170,' + (.2 + .15 * Math.sin(now / 300)) + ')'; ctx.fillRect(FOREST_CHEST.x * T, FOREST_CHEST.y * T + 2, 16, 12); } } });   // lot 8 : coffre au bout du labyrinthe
      const cols = {}; for (const ss of MUSHROOMS) for (const m of ss) cols[m.id] = m.c;
      for (const k in (S.foret && S.foret.shrooms) || {}) { const [x, y] = k.split(',').map(Number), m = S.foret.shrooms[k]; list.push({ z: y + .6, d: () => drawShroom(ctx, x, y, m, cols[m.sp]) }); }
    }
    if (scene === 'dedale') {   // lot 30b : arbres (dont les chênes, plus gros) et marmottes
      for (const k in (S.dedale && S.dedale.trees) || {}) { const [x, y] = k.split(',').map(Number), o = S.dedale.trees[k]; if (x >= x0 - 1 && x <= x1 + 1 && y >= y0 - 1 && y <= y1 + 2) list.push({ z: y + .9, d: () => drawTree(ctx, x, y, { k: o.k, g: 3, shake: o.shake }, S.season, now) }); }
      for (const e of g.enemies) list.push({ z: e.y, d: () => drawMob(ctx, e, now) });
    }
    if (scene === 'wild') {
      for (const e of g.enemies) list.push({ z: e.y, d: () => drawMob(ctx, e, now) });
      for (const k in (S.wild && S.wild.rocks) || {}) { const [x, y] = k.split(',').map(Number), o = S.wild.rocks[k]; list.push({ z: y + .9, d: () => drawZRock(ctx, x, y, o) }); }
      for (const s2 of g.shots || []) list.push({ z: s2.y, d: () => { ctx.fillStyle = '#3a2020'; ctx.fillRect(Math.round(s2.x * T) - 2, Math.round(s2.y * T) - 2, 4, 4); ctx.fillStyle = '#e0a060'; ctx.fillRect(Math.round(s2.x * T) - 1, Math.round(s2.y * T) - 1, 2, 2); } });
    }
    if (scene === 'quartier') { // volets de Franck : fermés tant qu'il n'a pas 3 cœurs
      const r = S.social && S.social.franck, open = r && r.points >= 750, wx = (QUARTIER.franck.x - 25 + 25) * T + 6, wy = QUARTIER.franck.y * T + 12;
      list.push({ z: QUARTIER.franck.y + 2.95, d: () => {
        if (open) { ctx.fillStyle = '#ffd98a'; ctx.fillRect(wx + 2, wy + 2, 10, 8); ctx.fillStyle = '#3e5a7a'; ctx.fillRect(wx - 5, wy, 5, 12); ctx.fillRect(wx + 14, wy, 5, 12); }
        else { ctx.fillStyle = '#3e5a7a'; ctx.fillRect(wx, wy, 14, 12); ctx.fillStyle = '#2a4058'; for (let k = 2; k < 12; k += 3) ctx.fillRect(wx, wy + k, 14, 1); ctx.fillRect(wx + 7, wy, 1, 12); }
      } });
    }
    { // fleurs, cailloux et filons (ferme, forêt, Caverne sombre)
      const N = S.nature && S.nature[scene];
      if (N) {
        for (const k in N.flowers) { const [x, y] = k.split(',').map(Number); if (x >= x0 && x <= x1 && y >= y0 && y <= y1) list.push({ z: y + .5, d: () => drawFlower(ctx, x, y, FLOWER_COL[N.flowers[k]] || '#fff', now) }); }
        for (const k in N.rocks) { const [x, y] = k.split(',').map(Number), o = N.rocks[k]; if (x >= x0 && x <= x1 && y >= y0 && y <= y1) list.push({ z: y + .9, d: () => o.t === 'vein' ? drawVein(ctx, x, y, o, VEINS[o.v].c, now) : drawRock(ctx, x, y, o) }); }
      }
      if (scene === 'farm' && rainbowVisible(S)) {
        const R = S.rainbow;
        list.push({ z: R.y + .5, d: () => { // coffre qui scintille
          const x = R.x * T, y = R.y * T, b = Math.round(Math.sin(now / 200) * 1);
          ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x + 2, y + 13, 12, 2);
          ctx.fillStyle = '#6a3e1e'; ctx.fillRect(x + 3, y + 6 + b, 10, 7); ctx.fillStyle = '#8a5428'; ctx.fillRect(x + 3, y + 5 + b, 10, 3);
          ctx.fillStyle = '#f2c832'; ctx.fillRect(x + 3, y + 8 + b, 10, 1); ctx.fillRect(x + 7, y + 8 + b, 2, 3);
          if ((now / 300 | 0) % 2) { ctx.fillStyle = '#fff'; ctx.fillRect(x + 12, y + 3 + b, 1, 3); ctx.fillRect(x + 11, y + 4 + b, 3, 1); }
        } });
        list.push({ z: 9999, d: () => drawRainbow(ctx, R.x * T + 8, R.y * T + 10, S.minute, R) });
      }
    }
    if (scene === 'farm') for (const t of FIELD_TOOLS) if (t.tool === 'axe' && fieldToolAt(S, t.x, t.y)) list.push({ z: BIG_TREE.y + .99, d: () => {   // lot 8 : la hache plantée dans le tronc du grand arbre
      const px = BIG_TREE.x * T + 8 + 6, py = BIG_TREE.y * T + 14 - 16, a = .25 + .2 * Math.sin(now / 300), R = (u, v, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(px + u, py + v, w, h); };
      ctx.fillStyle = 'rgba(255,240,170,' + a + ')'; ctx.fillRect(px - 3, py - 5, 18, 14);
      R(-2, -3, 3, 7, '#8c8f96'); R(-2, -3, 3, 1, '#c2c6cc'); R(1, -2, 2, 5, '#5a5a66');   // fer à moitié enfoncé, fente dans l'écorce
      R(-3, -4, 1, 9, '#3f2615');
      for (let k = 0; k < 11; k++) R(2 + k, Math.round(k * .55), 2, 2, k % 3 ? '#a8774a' : '#8a5a32');   // manche qui dépasse, un peu tombant
      R(12, 5, 2, 2, '#5b3a22');
    } });
    if (scene === 'farm') for (const t of FIELD_TOOLS) if (t.tool !== 'axe' && fieldToolAt(S, t.x, t.y)) list.push({ z: t.y + .4, d: () => { // outil posé par terre
      const b = Math.round(Math.sin(now / 250 + t.x) * 1.5), x = t.x * T, y = t.y * T;
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x + 3, y + 12, 10, 2);
      ctx.fillStyle = 'rgba(255,240,170,' + (.25 + .2 * Math.sin(now / 300)) + ')'; ctx.fillRect(x + 1, y + 1 + b, 14, 12);
      ctx.save(); ctx.translate(x + 8, y + 11 + b); ctx.rotate(-.5); drawToolPix(ctx, t.tool); ctx.restore();
    } });
    if (scene === 'farm') {
      for (const [x, y, k] of BUSHES) if (x >= x0 && x <= x1 && y >= y0 && y <= y1) list.push({ z: y + .8, d: () => drawBush(ctx, x, y, bushRipe(S, x, y), k === 'mure') });
      for (const ch of S.chests || []) list.push({ z: ch.y + .8, d: () => drawChest(ctx, ch.x, ch.y) });
      for (const f of S.fires || []) list.push({ z: f.y + .7, d: () => drawFire(ctx, f.x, f.y, now) });
      if (ghostVisible(S)) list.push({ z: GHOST.y + .9, d: () => drawGhost(ctx, GHOST.x, GHOST.y, now) });
      for (const p of S.pots || []) list.push({ z: p.y + .7, d: () => { drawPot(ctx, p.x, p.y, now, !!p.cook);
        if (p.cook) { const cp = p.cook.t0 != null ? Math.min(1, (g.now() - p.cook.t0) / 4000) : (p.cook.p || 0); const x = p.x * T, y = p.y * T - 8; ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x - 1, y - 1, 18, 5); ctx.fillStyle = cp >= 1 ? '#7ad04a' : '#f2a03a'; ctx.fillRect(x, y, Math.round(16 * cp), 3); } } });
      if (g.cooking) list.push({ z: 9997, d: () => { const p = cookProgress(g), x = g.cooking.x * T, y = g.cooking.y * T - 8;
        ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x - 1, y - 1, 18, 5); ctx.fillStyle = '#f2a03a'; ctx.fillRect(x, y, Math.round(16 * p), 3); } });
    }
    if (sky) { // sorties : flèches animées et nom de la destination, au bord de l'écran
      const NAMES = { farm: 'Ma ferme', place: 'Place du panneau', carriere: 'Carrière', route: 'Longue route', route_ville: 'Route', route_plage: 'Route de la plage', town: 'Centre-ville', plage: 'Cabane du pêcheur', parc: 'Fête foraine', quartier: 'Zone résidentielle', gare: 'Gare', resto: 'Restaurant', rondpoint: 'Rond-point', ranch: 'Ranch du Maire', port: 'Zone portuaire', town: 'Centre-ville', foret: 'Forêt', wild: 'Caverne sombre', plage: 'Cabane du pêcheur', montagne: 'Montagne', rouky: 'Chez Rouky' }, seen = new Set();
      for (const d of SC.doors || []) {
        const W = SC.W, H = SC.H, edge = d.x === 0 ? 'g' : d.x === W - 1 ? 'd' : d.y === 0 ? 'h' : d.y === H - 1 ? 'b' : null;
        if (!edge || !NAMES[d.to] || seen.has(d.to + edge)) continue; seen.add(d.to + edge);
        const grp = SC.doors.filter(o => o.to === d.to), cx = grp.reduce((a, o) => a + o.x, 0) / grp.length, cy = grp.reduce((a, o) => a + o.y, 0) / grp.length;
        list.push({ z: 9990, d: () => {
          const px = cx * T + 8, py = cy * T + 8, b = Math.sin(now / 220) * 2, [ax, ay] = { g: [-1, 0], d: [1, 0], h: [0, -1], b: [0, 1] }[edge];
          ctx.fillStyle = 'rgba(255,240,170,.9)';
          for (let k = 0; k < 2; k++) { const ox = px - ax * (6 - k * 5 - b), oy = py - ay * (6 - k * 5 - b); ctx.globalAlpha = .55 + k * .35; ctx.beginPath();
            ctx.moveTo(ox + ax * 4, oy + ay * 4); ctx.lineTo(ox - ay * 4 - ax * 2, oy + ax * 4 - ay * 2); ctx.lineTo(ox + ay * 4 - ax * 2, oy - ax * 4 - ay * 2); ctx.fill(); }
          ctx.globalAlpha = 1;   // 18/11 : plus de nom sur les flèches de sortie
        } });
      }
    }
    if (scene === 'parc') { // grande roue qui tourne, carrousel qui scintille
      const Rb = PARC_B.R, cx = (Rb.x + Rb.w / 2) * T, cy = (Rb.y + Rb.h / 2 - .4) * T, rad = Rb.w * T * .44, a0 = now / 4000;
      list.push({ z: Rb.y + Rb.h - .2, d: () => {
        ctx.strokeStyle = '#d8d2c4'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 7); ctx.stroke();
        ctx.strokeStyle = '#8a8490'; ctx.lineWidth = 1; for (let k = 0; k < 8; k++) { const a = a0 + k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); ctx.stroke(); }
        ctx.fillStyle = '#5a5560'; ctx.fillRect(cx - 2, cy - 2, 4, (Rb.y + Rb.h) * T - cy);
        for (let k = 0; k < 8; k++) { const a = a0 + k * Math.PI / 4, nx = cx + Math.cos(a) * rad, ny = cy + Math.sin(a) * rad;
          ctx.fillStyle = ['#e8402a', '#f2c832', '#3a8ae0', '#4ab04a'][k % 4]; ctx.fillRect(Math.round(nx - 5), Math.round(ny), 10, 8); ctx.fillStyle = '#bfe3f5'; ctx.fillRect(Math.round(nx - 3), Math.round(ny + 2), 6, 3); }
      } });
      const Ib = PARC_B.I, ix = Ib.x * T, iy = Ib.y * T, iw = Ib.w * T;
      list.push({ z: Ib.y + Ib.h - .2, d: () => {
        ctx.fillStyle = '#e8402a'; ctx.beginPath(); ctx.moveTo(ix - 4, iy + 18); ctx.lineTo(ix + iw / 2, iy - 6); ctx.lineTo(ix + iw + 4, iy + 18); ctx.fill();
        for (let k = 0; k < iw; k += 10) { ctx.fillStyle = ((k / 10 | 0) + (now / 250 | 0)) % 2 ? '#ffe28a' : '#fff6e0'; ctx.fillRect(ix + k, iy + 17, 3, 3); }
        for (let k = 0; k < 4; k++) { const ph = now / 600 + k * Math.PI / 2, hx = ix + iw / 2 + Math.cos(ph) * iw * .36, hy = iy + 34 + Math.sin(now / 200 + k) * 3;
          ctx.fillStyle = '#c9a330'; ctx.fillRect(Math.round(hx), iy + 18, 1, hy - iy - 18); ctx.fillStyle = Math.sin(ph) > 0 ? '#fff6e0' : '#d8c8b0'; ctx.fillRect(Math.round(hx - 5), Math.round(hy), 11, 6); ctx.fillRect(Math.round(hx + 4), Math.round(hy - 3), 3, 4); }
      } });
    }
    if (g.fishing) list.push({ z: 9996, d: () => { // ligne, bouchon, ombre du poisson qui tourne (façon Zelda) puis « ! »
      const F = g.fishing, bx = F.x * T + 8, by = F.y * T + 8, hx = S.x * T + (S.dir === 2 ? -6 : 6), hy = S.y * T - 18;
      const t = now / 1000, bob = F.phase === 'bite' ? 3 : Math.round(Math.sin(t * 3) * 1);
      if (F.fish && F.phase === 'wait') { const left = Math.max(0, (F.bite - now) / 4000), ang = t * 1.6, rad = 6 + left * 22;   // l'ombre se rapproche en tournant
        ctx.fillStyle = 'rgba(10,20,40,.35)'; ctx.beginPath(); ctx.ellipse(bx + Math.cos(ang) * rad, by + Math.sin(ang) * rad * .6, 6, 3, ang + Math.PI / 2, 0, 7); ctx.fill(); }
      ctx.strokeStyle = 'rgba(240,240,250,.8)'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo((hx + bx) / 2, Math.min(hy, by) - 10, bx, by + bob); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(bx - 4, by + 3, 8, 1);
      ctx.fillStyle = '#e8402a'; ctx.fillRect(bx - 2, by - 2 + bob, 4, 3); ctx.fillStyle = '#ffffff'; ctx.fillRect(bx - 2, by + 1 + bob, 4, 2);
      if (F.phase === 'bite') { const s = 1 + Math.sin(now / 60) * .15; ctx.save(); ctx.translate(S.x * T, S.y * T - 34); ctx.scale(s, s);
        ctx.fillStyle = '#ffdf3a'; ctx.strokeStyle = '#6a3a12'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 7, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#6a3a12'; ctx.fillRect(-1, -5, 2, 6); ctx.fillRect(-1, 3, 2, 2); ctx.restore(); }
    } });
    if (scene === 'farm' && S.tent) list.push({ z: S.tent.y + .9, d: () => { // tente du début
      const x = S.tent.x * T, y = S.tent.y * T;
      ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(x - 3, y + 13, 22, 3);
      for (let i = 0; i < 12; i++) { ctx.fillStyle = i < 2 ? '#3f7a8a' : '#4f96a8'; ctx.fillRect(x + 8 - i - 1, y + 2 + i, (i + 1) * 2, 1); }
      ctx.fillStyle = '#2e6070'; for (let i = 0; i < 12; i++) ctx.fillRect(x + 8 + i, y + 2 + i, 1, 1);
      ctx.fillStyle = '#1c2a30'; for (let i = 0; i < 7; i++) ctx.fillRect(x + 8 - (i >> 1), y + 7 + i, (i >> 1) * 2 + 1, 1);
      ctx.fillStyle = '#e8c26a'; ctx.fillRect(x + 7, y, 2, 3); ctx.fillStyle = '#7a4f2e'; ctx.fillRect(x - 3, y + 13, 2, 2); ctx.fillRect(x + 17, y + 13, 2, 2);
    } });
    // (bijou d'Igor retiré le 17/11 : quête supprimée)
    if (scene === 'gare' && S.intro && S.intro.step !== 'done' && !(g.ride && g.ride.scene === 'gare' && g.ride.t > 6)) list.push({ z: 0.5, d: () => drawLoco(ctx, S.intro.step === 'train' ? (g.introT || 0) / 1000 : 99, now, g.introHidden ? S.look : null, g.ride && g.ride.scene === 'gare' ? g.ride.t : 0) });   // lot 8 : elle repart une fois le héros dans la diligence   // Farmwest : la locomotive à quai
    if (g.cueille && g.cueille.scene === scene) { const q = g.cueille; list.push({ z: 9990, d: () => { const x = q.x * T, y = q.y * T - 6; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - 1, y - 1, 18, 5); ctx.fillStyle = '#7ad04a'; ctx.fillRect(x, y, Math.round(16 * q.n / CUEILLE_HITS), 3); } }); }   // jauge de cueillette
    if (g.ride && g.ride.scene === scene) list.push({ z: g.ride.y + .2, d: () => drawCoach(ctx, g.ride.x, g.ride.y, now) });   // la diligence
    if (scene === 'farm' && testSwordHere(S)) list.push({ z: TEST_SWORD.y + .4, d: () => {
      const b = Math.round(Math.sin(now / 250) * 1.5), x = TEST_SWORD.x * T, y = TEST_SWORD.y * T;
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x + 3, y + 12, 10, 2);
      ctx.save(); ctx.translate(x + 8, y + 10 + b); ctx.rotate(-.6); ctx.fillStyle = '#5a3a22'; ctx.fillRect(-1, 2, 2, 4); ctx.fillStyle = '#e8c26a'; ctx.fillRect(-3, 1, 6, 1); ctx.fillStyle = '#d6dbe0'; ctx.fillRect(-1, -11, 2, 12); ctx.fillStyle = '#fff'; ctx.fillRect(-1, -11, 1, 11); ctx.restore();
    } });
    for (const d of S.drops || []) if (d.scene === scene) list.push({ z: d.y + .4, d: () => {
      const it = ITEMS[d.id], age = d.born ? g.now() - d.born : 1e9;
      // vol en cloche depuis l'objet cassé, puis petit rebond au sol
      const k = Math.min(1, age / SCATTER_MS), fly = k < 1, ox = fly ? (d.fx + (d.x - d.fx) * k) : d.x, oy = fly ? (d.fy + (d.y - d.fy) * k) : d.y;
      const b = fly ? -Math.round(Math.sin(k * Math.PI) * 10) : age < SCATTER_MS + 250 ? -Math.round(Math.sin((age - SCATTER_MS) / 250 * Math.PI) * 2) : Math.round(Math.sin(now / 250 + d.x) * 1.5);
      // bien visible : ombre, pastille claire cerclée, objet plein (opaque) et un peu plus grand
      ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(ox * T + 3, oy * T + 13, 10, 2);
      const cx = ox * T + 8, cy = oy * T + 7 + b;
      ctx.fillStyle = '#2a2228'; ctx.beginPath(); ctx.arc(cx, cy, 6.5, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff6e0'; ctx.beginPath(); ctx.arc(cx, cy, 5.5, 0, 7); ctx.fill();
      ctx.font = '9px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000'; ctx.fillText(it ? it.i : '❔', cx, cy + .5); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'start';
      if (d.n > 1 && !fly) { ctx.font = 'bold 6px Georgia'; ctx.fillStyle = '#2a2228'; ctx.fillText(d.n, d.x * T + 12, d.y * T + 16); ctx.fillStyle = '#fff6e0'; ctx.fillText(d.n, d.x * T + 11, d.y * T + 15); }
    } });
    if (scene === 'grange') {
      // outils au sol (avec un éclat) et passages encore fermés
      for (const p of PICKUPS) if (!S.grange.found.includes(p.tool)) list.push({ z: p.y + .5, d: () => {
        const im = toolImg(p.tool), b = Math.round(Math.sin(now / 300) * 1.5);
        ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(p.x * T + 3, p.y * T + 12, 10, 2);
        if (im.complete) ctx.drawImage(im, p.x * T, p.y * T - 2 + b);
        if (((now / 200) | 0) % 6 === 0) { ctx.fillStyle = '#fff6c0'; ctx.fillRect(p.x * T + 12, p.y * T - 1 + b, 2, 2); }
      } });
      LAYOUTS.grange.forEach((row, y) => [...row].forEach((t, x) => {
        if ((t === 'p' || t === 'r') && !isBroken(S, x, y)) list.push({ z: y + .9, d: () => {
          const px = x * T, py = y * T;
          if (t === 'p') { for (let k = 0; k < 3; k++) { ctx.fillStyle = ['#a8774a', '#8a5a32', '#b8875a'][k]; ctx.fillRect(px + 1, py + 2 + k * 5, 14, 4); ctx.fillStyle = '#3b2414'; ctx.fillRect(px + 3, py + 3 + k * 5, 1, 1); ctx.fillRect(px + 12, py + 3 + k * 5, 1, 1); } }
          else { for (const [a, b2, w] of [[1, 6, 8], [6, 2, 8], [3, 9, 10], [9, 8, 6]]) { ctx.fillStyle = '#6a605a'; ctx.fillRect(px + a, py + b2, w, 6); ctx.fillStyle = '#8a807a'; ctx.fillRect(px + a, py + b2, w, 2); } }
        } });
      }));
    }
    for (const id in g.npcs) { const n = g.npcs[id]; if ((n.scene || 'farm') !== scene) continue; list.push({ z: n.y, d: () => { drawChar(ctx, Math.round(n.x * T - 6), Math.round(n.y * T - 19), n.look, n.dir || 0, n.walking ? 1 + ((now / 85 | 0) % 8) : 0, now);   // lot 8 : plus de nom au-dessus des PNJ
      if (n.sleeping) { const t = now / 600; ctx.fillStyle = '#e8f0ff'; ctx.font = 'bold 7px Nunito, sans-serif'; ctx.fillText('z', n.x * T + 6 + (t % 1) * 3, n.y * T - 30 - (t % 1) * 6); ctx.font = 'bold 9px Nunito, sans-serif'; ctx.fillText('Z', n.x * T + 10 + ((t + .5) % 1) * 3, n.y * T - 34 - ((t + .5) % 1) * 7); } } }); }
    if (scene === 'golgolas') {   // lot 13 : le centre de Golgolas (en ruine puis réparé) et la météorite qui rétrécit
      const C = GOLGO_CENTER, st = S.golgo || {}, fixed = (st.lvl || 0) >= 1, F = houseSprite({ w: C.w * T, h: C.h * T - 24, wall: fixed ? '#b8a8c8' : '#7a7280', trim: fixed ? '#5a4a7a' : '#4a4450', roof: fixed ? '#4a6a8a' : '#3a3640', roofH: 30, windows: [[14, 14], [C.w * T - 26, 14]], lit: fixed, porch: true, door: { x: C.w * T / 2 - 9, w: 18, h: 26 }, gableWin: true });
      list.push({ z: C.y + C.h - .1, d: () => { if (!F) return; const x = C.x * T, y = C.y * T + 24; ctx.drawImage(F.im, x + F.ox, y + F.oy);
        if (!fixed) { ctx.fillStyle = 'rgba(20,14,24,.55)'; for (const [a, b, w, h] of [[30, -18, 26, 12], [62, 6, 4, 30], [100, 10, 18, 3], [20, 30, 3, 18]]) ctx.fillRect(x + a, y + b, w, h); } } });
      const left = 1 - Math.min(1, (st.hits || 0) / METEOR_HITS);
      if (left > 0) list.push({ z: METEOR.y + METEOR.h, d: () => { const cx = (METEOR.x + METEOR.w / 2) * T, cy = (METEOR.y + METEOR.h) * T - 6, k = .4 + .6 * left;
        ctx.fillStyle = 'rgba(30,20,10,.35)'; ctx.beginPath(); ctx.ellipse(cx, cy + 4, 34 * k + 6, 7, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#2a2430'; ctx.beginPath(); ctx.ellipse(cx, cy - 12 * k, 30 * k, 18 * k, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#4a4252'; ctx.beginPath(); ctx.ellipse(cx - 6 * k, cy - 18 * k, 18 * k, 9 * k, 0, 0, 7); ctx.fill();
        ctx.fillStyle = `rgba(255,${140 + 60 * Math.sin(now / 300)},60,.85)`; for (const [a, b, w] of [[-12, -10, 9], [4, -16, 7], [10, -6, 8], [-4, -4, 5]]) ctx.fillRect(Math.round(cx + a * k), Math.round(cy + b * k), Math.max(2, w * k | 0), 1);
        ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(cx - 20, cy + 10, 40, 4); ctx.fillStyle = '#f2a03a'; ctx.fillRect(cx - 20, cy + 10, Math.round(40 * left), 4); } });
    }
    if (scene === 'farm') list.push({ z: MAILBOX.y + .8, d: () => { const x = MAILBOX.x * T, y = MAILBOX.y * T, un = hasUnread(S);   // lot 13 : boîte aux lettres de la ferme
      ctx.fillStyle = '#5a3a22'; ctx.fillRect(x + 7, y + 4, 2, 12); ctx.fillStyle = '#3a5a8a'; ctx.fillRect(x + 3, y - 2, 10, 7); ctx.fillStyle = '#5a7aaa'; ctx.fillRect(x + 3, y - 2, 10, 2); ctx.fillStyle = '#1e2a40'; ctx.fillRect(x + 3, y + 5, 10, 1);
      ctx.fillStyle = un ? '#e0402a' : '#8a2a1a'; ctx.fillRect(x + 12, un ? y - 6 : y, 2, un ? 6 : 4); if (un) ctx.fillRect(x + 12, y - 6, 4, 2); } });
    if (scene === 'gare' && !(S.golgo && S.golgo.read)) list.push({ z: 13, d: () => { const x = 10 * T, y = 12 * T + 8; ctx.fillStyle = '#6a4426'; ctx.fillRect(x - 2, y, 36, 4); ctx.fillRect(x - 2, y + 7, 36, 4); ctx.fillStyle = '#4a2e1a'; ctx.fillRect(x, y - 4, 3, 18); ctx.fillRect(x + 29, y - 4, 3, 18); } });   // planches qui barrent le chemin du sud
    if (!forestOpen(S) && (scene === 'farm' || scene === 'farm:0')) {   // 19/11 : énorme arbre tombé en travers du chemin de la forêt
      const lot = scene === 'farm' ? (S.farmLot || 0) : +scene.slice(5);
      if (lot === 0) { const tx = scene === 'farm' ? 46 : 28, ty = scene === 'farm' ? 16 : 8; list.push({ z: ty + 3, d: () => {
        const x = tx * T, y = ty * T, R2 = (a, b, w, h, k) => { ctx.fillStyle = k; ctx.fillRect(x + a, y + b, w, h); };
        R2(-2, 50, 30, 4, 'rgba(20,12,8,.3)');
        R2(4, 2, 14, 50, '#6e4426'); R2(4, 2, 4, 50, '#8a5a32'); R2(15, 2, 3, 50, '#4e2e18'); for (let k = 6; k < 50; k += 7) R2(6, k, 9, 1, '#5a3820');   // tronc couché
        R2(3, 50, 16, 6, '#d9a870'); R2(7, 52, 8, 2, '#b07a48'); R2(10, 53, 2, 1, '#8a5a32');   // bout coupé (cernes)
        for (const [a, b, r] of [[2, -10, 12], [16, -6, 11], [8, -16, 10], [-4, -2, 8], [22, 4, 8]]) { ctx.fillStyle = '#2f6a2a'; ctx.beginPath(); ctx.arc(x + a + 8, y + b + 8, r, 0, 7); ctx.fill(); ctx.fillStyle = '#4a9a3a'; ctx.beginPath(); ctx.arc(x + a + 6, y + b + 6, r * .6, 0, 7); ctx.fill(); }   // ramure
        R2(-6, 20, 12, 3, '#5a3820'); R2(16, 32, 12, 3, '#5a3820');   // branches cassées
      } }); }
    }
    if (SC.shop && SHOP_VENDOR[SC.shop]) { const v = { igor: IGOR, harry: HARRY }[SHOP_VENDOR[SC.shop]]; if (v) list.push({ z: VENDOR_POS.y, d: () => { drawChar(ctx, Math.round(VENDOR_POS.x * T - 6), Math.round(VENDOR_POS.y * T - 19), v.look, 0, 0, now); } }); }   // 20/11 : le vendeur derrière son comptoir
    if (scene === 'place' && suzieAtStand(S)) list.push({ z: SUZIE_STAND.y, d: () => { drawChar(ctx, Math.round(SUZIE_STAND.x * T - 6), Math.round(SUZIE_STAND.y * T - 19), SUZIE.look, 2, 0, now); } });   // 20/11 : Suzie à l'étal
    if (scene === 'place') list.push({ z: STAND_POS.y + .9, d: () => {   // 19/11 : l'étal de vente, sur la place du panneau
      const x = STAND_POS.x * T, y = STAND_POS.y * T, R2 = (a, b, w, h, k) => { ctx.fillStyle = k; ctx.fillRect(x + a, y + b, w, h); }, lots = (S.stand && S.stand.lots) || [];
      R2(0, 14, 32, 3, 'rgba(30,15,5,.3)');
      R2(1, -14, 2, 28, '#5a3a22'); R2(29, -14, 2, 28, '#5a3a22');   // poteaux
      for (let k = 0; k < 8; k++) R2(-2 + k * 4.5, -18, 5, 6, k % 2 ? '#f4ead2' : '#c8402e');   // auvent rayé
      for (let k = 0; k < 8; k++) R2(-2 + k * 4.5, -12, 5, 2, k % 2 ? '#d8cbb0' : '#a8302b');
      R2(0, 2, 32, 12, '#8a5a32'); R2(0, 2, 32, 2, '#b07a48'); for (let k = 3; k < 32; k += 7) R2(k, 5, 1, 9, '#6a4226');   // comptoir
      const cols = ['#e8c26a', '#c84a4a', '#8ac06a', '#c99560', '#9aa4b0'];
      for (let k = 0; k < Math.min(5, Math.max(lots.length, 2)); k++) { const cx = 3 + k * 6; R2(cx, -3, 5, 5, '#a8774a'); R2(cx + 1, -4, 3, 2, lots[k] ? cols[k % 5] : '#7a5a3a'); }   // cageots
      R2(10, 9, 12, 4, '#f4ead2'); R2(12, 10, 2, 2, '#3a2410'); R2(15, 10, 2, 2, '#3a2410'); R2(18, 10, 2, 2, '#3a2410');   // ardoise
    } });
    if (scene === 'carriere') { const hits = (S.bigRock && S.bigRock.hits) || 0, B = BIG_ROCK; list.push({ z: B.y + B.h - .1, d: () => {   // lot 29 : l'énorme rocher (très haut), fissuré au fil des coups
      const x = B.x * T, y = (B.y + B.h) * T, w = B.w * T, R2 = (a, b, ww, h, k) => { ctx.fillStyle = k; ctx.fillRect(x + a, y + b, ww, h); };
      if (hits >= ROCK_HITS) {   // un trou dans le sol
        R2(4, -T * 2.4, w - 8, T * 2, '#2a2018'); R2(8, -T * 2.2, w - 16, T * 1.6, '#120c08'); R2(2, -T * 2.6, w - 4, 4, '#8a7a62');
        for (let k = 0; k < 6; k++) R2(6 + k * 9, -T * .5, 5, 3, '#9a8a72');   // éboulis
        return; }
      const Hh = T * 6.5, cols = ['#6e6a62', '#8a857a', '#a49e90', '#bdb6a6'];
      R2(-4, -6, w + 8, 8, 'rgba(25,18,10,.35)');
      for (let k = 0; k < 12; k++) { const t = k / 12, ww = w * (1 - t * .55), hh = Hh / 12 + 1; R2((w - ww) / 2, -t * Hh - hh, ww, hh, cols[(k + 1) % 2]); }
      for (let k = 0; k < 12; k++) { const t = k / 12, ww = w * (1 - t * .55); R2((w - ww) / 2, -t * Hh - Hh / 12, ww * .28, Hh / 12, cols[0]); R2((w + ww) / 2 - ww * .2, -t * Hh - Hh / 12, ww * .2, Hh / 12, cols[3]); }   // ombre à gauche, lumière à droite… et strates
      for (let k = 0; k < 5; k++) R2(6 + k * 11, -(18 + k * 13) % (Hh - 10) - 8, 7, 2, '#5a564e');
      const n = Math.floor(10 * hits / ROCK_HITS);   // fissures qui s'étendent (une tous les 1 000 coups)
      for (let k = 0; k < n; k++) { const cx = 10 + (k * 23) % (w - 20), cy = -12 - (k * 37) % (Hh - 30); for (let s = 0; s < 6; s++) R2(cx + (s % 2) * 2, cy - s * 3, 1, 3, '#2a2620'); }
    } }); }
    if (scene === 'rondpoint' && decor('fontaine')) list.push({ z: 10.6, d: () => drawDecor(ctx, 'fontaine', 12.5 * T + 8, 8.5 * T + 8 + 34 * .62 + 8, 88) });   // lot 32 : fontaine au cheval cabré
    if (scene === 'town' && decor('fontaine')) list.push({ z: TOWN_B2.F.y + 2.6, d: () => drawDecor(ctx, 'fontaine', TOWN_B2.F.x * T + 24, TOWN_B2.F.y * T + 24 + 23 * .62 + 8, 60) });
    if (scene === 'town' && decor('saloon')) list.push({ z: TOWN_B2.R.y + TOWN_B2.R.h - .05, d: () => drawDecor(ctx, 'saloon', (TOWN_B2.R.x + TOWN_B2.R.w / 2) * T, (TOWN_B2.R.y + TOWN_B2.R.h) * T + 7, 112) });   // lot 32 : le saloon
    if (scene === 'place') list.push({ z: DUMP_POS.y + .9, d: () => {   // 20/11 : la décharge (benne et tas de ferraille)
      const x = DUMP_POS.x * T, y = DUMP_POS.y * T, R2 = (a, b, w, h, k) => { ctx.fillStyle = k; ctx.fillRect(x + a, y + b, w, h); };
      R2(0, 13, 32, 3, 'rgba(30,15,5,.3)');
      R2(1, 0, 22, 14, '#5d6b4a'); R2(1, 0, 22, 2, '#7d8c62'); R2(3, 4, 18, 1, '#46523a'); R2(3, 8, 18, 1, '#46523a');   // benne
      R2(-1, -1, 26, 3, '#3e4632'); R2(4, -4, 4, 3, '#a0805a'); R2(9, -5, 5, 4, '#8a8f96'); R2(15, -3, 6, 2, '#b8463a');   // ce qui dépasse
      R2(24, 6, 7, 8, '#7a5a3a'); R2(25, 7, 5, 6, '#9a7246'); R2(26, 3, 3, 3, '#6d737a');   // tonneau et vieux seau
      R2(5, 6, 14, 5, '#f4ead2'); R2(7, 8, 2, 1, '#3e8a3a'); R2(11, 7, 2, 3, '#3e8a3a'); R2(15, 8, 2, 1, '#3e8a3a');   // pancarte ♻
    } });
    { const p = roxPos(g.npcs.rouky); if (p && p.scene === scene) list.push({ z: p.y, d: () => drawAnimal(ctx, { type: 'dog', x: p.x, y: p.y, moving: false }, now, null) }); }   // lot 12 : Rox, le chien de Rouky
    { const M = S.mounds && S.mounds[scene]; if (M) for (const k in M.at) { const [x, y] = k.split(',').map(Number); if (x >= x0 - 1 && x <= x1 + 1 && y >= y0 - 1 && y <= y1 + 1) list.push({ z: y + .2, d: () => drawMound(ctx, x, y) }); } }   // lot 12 : petits tas à creuser
    for (const id in g.others) { const o = g.others[id]; if (!o.look || (o.scene || 'farm') !== scene) continue; list.push({ z: o.y, d: () => { drawChar(ctx, Math.round(o.x * T - 6), Math.round(o.y * T - 19), o.look, o.dir, o.f, now + 777); label(o.name, o.x * T, o.y * T - 25); } }); }
    if (!g.ride && !g.introHidden) list.push({ z: S.y, d: () => {   // pendant la diligence (et l'arrivée en train), le héros est dedans
      const pickArt = swing && (swing.tool === 'pick' || swing.tool === 'axe') && heroToolSheet(S.look, swing.tool);   // 19/11 : coup de pioche dessiné (planche fournie)
      if (pickArt) { if (!(g.player.iframe > 0 && ((now / 80) | 0) % 2)) drawHeroPick(ctx, Math.round(S.x * T - 6), Math.round(S.y * T - 19), S.look, S.dir, swing.p, swing.tool); } else {
      if (swing && S.dir === 1) drawSwing(ctx, S, swing.tool, swing.p);
      if (!(g.player.iframe > 0 && ((now / 80) | 0) % 2)) drawChar(ctx, Math.round(S.x * T - 6), Math.round(S.y * T - 19), S.look, S.dir, g.player.walkFrame, now, !!swing); }
      { // 20/11 : énergie et vie au-dessus du héros dès qu'elles passent à l'orange (≤ 50 %), à hauteur de la tête (selon la planche)
        const re = Math.max(0, S.energy / S.maxE), rh = Math.max(0, S.hp) / S.maxHp, showE = document.body.dataset.nrj === 'tete' || re <= .5, showH = rh <= .5;
        if (showE || showH) {
          const Hs = SHEETS[heroSheetName(S.look)], headTop = Math.round(S.y * T) + 1 - ((Hs && Hs.fh) || (S.look.tall ? 32 : 29)), bx = Math.round(S.x * T - 9);
          const bars = [showH && ['hp', rh], showE && ['en', re]].filter(Boolean);
          bars.forEach(([k, r], i) => { const by = headTop - 5 - (bars.length - 1 - i) * 4, shake = r <= .3 ? Math.round(Math.sin(now / 40)) : 0;
            ctx.fillStyle = 'rgba(20,14,30,.85)'; ctx.fillRect(bx - 1 + shake, by - 1, 20, 4);
            ctx.fillStyle = k === 'hp' ? (r <= .2 ? '#ff2a2a' : '#e8503a') : (r <= .2 ? '#ff2a2a' : r <= .5 ? '#f0a020' : '#6fd04a'); ctx.fillRect(bx + shake, by, Math.round(18 * r), 2); });
        }
      }
      if (swing && S.dir !== 1 && !pickArt) drawSwing(ctx, S, swing.tool, swing.p);
      const ea = eating(g); if (ea) {   // 19/11 : petite animation quand on mange (l'objet monte à la bouche, miettes)
        const p = (g.now() - ea.t0) / EAT_MS, im = artImage(ea.id), hx = Math.round(S.x * T - 6), hy = Math.round(S.y * T - 19);
        const lift = Math.min(1, p * 3), bite = p > .33 ? Math.round(Math.sin(p * 40)) : 0, sz = Math.round(12 * (p > .8 ? 1 - (p - .8) * 5 : 1));
        if (im && im.complete && sz > 1) ctx.drawImage(im, hx + 6 - sz / 2, hy + 14 - Math.round(lift * 8) + bite - sz / 2, sz, sz);
        if (p > .33) { ctx.fillStyle = '#e8c890'; for (let k = 0; k < 3; k++) { const q = (p * 3 + k * .3) % 1; ctx.fillRect(hx + 3 + k * 3, hy + 10 + Math.round(q * 10), 1, 1); } }
        if (p > .7) { ctx.fillStyle = '#fff6c0'; ctx.font = 'bold 7px Nunito, sans-serif'; ctx.fillText('miam', hx - 2, hy - 2 - Math.round((p - .7) * 20)); }
      }
    } });
    for (const f of worldFx) if (f.k === 'fall' && outside) list.push({ z: f.y + .95, d: () => {
      // l'arbre bascule autour du pied du tronc, de plus en plus vite, puis s'efface
      const ang = Math.min(1.45, f.t * f.t * 2.6) * f.dir, px = f.x * T + 8, py = f.y * T + 14;
      ctx.save(); ctx.globalAlpha = Math.min(1, f.life * 3); ctx.translate(px, py); ctx.rotate(Math.round(ang / (Math.PI / 16)) * (Math.PI / 16));
      ctx.drawImage((KIND_SPRITE[f.kind] || treeSprite)(f.season, f.v), -17, -42); ctx.restore();
      ctx.fillStyle = '#5b3a22'; ctx.fillRect(f.x * T + 5, f.y * T + 10, 6, 4); ctx.fillStyle = '#c9955a'; ctx.fillRect(f.x * T + 6, f.y * T + 10, 4, 1);
    } });
    for (const f of worldFx) if (f.k === 'chip') list.push({ z: f.floor / T, d: () => { ctx.globalAlpha = Math.min(1, f.life * 3); ctx.fillStyle = f.col; ctx.fillRect(Math.round(f.x), Math.round(f.y), 2, 2); ctx.globalAlpha = 1; } });
    list.sort((a, b) => a.z - b.z).forEach(o => o.d());
    if (!g.ride && !g.introHidden && cache.__over) {   // 19/11 : derrière un bâtiment ou un lampadaire, seuls ses pixels (pas le sol) recouvrent le héros
      const hx = Math.round(S.x * T - 16), hy = Math.round(S.y * T - 40), hw = 32, hh = 44, feet = S.y * T; let covered = null;
      for (const o of cache.__over) {
        if (feet >= o.base - 2 || hx >= o.x + o.w || hx + hw <= o.x || hy >= o.y + o.h || hy + hh <= o.y) continue;
        const x0 = Math.max(hx, o.x), y0 = Math.max(hy, o.y), x1 = Math.min(hx + hw, o.x + o.w), y1 = Math.min(hy + hh, o.y + o.h);
        ctx.drawImage(o.im, x0 - o.x, y0 - o.y, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0); (covered ||= []).push([x0, y0, x1, y1]);
      }
      if (covered) drawSigns(covered);
    }

    if (SC.rooms) { // tout ce qui n'est pas la salle courante est masqué
      const rw = SC.rooms.w * T, rh = SC.rooms.h * T, rx = Math.floor(S.x * T / rw) * rw, ry = Math.floor(S.y * T / rh) * rh;
      ctx.fillStyle = '#16121f';
      ctx.fillRect(cam.x - 2, cam.y - 2, rx - cam.x + 2, vh + 4); ctx.fillRect(rx + rw, cam.y - 2, vw, vh + 4);
      ctx.fillRect(rx, cam.y - 2, rw, ry - cam.y + 2); ctx.fillRect(rx, ry + rh, rw, vh);
    }
    const t = g.player.target;
    if (t) brackets(t.tx, t.ty, now);
    ctx.font = 'bold 8px Georgia'; ctx.lineWidth = 2; ctx.strokeStyle = '#1b1226';
    for (const f of g.fx) { ctx.globalAlpha = Math.min(1, f.life * 2); ctx.strokeText(f.t, f.x * T, f.y * T); ctx.fillStyle = f.c || '#fff6e0'; ctx.fillText(f.t, f.x * T, f.y * T); }
    ctx.globalAlpha = 1;

    // ---- lumière et étalonnage (espace écran) ----
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const toScreen = (wx, wy) => [(wx - camX) * scale, (wy - camY) * scale];
    const dark = sky ? Math.min(.7, darkness(S) * 1.15) : SC.dark ? .62 : 0;
    const LIGHTS_HERE = scene === 'grange' ? GRANGE_LIGHTS : outside ? LIGHTS.filter((l, i) => i !== 1 || (S.built && S.built.coop)) : scene === 'town' ? TOWN_LIGHTS : scene === 'wild' ? CAVE_LIGHTS : [];
    if (!sky) { ctx.fillStyle = 'rgba(255,180,100,.07)'; ctx.fillRect(0, 0, cv.width, cv.height); }
    if (sky && dark < .25 && (S.weather === 'sun' || !S.weather)) {   // ambiance : lumière chaude venue d'en haut à gauche, ombres de nuages qui passent
      const lg = ctx.createLinearGradient(0, 0, cv.width * .8, cv.height); lg.addColorStop(0, 'rgba(255,236,180,.13)'); lg.addColorStop(.55, 'rgba(255,236,180,0)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, cv.width, cv.height);
      // 19/11 : plus d'ombres de nuages (demande de l'utilisateur)
    }
    if (sky) { const [tr, tg, tb, ta] = timeTint(S.minute, S.weather); if (ta > .005) { ctx.fillStyle = `rgba(${tr},${tg},${tb},${ta})`; ctx.fillRect(0, 0, cv.width, cv.height); } }   // 7g : matin doré, soir orangé
    if (sky && (S.weather === 'rain' || S.weather === 'storm')) { ctx.fillStyle = 'rgba(70,95,160,.14)'; ctx.fillRect(0, 0, cv.width, cv.height); }
    if (sky && S.weather === 'snow') { ctx.fillStyle = 'rgba(200,220,255,.08)'; ctx.fillRect(0, 0, cv.width, cv.height); }
    if (dark > .02) {
      const lc = light.getContext('2d');
      lc.globalCompositeOperation = 'source-over'; lc.clearRect(0, 0, light.width, light.height);
      lc.fillStyle = `rgba(14,14,46,${dark})`; lc.fillRect(0, 0, light.width, light.height);
      lc.globalCompositeOperation = 'destination-out';
      const holes = LIGHTS_HERE.map(l => [...toScreen(l.x, l.y), l.r * scale]);
      holes.push([...toScreen(S.x * T, S.y * T - 8), 44 * scale]); // le joueur reste lisible
      for (const f of worldFx) if (f.k === 'fly') holes.push([...toScreen(f.x, f.y), 6 * scale]);
      for (let [x, y, rad] of holes) {
        x /= LQ; y /= LQ; rad /= LQ;
        if (x + rad < 0 || y + rad < 0 || x - rad > light.width || y - rad > light.height) continue;   // hors écran
        const gr = lc.createRadialGradient(x, y, 0, x, y, rad);
        gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        lc.fillStyle = gr; lc.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      ctx.imageSmoothingEnabled = true; ctx.drawImage(light, 0, 0, cv.width, cv.height); ctx.imageSmoothingEnabled = false;
      // halo additif (bloom) des fenêtres et lucioles
      ctx.globalCompositeOperation = 'lighter';
      for (const l of LIGHTS_HERE) {
        const [x, y] = toScreen(l.x, l.y), rad = l.r * .6 * scale;
        if (x + rad < 0 || y + rad < 0 || x - rad > cv.width || y - rad > cv.height) continue;
        const gr = ctx.createRadialGradient(x, y, 0, x, y, rad);
        gr.addColorStop(0, `rgba(255,190,90,${.35 * dark})`); gr.addColorStop(1, 'rgba(255,190,90,0)');
        ctx.fillStyle = gr; ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      for (const f of worldFx) if (f.k === 'fly') {
        const [x, y] = toScreen(f.x, f.y), a = .5 + .5 * Math.sin(f.ph * 4);
        ctx.fillStyle = `rgba(220,255,120,${a})`; ctx.fillRect(x - scale / 2, y - scale / 2, scale, scale);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    if (sky && S.weather === 'storm' && Math.random() < .003) { ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(0, 0, cv.width, cv.height); }
    // particules écran
    const px = Math.max(1, Math.round(dpr));
    if (sky) for (const p of screenFx) {
      if (p.k === 'rain') { ctx.fillStyle = 'rgba(180,205,255,.55)'; for (let i = 0; i < 4; i++) ctx.fillRect(p.x - i * px, p.y + i * 3 * px, px, 3 * px); }
      else if (p.k === 'snow') { ctx.fillStyle = '#fff'; ctx.fillRect(p.x, p.y, 2 * px, 2 * px); }
      else if (p.k === 'splash') { ctx.fillStyle = `rgba(200,220,255,${p.life * 4})`; ctx.fillRect(p.x - 2 * px, p.y, px, px); ctx.fillRect(p.x + 2 * px, p.y, px, px); ctx.fillRect(p.x, p.y - px, px, px); }
      else if (p.k === 'leaf') { ctx.fillStyle = p.col; ctx.fillRect(p.x, p.y, 3 * px, 2 * px); }
      else if (p.k === 'mote' && dark < .3) { ctx.fillStyle = `rgba(255,226,150,${.25 + .25 * Math.sin(p.ph * 3)})`; ctx.fillRect(p.x, p.y, px, px); }
    }
    ctx.drawImage(vignette, 0, 0);
    // transition de changement de zone : un cercle s'ouvre sur le héros, avec un liseré doré
    if (trans) {
      const t = Math.max(0, Math.min(1, (now - trans) / TRANS_MS)), e = t * t * (3 - 2 * t) * t;
      if (t >= 1) trans = 0;
      else {
        const [hx, hy] = toScreen(S.x * T, S.y * T - 8), R = Math.hypot(cv.width, cv.height) * e + 2;
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, cv.width, cv.height); ctx.arc(hx, hy, R, 0, Math.PI * 2, true);
        ctx.fillStyle = '#120e1c'; ctx.fill('evenodd');
        ctx.lineWidth = Math.max(2, 3 * dpr); ctx.strokeStyle = `rgba(242,200,80,${.8 * (1 - t)})`; ctx.beginPath(); ctx.arc(hx, hy, R, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
    }
  }

  function screenToTile(e) {
    const r = cv.getBoundingClientRect();
    return {
      tx: Math.floor((((e.clientX - r.left) * dpr) / scale + cam.x) / T),
      ty: Math.floor((((e.clientY - r.top) * dpr) / scale + cam.y) / T)
    };
  }

  // 20/11 : tout redessiner (sols, intérieurs, sprites) — après un retour sur l'appli, ou depuis les réglages
  function invalidate() { for (const k in interiors) delete interiors[k]; farm = null; farmSeason = -1; cache = null; cacheScene = ''; cacheSeason = -1; for (const k in EDGE_PAT) delete EDGE_PAT[k]; clearAllCaches(); resize(); }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') invalidate(); });
  addEventListener('pageshow', e => { if (e.persisted) invalidate(); });
  cv.addEventListener('contextrestored', invalidate);
  addEventListener('resize', resize); addEventListener('ferme-zoom', resize);
  resize();
  return { render, resize, initWeather, updateParticles: update, screenToTile, farmGround, invalidate };
}
