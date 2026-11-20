// 20/11 (demande de l'utilisateur) : compte rendu d'équilibrage de Farmwest, à lancer À LA MAIN (skill « compte-rendu-equilibrage »).
// Lance le moteur de simulation (tools/simulate.mjs) pour 3 profils de joueur × plusieurs parties (graines), puis calcule
// les constats : rythme des niveaux, étapes, creux, économie, goulets, effet du hasard, écart entre profils, évolution
// depuis le compte rendu précédent. Sortie : docs/EQUILIBRAGE.md (constats chiffrés) + docs/equilibrage/<date>.json (historique).
// Usage : node tools/equilibrage.mjs [jours=120] [graines=12345,777,4242]
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ITEMS } from '../src/data/items.js';
const nomObjet = id => (ITEMS[id] && ITEMS[id].n) || id;

const ROOT = new URL('..', import.meta.url).pathname, DAYS = +(process.argv[2] || 120);
const SEEDS = (process.argv[3] || '12345,777,4242').split(',').map(Number), PROFILS = ['tranquille', 'moyen', 'acharne'];
const NOM = { tranquille: 'Tranquille', moyen: 'Moyen', acharne: 'Acharné' };
// Seuils des alertes (modifiables)
const SEUIL = {
  plateau: 2.5,        // un écart entre deux niveaux > 2,5 × l'écart médian = palier trop long
  creux: 12,           // jours sans aucune étape nouvelle = creux
  hasard: .35,         // écart max-min > 35 % de la médiane entre parties = trop dépendant du hasard
  sourceUnique: 70,    // une source fait plus de 70 % des revenus
  thesaurisation: 5,   // argent final > 5 × l'argent dépensé = l'argent n'a pas d'usage
  energie: 60,         // plus de 60 % des journées finies par manque d'énergie
  premiersPasLent: 14, // « Premiers pas » (grange) au-delà du jour 14 pour le joueur moyen
  ecartProfils: 3,     // l'acharné va plus de 3 × plus vite que le tranquille sur une étape
};

// ---------- 1. Simulations ----------
const tmp = join(tmpdir(), 'farmwest-eq-' + process.pid); mkdirSync(tmp, { recursive: true });
const runs = {};
for (const p of PROFILS) for (const s of SEEDS) {
  const json = join(tmp, `${p}-${s}.json`);
  execFileSync(process.execPath, [join(ROOT, 'tools/simulate.mjs'), String(DAYS), String(s), '--profil=' + p, '--out=' + join(tmp, `${p}-${s}.md`), '--json=' + json], { stdio: 'pipe' });
  (runs[p] ||= []).push(JSON.parse(readFileSync(json, 'utf8')));
}
const any = runs.moyen[0], version = any.version, LV = any.levels.length - 1;

// ---------- 2. Calculs ----------
const med = a => { const b = a.filter(x => x != null).sort((x, y) => x - y); if (!b.length) return null; const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
const spread = a => { const b = a.filter(x => x != null); return b.length < a.length ? null : Math.max(...b) - Math.min(...b); };
const playMin = (r, day) => { const m = r.milestones.find(x => x.day === day); return m ? m.t : null; };
const timeOf = (r, id) => { const m = r.milestones.find(x => r.reached[id] === x.day && (x.id === id || true)); const d = r.reached[id]; if (!d) return null; let t = 0; for (const x of r.days) { if (x.day >= d) break; t += x.time; } return Math.round(t); };
const out = { version, date: new Date().toISOString().slice(0, 10), days: DAYS, seeds: SEEDS, profils: {} };
const alertes = [];   // { niveau: '🔴'|'🟠'|'🟢', zone, texte }
const A = (niveau, zone, texte) => alertes.push({ niveau, zone, texte });

for (const p of PROFILS) {
  const R = runs[p], P = out.profils[p] = {};
  // étapes (quêtes) : jour médian et temps de jeu médian
  P.goals = any.goals.map(G => { const ds = R.map(r => r.reached[G.id] || null); return { id: G.id, n: G.n, jour: med(ds), ecart: spread(ds), minutes: med(R.map(r => timeOf(r, G.id))), rate: ds.filter(d => d == null).length }; });
  // niveaux
  P.levels = []; for (let l = 1; l <= LV; l++) { const ds = R.map(r => r.reached['niv' + l] || null); P.levels.push({ l, xp: any.levels[l], jour: med(ds), ecart: spread(ds), rate: ds.filter(d => d == null).length, minutes: med(R.map(r => timeOf(r, 'niv' + l))) }); }
  // compétences
  P.skills = {}; for (const sk of ['mining', 'wood']) { P.skills[sk] = []; for (let l = 2; l <= any.skillMax; l++) P.skills[sk].push({ l, jour: med(R.map(r => r.reached[sk + l] || null)) }); }
  // creux : plus longue période sans étape
  P.creux = med(R.map(r => { const ds = [...new Set(r.milestones.map(m => m.day))].sort((a, b) => a - b); let best = { n: 0, de: 0 }; for (let i = 1; i < ds.length; i++) if (ds[i] - ds[i - 1] > best.n) best = { n: ds[i] - ds[i - 1], de: ds[i - 1] }; if (DAYS - ds.at(-1) > best.n) best = { n: DAYS - ds.at(-1), de: ds.at(-1) }; return best.n; }));
  P.creuxDe = med(R.map(r => { const ds = [...new Set(r.milestones.map(m => m.day))].sort((a, b) => a - b); let b = { n: 0, de: 0 }; for (let i = 1; i < ds.length; i++) if (ds[i] - ds[i - 1] > b.n) b = { n: ds[i] - ds[i - 1], de: ds[i - 1] }; if (DAYS - ds.at(-1) > b.n) b = { n: DAYS - ds.at(-1), de: ds.at(-1) }; return b.de; }));
  // économie
  const inc = {}; for (const r of R) for (const [k, v] of Object.entries(r.income)) inc[k] = (inc[k] || 0) + v / R.length;
  const tot = Object.values(inc).reduce((a, b) => a + b, 0);
  P.revenus = Object.entries(inc).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ id: k, $: Math.round(v), part: Math.round(v / Math.max(1, tot) * 100) }));
  P.argent = [10, 30, 60, 90, DAYS].filter(d => d <= DAYS).map(d => ({ jour: d, $: med(R.map(r => (r.days[d - 1] || {}).money)) }));
  P.depense = med(R.map(r => r.spent.graines + r.spent.plans)); P.final = med(R.map(r => r.final.money));
  P.niveauFinal = med(R.map(r => r.final.level)); P.stockFinal = med(R.map(r => r.final.stock)); P.champ = med(R.map(r => r.final.field));
  // goulets
  const share = f => Math.round(med(R.map(r => r.days.filter(f).length / r.days.length * 100)));
  P.finEnergie = share(d => d.ended === 'énergie'); P.finTemps = share(d => d.ended === 'temps');
  P.manque = {}; for (const k of ['argent', 'cailloux', 'arbres']) P.manque[k] = share(d => d.limits.includes(k));
  P.minutesJour = any.world.dayMinutes; P.heuresJeu = med(R.map(r => r.final.playMinutes)) / 60;

  // ---------- 3. Alertes ----------
  const nom = NOM[p];
  const gaps = []; for (let i = 1; i < P.levels.length; i++) if (P.levels[i].jour != null && P.levels[i - 1].jour != null) gaps.push({ l: P.levels[i].l, g: P.levels[i].jour - P.levels[i - 1].jour });
  const mg = med(gaps.map(x => x.g)) || 1;
  for (const x of gaps) {
    if (x.g > SEUIL.plateau * mg && x.g >= 6) A('🟠', 'Niveaux', `${nom} : du niveau ${x.l - 1} au ${x.l}, ${x.g} jours (palier ${Math.round(x.g / mg * 10) / 10} × plus long que d'habitude).`);
    if (x.g === 0) A('🟢', 'Niveaux', `${nom} : niveaux ${x.l - 1} et ${x.l} le même jour (peut-être trop rapide).`);
  }
  const jamais = P.levels.filter(l => l.rate === R.length).map(l => l.l), parfois = P.levels.filter(l => l.rate && l.rate < R.length).map(l => l.l);
  if (jamais.length) A(p === 'tranquille' ? '🟠' : '🔴', 'Niveaux', `${nom} : niveau${jamais.length > 1 ? 'x' : ''} ${jamais.join(', ')} jamais atteint${jamais.length > 1 ? 's' : ''} en ${DAYS} jours.`);
  if (parfois.length) A('🟠', 'Hasard', `${nom} : niveau${parfois.length > 1 ? 'x' : ''} ${parfois.join(', ')} atteint${parfois.length > 1 ? 's' : ''} dans certaines parties seulement.`);
  for (const G of P.goals) {
    if (G.rate === R.length) A(p === 'tranquille' ? '🟠' : '🔴', 'Quêtes', `${nom} : « ${G.n} » jamais terminé en ${DAYS} jours.`);
    else if (G.jour && G.ecart != null && G.ecart > SEUIL.hasard * G.jour && G.ecart >= 4) A('🟠', 'Hasard', `${nom} : « ${G.n} » entre le jour ${G.jour - G.ecart / 2 | 0} et ${G.jour + G.ecart / 2 | 0} selon la partie.`);
  }
  if (P.creux >= SEUIL.creux) A('🟠', 'Rythme', `${nom} : ${P.creux} jours sans rien de nouveau (à partir du jour ${P.creuxDe}).`);
  const top = P.revenus[0]; if (top && top.part > SEUIL.sourceUnique) A('🟠', 'Économie', `${nom} : ${top.part} % des revenus viennent d'une seule chose (${nomObjet(top.id)}).`);
  if (P.depense && P.final > SEUIL.thesaurisation * P.depense) A('🟠', 'Économie', `${nom} : ${Math.round(P.final)} $ à la fin pour ${Math.round(P.depense)} $ dépensés : l'argent s'accumule sans usage.`);
  if (P.finEnergie > SEUIL.energie) A('🟠', 'Goulets', `${nom} : ${P.finEnergie} % des journées finissent par manque d'énergie.`);
  if (P.manque.cailloux > 40) A('🟠', 'Goulets', `${nom} : pierres manquantes ${P.manque.cailloux} % des jours (carrière vide).`);
  if (P.manque.arbres > 40) A('🟠', 'Goulets', `${nom} : bois manquant ${P.manque.arbres} % des jours (plus d'arbres).`);
  if (P.manque.argent > 25) A('🟠', 'Goulets', `${nom} : à court d'argent ${P.manque.argent} % des jours.`);
  if (P.stockFinal > 3 * any.world.standCap) A('🟠', 'Économie', `${nom} : ${P.stockFinal} objets invendus à la fin (l'étal limite les ventes).`);
}
// premiers pas trop lents ?
const gr = out.profils.moyen.goals.find(G => G.id === 'grange');
if (gr && gr.jour > SEUIL.premiersPasLent) A('🔴', 'Début', `Joueur moyen : « Premiers pas » terminé seulement le jour ${gr.jour} (plus de ${SEUIL.premiersPasLent} jours).`);
else if (gr && gr.jour) A('🟢', 'Début', `Joueur moyen : « Premiers pas » terminé le jour ${gr.jour} (${gr.minutes ?? '?'} min de jeu).`);
// écart entre profils
for (const G of out.profils.moyen.goals) {
  const t = out.profils.tranquille.goals.find(x => x.id === G.id), a = out.profils.acharne.goals.find(x => x.id === G.id);
  if (t && a && t.jour && a.jour && t.jour / a.jour > SEUIL.ecartProfils) A('🟠', 'Profils', `« ${G.n} » : jour ${a.jour} pour l'acharné, ${t.jour} pour le tranquille (${Math.round(t.jour / a.jour * 10) / 10} ×).`);
}

// ---------- 4. Évolution depuis le compte rendu précédent ----------
const HIST = join(ROOT, 'docs/equilibrage'); mkdirSync(HIST, { recursive: true });
const prevF = readdirSync(HIST).filter(f => f.endsWith('.json') && f.slice(0, 10) !== out.date).sort().at(-1);
const prev = prevF ? JSON.parse(readFileSync(join(HIST, prevF), 'utf8')) : null;
const evol = [];
if (prev) for (const p of PROFILS) {
  const a = prev.profils[p], b = out.profils[p]; if (!a) continue;
  const d = (x, y, u = '') => x == null || y == null ? '—' : `${x}${u} → ${y}${u}`;
  evol.push(`| ${NOM[p]} | ${d(a.niveauFinal, b.niveauFinal)} | ${d(a.goals.find(g => g.id === 'grange')?.jour, b.goals.find(g => g.id === 'grange')?.jour)} | ${d(Math.round(a.final), Math.round(b.final), ' $')} | ${d(a.finEnergie, b.finEnergie, ' %')} |`);
}
writeFileSync(join(HIST, out.date + '.json'), JSON.stringify({ ...out, alertes }, null, 1));

// ---------- 5. Compte rendu ----------
const fmt = n => n == null ? '—' : Math.round(n).toLocaleString('fr-FR'), J = x => x == null ? 'jamais' : 'j. ' + x;
const L = [`# Compte rendu d'équilibrage — Farmwest ${version}`, '',
  `Généré le ${out.date} par \`node tools/equilibrage.mjs ${DAYS} ${SEEDS.join(',')}\` : ${PROFILS.length} profils de joueur × ${SEEDS.length} parties (graines), ${DAYS} jours de jeu chacune, avec les vraies valeurs du jeu. Les chiffres sont des **médianes** sur les parties.`, '',
  '## Alertes', '', '🔴 à corriger · 🟠 à surveiller · 🟢 bon signe', '',
  ...(alertes.length ? ['| | Zone | Constat |', '|---|---|---|', ...alertes.sort((x, y) => '🔴🟠🟢'.indexOf(x.niveau) - '🔴🟠🟢'.indexOf(y.niveau)).map(a => `| ${a.niveau} | ${a.zone} | ${a.texte} |`)] : ['Aucune alerte.']), '',
  '## Avancée du joueur (quêtes)', '', '| Étape | ' + PROFILS.map(p => NOM[p]).join(' | ') + ' |', '|---|' + PROFILS.map(() => '---').join('|') + '|',
  ...any.goals.map(G => `| ${G.n} | ` + PROFILS.map(p => { const x = out.profils[p].goals.find(y => y.id === G.id); return `${J(x.jour)}${x.minutes != null ? ` (${Math.floor(x.minutes / 60)} h ${String(x.minutes % 60).padStart(2, '0')})` : ''}`; }).join(' | ') + ' |'), '',
  '_(jour de jeu, et entre parenthèses le temps de jeu réel cumulé)_', '',
  '## Niveaux', '', '| Niveau | XP | ' + PROFILS.map(p => NOM[p]).join(' | ') + ' |', '|---|---|' + PROFILS.map(() => '---').join('|') + '|',
  ...out.profils.moyen.levels.map((l, i) => `| ${l.l} | ${fmt(l.xp)} | ` + PROFILS.map(p => J(out.profils[p].levels[i].jour)).join(' | ') + ' |'), '',
  '## Compétences (jour du niveau)', '', '| Niveau | ' + PROFILS.map(p => `Minage ${NOM[p]}`).join(' | ') + ' | ' + PROFILS.map(p => `Bûcheron ${NOM[p]}`).join(' | ') + ' |', '|---|' + PROFILS.map(() => '---').join('|') + '|' + PROFILS.map(() => '---').join('|') + '|',
  ...out.profils.moyen.skills.mining.map((s, i) => `| ${s.l} | ` + PROFILS.map(p => J(out.profils[p].skills.mining[i].jour)).join(' | ') + ' | ' + PROFILS.map(p => J(out.profils[p].skills.wood[i].jour)).join(' | ') + ' |'), '',
  '## Économie', '', '| | ' + PROFILS.map(p => NOM[p]).join(' | ') + ' |', '|---|' + PROFILS.map(() => '---').join('|') + '|',
  ...out.profils.moyen.argent.map((a, i) => `| Argent jour ${a.jour} | ` + PROFILS.map(p => fmt(out.profils[p].argent[i].$) + ' $').join(' | ') + ' |'),
  `| Dépensé (graines, plans) | ` + PROFILS.map(p => fmt(out.profils[p].depense) + ' $').join(' | ') + ' |',
  `| Invendu à la fin | ` + PROFILS.map(p => fmt(out.profils[p].stockFinal) + ' objets').join(' | ') + ' |',
  `| Champ à la fin | ` + PROFILS.map(p => fmt(out.profils[p].champ) + ' carrés').join(' | ') + ' |', '',
  ...PROFILS.map(p => `- **${NOM[p]}** — revenus : ${out.profils[p].revenus.slice(0, 5).map(r => `${nomObjet(r.id)} ${r.part} %`).join(', ') || 'aucun'}.`), '',
  '## Goulets d\'étranglement', '', '| Part des journées… | ' + PROFILS.map(p => NOM[p]).join(' | ') + ' |', '|---|' + PROFILS.map(() => '---').join('|') + '|',
  `| finies par manque d'énergie | ` + PROFILS.map(p => out.profils[p].finEnergie + ' %').join(' | ') + ' |',
  `| finies par manque de temps | ` + PROFILS.map(p => out.profils[p].finTemps + ' %').join(' | ') + ' |',
  ...['argent', 'cailloux', 'arbres'].map(k => `| à court de ${k === 'cailloux' ? 'pierres' : k === 'arbres' ? 'bois' : 'argent'} | ` + PROFILS.map(p => out.profils[p].manque[k] + ' %').join(' | ') + ' |'),
  `| plus long creux sans nouveauté | ` + PROFILS.map(p => `${out.profils[p].creux} j (dès j. ${out.profils[p].creuxDe})`).join(' | ') + ' |',
  `| temps de jeu total | ` + PROFILS.map(p => Math.round(out.profils[p].heuresJeu) + ' h').join(' | ') + ' |', '',
  ...(prev ? ['## Évolution depuis le ' + prevF.slice(0, 10) + ` (version ${prev.version})`, '', '| Profil | Niveau final | « Premiers pas » (jour) | Argent final | Journées sans énergie |', '|---|---|---|---|---|', ...evol, ''] : ['## Évolution', '', 'Premier compte rendu : rien à comparer pour l\'instant.', '']),
  '## Profils simulés', '', '- **Tranquille** : joue jusqu\'à 20 h, marche lentement, ne passe à l\'étal que le soir, ne « farme » pas une fois les objectifs atteints.', '- **Moyen** : hypothèses par défaut de `tools/simulate.mjs` (joue jusqu\'à 22 h).', '- **Acharné** : joue jusqu\'à 23 h 30, va vite, passe souvent à l\'étal.', '',
  '## Analyse et recommandations', '', '_(à compléter par Claude : voir le skill « compte-rendu-equilibrage »)_', '',
  '## Limites de la simulation', '', '- Elle ne joue que ce que `tools/simulate.mjs` sait faire : bois, pierre, carrière, filons, blé et étal, réparations, lit et coffre. Elle ne fait ni cuisine, ni pêche, ni animaux, ni demandes des habitants, ni combat.', `- Le nombre d'arbres de la forêt une fois ouverte est une estimation (${any.world.forestTrees}).`, ''];
writeFileSync(join(ROOT, 'docs/EQUILIBRAGE.md'), L.join('\n'));
console.log(`docs/EQUILIBRAGE.md : ${alertes.filter(a => a.niveau === '🔴').length} 🔴, ${alertes.filter(a => a.niveau === '🟠').length} 🟠, ${alertes.filter(a => a.niveau === '🟢').length} 🟢 (${PROFILS.length * SEEDS.length} parties)${prev ? ', comparé au ' + prevF.slice(0, 10) : ''}`);
