// Commandes tactiles : joystick analogique (gauche), bouton d'action + accès aux roues (droite).
import { $ } from './dom.js';

export function createControls(g, input, { onAct, onTools, onItems }) {
  const stick = $('#stick'), knob = $('#knob');
  let id = null, cx = 0, cy = 0, R = 1;

  function move(e) {
    let dx = e.clientX - cx, dy = e.clientY - cy;
    const d = Math.hypot(dx, dy), m = Math.min(d, R);
    if (d > 0) { dx = dx / d * m; dy = dy / d * m; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    const dead = d < R * 0.18;
    input.keys.ax = dead ? 0 : dx / R; input.keys.ay = dead ? 0 : dy / R;
    if (!dead) g.player.target = null;
  }
  stick.addEventListener('pointerdown', e => {
    e.preventDefault(); id = e.pointerId; stick.setPointerCapture(id); g.joyMode = true;   // 19/11 : on joue au joystick → plus de déplacement au toucher de l'écran
    const r = stick.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; R = r.width / 2;
    stick.classList.add('actif'); move(e);
  });
  stick.addEventListener('pointermove', e => { if (e.pointerId === id) move(e); });
  const end = e => { if (e.pointerId !== id) return; id = null; input.keys.ax = input.keys.ay = 0; knob.style.transform = ''; stick.classList.remove('actif'); };
  stick.addEventListener('pointerup', end); stick.addEventListener('pointercancel', end);

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
