// Sac en cases (remplace la roue des objets) : on range à la main en faisant glisser une case sur une autre,
// « Tri auto » range par type. Toucher une case : son nom et ses actions (prendre en main, utiliser, déployer).
import { ITEMS } from '../data/items.js';
import { slots, usedSlots, stackSize, orderedCells, moveItem, autoSort, catOf, SORT_CATS } from '../systems/inventory.js';
import { consume } from '../systems/player.js';
import { deployTent } from '../systems/camp.js';
import { iconHTML } from './icons.js';

export function createInventoryGrid(g, audio) {
  const ov = document.createElement('div');
  ov.id = 'ovInv'; ov.className = 'overlay';
  ov.innerHTML = `<div class="panel box inv-panel">
    <div class="row" style="justify-content:space-between;margin:0"><h2>🎒 Sac</h2><button id="invClose" aria-label="Fermer">✕</button></div>
    <div class="inv-main"><div class="inv-grid" id="invGrid"></div>
      <div class="inv-side"><button id="invSort" title="Ranger par type">🔀<br>Tri auto</button><small id="invInfo"></small></div></div>
    <div class="inv-detail" id="invDetail"></div></div>`;
  document.body.appendChild(ov);
  const grid = ov.querySelector('#invGrid'), detail = ov.querySelector('#invDetail');
  let picked = null, drag = null;
  const close = () => { ov.classList.remove('on'); picked = null; };
  ov.querySelector('#invClose').onclick = () => { audio.play('ui'); close(); };
  ov.querySelector('#invSort').onclick = () => { autoSort(g.S); audio.play('ui'); render(); };

  function render() {
    const S = g.S, cells = orderedCells(S), n = Math.max(slots(S), cells.length);
    grid.innerHTML = Array.from({ length: n }, (_, i) => {
      const c = cells[i];
      if (!c) return '<div class="inv-cell vide" data-i="' + i + '"></div>';
      return `<button class="inv-cell${S.sel === c.id ? ' sel' : ''}${picked === c.id ? ' vu' : ''}" data-i="${i}" data-id="${c.id}" data-cat="${catOf(c.id)}" aria-label="${ITEMS[c.id]?.n || c.id}"><span>${iconHTML(c.id)}</span><b>${c.n}</b></button>`;
    }).join('');
    ov.querySelector('#invInfo').textContent = `${usedSlots(S)}/${slots(S)} cases · piles de ${stackSize(S)}`;
    const it = picked && ITEMS[picked];
    detail.innerHTML = it ? `<div><strong>${it.n}</strong><small>×${S.inv[picked] || 0} · ${it.p} 🪙/u · ${SORT_CATS[catOf(picked)]}</small></div>
      <div class="inv-acts"><button data-a="hand">✋ En main</button>${it.eat ? '<button data-a="eat">😋 Manger</button>' : ''}${it.tent ? '<button data-a="tent" class="primaire">⛺ Déployer</button>' : ''}${picked === 'chest' || picked === 'campfire' || picked === 'chaudron' ? '<button data-a="place" class="primaire">📍 Poser</button>' : ''}</div>`
      : '<small>Touche une case pour voir l’objet. Fais glisser une case sur une autre pour ranger.</small>';
  }
  detail.onclick = e => {
    const a = e.target.closest('button')?.dataset.a; if (!a || !picked) return;
    audio.play('ui');
    if (a === 'hand') { g.S.sel = picked; g.bus.emit('inv'); close(); }
    else if (a === 'eat') { consume(g, picked); if (!g.S.inv[picked]) picked = null; render(); }
    else if (a === 'tent') { if (deployTent(g)) close(); }
    else if (a === 'place') { g.S.sel = picked; g.bus.emit('inv'); g.bus.emit('toast', '📍 Touche une case libre juste à côté de toi pour le poser.'); close(); }
  };
  // glisser-déposer (souris et doigt)
  grid.addEventListener('pointerdown', e => {
    const b = e.target.closest('.inv-cell[data-id]'); if (!b) return;
    drag = { id: b.dataset.id, x: e.clientX, y: e.clientY, moved: false, ghost: null };
    grid.setPointerCapture(e.pointerId);
  });
  grid.addEventListener('pointermove', e => {
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) {
      drag.moved = true;
      drag.ghost = document.createElement('div'); drag.ghost.className = 'inv-ghost'; drag.ghost.innerHTML = iconHTML(drag.id); document.body.appendChild(drag.ghost);
    }
    if (drag.ghost) { drag.ghost.style.left = e.clientX + 'px'; drag.ghost.style.top = e.clientY + 'px'; }
  });
  grid.addEventListener('pointerup', e => {
    if (!drag) return;
    const d = drag; drag = null;
    if (d.ghost) d.ghost.remove();
    if (!d.moved) { picked = d.id; audio.play('ui'); render(); return; }
    const over = document.elementFromPoint(e.clientX, e.clientY)?.closest('.inv-cell');
    if (over && over.dataset.id !== d.id) { moveItem(g.S, d.id, over.dataset.id || null); audio.play('ui'); }
    render();
  });
  grid.addEventListener('pointercancel', () => { if (drag?.ghost) drag.ghost.remove(); drag = null; });
  return { open() { picked = null; render(); ov.classList.add('on'); }, close, isOpen: () => ov.classList.contains('on') };
}
