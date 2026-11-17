// Exporte toutes les répliques des PNJ dans docs/DIALOGUES.md, avec 🆕 sur celles pas encore validées.
// Validées = présentes dans tools/dialogues_valides.txt (une réplique par ligne).
// Usage : node tools/export-dialogues.mjs            → écrit le fichier et affiche le nombre de 🆕
//         node tools/export-dialogues.mjs --valider  → marque toutes les répliques actuelles comme validées
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { NPCS, INTRO_LINES, GHOST_LINES, INTRO_MYST } from '../src/data/npcs.js';
import { NIGHT_TIP } from '../src/systems/camp.js';
import { EXAMINE } from '../src/data/examine.js';

const VALID = new URL('./dialogues_valides.txt', import.meta.url), OUT = new URL('../docs/DIALOGUES.md', import.meta.url);
const valid = new Set(existsSync(VALID) ? readFileSync(VALID, 'utf8').split('\n').filter(Boolean) : []);
const all = [];
for (const n of Object.values(NPCS)) {
  const add = (where, t) => all.push({ npc: n.name, where, t });
  (n.welcomeLines || []).forEach(t => add('accueil', t));
  (n.arrival || []).forEach(t => add('accueil (il somnolait devant la cabane)', t));
  (n.clinic || []).forEach(t => add('à la clinique (après un malaise)', t));
  (n.clinicRepos || []).forEach(t => add('à la clinique, appelée pendant son jour de repos', t));
  (n.clinicNuit || []).forEach(t => add('à la clinique, appelée la nuit', t));
  if (n.welcomeEnd) { add('accueil (réponse du joueur)', n.welcomeEnd.t); add('accueil', n.welcomeEnd.r); }
  (n.story || []).forEach(l => add(`histoire ${l.h} ♥`, l.t));
  (n.topics || []).forEach(tp => { add('sujet (joueur)', tp.t); tp.lines.forEach(t => add('sujet', t)); });
  (n.questions || []).forEach(q => { add(`question ${q.h} ♥`, q.q); q.a.forEach(a => { add(`réponse du joueur (${a.pts > 0 ? '+' : ''}${a.pts})`, a.t); add('réaction', a.r); }); });
  (n.chat || []).forEach(t => add('conversation', t));
  for (const [k, t] of Object.entries(n.react || {})) add(`cadeau : ${k}`, t);
  for (const k of ['already', 'night', 'thanks']) if (typeof n[k] === 'string') add(k === 'already' ? 'cadeau : déjà offert' : k, n[k]);
}
for (const t of NIGHT_TIP) all.push({ npc: 'Conseil (à 18h)', where: 'nuit', t });
for (const t of Object.values(GHOST_LINES).flat()) all.push({ npc: 'Le héros (quête Ghostbuster)', where: 'nuit', t });
for (const [k, v] of Object.entries(INTRO_MYST)) for (const t of v) all.push({ npc: 'Myst (nouveau début : ' + k + ')', where: 'intro', t: typeof t === 'string' ? t : t.t });
for (const t of INTRO_LINES) all.push({ npc: 'Le héros (arrivée en train)', where: 'intro', t });
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
