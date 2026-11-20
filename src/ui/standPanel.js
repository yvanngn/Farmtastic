// 19/11 : l'étal (façon Hay Day), sur la place du panneau : mes lots en vente (20/11 : prix libre, plus de délai affiché),
// les offres des habitants, les dernières ventes.
import { ITEMS } from '../data/items.js';
import { invOrder } from '../systems/inventory.js';
import { sellable } from '../systems/economy.js';
import { iconHTML } from './icons.js';
import { stand, used, STAND_CAP, priceRange, listItem, unlist, ensureOffers, buyOffer } from '../systems/stand.js';

export function createStandPanel(g, audio) {
  const ov = document.createElement('div');
  ov.id = 'ovStand'; ov.className = 'overlay';
  ov.innerHTML = '<div class="panel box sell-panel"><div class="row" style="justify-content:space-between;margin:0"><h2>🧺 Mon étal</h2><button id="standClose" aria-label="Fermer">✕</button></div><div id="standBody"></div></div>';
  document.body.appendChild(ov);
  const body = ov.querySelector('#standBody');
  let sel = null, n = 1, pu = 0, timer = 0;   // 20/11 : prix à l'unité réglable (façon Hay Day)
  ov.querySelector('#standClose').onclick = () => { audio.play('ui'); ov.classList.remove('on'); clearInterval(timer); };
  const mm = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')}`; };
  function render() {
    const S = g.S, st = stand(S), offers = ensureOffers(g), free = STAND_CAP - used(S);
    const ids = invOrder(S).filter(sellable);
    if (sel && !(S.inv[sel] > 0)) sel = null;
    const max = sel ? Math.max(1, Math.min(free, S.inv[sel])) : 1; n = Math.min(Math.max(1, n), max);
    const lots = st.lots.map((l, i) => `<div class="sell-row on"><span class="sell-ic">${iconHTML(l.id)}</span><div class="sell-n"><b>${l.n} × ${ITEMS[l.id].n}</b><small>${l.price} $ · ⏳ en vente</small></div><button data-un="${i}" class="mini">Retirer</button></div>`).join('');
    const pick = ids.map(id => `<button data-sel="${id}" class="st-it${sel === id ? ' on' : ''}" title="${ITEMS[id].n}">${iconHTML(id)}<small>×${S.inv[id]}</small></button>`).join('');
    let form = '<p class="info">Choisis un objet de ton sac à mettre en vente.</p>';
    if (sel) { const [lo, hi] = priceRange(sel); if (!pu) pu = ITEMS[sel].p; pu = Math.max(lo, Math.min(hi, pu));
      form = `<div class="st-form"><b>${ITEMS[sel].n}</b><div class="st-prix"><span>Quantité</span><button data-q="-1">−</button><b class="st-n">${n}</b><button data-q="1">+</button></div>
      <div class="st-prix"><span>Prix</span><button data-p="-1">−</button><input type="range" min="${lo}" max="${hi}" value="${pu}" data-range><button data-p="1">+</button><b>${pu} $</b> / u</div>
      <div class="st-total">Total : <b>${pu * n} $</b></div>
      <button data-list class="primaire" ${free > 0 ? '' : 'disabled'}>Mettre en vente</button></div>`; }
    const off = offers.map((o, i) => `<div class="sell-row"><span class="sell-ic">${iconHTML(o.id)}</span><div class="sell-n"><b>${o.n} × ${ITEMS[o.id].n}</b><small>vendu par ${o.who} · ${o.price} $</small></div><button data-buy="${i}" class="mini" ${S.money >= o.price ? '' : 'disabled'}>Acheter</button></div>`).join('');
    const log = st.log.slice(0, 8).map(x => `<li>${x.who} : ${x.n} × ${ITEMS[x.id]?.n || x.id} → ${x.v} $</li>`).join('');
    body.innerHTML = `<p class="info">Les habitants passent et achètent de temps en temps. Moins c’est cher, plus ça part vite ; plus c’est cher, plus il faut être patient.</p>
      <h3>En vente</h3>${lots || '<p class="info">Rien pour l’instant.</p>'}
      <h3>Ajouter</h3><div class="st-pick">${pick || '<p class="info">Rien à vendre dans ton sac.</p>'}</div>${form}
      <h3>🛒 Offres des habitants</h3>${off || '<p class="info">Plus rien aujourd’hui. Repasse demain.</p>'}
      ${log ? `<h3>Dernières ventes</h3><ul class="sell-log">${log}</ul>` : ''}`;
  }
  body.addEventListener('input', e => { if (e.target.dataset.range != null) { pu = +e.target.value; const b = e.target.parentElement.querySelector('b:last-of-type'); if (b) b.textContent = pu + ' $'; const t = body.querySelector('.st-total b'); if (t) t.textContent = pu * n + ' $'; } });
  body.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; const d = b.dataset; audio.play('ui');
    if (d.sel) { sel = d.sel; n = 1; pu = 0; }
    else if (d.p) pu += +d.p;
    else if (d.q) n += +d.q;
    else if (d.list != null) { if (listItem(g, sel, n, pu / ITEMS[sel].p)) n = 1; }
    else if (d.un) unlist(g, +d.un);
    else if (d.buy) buyOffer(g, +d.buy);
    render();
  });
  return { open() { ov.classList.add('on'); render(); } };   // 20/11 : plus de minuterie affichée (la jauge de prix ne saute plus)
}
