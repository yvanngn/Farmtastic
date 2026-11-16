import { versionLabel } from '../version.js';
// Écran titre façon Witch'rok : décor de ferme animé dessiné par le code,
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
const SKY = ['#3b3f8c', '#4f56a6', '#6a6fbc', '#8a86c8', '#b293c6', '#d9a2b8', '#f2b7a0', '#ffcf9a', '#ffe0a8'];

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

  function draw(t) {
    if (!ov.classList.contains('on')) return;
    const dy = Math.round((H - BH) * 0.45), band = Math.ceil((dy + BH * 0.62) / SKY.length);
    SKY.forEach((c, i) => { R(0, i * band, W, band + 1, c); if (i) for (let x = (i % 2) * 2; x < W; x += 4) R(x, i * band, 1, 1, SKY[i - 1]); });
    ctx.save(); ctx.translate(0, dy);
    // soleil levant + rayons
    const sx = W * 0.7 | 0, sy = 50;
    ctx.globalAlpha = 0.18;
    for (let k = 0; k < 12; k++) { const a = t / 9000 + k * Math.PI / 6; for (let l = 18; l < 60; l += 2) R(sx + Math.cos(a) * l, sy + Math.sin(a) * l, 2, 2, '#fff2c0'); }
    disc(sx, sy, 22, '#ffe7a8'); ctx.globalAlpha = 1;
    disc(sx, sy, 13, '#fff1b8'); disc(sx - 3, sy - 3, 8, '#fffbe6');
    cloud(t / 260, 22, 1); cloud(t / 380 + 150, 36, 1); cloud(t / 200 + 260, 14, 1);
    // collines : le lointain glisse doucement
    hill(78, 7, 0.03, 4, 0.071, t / 900, '#7d7fb8');
    hill(86, 6, 0.045, 3, 0.11, t / 600, '#5d8f7a');
    hill(93, 4, 0.02, 2, 0.09, 0, '#4f9a4c');
    for (const [fx, r] of [[0.06, 7], [0.14, 6], [0.5, 5], [0.9, 7], [0.97, 6]]) tree(W * fx | 0, 92, r);
    const gy = 100;
    R(0, gy - 2, W, 4, '#6cbf55');
    barn(W * 0.22 | 0, gy); windmill(W * 0.8 | 0, gy, t);
    // champ au premier plan
    R(0, gy + 2, W, H, '#7a5232');
    for (let row = 0, y = gy + 4; y < H; row++, y += 5 + row) {
      R(0, y + 2, W, 2, '#5f3e25');
      const wheat = row % 2 === 0;
      for (let x = (row % 2) * 3; x < W; x += 6) {
        const sway = Math.round(Math.sin(t / 700 + x * 0.15 + row) * 0.8);
        if (wheat) { R(x + sway, y - 3 - row / 2, 1, 4 + row / 2, '#c9a23e'); R(x + sway - 1, y - 4 - row / 2, 3, 2, '#f2cf5a'); }
        else { R(x, y - 1, 4, 3, '#3f8a45'); R(x + 1, y - 2, 2, 2, '#73c25e'); }
      }
    }
    // clôture
    for (let x = 2; x < W; x += 12) { R(x, gy - 6, 2, 9, '#e6d3b0'); R(x + 1, gy - 6, 1, 9, '#b8a07a'); }
    R(0, gy - 4, W, 1, '#e6d3b0'); R(0, gy - 1, W, 1, '#e6d3b0');
    // oiseaux
    for (let k = 0; k < 3; k++) { const bx = ((t / 50 + k * 70) % (W + 40)) - 20, by = 30 + k * 7 + Math.sin(t / 300 + k) * 3, f = (t / 180 + k) % 2 < 1; R(bx - 2, by - (f ? 1 : 0), 2, 1, '#3a2f4a'); R(bx + 1, by - (f ? 1 : 0), 2, 1, '#3a2f4a'); R(bx, by, 1, 1, '#3a2f4a'); }
    ctx.restore();
    // pollen doré
    for (const p of pollen) {
      const x = (p.x + Math.sin(t / 900 + p.p) * 6) % W, y = ((p.y - t / (90 * p.s)) % H + H) % H;
      ctx.globalAlpha = 0.45 + 0.45 * Math.sin(t / 300 + p.p); R(x, y, 1, 1, '#ffe9a0');
    }
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
