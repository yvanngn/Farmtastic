// Fenêtre « réparation » devant un bâtiment délabré : jauges de bois et de pierres, coche verte quand c'est plein.
import { REPAIRS } from '../data/repairs.js';
import { repairNear, repairState, isRepaired, needOf, isPlankPile } from '../systems/repair.js';

const ICON = { wood: '🪵', stone: '🪨' }, NAME = { wood: 'Bois', stone: 'Pierres' };

export function createRepairPanel(g) {
  const el = document.createElement('div');
  el.id = 'repairPanel'; el.hidden = true; document.body.appendChild(el);
  let shownId = null, doneUntil = 0;
  g.bus.on('repaired', id => { shownId = id; doneUntil = performance.now() + 2500; render(id, true); });
  function render(id, done) {
    const R = REPAIRS[id], st = repairState(g.S, id);
    el.innerHTML = `<b>${done ? '✅ ' : '🔨 '}${(id === 'house' || id === 'grange') && isPlankPile(g.S) ? `Le tas de planches (${id === 'house' ? 'cabane' : 'grange'})` : R.n} ${done ? 'est réparée !' : ''}</b>`
      + Object.entries(needOf(g.S, id)).map(([k, need]) => {
        const v = Math.min(need, st[k] || 0), full = v >= need;
        return `<div class="rp-row"><span>${ICON[k]} ${NAME[k]}</span><div class="rp-bar"><i style="width:${v / need * 100}%"></i></div><span class="rp-n">${full ? '<em>✔</em>' : `${v}/${need}`}</span><span class="rp-sac" title="Dans ton sac">🎒 ${g.S.inv[k] || 0}</span></div>`;   // 19/11 : ce qu'il reste dans le sac, en même temps
      }).join('')
      + (done ? '' : `<small>Reste à apporter : ${Object.entries(needOf(g.S, id)).map(([k, n]) => `${Math.max(0, n - (st[k] || 0))} ${ICON[k]}`).join(' · ')}</small>`
        + ((g.S.tips && g.S.tips.hammer) ? '' : `<small>Prends le marteau 🔨 (roue des outils) et reste appuyé sur le bâtiment : il prend le bois et les pierres de ton sac.</small>`));
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
