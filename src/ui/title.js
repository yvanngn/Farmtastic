import { versionLabel } from '../version.js';
// Écran titre façon Witch'rok, version Far West : coucher de soleil, mesas, cactus, virevoltant, dessinés par le code,
// titre lumineux qui apparaît (flou → net) puis flotte, « Toucher pour commencer », menu de jeu.
import { $ } from './dom.js';

// Entrées du menu selon qu'une sauvegarde existe (logique pure, testée).
export function titleMenu(hasSave, many = false) {
  return [
    ...(hasSave ? [{ id: 'continue', label: 'Continuer', icon: '▶', main: true }] : []),
    ...(many ? [{ id: 'games', label: 'Mes parties', icon: '📂' }] : []),
    { id: 'new', label: hasSave ? 'Nouvelle partie' : 'Commencer', icon: '🌱', main: !hasSave },
    { id: 'howto', label: 'Comment jouer', icon: '📖' },
    { id: 'settings', label: 'Réglages', icon: '⚙' }
  ];
}

const BH = 144; // hauteur de la scène ; en portrait le ciel s'allonge au-dessus
// Farmwest : coucher de soleil du Far West (violet → orange → or)
const SKY = ['#2e2350', '#4a2c5e', '#6e3460', '#9a3f5a', '#c2554a', '#e0743c', '#f09a40', '#f8bf5a', '#ffd98a'];

export function createTitle({ audio, onContinue, onNew, onGames = () => {}, onSettings }) {
  { const ov = document.getElementById('ovTitle'); if (ov && !ov.querySelector('.version')) { const v = document.createElement('div'); v.className = 'version'; v.textContent = versionLabel();
    v.style.cssText = 'position:absolute;right:10px;bottom:calc(8px + env(safe-area-inset-bottom,0px));font:12px Nunito,sans-serif;color:#fff;opacity:.75;text-shadow:0 1px 2px #000;pointer-events:none'; ov.appendChild(v); } }
  const ov = $('#ovTitle'), cv = $('#titleCv'), ctx = cv.getContext('2d');
  let W = 256, H = BH, hasSave = false, many = false, phase = 'tap';
  const pollen = Array.from({ length: 46 }, (_, i) => ({ x: (i * 97) % 400, y: (i * 53) % H, s: 3 + (i % 5), p: i * 1.7 }));

  function resize() {
    const a = innerWidth / Math.max(1, innerHeight);
    W = Math.max(176, Math.min(420, Math.round(BH * a)));
    H = Math.max(BH, Math.round(W / a));
    cv.width = W; cv.height = H;
  }
  addEventListener('resize', resize); resize();

  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w | 0, h | 0); };
  function disc(cx, cy, r, c) { ctx.fillStyle = c; for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy)); ctx.fillRect(cx - w | 0, cy + dy | 0, 2 * w + 1, 1); } }
  function hill(base, a1, f1, a2, f2, off, col) {
    ctx.fillStyle = col;
    for (let x = 0; x < W; x++) { const y = base + a1 * Math.sin((x + off) * f1) + a2 * Math.sin((x + off) * f2 + 1.3); ctx.fillRect(x, y | 0, 1, H); }
  }
  function cloud(x, y, s) {
    x = ((x % (W + 60)) + W + 60) % (W + 60) - 40;
    disc(x, y, 5 * s, '#fff1e4'); disc(x + 7 * s, y - 3 * s, 6 * s, '#fff6ec'); disc(x + 15 * s, y, 5 * s, '#ffeede');
    R(x - 5 * s, y + 2 * s, 26 * s, 3 * s, '#f6d4c6');
  }
  function tree(x, y, r) {
    R(x - 1, y, 3, r + 3, '#5a3a22');
    disc(x, y - 2, r, '#2f6b3a'); disc(x - r / 2 | 0, y - r / 2 | 0, r - 2, '#3f8a45'); disc(x - r / 2 | 0, y - r | 0, Math.max(1, r - 4), '#62ad55');
  }
  function barn(x, gy) {
    const w = 38, h = 22, y = gy - h;
    R(x, y, w, h, '#b8432f'); R(x + w - 10, y, 10, h, '#8f3224');
    for (let k = 3; k < h; k += 4) R(x, y + k, w, 1, '#9c3727');
    for (let r = 0; r < 14; r++) { const inset = r < 6 ? r * 2 : 12 + (r - 6); R(x - 2 + inset, y - r, w + 4 - inset * 2, 1, r === 0 ? '#3a1d17' : '#5a2a22'); }
    R(x + 12, y - 9, 14, 1, '#f4ead2'); // faîte
    R(x + 13, gy - 14, 12, 14, '#f4ead2'); R(x + 14, gy - 13, 10, 13, '#6e2a1f');
    for (let k = 0; k < 10; k++) { R(x + 14 + k, gy - 13 + k * 1.3, 1, 1, '#f4ead2'); R(x + 23 - k, gy - 13 + k * 1.3, 1, 1, '#f4ead2'); }
    R(x + 16, y - 6, 6, 5, '#f4ead2'); R(x + 17, y - 5, 4, 3, '#ffd77a');
    // silo
    R(x + w + 3, gy - 30, 11, 30, '#b9bcc4'); R(x + w + 10, gy - 30, 4, 30, '#8d909a');
    for (let k = 4; k < 30; k += 6) R(x + w + 3, gy - 30 + k, 11, 1, '#9da0a9');
    disc(x + w + 8, gy - 30, 5, '#7c86a0'); R(x + w + 3, gy - 30, 11, 6, '#b9bcc4');
  }
  function windmill(x, gy, t) {
    for (let r = 0; r < 34; r++) { const w = 4 + r / 5 | 0; R(x - w, gy - r, w * 2, 1, r % 6 === 0 ? '#c9a77a' : '#e2c9a0'); }
    R(x - 4, gy - 38, 8, 5, '#7a4b2c');
    const hx = x, hy = gy - 34, a0 = t / 1400;
    for (let b = 0; b < 4; b++) {
      const a = a0 + b * Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a);
      for (let l = 2; l < 19; l++) {
        R(hx + ca * l, hy + sa * l, 1, 1, '#6b4a2b');
        if (l > 5) for (let s = 1; s < 4; s++) R(hx + ca * l - sa * s, hy + sa * l + ca * s, 1, 1, s === 3 ? '#e8e1d2' : '#fbf6ea');
      }
    }
    disc(hx, hy, 2, '#4a3020');
  }

  // 18/11 (soir) : écran titre « pixel crépuscule enrichi » (choisi par l'utilisateur sur maquette) : ciel tramé du violet à l'or,
  // étoiles, soleil couchant en bandes, mesas striées, pont de bois et train éclairé qui passe, ranch aux fenêtres allumées,
  // cactus et clôture en silhouette, lucioles. Le décor fixe est dessiné une fois par taille d'écran ; train, fumée, étoiles et lucioles bougent.
  const B4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const DUSK = ['#1e1838', '#3a2452', '#6a2e5c', '#a83e52', '#d8604a', '#f0903e', '#f8c45a'];
  let bg = null, bgKey = '';
  function background(dy) {
    const key = W + 'x' + H; if (bg && bgKey === key) return bg;
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
    let seed = 11; const r = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const horizon = dy + 104, n = DUSK.length - 1;
    for (let y = 0; y < horizon; y++) { const tt = y / horizon * n, i = Math.min(n - 1, tt | 0), f = tt - i;
      for (let x = 0; x < W; x++) P(x, y, 1, 1, f * 16 > B4[y & 3][x & 3] + .5 ? DUSK[i + 1] : DUSK[i]); }
    const sx = W * .66, sy = dy + 90;
    const discG = (cx, cy, rr, col) => { for (let k = -rr; k <= rr; k++) { const w = Math.floor(Math.sqrt(rr * rr - k * k)); P(cx - w, cy + k, w * 2 + 1, 1, col); } };
    discG(sx, sy, 25, '#f8b84a'); discG(sx, sy, 21, '#fcd46a'); discG(sx, sy, 16, '#fee89a');
    for (const y of [80, 85, 89, 92, 95]) P(sx - 30, dy + y, 60, y > 88 ? 2 : 1, '#e0743c');   // bandes du soleil couchant
    const mesa = (x0, w, top, h, col, sh, lit) => { P(x0, top, w, h, col); for (let y = top + 4; y < top + h; y += 4) P(x0, y, w, 1, sh); P(x0, top, w, 2, lit); P(x0 + w - 5, top, 5, h, sh);
      for (let x = x0; x < x0 + w; x += 2) if (r() < .5) P(x, top + h, 2, 2 + (r() * 3 | 0), col); };
    mesa(W * .03, 56, dy + 62, 42, '#8a3a3e', '#6e2c36', '#c8584a'); mesa(W * .78, 48, dy + 56, 48, '#7a3440', '#5e2834', '#b84c48'); mesa(W * .38, 32, dy + 77, 27, '#9a4440', '#7a3438', '#d86a4a');
    const ridge = (base, amp, f, col) => { for (let x = 0; x < W; x++) P(x, base + Math.sin(x * f) * amp + Math.sin(x * f * 3.1) * amp * .3, 1, H, col); };
    ridge(dy + 98, 3, .03, '#5a2a3a'); ridge(dy + 106, 2.5, .05, '#3e2232');
    // pont de bois (le train passe dessus)
    P(0, dy + 95, W, 2, '#2a1824'); for (let x = 4; x < W; x += 11) { P(x, dy + 97, 2, 11, '#2a1824'); for (let k = 0; k < 6; k++) P(x + k, dy + 97 + k * 2, 1, 1, '#2a1824'); }
    // sol, ranch éclairé, cactus, clôture
    P(0, dy + 112, W, H, '#3a2230'); for (let y = dy + 112; y < H; y += 2) for (let x = 0; x < W; x += 2) if (r() < .2) P(x, y, 2, 1, '#4e2e3a');
    const rx = W * .09; P(rx, dy + 98, 44, 18, '#2a1824'); for (let k = 0; k < 10; k++) P(rx + 22 - k * 2.4 - 3, dy + 88 + k, k * 4.8 + 6, 1, '#1c1018');
    P(rx + 6, dy + 103, 7, 6, '#fcb44a'); P(rx + 22, dy + 103, 7, 6, '#fcb44a'); P(rx + 7, dy + 104, 5, 4, '#fed878');
    for (const [fx, h] of [[.38, 24], [.91, 29], [.66, 18]]) { const x = W * fx, b = dy + 120; P(x, b - h, 5, h, '#1c1420'); P(x - 5, b - h + 8, 5, 3, '#1c1420'); P(x - 5, b - h + 3, 3, 7, '#1c1420'); P(x + 5, b - h + 11, 4, 3, '#1c1420'); P(x + 6, b - h + 5, 3, 8, '#1c1420'); }
    for (let x = W * .44; x < W * .87; x += 13) P(x, dy + 117, 2, 10, '#1c1420'); P(W * .44, dy + 119, W * .43, 1, '#1c1420');
    bg = c; bgKey = key; return c;
  }
  function draw(t) {
    if (!ov.classList.contains('on')) return;
    const dy = Math.round((H - BH) * 0.45);
    ctx.drawImage(background(dy), 0, 0);
    // étoiles qui scintillent
    for (let i = 0; i < 46; i++) { const x = (i * 97 + 13) % W, y = (i * 53) % Math.max(20, dy + 40); if (Math.sin(t / 600 + i * 1.7) > -.2) R(x, y, 1, 1, i % 3 ? '#c8b8e8' : '#ffffff'); }
    // le train traverse le pont, de droite à gauche, avec sa fumée
    const L = 150, tx = W + 30 - ((t / 45) % (W + L + 60)), ty = dy + 83;
    for (let i = 0; i < 9; i++) { const k = ((t / 90) + i) % 9, a = .45 - k * .045; if (a <= 0) continue; ctx.globalAlpha = a; const rr = 2 + k * .9 | 0, cx = tx + 6 + k * 6, cy = ty - 4 - k * 3 - k * k * .25;
      for (let q = -rr; q <= rr; q++) { const w = Math.floor(Math.sqrt(rr * rr - q * q)); R(cx - w, cy + q, w * 2 + 1, 1, '#f0c8be'); } }
    ctx.globalAlpha = 1;
    R(tx, ty, 28, 12, '#1c1420'); R(tx + 3, ty - 6, 6, 6, '#1c1420'); R(tx + 20, ty - 4, 8, 5, '#1c1420'); R(tx + 1, ty + 9, 26, 3, '#1c1420');   // locomotive
    R(tx - 2, ty + 4, 2, 2, '#fff2b0');                                                                        // phare
    for (let k = 0; k < 3; k++) { const wx = tx + 32 + k * 25; R(wx, ty + 1, 22, 11, '#1c1420'); for (let j = 0; j < 3; j++) R(wx + 3 + j * 7, ty + 3, 3, 3, '#fcd46a'); }
    // lucioles
    for (let i = 0; i < 18; i++) { const x = (i * 71 + Math.sin(t / 1300 + i) * 8 + W) % W, y = dy + 60 + (i * 37) % 60 + Math.sin(t / 900 + i * 2) * 3; ctx.globalAlpha = .4 + .5 * Math.max(0, Math.sin(t / 400 + i * 1.3)); R(x, y, 1, 1, '#fff2b0'); }
    ctx.globalAlpha = 1;
  }

  function showMenu() {
    phase = 'menu';
    $('#titleTap').style.display = 'none';
    const m = $('#titleMenu');
    m.innerHTML = titleMenu(hasSave, many).map((it, i) => `<button data-id="${it.id}" class="${it.main ? 'primaire' : ''}" style="animation-delay:${i * 70}ms"><span>${it.icon}</span>${it.label}</button>`).join('');
    m.style.display = '';
    m.querySelector('button')?.focus({ preventScroll: true });
  }
  function tap() {
    if (phase !== 'tap') return;
    audio.play('stars'); showMenu();
  }
  ov.addEventListener('pointerup', e => { if (phase === 'tap' && !e.target.closest('button')) tap(); });
  addEventListener('keydown', e => { if (ov.classList.contains('on') && phase === 'tap' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tap(); } });
  $('#titleMenu').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    audio.play('ui');
    const id = b.dataset.id;
    if (id === 'continue') onContinue();
    else if (id === 'new') onNew();
    else if (id === 'games') onGames();
    else if (id === 'settings') onSettings();
    else if (id === 'howto') $('#ovHowto').classList.add('on');
  };
  $('#howtoClose').onclick = () => { audio.play('ui'); $('#ovHowto').classList.remove('on'); };

  return {
    open(save) {
      if (save !== undefined) hasSave = save;
      ov.classList.add('on'); audio.setScreen('title');
      if (phase === 'menu') showMenu();
    },
    setSave(v, n = 1) { hasSave = v; many = n > 0; if (phase === 'menu') showMenu(); },
    close() { ov.classList.remove('on'); audio.setScreen(null); },
    isOpen: () => ov.classList.contains('on'),
    draw
  };
}
