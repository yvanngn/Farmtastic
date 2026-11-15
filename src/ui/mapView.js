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
  // Plan de la région : 4 fermes côte à côte en haut à gauche (chemins en croix), gare à l'ouest,
  // quartier résidentiel au sud, centre-ville à l'est, forêt après le centre-ville, puis la zone de la caverne.
  function drawRegion(now) {
    const W = cv.width, H = cv.height, S = g.S, m = Math.min(W, H) * .04, u = Math.min(W, H) / 100;
    const X = f => m + f * (W - 2 * m), Y = f => m + f * (H - 2 * m);
    ctx.fillStyle = '#5d9a46'; ctx.fillRect(0, 0, W, H);
    const road = (x0, y0, x1, y1) => { ctx.strokeStyle = '#c9a66a'; ctx.lineWidth = 2.6 * u; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(X(x0), Y(y0)); ctx.lineTo(X(x1), Y(y1)); ctx.stroke(); };
    const zone = (x0, y0, x1, y1, fill, line, label, sub, glow) => {
      ctx.fillStyle = fill; ctx.fillRect(X(x0), Y(y0), X(x1) - X(x0), Y(y1) - Y(y0));
      ctx.lineWidth = glow ? 1.4 * u : .7 * u; ctx.strokeStyle = line; ctx.strokeRect(X(x0), Y(y0), X(x1) - X(x0), Y(y1) - Y(y0));
      const cx = (X(x0) + X(x1)) / 2, cy = (Y(y0) + Y(y1)) / 2, fs = Math.min(3.4 * u, (X(x1) - X(x0)) / Math.max(6, [...label].length) * 1.6);
      ctx.fillStyle = '#fff6e0'; ctx.textAlign = 'center'; ctx.font = `bold ${fs}px Nunito, sans-serif`; ctx.fillText(label, cx, cy + fs * .3);
      if (sub) { ctx.font = `${fs * .75}px Nunito, sans-serif`; ctx.fillStyle = '#f5ecd6'; ctx.fillText(sub, cx, cy + fs * 1.4); }
    };
    // routes
    road(.27, .04, .27, .5); road(.06, .25, .48, .25);          // croix entre les fermes
    road(.27, .5, .27, .62); road(.48, .25, .55, .25);           // vers le quartier, vers le centre-ville
    road(.75, .25, .79, .25); road(.92, .25, .95, .25);          // centre-ville → forêt → caverne
    road(.02, .25, .06, .25);                                     // gare
    // fermes des joueurs
    const others = Object.values(g.others || {});
    for (const l of FARM_LOTS) {
      const x0 = .06 + l.c * .22, y0 = .04 + l.r * .23, mine = l.id === (S.farmLot || 0);
      const who = mine ? S.name : (others.find(o => o.farmLot === l.id) || {}).name, pulse = mine ? .5 + .5 * Math.sin(now / 300) : 0;
      zone(x0, y0, x0 + .19, y0 + .19, mine ? '#8a5a32' : who ? '#6e4a2e' : 'rgba(60,40,20,.45)', mine ? `rgba(255,223,138,${.6 + pulse * .4})` : '#3f2615',
        mine ? '⭐ ' + S.name : who ? '🧑‍🌾 ' + who : l.n, mine ? 'ta ferme' : who ? '' : 'emplacement libre', mine);
    }
    zone(0, .18, .045, .32, '#8c6a5a', '#3f2615', '🚉', 'Gare');
    zone(.06, .62, .48, .9, '#9a8f86', '#4a3a30', '🏘️ Quartier résidentiel', 'Luna, Franck, Hailey, Myst · clinique');
    zone(.55, .06, .75, .46, '#a9a29a', '#5b3a22', '🏙️ Centre-ville', 'place, commerces, panneau');
    zone(.79, .02, .92, .5, '#2f5a2a', '#1e3a1a', '🌲 Forêt', 'champignons');
    zone(.95, .1, 1, .4, CFG.CAVE_OPEN ? '#3a3540' : 'rgba(40,36,48,.75)', '#16141a', '🕳️', CFG.CAVE_OPEN ? 'Caverne' : 'fermée');
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
