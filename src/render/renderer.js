import { toolTier } from '../systems/skills.js';
import { MIN_PICK } from '../data/tools.js';
// Rendu : caméra, culling, tri en profondeur, eau animée, lumière dynamique,
// étalonnage météo, particules, vignettage. Responsive (devicePixelRatio, échelle entière).
import { CFG } from '../config.js';
import { TEST_SWORD, testSwordHere } from '../systems/wild.js';
import { rainbowVisible } from '../systems/nature.js';
import { isRepaired, fieldToolAt } from '../systems/repair.js';
import { FIELD_TOOLS } from '../data/repairs.js';
import { BUSHES } from '../data/recipes.js';
import { bushRipe, cookProgress } from '../systems/cooking.js';
// Buisson à baies (baies bleues quand il y en a).
function drawBush(c, x, y, ripe) {
  const px = x * T, py = y * T;
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(px + 1, py + 12, 14, 3);
  c.fillStyle = '#2f6a2a'; c.fillRect(px + 1, py + 5, 14, 9); c.fillRect(px + 3, py + 2, 10, 3);
  c.fillStyle = '#4a9a3a'; c.fillRect(px + 3, py + 4, 5, 4); c.fillRect(px + 9, py + 6, 4, 3); c.fillStyle = '#68b84c'; c.fillRect(px + 4, py + 4, 2, 1);
  if (ripe) for (const [a, b] of [[3, 7], [7, 5], [11, 8], [5, 11], [10, 11], [13, 6]]) { c.fillStyle = '#3a4ad0'; c.fillRect(px + a, py + b, 2, 2); c.fillStyle = '#9aa8ff'; c.fillRect(px + a, py + b, 1, 1); }
}
// Feu de camp : pierres en cercle, bûches, flammes qui dansent.
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
function drawFlower(c, x, y, col, now) {
  const px = x * T + 8, py = y * T + 13, s = Math.round(Math.sin(now / 700 + x * 3 + y) * .8);
  c.fillStyle = '#3f7a28'; c.fillRect(px, py - 5, 1, 5); c.fillStyle = '#64ad3c'; c.fillRect(px - 2, py - 2, 2, 1); c.fillRect(px + 1, py - 3, 2, 1);
  c.fillStyle = col; c.fillRect(px - 1 + s, py - 8, 3, 1); c.fillRect(px - 2 + s, py - 7, 5, 1); c.fillRect(px - 1 + s, py - 6, 3, 1);
  c.fillStyle = '#f6d24a'; c.fillRect(px + s, py - 7, 1, 1);
}
// Filon : gros rocher sombre strié de la couleur du minerai.
function drawVein(c, x, y, o, col) {
  const px = x * T + (o.shake > 0 ? Math.round(Math.sin(o.shake * 40)) : 0), py = y * T;
  c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(px + 1, py + 13, 14, 3);
  c.fillStyle = '#4a4650'; c.fillRect(px + 2, py + 3, 12, 11); c.fillRect(px + 1, py + 5, 14, 8);
  c.fillStyle = '#625e6a'; c.fillRect(px + 3, py + 3, 9, 3); c.fillStyle = '#34313a'; c.fillRect(px + 1, py + 12, 14, 2);
  c.fillStyle = col; for (const [a, b] of [[4, 6], [5, 7], [9, 5], [10, 6], [11, 9], [6, 10], [7, 10], [12, 11]]) c.fillRect(px + a, py + b, 1, 1);
  c.fillStyle = '#fff'; c.fillRect(px + 9, py + 5, 1, 1);
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
import { drawChar, drawTree, drawRock, drawCrop, drawAnimal, drawSlime, drawSwing, treeSprite, KIND_SPRITE } from './sprites.js';
import { buildInterior } from './interiors.js';
import { buildTown, TOWN_LIGHTS } from './town.js';
import { PICKUPS, isBroken } from '../systems/grange.js';
import { buildWild, drawMob, drawZRock, drawShroom } from './wild.js';
import { MUSHROOMS } from '../data/items.js';
import { LAYOUTS } from '../world/scenes.js';
import { toolIcon, drawToolPix } from './sprites.js';
// Train de l'arrivée (voie x0) : à quai 3 s, puis repart vers le sud en accélérant.
function drawTrain(c, t) {
  const T2 = 16, y0 = 16.5 * T2 + (t > 3 ? (t - 3) * (t - 3) * 40 : 0);
  const car = (y, col, loco) => {
    c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(2, y + 2, 14, 46);
    c.fillStyle = col; c.fillRect(1, y, 14, 46); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(1, y, 3, 46);
    c.fillStyle = '#2a2a30'; c.fillRect(1, y, 14, 3); c.fillRect(1, y + 43, 14, 3);
    if (loco) { c.fillStyle = '#e8c26a'; c.fillRect(4, y + 44, 8, 2); c.fillStyle = '#fff6c0'; c.fillRect(6, y + 46, 4, 2); }
    else for (let k = 8; k < 40; k += 10) { c.fillStyle = '#bfe3f5'; c.fillRect(13, y + k, 2, 6); }
  };
  car(y0, '#2f6a4a', false); car(y0 + 48, '#2f6a4a', false); car(y0 + 96, '#a8302b', true);
  if (t > 2.6) { c.fillStyle = 'rgba(230,230,230,' + Math.max(0, .6 - (t - 2.6) * .15) + ')'; for (let k = 0; k < 4; k++) c.fillRect(4 + k * 3, y0 + 140 - k * 9 - (t - 2.6) * 8, 6, 6); }
}
import { SCENES } from '../world/scenes.js';
import { ANIMALS } from '../data/animals.js';
import { ITEMS } from '../data/items.js';
import { darkness } from '../systems/weather.js';
const T = CFG.T;
const MAX_FX = 160;
// Torches des tunnels (px).
const GRANGE_LIGHTS = [[2, 1], [7, 1], [12, 1], [17, 5], [12, 7]].map(([x, y]) => ({ x: x * 16 + 8, y: y * 16 + 6, r: 70 }));

export function createRenderer(cv, g) {
  const ctx = cv.getContext('2d');
  let scale = 3, dpr = 1, cache = null, cacheSeason = -1, cacheScene = '';
  const interiors = {};
  let farm = null, farmSeason = -1;
  function farmGround() { const b = g.S.built || {}, fx = { house: isRepaired(g.S, 'house'), grange: isRepaired(g.S, 'grange') }, key = g.S.season + JSON.stringify(b) + fx.house + fx.grange; if (farmSeason !== key) { farm = buildGround(g.S.season, b, fx); farmSeason = key; } return farm; }
  let vignette = null, light = null, lastStep = 0;
  const cam = { x: 0, y: 0 }, screenFx = [], worldFx = [];
  let swing = null;
  const SEASON_LEAF = ['#4a8f36', '#3b7f31', '#e08a2a', '#eef5f7'];
  // Animation de l'outil (coup) et effets d'impact : copeaux, éclats, chute d'arbre.
  g.bus.on('swing', tool => { swing = { tool, p: 0 }; });
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
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
    // ~10 tuiles sur le plus petit côté, quelle que soit la taille de l'écran
    scale = Math.max(2, Math.min(8, Math.round(Math.min(cv.width, cv.height) / (T * 10))));
    ctx.imageSmoothingEnabled = false;
    vignette = document.createElement('canvas'); vignette.width = cv.width; vignette.height = cv.height;
    const v = vignette.getContext('2d'), gr = v.createRadialGradient(cv.width / 2, cv.height / 2, Math.min(cv.width, cv.height) * .35, cv.width / 2, cv.height / 2, Math.hypot(cv.width, cv.height) / 2);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(10,6,20,.38)');
    v.fillStyle = gr; v.fillRect(0, 0, cv.width, cv.height);
    light = document.createElement('canvas'); light.width = cv.width; light.height = cv.height;
    initWeather();
  }

  function initWeather() {
    screenFx.length = 0;
    const w = g.S.weather, n = w === 'rain' ? 140 : w === 'storm' ? 220 : w === 'snow' ? 110 : 0;
    for (let i = 0; i < n; i++) screenFx.push(drop(w === 'snow', true));
    if (g.S.season === 2) for (let i = 0; i < 14; i++) screenFx.push(leaf(true));
  }
  const drop = (snow, anywhere) => ({ k: snow ? 'snow' : 'rain', x: Math.random() * (cv.width + 200), y: anywhere ? Math.random() * cv.height : -20, end: cv.height * (.2 + Math.random() * .8) });
  const leaf = anywhere => ({ k: 'leaf', x: Math.random() * cv.width, y: anywhere ? Math.random() * cv.height : -10, ph: Math.random() * 6, col: ['#e08a2a', '#c25e1d', '#eea13a'][Math.random() * 3 | 0] });

  function update(dt, now) {
    const u = dpr;
    for (let i = screenFx.length - 1; i >= 0; i--) {
      const p = screenFx[i];
      if (p.k === 'rain') { p.y += 620 * dt * u; p.x -= 140 * dt * u; if (p.y > p.end) { screenFx.push({ k: 'splash', x: p.x, y: p.y, life: .18 }); Object.assign(p, drop(false, false)); } }
      else if (p.k === 'snow') { p.y += 38 * dt * u; p.x += Math.sin(p.y / 40) * .6 * u; if (p.y > cv.height) Object.assign(p, drop(true, false)); }
      else if (p.k === 'leaf') { p.ph += dt * 2; p.y += 30 * dt * u; p.x += (Math.sin(p.ph) * 40 + 20) * dt * u; if (p.y > cv.height || p.x > cv.width + 10) Object.assign(p, leaf(false)); }
      else if (p.k === 'splash') { p.life -= dt; if (p.life <= 0) screenFx.splice(i, 1); }
    }
    // poussière de pas
    const P = g.player;
    if (P.walkFrame && P.walkFrame !== lastStep && (P.walkFrame === 1 || P.walkFrame === 3) && worldFx.length < MAX_FX)
      worldFx.push({ k: 'dust', x: g.S.x * T + (Math.random() * 4 - 2), y: g.S.y * T + 1, life: .45 });
    lastStep = P.walkFrame;
    // lucioles la nuit (printemps / été, temps sec)
    const S = g.S, fireflies = (S.scene || 'farm') === 'farm' && darkness(S) > .3 && S.season < 2 && S.weather !== 'rain' && S.weather !== 'storm';
    if (fireflies && worldFx.filter(f => f.k === 'fly').length < 14)
      worldFx.push({ k: 'fly', x: (S.x + (Math.random() - .5) * 18) * T, y: (S.y + (Math.random() - .5) * 12) * T, ph: Math.random() * 6, life: 6 + Math.random() * 6 });
    if (swing) { swing.p += dt / .28; if (swing.p >= 1) swing = null; }
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

  function render(now) {
    const S = g.S;
    const scene = S.scene || 'farm', outside = scene === 'farm', sky = outside || !!SCENES[scene].outdoor, SC = SCENES[scene];
    if (scene === 'house' && cacheScene === 'house' && cache !== interiors['house' + !!S.workbench + (S.bed !== false)]) cacheScene = ''; // établi réparé
    if (cacheSeason !== S.season || cacheScene !== scene) {
      cache = outside ? farmGround() : scene === 'wild' ? (interiors['wild' + S.season] ||= buildWild(S.season)) : scene === 'foret' ? (interiors['foret' + S.season] ||= buildWild(S.season, 'foret')) : scene === 'town' ? (interiors['town' + S.season] ||= buildTown(S.season)) : (scene === 'house' ? (interiors['house' + !!S.workbench] ||= buildInterior(scene, S)) : (interiors[scene] ||= buildInterior(scene, S)));
      if (cacheSeason !== S.season) initWeather();
      cacheSeason = S.season; cacheScene = scene;
    }
    if (outside) cache = farmGround(); // reconstruit si un bâtiment vient d'être construit
    const vw = cv.width / scale, vh = cv.height / scale, MW = SC.W * T, MH = SC.H * T;
    cam.x = MW <= vw ? (MW - vw) / 2 : Math.max(0, Math.min(MW - vw, S.x * T - vw / 2));
    cam.y = MH <= vh ? (MH - vh) / 2 : Math.max(0, Math.min(MH - vh + (g.talking ? vh * .3 : 0), S.y * T - vh / 2 + (g.talking ? vh * .22 : 0))); // la bulle ne cache pas les personnages
    if (SC.rooms) { // salles façon Game Boy : la caméra reste centrée sur la salle du joueur
      const rw = SC.rooms.w * T, rh = SC.rooms.h * T;
      cam.x = Math.floor(S.x * T / rw) * rw - (vw - rw) / 2; cam.y = Math.floor(S.y * T / rh) * rh - (vh - rh) / 2 + (g.talking ? vh * .22 : 0);
    }
    const camX = Math.round(cam.x * scale) / scale, camY = Math.round(cam.y * scale) / scale;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#16121f'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.setTransform(scale, 0, 0, scale, -camX * scale, -camY * scale);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cache, 0, 0);
    const x0 = Math.max(0, (cam.x / T | 0) - 2), y0 = Math.max(0, (cam.y / T | 0) - 1);
    const x1 = Math.min(SC.W - 1, ((cam.x + vw) / T | 0) + 2), y1 = Math.min(SC.H - 1, ((cam.y + vh) / T | 0) + 3);
    if (outside) drawWaterShimmer(ctx, x0, y0, x1, y1, now);
    const wall = g.now();
    if (outside) for (const k in S.tilled || {}) { const [x, y] = k.split(',').map(Number); if (x >= x0 && x <= x1 && y >= y0 && y <= y1) drawSoil(ctx, x, y); }
    if (outside) for (const k in S.plots) { const [x, y] = k.split(',').map(Number); if (x >= x0 && x <= x1 && y >= y0 && y <= y1) drawCrop(ctx, x, y, S.plots[k], wall); }
    for (const f of worldFx) if (f.k === 'dust') { ctx.fillStyle = `rgba(214,196,160,${f.life})`; ctx.fillRect(Math.round(f.x), Math.round(f.y), 2, 2); }

    const list = [], pickTier = toolTier(S, 'pick');
    if (outside) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const o = S.objs[x + ',' + y];
      if (o) list.push({ z: y + .9, d: () => o.t === 'tree' ? drawTree(ctx, x, y, o, S.season, now) : drawRock(ctx, x, y, o, (MIN_PICK[o.t] || 1) > pickTier) });
    }
    if (outside) for (const a of S.animals) list.push({ z: a.y, d: () => drawAnimal(ctx, a, now, ANIMALS[a.type]) });
    if (outside) for (const e of g.enemies) list.push({ z: e.y, d: () => drawSlime(ctx, e, now) });
    if (scene === 'foret') {
      const cols = {}; for (const ss of MUSHROOMS) for (const m of ss) cols[m.id] = m.c;
      for (const k in (S.foret && S.foret.shrooms) || {}) { const [x, y] = k.split(',').map(Number), m = S.foret.shrooms[k]; list.push({ z: y + .6, d: () => drawShroom(ctx, x, y, m, cols[m.sp]) }); }
    }
    if (scene === 'wild') {
      for (const e of g.enemies) list.push({ z: e.y, d: () => drawMob(ctx, e, now) });
      for (const k in (S.wild && S.wild.rocks) || {}) { const [x, y] = k.split(',').map(Number), o = S.wild.rocks[k]; list.push({ z: y + .9, d: () => drawZRock(ctx, x, y, o) }); }
      for (const s2 of g.shots || []) list.push({ z: s2.y, d: () => { ctx.fillStyle = '#3a2020'; ctx.fillRect(Math.round(s2.x * T) - 2, Math.round(s2.y * T) - 2, 4, 4); ctx.fillStyle = '#e0a060'; ctx.fillRect(Math.round(s2.x * T) - 1, Math.round(s2.y * T) - 1, 2, 2); } });
    }
    if (outside) { // volets de Franck : fermés tant qu'il n'a pas 3 cœurs
      const r = S.social && S.social.franck, open = r && r.points >= 750, wx = 25 * T + 6, wy = 29 * T + 12;
      list.push({ z: 31.95, d: () => {
        if (open) { ctx.fillStyle = '#ffd98a'; ctx.fillRect(wx + 2, wy + 2, 10, 8); ctx.fillStyle = '#3e5a7a'; ctx.fillRect(wx - 5, wy, 5, 12); ctx.fillRect(wx + 14, wy, 5, 12); }
        else { ctx.fillStyle = '#3e5a7a'; ctx.fillRect(wx, wy, 14, 12); ctx.fillStyle = '#2a4058'; for (let k = 2; k < 12; k += 3) ctx.fillRect(wx, wy + k, 14, 1); ctx.fillRect(wx + 7, wy, 1, 12); }
      } });
    }
    { // fleurs, cailloux et filons (ferme, forêt, Terres sauvages)
      const N = S.nature && S.nature[scene];
      if (N) {
        for (const k in N.flowers) { const [x, y] = k.split(',').map(Number); if (x >= x0 && x <= x1 && y >= y0 && y <= y1) list.push({ z: y + .5, d: () => drawFlower(ctx, x, y, FLOWER_COL[N.flowers[k]] || '#fff', now) }); }
        for (const k in N.rocks) { const [x, y] = k.split(',').map(Number), o = N.rocks[k]; if (x >= x0 && x <= x1 && y >= y0 && y <= y1) list.push({ z: y + .9, d: () => o.t === 'vein' ? drawVein(ctx, x, y, o, VEINS[o.v].c) : drawRock(ctx, x, y, o) }); }
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
    if (scene === 'farm') for (const t of FIELD_TOOLS) if (fieldToolAt(S, t.x, t.y)) list.push({ z: t.y + .4, d: () => { // outil posé par terre
      const b = Math.round(Math.sin(now / 250 + t.x) * 1.5), x = t.x * T, y = t.y * T;
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x + 3, y + 12, 10, 2);
      ctx.fillStyle = 'rgba(255,240,170,' + (.25 + .2 * Math.sin(now / 300)) + ')'; ctx.fillRect(x + 1, y + 1 + b, 14, 12);
      ctx.save(); ctx.translate(x + 8, y + 11 + b); ctx.rotate(-.5); drawToolPix(ctx, t.tool); ctx.restore();
    } });
    if (scene === 'farm') {
      for (const [x, y] of BUSHES) if (x >= x0 && x <= x1 && y >= y0 && y <= y1) list.push({ z: y + .8, d: () => drawBush(ctx, x, y, bushRipe(S, x, y)) });
      for (const f of S.fires || []) list.push({ z: f.y + .7, d: () => drawFire(ctx, f.x, f.y, now) });
      if (g.cooking) list.push({ z: 9997, d: () => { const p = cookProgress(g), x = g.cooking.x * T, y = g.cooking.y * T - 8;
        ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x - 1, y - 1, 18, 5); ctx.fillStyle = '#f2a03a'; ctx.fillRect(x, y, Math.round(16 * p), 3); } });
    }
    if (scene === 'farm' && S.tent) list.push({ z: S.tent.y + .9, d: () => { // tente du début
      const x = S.tent.x * T, y = S.tent.y * T;
      ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(x - 3, y + 13, 22, 3);
      for (let i = 0; i < 12; i++) { ctx.fillStyle = i < 2 ? '#3f7a8a' : '#4f96a8'; ctx.fillRect(x + 8 - i - 1, y + 2 + i, (i + 1) * 2, 1); }
      ctx.fillStyle = '#2e6070'; for (let i = 0; i < 12; i++) ctx.fillRect(x + 8 + i, y + 2 + i, 1, 1);
      ctx.fillStyle = '#1c2a30'; for (let i = 0; i < 7; i++) ctx.fillRect(x + 8 - (i >> 1), y + 7 + i, (i >> 1) * 2 + 1, 1);
      ctx.fillStyle = '#e8c26a'; ctx.fillRect(x + 7, y, 2, 3); ctx.fillStyle = '#7a4f2e'; ctx.fillRect(x - 3, y + 13, 2, 2); ctx.fillRect(x + 17, y + 13, 2, 2);
    } });
    if (scene === 'farm' && g.trainT && now - g.trainT < 9000) list.push({ z: 9998, d: () => drawTrain(ctx, (now - g.trainT) / 1000) });
    if (scene === 'farm' && testSwordHere(S)) list.push({ z: TEST_SWORD.y + .4, d: () => {
      const b = Math.round(Math.sin(now / 250) * 1.5), x = TEST_SWORD.x * T, y = TEST_SWORD.y * T;
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x + 3, y + 12, 10, 2);
      ctx.save(); ctx.translate(x + 8, y + 10 + b); ctx.rotate(-.6); ctx.fillStyle = '#5a3a22'; ctx.fillRect(-1, 2, 2, 4); ctx.fillStyle = '#e8c26a'; ctx.fillRect(-3, 1, 6, 1); ctx.fillStyle = '#d6dbe0'; ctx.fillRect(-1, -11, 2, 12); ctx.fillStyle = '#fff'; ctx.fillRect(-1, -11, 1, 11); ctx.restore();
    } });
    for (const d of S.drops || []) if (d.scene === scene) list.push({ z: d.y + .4, d: () => {
      const b = Math.round(Math.sin(now / 250 + d.x) * 1.5), it = ITEMS[d.id];
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(d.x * T + 3, d.y * T + 12, 10, 2);
      ctx.font = '10px serif'; ctx.textAlign = 'center'; ctx.fillText(it ? it.i : '❔', d.x * T + 8, d.y * T + 10 + b); ctx.textAlign = 'start';
      if (d.n > 1) { ctx.font = 'bold 6px Georgia'; ctx.fillStyle = '#fff6e0'; ctx.fillText(d.n, d.x * T + 11, d.y * T + 15); }
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
    for (const id in g.npcs) { const n = g.npcs[id]; if ((n.scene || 'farm') !== scene) continue; list.push({ z: n.y, d: () => { drawChar(ctx, Math.round(n.x * T - 6), Math.round(n.y * T - 19), n.look, n.dir || 0, n.walking ? ((now / 150 | 0) % 4) : 0, now); label(n.name, n.x * T, n.y * T - (n.look.tall ? 28 : 25)); } }); }
    for (const id in g.others) { const o = g.others[id]; if (!o.look || (o.scene || 'farm') !== scene) continue; list.push({ z: o.y, d: () => { drawChar(ctx, Math.round(o.x * T - 6), Math.round(o.y * T - 19), o.look, o.dir, o.f, now + 777); label(o.name, o.x * T, o.y * T - 25); } }); }
    list.push({ z: S.y, d: () => {
      if (swing && S.dir === 1) drawSwing(ctx, S, swing.tool, swing.p);
      if (!(g.player.iframe > 0 && ((now / 80) | 0) % 2)) drawChar(ctx, Math.round(S.x * T - 6), Math.round(S.y * T - 19), S.look, S.dir, g.player.walkFrame, now);
      if (swing && S.dir !== 1) drawSwing(ctx, S, swing.tool, swing.p);
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
    const LIGHTS_HERE = scene === 'grange' ? GRANGE_LIGHTS : outside ? LIGHTS.filter((l, i) => i !== 1 || (S.built && S.built.coop)) : scene === 'town' ? TOWN_LIGHTS : [];
    if (!sky) { ctx.fillStyle = 'rgba(255,180,100,.07)'; ctx.fillRect(0, 0, cv.width, cv.height); }
    if (sky && S.minute > 1020 && S.minute < 1170) { ctx.fillStyle = `rgba(255,140,60,${.12 * Math.sin((S.minute - 1020) / 150 * Math.PI)})`; ctx.fillRect(0, 0, cv.width, cv.height); }
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
      for (const [x, y, rad] of holes) {
        const gr = lc.createRadialGradient(x, y, 0, x, y, rad);
        gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        lc.fillStyle = gr; lc.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      ctx.drawImage(light, 0, 0);
      // halo additif (bloom) des fenêtres et lucioles
      ctx.globalCompositeOperation = 'lighter';
      for (const l of LIGHTS_HERE) {
        const [x, y] = toScreen(l.x, l.y), rad = l.r * .6 * scale, gr = ctx.createRadialGradient(x, y, 0, x, y, rad);
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
    }
    ctx.drawImage(vignette, 0, 0);
  }

  function screenToTile(e) {
    const r = cv.getBoundingClientRect();
    return {
      tx: Math.floor((((e.clientX - r.left) * dpr) / scale + cam.x) / T),
      ty: Math.floor((((e.clientY - r.top) * dpr) / scale + cam.y) / T)
    };
  }

  addEventListener('resize', resize);
  resize();
  return { render, resize, initWeather, updateParticles: update, screenToTile, farmGround };
}
