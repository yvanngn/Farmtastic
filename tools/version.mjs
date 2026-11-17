// Semver horodaté de Farmwest.
//   node tools/version.mjs          → patch +1 (à chaque publication)
//   node tools/version.mjs minor    → mineure +1, patch à 0 (seulement sur demande de l'utilisateur)
//   node tools/version.mjs major    → majeure +1, mineure et patch à 0 (seulement sur demande)
//   node tools/version.mjs show     → affiche la version sans rien changer
// Met à jour src/version.js, package.json et ajoute une ligne à docs/VERSIONS.md. Heure de Paris.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { VERSION } from '../src/version.js';

const kind = process.argv[2] || 'patch', note = process.argv.slice(3).join(' ');
const v = { ...VERSION };
if (kind !== 'show') {
  if (kind === 'major') { v.major++; v.minor = 0; v.patch = 0; }
  else if (kind === 'minor') { v.minor++; v.patch = 0; }
  else v.patch++;
  const p = Object.fromEntries(new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
  v.date = `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
  const f = 'src/version.js', src = readFileSync(f, 'utf8');
  writeFileSync(f, src.replace(/export const VERSION = \{[^}]*\};/, `export const VERSION = { major: ${v.major}, minor: ${v.minor}, patch: ${v.patch}, date: '${v.date}' };`));
  const pk = JSON.parse(readFileSync('package.json', 'utf8')); pk.version = `${v.major}.${v.minor}.${v.patch}`;
  writeFileSync('package.json', JSON.stringify(pk, null, 2) + '\n');
  const log = 'docs/VERSIONS.md', head = '# Versions de Farm\'tastic\n\nSemver horodaté (heure de Paris). Patch automatique à chaque publication ; mineure et majeure sur décision de l\'utilisateur.\n\n';
  const old = existsSync(log) ? readFileSync(log, 'utf8').replace(head, '') : '';
  writeFileSync(log, head + `- **${v.major}.${v.minor}.${v.patch}** — ${v.date.replace('T', ' ')}${note ? ' — ' + note : ''}\n` + old);
}
console.log(`v${v.major}.${v.minor}.${v.patch} (${v.date.replace('T', ' ')})`);
