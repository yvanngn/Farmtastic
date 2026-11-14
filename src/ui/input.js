// Clavier (ZQSD / WASD / flèches) + tactile/souris (toucher pour aller, glisser pour planter/récolter).
import { farmAction } from '../systems/farming.js';
import { attack, enemyAt } from '../systems/combat.js';
import { isHouse } from '../world/map.js';
import { dirFrom } from '../systems/movement.js';

const MAP = { z: 'up', w: 'up', arrowup: 'up', s: 'down', arrowdown: 'down', q: 'left', a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right' };

export function createInput(cv, g, renderer, { isActive, onMenu }) {
  const keys = { up: false, down: false, left: false, right: false };
  addEventListener('keydown', e => {
    const k = MAP[e.key.toLowerCase()]; if (k) keys[k] = true;
    if (e.key.toLowerCase() === 'e' && isActive()) onMenu();
  });
  addEventListener('keyup', e => { const k = MAP[e.key.toLowerCase()]; if (k) keys[k] = false; });

  let dragging = false, dragMode = false, lastTile = null;
  cv.addEventListener('pointerdown', e => {
    if (!isActive()) return;
    const { tx, ty } = renderer.screenToTile(e), S = g.S;
    dragging = true; lastTile = tx + ',' + ty;
    if (S.sel === 'sword') {
      const en = enemyAt(g, tx + .5, ty + .5);
      if (en) {
        if (Math.hypot(en.x - S.x, en.y - S.y) < 1.8) { S.dir = dirFrom(en.x - S.x, en.y - S.y); attack(g, en); }
        else g.player.target = { tx, ty, reach: 1.4 };
        return;
      }
    }
    dragMode = farmAction(g, tx, ty);
    if (!dragMode) g.player.target = { tx, ty, reach: isHouse(tx, ty) ? 2.5 : 1.4 };
  });
  cv.addEventListener('pointermove', e => {
    if (!dragging || !dragMode) return;
    const { tx, ty } = renderer.screenToTile(e), k = tx + ',' + ty;
    if (k !== lastTile) { lastTile = k; farmAction(g, tx, ty); }
  });
  addEventListener('pointerup', () => { dragging = dragMode = false; });
  return { keys };
}
