// 20/11 (demande de l'utilisateur) : moteur de simulation rapide de Farmwest.
// Il « joue » des journées entières en accéléré avec un joueur-type (hypothèses ci-dessous, modifiables), en lisant les
// VRAIES valeurs du jeu (src/data, src/systems, src/config) : rien n'est recopié, chaque réglage se voit dans le résumé.
// Sortie : docs/SIMULATION.md.   Lancer : npm run simulate   ou   node tools/simulate.mjs [jours=120] [graine=12345]
// Options (20/11, pour le compte rendu d'équilibrage) : --profil=tranquille|moyen|acharne (joueur-type), --out=fichier.md,
// --json=fichier.json (toutes les données de la partie, lues par le skill « compte-rendu-equilibrage »).
import { writeFileSync, readFileSync } from 'node:fs';
import { CFG } from '../src/config.js';
import { LEVELS, XP, MAX_LEVEL } from '../src/systems/level.js';
import { energyCost, MINING_GAIN, WOOD_GAIN, NEED, SKILL_MAX } from '../src/data/tools.js';
import { level as skillOf } from '../src/systems/skills.js';
import { REPAIRS, REPAIR_STEP } from '../src/data/repairs.js';
import { REPAIR_ENERGY } from '../src/systems/repair.js';
import { TREE_KINDS, STUMP_DAYS, STUMP_HP, STUMP_WOOD, TREE_GROW_DAYS } from '../src/data/forest.js';
import { TREE_HP, ROCK_HPS, genObjects } from '../src/world/map.js';
import { NATURE, VEINS, VEIN_HP, VEIN_ORE } from '../src/data/nature.js';
import { pickVein } from '../src/systems/nature.js';
import { BORDER_HP, BORDER_STONES } from '../src/systems/quarry.js';
import { STAND_CAP } from '../src/systems/stand.js';
import { SELL_RATE, SHOP_BUYS } from '../src/data/shops.js';
import { PATTERNS, POT_RECIPES } from '../src/data/patterns.js';
import { CROPS } from '../src/data/crops.js';
import { ITEMS } from '../src/data/items.js';
import { HAND_RECIPES } from '../src/data/recipes.js';
import { OVEN_COST } from '../src/systems/resto.js';
import { SEED_GIFT } from '../src/systems/mail.js';
import { FOREST_TREE_HP } from '../src/systems/blockers.js';

const ARGS = process.argv.slice(2), POS = ARGS.filter(a => !a.startsWith('--')), OPT = Object.fromEntries(ARGS.filter(a => a.startsWith('--')).map(a => { const [k, v = '1'] = a.slice(2).split('='); return [k, v]; }));
const DAYS = +(POS[0] || 120), SEED = +(POS[1] || 12345), PROFIL = OPT.profil || 'moyen';

// ---------- Hypothèses sur le joueur-type (à adapter) ----------
const P = {
  bedtime: 22 * 60,        // se couche à 22 h (le jeu commence à 6 h ; on ne peut pas dormir avant 18 h)
  introS: 240,             // s d'intro le premier jour (train, diligence, explications)
  walkTree: 3,             // s d'un arbre à l'autre
  walkRock: 2,             // s d'un caillou à l'autre (carrière)
  tripQuarry: 40,          // s aller-retour ferme ↔ carrière (une fois par jour où il y va)
  tripPlace: 30,           // s aller-retour ferme ↔ place du panneau (l'étal)
  tripTown: 120,           // s aller-retour en ville (graines au magasin général, plans chez Harry, four de Remy)
  tillPerSquare: 1.2,      // s pour bêcher un carré
  sowPerSquare: 0.4,       // s pour semer un carré (on glisse le doigt)
  harvestS: 4,             // s pour récolter tout le champ (un geste à la faucille, ramasser)
  listS: 15,               // s pour mettre un lot en vente à l'étal
  standDay: 1,             // passages à l'étal en journée (× 0,75 : vendu dans la journée), en plus du soir (× 1 : vendu la nuit)
  standFast: 0,            // tours rapides par jour à × 0,5 (on attend 2 à 3 min à côté de l'étal)
  fieldMax: 120,           // carrés de champ au maximum (place libre sur la ferme)
  stockDays: 2,            // n'agrandit plus le champ si le stock invendu dépasse ce nombre de jours de ventes
  cook: 2,                 // 20/11 : fournées de pain par jour au chaudron (2 farines → 2 pains ; la farine s'achète à la boulangerie), mangées quand l'énergie manque
  cookS: 40,               // secondes par fournée (chaudron + manger)
  surplus: true,           // 20/11 : le soir, le stock au-delà de « stockDays » part chez le marchand (75 %) si on passe en ville, sinon à la décharge (50 %)
  grind: true,             // une fois les objectifs atteints : couper / casser pour l'XP (le surplus va à l'étal)
};
// Profils de joueur (20/11) : on ne change que ce qui distingue leur façon de jouer.
const PROFILS = {
  tranquille: { bedtime: 20 * 60, cook: 1, walkTree: 4, walkRock: 3, tripQuarry: 55, tripPlace: 40, tripTown: 160, standDay: 0, grind: false },
  moyen: {},
  acharne: { bedtime: 23 * 60 + 30, walkTree: 2, walkRock: 1.5, tripQuarry: 30, tripPlace: 22, tripTown: 90, standDay: 2, standFast: 2 },
};
if (!PROFILS[PROFIL]) { console.error('Profil inconnu : ' + PROFIL + ' (tranquille, moyen, acharne)'); process.exit(1); }
Object.assign(P, PROFILS[PROFIL]);
const ARBRES_FORET = 60;   // 💡 arbres adultes de la forêt une fois ouverte (estimation)

// ---------- Valeurs lues dans le jeu ----------
const SEC_PER_MIN = CFG.MS_PER_MIN / 1000, HIT_S = CFG.HIT_MS / 1000, E1 = energyCost(1);
const DAY_S = (P.bedtime - CFG.DAY_START) * SEC_PER_MIN, MIN_DAY_S = (CFG.SLEEP_FROM - CFG.DAY_START) * SEC_PER_MIN;
const woodPerTree = (TREE_KINDS.oak.wood[0] + TREE_KINDS.oak.wood[1]) / 2, woodPerStump = (STUMP_WOOD[0] + STUMP_WOOD[1]) / 2;
const Q = NATURE.carriere, BOULDERS = 92;
const levelOf = xp => { let l = 0; for (let i = 1; i < LEVELS.length; i++) if (xp >= LEVELS[i]) l = i; return Math.min(l, MAX_LEVEL); };
const seedPrice = ITEMS.wheat_seed.buy, W = CROPS.wheat;
const farmTrees = Object.values(genObjects(SEED)).filter(o => o.t === 'tree').length;
let rs = SEED; const rnd = () => (rs = (rs * 9301 + 49297) % 233280) / 233280;

// ---------- État ----------
const S = { day: 1, money: 500, wood: 0, stone: 0, xp: 0, sk: { mining: 0, wood: 0 }, field: 0, planted: 0, seeds: 0, stock: {}, onNight: [],
  trees: farmTrees, regrow: [], rocks: Q.rocks, veins: [], boulders: BOULDERS, forest: false, forestTrees: 0, done: {}, playS: 0, today: 0, shovelDay: 0 };
const log = [], days = [], income = {}, spent = { graines: 0, plans: 0 };
const ms = (id, t) => { if (!S.done[id]) { S.done[id] = S.day; log.push({ day: S.day, t: Math.round((S.playS + S.today) / 60), id: t, lvl: levelOf(S.xp), money: Math.round(S.money) }); } };
const gain = n => { const b = levelOf(S.xp); S.xp += n; const a = levelOf(S.xp); if (a > b) ms('niv' + a, `Niveau ${a} (${S.xp} XP)`); };
const skill = sk => skillOf(S.sk[sk]);
const gainSk = (sk, n) => { const b = skill(sk); S.sk[sk] += n; const a = skill(sk); if (a > b) ms(sk + a, `${sk === 'wood' ? 'Bûcheron' : 'Minage'} niveau ${a}`); };
const can = need => skill(need[0]) >= need[1];
const stockAdd = (id, n) => { S.stock[id] = (S.stock[id] || 0) + n; };
const stockN = () => Object.values(S.stock).reduce((a, n) => a + n, 0);

// Objectifs dans l'ordre où un joueur les suit (quêtes principales, puis secondaires)
const GOALS = [
  { id: 'cabane', n: 'Cabane retapée', wood: REPAIRS.house.need.wood, stone: REPAIRS.house.need.stone, repair: true, xp: XP.step },
  { id: 'four', n: 'Four de Remy (couteau)', wood: OVEN_COST.wood, stone: OVEN_COST.stone, repair: true, town: true, xp: XP.step },
  { id: 'grange', n: 'Grange rafistolée (pelle) — fin de « Premiers pas »', wood: REPAIRS.grange.need.wood, stone: REPAIRS.grange.need.stone, repair: true, xp: XP.step + XP.questMain, then: () => { S.shovelDay = S.day; } },
  { id: 'cabane2', n: 'Cabane agrandie', wood: REPAIRS.house2.need.wood, stone: REPAIRS.house2.need.stone, repair: true, xp: XP.quest },
  { id: 'lit', n: 'Lit (plan 80 $)', wood: HAND_RECIPES.lit.in.wood, stone: HAND_RECIPES.lit.in.stone, money: 80, town: true, xp: XP.craft + XP.quest },
  { id: 'coffre', n: 'Coffre (plan 60 $)', wood: HAND_RECIPES.chest.in.wood, stone: HAND_RECIPES.chest.in.stone, money: 60, town: true, xp: XP.craft + XP.quest },
];
const goal = () => GOALS.find(x => !S.done[x.id]);

function simulateDay() {
  let cooked = 0, t = S.day === 1 ? DAY_S - P.introS : DAY_S, e = 100, ended = 'temps', why = {}, didQuarry = false, toTown = false;
  S.today = S.day === 1 ? P.introS : 0;
  const spend = (s, en = 0) => { if (s > t || en > e + 1e-9) return false; t -= s; e -= en; S.today += s; return true; };
  // --- le matin : ventes de la nuit, récolte, courrier, semis ---
  for (const l of S.onNight) { S.money += l.v; income[l.id] = (income[l.id] || 0) + l.v; } S.onNight = [];
  if (S.planted) { spend(P.harvestS); stockAdd('wheat', S.planted * W.yield); stockAdd('straw', S.planted * W.extra.straw); S.planted = 0; ms('recolte', 'Première récolte de blé'); }
  if (S.shovelDay && S.day > S.shovelDay && !S.done.courrier) { S.seeds += SEED_GIFT; ms('courrier', `Courrier : ${SEED_GIFT} graines de blé`); gain(XP.step); }
  if (S.shovelDay) {
    const salesPerDay = STAND_CAP * (1 + P.standDay + P.standFast), perSquare = W.yield + W.extra.straw;
    const room = stockN() < salesPerDay * P.stockDays;
    while (room && S.field < P.fieldMax && e > 30 && S.field < S.seeds + Math.floor(S.money / seedPrice) && (S.field + 1) * perSquare <= salesPerDay * P.stockDays && spend(P.tillPerSquare, 1)) { S.field++; if (S.field === 1) { ms('becher', 'Premier carré bêché'); gain(XP.step); } }
    const need = Math.max(0, S.field - S.seeds), buy = Math.min(need, Math.floor(S.money / seedPrice));
    if (buy > 0) { S.money -= buy * seedPrice; spent.graines += buy * seedPrice; S.seeds += buy; toTown = true; }
    const n = Math.min(S.field, S.seeds); if (n && spend(n * P.sowPerSquare)) { S.seeds -= n; S.planted = n; if (!S.done.semer) { ms('semer', 'Premières graines semées'); gain(XP.step); } }
  }
  // --- l'étal en journée (× 0,75, puis tours rapides × 0,5) ---
  const sell = (mult, night) => {   // met en vente jusqu'à STAND_CAP objets, les plus chers d'abord
    let room = STAND_CAP; const ids = Object.keys(S.stock).filter(id => S.stock[id] > 0).sort((a, b) => ITEMS[b].p - ITEMS[a].p);
    for (const id of ids) { const n = Math.min(room, S.stock[id]); if (!n) continue; S.stock[id] -= n; room -= n; const v = Math.max(1, Math.round(ITEMS[id].p * mult)) * n;
      if (night) S.onNight.push({ id, v }); else { S.money += v; income[id] = (income[id] || 0) + v; } }
    return STAND_CAP - room;
  };
  for (let k = 0; k < P.standDay; k++) if (stockN() && spend(P.tripPlace + P.listS)) sell(0.75);
  for (let k = 0; k < P.standFast; k++) if (stockN() && spend(150 + P.listS)) sell(0.5);
  // --- objectifs : matériaux, puis réparation / fabrication ---
  for (let guard = 0; guard < 60; guard++) {
    const G = goal();
    if (!G) { why.fini = 1; if (P.grind) grind(); break; }
    if (S.money < (G.money || 0)) { why.argent = 1; break; }
    const needW = Math.max(0, G.wood - S.wood), needS = Math.max(0, G.stone - S.stone);
    if (!needW && !needS) {
      const hits = G.repair ? Math.ceil(Math.max(G.wood, G.stone) / REPAIR_STEP) : 1;
      if (!spend(hits * HIT_S + (G.town ? P.tripTown / 2 : 0), G.repair ? hits * REPAIR_ENERGY : 0)) break;
      S.wood -= G.wood; S.stone -= G.stone; S.money -= G.money || 0; spent.plans += G.money || 0; if (G.town) toTown = true;
      gain(G.xp || 0); if (G.then) G.then(); ms(G.id, G.n); continue;
    }
    const wantStone = needS > 0 && (needW === 0 || needS / G.stone >= needW / Math.max(1, G.wood));
    if (!(wantStone ? mine() : chop())) break;
  }
  // --- la forêt : l'arbre tombé, dès que le niveau de bûcheron suffit ---
  if (!S.forest && can(NEED.forestTree) && spend(Math.ceil(FOREST_TREE_HP) * HIT_S + 20, FOREST_TREE_HP * E1)) { S.forest = true; S.forestTrees = ARBRES_FORET; S.wood += 12; gainSk('wood', FOREST_TREE_HP * WOOD_GAIN.blocker); ms('foret', 'Forêt ouverte (arbre tombé abattu)'); }
  function mine(free) {   // un caillou, un filon ou un gros caillou de la carrière
    if (!didQuarry) { if (!spend(P.tripQuarry)) return false; didQuarry = true; }
    const vi = S.veins.findIndex(v => can(['mining', NEED.vein[v]]));
    let kind = vi >= 0 && (free || S.rocks <= 0) ? 'vein' : S.rocks > 0 ? 'rock' : can(NEED.boulder) && S.boulders > 0 ? 'boulder' : vi >= 0 ? 'vein' : null;
    if (!kind) { why.cailloux = 1; return free ? false : chop(); }
    const hp = kind === 'vein' ? VEIN_HP : kind === 'boulder' ? BORDER_HP : ROCK_HPS.rock;
    if (!spend(hp * HIT_S + P.walkRock, hp * E1)) { ended = e < hp * E1 ? 'énergie' : 'temps'; return false; }
    gainSk('mining', hp * MINING_GAIN.hit);
    if (kind === 'vein') { const v = S.veins.splice(vi, 1)[0]; stockAdd(VEINS[v].ore, (VEIN_ORE[0] + VEIN_ORE[1]) / 2); S.stone += 1; gainSk('mining', 15); gain(XP.small); ms('ore_' + v, `Premier ${VEINS[v].n.toLowerCase()} cassé`); }
    else if (kind === 'boulder') { S.boulders--; S.stone += (BORDER_STONES[0] + BORDER_STONES[1]) / 2; gainSk('mining', MINING_GAIN.boulder); gain(2 * XP.small); }
    else { S.rocks--; S.stone += 1; gainSk('mining', MINING_GAIN.rock); gain(XP.small); }
    return true;
  }
  function chop() {
    const pool = S.trees > 0 ? 'trees' : S.forest && S.forestTrees > 0 ? 'forestTrees' : null;
    if (!pool) { why.arbres = 1; return false; }
    const hits = TREE_HP + STUMP_HP;
    if (!spend(hits * HIT_S + P.walkTree, hits * E1)) { ended = e < hits * E1 ? 'énergie' : 'temps'; return false; }
    S[pool]--; S.wood += woodPerTree + woodPerStump; gain(XP.small); gainSk('wood', hits * WOOD_GAIN.hit + WOOD_GAIN.tree + WOOD_GAIN.stump);
    S.regrow.push({ pool, day: S.day + STUMP_DAYS + TREE_GROW_DAYS });
    return true;
  }
  function eat() {   // 20/11 : cuisiner et manger du pain (énergie + vie, XP d'artisan)
    const pat = POT_RECIPES.pain, B = ITEMS.bread.eat, cost = pat.in.flour * ITEMS.flour.buy;
    if (!S.done.four || cooked >= P.cook || S.money < cost + 100 || e > 100 - pat.q * B.e || !spend(P.cookS)) return false;
    if (!S.done.cuisine) { S.money -= PATTERNS.p_pain.price; spent.plans += PATTERNS.p_pain.price; }
    S.money -= cost; spent.cuisine = (spent.cuisine || 0) + cost; cooked++; toTown = true;
    e = Math.min(100, e + pat.q * B.e); S.hpHealed = (S.hpHealed || 0) + pat.q * (B.h || 0); gain(XP.craft); ms('cuisine', 'Premier pain cuit et mangé'); return true;
  }
  function grind() {   // temps libre : alterner carrière et arbres ; le surplus part à l'étal
    for (let k = 0; k < 500; k++) {
      const w0 = S.wood, s0 = S.stone;
      const ok = (k % 2 === 0 ? mine(true) || chop() : chop() || mine(true)) || (eat() && true);
      if (!ok) return;
      stockAdd('wood', S.wood - w0); stockAdd('stone', S.stone - s0); S.wood = w0; S.stone = s0;
    }
  }
  // --- le soir : l'étal (× 1, vendu pendant la nuit) ---
  if (stockN() && spend(P.tripPlace + P.listS)) sell(1, true);
  if (P.surplus) {   // 20/11 : se débarrasser du surplus (marchand 75 % en passant en ville, sinon décharge 50 %)
    const keep = STAND_CAP * (1 + P.standDay + P.standFast) * P.stockDays, rate = toTown ? SELL_RATE.shop : SELL_RATE.dump;
    let over = stockN() - keep;
    for (const id of Object.keys(S.stock).sort((a, b) => ITEMS[a].p - ITEMS[b].p)) { if (over <= 0) break;
      if (toTown && !Object.values(SHOP_BUYS).some(f => f(id, ITEMS[id]))) continue;
      const n = Math.min(over, Math.floor(S.stock[id])); if (n <= 0) continue; S.stock[id] -= n; over -= n;
      const v = Math.max(1, Math.round(ITEMS[id].p * rate)) * n; S.money += v; income[id] = (income[id] || 0) + v; S.resold = (S.resold || 0) + v; }
    if (!toTown && S.resold && spend(P.tripPlace)) {}
  }
  if (toTown) spend(P.tripTown / 2);
  if (e < 5) ended = 'énergie';
  S.today = Math.max(S.today, MIN_DAY_S); S.playS += S.today;
  days.push({ day: S.day, money: Math.round(S.money), wood: Math.round(S.wood), stone: Math.round(S.stone), lvl: levelOf(S.xp), xp: S.xp, mining: skill('mining'), wood_: skill('wood'), field: S.field, stock: Math.round(stockN()), energy: Math.round(100 - e), time: Math.round(S.today / 6) / 10, ended, limits: Object.keys(why).filter(k => k !== 'fini').join(', ') });
  // --- la nuit : repousses, carrière, saison ---
  S.regrow = S.regrow.filter(r => { if (r.day <= S.day + 1) { S[r.pool]++; return false; } return true; });
  S.rocks = Math.min(Q.rocks, S.rocks + Q.rocksDay);
  if (S.veins.length < Q.veins && rnd() < Q.veinP) S.veins.push(pickVein(rnd()));
  if (S.day % CFG.MONTH_DAYS === 0) { S.trees = farmTrees; S.regrow = S.regrow.filter(r => r.pool !== 'trees'); }
  S.day++;
}
for (let i = 0; i < Q.veins; i++) if (rnd() < Q.veinP) S.veins.push(pickVein(rnd()));
for (let d = 0; d < DAYS; d++) simulateDay();

// ---------- Résumé ----------
const fmt = n => Math.round(n).toLocaleString('fr-FR');
const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
const cnt = k => days.filter(d => d.ended === k).length, lim = k => days.filter(d => d.limits.includes(k)).length;
const totalIncome = Object.values(income).reduce((a, b) => a + b, 0), share = ids => Math.round(ids.reduce((a, id) => a + (income[id] || 0), 0) / Math.max(1, totalIncome) * 100);
const L = [];
L.push(`# Simulation de Farmwest`, '', `Générée par \`node tools/simulate.mjs ${DAYS} ${SEED} --profil=${PROFIL}\` (version ${version}). Un joueur-type joue ${DAYS} jours de jeu en accéléré ;`,
  `les valeurs viennent du jeu lui-même : changer un réglage puis relancer la simulation suffit.`, '',
  '## Hypothèses du joueur-type', '', ...Object.entries(P).map(([k, v]) => `- \`${k}\` = ${v}`), `- forêt : ${ARBRES_FORET} arbres adultes une fois ouverte (💡 estimation)`,
  `- Une journée jouée = ${Math.round(DAY_S / 6) / 10} min réelles au plus (6 h → ${P.bedtime / 60} h), ${Math.round(MIN_DAY_S / 6) / 10} min au moins (on ne dort pas avant 18 h). Énergie : 100 par jour.`,
  `- Ferme : ${farmTrees} arbres. Carrière : ${Q.rocks} cailloux (+${Q.rocksDay}/jour), ${Q.veins} filons au plus, ${BOULDERS} gros cailloux de bordure. Étal : ${STAND_CAP} objets à la fois.`, '',
  '## Étapes', '', '| Jour | Temps de jeu cumulé | Étape | Niveau | Argent |', '|---|---|---|---|---|',
  ...log.map(m => `| ${m.day} | ${Math.floor(m.t / 60)} h ${String(m.t % 60).padStart(2, '0')} | ${m.id} | ${m.lvl} | ${fmt(m.money)} $ |`), '');
const stuck = GOALS.filter(G => !S.done[G.id]); if (stuck.length) L.push(`**Pas atteint en ${DAYS} jours :** ${stuck.map(G => G.n).join(' ; ')}.`, '');
L.push('## Niveaux', '', '| Niveau | XP nécessaire | Atteint le jour | Minage atteint le jour | Bûcheron atteint le jour |', '|---|---|---|---|---|',
  ...LEVELS.slice(1).map((x, i) => `| ${i + 1} | ${x} | ${S.done['niv' + (i + 1)] || '—'} | ${i + 1 === 1 ? 1 : S.done['mining' + (i + 1)] || '—'} | ${i + 1 === 1 ? 1 : S.done['wood' + (i + 1)] || '—'} |`), '');
L.push('## Économie', '', '| Vendu | $ | Part |', '|---|---|---|', ...Object.entries(income).sort((a, b) => b[1] - a[1]).map(([id, v]) => `| ${ITEMS[id].n} | ${fmt(v)} | ${share([id])} % |`), '',
  `- Blé : un carré rend ${W.yield} blés (${ITEMS.wheat.p} $) + ${W.extra.straw} pailles (${ITEMS.straw.p} $) = ${W.yield + W.extra.straw} objets à vendre ; la graine coûte ${seedPrice} $. L'étal n'en prend que ${STAND_CAP} à la fois : c'est lui qui limite le champ (${S.field} carrés à la fin).`,
  `- Dépensé : graines ${fmt(spent.graines)} $, plans ${fmt(spent.plans)} $. Cuisine : ${fmt(spent.cuisine || 0)} $ de farine, ${fmt(S.hpHealed || 0)} PV rendus. Revente du surplus (marchands / décharge) : ${fmt(S.resold || 0)} $. Fin : ${fmt(S.money)} $, stock invendu ${fmt(stockN())} objets, niveau ${levelOf(S.xp)} (${S.xp} XP), minage ${skill('mining')}, bûcheron ${skill('wood')}.`, '');
L.push('## Goulets', '', `- Journées finies par manque d'**énergie** : ${cnt('énergie')} ; par manque de **temps** : ${cnt('temps')}.`,
  `- Journées où il a manqué : de l'argent ${lim('argent')}, des cailloux ${lim('cailloux')}, des arbres ${lim('arbres')}.`, '');
L.push('## Constats automatiques', '',
  `- « Premiers pas » se termine le jour ${S.done.grange || '—'} ; la pierre est le frein (${Q.rocksDay} cailloux par jour à la carrière une fois vidée).`,
  `- La forêt s'ouvre le jour ${S.done.foret || '—'} (bûcheron ${NEED.forestTree[1]}). Filons : ${Object.entries(NEED.vein).filter(([v]) => v !== 'tin').map(([v, n]) => `${VEINS[v].n.replace('Filon ', '')} niv. ${n} → jour ${S.done['ore_' + v] || '—'}`).join(', ')}.`,
  `- Revenus : blé et paille ${share(['wheat', 'straw'])} %, bois et pierres ${share(['wood', 'stone'])} %, minerais ${100 - share(['wheat', 'straw']) - share(['wood', 'stone'])} %. L'étal (${STAND_CAP} objets, ${1 + P.standDay + P.standFast} passages par jour) plafonne les ventes.`,
  `- Niveau ${MAX_LEVEL} : ${S.done['niv' + MAX_LEVEL] ? 'jour ' + S.done['niv' + MAX_LEVEL] : 'pas atteint en ' + DAYS + ' jours'} ; compétences au plus ${SKILL_MAX}.`, '');
L.push('## Jour par jour', '', '| Jour | Argent | Bois | Pierres | Niveau (XP) | Minage | Bûcheron | Champ | Stock | Énergie | Temps joué | Fin | Manques |', '|---|---|---|---|---|---|---|---|---|---|---|---|---|',
  ...days.filter(d => d.day <= 30 || d.day % 5 === 0).map(d => `| ${d.day} | ${fmt(d.money)} | ${d.wood} | ${d.stone} | ${d.lvl} (${d.xp}) | ${d.mining} | ${d.wood_} | ${d.field} | ${d.stock} | ${d.energy} | ${d.time} min | ${d.ended} | ${d.limits} |`), '');
L.push('## Où régler', '', '| Réglage | Fichier |', '|---|---|',
  '| Durée d\'une journée (`MS_PER_MIN`), délai entre deux coups (`HIT_MS`) | src/config.js |',
  '| Courbe de niveaux (`LEVELS`), XP par action / quête (`XP`) | src/systems/level.js |',
  '| Compétences : XP par niveau (`MINING_XP`), gains (`MINING_GAIN`, `WOOD_GAIN`), niveaux requis (`NEED`), énergie par coup (`energyCost`) | src/data/tools.js |',
  '| Coups pour un arbre / un caillou (`TREE_HP`, `ROCK_HPS`), filons (`VEINS`, `VEIN_HP`, `VEIN_ORE`) | src/world/map.js, src/data/nature.js |',
  '| Bois par arbre, souches, repousse (`TREE_KINDS`, `STUMP_*`, `TREE_GROW_DAYS`) | src/data/forest.js |',
  '| Carrière (`NATURE.carriere`), gros cailloux (`BORDER_*`) | src/data/nature.js, src/systems/quarry.js |',
  '| Réparations (`REPAIRS`, `REPAIR_STEP`, `REPAIR_ENERGY`) | src/data/repairs.js, src/systems/repair.js |',
  '| Prix (`ITEMS[id].p`, `.buy`), cultures (`CROPS`), graines offertes (`SEED_GIFT`), étal (`STAND_CAP`, `PRICE_STEPS`) | src/data/items.js, src/data/crops.js, src/systems/mail.js, src/systems/stand.js |',
  '| Hypothèses du joueur-type (`P`) | tools/simulate.mjs |', '');
writeFileSync(OPT.out || new URL('../docs/SIMULATION.md', import.meta.url), L.join('\n'));
if (OPT.json) writeFileSync(OPT.json, JSON.stringify({ version, profil: PROFIL, seed: SEED, daysCount: DAYS, hypotheses: P,
  world: { farmTrees, quarryRocks: Q.rocks, rocksPerDay: Q.rocksDay, veinsMax: Q.veins, boulders: BOULDERS, standCap: STAND_CAP, forestTrees: ARBRES_FORET, dayMinutes: Math.round(DAY_S / 6) / 10 },
  levels: LEVELS, maxLevel: MAX_LEVEL, skillMax: SKILL_MAX, goals: GOALS.map(G => ({ id: G.id, n: G.n, day: S.done[G.id] || null })),
  milestones: log, reached: S.done, days, income, spent,
  final: { money: Math.round(S.money), level: levelOf(S.xp), xp: S.xp, mining: skill('mining'), wood: skill('wood'), field: S.field, stock: Math.round(stockN()), playMinutes: Math.round(S.playS / 60) } }, null, 1));
console.log(`${OPT.out || 'docs/SIMULATION.md'} (${PROFIL}) : ${DAYS} jours, ${log.length} étapes, niveau ${levelOf(S.xp)}, ${Math.round(S.money)} $`);
