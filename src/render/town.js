import { decor } from './decors.js';
import { fountainSprite, facadeSprite, houseSprite , blit } from './props.js';
import { paintGrass, paintOchre, paintRoad, paintPlanks, softEdge, OCHRE, paintRiver, paintBridge, paintCliff, autotile, ROAD, canopy, dress, roofFor, softPatches, barrel } from './terrain.js';
// Centre du village pré-rendu : place pavée, halle du marché, panneau d'affichage,
// fontaine, lampadaires, bancs, jardinières et arbres. Reconstruit à chaque saison.
import { CFG } from '../config.js';
import { LAYOUTS, QUARTIER, TOWN_B, TOWN_LAMPS, PARC_B, ROUKY_CABIN } from '../world/scenes.js';
import { rng } from '../world/map.js';
import { shade, disc } from './pixel.js';
import { GRASS, drawLunaHouse, drawFranckHouse, drawMystHouse } from './ground.js';
import { treeSprite } from './sprites.js';
import { signBoard } from './pixfont.js';
import { MAILBOX_IDS } from '../world/scenes.js';
const T = CFG.T;

// Lampadaires allumés la nuit (px du village).
export const TOWN_LIGHTS = TOWN_LAMPS.map(([x, y]) => ({ x: x * T + 8, y: y * T - 6, r: 40 }));

export function buildTown(season) {
  const L = LAYOUTS.town, H = L.length, W = L[0].length;
  const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
  const g = c.getContext('2d'), r = rng(31 + season);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const B = GRASS[season];

  // sol : herbe en bordure, pavés sur la place
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const px = x * T, py = y * T, ch = L[y][x];
    // Farmwest (7b) : rivière, ponts en bois, falaise en terrasses
    if (ch === 'w') { paintRiver(R, r, px, py, x, y, L); continue; }
    if (ch === '=') { paintBridge(R, r, px, py, x, y, L); continue; }
    if (ch === '^') { paintCliff(R, r, px, py, x, y, L, season); continue; }
    // Farmwest (7a) : terre ocre, rues de sable avec ornières, trottoirs en planches devant les commerces, place pavée
    if (ch === 'g' || ch === 'T' || ch === 'D' || ch === 'E') {
      if (ch === 'D') { paintRoad(R, r, px, py, x, y); continue; }
      paintOchre(R, r, px, py, x, y, season);
      continue;
    }
    const isB = (a, b) => 'MUJAOVZRYE'.includes((L[b] || '')[a] || '');
    if (isB(x, y - 1) || isB(x - 1, y - 1) || isB(x + 1, y - 1)) { paintPlanks(R, r, px, py, x, y); continue; }   // trottoir de bois
    const plaza = x >= 12 && x <= 21 && y >= 5 && y <= 9;
    if (!plaza) {
      paintRoad(R, r, px, py, x, y, (y === 10 || y === 11 || y === 24) ? 1 : (x === 20 || x === 21) ? 2 : 0);
      continue;
    }
    R(px, py, T, T, '#a9a29a');
    for (let k = 0; k < 4; k++) {
      const sx = px + (k % 2) * 8 + ((y % 2) * 4), sy = py + (k >> 1) * 8;
      R(sx + 1, sy + 1, 6, 6, ['#bcb5ac', '#b3aca2', '#c6c0b7'][r() * 3 | 0]); R(sx + 1, sy + 6, 6, 1, '#8f887f'); R(sx + 1, sy + 1, 6, 1, '#d4cec6');
    }
  }
  softPatches(g, W, H, (x, y) => 'gTE'.includes((L[y] || '')[x] || '-') ? 'ocre' : null, { ocre: OCHRE[season] || OCHRE[0] });
  // lot 11a : bords propres entre terre ocre et rues (coins arrondis)
  { const isB = (a, b) => 'MUJAOVZRYE'.includes((L[b] || '')[a] || ''), plank = (x, y) => isB(x, y - 1) || isB(x - 1, y - 1) || isB(x + 1, y - 1);
    autotile(g, W, H, (x, y) => { const ch = (L[y] || '')[x]; if (ch == null) return null; if ('gTE'.includes(ch)) return 'ocre'; if (ch === '.' && !plank(x, y) && !(x >= 12 && x <= 21 && y >= 5 && y <= 9)) return 'rue'; return null; }, { rue: 1, ocre: 2 }, { ocre: shade(OCHRE[season] || OCHRE[0], 1) }); }
  // bordure de la place

  // halle du marché (x4-10, y2-4) : socle de pierre, poteaux, auvent rayé, étal garni
  const mx = TOWN_B.M.x * T, my = TOWN_B.M.y * T, mw = 7 * T;
  R(mx - 2, my - 22, mw + 4, 3, '#6b2a1e');
  for (let i = 0; i < 7; i++) R(mx - 2 + i * 2, my - 22 + 3 + i * 2, mw + 4 - i * 4, 2, i % 2 ? '#8a3a2a' : '#a8453a');
  R(mx, my - 6, mw, 8, '#3f2615');
  for (let k = 0; k < mw; k += 8) { R(mx + k, my - 6, 4, 10, '#d8443a'); R(mx + k + 4, my - 6, 4, 10, '#f4ead2'); }
  for (let k = 0; k < mw; k += 8) { disc(g, mx + k + 2, my + 4, 2, '#d8443a'); disc(g, mx + k + 6, my + 4, 2, '#f4ead2'); }
  for (const px of [mx + 1, mx + mw - 4]) { R(px, my + 4, 3, 40, '#5b3a22'); R(px, my + 4, 1, 40, '#7a4f2e'); }
  R(mx + 4, my + 26, mw - 8, 14, '#7a4f2e'); R(mx + 4, my + 26, mw - 8, 3, '#b07a48'); R(mx + 4, my + 40, mw - 8, 4, '#5b3a22');
  const goods = ['#f2d13b', '#ef7b2a', '#e6c34a', '#fdf6e3', '#f4f1ea', '#d8443a', '#64ad3c'];
  for (let k = 0; k < 7; k++) {
    const bx = mx + 8 + k * 14; R(bx, my + 18, 12, 9, '#8a5a32'); R(bx, my + 18, 12, 2, '#a8774a');
    for (let j = 0; j < 5; j++) disc(g, bx + 3 + (j % 3) * 3, my + 17 - (j > 2 ? 2 : 0), 2, goods[(k + j) % goods.length]);
  }
  signBoard(R, mx + mw / 2, my - 16, 'MARCHÉ', 44);

  // panneau d'affichage (x14-16, y3) : toit, cadre, affiches épinglées
  const qx = TOWN_B.Q.x * T, qy = TOWN_B.Q.y * T;
  R(qx + 4, qy + 2, 3, 14, '#5b3a22'); R(qx + 3 * T - 7, qy + 2, 3, 14, '#5b3a22');
  R(qx + 1, qy - 22, 3 * T - 2, 26, '#5b3a22'); R(qx + 3, qy - 20, 3 * T - 6, 22, '#c9955a');
  for (let k = 0; k < 3 * T - 6; k += 3) R(qx + 3 + k, qy - 20, 1, 22, '#b48450');
  R(qx - 2, qy - 27, 3 * T + 4, 5, '#6b2a1e'); R(qx - 2, qy - 27, 3 * T + 4, 1, '#a8453a');
  for (let k = 0; k < 6; k++) {
    const ax = qx + 6 + (k % 3) * 14, ay = qy - 18 + (k >> 1 ? 9 : 0) + (k > 2 ? 0 : 0);
    R(ax, ay + (k > 2 ? 9 : 0), 10, 8, ['#fdf6e3', '#f6e7b0', '#e8f0f8'][k % 3]); R(ax + 2, ay + 2 + (k > 2 ? 9 : 0), 6, 1, '#8a7a6a'); R(ax + 2, ay + 4 + (k > 2 ? 9 : 0), 4, 1, '#8a7a6a'); R(ax + 4, ay - 1 + (k > 2 ? 9 : 0), 2, 2, '#d8443a');
  }

  // magasin d'amélioration (x17-20, y2-4) : échoppe en bois, toit d'ardoise, enseigne, sacs et caisses
  const ux = TOWN_B.U.x * T, uy = TOWN_B.U.y * T, uw = 4 * T;
  R(ux + 2, uy - 4, uw - 4, 3 * T + 2, '#8a5a32');
  for (let k = 0; k < 3 * T; k += 4) R(ux + 2, uy - 4 + k, uw - 4, 1, '#74482a');
  R(ux + uw - 12, uy - 4, 10, 3 * T + 2, '#6e4426');
  roofFor(R, ux, uy - 26, uw, 22, '#5f6b88');
  R(ux + 24, uy + 14, 16, 26, '#4a2c18'); R(ux + 26, uy + 16, 12, 24, '#6e4426'); R(ux + 35, uy + 28, 2, 2, '#e8c26a');
  R(ux + 6, uy + 8, 14, 12, '#3b2414'); R(ux + 7, uy + 9, 12, 10, '#ffd98a'); R(ux + 12, uy + 9, 1, 10, '#3b2414'); R(ux + 7, uy + 13, 12, 1, '#3b2414');
  R(ux + 44, uy + 8, 14, 12, '#3b2414'); R(ux + 45, uy + 9, 12, 10, '#ffd98a'); R(ux + 50, uy + 9, 1, 10, '#3b2414'); R(ux + 45, uy + 13, 12, 1, '#3b2414');
  // sacs et caisses devant
  disc(g, ux + 8, uy + 38, 5, '#c9a66a'); R(ux + 6, uy + 32, 4, 2, '#8a6a3a'); disc(g, ux + 9, uy + 37, 2, '#dcc394');
  R(ux + 46, uy + 32, 12, 10, '#a8774a'); R(ux + 46, uy + 32, 12, 2, '#c99560'); R(ux + 51, uy + 32, 2, 10, '#7a4f2e');
  signBoard(R, ux + uw / 2, uy - 3, 'AMÉLIORATIONS');

  // Farmwest (7c) : bâtiment western — fausse façade en planches verticales, corniche, auvent sur poteaux, contours sombres
  const OUT = '#2a1a10';
  function western(x0, y0, w, trim, trim2, sign, deco, opt = {}) {
    if (sign === 'SALOON' && decor('saloon')) return;   // lot 32 : le saloon de la planche fournie est dessiné par-dessus, en direct
    const ux = x0 * T, uy = y0 * T, uw = w * T, top = uy - 28 - (opt.tall || 0);
    const wall = opt.wall || '#9a6a3c', wallD = shade(wall, 0.82), wallL = shade(wall, 1.12), OUT = shade(wall, 0.42);   // lot 11e : contour coloré (teinte du mur), plus de noir
    // ombre portée au sol
    g.fillStyle = 'rgba(40,20,10,.22)'; g.fillRect(ux + 4, uy + 46, uw, 4); g.fillRect(ux + uw, top + 14, 5, uy + 50 - top - 14);   // ombre portée (soleil en haut à gauche)
    { const F = facadeSprite(w, trim, trim2, opt);   // 18/11 (soir) : façade « pixel moderne » (src/render/props.js)
      if (F) { blit(g, F.im, ux + F.ox, uy + F.oy); signBoard(R, ux + uw / 2, top + 20, sign);
        if (!opt.balcony) for (const wx of (w > 3 ? [ux + 7, ux + uw - 19] : [ux + uw / 2 - 6])) for (const [fx, fc] of [[0, '#f07ab0'], [4, '#f6d24a'], [8, '#ffffff'], [11, '#e0402a']]) { R(wx + fx, top + 36, 2, 2, fc); R(wx + fx, top + 38, 1, 1, '#4a7a2a'); }
        if (opt.door) opt.door(ux + uw / 2 - 8, uy);
        deco(ux, uy, uw, top); return; } }
    // toit à deux pans qui dépasse derrière la fausse façade
    for (let i = 0; i < 6; i++) R(ux + 6 + i, top + 12 - i * 2, uw - 12 - i * 2, 2, i % 2 ? shade(trim, 0.7) : shade(trim, 0.8));
    // fausse façade : silhouette en gradins
    const step = opt.step !== false;
    R(ux - 1, top + 6, uw + 2, uy + 48 - top - 6, OUT);
    if (step) { R(ux + 9, top - 1, uw - 18, 8, OUT); R(ux + uw / 2 - 9, top - 5, 18, 5, OUT); }
    R(ux, top + 7, uw, uy + 46 - top - 7, wall);
    if (step) { R(ux + 10, top, uw - 20, 8, wall); R(ux + uw / 2 - 8, top - 4, 16, 5, wall); }
    for (let k = 4; k < uw; k += 5) { R(ux + k, top + 7, 1, uy + 46 - top - 7, wallD); if (r() < .5) R(ux + k + 1, top + 9 + (r() * 40 | 0), 1, 3, wallL); }
    if (step) for (let k = 14; k < uw - 10; k += 5) R(ux + k, top, 1, 8, wallD);
    R(ux, top + 7, 2, uy + 46 - top - 7, wallL); R(ux + uw - 3, top + 7, 3, uy + 46 - top - 7, wallD);   // lot 11g : lumière en haut à gauche, ombre à droite
    // corniche peinte
    R(ux - 2, top + 6, uw + 4, 3, trim); R(ux - 2, top + 9, uw + 4, 1, OUT);
    if (step) { R(ux + 9, top - 1, uw - 18, 2, trim); R(ux + uw / 2 - 9, top - 5, 18, 2, trim2); }
    for (let k = 0; k < uw; k += 6) R(ux + k, top + 10, 2, 2, shade(trim, 0.75));   // denticules
    // enseigne peinte sur la façade
    signBoard(R, ux + uw / 2, top + 20, sign);
    // fenêtres de l'étage
    if (!opt.balcony) for (const wx of (w > 3 ? [ux + 7, ux + uw - 19] : [ux + uw / 2 - 6])) {
      R(wx - 3, top + 26, 3, 14, shade(trim, .85)); R(wx + 12, top + 26, 3, 14, shade(trim, .85)); for (let k = 0; k < 14; k += 3) { R(wx - 3, top + 26 + k, 3, 1, shade(trim, .65)); R(wx + 12, top + 26 + k, 3, 1, shade(trim, .65)); }   // volets
      R(wx - 1, top + 27, 14, 12, OUT); R(wx, top + 28, 12, 10, '#6a90a8'); R(wx, top + 28, 12, 3, '#9cc4d8'); R(wx + 1, top + 29, 3, 1, '#e8f4fc');
      R(wx + 5, top + 28, 2, 10, wallD); R(wx, top + 32, 12, 1, wallD);   // croisillons
      R(wx + 1, top + 28, 2, 6, '#e8d4ac'); R(wx + 9, top + 28, 2, 6, '#e8d4ac');   // rideaux
      R(wx - 2, top + 38, 16, 2, trim); R(wx - 1, top + 36, 14, 2, '#7a4f2e'); for (const [fx, fc] of [[0, '#f07ab0'], [4, '#f6d24a'], [8, '#ffffff'], [11, '#e0402a']]) { R(wx + fx, top + 34, 2, 2, fc); R(wx + fx, top + 36, 1, 1, '#4a7a2a'); }   // jardinière fleurie
    }
    // auvent en planches sur poteaux, au-dessus du trottoir
    const ay = uy + 10;
    R(ux - 4, ay, uw + 8, 6, OUT); R(ux - 3, ay + 1, uw + 6, 4, shade(trim2, 0.95));
    for (let k = 0; k < uw + 6; k += 4) R(ux - 3 + k, ay + 1, 1, 4, shade(trim2, 0.7));
    R(ux - 3, ay + 1, uw + 6, 1, shade(trim2, 1.25));
    for (const px of [ux - 2, ux + uw - 1]) { R(px, ay + 6, 3, 40 - 6, OUT); R(px + 1, ay + 6, 1, 34, '#8a5a32'); R(px + 3, ay + 8, 2, 32, 'rgba(30,15,5,.25)'); }
    R(ux - 3, ay + 6, uw + 6, 3, 'rgba(30,15,5,.28)');   // ombre de l'auvent sur la façade
    // rez-de-chaussée : vitrines et porte
    const dx = ux + uw / 2 - 8;
    if (opt.door) opt.door(dx, uy); else { R(dx - 1, uy + 19, 18, 28, OUT); R(dx, uy + 20, 16, 26, '#5b3a22'); R(dx + 2, uy + 22, 5, 10, '#7a4f2e'); R(dx + 9, uy + 22, 5, 10, '#7a4f2e'); R(dx + 12, uy + 33, 2, 2, '#e8c26a'); }
    const win = (wx, ww) => { R(wx - 1, uy + 20, ww + 2, 15, OUT); R(wx, uy + 21, ww, 13, '#ffd98a'); R(wx, uy + 21, ww, 4, '#fff0c0'); R(wx + (ww >> 1), uy + 21, 1, 13, OUT); R(wx, uy + 27, ww, 1, OUT); R(wx + 1, uy + 22, 2, 2, '#ffffff');   // vitrine à croisillons, reflet
      R(wx - 2, uy + 34, ww + 4, 2, wallD); R(wx - 2, uy + 36, ww + 4, 1, 'rgba(30,15,5,.35)'); };
    if (uw - 16 > 34) { win(ux + 4, 13); win(ux + uw - 17, 13); } else win(ux + 3, 9);
    deco(ux, uy, uw, top);
  }
  const shop = (x0, y0, w, roofA, roofB, sign, deco) => western(x0, y0, w, roofA, roofB, sign, deco);
  // charpentier (x4-7, y11-13) : planches empilées, scie, rondins
  shop(TOWN_B.J.x, TOWN_B.J.y, 4, '#7a3a22', '#94482a', 'CHARPENTIER', (ux, uy, uw) => {
    for (let k = 0; k < 3; k++) { R(ux - 2, uy + 36 - k * 3, 18, 3, ['#c99560', '#b07a48', '#d9a870'][k]); R(ux - 2, uy + 36 - k * 3, 18, 1, '#e8c08a'); }
    for (const [x, y] of [[uw - 6, 38], [uw - 1, 38], [uw - 4, 34]]) { disc(g, ux + x, uy + y, 3, '#7a4f2e'); disc(g, ux + x, uy + y, 2, '#c99560'); R(ux + x, uy + y, 1, 1, '#7a4f2e'); }
    R(ux + 20, uy + 22, 10, 3, '#c2c7cc'); for (let k = 0; k < 10; k += 2) R(ux + 20 + k, uy + 25, 1, 1, '#8a8f96'); R(ux + 30, uy + 21, 4, 5, '#7a4f2e');
  });
  // 20/11 : la forge d'Igor (enclume, braises)
  shop(TOWN_B.G.x, TOWN_B.G.y, 4, '#3a3a40', '#5a5a62', 'FORGE', (ux, uy, uw) => {
    R(ux + 2, uy + 32, 14, 4, '#3a3a40'); R(ux + 5, uy + 28, 8, 4, '#5a5a62'); R(ux + 1, uy + 28, 4, 2, '#5a5a62');   // enclume
    R(ux + uw - 16, uy + 30, 12, 8, '#4a3020'); R(ux + uw - 14, uy + 31, 8, 3, '#f2803a'); R(ux + uw - 12, uy + 31, 3, 2, '#ffd86a');   // braises
  });
  // marchand d'animaux (x17-19, y11-13) : botte de foin, abreuvoir, fer à cheval
  shop(TOWN_B.A.x, TOWN_B.A.y, 3, '#2f5a3a', '#3b7048', 'ANIMAUX', (ux, uy, uw) => {
    R(ux - 3, uy + 32, 14, 10, '#e6c34a'); R(ux - 3, uy + 32, 14, 2, '#f5dd7a'); for (let k = 0; k < 14; k += 3) R(ux - 3 + k, uy + 35, 1, 6, '#c9a330');
    R(ux + uw - 12, uy + 36, 14, 6, '#7a4f2e'); R(ux + uw - 11, uy + 37, 12, 3, '#5a9ad0');
    R(ux + uw / 2 - 3, uy + 10, 6, 1, '#9aa0a8'); R(ux + uw / 2 - 3, uy + 10, 1, 4, '#9aa0a8'); R(ux + uw / 2 + 2, uy + 10, 1, 4, '#9aa0a8');
  });

  // boulangerie (x4-7, y16-18) : pains en vitrine, auvent crème
  shop(TOWN_B.O.x, TOWN_B.O.y, 4, '#c98a4a', '#e0a560', 'BOULANGERIE', (ux, uy, uw) => {
    R(ux + 4, uy + 22, 14, 6, '#8a5a32'); for (let k = 0; k < 3; k++) { disc(g, ux + 7 + k * 4, uy + 22, 2, '#d9a050'); R(ux + 6 + k * 4, uy + 21, 3, 1, '#f2c88a'); }
    R(ux + uw - 14, uy + 34, 10, 8, '#7a4f2e'); R(ux + uw - 13, uy + 32, 8, 3, '#e8c08a'); R(ux + uw - 12, uy + 31, 6, 1, '#f5dcae');
  });
  // boucherie (x10-13, y16-18) : auvent rayé rouge, jambons suspendus
  shop(TOWN_B.V.x, TOWN_B.V.y, 4, '#a83a32', '#f0e6d0', 'BOUCHERIE', (ux, uy, uw) => {
    for (const k of [6, 12]) { R(ux + k + 2, uy + 20, 1, 3, '#5b3a22'); disc(g, ux + k + 2, uy + 26, 3, '#c25a4a'); R(ux + k + 1, uy + 27, 3, 2, '#f0e6d0'); }
    R(ux + uw - 14, uy + 34, 12, 8, '#8a8f96'); R(ux + uw - 13, uy + 34, 10, 2, '#c2c7cc');
  });
  // poissonnerie (x17-20, y16-18) : auvent bleu, étal de glace et poissons
  shop(TOWN_B.Z.x, TOWN_B.Z.y, 4, '#2f5a8a', '#4a7cb0', 'POISSONNERIE', (ux, uy, uw) => {
    R(ux - 2, uy + 32, 20, 10, '#7a4f2e'); R(ux - 1, uy + 32, 18, 4, '#dff2fb');
    for (let k = 0; k < 3; k++) { R(ux + 1 + k * 6, uy + 33, 4, 2, ['#8aa8c0', '#e08a6a', '#a8b8c8'][k]); R(ux + 5 + k * 6, uy + 33, 1, 2, '#5a6a7a'); }
    R(ux + uw - 10, uy + 36, 8, 6, '#3a5a7a'); R(ux + uw - 9, uy + 37, 6, 2, '#6aa0c8');
  });

  // saloon d'Ed (x9-12, y13-15) : grande fausse façade, balcon, portes battantes, tonneau et chope
  western(TOWN_B.R.x, TOWN_B.R.y, 4, '#7a2a3a', '#a8453a', 'SALOON', (ux, uy, uw, top) => {
    // balcon de l'étage avec garde-corps
    R(ux - 3, top + 38, uw + 6, 3, OUT); R(ux - 2, top + 38, uw + 4, 2, '#8a5a32');
    for (let k = 0; k < uw + 4; k += 4) R(ux - 2 + k, top + 30, 1, 8, '#5b3a22');
    R(ux - 2, top + 29, uw + 4, 2, '#7a4f2e');
    for (const wx of [ux + 6, ux + uw - 18]) { R(wx - 1, top + 24, 14, 14, OUT); R(wx, top + 25, 12, 13, '#ffcf7a'); R(wx + 2, top + 25, 3, 13, '#c84a4a'); R(wx + 7, top + 25, 3, 13, '#c84a4a'); }   // rideaux rouges
    R(ux - 3, uy + 32, 10, 11, '#7a4f2e'); R(ux - 3, uy + 34, 10, 1, '#3a2a20'); R(ux - 3, uy + 39, 10, 1, '#3a2a20'); R(ux - 1, uy + 30, 6, 2, '#5b3a22');   // tonneau
    R(ux + uw - 9, uy + 38, 6, 6, '#e8c26a'); R(ux + uw - 9, uy + 37, 6, 2, '#fff6e0'); R(ux + uw - 4, uy + 39, 2, 3, '#e8c26a');   // chope
  }, { tall: 6, balcony: true, door: (dx, uy) => {
    R(dx - 1, uy + 19, 18, 28, OUT); R(dx, uy + 20, 16, 26, '#2a1810');   // intérieur sombre
    R(dx + 1, uy + 25, 6, 12, '#a8774a'); R(dx + 9, uy + 25, 6, 12, '#a8774a');   // portes battantes (avec un jour au milieu)
    for (const k of [1, 9]) { R(dx + k, uy + 25, 6, 1, '#d9a870'); R(dx + k + 1, uy + 28, 4, 1, '#7a4f2e'); R(dx + k + 1, uy + 31, 4, 1, '#7a4f2e'); R(dx + k, uy + 36, 6, 1, '#5b3a22'); }
  } });
  // restaurant (x13-17, y26-28) : façade crème, auvent rayé rouge et blanc, menu sur ardoise, tonneau de fleurs
  shop(TOWN_B.Y.x, TOWN_B.Y.y, 5, '#a8432f', '#c85a3a', 'RESTAURANT', (ux, uy, uw) => {
    for (let k = 0; k < uw; k += 8) R(ux + k, uy + 4, 4, 5, '#f4ead2');   // auvent rayé
    R(ux + uw + 2, uy + 30, 10, 13, '#3a3a3a'); R(ux + uw + 3, uy + 31, 8, 11, '#2a2a2a'); for (let k = 0; k < 3; k++) R(ux + uw + 4, uy + 33 + k * 3, 6, 1, '#f4ead2');   // ardoise du menu
    R(ux - 12, uy + 34, 10, 9, '#7a4f2e'); R(ux - 11, uy + 31, 3, 3, '#e05a9a'); R(ux - 7, uy + 30, 3, 3, '#f2c832');   // fleurs
  });
  // bureau du shérif (x3-6, y26-28) : étoile, fenêtre à barreaux, avis de recherche
  western(TOWN_B.E.x, TOWN_B.E.y, 4, '#5a4a3a', '#7a6a52', 'SHÉRIF', (ux, uy, uw, top) => {
    const sx = ux + uw / 2, sy = top + 33;   // étoile dorée
    R(sx - 1, sy - 5, 2, 10, '#f2c832'); R(sx - 5, sy - 1, 10, 2, '#f2c832'); R(sx - 3, sy - 3, 6, 6, '#f2c832'); R(sx - 1, sy - 1, 2, 2, '#b08a20');
    for (let k = 1; k < 9; k += 3) R(ux + 4 + k, uy + 21, 1, 13, '#2a2a2a');   // barreaux
    R(ux + uw - 15, uy + 21, 10, 12, '#efe2c0'); R(ux + uw - 13, uy + 23, 6, 5, '#8a6a4a'); R(ux + uw - 14, uy + 30, 8, 1, '#8a3a2a');   // avis de recherche
    R(ux - 6, uy + 38, 4, 6, '#5b3a22'); R(ux - 7, uy + 37, 6, 1, '#3f2615');   // poteau d'attache
  }, { wall: '#8a6a4a' });
  // fontaine (x11-13, y8-10)
  const fx = TOWN_B.F.x * T + 24, fy = TOWN_B.F.y * T + 24;
  if (!decor('fontaine')) { const im = fountainSprite(23); if (im) g.drawImage(im, Math.round(fx - im.width / 2), Math.round(fy + 23 * .62 + 6 - im.height)); }   // 18/11 (soir) : fontaine « pixel moderne »

  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const ch = L[y][x], px = x * T, py = y * T;
    if (ch === 'b') { R(px + 1, py + 6, 14, 3, '#a8774a'); R(px + 1, py + 6, 14, 1, '#c99560'); R(px + 1, py + 2, 14, 2, '#8a5a32'); R(px + 2, py + 9, 2, 5, '#3f2615'); R(px + 12, py + 9, 2, 5, '#3f2615'); }
    if (ch === 'f') { R(px + 1, py + 8, 14, 7, '#8a5a32'); R(px + 1, py + 8, 14, 2, '#a8774a'); for (let k = 0; k < 5; k++) { R(px + 2 + k * 3, py + 5, 2, 3, '#3e8a34'); R(px + 2 + k * 3, py + 4, 2, 2, ['#f07ab0', '#f5e050', '#ffffff', '#9ab8ff'][k % 4]); } }
    if (ch === 'L') { const lc = document.createElement('canvas'); lc.width = 16; lc.height = 33; const lg = lc.getContext('2d'), r2 = (a, b, w, h, k) => { lg.fillStyle = k; lg.fillRect(a, b, w, h); };   // 19/11 : lampadaire retenu (le héros passe derrière)
      r2(7, 7, 2, 25, '#2b2730'); r2(5, 30, 6, 2, '#2b2730'); r2(4, 1, 8, 7, '#2b2730'); r2(5, 2, 6, 5, '#ffd98a'); r2(3, 0, 10, 2, '#3a3540'); blit(g, lc, px, py - 17); }
  }
  canopy(g, W, H, (x, y) => (L[y] || '')[x] === 'T' && [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => (L[y + b] || '')[x + a] === 'T').length >= 2, season);   // lot 11b : canopée continue
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (L[y][x] === 'T') g.drawImage(treeSprite(season, (x + y) % 4), x * T - 9, y * T - 28);
  // (villa du Maire effacée le 17/11 : Manu vit dans son ranch)
  drawHedges(R, LAYOUTS.town);   // haies de bordure
  // lot 11f : décor dense (tonneaux, caisses, fleurs, cailloux)
  dress(g, W, H, (x, y) => 'gT'.includes((L[y] || '')[x] || '-') && (L[y] || '')[x] !== 'T', (x, y) => 'MUJAOVZRYE'.includes((L[y] || '')[x] || '-'), 3);
  return c;
}

// Quartier résidentiel (au sud de la ferme) : herbe, rue pavée, maisons de Luna et de Franck, arbres, bancs.
export function buildQuartier(season) {
  const L = LAYOUTS.quartier, H = L.length, W = L[0].length;
  const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
  const g = c.getContext('2d'), r = rng(57 + season);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const B = GRASS[season];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const px = x * T, py = y * T, ch = L[y][x];
    if (ch === '.' || ch === 'D') {   // Farmwest (7a) : allées de sable tassé, bords adoucis
      paintRoad(R, r, px, py, x, y, (y === 8 || y === 9 || y === 17 || y === 18) ? 1 : 0);
      continue;
    }
    if (false) {
      R(px, py, T, T, '#a9a29a');
      for (let k = 0; k < 4; k++) { const sx = px + (k % 2) * 8 + ((y % 2) * 4), sy = py + (k >> 1) * 8; R(sx + 1, sy + 1, 6, 6, ['#bcb5ac', '#b3aca2', '#c6c0b7'][r() * 3 | 0]); R(sx + 1, sy + 6, 6, 1, '#8f887f'); }
      continue;
    }
    paintGrass(R, r, px, py, x, y, B, season);
    if (r() < .02) { const col = ['#ffffff', '#f5e050', '#f07ab0'][r() * 3 | 0]; R(px + 7, py + 7, 3, 1, col); R(px + 8, py + 6, 1, 3, col); }
  }
  softPatches(g, W, H, (x, y) => 'gTk'.includes((L[y] || '')[x] || '-') ? 'herbe' : null, { herbe: B });
  // lot 11a : herbe ↔ allées, coins arrondis
  autotile(g, W, H, (x, y) => { const ch = (L[y] || '')[x]; return ch == null ? null : ch === '.' || ch === 'D' ? 'allee' : 'gTk'.includes(ch) ? 'herbe' : null; }, { allee: 1, herbe: 2 }, { herbe: shade(B, .97) });
  // haies et boîtes aux lettres devant chaque maison, bordure de trottoir
  // (bordures de trottoir gris retirées : allées de sable au lot 7a)
  const shift = (dx, dy) => (x, y, w, h, col) => R(x + dx, y + dy, w, h, col);
  const Q = QUARTIER;
  // (Luna, Franck et Myst : maisons western dessinées plus bas, comme les autres)
  // lot 8 : boîtes aux lettres (sans texte) à la place des pancartes ; le nom se lit en l'examinant
  for (const id of MAILBOX_IDS) {
    const h = Q[id], px = (h.door + 1) * T, py = (h.y + (h.porch ? 4 : 3)) * T;
    R(px + 4, py + 14, 9, 2, 'rgba(30,20,10,.3)'); R(px + 7, py + 7, 2, 8, '#5b3a22'); R(px + 7, py + 7, 1, 8, '#7a4f2e');   // poteau
    R(px + 3, py + 1, 10, 7, '#3a4a5a'); R(px + 3, py + 1, 10, 2, '#5a6e82'); R(px + 3, py + 7, 10, 1, '#26323e'); R(px + 4, py + 3, 1, 4, '#26323e');   // boîte en fer, porte
    R(px + 12, py - 2, 1, 6, '#3a2a20'); R(px + 13, py - 2, 3, 2, '#c0392b');   // petit drapeau rouge
  }
  // terrains libres pour de futurs habitants (piquets + panneau)
  // Maisons western (17/11) : bardage en planches à clin patinées, poteaux d'angle, volets, véranda couverte sur poteaux,
  // plancher et marches, porte en planches avec fer à cheval, rocking-chair, tonneau, lanterne ; fausse façade pour certaines.
  function westernHome(id, o) {
    const h = Q[id], x0 = h.x * T, y0 = h.y * T, w = h.w * T, rows = h.porch ? 4 : 3, bot = y0 + rows * T - (h.porch ? T : 0), top = o.storeys === 2 ? y0 - 2 * T : y0 - 4;
    const W = o.wall, Wd = shade(W, .8), Wl = shade(W, 1.12), TR = o.trim, TRd = shade(TR, .72);
    R(x0 - 2, bot + 4, w + 6, 4, 'rgba(30,15,5,.3)'); R(x0 + w, top + 6, 4, bot - top, 'rgba(30,15,5,.2)');   // ombres portées
    { const dX0 = h.door * T, wins0 = [7, w - 19].filter(wx => Math.abs(x0 + wx + 6 - (dX0 + 8)) > 14).map(wx => [wx, y0 + 6 - top]);
      if (o.storeys === 2) for (const wx of [7, w / 2 - 6, w - 19]) wins0.push([wx, 8]);
      const posts = [-2, w / 2 - 1, w - 1].filter(px => Math.abs(x0 + px - (dX0 + 8)) > 9);
      const F = houseSprite({ w, h: bot - top, wall: W, trim: TR, roof: o.roof || TR, falseFront: !!o.falseFront, chimney: o.chimney ? w - 16 : null, storeyY: o.storeys === 2 ? y0 - 2 - top : null,
        windows: wins0, lit: !!o.lit, porch: true, posts, door: { x: dX0 + 2 - x0, w: 12, h: 22 }, doorCol: o.door || '#7a4f2e' });   // 18/11 (soir) : maison « pixel moderne » (src/render/props.js)
      if (F) { blit(g, F.im, x0 + F.ox, top + F.oy);
        if (o.flowers) for (const [wx, wy] of wins0) for (let k = 0; k < 12; k += 3) R(x0 + wx + k, top + wy + 9, 2, 2, ['#f07ab0', '#f6d24a', '#ffffff', '#e0402a'][k / 3 | 0]);
        for (let k = 0; k < 2; k++) R(dX0 + 2 - k * 2, bot + 1 + k * 2, 12 + k * 4, 2, k ? '#7a5232' : '#a8774a');   // marches
        R(dX0 + 11, bot - 14, 2, 2, '#e8c26a'); R(dX0 + 6, bot - 30, 4, 1, '#9aa0a8'); R(dX0 + 5, bot - 29, 1, 2, '#9aa0a8'); R(dX0 + 10, bot - 29, 1, 2, '#9aa0a8');   // poignée, fer à cheval
      } else {
    // bardage à clin
    R(x0, top, w, bot - top, W);
    for (let y = top + 3, k = 0; y < bot; y += 4, k++) { R(x0, y, w, 1, Wd); R(x0, y - 3, w, 1, Wl); for (let x = x0 + ((k * 13) % 17) + 6; x < x0 + w - 4; x += 19 + (k % 3) * 5) { R(x, y - 3, 1, 3, Wd); if ((x + k) % 3 === 0) R(x + 2, y - 2, 6, 2, shade(W, o.weathered ? .9 : 1.06)); } if (k % 2) R(x0 + 3 + (k * 7) % (w - 8), y - 2, 1, 1, '#3a2a20'); }
    R(x0, top, 3, bot - top, TR); R(x0 + w - 3, top, 3, bot - top, TRd); R(x0, top, 1, bot - top, shade(TR, 1.2));   // poteaux d'angle
    if (o.storeys === 2) { R(x0, y0 - 2, w, 3, TR); R(x0, y0 + 1, w, 1, TRd); }   // bandeau d'étage
    // toit (ou fausse façade western)
    if (o.falseFront) {
      const ft = top - 14; R(x0 - 1, ft, w + 2, 16, TRd); R(x0, ft + 1, w, 14, W); for (let k = ft + 4; k < top; k += 4) R(x0, k, w, 1, Wd);
      R(x0 - 2, ft - 2, w + 4, 3, TR); R(x0 - 2, ft - 2, w + 4, 1, shade(TR, 1.25)); R(x0 + w / 2 - 10, ft - 6, 20, 5, TR); R(x0 + w / 2 - 9, ft - 5, 18, 3, shade(TR, 1.15));   // corniche à gradin
    } else roofFor(R, x0, top - 22, w, 22, o.roof);
    if (o.chimney) { R(x0 + w - 16, top - 26, 7, 16, '#8a8078'); for (let k = 0; k < 16; k += 3) R(x0 + w - 16, top - 26 + k, 7, 1, '#6a625a'); R(x0 + w - 17, top - 27, 9, 2, '#5a524a'); }
    // fenêtres à volets
    const win = (wx, wy) => { R(wx - 4, wy - 1, 3, 13, TR); R(wx + 13, wy - 1, 3, 13, TR); for (let k = 0; k < 12; k += 3) { R(wx - 4, wy - 1 + k, 3, 1, TRd); R(wx + 13, wy - 1 + k, 3, 1, TRd); }
      R(wx - 1, wy - 1, 14, 13, TRd); R(wx, wy, 12, 11, o.lit ? '#ffd98a' : '#9cc4d8'); R(wx, wy, 12, 3, o.lit ? '#fff0c0' : '#c4e0ec'); R(wx + 5, wy, 2, 11, TRd); R(wx, wy + 5, 12, 1, TRd); R(wx + 1, wy + 1, 2, 4, '#e8d4ac'); R(wx + 9, wy + 1, 2, 4, '#e8d4ac');
      R(wx - 2, wy + 11, 16, 2, TR); if (o.flowers) for (let k = 0; k < 12; k += 3) R(wx + k, wy + 9, 2, 2, ['#f07ab0', '#f6d24a', '#ffffff', '#e0402a'][k / 3 | 0]); };
    const dX = h.door * T, wins = [x0 + 7, x0 + w - 19].filter(wx => Math.abs(wx + 6 - (dX + 8)) > 14);
    for (const wx of wins) win(wx, y0 + 6);
    if (o.storeys === 2) for (const wx of [x0 + 7, x0 + w / 2 - 6, x0 + w - 19]) win(wx, top + 8);
    // véranda : auvent en planches sur poteaux, plancher, marches
    const ay = bot - 22;
    R(x0 - 3, ay, w + 6, 5, TRd); for (let k = 0; k < w + 6; k += 4) R(x0 - 3 + k, ay, 1, 5, shade(TR, .6)); R(x0 - 3, ay, w + 6, 1, shade(TR, 1.2)); R(x0 - 3, ay + 5, w + 6, 2, 'rgba(30,15,5,.3)');
    for (const px of [x0 - 2, x0 + w / 2 - 1, x0 + w - 1]) if (Math.abs(px - (dX + 8)) > 9) { R(px, ay + 5, 3, bot - ay - 3, TRd); R(px, ay + 5, 1, bot - ay - 3, shade(TR, 1.2)); }
    R(x0 - 3, bot - 3, w + 6, 4, '#a8774a'); for (let k = 0; k < w + 6; k += 5) R(x0 - 3 + k, bot - 3, 1, 4, '#7a5232'); R(x0 - 3, bot - 3, w + 6, 1, '#c99560');
    for (let k = 0; k < 2; k++) R(dX + 2 - k * 2, bot + 1 + k * 2, 12 + k * 4, 2, k ? '#7a5232' : '#a8774a');   // marches
    // porte en planches, fer à cheval
    R(dX + 1, bot - 26, 14, 23, TRd); R(dX + 2, bot - 25, 12, 22, o.door || '#7a4f2e'); for (let k = dX + 5; k < dX + 14; k += 4) R(k, bot - 25, 1, 22, shade(o.door || '#7a4f2e', .75)); R(dX + 11, bot - 14, 2, 2, '#e8c26a');
    R(dX + 6, bot - 30, 4, 1, '#9aa0a8'); R(dX + 5, bot - 29, 1, 2, '#9aa0a8'); R(dX + 10, bot - 29, 1, 2, '#9aa0a8');
      } }
    // décor de véranda
    const dX = h.door * T, ay = bot - 22;
    if (o.rocker !== false) { const rx = x0 + 4; R(rx, bot - 12, 8, 2, '#6a4426'); R(rx + 6, bot - 18, 2, 8, '#6a4426'); R(rx, bot - 10, 1, 7, '#5a3a22'); R(rx + 6, bot - 10, 1, 7, '#5a3a22'); R(rx - 1, bot - 4, 10, 1, '#5a3a22'); }
    if (o.barrel !== false) barrel(R, x0 + w - 13, bot - 14);
    R(dX - 4, ay + 7, 1, 3, '#3a2a20'); R(dX - 6, ay + 10, 5, 6, '#3a2a20'); R(dX - 5, ay + 11, 3, 4, '#ffd98a');   // lanterne
    if (o.sign) signBoard(R, x0 + w / 2, (o.falseFront ? top - 13 : top - 8), o.sign);
    if (o.extra) o.extra(x0, y0, w, top, bot);
  }
  westernHome('luna', { wall: '#b89a78', trim: '#6a4a7a', roof: '#7a5a9a', flowers: true, door: '#6a4a7a' });
  westernHome('franck', { wall: '#8a7a68', trim: '#5a4a3a', roof: '#5a5a5e', weathered: true, rocker: true, barrel: false });
  westernHome('myst', { wall: '#4a4450', trim: '#2a2630', roof: '#2e2a34', weathered: true, door: '#2a2028', barrel: false });
  westernHome('hailey', { wall: '#d8b8b0', trim: '#4a8a84', roof: '#5aa8a0', flowers: true, rocker: false });
  westernHome('remy', { wall: '#a8b8c4', trim: '#8a3a2a', roof: '#a8432f', chimney: true, falseFront: true, lit: true, extra: (x0, y0, w, top, bot) => { R(x0 + 18, bot - 10, 10, 6, '#7a4f2e'); R(x0 + 19, bot - 13, 2, 3, '#5aa040'); R(x0 + 23, bot - 14, 2, 4, '#5aa040'); R(x0 + 26, bot - 12, 2, 2, '#e0402a'); } });
  westernHome('ed', { wall: '#a8784a', trim: '#5a3a22', roof: '#5e6470', storeys: 2, chimney: true, door: '#6a4a7a', extra: (x0, y0, w, top, bot) => { R(x0 + 2 * T + 2, bot + 2, 4, 6, '#e05a9a'); } });   // vélo de Jade
  westernHome('clinique', { wall: '#f0ece2', trim: '#3a8a74', roof: '#5aa8a0', sign: 'CLINIQUE', rocker: false, barrel: false, falseFront: true, extra: (x0, y0, w) => { R(x0 + w - 17, y0 - 2, 12, 12, '#ffffff'); R(x0 + w - 13, y0, 4, 8, '#3fbf6a'); R(x0 + w - 15, y0 + 2, 8, 4, '#3fbf6a'); } });
  for (const x0 of []) { R(x0, 4 * T, 4 * T, 3 * T, 'rgba(120,84,48,.18)'); for (const px of [x0, x0 + 4 * T - 2]) R(px, 4 * T, 2, 8, '#8a5a32'); R(x0 + 2 * T - 1, 5 * T, 2, 12, '#5b3a22'); R(x0 + 2 * T - 9, 5 * T - 6, 18, 9, '#3f2615'); R(x0 + 2 * T - 8, 5 * T - 5, 16, 7, '#e8c26a'); }
  // bancs et lampadaires le long de la rue
  for (const [x, yb] of [[3 * T, 10], [33 * T, 10], [20 * T, 19], [28 * T, 19]]) { const by = yb * T; R(x, by + 6, 22, 3, '#8a5a32'); R(x, by + 6, 22, 1, '#c99560'); R(x + 1, by + 9, 2, 3, '#5b3a22'); R(x + 19, by + 9, 2, 3, '#5b3a22'); } for (const x of []) { R(x, 10 * T + 6, 22, 3, '#8a5a32'); R(x, 10 * T + 6, 22, 1, '#c99560'); R(x + 1, 10 * T + 9, 2, 3, '#5b3a22'); R(x + 19, 10 * T + 9, 2, 3, '#5b3a22'); }
  drawHedges(R, L);
  canopy(g, W, H, (x, y) => (L[y] || '')[x] === 'T' && [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => (L[y + b] || '')[x + a] === 'T').length >= 2, season);   // lot 11b : canopée continue
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (L[y][x] === 'T') g.drawImage(treeSprite(season, (x + y) % 4), x * T - 9, y * T - 28);
  return c;
}

// Montagne gelée et plage : sol par tuile (neige, sable, mer, lac gelé, sentier), sapins enneigés ou palmiers, grotte.
export function buildBiome(name, season) {
  const L = LAYOUTS[name], H = L.length, W = L[0].length;
  const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
  const g = c.getContext('2d'), r = rng(name === 'plage' ? 91 : 73);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const pal = { n: ['#eef3f8', '#e2eaf2', '#f8fbff'], s: ['#ecd9a4', '#e4cf94', '#f2e2b4'], a: ['#d2bc84', '#c8b078', '#dac690'], '.': ['#b08a5a', '#9c7848', '#bc966a'], T: null, D: null };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const ch = L[y][x], px = x * T, py = y * T;
    if (ch === 'w') {
      const lac = name === 'montagne';
      R(px, py, T, T, lac ? '#a8d4ec' : (y > H - 4 ? '#2f7ab8' : '#3f92cc'));
      for (let k = 0; k < 3; k++) R(px + (r() * 12 | 0), py + (r() * 14 | 0), 4, 1, lac ? '#d8eef8' : '#7cc0ec');
      if (lac && r() < .12) { R(px + 5, py + 5, 6, 5, '#2f6a9a'); R(px + 6, py + 6, 4, 3, '#4a8ac0'); }   // trou dans la glace
      continue;
    }
    if (ch === 'G') { R(px, py, T, T, '#5a5560'); R(px + (r() * 10 | 0), py + (r() * 10 | 0), 5, 4, '#6e6a76'); R(px, py, T, 2, '#f4f8fc'); continue; }
    const base = name === 'plage' ? (ch === '.' ? pal['.'] : ch === 'a' ? pal.a : pal.s) : (ch === '.' ? ['#c8d2dc', '#bcc6d2', '#d4dce4'] : pal.n);
    for (let by = 0; by < T; by += 4) for (let bx = 0; bx < T; bx += 4) R(px + bx, py + by, 4, 4, base[r() * 3 | 0]);
    if (name === 'plage' && ch === '.') { for (let k = 0; k < T; k += 4) R(px, py + k, T, 1, '#7a5a34'); }
    if (name === 'plage' && ch === 's' && r() < .05) { R(px + 6, py + 7, 3, 2, '#f4b0b8'); R(px + 7, py + 6, 1, 1, '#fff'); }   // coquillage
    if (name === 'montagne' && ch === 'n' && r() < .04) { R(px + 5, py + 8, 4, 3, '#9aa4b0'); R(px + 5, py + 8, 4, 1, '#ffffff'); }
  }
  if (name === 'plage') { const sea = L.findIndex(row => row.includes('w')); for (let x = 0; x < W * T; x += 3) R(x, sea * T - 1 + Math.round(Math.sin(x / 9) * 2), 3, 3, '#ffffff'); }   // écume (la mer est au sud)
  if (name === 'plage') { // lot 12 : la cabane de Rouky, le vieux pêcheur (planches délavées, toit de tôle, filets, tonneau)
    const C = ROUKY_CABIN, x0 = C.x * T, y0 = C.y * T, w = C.w * T, h = C.h * T, dx = (C.door - C.x) * T;
    R(x0 + 2, y0 + h - 2, w, 4, 'rgba(60,40,20,.25)');                                         // ombre au sol
    R(x0, y0 + 14, w, h - 14, '#8a6a4a'); for (let k = 0; k < w; k += 5) R(x0 + k, y0 + 14, 1, h - 14, '#6a4e34');   // planches
    for (let k = y0 + 18; k < y0 + h; k += 7) R(x0, k, w, 1, '#a08060');
    R(x0 - 4, y0 + 2, w + 8, 14, '#7a8a94'); for (let k = 0; k < w + 8; k += 4) R(x0 - 4 + k, y0 + 2, 1, 14, '#5e6c76');   // toit de tôle ondulée
    R(x0 - 4, y0 + 14, w + 8, 2, '#4a565e'); R(x0 - 4, y0 + 2, w + 8, 1, '#a8b6be');
    R(x0 + dx + 3, y0 + h - 22, 10, 22, '#4a3020'); R(x0 + dx + 4, y0 + h - 21, 8, 20, '#6a4428'); R(x0 + dx + 10, y0 + h - 11, 1, 2, '#e8c050');   // porte
    R(x0 + 8, y0 + 22, 12, 9, '#3a2a20'); R(x0 + 9, y0 + 23, 10, 7, '#a8d4ec'); R(x0 + 13, y0 + 23, 1, 7, '#3a2a20');   // fenêtre
    for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) R(x0 + w - 24 + k * 5, y0 + 20 + j * 5, 4, 1, '#d8c8a0');   // filet suspendu
    for (let k = 0; k < 4; k++) R(x0 + w - 24 + k * 5, y0 + 20, 1, 12, '#d8c8a0');
    R(x0 + w + 2, y0 + h - 12, 9, 12, '#7a4a26'); R(x0 + w + 2, y0 + h - 9, 9, 1, '#4a3020'); R(x0 + w + 2, y0 + h - 4, 9, 1, '#4a3020');   // tonneau
    R(x0 - 6, y0 + 10, 1, h - 6, '#5a3a22'); R(x0 - 9, y0 + 10, 1, h - 6, '#5a3a22');   // cannes appuyées
    R(x0 + w + 16, y0 + h - 2, 14, 6, '#7a5a34'); R(x0 + w + 16, y0 + h - 2, 14, 1, '#a08060');   // banc de Rouky
  }
  if (name === 'montagne') { // entrée de la grotte, fermée par des éboulis
    const gx = 28 * T, gy = 3 * T;
    R(gx - 6, gy - 8, 2 * T + 12, T + 12, '#3a3640'); R(gx - 2, gy - 4, 2 * T + 4, T + 8, '#0c0a10');
    for (const [a, b, w] of [[0, 10, 8], [10, 12, 9], [20, 9, 10], [5, 16, 7], [16, 17, 8]]) { R(gx + a - 2, gy + b, w, 6, '#7a7480'); R(gx + a - 2, gy + b, w, 1, '#a8a2ae'); }
    for (let k = 0; k < 8; k++) R(gx - 4 + k * 5, gy - 8, 3, 3 + (k % 3) * 2, '#d8eef8');   // stalactites de glace
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (L[y][x] === 'T') {
    const px = x * T, py = y * T;
    if (name === 'plage') { // palmier
      R(px + 7, py - 14, 3, 28, '#8a5a32'); for (let k = 0; k < 28; k += 4) R(px + 7, py - 14 + k, 3, 1, '#6a4426');
      for (const [dx, dy, w] of [[-8, -18, 10], [7, -18, 10], [-6, -22, 9], [5, -22, 9], [0, -24, 4]]) R(px + 5 + dx, py + dy, w, 3, '#3f8a34');
      R(px + 6, py - 16, 2, 2, '#6a4426'); R(px + 9, py - 15, 2, 2, '#6a4426');
    } else { // sapin enneigé
      R(px + 6, py + 8, 4, 8, '#5a3a22');
      for (let i = 0; i < 4; i++) { const w = 6 + i * 4; R(px + 8 - w / 2, py - 16 + i * 6, w, 6, '#2c5f4a'); R(px + 8 - w / 2, py - 16 + i * 6, w, 2, '#f4f8fc'); }
    }
  }
  return c;
}

// Parc d'attractions : pelouse, allées, guirlandes ; chaque attraction dessinée (la grande roue et le carrousel bougent : renderer).
export function buildParc(season) {
  const L = LAYOUTS.parc, H = L.length, W = L[0].length;
  const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
  const g = c.getContext('2d'), r = rng(303 + season);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const B = GRASS[season];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const px = x * T, py = y * T, ch = L[y][x];
    if (ch === '.' || ch === 'D') { R(px, py, T, T, (x + y) % 2 ? '#d8c8b0' : '#e4d6c0'); R(px, py, T, 1, '#c4b498'); continue; }
    for (let by = 0; by < T; by += 4) for (let bx = 0; bx < T; bx += 4) R(px + bx, py + by, 4, 4, [B, B, shade(B, .93), shade(B, 1.06)][r() * 4 | 0]);
  }
  const P = PARC_B, box = k => { const b = P[k]; return [b.x * T, b.y * T, b.w * T, b.h * T]; };
  { const [x, y, w, h] = box('R'); R(x + w / 2 - 14, y + h - 10, 28, 10, '#6a4a3a'); R(x + 6, y + h - 4, w - 12, 4, '#4a3a30'); }   // socle de la roue
  { const [x, y, w, h] = box('I'); R(x, y + h - 10, w, 10, '#a8302b'); for (let k = 0; k < w; k += 8) R(x + k, y + h - 10, 4, 10, '#f4ead2'); }   // plateau du carrousel
  { const [x, y, w, h] = box('x');   // montagnes russes : rails en bosses sur poteaux
    for (let k = 0; k <= w; k += 6) { const top = y + 14 + Math.round(Math.sin(k / 18) * 18 + Math.cos(k / 7) * 4); R(x + k, top + 4, 2, y + h - top - 4, '#8a5a32'); R(x + k - 3, top, 8, 3, '#c4342a'); R(x + k - 3, top + 3, 8, 1, '#3a2a28'); }
    R(x + 18, y + 2, 14, 8, '#3a8ae0'); R(x + 20, y + 4, 4, 3, '#ffe28a'); R(x + 26, y + 4, 4, 3, '#ffe28a'); }   // wagon
  { const [x, y, w, h] = box('y'); R(x, y, w, h, '#5a5560'); R(x + 2, y + 2, w - 4, h - 4, '#7a7480'); R(x, y, w, 4, '#f2c832');   // piste
    for (const [a, b, col] of [[10, 14, '#e8402a'], [40, 30, '#3a8ae0'], [70, 18, '#4ab04a']]) { R(x + a, y + b, 16, 10, col); R(x + a + 4, y + b + 2, 8, 4, '#bfe3f5'); R(x + a + 7, y + b - 10, 1, 10, '#2a2a30'); } }
  const booth = (k, roof, sign) => { const [x, y, w, h] = box(k); R(x, y + 8, w, h - 8, '#9a6a3c'); for (let i = 0; i < w; i += 8) R(x + i, y, 4, 9, roof), R(x + i + 4, y, 4, 9, '#f4ead2'); R(x + 4, y + 14, w - 8, 8, '#4a2a18'); signBoard(R, x + w / 2, y - 10, sign); };
  booth('z', '#e8402a', 'CHAMBOULE'); booth('q', '#3a8ae0', 'TIR');
  { const [x, y] = box('z'); for (const [a, b] of [[14, 15], [20, 15], [26, 15], [17, 11], [23, 11], [20, 7]]) R(x + a, y + b, 5, 4, ['#f2c832', '#4ab04a', '#e8402a'][(a + b) % 3]); }
  { const [x, y] = box('q'); for (let k = 0; k < 4; k++) { R(x + 6 + k * 9, y + 16, 6, 4, '#f2c832'); R(x + 10 + k * 9, y + 15, 2, 2, '#e8802a'); } }
  { const [x, y, w, h] = box('j');   // maison hantée
    R(x + 2, y + 14, w - 4, h - 14, '#4a4250'); for (let i = 0; i < 6; i++) R(x + 2 + i * 2, y + 14 - i * 3, w - 4 - i * 4, 3, '#2a2430');
    R(x + 10, y + 26, 10, 10, '#d8c070'); R(x + w - 20, y + 26, 10, 10, '#1a1420'); R(x + w / 2 - 6, y + h - 18, 12, 18, '#140e18');
    R(x + 14, y + 29, 2, 2, '#1a1420'); R(x + 18, y + 29, 2, 2, '#1a1420'); signBoard(R, x + w / 2, y - 6, 'FRISSONS'); }
  { const [x, y, w, h] = box('u'); R(x, y + 10, w, h - 10, '#f4b0c8'); for (let i = 0; i < w; i += 6) R(x + i, y + 4, 3, 7, '#f07ab0'), R(x + i + 3, y + 4, 3, 7, '#fff'); R(x + 6, y - 2, 8, 6, '#ffd0e8'); R(x + 9, y + 4, 1, 6, '#c9a330'); }
  for (let k = 0; k < W * T; k += 12) { R(k, 8 * T + 2 + Math.round(Math.sin(k / 30) * 3), 2, 2, ['#f2c832', '#e8402a', '#3a8ae0', '#4ab04a'][(k / 12 | 0) % 4]); }   // guirlande
  signBoard(R, 17 * T, 21 * T, 'FÊTE FORAINE');
  canopy(g, W, H, (x, y) => (L[y] || '')[x] === 'T' && [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => (L[y + b] || '')[x + a] === 'T').length >= 2, season);   // lot 11b : canopée continue
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (L[y][x] === 'T') g.drawImage(treeSprite(season, (x + y) % 4), x * T - 9, y * T - 28);
  return c;
}

// Haies de bordure (tuiles « h ») : on voit tout de suite qu'on ne passe pas.
export function drawHedges(R, L) {
  for (let y = 0; y < L.length; y++) for (let x = 0; x < L[0].length; x++) if (L[y][x] === 'h') {
    const px = x * T, py = y * T;
    R(px, py + 4, T, T - 4, '#2f6a2a'); R(px + 1, py + 2, 6, 6, '#3f8a34'); R(px + 8, py + 1, 7, 7, '#3f8a34'); R(px + 3, py + 6, 10, 6, '#4a9a3a');
    R(px + 2, py + 3, 2, 1, '#68b84c'); R(px + 10, py + 2, 2, 1, '#68b84c'); R(px, py + T - 2, T, 2, '#24521f');
  }
}
