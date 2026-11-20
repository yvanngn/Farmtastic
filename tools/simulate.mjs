// 20/11 (demande de l'utilisateur) : moteur de simulation rapide de Farmwest.
// Il « joue » des journées entières en accéléré avec un joueur-type (hypothèses en tête de fichier, modifiables),
// en lisant les VRAIES valeurs du jeu (src/data, src/systems, src/config) : rien n'est recopié, donc chaque réglage
// du jeu se voit directement dans le résumé. Sortie : docs/SIMULATION.md (lisible, à adapter).
// Lancer : node tools/simulate.mjs [jours=120] [graine=12345]
import { writeFileSync } from 'node:fs';
import { CFG } from '../src/config.js';
import { LEVELS, XP, MAX_LEVEL } from '../src/systems/level.js';
import { upgradeCost, energyCost, MINING_GAIN, MINING_XP, TIER_NAMES } from '../src/data/tools.js';
import { level as miningLevelOf } from '../src/systems/skills.js';
import { REPAIRS, REPAIR_STEP } from '../src/data/repairs.js';
import { REPAIR_ENERGY } from '../src/systems/repair.js';
import { TREE_KINDS, STUMP_DAYS, STUMP_HP, STUMP_WOOD, TREE_GROW_DAYS, FOREST } from '../src/data/forest.js';
import { TREE_HP, ROCK_HPS, genObjects } from '../src/world/map.js';
import { NATURE } from '../src/data/nature.js';
import { BORDER_HP, BORDER_STONES } from '../src/systems/quarry.js';
import { CROPS } from '../src/data/crops.js';
import { ITEMS } from '../src/data/items.js';
import { HAND_RECIPES } from '../src/data/recipes.js';
import { OVEN_COST } from '../src/systems/resto.js';
import { SEED_GIFT } from '../src/systems/mail.js';
import { FOREST_TREE_HP } from '../src/systems/blockers.js';

const DAYS = +(process.argv[2] || 120), SEED = +(process.argv[3] || 12345);

// ---------- Hypothèses sur le joueur-type (à adapter) ----------
const P = {
  bedtime: 22 * 60,        // se couche à 22 h (le jeu commence à 6 h)
  walkTree: 3,             // s d'un arbre à l'autre
  walkRock: 2,             // s d'un caillou à l'autre (carrière)
  tripQuarry: 40,          // s aller-retour ferme ↔ carrière (une fois par jour où il y va)
  tripTown: 90,            // s aller-retour en ville (vendre, acheter des graines, plans, forge)
  sowPerSquare: 0.4,       // s pour semer un carré (on glisse le doigt)
  tillPerSquare: 1.2,      // s pour bêcher un carré
  fieldMax: 120,           // carrés de champ au maximum (place libre sur la ferme)
  introS: 240,             // s d'intro le premier jour (train, diligence, explications)
  sellPrice: 1,            // × prix de base à l'étal (vendu pendant la nuit)
  grind: true,             // une fois les objectifs atteints, il continue à couper / casser (bois et pierres vendus à l'étal)
};
const ARBRES_FORET = 60;   // 💡 arbres adultes de la forêt, une fois ouverte (estimation, à remplacer par la vraie forêt)

// ---------- Valeurs lues dans le jeu ----------
const SEC_PER_MIN = CFG.MS_PER_MIN / 1000, HIT_S = CFG.HIT_MS / 1000;
const DAY_S = (P.bedtime - CFG.DAY_START) * SEC_PER_MIN;
const woodPerTree = (TREE_KINDS.oak.wood[0] + TREE_KINDS.oak.wood[1]) / 2, woodPerStump = (STUMP_WOOD[0] + STUMP_WOOD[1]) / 2;
const Q = NATURE.carriere, boulders = 92;
const levelOf = xp => { let l = 0; for (let i = 1; i < LEVELS.length; i++) if (xp >= LEVELS[i]) l = i; return Math.min(l, MAX_LEVEL); };
const seedPrice = ITEMS.wheat_seed.buy, W = CROPS.wheat, wheatValue = W.yield * ITEMS.wheat.p + W.extra.straw * ITEMS.straw.p;

// ---------- État ----------
const farmTrees = Object.values(genObjects(SEED)).filter(o => o.t === 'tree').length;
const S = { day: 1, money: 500, wood: 0, stone: 0, xp: 0, mxp: 0, axe: 1, pick: 1, sickle: 1, tools: { pick: true, axe: true }, field: 0, planted: 0, seeds: 0,
  trees: farmTrees, stumps: [], saplings: [], rocks: Q.rocks, boulders, forest: false, forestTrees: 0, done: {}, pending: 0, playS: 0, today: 0 };
const log = [], days = [], income = { blé: 0, bois: 0, pierres: 0, autres: 0 }, spent = { graines: 0, plans: 0, forge: 0 };
const ms = (id, t) => { if (!S.done[id]) { S.done[id] = S.day; log.push({ day: S.day, t: Math.round((S.playS + S.today) / 60), id: t, lvl: levelOf(S.xp), money: Math.round(S.money) }); } };
const gain = n => { const b = levelOf(S.xp); S.xp += n; const a = levelOf(S.xp); if (a > b) ms('niv' + a, `Niveau ${a} (${S.xp} XP)`); };
const mlvl = () => miningLevelOf(S.mxp);

// Objectifs dans l'ordre où un joueur les suit (quêtes principales, puis secondaires, puis forge ; l'or demande en plus les plans de la forge : pas simulé)
const GOALS = [
  { id: 'feu', n: 'Feu de camp', wood: HAND_RECIPES.campfire.in.wood, stone: HAND_RECIPES.campfire.in.stone, craft: true, xp: XP.craft + XP.step },
  { id: 'cabane', n: 'Cabane retapée', wood: REPAIRS.house.need.wood, stone: REPAIRS.house.need.stone, repair: true, xp: XP.step },
  { id: 'four', n: 'Four de Remy (couteau)', wood: OVEN_COST.wood, stone: OVEN_COST.stone, repair: true, town: true, xp: XP.step },
  { id: 'grange', n: 'Grange rafistolée (pelle) — fin de « Premiers pas »', wood: REPAIRS.grange.need.wood, stone: REPAIRS.grange.need.stone, repair: true, xp: XP.step + XP.questMain, then: () => { S.shovelDay = S.day; } },
  { id: 'cabane2', n: 'Cabane agrandie', wood: REPAIRS.house2.need.wood, stone: REPAIRS.house2.need.stone, repair: true, xp: XP.quest },
  { id: 'lit', n: 'Lit (plan 80 $)', wood: HAND_RECIPES.lit.in.wood, stone: HAND_RECIPES.lit.in.stone, money: 80, craft: true, town: true, xp: XP.craft + XP.quest },
  { id: 'coffre', n: 'Coffre (plan 60 $)', wood: HAND_RECIPES.chest.in.wood, stone: HAND_RECIPES.chest.in.stone, money: 60, craft: true, town: true, xp: XP.craft + XP.quest },
  ...[['axe', 2], ['pick', 2], ['axe', 3], ['pick', 3], ['sickle', 2]].map(([t, tier]) => { const c = upgradeCost(tier - 1);
    return { id: t + tier, n: `${t === 'axe' ? 'Hache' : t === 'pick' ? 'Pioche' : 'Faucille'} ${TIER_NAMES[tier]} (${c.money} $, ${c.stone} pierres, minage ${c.minLvl})`, stone: c.stone, wood: 0, money: c.money, minLvl: c.minLvl, town: true, forge: [t, tier] }; })
];
const goal = () => GOALS.find(x => !S.done[x.id] && !(x.forge && S[x.forge[0]] >= x.forge[1]));

function simulateDay() {
  let t = S.day === 1 ? DAY_S - P.introS : DAY_S, e = 100, ended = 'temps', why = {}, toTown = false, didQuarry = false;
  const spend = (s, en) => { if (s > t || en > e) return false; t -= s; e -= en; S.today += s; return true; };
  S.today = S.day === 1 ? P.introS : 0;
  // le matin : récolte (un geste à la faucille), ventes de la nuit déjà encaissées, graines, semis
  if (S.planted) { const n = S.planted; S.planted = 0; spend(3, 0); S.pending += n * wheatValue * P.sellPrice; ms('recolte', 'Première récolte de blé'); }
  if (S.shovelDay && S.day > S.shovelDay && !S.done.courrier) { S.seeds += SEED_GIFT; ms('courrier', `Courrier : ${SEED_GIFT} graines de blé`); gain(XP.step); }
  // champ : agrandir puis semer (une fois la pelle trouvée)
  if (S.shovelDay) {
    while (S.field < P.fieldMax && e > 30 && S.field < S.seeds + Math.floor(S.money / seedPrice) && spend(P.tillPerSquare, 1)) { S.field++; if (S.field === 1) { ms('becher', 'Premier carré bêché'); gain(XP.step); } }
    const need = Math.max(0, S.field - S.seeds), buy = Math.min(need, Math.floor(S.money / seedPrice));
    if (buy > 0) { S.money -= buy * seedPrice; spent.graines += buy * seedPrice; S.seeds += buy; toTown = true; }
    const n = Math.min(S.field, S.seeds); if (n && spend(n * P.sowPerSquare, 0)) { S.seeds -= n; S.planted = n; if (!S.done.semer) { ms('semer', 'Premières graines semées'); gain(XP.step); } }
  }
  // objectifs : matériaux, puis réparation / fabrication / forge
  for (let guard = 0; guard < 50; guard++) {
    const G = goal(); if (!G) { why.fini = 1; if (P.grind) grind(); break; }
    const money = G.money || 0;
    if (G.minLvl && mlvl() < G.minLvl) why.minage = 1;
    if (S.money < money) why.argent = 1;
    const needW = Math.max(0, G.wood - S.wood), needS = Math.max(0, G.stone - S.stone);
    if (!needW && !needS && S.money >= money && !(G.minLvl && mlvl() < G.minLvl)) {
      const hits = G.repair ? Math.ceil(Math.max(G.wood, G.stone) / REPAIR_STEP) : 1;
      if (!spend(hits * HIT_S + (G.town ? P.tripTown / 2 : 0), G.repair ? hits * REPAIR_ENERGY : 0)) { ended = 'temps'; break; }
      S.wood -= G.wood; S.stone -= G.stone; S.money -= money; if (G.forge) { S[G.forge[0]] = G.forge[1]; spent.forge += money; } else spent.plans += money;
      if (G.town) toTown = true;
      if (G.xp) gain(G.xp); if (G.then) G.then();
      ms(G.id, G.n); if (G.id === 'axe2') { S.forest = true; S.forestTrees = ARBRES_FORET; ms('foret', 'Forêt ouverte (gros arbre abattu à la hache en cuivre)'); }
      continue;
    }
    // ramasser ce qui manque (le plus en retard d'abord), sinon des pierres pour le minage / la forge
    const wantStone = needS > 0 && (needW === 0 || needS / Math.max(1, G.stone) >= needW / Math.max(1, G.wood)) || (!needW && !needS);
    if (wantStone) {
      if (!didQuarry) { if (!spend(P.tripQuarry, 0)) break; didQuarry = true; }
      const big = S.rocks <= 0 && S.pick >= 2 && S.boulders > 0;
      if (S.rocks <= 0 && !big) { why.cailloux = 1; if (needW > 0) { gatherWood(); continue; } break; }
      const hp = big ? BORDER_HP : ROCK_HPS.rock, hits = Math.ceil(hp / S.pick), en = hits * energyCost(S.pick);
      if (en > e) { ended = 'énergie'; break; }
      if (!spend(hits * HIT_S + P.walkRock, en)) { ended = 'temps'; break; }
      if (big) { S.boulders--; S.stone += (BORDER_STONES[0] + BORDER_STONES[1]) / 2; S.mxp += hits * MINING_GAIN.hit + MINING_GAIN.boulder; gain(XP.small * 2); }
      else { S.rocks--; S.stone += 1; S.mxp += hits * MINING_GAIN.hit + MINING_GAIN.rock; gain(XP.small); }
      income.pierres += 0;
    } else if (!gatherWood()) break;
  }
  function grind() {   // temps libre : bois et pierres revendus à l'étal (ce qui rapporte de l'XP)
    for (let k = 0; k < 400; k++) {
      const s0 = S.stone, w0 = S.wood;
      if (S.rocks > 0 || (S.pick >= 2 && S.boulders > 0)) {
        if (!didQuarry) { if (!spend(P.tripQuarry, 0)) return; didQuarry = true; }
        const big = S.rocks <= 0, hits = Math.ceil((big ? BORDER_HP : ROCK_HPS.rock) / S.pick), en = hits * energyCost(S.pick);
        if (!spend(hits * HIT_S + P.walkRock, en)) { ended = e < en ? 'énergie' : 'temps'; return; }
        if (big) { S.boulders--; S.stone += (BORDER_STONES[0] + BORDER_STONES[1]) / 2; S.mxp += hits * MINING_GAIN.hit + MINING_GAIN.boulder; gain(XP.small * 2); }
        else { S.rocks--; S.stone += 1; S.mxp += hits * MINING_GAIN.hit + MINING_GAIN.rock; gain(XP.small); }
      } else if (!gatherWood()) return;
      const v = (S.stone - s0) * ITEMS.stone.p + (S.wood - w0) * ITEMS.wood.p; S.stone = s0; S.wood = w0; S.pending += v * P.sellPrice; income[v && S.stone !== s0 ? 'pierres' : 'bois'] += 0; S.grindIncome = (S.grindIncome || 0) + v;
    }
  }
  function gatherWood() {
    const pool = S.trees > 0 ? 'trees' : S.forest && S.forestTrees > 0 ? 'forestTrees' : null;
    if (!pool) { why.arbres = 1; return false; }
    const hits = Math.ceil(TREE_HP / S.axe) + Math.ceil(STUMP_HP / S.axe), en = hits * energyCost(S.axe);
    if (en > e) { ended = 'énergie'; return false; }
    if (!spend(hits * HIT_S + P.walkTree, en)) { ended = 'temps'; return false; }
    S[pool]--; S.wood += woodPerTree + woodPerStump; gain(XP.small);
    if (pool === 'trees') S.saplings.push(S.day + STUMP_DAYS + TREE_GROW_DAYS); else S.saplings.push(-(S.day + STUMP_DAYS + TREE_GROW_DAYS));
    return true;
  }
  if (toTown) spend(P.tripTown / 2, 0);
  const used = DAY_S - t;
  S.today = Math.max(S.today, (CFG.SLEEP_FROM - CFG.DAY_START) * SEC_PER_MIN); S.playS += S.today;   // on ne peut pas dormir avant 18 h if (e < 5) ended = 'énergie';
  const row = { day: S.day,  money: Math.round(S.money), wood: Math.round(S.wood), stone: Math.round(S.stone), lvl: levelOf(S.xp), xp: S.xp, mlvl: mlvl(), field: S.field, energy: Math.round(100 - e), time: Math.round(S.today / 60 * 10) / 10, ended: why.fini && !P.grind ? 'tout fait' : ended, limits: Object.keys(why).join(', ') };
  days.push(row);
  // la nuit : ventes de l'étal, repousses, carrière, saison
  S.money += S.pending; income.blé += S.pending; S.pending = 0;
  S.saplings = S.saplings.filter(d => { if (Math.abs(d) <= S.day + 1) { if (d > 0) S.trees++; else S.forestTrees++; return false; } return true; });
  S.rocks = Math.min(Q.rocks, S.rocks + Q.rocksDay);
  if (S.day % CFG.MONTH_DAYS === 0) { S.trees = farmTrees; S.saplings = S.saplings.filter(d => d < 0); }   // nouvelle saison : arbres remis
  S.day++;
}
for (let d = 0; d < DAYS; d++) simulateDay();

// ---------- Résumé ----------
const fmt = n => n.toLocaleString('fr-FR');
const lines = [];
lines.push(`# Simulation de Farmwest`, '', `Générée par \`node tools/simulate.mjs ${DAYS} ${SEED}\` le ${new Date().toLocaleDateString('fr-FR')} (version ${JSON.parse(await import('node:fs').then(f => f.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))).version}).`,
  `Un joueur-type joue ${DAYS} jours de jeu en accéléré. Les valeurs viennent du jeu lui-même : changer un réglage puis relancer la simulation suffit.`, '',
  '## Hypothèses du joueur-type', '', ...Object.entries(P).map(([k, v]) => `- \`${k}\` = ${v}`), `- forêt : ${ARBRES_FORET} arbres adultes une fois ouverte (💡 estimation)`,
  `- Une journée jouée = ${Math.round(DAY_S / 60 * 10) / 10} min réelles (6 h → ${P.bedtime / 60} h, ${CFG.MS_PER_MIN} ms par minute de jeu). Énergie : 100 par jour (le lit ou la tente rend tout).`,
  `- Arbres de la ferme au départ : ${farmTrees}. Carrière : ${Q.rocks} cailloux, +${Q.rocksDay} par jour ; ${boulders} gros cailloux de bordure (pioche en cuivre).`, '',
  '## Étapes', '', '| Jour | Temps de jeu cumulé | Étape | Niveau | Argent |', '|---|---|---|---|---|',
  ...log.map(m => `| ${m.day} | ${m.t} min | ${m.id} | ${m.lvl} | ${fmt(m.money)} $ |`), '');
const stuck = GOALS.filter(G => !S.done[G.id]); if (stuck.length) lines.push(`**Pas atteint en ${DAYS} jours :** ${stuck.map(G => G.n).join(' ; ')}.`, '');
lines.push('## Niveaux', '', '| Niveau | XP nécessaire | Atteint le jour |', '|---|---|---|', ...LEVELS.slice(1).map((x, i) => `| ${i + 1} | ${x} | ${S.done['niv' + (i + 1)] || '—'} |`), '');
lines.push('## Économie', '', `- Gagné : blé, paille et ventes de bois / pierres ${fmt(Math.round(income.blé))} $ (dont bois / pierres : ${fmt(Math.round(S.grindIncome || 0))} $) (${wheatValue} $ par carré récolté, graine ${seedPrice} $ → ${wheatValue - seedPrice} $ de bénéfice par carré et par jour).`,
  `- Dépensé : graines ${fmt(spent.graines)} $, plans ${fmt(spent.plans)} $, forge ${fmt(spent.forge)} $.`, `- Fin de simulation : ${fmt(Math.round(S.money))} $, ${Math.round(S.wood)} bois, ${Math.round(S.stone)} pierres, champ de ${S.field} carrés, niveau ${levelOf(S.xp)} (${S.xp} XP), minage ${mlvl()}.`, '');
const cnt = k => days.filter(d => d.ended === k).length, lim = k => days.filter(d => d.limits.includes(k)).length;
lines.push('## Goulets', '', `- Journées finies par manque d'**énergie** : ${cnt('énergie')} ; par manque de **temps** : ${cnt('temps')} ; plus rien à faire : ${cnt('tout fait')}.`,
  `- Journées bloquées par : l'argent ${lim('argent')}, le niveau de minage ${lim('minage')}, les cailloux épuisés ${lim('cailloux')}, les arbres épuisés ${lim('arbres')}.`, '');
const first = k => log.find(m => m.id.startsWith(k)), wheatShare = income.blé ? 1 - (S.grindIncome || 0) / income.blé : 0;
lines.push('## Constats automatiques', '',
  `- Le blé fait ${Math.round(wheatShare * 100)} % des revenus : ${wheatValue - seedPrice} $ de bénéfice par carré et par jour, pour 1 énergie une seule fois (la terre reste bêchée). C'est le levier n° 1 de l'équilibrage (prix du blé, de la paille, de la graine, taille du champ).`,
  `- « Premiers pas » se termine le jour ${S.done.grange || '—'} : le goulet est la pierre (${lim('cailloux')} journées où la carrière était vide ; ${Q.rocksDay} cailloux par jour).`,
  `- La forêt s'ouvre le jour ${S.done.foret || '—'} (hache en cuivre : ${upgradeCost(1).money} $ et minage ${upgradeCost(1).minLvl}).`,
  `- Niveau 10 : ${S.done.niv10 ? 'jour ' + S.done.niv10 : 'pas atteint en ' + DAYS + ' jours'} ; après les objectifs, l'XP ne vient plus que des arbres et des cailloux (1 XP chacun).`, '');
lines.push('## Jour par jour', '', '| Jour | Argent | Bois | Pierres | Niveau (XP) | Minage | Champ | Énergie utilisée | Temps joué | Fin de journée | Freins |', '|---|---|---|---|---|---|---|---|---|---|---|',
  ...days.filter(d => d.day <= 30 || d.day % 5 === 0).map(d => `| ${d.day} | ${fmt(d.money)} | ${d.wood} | ${d.stone} | ${d.lvl} (${d.xp}) | ${d.mlvl} | ${d.field} | ${d.energy} | ${d.time} min | ${d.ended} | ${d.limits} |`), '');
lines.push('## Où régler', '', '| Réglage | Fichier |', '|---|---|',
  '| Durée d\'une journée (`MS_PER_MIN`), délai entre deux coups (`HIT_MS`) | src/config.js |',
  '| Courbe de niveaux (`LEVELS`), XP par action / quête (`XP`) | src/systems/level.js |',
  '| Prix et énergie de la forge (`upgradeCost`, `energyCost`), XP de minage (`MINING_XP`, `MINING_GAIN`) | src/data/tools.js |',
  '| Coups pour un arbre / un caillou (`TREE_HP`, `ROCK_HPS`) | src/world/map.js |',
  '| Bois par arbre, souches, repousse (`TREE_KINDS`, `STUMP_*`, `TREE_GROW_DAYS`) | src/data/forest.js |',
  '| Cailloux de la carrière (`NATURE.carriere`), gros cailloux (`BORDER_*`) | src/data/nature.js, src/systems/quarry.js |',
  '| Coût des réparations (`REPAIRS`, `REPAIR_STEP`), énergie au marteau (`REPAIR_ENERGY`) | src/data/repairs.js, src/systems/repair.js |',
  '| Prix de vente / d\'achat (`ITEMS[id].p`, `.buy`), cultures (`CROPS`), graines offertes (`SEED_GIFT`) | src/data/items.js, src/data/crops.js, src/systems/mail.js |',
  '| Recettes (`HAND_RECIPES`), four de Remy (`OVEN_COST`) | src/data/recipes.js, src/systems/resto.js |',
  '| Hypothèses du joueur-type (`P`) | tools/simulate.mjs |', '');
writeFileSync(new URL('../docs/SIMULATION.md', import.meta.url), lines.join('\n'));
console.log(`docs/SIMULATION.md : ${DAYS} jours, ${log.length} étapes, niveau ${levelOf(S.xp)}, ${Math.round(S.money)} $`);
