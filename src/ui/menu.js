// Menu : sac, fabrication, boutique, forge, marché, liens.
import { $ } from './dom.js';
import { iconHTML } from './icons.js';
import { CFG } from '../config.js';
import { ITEMS } from '../data/items.js';
import { ANIMALS } from '../data/animals.js';
import { RECIPES } from '../data/recipes.js';
import { TOOLS } from '../data/items.js';
import { TIER_NAMES, UPGRADABLE, MAX_TIER } from '../data/tools.js';
import { BUILDINGS } from '../data/buildings.js';
import { build, canBuild, canBuyAnimal, homeCount, buy, buyAnimal, buyBag, bagCost, buyStack, stackCost, STACKS, canCraft, craft } from '../systems/economy.js';
import { consume } from '../systems/player.js';
import { hearts } from '../systems/social.js';
import { slots, usedSlots, stackSize } from '../systems/inventory.js';
import { canUpgrade, upgradeTool, miningLevel, nextXp, toolTier } from '../systems/skills.js';

const TABS = { sac: 'Sac', craft: 'Atelier', shop: 'Boutique', forge: 'Forge', social: 'Liens' };
const TITLES = { market: '🏪 Marché', upgrades: '🧰 Magasin d\'amélioration', carpenter: '🪚 Charpentier', animals: '🐾 Marchand d\'animaux' };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const it = id => ITEMS[id] || { n: id, i: '❔', p: 0 };

export function createMenu(g, opts) {
  const { online, audio } = opts;
  let tab = 'sac';
  const card = (h, cls = '') => `<div class="card ${cls}">${h}</div>`;
  const views = {
    sac(S) {
      const ids = Object.keys(S.inv);
      return `<p class="info">${usedSlots(S)}/${slots(S)} cases utilisées · ${stackSize(S)} objets max par case</p>` + (ids.length ? '<div class="grid">' + ids.map(id => card(`<div class="t">${it(id).i} <b>${it(id).n}</b></div><div>×${S.inv[id]} · ${Math.ceil(S.inv[id] / stackSize(S))} case(s) · ${it(id).p}🪙/u</div>${it(id).eat ? `<button data-use="${id}">Utiliser</button>` : ''}`)).join('') + '</div>' : 'Sac vide.');
    },
    craft(S) {
      return '<div class="grid">' + RECIPES.map((r, i) => card(`<div class="t">${it(r.out).i} <b>${it(r.out).n}</b> ×${r.q}</div><div>${Object.entries(r.in).map(([k, n]) => `${it(k).i}${n} <small>(${S.inv[k] || 0})</small>`).join(' ')}</div><button data-craft="${i}" ${canCraft(S, r) ? '' : 'disabled'}>Fabriquer</button>`)).join('') + '</div>';
    },
    shop(S) {
      return '<div class="grid">'
        + Object.entries(ITEMS).filter(([, x]) => x.buy).map(([id, x]) => card(`<div class="t">${x.i} <b>${x.n}</b></div><div>${x.buy} 🪙</div><button data-buy="${id}" ${S.money >= x.buy ? '' : 'disabled'}>Acheter</button>`)).join('')
        + '</div><p class="info">Vente rapide : bac 📦 près de la maison. Meilleurs prix : onglet Marché.</p>';
    },
    forge(S) {
      const lvl = miningLevel(S), xp = S.skills.mining.xp, nx = nextXp(xp), pct = nx ? Math.round(xp / nx * 100) : 100;
      const why = { level: 'Niveau de minage insuffisant', money: "Pas assez d'argent", stone: 'Pas assez de pierre', max: 'Palier maximum' };
      return `<div class="xp"><b>⛏️ Minage niveau ${lvl}</b><span>${xp}${nx ? ' / ' + nx : ''} XP</span><div class="bar"><i style="width:${pct}%;background:linear-gradient(90deg,#c99a3a,#ffdf8a)"></i></div><small>Cassez des pierres pour gagner de l'expérience. Les gros rochers demandent une pioche Cuivre.</small></div>`
        + '<div class="grid">' + UPGRADABLE.map(id => {
          const t = TOOLS.find(x => x.id === id), ic = iconHTML(id), tier = toolTier(S, id), r = canUpgrade(S, id), c = r.cost;
          return card(`<div class="t">${ic} <b>${t.n}</b></div><div class="tierlbl t${tier}">${TIER_NAMES[tier]}</div>`
            + (tier >= MAX_TIER ? '<div>Palier maximum ✨</div>' : `<div>→ ${TIER_NAMES[tier + 1]}</div><div>${c.money}🪙 · ${c.stone}🪨 · niv. ${c.minLvl}</div><button data-up="${id}" ${r.ok ? '' : 'disabled'}>Améliorer</button>${r.ok ? '' : `<small>${why[r.why]}</small>`}`));
        }).join('') + '</div>';
    },
    carpenter(S) {
      const why = { money: "Pas assez d'argent", wood: 'Pas assez de bois', stone: 'Pas assez de pierre' };
      return '<p class="info">Les bâtiments se construisent au nord de l\'enclos, sur leur emplacement balisé.</p><div class="grid">' + Object.entries(BUILDINGS).map(([id, b]) => {
        const r = canBuild(S, id), c = b.cost;
        return card(`<div class="t">${b.i} <b>${b.n}</b></div><div>Pour les ${b.for} · ${b.cap} places</div>`
          + (S.built && S.built[id] ? '<div>Construit ✔</div>'
            : `<div>${c.money} 🪙 · ${c.wood} 🪵 <small>(${S.inv.wood || 0})</small> · ${c.stone} 🪨 <small>(${S.inv.stone || 0})</small></div><button data-build="${id}" ${r.ok ? '' : 'disabled'}>Construire</button>${r.ok ? '' : `<small>${why[r.why] || ''}</small>`}`));
      }).join('') + '</div>';
    },
    animals(S) {
      return '<div class="grid">' + Object.entries(ANIMALS).map(([id, a]) => {
        const r = canBuyAnimal(S, id), home = a.home && BUILDINGS[a.home];
        const why = { home: `Il faut d'abord ${home ? home.un : ''} (charpentier)`, full: home ? home.plein : '', money: "Pas assez d'argent" };
        return card(`<div class="t">${a.i} <b>${a.n}</b></div><div>${a.buy} 🪙${a.prod ? ` · ${it(a.prod).i} tous les ${a.every} j` : ' · compagnon'}</div>`
          + (home ? `<small>${home.i} ${home.n} : ${homeCount(S, a.home)}/${home.cap}</small>` : '<small>Vit en liberté</small>')
          + `<button data-animal="${id}" ${r.ok ? '' : 'disabled'}>Acheter</button>${r.ok ? '' : `<small>${why[r.why]}</small>`}`);
      }).join('') + '</div>';
    },
    upgrades(S) {
      const bc = bagCost(S), sc = stackCost(S), lvl = S.stackLvl || 0;
      const bag = slots(S) < CFG.INV_MAX
        ? card(`<div class="t">🎒 <b>Sac plus grand</b></div><div>+6 cases (${slots(S)} → ${slots(S) + 6})</div><div>${bc} 🪙</div><button data-bag="1" ${S.money >= bc ? '' : 'disabled'}>Acheter</button>`)
        : card('<div class="t">🎒 <b>Sac plus grand</b></div><div>Taille maximale ✨</div>');
      const pile = sc != null
        ? card(`<div class="t">📦 <b>Piles plus hautes</b></div><div>${stackSize(S)} → ${STACKS[lvl + 1]} objets par case</div><div>${sc} 🪙</div><button data-stack="1" ${S.money >= sc ? '' : 'disabled'}>Acheter</button>`)
        : card('<div class="t">📦 <b>Piles plus hautes</b></div><div>Piles maximales ✨</div>');
      return `<p class="info">Votre sac : ${slots(S)} cases, ${stackSize(S)} objets par case.</p><div class="grid">${bag}${pile}</div>`;
    },
    market(S) {
      return `<p class="info">Vendez vos produits aux autres joueurs, ou achetez les leurs. Les demandes du village sont sur le panneau d'affichage, à côté.</p>${players}`;
    },
    social(S) {
      const ids = Object.keys(S.social);
      return '<h3>Habitants</h3>' + (ids.length ? ids.map(id => `${g.npcs[id] ? esc(g.npcs[id].name) : id} : ${'❤️'.repeat(hearts(S.social[id]))} (${S.social[id].points})`).join('<br>') : "<p class=\"info\">Aucun habitant pour l'instant.</p>")
        + '<h3>Joueurs en ligne</h3>' + (Object.values(g.others).map(o => esc(o.name)).join('<br>') || `<p class="info">${online() ? "Personne d'autre." : 'Hors ligne.'}</p>`)
        + '<h3>Animaux</h3>' + (S.animals.map(a => `${ANIMALS[a.type].i} ${ANIMALS[a.type].n} : ${'❤️'.repeat(Math.round(a.love / 20)) || '🤍'} (${a.love}/100)`).join('<br>') || '<p class="info">Aucun animal.</p>');
    }
  };

  async function renderPlayers() {
    const box = $('#pm'); if (!box || !opts.market) return;
    const S = g.S, [list, mine] = await Promise.all([opts.market.list(), opts.market.mine()]);
    if (tab !== 'market' || !$('#pm')) return;
    const own = Object.keys(S.inv).filter(id => ITEMS[id]);
    const form = own.length ? `<div class="vente"><select id="mkItem">${own.map(id => `<option value="${id}">${it(id).i} ${it(id).n} (${S.inv[id]})</option>`).join('')}</select><input id="mkQty" type="number" min="1" value="1" inputmode="numeric" aria-label="Quantité"><input id="mkPrice" type="number" min="1" value="10" inputmode="numeric" aria-label="Prix unitaire"><button data-mksell="1">Mettre en vente</button></div>` : '';
    const others = list.filter(l => l.seller_id !== opts.market.uid);
    const offers = others.length ? '<div class="grid">' + others.map(l => card(`<div class="t">${it(l.item).i} <b>${l.qty} ${it(l.item).n}</b></div><div>${esc(l.seller_name)}</div><div>${l.price}🪙/u · ${l.qty * l.price}🪙</div><button data-mkbuy="${l.id}" ${S.money >= l.qty * l.price ? '' : 'disabled'}>Acheter</button>`)).join('') + '</div>' : '<p class="info">Aucune annonce pour le moment.</p>';
    const sold = mine.filter(m => m.status === 'sold' && !m.claimed).reduce((n, m) => n + m.qty * m.price, 0);
    const mineHtml = mine.filter(m => m.status === 'open').map(m => card(`<div class="t">${it(m.item).i} ${m.qty} ${it(m.item).n}</div><div>${m.price}🪙/u</div><button data-mkcancel="${m.id}">Retirer</button>`)).join('');
    box.innerHTML = form + '<h4>Annonces</h4>' + offers + '<h4>Mes ventes</h4>' + (mineHtml ? `<div class="grid">${mineHtml}</div>` : '<p class="info">Aucune annonce en cours.</p>') + `<button data-mkclaim="1" ${sold ? 'class="primaire"' : ''}>Encaisser${sold ? ' ' + sold + '🪙' : ''}</button>`;
    box.onclick = async e => {
      const d = e.target.dataset;
      if (d.mksell) await opts.market.sell($('#mkItem').value, +$('#mkQty').value, +$('#mkPrice').value);
      else if (d.mkbuy) await opts.market.buy(list.find(l => l.id === d.mkbuy));
      else if (d.mkcancel) await opts.market.cancel(mine.find(l => l.id === d.mkcancel));
      else if (d.mkclaim) await opts.market.claim();
      else return;
      render();
    };
  }

  const handlers = {
    use: id => consume(g, id), craft: i => craft(g, +i), buy: id => buy(g, id), animal: id => buyAnimal(g, id),
    bag: () => buyBag(g), build: id => build(g, id), stack: () => buyStack(g), up: id => upgradeTool(g, id)
  };
  function render() {
    $('#tabs').innerHTML = Object.entries(TABS).map(([k, v]) => `<button data-t="${k}" class="${k === tab ? 'on' : ''}">${v}</button>`).join('');
    $('#tabBody').innerHTML = views[tab](g.S);
    if (tab === 'market') renderPlayers();
  }
  $('#tabs').onclick = e => { const t = e.target.dataset.t; if (t) { tab = t; audio.play('ui'); render(); } };
  $('#tabBody').addEventListener('click', e => {
    for (const k in handlers) { const v = e.target.dataset[k]; if (v != null) { handlers[k](v); render(); return; } }
  });
  $('#bClose').onclick = () => $('#ovBag').classList.remove('on');
  // seul = ouvert depuis un lieu (halle du marché) : pas d'onglets
  return { open(t, seul) { if (t) tab = t; else if (tab in TITLES) tab = 'sac'; $('#tabs').hidden = !!seul; $('#menuTitle').textContent = seul ? (TITLES[t] || '🏪') : '📜 Menu'; $('#ovBag').classList.add('on'); render(); } };
}
