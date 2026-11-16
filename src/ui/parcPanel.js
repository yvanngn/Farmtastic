// Stands du parc : jauge de visée qui va et vient ; on appuie quand le curseur est dans la zone dorée (3 essais).
import { GAMES, AIM_ZONE, shoot } from '../systems/parc.js';

export function createParcPanel(g, audio) {
  const el = document.createElement('div');
  el.id = 'parcGame'; el.hidden = true;
  el.innerHTML = '<b id="pgTitle"></b><small id="pgTxt"></small><div class="pg-track"><i class="pg-zone"></i><i class="pg-cur"></i></div><div id="pgScore"></div><button id="pgShoot" class="primaire">🎯 Lancer !</button>';
  document.body.appendChild(el);
  const cur = el.querySelector('.pg-cur'), zone = el.querySelector('.pg-zone');
  zone.style.left = AIM_ZONE[0] * 100 + '%'; zone.style.width = (AIM_ZONE[1] - AIM_ZONE[0]) * 100 + '%';
  let raf = 0, t0 = 0, pos = 0, lock = 0, marks = [];
  const speed = () => 1.1 + (g.parcGame ? g.parcGame.tries * .35 : 0);   // de plus en plus vite
  function loop(now) {
    if (el.hidden) return;
    if (now > lock) pos = (Math.sin((now - t0) / 1000 * Math.PI * speed()) + 1) / 2;
    cur.style.left = `calc(${pos * 100}% - 3px)`;
    raf = requestAnimationFrame(loop);
  }
  function fire() {
    if (el.hidden || performance.now() < lock) return;
    const res = shoot(g, pos); marks.push(res === 'hit' || (res === 'end' && pos >= AIM_ZONE[0] && pos <= AIM_ZONE[1]) ? '✅' : '❌');
    el.querySelector('#pgScore').textContent = marks.join(' ');
    lock = performance.now() + 500;
    if (res === 'end') setTimeout(() => { el.hidden = true; }, 900);
  }
  el.querySelector('#pgShoot').addEventListener('pointerdown', e => { e.preventDefault(); fire(); });
  addEventListener('keydown', e => { if (!el.hidden && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); fire(); } });
  g.bus.on('parcGame', G => {
    el.querySelector('#pgTitle').textContent = GAMES[G.tile].n; el.querySelector('#pgTxt').textContent = GAMES[G.tile].txt + ' Appuie quand le curseur est dans la zone dorée.';
    marks = []; el.querySelector('#pgScore').textContent = ''; el.hidden = false; t0 = performance.now(); lock = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  });
  return { el };
}
