// Carte de la ferme : vue d'ensemble dézoomée, 4 niveaux de zoom,
// déplacement au doigt (glisser), pincement et molette.
import { $ } from './dom.js';
import { CFG } from '../config.js';
import { ANIMALS } from '../data/animals.js';
import { SCENES } from '../world/scenes.js';
import { isRipe } from '../systems/farming.js';
import { LAYOUTS, TOWN_B } from '../world/scenes.js';
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
    // Farmwest (lot 2) : carte de la région d'après docs/carte-region-farmwest.jpg — terre ocre, rivière, océan au sud.
    F('#e9d6a8', 0, 0, W, H);
    const pg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .75);
    pg.addColorStop(0, 'rgba(255,248,220,0)'); pg.addColorStop(1, 'rgba(120,80,30,.45)'); F(pg, 0, 0, W, H);
    const poly = (c, pts) => { ctx.fillStyle = c; ctx.beginPath(); pts.forEach(([a, b], i) => i ? ctx.lineTo(X(a), Y(b)) : ctx.moveTo(X(a), Y(b))); ctx.closePath(); ctx.fill(); };
    const zone = (c, x0, y0, x1, y1, rad = 2) => { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(X(x0), Y(y0), X(x1) - X(x0), Y(y1) - Y(y0), rad * u); ctx.fill(); };
    // terre ocre partout, prairie verte à l'ouest
    ctx.fillStyle = '#d9b072'; ctx.beginPath(); ctx.roundRect(X(-.01), Y(-.01), X(1.01) - X(-.01), Y(1.01) - Y(-.01), 4 * u); ctx.fill();
    for (let k = 0; k < 260; k++) { const x = X(rnd()), y = Y(rnd()); F(rnd() < .5 ? '#c99a5a' : '#e4c088', x, y, 1.2 * u, .6 * u); }
    poly('#6aa84a', [[-.01, .45], [.15, .45], [.17, .7], [.15, 1.01], [-.01, 1.01]]);
    // océan au sud (plage, fête foraine, port)
    poly('#3f86c4', [[.15, .9], [.3, .95], [.45, .93], [.62, .9], [.7, .85], [1.01, .8], [1.01, 1.01], [.15, 1.01]]);
    for (let x = X(.16); x < X(1); x += 1.6 * u) F('#bfe3f5', x, Y(.9 + .05 * Math.sin(x / (8 * u))) - .3 * u, 1 * u, .4 * u);
    poly('#ecd39a', [[.17, .84], [.42, .86], [.62, .82], [.7, .8], [.62, .9], [.45, .93], [.3, .95], [.17, .9]]);   // sable
    // rivière qui entoure le centre-ville puis file vers la mer
    const river = pts => { for (const [w, c] of [[3.4, '#2f6aa8'], [2.4, '#4a92d0']]) { ctx.strokeStyle = c; ctx.lineWidth = w * u; ctx.lineCap = ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([a, b], i) => i ? ctx.lineTo(X(a), Y(b)) : ctx.moveTo(X(a), Y(b))); ctx.stroke(); } };
    river([[.15, -.01], [.16, .2], [.16, .6], [.15, .75], [.16, .9]]); river([[.35, -.01], [.37, .15], [.37, .6], [.3, .63], [.16, .62]]);
    // chemins de terre
    const road = pts => { for (const [w, c] of [[3.2, '#8a6a3a'], [2.2, '#e8cf98']]) { ctx.strokeStyle = c; ctx.lineWidth = w * u; ctx.lineCap = ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([a, b], i) => i ? ctx.lineTo(X(a), Y(b)) : ctx.moveTo(X(a), Y(b))); ctx.stroke(); } };
    road([[.09, .41], [.5, .41], [.78, .41]]); road([[.5, .05], [.5, .41], [.5, .7]]); road([[.41, .19], [.6, .19]]);
    road([[.72, .41], [.72, .2], [.82, .18]]); road([[.72, .41], [.72, .78], [.8, .8]]); road([[.27, .58], [.27, .75]]); road([[.43, .55], [.5, .55]]);
    for (const [bx, by] of [[.16, .41], [.37, .41], [.27, .62]]) { F('#8a5a32', X(bx) - 1.6 * u, Y(by) - 1.4 * u, 3.2 * u, 2.8 * u); F('#c99560', X(bx) - 1.6 * u, Y(by) - 1 * u, 3.2 * u, .5 * u); }   // ponts en bois
    // petits dessins
    const tree = (x, y, s, c = '#3f7a32') => { circ('rgba(0,0,0,.18)', x + .2 * s, y + .3 * s, .9 * s); circ(c, x, y - .2 * s, .9 * s); circ('rgba(255,255,255,.15)', x - .3 * s, y - .5 * s, .35 * s); };
    const house = (x, y, s, wall, roof) => { F('rgba(0,0,0,.2)', x - s, y + .9 * s, 2.2 * s, .3 * s); F(wall, x - s, y, 2 * s, s); ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(x - 1.2 * s, y); ctx.lineTo(x, y - .9 * s); ctx.lineTo(x + 1.2 * s, y); ctx.fill(); };
    const ribbon = (x, y, text, sub, gold) => {
      const tu = W < H ? u * .72 : u;
      ctx.font = `bold ${3.1 * tu}px Nunito, sans-serif`; const w = Math.max(ctx.measureText(text).width, sub ? (ctx.font = `${2.3 * tu}px Nunito, sans-serif`, ctx.measureText(sub).width) : 0) + 4 * tu, h = sub ? 7 * tu : 4.6 * tu;
      ctx.fillStyle = gold ? '#f2c832' : '#fff6e0'; ctx.strokeStyle = gold ? '#8a5a12' : '#6a4a2a'; ctx.lineWidth = .5 * tu;
      ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 1.4 * tu); ctx.fill(); ctx.stroke();
      ctx.textAlign = 'center'; ctx.fillStyle = '#3b2414'; ctx.font = `bold ${3.1 * tu}px Nunito, sans-serif`; ctx.fillText(text, x, y + (sub ? -.4 * tu : 1.1 * tu));
      if (sub) { ctx.font = `${2.3 * tu}px Nunito, sans-serif`; ctx.fillStyle = '#6a4a2a'; ctx.fillText(sub, x, y + 2.6 * tu); }
    };
    // forêts denses (nord-est, bords ouest)
    for (let k = 0; k < 70; k++) tree(X(.59 + rnd() * .22), Y(.03 + rnd() * .33), 1.6 * u, k % 3 ? '#2f6a2a' : '#3f7a32');
    for (let k = 0; k < 30; k++) tree(X(.01 + rnd() * .1), Y(.02 + rnd() * .3), 1.5 * u, '#2f6a2a');
    for (let k = 0; k < 22; k++) tree(X(.03 + rnd() * .1), Y(.5 + rnd() * .35), 1.5 * u, '#2f6a2a');
    // les 4 fermes (2 × 2) autour du chemin en croix
    const others = Object.values(g.others || {});
    for (const l of FARM_LOTS) {
      const x0 = X(.415 + l.c * .095), y0 = Y(.05 + l.r * .15), w = X(.085) - X(0), h = Y(.12) - Y(0);
      const mine = l.id === (S.farmLot || 0), who = mine ? S.name : (others.find(o => o.farmLot === l.id) || {}).name;
      ctx.fillStyle = mine ? '#c8a86a' : '#b8925a'; ctx.beginPath(); ctx.roundRect(x0, y0, w, h, 1.2 * u); ctx.fill();
      for (let r = 0; r < 4; r++) F(r % 2 ? '#5a8a3a' : '#7a5232', x0 + w * .5, y0 + h * (.2 + r * .17), w * .42, h * .1);
      house(x0 + w * .25, y0 + h * .45, 1.8 * u, '#b8432f', '#5a2a22');
      if (mine) { const p = .6 + .4 * Math.sin(now / 300); ctx.strokeStyle = `rgba(242,200,50,${p})`; ctx.lineWidth = 1 * u; ctx.beginPath(); ctx.roundRect(x0 - .5 * u, y0 - .5 * u, w + u, h + u, 1.6 * u); ctx.stroke(); }
      if (mine || who) ribbon(x0 + w / 2, y0 + h * .92, mine ? '⭐ ' + S.name : '🧑‍🌾 ' + who, mine ? 'ta ferme' : '', mine);
    }
    ribbon(X(.5), Y(.035), '🌾 Les 4 Fermes');
    // gare et voie ferrée à l'ouest
    for (let k = 0; k < 16; k++) F('#6a4a30', X(.055), Y(.02 + k * .028), 1.6 * u, .4 * u);
    F('#8c8f96', X(.055) + .2 * u, Y(.02), .3 * u, Y(.45) - Y(.02)); F('#8c8f96', X(.055) + 1.1 * u, Y(.02), .3 * u, Y(.45) - Y(.02));
    house(X(.1), Y(.38), 2.4 * u, '#9a6a3c', '#5a3a22'); ribbon(X(.1), Y(.31), '🚂 Gare');
    // tunnel dans la colline à l'ouest (on verra plus tard)
    circ('#4a6a3a', X(.06), Y(.6), 3 * u); ctx.fillStyle = '#16141a'; ctx.beginPath(); ctx.arc(X(.06), Y(.62), 1.4 * u, Math.PI, 0); ctx.fill();
    // centre-ville sur son plateau, entouré par la rivière
    zone('#cdb48a', .19, .25, .35, .58);
    for (const [fx, fy, c1, c2] of [[.22, .31, '#7a5a8a', '#4a3a5a'], [.27, .31, '#b8432f', '#5a2a22'], [.32, .31, '#c98a4a', '#7a3a22'], [.22, .46, '#9a6a3c', '#5a3a22'], [.27, .46, '#5a2a3a', '#2a1a20'], [.32, .46, '#3e5a7a', '#24324a']]) house(X(fx), Y(fy), 2.2 * u, c1, c2);
    ribbon(X(.27), Y(.55), '🤠 Centre-ville', 'saloon · magasins · charpentier');
    // rond-point et sa fontaine
    circ('#e8cf98', X(.5), Y(.41), 4 * u); circ('#8a6a3a', X(.5), Y(.41), 2.4 * u); circ('#7fb6d9', X(.5), Y(.41), 1.8 * u); circ('#e8f4fc', X(.5), Y(.41), .7 * u);
    ribbon(X(.5), Y(.34), '⛲ Rond-point');
    // zone résidentielle
    for (const [fx, c1, c2] of [[.56, '#d8c2e8', '#7a5a8a'], [.6, '#f4f6f2', '#5aa8a0'], [.64, '#f2dce0', '#a83a32'], [.68, '#4a4650', '#24212a']]) house(X(fx), Y(.46), 1.9 * u, c1, c2);
    ribbon(X(.62), Y(.515), '🏘️ Zone résidentielle', 'Luna · Franck · Hailey · Myst · Ed');
    // ranch du Maire : enclos, chevaux
    zone('#c49a62', .52, .56, .68, .7, 1); ctx.strokeStyle = '#6a4426'; ctx.lineWidth = .5 * u; ctx.strokeRect(X(.53), Y(.6), X(.67) - X(.53), Y(.69) - Y(.6));
    house(X(.6), Y(.58), 2.4 * u, '#b8432f', '#5a2a22'); for (const fx of [.55, .58, .64]) { F('#6a4426', X(fx), Y(.65), 1.6 * u, .9 * u); F('#6a4426', X(fx) + 1.2 * u, Y(.64), .6 * u, .8 * u); }
    ribbon(X(.6), Y(.715), '🐎 Ranch du Maire', 'Manu');
    // fête foraine sur la plage
    zone('#a8774a', .43, .74, .62, .84, 1); for (const fx of [.46, .52, .58]) { ctx.fillStyle = '#f4ead2'; ctx.beginPath(); ctx.moveTo(X(fx) - 2 * u, Y(.82)); ctx.lineTo(X(fx), Y(.77)); ctx.lineTo(X(fx) + 2 * u, Y(.82)); ctx.fill(); }
    ribbon(X(.525), Y(.86), '🎡 Fête foraine');
    // station balnéaire : cabines, parasols
    for (const fx of [.22, .26, .3, .34]) house(X(fx), Y(.78), 1.4 * u, '#9a6a3c', '#5a3a22');
    for (const [fx, c] of [[.24, '#e0402a'], [.29, '#4a7ae8'], [.35, '#f2c832']]) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(X(fx), Y(.87), 1.2 * u, Math.PI, 0); ctx.fill(); }
    ribbon(X(.29), Y(.93), '🏖️ Station balnéaire', 'pêche en mer');
    // zone portuaire : quais et voiliers
    zone('#8a5a32', .76, .78, .97, .84, .6); for (const fx of [.8, .86, .92]) F('#8a5a32', X(fx), Y(.84), 1 * u, Y(.92) - Y(.84));
    for (const fx of [.78, .9]) { F('#6a4426', X(fx), Y(.94), 4 * u, 1.2 * u); ctx.fillStyle = '#f4ead2'; ctx.beginPath(); ctx.moveTo(X(fx) + 2 * u, Y(.94) - 4.5 * u); ctx.lineTo(X(fx) + 2 * u, Y(.94)); ctx.lineTo(X(fx) + 4.5 * u, Y(.94)); ctx.fill(); }
    ribbon(X(.87), Y(.75), '⚓ Zone portuaire');
    // montagne (est) et caverne sombre (nord-est)
    for (const [fx, fy, s] of [[.84, .45, 7], [.9, .4, 9], [.96, .47, 6], [.88, .52, 5]]) { ctx.fillStyle = '#8a6a5a'; ctx.beginPath(); ctx.moveTo(X(fx) - s * u, Y(fy) + s * .6 * u); ctx.lineTo(X(fx), Y(fy) - s * u); ctx.lineTo(X(fx) + s * u, Y(fy) + s * .6 * u); ctx.fill(); ctx.fillStyle = '#eef0f4'; ctx.beginPath(); ctx.moveTo(X(fx) - s * .25 * u, Y(fy) - s * .6 * u); ctx.lineTo(X(fx), Y(fy) - s * u); ctx.lineTo(X(fx) + s * .25 * u, Y(fy) - s * .6 * u); ctx.fill(); }
    ribbon(X(.9), Y(.58), '🏔️ Montagne', 'froid · filons · lac gelé');
    zone('#6a5a50', .82, -.01, 1.01, .17, 1); ctx.fillStyle = '#16141a'; ctx.beginPath(); ctx.arc(X(.91), Y(.13), 2.4 * u, Math.PI, 0); ctx.fill();
    if (!CFG.CAVE_OPEN) { ctx.font = `${3 * u}px serif`; ctx.textAlign = 'center'; ctx.fillText('🔒', X(.91), Y(.07)); }
    ribbon(X(.91), Y(.2), '🕳️ Caverne sombre', CFG.CAVE_OPEN ? '' : 'fermée');
    ribbon(X(.7), Y(.2), '🌲 Forêt', 'champignons · bois');
    // rose des vents
    { const cx = X(.06), cy = Y(.92), r = 4 * u;
      ctx.fillStyle = 'rgba(255,248,220,.75)'; ctx.beginPath(); ctx.arc(cx, cy, r * 1.25, 0, 7); ctx.fill();
      for (const [a, c] of [[0, '#a8302b'], [Math.PI / 2, '#3b2414'], [Math.PI, '#3b2414'], [-Math.PI / 2, '#3b2414']]) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(cx + Math.sin(a) * r, cy - Math.cos(a) * r); ctx.lineTo(cx + Math.sin(a + 2.6) * r * .3, cy - Math.cos(a + 2.6) * r * .3); ctx.lineTo(cx + Math.sin(a - 2.6) * r * .3, cy - Math.cos(a - 2.6) * r * .3); ctx.fill(); }
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
    if (inside && !door) { regionAuto(); raf = requestAnimationFrame(draw); return; }   // loin de la ferme (ville, plage…) : on montre la région
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
  function regionAuto() { if (!region) { region = true; $('#mapRegion').textContent = '🗺️ Ferme'; } }
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
