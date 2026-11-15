// Génère index.html (GitHub Pages) à partir de play.html (page claude.ai) : même contenu, avec doctype et <head>.
// À lancer après chaque modification de play.html : node tools/build-index.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const play = readFileSync(new URL('../play.html', import.meta.url), 'utf8');
const head = [], body = [];
for (const line of play.split('\n')) (/^<(meta|title|link|script src|style)/.test(line) && !body.length ? head : body).push(line);
const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
${head.filter(l => !/charset|name="viewport"/.test(l)).join('\n')}
</head>
<body>
${body.join('\n').trim()}
</body>
</html>
`;
writeFileSync(new URL('../index.html', import.meta.url), html);
console.log('index.html régénéré depuis play.html');
