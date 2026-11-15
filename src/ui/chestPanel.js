// Fenêtre d'un coffre : le sac à gauche, le coffre à droite ; toucher une case déplace une pile (ou tout, avec « Tout »).
import { ITEMS } from '../data/items.js';
import { invOrder, stackSize } from '../systems/inventory.js';
import { store, takeOut, pickUpChest, CHEST_CELLS } from '../systems/chests.js';
import { iconHTML } from './icons.js';

export function createChestPanel(g, audio) {
  const ov = document.createElement('div');
  ov.id = 'ovChest'; ov.className = 'overlay';
  ov.innerHTML = '<div class="panel box chest-panel"><div class="row" style="justify-content:space-between;margin:0"><h2>📦 Coffre</h2><button id="chClose" aria-label="Fermer">✕</button></div><div id="chBody"></div></div>';
  document.body.appendChild(ov);
  const body = ov.querySelector('#chBody');
  let cur = null, all = false;
  const close = () => { ov.classList.remove('on'); cur = null; };
  ov.querySelector('#chClose').onclick = () => { audio.play('ui'); close(); };
  const cell = (id, n, side) => `<button class="inv-cell" data-s="${side}" data-id="${id}" aria-label="${ITEMS[id]?.n || id}"><span>${iconHTML(id)}</span><b>${n}</b></button>`;
  function render() {
    const S = g.S, c = cur; if (!c) return;
    const bag = invOrder(S).filter(id => !(id === 'chest' && false)).map(id => cell(id, S.inv[id], 'sac')).join('');
    const box = Object.entries(c.items).map(([id, n]) => cell(id, n, 'coffre')).join('');
    const used = Object.values(c.items).reduce((a, n) => a + Math.ceil(n / stackSize(S)), 0);
    body.innerHTML = `<p class="info">Touche une case pour la déplacer (une pile de ${stackSize(S)}). <label><input type="checkbox" id="chAll" ${all ? 'checked' : ''}> tout d’un coup</label></p>
      <div class="chest-cols"><div><h3>🎒 Sac</h3><div class="inv-grid">${bag || '<small>Vide</small>'}</div></div>
      <div><h3>📦 Coffre <small>${used}/${CHEST_CELLS} cases</small></h3><div class="inv-grid">${box || '<small>Vide</small>'}</div></div></div>
      <div class="sell-foot"><span></span><button id="chPick" ${Object.keys(c.items).length ? 'disabled' : ''}>Reprendre le coffre</button></div>`;
  }
  body.addEventListener('click', e => {
    if (e.target.id === 'chAll') { all = e.target.checked; return; }
    if (e.target.closest('#chPick')) { audio.play('ui'); if (pickUpChest(g, cur)) close(); return; }
    const b = e.target.closest('.inv-cell[data-id]'); if (!b || !cur) return;
    const id = b.dataset.id, st = stackSize(g.S);
    const moved = b.dataset.s === 'sac' ? store(g, cur, id, all ? g.S.inv[id] : st) : takeOut(g, cur, id, all ? cur.items[id] : st);
    audio.play(moved ? 'collect' : 'denied'); g.bus.emit('inv'); render();
  });
  return { open(c) { cur = c; render(); ov.classList.add('on'); }, isOpen: () => ov.classList.contains('on') };
}
