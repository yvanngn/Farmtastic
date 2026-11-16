// Combat de pêche (façon Stardew) : jauge verticale, zone verte qu'on fait monter en restant appuyé (clic, doigt, Espace),
// le poisson qui bouge, et la barre de prise à droite.
import { BAR } from '../systems/fishing.js';

export function createFishPanel(g, audio) {
  const el = document.createElement('div');
  el.id = 'fishFight'; el.hidden = true;
  el.innerHTML = '<div class="ff-track"><i class="ff-bar"></i><b class="ff-fish">🐟</b></div><div class="ff-prog"><i></i></div><small>Reste appuyé pour monter</small>';
  document.body.appendChild(el);
  const bar = el.querySelector('.ff-bar'), fish = el.querySelector('.ff-fish'), prog = el.querySelector('.ff-prog i');
  let raf = 0;
  const hold = v => e => { if (!el.hidden) { g.fishHold = v; e.preventDefault?.(); } };
  el.addEventListener('pointerdown', hold(true)); addEventListener('pointerup', hold(false)); addEventListener('pointercancel', hold(false));
  addEventListener('keydown', e => { if (!el.hidden && (e.key === ' ' || e.key === 'Enter')) { g.fishHold = true; e.preventDefault(); } });
  addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') g.fishHold = false; });
  function draw() {
    const F = g.fishing;
    if (!F || F.phase !== 'fight') { el.hidden = true; g.fishHold = false; return; }
    const st = F.fight;
    bar.style.height = BAR * 100 + '%'; bar.style.bottom = st.bar * 100 + '%';
    fish.style.bottom = `calc(${st.fy * 100}% - 12px)`; fish.textContent = F.fish.i;
    const inside = st.fy >= st.bar && st.fy <= st.bar + BAR; bar.classList.toggle('dedans', inside);
    prog.style.height = st.prog * 100 + '%'; prog.style.background = st.prog > .66 ? '#6fd04a' : st.prog > .33 ? '#f0a020' : '#ff4a3a';
    raf = requestAnimationFrame(draw);
  }
  g.bus.on('fishFight', () => { el.hidden = false; cancelAnimationFrame(raf); draw(); });
  g.bus.on('fishEnd', () => { el.hidden = true; g.fishHold = false; });
  return { el };
}
