// Exporte un PNG par personnage (docs/personnages/<id>.png) depuis la poupée dessinée par le code (src/render/paperdoll.js),
// puis docs/PERSONNAGES.md (planches intégrées, pour le Projet claude.ai). À relancer après un changement de tenue.
// Planche : 4 lignes (face, dos, gauche, droite) × 9 images (arrêt + 8 pas de marche), 36 × 60 par image.
// Usage : node tools/export-personnages.cjs   (Playwright et Chromium déjà installés)
const http = require('http'), fs = require('fs'), path = require('path'), { chromium } = require('playwright');
const ROOT = path.dirname(__dirname), OUT = path.join(ROOT, 'docs/personnages');
const PAGE = `<meta charset="utf-8"><script type="module">
import { paperDoll, PD_W, PD_H } from './src/render/paperdoll.js'; import * as N from './src/data/npcs.js'; import { defaultState } from './src/core/state.js';
const seen = new Set(), list = [{ id: 'cloud', name: 'Cloud (héros)', look: defaultState().look }, ...Object.values(N).filter(n => n && n.look && n.id && !seen.has(n.id) && seen.add(n.id))];
const out = [];
for (const n of list) { const c = document.createElement('canvas'); c.width = PD_W * 9; c.height = PD_H * 4; const g = c.getContext('2d');
  [0, 1, 2, 3].forEach((d, r) => { for (let f = 0; f <= 8; f++) g.drawImage(paperDoll(n.look, d, f), f * PD_W, r * PD_H); });
  out.push({ id: n.id, name: n.name + (n.title ? ', ' + n.title : ''), url: c.toDataURL() }); }
window.OUT = out; document.title = 'done';</script>`;
const TYPES = { '.js': 'text/javascript', '.html': 'text/html' };
const srv = http.createServer((q, r) => {
  if (q.url === '/_export.html') { r.writeHead(200, { 'content-type': 'text/html' }); return r.end(PAGE); }
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
}).listen(0, async () => {
  const b = await chromium.launch(), p = await b.newPage();
  await p.goto(`http://localhost:${srv.address().port}/_export.html`); await p.waitForFunction(() => document.title === 'done');
  const list = await p.evaluate(() => window.OUT); await b.close(); srv.close();
  fs.mkdirSync(OUT, { recursive: true });
  const md = ['# Personnages de Farmwest', '', 'Dessinés par le code (`src/render/paperdoll.js`). Planche : 4 lignes (face, dos, profil gauche, profil droit) × 9 images (arrêt + 8 pas de marche), 36 × 60 par image. PNG : `docs/personnages/`. Généré par `node tools/export-personnages.cjs`.', ''];
  for (const n of list) { fs.writeFileSync(path.join(OUT, n.id + '.png'), Buffer.from(n.url.split(',')[1], 'base64')); md.push('## ' + n.name, '', `![${n.name}](${n.url})`, ''); }
  fs.writeFileSync(path.join(ROOT, 'docs/PERSONNAGES.md'), md.join('\n'));
  console.log(list.length + ' personnages exportés : ' + list.map(n => n.id).join(', '));
});
