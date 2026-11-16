// Fenêtre « réparation » devant un bâtiment délabré : jauges de bois et de pierres, coche verte quand c'est plein.
import { REPAIRS } from '../data/repairs.js';
import { repairNear, repairState, isRepaired } from '../systems/repair.js';

const ICON = { wood: '🪵', stone: '🪨' }, NAME = { wood: 'Bois', stone: 'Pierres' };

export function createRepairPanel(g) {
  const el = document.createElement('div');
  el.id = 'repairPanel'; el.hidden = true; document.body.appendChild(el);
  let shownId = null, doneUntil = 0;
  g.bus.on('repaired', id => { shownId = id; doneUntil = performance.now() + 2500; render(id, true); });
  function render(id, done) {
    const R = REPAIRS[id], st = repairState(g.S, id);
    el.innerHTML = `<b>${done ? '✅ ' : '🔨 '}${R.n} ${done ? 'est réparée !' : 'est délabrée'}</b>`
      + Object.entries(R.need).map(([k, need]) => {
        const v = Math.min(need, st[k] || 0), full = v >= need;
        return `<div class="rp-row"><span>${ICON[k]} ${NAME[k]}</span><div class="rp-bar"><i style="width:${v / need * 100}%"></i></div><span class="rp-n">${full ? '<em>✔</em>' : `${v}/${need}`}</span></div>`;
      }).join('')
      + (done ? '' : `<small>Il faut ${R.need.wood} bois et ${R.need.stone} pierres sur toi. Prends le marteau 🔨 (roue des outils) et reste appuyé sur le bâtiment.</small>`);
    el.classList.toggle('done', done); el.hidden = false;
  }
  return {
    update(active) {
      if (performance.now() < doneUntil) return;
      const id = active ? repairNear(g.S) : null;
      if (!id || isRepaired(g.S, id)) { el.hidden = true; shownId = null; return; }
      shownId = id; render(id, false);
    }
  };
}
