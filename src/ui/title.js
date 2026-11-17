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

  function draw(t) {
    if (!ov.classList.contains('on')) return;
    const dy = Math.round((H - BH) * 0.45), band = Math.ceil((dy + BH * 0.62) / SKY.length);
    SKY.forEach((c, i) => { R(0, i * band, W, band + 1, c); if (i) for (let x = (i % 2) * 2; x < W; x += 4) R(x, i * band, 1, 1, SKY[i - 1]); });
    ctx.save(); ctx.translate(0, dy);
    // grand soleil couchant posé sur l'horizon + rayons
    const sx = W * 0.62 | 0, sy = 76;
    ctx.globalAlpha = 0.16;
    for (let k = 0; k < 12; k++) { const a = t / 9000 + k * Math.PI / 6; for (let l = 26; l < 80; l += 2) R(sx + Math.cos(a) * l, sy + Math.sin(a) * l, 2, 2, '#ffe2a0'); }
    disc(sx, sy, 30, '#ffc070'); ctx.globalAlpha = 1;
    disc(sx, sy, 20, '#ffd27a'); disc(sx - 4, sy - 4, 12, '#ffe8a8');
    for (let k = 0; k < 4; k++) R(sx - 22, sy + 6 + k * 4, 44, 1, SKY[6]);   // bandes de chaleur
    // mesas (buttes rouges à sommet plat), la lointaine glisse doucement
    const mesa = (x0, w, h, top, col, shadow) => { R(x0, 96 - h, w, h + 4, col); R(x0 - 3, 96 - h + 3, 3, h, col); R(x0 + w, 96 - h + 5, 4, h, col); R(x0 + w - 6, 96 - h, 6, h + 4, shadow); R(x0 - 1, 96 - h - 1, w + 2, top, shade2(col)); };
    const shade2 = c => c === '#8a3e3a' ? '#a24e40' : '#c26a48';
    const off = (t / 120) % (W + 160);
    mesa(((W * .05 - off) % (W + 160) + W + 160) % (W + 160) - 80, 46, 24, 2, '#8a3e3a', '#6e2e2e');
    mesa(W * .72 | 0, 58, 30, 3, '#a8503e', '#7e3a30'); mesa(W * .3 | 0, 30, 16, 2, '#8a3e3a', '#6e2e2e');
    const gy = 100;
    // désert ocre au premier plan, touffes sèches et cailloux
    R(0, 94, W, H, '#c98a4a');
    for (let k = 0; k < 6; k++) R(0, 96 + k * 9, W, 2, k % 2 ? '#b8783e' : '#d89a58');
    for (let x = 5; x < W; x += 17) { const y = gy + 8 + (x * 7) % 30; R(x, y, 1, 3, '#8a6a2a'); R(x + 2, y - 1, 1, 4, '#a07a30'); R(x + 4, y, 1, 3, '#8a6a2a'); }
    for (let x = 11; x < W; x += 29) { const y = gy + 14 + (x * 13) % 26; R(x, y, 4, 2, '#a07858'); R(x, y, 2, 1, '#d8b088'); }
    // cactus
    const cactus = (x, gy2, h) => { R(x, gy2 - h, 5, h, '#3f7a3a'); R(x + 1, gy2 - h, 2, h, '#5aa04a'); R(x - 5, gy2 - h * .6, 5, 3, '#3f7a3a'); R(x - 5, gy2 - h * .95, 3, h * .38, '#3f7a3a'); R(x + 5, gy2 - h * .45, 5, 3, '#3f7a3a'); R(x + 7, gy2 - h * .8, 3, h * .38, '#3f7a3a'); R(x - 1, gy2, 7, 2, 'rgba(60,30,10,.35)'); };
    cactus(W * .08 | 0, gy + 18, 26); cactus(W * .9 | 0, gy + 12, 20); cactus(W * .48 | 0, gy + 2, 12);
    barn(W * .2 | 0, gy); windmill(W * .8 | 0, gy, t);
    // clôture de ranch
    for (let x = 2; x < W; x += 12) { R(x, gy - 6, 2, 9, '#8a5a32'); R(x + 1, gy - 6, 1, 9, '#5b3a22'); }
    R(0, gy - 4, W, 1, '#a8774a'); R(0, gy - 1, W, 1, '#a8774a');
    // virevoltant (tumbleweed) qui roule et rebondit
    { const tx = ((t / 14) % (W + 60)) - 30, ty = gy + 22 - Math.abs(Math.sin(t / 260)) * 8, a = t / 140;
      for (let k = 0; k < 14; k++) { const ang = a + k * 0.9, rr = 3 + (k % 3); R(tx + Math.cos(ang) * rr, ty + Math.sin(ang) * rr, 1, 1, k % 2 ? '#8a6a3a' : '#b8925a'); } }
    // vautours au loin
    for (let k = 0; k < 2; k++) { const bx = W * .3 + Math.cos(t / 2400 + k * 3) * 26, by = 28 + k * 9 + Math.sin(t / 1900 + k) * 4, f = (t / 260 + k) % 2 < 1; R(bx - 3, by - (f ? 1 : 0), 3, 1, '#2a1a2a'); R(bx, by, 1, 1, '#2a1a2a'); R(bx + 1, by - (f ? 1 : 0), 3, 1, '#2a1a2a'); }
    ctx.restore();
    // poussière dorée qui flotte
    for (const p of pollen) {
      const x = (p.x + Math.sin(t / 900 + p.p) * 6) % W, y = ((p.y - t / (90 * p.s)) % H + H) % H;
      ctx.globalAlpha = 0.45 + 0.45 * Math.sin(t / 300 + p.p); R(x, y, 1, 1, '#ffd9a0');
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
