// Panneau d'affichage du village : demandes à livrer, emplacements vides avec compte à rebours.
import { $ } from './dom.js';
import { ITEMS } from '../data/items.js';
import { ensureOrders, fulfillOrder, discardOrder, timeLeft, fmtDelay } from '../systems/market.js';

export function createBoard(g, audio) {
  const body = $('#boardBody');
  let timer = null;
  const it = id => ITEMS[id] || { n: id, i: '❔', p: 0 };

  function render() {
    const S = g.S, slots = ensureOrders(g);
    body.innerHTML = '<div class="grid affiches">' + slots.map(s => {
      const o = s.order;
      if (!o) return `<div class="card affiche vide"><div class="t">📌 Emplacement libre</div><small>Nouvelle demande dans</small><b class="delai">${fmtDelay(timeLeft(g, s))}</b></div>`;
      const have = S.inv[o.item] || 0, ok = have >= o.qty;
      return `<div class="card affiche"><small>${o.bot}</small><div class="t">${it(o.item).i} ${o.qty} × ${it(o.item).n}</div>`
        + `<div>${o.price} 🪙/u · <b>${o.qty * o.price} 🪙</b></div><small>Bac : ${it(o.item).p} 🪙/u</small>`
        + `<div class="row" style="margin:4px 0 0"><button data-give="${o.id}" ${ok ? 'class="primaire"' : 'disabled'}>Livrer (${have}/${o.qty})</button><button data-drop="${o.id}" aria-label="Retirer la demande">🗑️</button></div></div>`;
    }).join('') + '</div><p class="info">Une demande livrée ou retirée laisse sa place vide pendant 2 h.</p>';
  }
  body.addEventListener('click', e => {
    const d = e.target.dataset;
    if (d.give) fulfillOrder(g, d.give);
    else if (d.drop) { discardOrder(g, d.drop); audio.play('ui'); }
    else return;
    render();
  });
  const close = () => { $('#ovBoard').classList.remove('on'); clearInterval(timer); };
  $('#boardClose').onclick = close;
  return {
    open() { render(); $('#ovBoard').classList.add('on'); clearInterval(timer); timer = setInterval(render, 15000); },
    close
  };
}
