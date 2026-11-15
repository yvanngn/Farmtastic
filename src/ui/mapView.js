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
  function drawRegion(now) {
    const W = cv.width, H = cv.height, S = g.S, u = Math.min(W, H) / 100, P = (fx, fy) => [W / 2 + (fx - .5) * Math.min(W, H) * .95, H / 2 + (fy - .5) * Math.min(W, H) * .95];
    ctx.fillStyle = '#5d9a46'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#c9a66a'; ctx.lineWidth = 3 * u;
    for (const l of FARM_LOTS) { const [a, b] = P(.5, .5), [c, d] = P(l.x, l.y); ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); }
    const box = (fx, fy, w, h, fill, line, label, sub) => {
      const [x, y] = P(fx, fy); ctx.fillStyle = fill; ctx.fillRect(x - w * u, y - h * u, w * 2 * u, h * 2 * u);
      ctx.lineWidth = .8 * u; ctx.strokeStyle = line; ctx.strokeRect(x - w * u, y - h * u, w * 2 * u, h * 2 * u);
      ctx.fillStyle = '#fff6e0'; ctx.textAlign = 'center'; ctx.font = `bold ${3.4 * u}px Nunito, sans-serif`; ctx.fillText(label, x, y + u);
      if (sub) { ctx.font = `${2.6 * u}px Nunito, sans-serif`; ctx.fillStyle = '#f5ecd6'; ctx.fillText(sub, x, y + 4.6 * u); }
    };
    box(.5, .5, 12, 8, '#a9a29a', '#5b3a22', '🏘️ Village', 'place, commerces, panneau');
    const others = Object.values(g.others || {});
    for (const l of FARM_LOTS) {
      const mine = l.id === (S.farmLot || 0), who = mine ? S.name : (others.find(o => o.farmLot === l.id) || {}).name;
      const pulse = mine ? .5 + .5 * Math.sin(now / 300) : 0;
      box(l.x, l.y, 11, 6, mine ? '#8a5a32' : who ? '#6e4a2e' : 'rgba(60,40,20,.45)', mine ? `rgba(255,223,138,${.6 + pulse * .4})` : '#3f2615', mine ? '⭐ ' + S.name : who ? '🧑‍🌾 ' + who : l.n, mine ? 'ta ferme' : who ? '' : 'emplacement libre');
    }
    const me = FARM_LOTS.find(l => l.id === (S.farmLot || 0)), [mx, my] = P(me.x, me.y);
    ctx.font = `${4.5 * u}px serif`; ctx.textAlign = 'center';
    ctx.fillText('🌲', mx - 15 * u, my - 6 * u); ctx.fillText('⚔️', mx + 15 * u, my - 6 * u);
    ctx.font = `${2.4 * u}px Nunito, sans-serif`; ctx.fillStyle = '#fff6e0';
    ctx.fillText('🏘️', mx, my + 12 * u); ctx.fillText('🏙️', mx + 22 * u, my + 2 * u);
    ctx.font = `${2.4 * u}px Nunito, sans-serif`; ctx.fillText('Quartier', mx, my + 15 * u); ctx.fillText('Centre-ville', mx + 22 * u, my + 5 * u);
    ctx.fillText('Forêt', mx - 15 * u, my - 2 * u); ctx.fillText(S.wildOpen ? 'Terres sauvages' : 'Portail fermé', mx + 15 * u, my - 2 * u);
    $('#mapLvl').textContent = 'Région';
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
