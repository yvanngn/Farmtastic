import { FISH, ZONE_NAMES } from '../data/fish.js';
import { deployTent } from '../systems/camp.js';
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
import { SHOPS } from '../data/shops.js';
import { QUESTS, questProgress, questVisible } from '../systems/quests.js';
import { journal, setJournalTab, storySoFar } from '../systems/journal.js';
import { isUnlocked } from '../systems/market.js';
import { canRepairBench, repairBench } from '../systems/economy.js';
import { WORKBENCH } from '../data/buildings.js';
import { craftHand, canCraftHand } from '../systems/cooking.js';
import { buyPattern, hasPattern } from '../systems/pots.js';
import { PATTERNS, POT_RECIPES } from '../data/patterns.js';
import { JOBS } from '../data/jobs.js';
import { jobXp, jobLevel, jobNext } from '../systems/jobs.js';
import { HAND_RECIPES, RECIPE_CATS } from '../data/recipes.js';
import { recipeOpen } from '../systems/level.js';
import { build, canBuild, canBuyAnimal, homeCount, buy, buyAnimal, buyBag, bagCost, buyStack, stackCost, STACKS, canCraft, craft } from '../systems/economy.js';
import { consume } from '../systems/player.js';
import { SHEETS } from '../render/sheets.js';
import { dollPortrait } from '../render/paperdoll.js';
import { folkPortrait } from '../render/folk.js';
import { hearts, POINTS_PER_HEART, DEGREES, DEGREE_NAMES, tasteOf } from '../systems/social.js';
import { ITEMS as ALL_ITEMS } from '../data/items.js';
import { slots, usedSlots, stackSize } from '../systems/inventory.js';
import { canUpgrade, upgradeTool, miningLevel, nextXp, toolTier, hasTool } from '../systems/skills.js';

const JTABS = { journal: '📝 Activités', quests: '⭐ Quêtes en cours', social: '💞 Liens', histoire: '📖 Histoire' };   // 19/11 : onglets du journal
const TABS = { sac: 'Sac', recettes: '📜 Recettes', poissons: '🐟 Poissons', quests: 'Quêtes', metiers: '🧑‍🔧 Métiers', forge: 'Forge', social: 'Liens' };
const TITLES = { recettes: '📜 Recettes', poissons: '🐟 Carnet de pêche', market: '🏪 Marché', upgrades: '🧰 Magasin d\'amélioration', carpenter: '🪚 Charpentier', workshop: '🛠️ Établi', animals: '🐾 Marchand d\'animaux', bakery: '🥖 Boulangerie', igorShop: '⚒️ Boutique d’Igor', butcher: '🥩 Boucherie', fishmonger: '🐟 Poissonnerie' };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const it = id => ITEMS[id] || { n: id, i: '❔', p: 0 };

export function createMenu(g, opts) {
  const { online, audio } = opts;
  let tab = 'sac', recCat = 'feu', jmode = false;
  const card = (h, cls = '') => `<div class="card ${cls}">${h}</div>`;
  // grille d'achat d'un commerce (×1 et ×5)
  const shopGrid = (S, id) => '<div class="grid">' + SHOPS[id].sells.filter(k => isUnlocked(S, k)).map(k => { const x = it(k);
    return card(`<div class="t">${iconHTML(k)} <b>${x.n}</b></div><div>${x.buy} $${x.eat ? ' · se mange' : ''}</div><div class="row" style="margin:0"><button data-buy="${k}" ${S.money >= x.buy ? '' : 'disabled'}>Acheter</button><button data-buy5="${k}" ${S.money >= x.buy * 5 ? '' : 'disabled'}>×5</button></div>`); }).join('') + '</div>';
  const patternGrid = (S, shop) => { const ps = Object.entries(PATTERNS).filter(([, p]) => p.shop === shop); if (!ps.length) return '';
    return '<h3>📜 Patrons</h3><div class="grid">' + ps.map(([id, p]) => { const r = p.pot ? POT_RECIPES[p.recipe] : HAND_RECIPES[p.recipe], o = it(r.out), own = hasPattern(S, id);
      return card(`<div class="t">📜 <b>${p.n}</b></div><div>${o.i} ${o.n} : ${Object.entries(r.in).map(([k, n]) => `${iconHTML(k)}${n}`).join(' ')}</div><div>${p.price} $ · ${JOBS[p.job].i} ${JOBS[p.job].n}${p.pot ? ' · chaudron 🍲' : ''}</div>${own ? '<small>✅ Déjà appris</small>' : p.soon ? '<button disabled>⏳ Bientôt</button>' : `<button data-pattern="${id}" ${S.money >= p.price ? '' : 'disabled'}>Acheter le patron</button>`}`); }).join('') + '</div>'; };
  const views = {
    igorShop: S => `<p class="info">Patrons et outils du forgeron.</p>${patternGrid(S, 'forge')}${shopGrid(S, 'forge')}`,
    bakery: S => `<p class="info">Farine et patrons : le pain se prépare au chaudron.</p>${patternGrid(S, 'bakery')}${shopGrid(S, 'bakery')}`,
    butcher: S => `<p class="info">De la bonne viande pour vos futurs plats.</p>${patternGrid(S, 'butcher')}${shopGrid(S, 'butcher')}`,
    fishmonger: S => `<p class="info">Arrivage du jour.</p>${patternGrid(S, 'fishmonger')}${shopGrid(S, 'fishmonger')}`,
    poissons(S) {
      const L = S.fishLog || {}, got = FISH.filter(f => L[f.id]).length, SAI = ['Printemps', 'Été', 'Automne', 'Hiver'], hh = m => `${Math.floor(m / 60) % 24}h`;
      const when = w => `${SAI[w.season]} j${w.day}, an ${w.year || 1}, ${hh(w.minute)} · ${ZONE_NAMES[w.zone] || w.zone}`;
      return `<p class="info">Carnet de pêche : ${got}/${FISH.length} espèces.</p><div class="fish-list">` + FISH.map(f => { const e = L[f.id];
        return e ? `<div class="fish-row"><span class="fi">${f.i}</span><div><b>${f.n}</b> <small>×${e.n} · record ${e.best} cm · ${f.p} $</small>
          <small>Où : ${f.zones.map(z => ZONE_NAMES[z]).join(', ')} · ${f.seasons.map(s => SAI[s]).join(', ')} · de ${hh(f.from)} à ${hh(f.to)}</small>
          <small>1re prise : ${when(e.first)}${e.last && e.n > 1 ? ` · dernière : ${when(e.last)}` : ''}</small></div></div>`
          : `<div class="fish-row inconnu"><span class="fi">❔</span><div><b>???</b> <small>On dit qu'il vit dans ${f.zones.map(z => ZONE_NAMES[z]).join(' ou ')}.</small></div></div>`; }).join('') + '</div>';
    },
    recettes(S) {
      const known = (S.recipes || []).filter(id => HAND_RECIPES[id]);
      const cats = Object.keys(RECIPE_CATS).filter(c => known.some(id => HAND_RECIPES[id].cat === c));
      if (!cats.includes(recCat)) recCat = cats[0];
      const tabsH = '<div class="rec-tabs">' + cats.map(c => `<button data-rcat="${c}" class="${c === recCat ? 'on' : ''}">${RECIPE_CATS[c]}</button>`).join('') + '</div>';
      return '<p class="info">Les recettes que tu connais, rangées par type. On les fabrique n\'importe où, avec ce qu\'on a sur soi.</p>' + tabsH + '<div class="grid">' + known.filter(id => HAND_RECIPES[id].cat === recCat).map(id => { const r = HAND_RECIPES[id];
        return card(`<div class="t">${iconHTML(r.out)} <b>${it(r.out).n}</b> ×${r.q}</div><div>${Object.entries(r.in).map(([k, n]) => `${iconHTML(k)}${n} <small>(${S.inv[k] || 0})</small>`).join(' ')}</div>${recipeOpen(S, r) ? `<button data-hcraft="${id}" ${canCraftHand(S, id) ? '' : 'disabled'}>Fabriquer</button>` : `<button disabled>🔒 Niveau ${r.lvl}</button>`}`); }).join('') + '</div>';
    },
    sac(S) {
      const ids = Object.keys(S.inv);
      return `<p class="info">${usedSlots(S)}/${slots(S)} cases utilisées · ${stackSize(S)} objets max par case</p>` + (ids.length ? '<div class="grid">' + ids.map(id => card(`<div class="t">${iconHTML(id)} <b>${it(id).n}</b></div><div>×${S.inv[id]} · ${Math.ceil(S.inv[id] / stackSize(S))} case(s) · ${it(id).p}$/u</div>${it(id).eat ? `<button data-use="${id}">Utiliser</button>` : it(id).tent ? `<button data-deploy="${id}" class="primaire">⛺ Déployer</button>` : ''}`)).join('') + '</div>' : 'Sac vide.');
    },
    workshop(S) { return '<p class="info">Ton établi, à la maison. D\'autres plans viendront plus tard.</p>' + views.craft(S); },
    craft(S) {
      return '<div class="grid">' + RECIPES.map((r, i) => card(`<div class="t">${iconHTML(r.out)} <b>${it(r.out).n}</b> ×${r.q}</div><div>${Object.entries(r.in).map(([k, n]) => `${iconHTML(k)}${n} <small>(${S.inv[k] || 0})</small>`).join(' ')}</div><button data-craft="${i}" ${canCraft(S, r) ? '' : 'disabled'}>Fabriquer</button>`)).join('') + '</div>';
    },
    forge(S) {
      const lvl = miningLevel(S), xp = S.skills.mining.xp, nx = nextXp(xp), pct = nx ? Math.round(xp / nx * 100) : 100;
      const why = { plans: 'Plans de forge : caravane 🐪', level: 'Niveau de minage insuffisant', money: "Pas assez d'argent", stone: 'Pas assez de pierre', max: 'Palier maximum' };
      return `<div class="xp"><b>⛏️ Minage niveau ${lvl}</b><span>${xp}${nx ? ' / ' + nx : ''} XP</span><div class="bar"><i style="width:${pct}%;background:linear-gradient(90deg,#c99a3a,#ffdf8a)"></i></div><small>Cassez des pierres pour gagner de l'expérience. Les gros rochers demandent une pioche Cuivre.</small></div>`
        + '<div class="grid">' + UPGRADABLE.filter(id => hasTool(S, id)).map(id => {
          const t = TOOLS.find(x => x.id === id), ic = iconHTML(id), tier = toolTier(S, id), r = canUpgrade(S, id), c = r.cost;
          return card(`<div class="t">${ic} <b>${t.n}</b></div><div class="tierlbl t${tier}">${TIER_NAMES[tier]}</div>`
            + (tier >= MAX_TIER ? '<div>Palier maximum ✨</div>' : `<div>→ ${TIER_NAMES[tier + 1]}</div><div>${c.money}$ · ${c.stone}🪨 · niv. ${c.minLvl}</div><button data-up="${id}" ${r.ok ? '' : 'disabled'}>Améliorer</button>${r.ok ? '' : `<small>${why[r.why]}</small>`}`));
        }).join('') + '</div>';
    },
    carpenter(S) {
      const why = { money: "Pas assez d'argent", wood: 'Pas assez de bois', stone: 'Pas assez de pierre' };
      return patternGrid(S, 'carpenter') + '<p class="info">Les bâtiments se construisent au nord de l\'enclos, sur leur emplacement balisé.</p><div class="grid">' + Object.entries(BUILDINGS).map(([id, b]) => {
        const r = canBuild(S, id), c = b.cost;
        return card(`<div class="t">${b.i} <b>${b.n}</b></div><div>Pour les ${b.for} · ${b.cap} places</div>`
          + (S.built && S.built[id] ? '<div>Construit ✔</div>'
            : `<div>${c.money} $ · ${c.wood} 🪵 <small>(${S.inv.wood || 0})</small> · ${c.stone} 🪨 <small>(${S.inv.stone || 0})</small></div><button data-build="${id}" ${r.ok ? '' : 'disabled'}>Construire</button>${r.ok ? '' : `<small>${why[r.why] || ''}</small>`}`));
      }).join('') + (() => {
        const r = canRepairBench(S), c = WORKBENCH.cost;
        return card(`<div class="t">${WORKBENCH.i} <b>${WORKBENCH.n}</b></div><div>L'établi de ta maison, pour fabriquer des objets</div>`
          + (S.workbench ? '<div>Réparé ✔</div>' : `<div>${c.money} $ · ${c.wood} 🪵 · ${c.stone} 🪨</div><button data-bench="1" ${r.ok ? '' : 'disabled'}>Réparer</button>${r.ok ? '' : `<small>${why[r.why] || ''}</small>`}`));
      })() + '</div>';
    },
    animals(S) {
      return shopGrid(S, 'feed') + '<h3>🐾 Animaux</h3><div class="grid">' + Object.entries(ANIMALS).filter(([id]) => isUnlocked(S, id)).map(([id, a]) => {
        const r = canBuyAnimal(S, id), home = a.home && BUILDINGS[a.home];
        const why = { home: `Il faut d'abord ${home ? home.un : ''} (charpentier)`, full: home ? home.plein : '', money: "Pas assez d'argent" };
        return card(`<div class="t">${a.i} <b>${a.n}</b></div><div>${a.buy} $${a.prod ? ` · ${iconHTML(a.prod)} tous les ${a.every} j` : ' · compagnon'}</div>`
          + (home ? `<small>${home.i} ${home.n} : ${homeCount(S, a.home)}/${home.cap}</small>` : '<small>Vit en liberté</small>')
          + `<button data-animal="${id}" ${r.ok ? '' : 'disabled'}>Acheter</button>${r.ok ? '' : `<small>${why[r.why]}</small>`}`);
      }).join('') + '</div>' + (['rabbit', 'pig', 'sheep'].some(k => !isUnlocked(S, k)) ? '<p class="info">D\'autres animaux arriveront avec la caravane 🐪 (panneau d\'affichage).</p>' : '');
    },
    upgrades(S) {
      const bc = bagCost(S), sc = stackCost(S), lvl = S.stackLvl || 0;
      const bag = slots(S) < CFG.INV_MAX
        ? card(`<div class="t">🎒 <b>Sac plus grand</b></div><div>+6 cases (${slots(S)} → ${slots(S) + 6})</div><div>${bc} $</div><button data-bag="1" ${S.money >= bc ? '' : 'disabled'}>Acheter</button>`)
        : card('<div class="t">🎒 <b>Sac plus grand</b></div><div>Taille maximale ✨</div>');
      const pile = true   // lot 13 : les piles ne s'achètent plus, c'est le centre de Golgolas qui les agrandit
        ? card(`<div class="t">📦 <b>Piles plus hautes</b></div><div>${stackSize(S)} objets par case</div><small>Elles s'agrandissent désormais au centre de Golgolas, au sud de la gare.</small>`)
        : sc != null
        ? card(`<div class="t">📦 <b>Piles plus hautes</b></div><div>${stackSize(S)} → ${STACKS[lvl + 1]} objets par case</div><div>${sc} $</div><button data-stack="1" ${S.money >= sc ? '' : 'disabled'}>Acheter</button>`)
        : card('<div class="t">📦 <b>Piles plus hautes</b></div><div>Piles maximales ✨</div>');
      return `<p class="info">Votre sac : ${slots(S)} cases, ${stackSize(S)} objets par case.</p><div class="grid">${bag}${pile}</div>`;
    },
    market(S) {
      const players = opts.market ? '<div id="pm"><p class="info">Chargement…</p></div>' : '<p class="info">Hors ligne : le marché entre joueurs a besoin de la connexion.</p>';
      return `<h3>${SHOPS.stall.i} ${SHOPS.stall.n}</h3>${patternGrid(S, 'stall')}${shopGrid(S, 'stall')}<h3>👥 Entre joueurs</h3><p class="info">Vendez vos produits aux autres joueurs, ou achetez les leurs. Les demandes du village sont sur le panneau d'affichage, à côté.</p>${players}`;
    },
    metiers(S) {
      return '<p class="info">Tout le monde peut pratiquer tous les métiers. On gagne de l’expérience en fabriquant (patrons achetés dans les magasins) et en cuisinant au chaudron.</p><div class="grid">' + Object.entries(JOBS).map(([id, j]) => {
        const xp = jobXp(S, id), l = jobLevel(xp), nx = jobNext(xp);
        return card(`<div class="t">${j.i} <b>${j.n}</b></div><div>Niveau ${l}/10</div><div class="bar"><i style="width:${nx ? Math.min(100, xp / nx * 100) : 100}%"></i></div><small>${nx ? `${xp}/${nx} XP` : 'Niveau max'}</small>`); }).join('') + '</div>';
    },
    quests(S) {
      const dn = (S.year - 1) * 112 + S.season * 28 + S.day;
      const one = id => {
        const { q, done, cur } = questProgress(S, id);
        return card(`<div class="t" style="font-size:1.1em">${q.i} <b>${q.n}</b></div><ol class="etapes">` + q.steps.map((st, i) =>
          `<li class="${done[i] ? 'fait' : i === cur ? 'encours' : 'avenir'}">${done[i] ? '✔ ' : i === cur ? '▸ ' : ''}${i <= cur || done[i] ? esc(st.t) : '???'}${st.locked && !done[i] && i === cur ? ' <small>(bientôt)</small>' : ''}</li>`).join('') + '</ol>');
      };
      const ids = Object.keys(QUESTS).filter(id => questVisible(S, id) && (dn >= (QUESTS[id].from || 0) || Object.keys(S.quests?.[id] || {}).length))
        .sort((a, b) => (QUESTS[b].order || 0) - (QUESTS[a].order || 0));   // « Premiers pas » en tête
      const col = (t, list) => `<div><h3>${t}</h3>${list.map(one).join('') || '<p class="info">Aucune pour l’instant.</p>'}</div>`;
      return `<div class="quetes-cols">${col('⭐ Quêtes principales', ids.filter(id => QUESTS[id].main))}${col('📋 Quêtes secondaires', ids.filter(id => !QUESTS[id].main))}</div>`;
    },
    journal(S) {   // 19/11 : les 200 dernières activités, les plus récentes en haut
      const L = journal(S).log;
      return `<p class="info">📓 Les ${L.length} dernières activités (200 au plus).</p><ul class="journal">` + L.slice().reverse().map(e => `<li><small>${esc(e.w)}</small> ${esc(e.t)}</li>`).join('') + '</ul>' + (L.length ? '' : '<p class="info">Rien encore… La page est blanche.</p>');
    },
    histoire(S) {
      const H = storySoFar(S);
      return '<p class="info">📖 Ce que tu as vécu à Farmwest jusqu’ici.</p>' + (H.map(c => card(`<div class="t">${c.i} <b>${esc(c.n)}</b>${c.fini ? ' ✔' : ''}</div><ol class="etapes">${c.steps.map(t => `<li class="fait">${esc(t)}</li>`).join('')}</ol>`)).join('') || '<p class="info">Ton histoire ne fait que commencer.</p>');
    },
    social(S) {
      const ids = Object.keys(S.social);
      // fiche de chaque habitant : cœurs, goûts découverts par degré, ce qu'on sait de sa vie
      const fiche = id => {
        const n = g.npcs[id], r = S.social[id]; if (!n) return '';
        const h = hearts(r), pts = Math.max(0, r.points), known = r.known || {};
        const all = Object.keys(ALL_ITEMS), unknown = all.filter(k => !(k in known) && tasteOf(n, k) !== 'neutre').length;
        const rows = DEGREES.map(d => { const its = Object.keys(known).filter(k => known[k] === d); return its.length ? `<b>${DEGREE_NAMES[d]}</b><span>${its.map(k => it(k).i + ' ' + it(k).n).join(', ')}</span>` : ''; }).join('');
        const life = (r.seen || []).map(i => n.story && n.story[i] ? `<li>${esc(n.story[i].t)}</li>` : '').join('');
        const pp = n.look && (folkPortrait(n.look) || dollPortrait(n.look)), Z = 2;   // portrait : haut du corps de face, dessiné par le code (poupée)
        const pic = pp ? `<div class="portrait" style="width:${pp.w * Z}px;height:${pp.h * Z}px;background:url(${pp.url}) 0 0/100% 100% no-repeat;image-rendering:pixelated"></div>` : '';
        return card(`<div class="pnj"><div class="tete">${pic}<div class="nom" style="color:${n.color}">${esc(n.name)}</div></div>
          <div>${'❤️'.repeat(h) + '🤍'.repeat(Math.max(0, 10 - h))}</div>
          <small>${pts % POINTS_PER_HEART}/${POINTS_PER_HEART} vers le prochain cœur · aujourd'hui : ${r.talked ? '💬 ✔' : '💬 —'} ${r.gifted ? '🎁 ✔' : '🎁 —'}</small>
          <h4>Goûts découverts</h4>${rows ? `<div class="gouts">${rows}</div>` : '<p class="info">Offrez-lui des objets pour découvrir ses goûts.</p>'}
          ${unknown ? `<small>${unknown} goût(s) marqué(s) encore à découvrir.</small>` : ''}
          ${life ? `<h4>Ce que je sais ${n.de || 'de lui'}</h4><ul class="vie">${life}</ul>` : ''}</div>`);
      };
      return '<h3>Habitants</h3>' + (ids.length ? ids.map(fiche).join('') : "<p class=\"info\">Aucun habitant pour l'instant.</p>")
        + '<h3>Joueurs en ligne</h3>' + (Object.values(g.others).map(o => esc(o.name)).join('<br>') || `<p class="info">${online() ? "Personne d'autre." : 'Hors ligne.'}</p>`)
        + '<h3>Animaux</h3>' + (S.animals.map(a => `${ANIMALS[a.type].i} ${ANIMALS[a.type].n} : ${'❤️'.repeat(Math.round(a.love / 20)) || '🤍'} (${a.love}/100)`).join('<br>') || '<p class="info">Aucun animal.</p>');
    }
  };

  async function renderPlayers() {
    const box = $('#pm'); if (!box || !opts.market) return;
    const S = g.S, [list, mine] = await Promise.all([opts.market.list(), opts.market.mine()]);
    if (tab !== 'market' || !$('#pm')) return;
    const own = Object.keys(S.inv).filter(id => ITEMS[id]);
    const form = own.length ? `<div class="vente"><select id="mkItem">${own.map(id => `<option value="${id}">${iconHTML(id)} ${it(id).n} (${S.inv[id]})</option>`).join('')}</select><input id="mkQty" type="number" min="1" value="1" inputmode="numeric" aria-label="Quantité"><input id="mkPrice" type="number" min="1" value="10" inputmode="numeric" aria-label="Prix unitaire"><button data-mksell="1">Mettre en vente</button></div>` : '';
    const others = list.filter(l => l.seller_id !== opts.market.uid);
    const offers = others.length ? '<div class="grid">' + others.map(l => card(`<div class="t">${iconHTML(l.item)} <b>${l.qty} ${it(l.item).n}</b></div><div>${esc(l.seller_name)}</div><div>${l.price}$/u · ${l.qty * l.price}$</div><button data-mkbuy="${l.id}" ${S.money >= l.qty * l.price ? '' : 'disabled'}>Acheter</button>`)).join('') + '</div>' : '<p class="info">Aucune annonce pour le moment.</p>';
    const sold = mine.filter(m => m.status === 'sold' && !m.claimed).reduce((n, m) => n + m.qty * m.price, 0);
    const mineHtml = mine.filter(m => m.status === 'open').map(m => card(`<div class="t">${iconHTML(m.item)} ${m.qty} ${it(m.item).n}</div><div>${m.price}$/u</div><button data-mkcancel="${m.id}">Retirer</button>`)).join('');
    box.innerHTML = form + '<h4>Annonces</h4>' + offers + '<h4>Mes ventes</h4>' + (mineHtml ? `<div class="grid">${mineHtml}</div>` : '<p class="info">Aucune annonce en cours.</p>') + `<button data-mkclaim="1" ${sold ? 'class="primaire"' : ''}>Encaisser${sold ? ' ' + sold + '$' : ''}</button>`;
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
    use: id => consume(g, id), deploy: () => { if (deployTent(g)) $('#ovBag').classList.remove('on'); }, craft: i => craft(g, +i), hcraft: id => craftHand(g, id), rcat: c => { recCat = c; }, buy: id => buy(g, id), pattern: id => buyPattern(g, id), buy5: id => buy(g, id, 5), animal: id => buyAnimal(g, id),
    bag: () => buyBag(g), bench: () => repairBench(g), build: id => build(g, id), stack: () => buyStack(g), up: id => upgradeTool(g, id)
  };
  function render() {
    $('#tabs').innerHTML = Object.entries(jmode ? JTABS : TABS).map(([k, v]) => `<button data-t="${k}" class="${k === tab ? 'on' : ''}">${v}</button>`).join('');
    const G = g.S.game, code = G && G.mode === 'multi' && G.code && !$('#tabs').hidden ? `<p class="info code-partie">👥 Code pour rejoindre la partie : <b>${esc(G.code)}</b></p>` : '';
    $('#tabBody').innerHTML = code + views[tab](g.S);
    if (tab === 'market') renderPlayers();
  }
  $('#tabs').onclick = e => { const t = e.target.dataset.t; if (t) { tab = t; if (jmode) setJournalTab(g.S, t); audio.play('ui'); render(); } };   // 19/11 : l'onglet du journal est gardé dans la sauvegarde
  $('#tabBody').addEventListener('click', e => {
    for (const k in handlers) { const v = e.target.dataset[k]; if (v != null) { handlers[k](v); render(); return; } }
  });
  $('#bClose').onclick = () => $('#ovBag').classList.remove('on');
  // seul = ouvert depuis un lieu (halle du marché) : pas d'onglets
  return { openJournal() { jmode = true; tab = journal(g.S).tab || 'journal'; $('#tabs').hidden = false; $('#menuTitle').textContent = '📓 Journal'; $('#ovBag').classList.add('on'); render(); },
    open(t, seul) { jmode = false; if (t) tab = t; else if (tab in TITLES) tab = 'sac'; $('#tabs').hidden = !!seul; $('#menuTitle').textContent = seul ? (TITLES[t] || '🏪') : '📜 Menu'; $('#ovBag').classList.add('on'); render(); } };
}
