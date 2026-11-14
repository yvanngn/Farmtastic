// Rendu : caméra, culling, tri en profondeur, eau animée, lumière dynamique,
// étalonnage météo, particules, vignettage. Responsive (devicePixelRatio, échelle entière).
import { CFG } from '../config.js';
import { buildGround, drawWaterShimmer, LIGHTS } from './ground.js';
import { drawChar, drawTree, drawRock, drawCrop, drawAnimal, drawSlime, drawSwing, treeSprite } from './sprites.js';
import { buildInterior } from './interiors.js';
import { buildTown, TOWN_LIGHTS } from './town.js';
import { SCENES } from '../world/scenes.js';
import { ANIMALS } from '../data/animals.js';
import { darkness } from '../systems/weather.js';
const T = CFG.T;
const MAX_FX = 160;

export function createRenderer(cv, g) {
  const ctx = cv.getContext('2d');
  let scale = 3, dpr = 1, cache = null, cacheSeason = -1, cacheScene = '';
  const interiors = {};
  let farm = null, farmSeason = -1;
  function farmGround() { if (farmSeason !== g.S.season) { farm = buildGround(g.S.season); farmSeason = g.S.season; } return farm; }
  let vignette = null, light = null, lastStep = 0;
  const cam = { x: 0, y: 0 }, screenFx = [], worldFx = [];
  let swing = null;
  const SEASON_LEAF = ['#4a8f36', '#3b7f31', '#e08a2a', '#eef5f7'];
  // Animation de l'outil (coup) et effets d'impact : copeaux, éclats, chute d'arbre.
  g.bus.on('swing', tool => { swing = { tool, p: 0 }; });
  g.bus.on('objHit', ({ x, y, t, broken }) => {
    const cx = x * T + 8, cy = y * T + (t === 'tree' ? 6 : 9), stone = t !== 'tree';
    const n = broken ? 14 : 5, cols = stone ? ['#9a958c', '#c2bdb4', '#6a6670'] : ['#c9955a', '#8a5a32', SEASON_LEAF[g.S.season]];
    for (let i = 0; i < n && worldFx.length < MAX_FX; i++) {
      const a = Math.random() * Math.PI * 2, v = 20 + Math.random() * (broken ? 45 : 25);
      worldFx.push({ k: 'chip', x: cx, y: cy, vx: Math.cos(a) * v, vy: -Math.abs(Math.sin(a)) * v - 15, col: cols[i % cols.length], life: .5 + Math.random() * .3, floor: cy + 6 });
    }
    if (broken && t === 'tree') worldFx.push({ k: 'fall', x, y, season: g.S.season, v: (x * 7 + y * 3) % 4, dir: g.S.x < x + .5 ? 1 : -1, life: 1, t: 0 });
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
    if (cacheSeason !== S.season || cacheScene !== scene) {
      cache = outside ? farmGround() : scene === 'town' ? (interiors['town' + S.season] ||= buildTown(S.season)) : (interiors[scene] ||= buildInterior(scene));
      if (cacheSeason !== S.season) initWeather();
      cacheSeason = S.season; cacheScene = scene;
    }
    const vw = cv.width / scale, vh = cv.height / scale, MW = SC.W * T, MH = SC.H * T;
    cam.x = MW <= vw ? (MW - vw) / 2 : Math.max(0, Math.min(MW - vw, S.x * T - vw / 2));
    cam.y = MH <= vh ? (MH - vh) / 2 : Math.max(0, Math.min(MH - vh, S.y * T - vh / 2));
    const camX = Math.round(cam.x * scale) / scale, camY = Math.round(cam.y * scale) / scale;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#16121f'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.setTransform(scale, 0, 0, scale, -camX * scale, -camY * scale);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cache, 0, 0);
    const x0 = Math.max(0, (cam.x / T | 0) - 2), y0 = Math.max(0, (cam.y / T | 0) - 1);
    const x1 = Math.min(SC.W - 1, ((cam.x + vw) / T | 0) + 2), y1 = Math.min(SC.H - 1, ((cam.y + vh) / T | 0) + 3);
    if (outside) drawWaterShimmer(ctx, x0, y0, x1, y1, now);
    const wall = g.now();
    if (outside) for (const k in S.plots) { const [x, y] = k.split(',').map(Number); if (x >= x0 && x <= x1 && y >= y0 && y <= y1) drawCrop(ctx, x, y, S.plots[k], wall); }
    for (const f of worldFx) if (f.k === 'dust') { ctx.fillStyle = `rgba(214,196,160,${f.life})`; ctx.fillRect(Math.round(f.x), Math.round(f.y), 2, 2); }

    const list = [];
    if (outside) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const o = S.objs[x + ',' + y];
      if (o) list.push({ z: y + .9, d: () => o.t === 'tree' ? drawTree(ctx, x, y, o, S.season, now) : drawRock(ctx, x, y, o) });
    }
    if (outside) for (const a of S.animals) list.push({ z: a.y, d: () => drawAnimal(ctx, a, now, ANIMALS[a.type]) });
    if (outside) for (const e of g.enemies) list.push({ z: e.y, d: () => drawSlime(ctx, e, now) });
    if (outside) for (const id in g.npcs) { const n = g.npcs[id]; list.push({ z: n.y, d: () => { drawChar(ctx, Math.round(n.x * T - 6), Math.round(n.y * T - 19), n.look, n.dir || 0, 0, now); label(n.name, n.x * T, n.y * T - 25); } }); }
    for (const id in g.others) { const o = g.others[id]; if (!o.look || (o.scene || 'farm') !== scene) continue; list.push({ z: o.y, d: () => { drawChar(ctx, Math.round(o.x * T - 6), Math.round(o.y * T - 19), o.look, o.dir, o.f, now + 777); label(o.name, o.x * T, o.y * T - 25); } }); }
    list.push({ z: S.y, d: () => {
      if (swing && S.dir === 1) drawSwing(ctx, S, swing.tool, swing.p);
      drawChar(ctx, Math.round(S.x * T - 6), Math.round(S.y * T - 19), S.look, S.dir, g.player.walkFrame, now);
      if (swing && S.dir !== 1) drawSwing(ctx, S, swing.tool, swing.p);
    } });
    for (const f of worldFx) if (f.k === 'fall' && outside) list.push({ z: f.y + .95, d: () => {
      // l'arbre bascule autour du pied du tronc, de plus en plus vite, puis s'efface
      const ang = Math.min(1.45, f.t * f.t * 2.6) * f.dir, px = f.x * T + 8, py = f.y * T + 14;
      ctx.save(); ctx.globalAlpha = Math.min(1, f.life * 3); ctx.translate(px, py); ctx.rotate(Math.round(ang / (Math.PI / 16)) * (Math.PI / 16));
      ctx.drawImage(treeSprite(f.season, f.v), -17, -42); ctx.restore();
      ctx.fillStyle = '#5b3a22'; ctx.fillRect(f.x * T + 5, f.y * T + 10, 6, 4); ctx.fillStyle = '#c9955a'; ctx.fillRect(f.x * T + 6, f.y * T + 10, 4, 1);
    } });
    for (const f of worldFx) if (f.k === 'chip') list.push({ z: f.floor / T, d: () => { ctx.globalAlpha = Math.min(1, f.life * 3); ctx.fillStyle = f.col; ctx.fillRect(Math.round(f.x), Math.round(f.y), 2, 2); ctx.globalAlpha = 1; } });
    list.sort((a, b) => a.z - b.z).forEach(o => o.d());

    const t = g.player.target;
    if (t) brackets(t.tx, t.ty, now);
    ctx.font = 'bold 8px Georgia'; ctx.lineWidth = 2; ctx.strokeStyle = '#1b1226';
    for (const f of g.fx) { ctx.globalAlpha = Math.min(1, f.life * 2); ctx.strokeText(f.t, f.x * T, f.y * T); ctx.fillStyle = f.c || '#fff6e0'; ctx.fillText(f.t, f.x * T, f.y * T); }
    ctx.globalAlpha = 1;

    // ---- lumière et étalonnage (espace écran) ----
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const toScreen = (wx, wy) => [(wx - camX) * scale, (wy - camY) * scale];
    const dark = sky ? Math.min(.7, darkness(S) * 1.15) : 0;
    const LIGHTS_HERE = outside ? LIGHTS : scene === 'town' ? TOWN_LIGHTS : [];
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
