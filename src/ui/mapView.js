// Carte de la ferme : vue d'ensemble dézoomée, 4 niveaux de zoom,
// déplacement au doigt (glisser), pincement et molette.
import { $ } from './dom.js';
import { CFG } from '../config.js';
import { ANIMALS } from '../data/animals.js';
import { SCENES } from '../world/scenes.js';
import { isRipe } from '../systems/farming.js';
import { FARM_LOTS } from '../data/buildings.js';
const T = CFG.T, LEVELS = [1, 1.6, 2.6, 4];

export function createMapView(g, renderer, audio) {
  const cv = $('#mapCv'), ctx = cv.getContext('2d');
  let li = 0, center = { x: CFG.W / 2, y: CFG.H / 2 }, raf = 0, open = false, region = false;
  const ptrs = new Map(); let pinch0 = 0;

  function size() {
    const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 3);
    cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d);
  }
  const fit = () => Math.min(cv.width / (CFG.W * T), cv.height / (CFG.H * T));
  const sc = () => fit() * LEVELS[li];
  function clampCenter() {
    const s = sc(), hw = cv.width / s / T / 2, hh = cv.height / s / T / 2;
    center.x = CFG.W <= hw * 2 ? CFG.W / 2 : Math.max(hw, Math.min(CFG.W - hw, center.x));
    center.y = CFG.H <= hh * 2 ? CFG.H / 2 : Math.max(hh, Math.min(CFG.H - hh, center.y));
  }
  // Vue « Région » : le village au centre, un emplacement de ferme par joueur autour.
  // Plan de la région, façon carte illustrée : parchemin, chemins de terre, petits dessins pour chaque zone.
  // 4 fermes côte à côte en haut à gauche (chemins en croix), gare à l'ouest, quartier au sud,
  // centre-ville à l'est, forêt après le centre-ville, puis la montagne de la Caverne sombre.
  function drawRegion(now) {
    const W = cv.width, H = cv.height, S = g.S, m = Math.min(W, H) * .05, u = Math.min(W, H) / 100;
    const X = f => m + f * (W - 2 * m), Y = f => m + f * (H - 2 * m);
    const rnd = (k => () => ((k = (k * 9301 + 49297) % 233280) / 233280))(7);
    const F = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    const circ = (c, x, y, r) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
    // parchemin
    F('#e9d6a8', 0, 0, W, H);
    const pg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .75);
    pg.addColorStop(0, 'rgba(255,248,220,0)'); pg.addColorStop(1, 'rgba(120,80,30,.45)'); F(pg, 0, 0, W, H);
    // prairie peinte
    ctx.fillStyle = '#9cc46a'; ctx.beginPath(); ctx.roundRect(X(-.01), Y(-.01), X(1.01) - X(-.01), Y(1.01) - Y(-.01), 4 * u); ctx.fill();
    for (let k = 0; k < 260; k++) { const x = X(rnd()), y = Y(rnd()); F(rnd() < .5 ? '#8ab85a' : '#acd07a', x, y, 1.2 * u, .6 * u); }
    // chemins de terre (bordure foncée puis terre claire)
    const road = pts => { for (const [w, c] of [[3.2, '#8a6a3a'], [2.2, '#d9b878']]) { ctx.strokeStyle = c; ctx.lineWidth = w * u; ctx.lineCap = ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([a, b], i) => i ? ctx.lineTo(X(a), Y(b)) : ctx.moveTo(X(a), Y(b))); ctx.stroke(); } };
    road([[.27, .02], [.27, .5], [.27, .62]]); road([[.02, .25], [.55, .25]]); road([[.75, .25], [.79, .25]]); road([[.92, .25], [.95, .25]]);
    // petits dessins
    const tree = (x, y, s, c = '#3f7a32') => { F('#6a4426', x - .25 * s, y, .5 * s, .8 * s); circ(c, x, y - .2 * s, .9 * s); circ('rgba(255,255,255,.15)', x - .3 * s, y - .5 * s, .35 * s); };
    const pine = (x, y, s) => { F('#5a3a22', x - .2 * s, y, .4 * s, .7 * s); ctx.fillStyle = '#2c5f2a'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x, y - (2.2 - i * .6) * s); ctx.lineTo(x - (.7 + i * .3) * s, y - (.9 - i * .5) * s); ctx.lineTo(x + (.7 + i * .3) * s, y - (.9 - i * .5) * s); ctx.fill(); } };
    const house = (x, y, s, wall, roof) => { F('rgba(0,0,0,.2)', x - s, y + .9 * s, 2.2 * s, .3 * s); F(wall, x - s, y, 2 * s, s); ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(x - 1.2 * s, y); ctx.lineTo(x, y - .9 * s); ctx.lineTo(x + 1.2 * s, y); ctx.fill(); F('#5a3a22', x - .2 * s, y + .4 * s, .4 * s, .6 * s); F('#bfe3f5', x + .4 * s, y + .25 * s, .35 * s, .3 * s); };
    const ribbon = (x, y, text, sub, gold) => {
      const tu = W < H ? u * .72 : u;   // en portrait, étiquettes plus petites pour ne pas se chevaucher
      ctx.font = `bold ${3.1* tu}px Nunito, sans-serif`; const w = Math.max(ctx.measureText(text).width, sub ? (ctx.font = `${2.3* tu}px Nunito, sans-serif`, ctx.measureText(sub).width) : 0) + 4* tu, h = sub ? 7* tu : 4.6* tu;
      ctx.fillStyle = gold ? '#f2c832' : '#fff6e0'; ctx.strokeStyle = gold ? '#8a5a12' : '#6a4a2a'; ctx.lineWidth = .5* tu;
      ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 1.4* tu); ctx.fill(); ctx.stroke();
      ctx.textAlign = 'center'; ctx.fillStyle = '#3b2414'; ctx.font = `bold ${3.1* tu}px Nunito, sans-serif`; ctx.fillText(text, x, y + (sub ? -.4* tu : 1.1* tu));
      if (sub) { ctx.font = `${2.3* tu}px Nunito, sans-serif`; ctx.fillStyle = '#6a4a2a'; ctx.fillText(sub, x, y + 2.6* tu); }
    };
    // les 4 fermes : champ en sillons, cabane, grange
    const others = Object.values(g.others || {});
    for (const l of FARM_LOTS) {
      const x0 = X(.06 + l.c * .22), y0 = Y(.04 + l.r * .23), w = X(.25) - X(.06), h = Y(.23) - Y(.04);
      const mine = l.id === (S.farmLot || 0), who = mine ? S.name : (others.find(o => o.farmLot === l.id) || {}).name;
      ctx.fillStyle = mine ? '#b8d888' : '#a8cc78'; ctx.beginPath(); ctx.roundRect(x0, y0, w, h, 1.5 * u); ctx.fill();
      ctx.strokeStyle = '#8a6a3a'; ctx.setLineDash([1.2 * u, .8 * u]); ctx.lineWidth = .5 * u; ctx.stroke(); ctx.setLineDash([]);
      for (let r = 0; r < 4; r++) F('#8a5a32', x0 + w * .52, y0 + h * (.45 + r * .12), w * .4, h * .06);
      house(x0 + w * .22, y0 + h * .38, 2.4 * u, '#c99a6a', '#a8432f'); house(x0 + w * .55, y0 + h * .2, 2 * u, '#8a6a4a', '#5a3a2a');
      tree(x0 + w * .15, y0 + h * .82, 1.6 * u); tree(x0 + w * .9, y0 + h * .15, 1.4 * u);
      if (mine) { const p = .6 + .4 * Math.sin(now / 300); ctx.strokeStyle = `rgba(242,200,50,${p})`; ctx.lineWidth = 1.2 * u; ctx.beginPath(); ctx.roundRect(x0 - .6 * u, y0 - .6 * u, w + 1.2 * u, h + 1.2 * u, 2 * u); ctx.stroke(); }
      ribbon(x0 + w / 2, y0 + h * .95, mine ? '⭐ ' + S.name : who ? '🧑‍🌾 ' + who : l.n, mine ? 'ta ferme' : who ? '' : 'libre', mine);
    }
    // gare et rails
    for (let k = 0; k < 12; k++) F('#6a4a30', X(.005), Y(.12 + k * .03), 1.6 * u, .4 * u);
    F('#8c8f96', X(.005) + .2 * u, Y(.12), .3 * u, Y(.48) - Y(.12)); F('#8c8f96', X(.005) + 1.1 * u, Y(.12), .3 * u, Y(.48) - Y(.12));
    house(X(.03), Y(.22), 2 * u, '#b5654a', '#3e5a7a'); ribbon(X(.03), Y(.33), '🚉 Gare');
    // quartier : maisons colorées, arbres, maison sombre de Myst en bas à gauche
    { const x0 = X(.06), y0 = Y(.62), w = X(.48) - X(.06), h = Y(.92) - Y(.62);
      ctx.fillStyle = '#b4d08a'; ctx.beginPath(); ctx.roundRect(x0, y0, w, h, 2 * u); ctx.fill();
      F('#c9c2b4', x0 + w * .02, y0 + h * .3, w * .96, h * .06); F('#c9c2b4', x0 + w * .02, y0 + h * .62, w * .96, h * .06);
      house(x0 + w * .2, y0 + h * .14, 2.4 * u, '#d8c2e8', '#7a5a8a'); house(x0 + w * .72, y0 + h * .14, 2.4 * u, '#f4f6f2', '#5aa8a0');
      house(x0 + w * .25, y0 + h * .48, 2.4 * u, '#9aa4b0', '#3e5a7a'); house(x0 + w * .65, y0 + h * .48, 2.2 * u, '#f2dce0', '#5aa8a0');
      house(x0 + w * .1, y0 + h * .82, 2.4 * u, '#4a4650', '#24212a');
      for (const f of [.04, .3, .45, .88, .95]) tree(x0 + w * f, y0 + h * .78, 1.4 * u, '#4f8a3a');
      ribbon(x0 + w * .55, y0 + h * .86, '🏘️ Quartier résidentiel', 'Luna · Franck · Hailey · Igor · Myst · clinique'); }
    // centre-ville : pavés, toits, fontaine
    { const x0 = X(.55), y0 = Y(.06), w = X(.75) - X(.55), h = Y(.46) - Y(.06);
      ctx.fillStyle = '#c9c2b4'; ctx.beginPath(); ctx.roundRect(x0, y0, w, h, 2 * u); ctx.fill();
      for (let k = 0; k < 40; k++) F('#b3aca2', x0 + rnd() * w, y0 + rnd() * h, 1.2 * u, .8 * u);
      circ('#7fb6d9', x0 + w / 2, y0 + h * .45, 2.6 * u); circ('#bfe3f5', x0 + w / 2, y0 + h * .45, 1.2 * u);
      for (const [fx, fy, r] of [[.2, .15, '#c8553e'], [.8, .15, '#2f5a3a'], [.2, .75, '#c98a4a'], [.5, .78, '#a83a32'], [.8, .75, '#2f5a8a']]) house(x0 + w * fx, y0 + h * fy, 2.2 * u, '#9a6a3c', r);
      house(x0 + w * .5, y0 + h * .98, 2.2 * u, '#f4efe4', '#b8432f');
      ribbon(x0 + w / 2, y0 + h * .3, '🏙️ Centre-ville', 'commerces · place · villa de Manuel'); }
    // forêt : sapins serrés et champignons
    { const x0 = X(.79), y0 = Y(.02), w = X(.92) - X(.79), h = Y(.5) - Y(.02);
      ctx.fillStyle = '#5a9a46'; ctx.beginPath(); ctx.roundRect(x0, y0, w, h, 3 * u); ctx.fill();
      for (let k = 0; k < 26; k++) pine(x0 + w * (.1 + rnd() * .8), y0 + h * (.12 + rnd() * .82), 1.4 * u + rnd() * .6 * u);
      circ('#e8602a', x0 + w * .3, y0 + h * .55, .6 * u); circ('#8a5a32', x0 + w * .7, y0 + h * .35, .6 * u);
      ribbon(x0 + w / 2, y0 + h * .5, '🌲 Forêt', 'champignons'); }
    // montagne de la caverne
    { const cx = X(.975), by = Y(.42);
      ctx.fillStyle = '#7a7480'; ctx.beginPath(); ctx.moveTo(cx - 7 * u, by); ctx.lineTo(cx - 2 * u, by - 14 * u); ctx.lineTo(cx + 1 * u, by - 10 * u); ctx.lineTo(cx + 3 * u, by - 16 * u); ctx.lineTo(cx + 7 * u, by); ctx.fill();
      ctx.fillStyle = '#eef0f4'; ctx.beginPath(); ctx.moveTo(cx + 3 * u, by - 16 * u); ctx.lineTo(cx + 1.6 * u, by - 12.5 * u); ctx.lineTo(cx + 4.4 * u, by - 12.5 * u); ctx.fill();
      ctx.fillStyle = '#16141a'; ctx.beginPath(); ctx.arc(cx, by, 2.4 * u, Math.PI, 0); ctx.fill();
      if (!CFG.CAVE_OPEN) { ctx.font = `${3 * u}px serif`; ctx.textAlign = 'center'; ctx.fillText('🔒', cx, by - 3 * u); }
      ribbon(cx - 1 * u, by + 4 * u, 'Caverne', CFG.CAVE_OPEN ? '' : 'fermée'); }
    // rose des vents
    { const cx = X(.93), cy = Y(.85), r = 5 * u;
      ctx.fillStyle = 'rgba(255,248,220,.7)'; ctx.beginPath(); ctx.arc(cx, cy, r * 1.2, 0, 7); ctx.fill();
      for (const [a, c] of [[0, '#a8302b'], [Math.PI / 2, '#3b2414'], [Math.PI, '#3b2414'], [-Math.PI / 2, '#3b2414']]) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(cx + Math.sin(a) * r, cy - Math.cos(a) * r); ctx.lineTo(cx + Math.cos(a) * r * .22, cy + Math.sin(a) * r * .22); ctx.lineTo(cx - Math.cos(a) * r * .22, cy - Math.sin(a) * r * .22); ctx.fill(); }
      ctx.fillStyle = '#3b2414'; ctx.font = `bold ${2.4 * u}px Nunito, sans-serif`; ctx.textAlign = 'center'; ctx.fillText('N', cx, cy - r - .8 * u); }
    $('#mapLvl').textContent = S.game && S.game.code ? 'Code ' + S.game.code : 'Région';
    raf = requestAnimationFrame(draw);
  }

  function draw(now) {
    if (!open) return;
    if (region) return drawRegion(now);
    const S = g.S, s = sc(), ox = cv.width / 2 - center.x * T * s, oy = cv.height / 2 - center.y * T * s;
    ctx.fillStyle = '#16121f'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(renderer.farmGround(), ox, oy, CFG.W * T * s, CFG.H * T * s);
    const dot = (x, y, r, col, line) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ox + x * T * s, oy + y * T * s, Math.max(1.5, r * s * T), 0, 7); ctx.fill(); if (line) { ctx.lineWidth = Math.max(1, s); ctx.strokeStyle = line; ctx.stroke(); } };
    for (const k in S.objs) {
      const [x, y] = k.split(',').map(Number), o = S.objs[k];
      dot(x + .5, y + .4, o.t === 'tree' ? ((o.g ?? 3) < 3 ? .25 : .55) : o.t === 'boulder' ? .45 : .3, o.t === 'tree' ? '#2c5f2a' : '#7d7987', o.t === 'tree' ? '#1e2a17' : null);
    }
    const t = g.now();
    for (const k in S.plots) { const [x, y] = k.split(',').map(Number); if (isRipe(S.plots[k], t)) dot(x + .5, y + .5, .22, '#f2cf73'); }
    for (const a of S.animals) dot(a.x, a.y, .25, a.type === 'cat' ? '#e08a3a' : '#fbf6ec', '#3a2a20');
    for (const id in g.others) { const o = g.others[id]; if ((o.scene || 'farm') === 'farm') dot(o.x, o.y, .35, '#5aa8ff', '#fff'); }
    // portes des bâtiments
    for (const d of SCENES.farm.doors) if (!(S.built && d.to in S.built) || S.built[d.to]) dot(d.x + .5, d.y + .5, .3, '#e8c26a', '#3b2414');
    // joueur (à la porte s'il est à l'intérieur)
    const inside = S.scene && S.scene !== 'farm', door = inside && SCENES.farm.doors.find(d => d.to === S.scene);
    const px = inside ? door.x + .5 : S.x, py = inside ? door.y + .9 : S.y, pulse = .38 + Math.sin(now / 200) * .08;
    dot(px, py, pulse, '#e5534b', '#fff');
    $('#mapLvl').textContent = '×' + LEVELS[li];
    raf = requestAnimationFrame(draw);
  }
  function zoom(delta) { li = Math.max(0, Math.min(LEVELS.length - 1, li + delta)); clampCenter(); audio && audio.play('ui'); }

  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); } });
  cv.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    if (ptrs.size === 1) {
      const d = Math.min(devicePixelRatio || 1, 3), s = sc();
      center.x -= (e.clientX - p.x) * d / s / T; center.y -= (e.clientY - p.y) * d / s / T; clampCenter();
    }
    p.x = e.clientX; p.y = e.clientY;
    if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()], dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist > pinch0 * 1.35) { zoom(1); pinch0 = dist; } else if (dist < pinch0 / 1.35) { zoom(-1); pinch0 = dist; }
    }
  });
  const up = e => ptrs.delete(e.pointerId);
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY < 0 ? 1 : -1); }, { passive: false });
  $('#mapIn').onclick = () => zoom(1);
  $('#mapOut').onclick = () => zoom(-1);
  $('#mapMe').onclick = () => { const S = g.S, d = S.scene !== 'farm' && SCENES.farm.doors.find(x => x.to === S.scene); center = d ? { x: d.x, y: d.y } : { x: S.x, y: S.y }; clampCenter(); };
  $('#mapClose').onclick = () => close();
  $('#mapRegion').onclick = () => { region = !region; $('#mapRegion').textContent = region ? '🗺️ Ferme' : '🧭 Région'; audio && audio.play('ui'); };
  addEventListener('resize', () => { if (open) { size(); clampCenter(); } });

  function close() { open = false; cancelAnimationFrame(raf); $('#ovMap').classList.remove('on'); }
  return {
    open() {
      $('#ovMap').classList.add('on'); open = true; size(); li = 0;
      $('#mapMe').onclick(); li = 0; clampCenter(); raf = requestAnimationFrame(draw);
    },
    close, get isOpen() { return open; }
  };
}
