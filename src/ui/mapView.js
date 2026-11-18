// Carte de la ferme : vue d'ensemble dézoomée, 4 niveaux de zoom,
// déplacement au doigt (glisser), pincement et molette.
import { $ } from './dom.js';
import { CFG } from '../config.js';
import { ANIMALS } from '../data/animals.js';
import { SCENES } from '../world/scenes.js';
import { isRipe } from '../systems/farming.js';
import { LAYOUTS, TOWN_B } from '../world/scenes.js';
import { FARM_LOTS } from '../data/buildings.js';
import { harmonize } from '../render/pixel.js';
import { buildRegionMap, drawLabel, regionPos, FARM_RECT, LABELS, RW, RH } from '../render/regionmap.js';
const T = CFG.T, LEVELS = [1, 1.6, 2.6, 4];

export function createMapView(g, renderer, audio) {
  const cv = $('#mapCv'), ctx = cv.getContext('2d');
  let li = 0, center = { x: CFG.W / 2, y: CFG.H / 2 }, raf = 0, open = false, region = false;
  const ptrs = new Map(); let pinch0 = 0;

  function size() {
    const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 3);
    cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d);
  }
  const dims = () => region ? [RW, RH] : [CFG.W, CFG.H];   // lot 10 : la région a ses propres dimensions
  const fit = () => { const [w, h] = dims(), f = Math.min(cv.width / (w * T), cv.height / (h * T)); return region && cv.height > cv.width ? Math.min(cv.height / (h * T), f * 2.2) : f; };   // téléphone en portrait : la région remplit la hauteur, on la parcourt au doigt
  const sc = () => fit() * LEVELS[li];
  function clampCenter() {
    const s = sc(), hw = cv.width / s / T / 2, hh = cv.height / s / T / 2, [W, H] = dims();
    center.x = W <= hw * 2 ? W / 2 : Math.max(hw, Math.min(W - hw, center.x));
    center.y = H <= hh * 2 ? H / 2 : Math.max(hh, Math.min(H - hh, center.y));
  }
  // Lot 10 : vue « Région » = la carte pré-rendue comme docs/carte-region-farmwest.jpg (render/regionmap.js),
  // avec zoom et déplacement au doigt comme la carte de la ferme, étiquettes western, fermes des joueurs et position du joueur.
  let regionCv = null, regionSeason = -1, fontAsked = false;
  function drawRegion(now) {
    const S = g.S;
    if (!fontAsked && document.fonts) { fontAsked = true; document.fonts.load('24px Rye').catch(() => {}); }   // police western des étiquettes
    if (!regionCv || regionSeason !== S.season) { regionCv = harmonize(buildRegionMap(S.season), true); regionSeason = S.season; }
    const s = sc(), ox = cv.width / 2 - center.x * T * s, oy = cv.height / 2 - center.y * T * s, P = (x, y) => [ox + x * T * s, oy + y * T * s];
    ctx.fillStyle = '#2a4a6a'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.imageSmoothingEnabled = s < 1; ctx.drawImage(regionCv, ox, oy, RW * T * s, RH * T * s);
    const d = Math.min(devicePixelRatio || 1, 3), fs = Math.max(13 * d, Math.min(30 * d, cv.width / 62 * LEVELS[li] ** .5));
    // les 4 fermes : la mienne encadrée d'or, celles des autres joueurs avec leur nom
    const others = Object.values(g.others || {});
    for (const l of FARM_LOTS) {
      const F = FARM_RECT(l), [x0, y0] = P(F.x, F.y), w = F.w * T * s, h = F.h * T * s, mine = l.id === (S.farmLot || 0);
      const who = mine ? S.name : (others.find(o => o.farmLot === l.id) || {}).name;
      if (mine) { ctx.strokeStyle = `rgba(242,200,50,${.6 + .4 * Math.sin(now / 300)})`; ctx.lineWidth = 3 * d; ctx.strokeRect(x0 - 2 * d, y0 - 2 * d, w + 4 * d, h + 4 * d); }
      if (who) drawLabel(ctx, (mine ? '★ ' : '') + who, x0 + w / 2, y0 + h + fs * .3, fs * .62);
    }
    // 18/11 (soir) : plus de noms de lieux sur la carte (le joueur les connaît)
    // moi : point rouge qui pulse ; les autres joueurs : points bleus
    for (const o of others) { if (!o.scene) continue; const q = regionPos({ scene: o.scene, farmLot: o.farmLot }), [px, py] = P(q.x, q.y); ctx.fillStyle = '#5aa8ff'; ctx.beginPath(); ctx.arc(px, py, 5 * d, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5 * d; ctx.stroke(); }
    const me = regionPos(S), [mx, my] = P(me.x, me.y), pr = (6 + Math.sin(now / 200) * 1.5) * d;
    ctx.fillStyle = 'rgba(229,83,75,.3)'; ctx.beginPath(); ctx.arc(mx, my, pr * 2, 0, 7); ctx.fill();
    ctx.fillStyle = '#e5534b'; ctx.beginPath(); ctx.arc(mx, my, pr, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 * d; ctx.stroke();
    $('#mapLvl').textContent = (S.game && S.game.code ? 'Code ' + S.game.code + ' · ' : 'Région · ') + '×' + LEVELS[li];
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
  function regionAuto() { if (!region) setRegion(true); }
  function setRegion(on) { region = on; li = 0; $('#mapRegion').textContent = on ? '🗺️ Ferme' : '🧭 Région'; $('#mapMe').onclick(); }
  $('#mapMe').onclick = () => { const S = g.S, d = S.scene !== 'farm' && SCENES.farm.doors.find(x => x.to === S.scene); center = region ? regionPos(S) : d ? { x: d.x, y: d.y } : { x: S.x, y: S.y }; clampCenter(); };
  $('#mapClose').onclick = () => close();
  $('#mapRegion').onclick = () => { setRegion(!region); audio && audio.play('ui'); };
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
