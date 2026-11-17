// Bac de vente : on coche ce qu'on vend et la quantité ; total affiché avant de vendre ; historique des ventes.
import { ITEMS } from '../data/items.js';
import { sellItems, sellable } from '../systems/economy.js';
import { invOrder } from '../systems/inventory.js';
import { iconHTML } from './icons.js';
import { SEASONS } from '../data/look.js';

export function createSellPanel(g, audio) {
  const ov = document.createElement('div');
  ov.id = 'ovSell'; ov.className = 'overlay';
  ov.innerHTML = '<div class="panel box sell-panel"><div class="row" style="justify-content:space-between;margin:0"><h2>📦 Bac de vente</h2><button id="sellClose" aria-label="Fermer">✕</button></div><div id="sellBody"></div></div>';
  document.body.appendChild(ov);
  const body = ov.querySelector('#sellBody');
  let pick = {}, showLog = false;
  ov.querySelector('#sellClose').onclick = () => { audio.play('ui'); ov.classList.remove('on'); };
  function render() {
    const S = g.S, ids = invOrder(S).filter(sellable);
    const total = ids.reduce((a, id) => a + (pick[id] || 0) * ITEMS[id].p, 0);
    const rows = ids.map(id => { const n = pick[id] || 0, it = ITEMS[id];
      return `<div class="sell-row${n ? ' on' : ''}"><span class="sell-ic">${iconHTML(id)}</span><div class="sell-n"><b>${it.n}</b><small>×${S.inv[id]} · ${it.p} $/u</small></div>
        <div class="sell-q"><button data-m="${id}" aria-label="moins">−</button><b>${n}</b><button data-p="${id}" aria-label="plus">+</button><button data-a="${id}" class="mini">Tout</button></div></div>`; }).join('');
    const log = (S.saleLog || []).map(x => `<li>${SEASONS[x.season]} j${x.day} : ${x.n} × ${ITEMS[x.id]?.n || x.id} → ${x.v} $</li>`).join('');
    body.innerHTML = `<div class="sell-tabs"><button data-t="0" class="${showLog ? '' : 'on'}">Vendre</button><button data-t="1" class="${showLog ? 'on' : ''}">📜 Ventes passées</button></div>`
      + (showLog ? (log ? `<ul class="sell-log">${log}</ul>` : '<p class="info">Rien vendu pour l’instant.</p>')
        : (ids.length ? `<div class="sell-list">${rows}</div><div class="sell-foot"><span>Total : <b>${total} $</b></span><button data-clear>Rien</button><button data-sell class="primaire" ${total ? '' : 'disabled'}>Vendre la sélection</button></div>`
          : '<p class="info">Rien à vendre dans ton sac. (Les outils, la tente et le sac à dos ne se vendent pas ici.)</p>'));
  }
  body.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const d = b.dataset, S = g.S; audio.play('ui');
    if (d.t != null) showLog = d.t === '1';
    else if (d.p) pick[d.p] = Math.min(S.inv[d.p] || 0, (pick[d.p] || 0) + 1);
    else if (d.m) pick[d.m] = Math.max(0, (pick[d.m] || 0) - 1);
    else if (d.a) pick[d.a] = pick[d.a] === S.inv[d.a] ? 0 : S.inv[d.a];
    else if ('clear' in d) pick = {};
    else if ('sell' in d) { sellItems(g, pick); pick = {}; }
    render();
  });
  return { open() { pick = {}; showLog = false; render(); ov.classList.add('on'); }, isOpen: () => ov.classList.contains('on') };
}
