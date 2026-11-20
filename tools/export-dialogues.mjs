// Exporte toutes les répliques des PNJ dans docs/DIALOGUES.md, avec 🆕 sur celles pas encore validées.
// Validées = présentes dans tools/dialogues_valides.txt (une réplique par ligne).
// Usage : node tools/export-dialogues.mjs            → écrit le fichier et affiche le nombre de 🆕
//         node tools/export-dialogues.mjs --valider  → marque toutes les répliques actuelles comme validées
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { NPCS, INTRO_LINES, GHOST_LINES, INTRO_MYST, DREAMS, CRAFT_LINES } from '../src/data/npcs.js';
import { NIGHT_TIP } from '../src/systems/camp.js';
import { EXAMINE } from '../src/data/examine.js';
// 20/11 : aussi les textes de quêtes et de tuto (courrier, conseils, messages à l'écran)
import { QUESTS } from '../src/systems/quests.js';
import { SEED_MAIL, TUTO } from '../src/systems/mail.js';
import { LETTER } from '../src/systems/golgolas.js';
import { SELL_TIP } from '../src/systems/inventory.js';
import { readdirSync } from 'node:fs';

const VALID = new URL('./dialogues_valides.txt', import.meta.url), OUT = new URL('../docs/DIALOGUES.md', import.meta.url);
const valid = new Set(existsSync(VALID) ? readFileSync(VALID, 'utf8').split('\n').filter(Boolean) : []);
const all = [];
for (const n of Object.values(NPCS)) {
  const add = (where, t) => all.push({ npc: n.name, where, t });
  (n.welcomeLines || []).forEach(t => add('accueil', t));
  (n.arrival || []).forEach(t => add('accueil (il somnolait devant la cabane)', t));
  (n.clinic || []).forEach(t => add('à la clinique (après un malaise)', t));
  (n.chest || []).forEach(t => add('quête du coffre', t));
  (n.ask || []).forEach(t => add('quête du four : demande', t));
  if (n.reminder) add('quête du four : rappel', n.reminder);
  (n.thanks || []).forEach(t => add('quête du four : merci', t));
  (n.clinicRepos || []).forEach(t => add('à la clinique, appelée pendant son jour de repos', t));
  (n.clinicNuit || []).forEach(t => add('à la clinique, appelée la nuit', t));
  if (n.welcomeEnd) { add('accueil (réponse du joueur)', n.welcomeEnd.t); add('accueil', n.welcomeEnd.r); }
  (n.story || []).forEach(l => add(`histoire ${l.h} ♥`, l.t));
  (n.topics || []).forEach(tp => { add('sujet (joueur)', tp.t); tp.lines.forEach(t => add('sujet', t)); });
  (n.questions || []).forEach(q => { add(`question ${q.h} ♥`, q.q); q.a.forEach(a => { add(`réponse du joueur (${a.pts > 0 ? '+' : ''}${a.pts})`, a.t); add('réaction', a.r); }); });
  (n.chat || []).forEach(t => add('conversation', t));
  for (const [k, t] of Object.entries(n.react || {})) add(`cadeau : ${k}`, t);
  for (const k of ['already', 'night', 'thanks']) if (typeof n[k] === 'string') add(k === 'already' ? 'cadeau : déjà offert' : k, n[k]);
  // 20/11 : toutes les autres répliques (quêtes : étal de Suzie, chaudron de Remy, os de Rox…), repérées automatiquement
  const DONE = new Set(['welcomeLines', 'arrival', 'clinic', 'chest', 'ask', 'reminder', 'thanks', 'clinicRepos', 'clinicNuit', 'welcomeEnd', 'story', 'topics', 'questions', 'chat', 'react', 'already', 'night', 'traits', 'name', 'title', 'id', 'de', 'color', 'voice', 'home']);
  const QUETE = { etal: 'quête « Le premier étal »', etalFin: 'quête « Le premier étal » : première vente', chaudron: 'quête « La cuisine du chef »' };
  for (const [k, v] of Object.entries(n)) {
    if (DONE.has(k)) continue;
    const lines = typeof v === 'string' ? [v] : Array.isArray(v) && v.every(x => typeof x === 'string') ? v : [];
    for (const t of lines) if (t.length > 12 && / /.test(t)) add(QUETE[k] || k, t);
  }
}
for (const t of NIGHT_TIP) all.push({ npc: 'Conseil (à 18h)', where: 'nuit', t });
for (const t of Object.values(GHOST_LINES).flat()) all.push({ npc: 'Le héros (quête Ghostbuster)', where: 'nuit', t });
for (const [k, v] of Object.entries(INTRO_MYST)) for (const t of v) all.push({ npc: 'Myst (nouveau début : ' + k + ')', where: 'intro', t: typeof t === 'string' ? t : t.t });
for (const t of Object.values(CRAFT_LINES)) all.push({ npc: 'Tous les habitants (demandes de fabrication, lot 9)', where: 'demande', t });
for (const t of DREAMS) all.push({ npc: 'Le héros (rêves de la nuit, lot 8)', where: 'nuit', t });
for (const t of INTRO_LINES) all.push({ npc: 'Le héros (arrivée en train)', where: 'intro', t });
// 20/11 : quêtes (titres et étapes) et tutos
for (const [id, q] of Object.entries(QUESTS)) { all.push({ npc: 'Quêtes (journal)', where: `${q.main ? 'principale' : 'secondaire'} « ${q.n} » : titre`, t: q.n }); for (const st of q.steps) all.push({ npc: 'Quêtes (journal)', where: `« ${q.n} » : étape`, t: st.t }); }
for (const t of [...SEED_MAIL, ...TUTO]) all.push({ npc: 'Courrier (graines de blé et tuto du champ)', where: 'courrier', t });
for (const t of LETTER) all.push({ npc: 'Courrier (lettre de Golgolas)', where: 'courrier', t });
for (const t of SELL_TIP) all.push({ npc: 'Tuto (conseils à l’écran)', where: 'vente', t });
{ // conseils et messages écrits en dur dans le code : tip(g, 'id', '…') et emit('toast', '…') (texte fixe seulement)
  const files = ['systems', 'ui'].flatMap(d => readdirSync(new URL(`../src/${d}/`, import.meta.url)).filter(f => f.endsWith('.js')).map(f => [d, f])).concat([['', 'main.js']]);
  const seen = new Set(), tips = [], msgs = [];
  for (const [d, f] of files) {
    const src = readFileSync(new URL(`../src/${d ? d + '/' : ''}${f}`, import.meta.url), 'utf8');
    for (const m of src.matchAll(/tip\(g, '([^']+)', '((?:[^'\\]|\\.)*)'\)/g)) { const t = m[2].replace(/\\'/g, "'"); if (!seen.has(t)) { seen.add(t); tips.push({ npc: 'Tuto (conseils à l’écran)', where: `${f} : ${m[1]}`, t }); } }
    for (const m of src.matchAll(/emit\('toast', '((?:[^'\\]|\\.)*)'\)/g)) { const t = m[1].replace(/\\'/g, "'"); if (t.length > 20 && !seen.has(t)) { seen.add(t); msgs.push({ npc: 'Messages à l’écran', where: f, t }); } }
  }
  const ti = all.findIndex(l => l.npc === 'Tuto (conseils à l’écran)'); all.splice(ti < 0 ? all.length : ti + 1 + all.filter(l => l.npc === 'Tuto (conseils à l’écran)').length - 1, 0, ...tips); all.push(...msgs);
}
for (const [k, t] of Object.entries(EXAMINE.farm)) all.push({ npc: 'Décor (le héros commente)', where: k, t });
for (const [k, t] of Object.entries(EXAMINE.tiles)) all.push({ npc: 'Décor (le héros commente)', where: k, t });
if (process.argv.includes('--valider')) {
  writeFileSync(VALID, [...new Set(all.map(l => l.t))].join('\n') + '\n');
  console.log(`${all.length} répliques marquées comme validées.`);
} else {
  let md = "# Dialogues de Farmwest\n\n🆕 = réplique pas encore validée. Corrige directement le texte, puis renvoie-le.\n", num = 0, nouv = 0, cur = '';
  for (const l of all) {
    if (l.npc !== cur) { md += `\n## ${l.npc}\n\n`; cur = l.npc; }
    const isNew = !valid.has(l.t); if (isNew) nouv++;
    md += `${++num}. *(${l.where})* ${l.t}${isNew ? ' 🆕' : ''}\n`;
  }
  writeFileSync(OUT, md);
  console.log(`${num} répliques, dont ${nouv} 🆕 à valider → docs/DIALOGUES.md`);
}
