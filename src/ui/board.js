import { CFG } from '../config.js';
// Panneau d'affichage du village : demandes à code couleur (chantier, fête, habitant, caravane),
// jauges du village et de la fête, jetons et déblocages de la caravane.
import { $ } from './dom.js';
import { ITEMS } from '../data/items.js';
import { KINDS, PROJECTS, FESTIVAL_GOAL, FESTIVALS, UNLOCKS } from '../data/requests.js';
import { dailyQuest, deliverDaily } from '../systems/daily.js';
import { ensureOrders, fulfillOrder, discardOrder, timeLeft, fmtDelay, currentProject, unlock } from '../systems/market.js';

export function createBoard(g, audio) {
  const body = $('#boardBody');
  let timer = null;
  const it = id => ITEMS[id] || { n: id, i: '❔', p: 0 };
  const bar = (v, max, col) => `<div class="bar"><i style="width:${Math.min(100, v / max * 100)}%;background:${col}"></i></div>`;

  function render() {
    const S = g.S, slots = ensureOrders(g), p = currentProject(S), F = S.festival;
    const legend = '<div class="legende">' + Object.values(KINDS).map(k => `<span style="--k:${k.color}">${k.i} ${k.n}</span>`).join('') + '</div>';
    const gauges = `<div class="jauges">
      <div class="jauge" style="--k:${KINDS.chantier.color}"><b>🔨 ${p ? p.n : 'Village reconstruit !'}</b>${p ? bar(S.village.progress, p.goal, KINDS.chantier.color) + `<small>${S.village.progress}/${p.goal} objets · chantier ${S.village.done.length + 1}/${PROJECTS.length}</small>` : ''}</div>
      <div class="jauge" style="--k:${KINDS.fete.color}"><b>🎉 ${FESTIVALS[S.season]}</b>${bar(F.pts, FESTIVAL_GOAL, KINDS.fete.color)}<small>${F.done ? 'Tout est prêt ✔' : `${F.pts}/${FESTIVAL_GOAL} objets avant la fin de la saison`}</small></div>
      <div class="jauge" style="--k:${KINDS.caravane.color}"><b>🐪 Caravane : ${S.caravan.tokens} jeton(s)</b><small>À échanger plus bas contre des graines, des animaux et des outils.</small></div>
    </div>`;
    const dq = dailyQuest(g), dH = dq ? `<h3>📌 Quête du jour</h3><div class="grid affiches"><div class="card affiche" style="--k:#4fb07a"><span class="pastille">📌</span><div class="t">${it(dq.item).i} ${dq.qty} × ${it(dq.item).n}</div><div><b>${dq.reward} $</b></div>`
      + (dq.done ? '<small>✅ Faite ! Nouvelle quête demain.</small>' : `<button data-daily="1" ${(S.inv[dq.item] || 0) >= dq.qty ? 'class="primaire"' : 'disabled'}>Livrer (${S.inv[dq.item] || 0}/${dq.qty})</button>`) + '</div></div>' : '';
    if (!CFG.BOARD_OPEN && !slots.length) { body.innerHTML = dH || '<p class="info">📌 Le panneau est vide pour l’instant. Repasse demain !</p>'; return; }
    const cards = '<div class="grid affiches">' + slots.map(s => {
      const o = s.order;
      if (!o) return `<div class="card affiche vide"><div class="t">📌 Emplacement libre</div><small>Nouvelle demande dans</small><b class="delai">${fmtDelay(timeLeft(g, s))}</b></div>`;
      const K = KINDS[o.kind] || KINDS.caravane, have = S.inv[o.item] || 0, ok = have >= o.qty;
      const bonus = o.kind === 'chantier' ? '+ jauge du village' : o.kind === 'fete' ? '+ jauge de la fête' : o.kind === 'habitant' ? '+ amitié ❤️' : `+ ${o.tokens} jeton(s) 🐪`;
      return `<div class="card affiche" style="--k:${K.color}"><span class="pastille">${K.i}</span><small>${o.bot}</small><div class="t">${it(o.item).i} ${o.qty} × ${it(o.item).n}</div>`
        + `<div>${o.price} $/u · <b>${o.qty * o.price} $</b></div><small>${bonus}</small>`
        + `<div class="row" style="margin:4px 0 0"><button data-give="${o.id}" ${ok ? 'class="primaire"' : 'disabled'}>Livrer (${have}/${o.qty})</button><button data-drop="${o.id}" aria-label="Retirer la demande">🗑️</button></div></div>`;
    }).join('') + '</div><p class="info">Une demande livrée ou retirée laisse sa place vide pendant 2 h.</p>';
    const caravan = '<h3>🐪 Caravane commerciale</h3><div class="grid">' + UNLOCKS.map(u => {
      const has = S.caravan.unlocked.includes(u.id);
      return `<div class="card" style="border-color:${KINDS.caravane.color}"><div class="t">${u.i} <b>${u.n}</b></div><small>${u.kind}</small>`
        + (has ? '<div>Débloqué ✔</div>' : `<div>${u.cost} jeton(s)</div><button data-unlock="${u.id}" ${S.caravan.tokens >= u.cost ? '' : 'disabled'}>Échanger</button>`) + '</div>';
    }).join('') + '</div>';
    body.innerHTML = dH + legend + gauges + cards + caravan;
  }
  body.addEventListener('click', e => {
    const d = e.target.dataset;
    if (d.daily) deliverDaily(g);
    else if (d.give) fulfillOrder(g, d.give);
    else if (d.drop) { discardOrder(g, d.drop); audio.play('ui'); }
    else if (d.unlock) unlock(g, d.unlock);
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
