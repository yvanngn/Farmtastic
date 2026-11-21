// Commandes tactiles : joystick analogique (gauche), bouton d'action + accès aux roues (droite).
import { $ } from './dom.js';

export function createControls(g, input, { onAct, onTools, onItems }) {
  // 21/11 : joystick « flottant » façon Brawl Stars. On pose le doigt n'importe où sur la moitié gauche de l'écran : le
  // joystick apparaît sous le doigt ; si le doigt sort du cercle, le joystick le suit ; au-delà d'une petite zone morte,
  // on avance à pleine vitesse dans la direction du doigt. Au relâchement, il revient à sa place, en transparence.
  // Un simple toucher (sans glisser) est renvoyé au jeu, comme avant (parler, ramasser, agir à portée).
  const stick = $('#stick'), knob = $('#knob'), cv = document.getElementById('game');
  const zone = document.createElement('div'); zone.id = 'joyZone'; document.getElementById('controls').prepend(zone);
  let id = null, cx = 0, cy = 0, R = 1, t0 = 0, sx = 0, sy = 0, moved = false;
  const DEAD = 0.22;
  const place = (x, y) => { stick.style.left = (x - R) + 'px'; stick.style.top = (y - R) + 'px'; stick.style.bottom = 'auto'; };
  const rest = () => { stick.style.left = stick.style.top = stick.style.bottom = ''; knob.style.transform = ''; stick.classList.remove('actif'); };
  function move(e) {
    let dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy);
    if (d > R) { cx += dx / d * (d - R); cy += dy / d * (d - R); place(cx, cy); dx = e.clientX - cx; dy = e.clientY - cy; d = R; }   // le joystick suit le doigt
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    if (Math.hypot(e.clientX - sx, e.clientY - sy) > 10) moved = true;
    if (d < R * DEAD) { input.keys.ax = input.keys.ay = 0; return; }
    input.keys.ax = dx / d; input.keys.ay = dy / d; g.player.target = null;   // pleine vitesse, direction du doigt
  }
  const start = e => {
    if (id !== null) return; e.preventDefault(); id = e.pointerId; try { e.target.setPointerCapture(id); } catch (_) {} g.joyMode = true;   // (une capture refusée ne doit pas bloquer le joystick)
    R = stick.getBoundingClientRect().width / 2 || 60; cx = e.clientX; cy = e.clientY; sx = cx; sy = cy; t0 = performance.now(); moved = false;
    place(cx, cy); stick.classList.add('actif'); knob.style.transform = ''; input.keys.ax = input.keys.ay = 0;
  };
  for (const el of [zone, stick]) {
    el.addEventListener('pointerdown', start);
    el.addEventListener('pointermove', e => { if (e.pointerId === id) move(e); });
    const end = e => {
      if (e.pointerId !== id) return; id = null; input.keys.ax = input.keys.ay = 0; rest();
      if (!moved && performance.now() - t0 < 300 && cv && e.type === 'pointerup') {   // simple toucher : on le transmet au jeu
        const o = { clientX: sx, clientY: sy, pointerType: e.pointerType || 'touch', pointerId: 9999, bubbles: true };
        cv.dispatchEvent(new PointerEvent('pointerdown', o)); window.dispatchEvent(new PointerEvent('pointerup', o));
      }
    };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }

  const press = (el, fn) => el.addEventListener('pointerdown', e => { e.preventDefault(); el.classList.add('presse'); fn(); setTimeout(() => el.classList.remove('presse'), 120); });
  // Bouton d'action : un appui = une action ; maintenu = l'action se répète (couper, miner…).
  const bAct = $('#bAct'); let rep = null;
  const stop = () => { clearInterval(rep); rep = null; bAct.classList.remove('presse'); };
  bAct.addEventListener('pointerdown', e => { e.preventDefault(); bAct.setPointerCapture(e.pointerId); bAct.classList.add('presse'); onAct(); clearInterval(rep); rep = setInterval(onAct, 340); });
  bAct.addEventListener('pointerup', stop); bAct.addEventListener('pointercancel', stop); bAct.addEventListener('lostpointercapture', stop);
  $('#bItems').onclick = onItems;   // les outils sont dans la barre du bas (hotbar.js)

  return {
    setAction(html) { const el = $('#bActIcon'); if (el.dataset.h !== html) { el.dataset.h = html; el.innerHTML = html; } },
    show() { $('#controls').style.display = ''; }
  };
}
