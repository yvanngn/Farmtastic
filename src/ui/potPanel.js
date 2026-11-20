// 20/11 : le chaudron, façon Breath of the Wild : on choisit jusqu'à 5 ingrédients dans le sac, « Cuire », et on découvre le plat.
import { ITEMS } from '../data/items.js';
import { POT_RECIPES } from '../data/patterns.js';
import { iconHTML } from './icons.js';
import { cookPot, POT_MAX } from '../systems/pots.js';
const INGREDIENTS = () => [...new Set(Object.values(POT_RECIPES).flatMap(r => Object.keys(r.in)))];

export function createPotPanel(g, audio) {
  const ov = document.createElement('div');
  ov.id = 'ovPot'; ov.className = 'overlay';
  ov.innerHTML = '<div class="panel box"><div class="row" style="justify-content:space-between;margin:0"><h2>🍲 Le chaudron</h2><button id="potClose" aria-label="Fermer">✕</button></div><div id="potBody"></div></div>';
  document.body.appendChild(ov);
  const body = ov.querySelector('#potBody'); let picks = {};
  const close = () => ov.classList.remove('on');
  ov.querySelector('#potClose').onclick = () => { audio.play('ui'); close(); };
  const count = () => Object.values(picks).reduce((a, b) => a + b, 0);
  function render() {
    const S = g.S, ids = INGREDIENTS().filter(id => (S.inv[id] || 0) > 0 || picks[id]);
    const slots = Object.entries(picks).flatMap(([id, n]) => Array(n).fill(id));
    body.innerHTML = `<p class="info">Mets des ingrédients dans le chaudron (${POT_MAX} au plus), puis fais cuire. Tu découvriras ce que ça donne !</p>
      <div class="pot-slots">${Array.from({ length: POT_MAX }, (_, i) => `<button data-out="${slots[i] || ''}" class="pot-slot">${slots[i] ? iconHTML(slots[i]) : ''}</button>`).join('')}</div>
      <div class="st-pick">${ids.map(id => `<button data-in="${id}" class="st-it" title="${ITEMS[id].n}" ${(S.inv[id] || 0) - (picks[id] || 0) > 0 && count() < POT_MAX ? '' : 'disabled'}>${iconHTML(id)}<small>×${(S.inv[id] || 0) - (picks[id] || 0)}</small></button>`).join('') || '<p class="info">Aucun ingrédient dans ton sac (baies, mûres, farine…).</p>'}</div>
      <button data-cook class="primaire" ${count() ? '' : 'disabled'}>🔥 Cuire</button>`;
  }
  body.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; const d = b.dataset; audio.play('ui');
    if (d.in) picks[d.in] = (picks[d.in] || 0) + 1;
    else if (d.out) { picks[d.out]--; if (!picks[d.out]) delete picks[d.out]; }
    else if (d.cook != null) { if (g.potOpen && cookPot(g, g.potOpen, picks)) { picks = {}; close(); return; } }
    render();
  });
  return { open() { picks = {}; ov.classList.add('on'); render(); } };
}
