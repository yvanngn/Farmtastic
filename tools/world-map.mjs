// 20/11 (demande de l'utilisateur) : la carte « telle qu'elle est vraiment » dans le jeu : chaque zone extérieure dessinée
// d'après sa grille, placée à côté de ses voisines selon ses sorties (porte du bord est → zone à droite, etc.).
// Sortie : docs/carte-reelle.json, puis tools/world-map.py dessine docs/carte-reelle.png.   Lancer : npm run carte
import { writeFileSync } from 'node:fs';
import { SCENES, LAYOUTS } from '../src/world/scenes.js';
import { ground, isHedge, isFarmFence, isCliff, setFarmLot } from '../src/world/map.js';
import { FARM_LINKS } from '../src/data/buildings.js';
import { CFG } from '../src/config.js';
import { REPAIRS } from '../src/data/repairs.js';
setFarmLot(0);
const NAMES = { farm: 'Ferme principale (0)', 'farm:1': 'Ferme du Sud-Ouest (1)', 'farm:2': "Ferme de l'Ouest (2)", 'farm:3': 'Ferme du Nord-Ouest (3)', place: 'Place du panneau', rondpoint: 'Rond-point', quartier: 'Zone résidentielle', ranch: 'Ranch du Maire', parc: 'Fête foraine', port: 'Zone portuaire', town: 'Centre-ville', gare: 'Gare', golgolas: 'Clairière de Golgolas', plage: 'Cabane du pêcheur', montagne: 'Montagne', foret: 'Forêt', carriere: 'Carrière', carriere2: 'Carrière profonde' };
const ZONES = Object.keys(NAMES);
const grid = sc => {
  if (sc !== 'farm') return LAYOUTS[sc];
  const rows = [];
  for (let y = 0; y < CFG.H; y++) { let r = ''; for (let x = 0; x < CFG.W; x++) {
    const inR = Object.values(REPAIRS).some(R => x >= R.x0 && x <= R.x1 && y >= R.y0 && y <= R.y1);
    r += isHedge(x, y) ? 'T' : isFarmFence(x, y) ? 'f' : isCliff(x, y) ? '^' : inR ? 'X' : ({ water: 'w', soil: 's', path: '.', grass: 'g' })[ground(x, y)]; } rows.push(r); }
  return rows;
};
// où mène une porte (zone, direction de sortie)
const target = (sc, d) => {
  if (d.to === 'lot') return d.lot === 0 ? 'farm' : 'farm:' + d.lot;
  if (d.to.startsWith('edge:')) { const lot = sc === 'farm' ? 0 : +sc.slice(5), v = FARM_LINKS[lot][d.to.slice(5)]; return v == null ? null : typeof v === 'number' ? (v === 0 ? 'farm' : 'farm:' + v) : v; }
  return d.to;
};
const out = {};
for (const sc of ZONES) {
  const g = grid(sc), H = g.length, W = g[0].length, doors = [];
  for (const d of SCENES[sc].doors) {
    const to = target(sc, d); if (!to || !ZONES.includes(to)) continue;
    const side = d.x === 0 ? 'W' : d.x === W - 1 ? 'E' : d.y === 0 ? 'N' : d.y === H - 1 ? 'S' : null;
    if (!side) continue;
    doors.push({ x: d.x, y: d.y, to, side });
  }
  out[sc] = { name: NAMES[sc], W, H, grid: g, doors };
}
// placement : on part de la ferme et on pose chaque voisine contre le bord par lequel on y va
const pos = { farm: { x: 0, y: 0 } }, GAP = 4, queue = ['farm'];
while (queue.length) {
  const a = queue.shift(), A = out[a];
  for (const d of A.doors) {
    if (pos[d.to]) continue; const B = out[d.to], back = B.doors.find(o => o.to === a);
    const by = back ? back.y : B.H / 2, bx = back ? back.x : B.W / 2, p = pos[a];
    pos[d.to] = d.side === 'E' ? { x: p.x + A.W + GAP, y: p.y + d.y - by } : d.side === 'W' ? { x: p.x - B.W - GAP, y: p.y + d.y - by }
      : d.side === 'N' ? { x: p.x + d.x - bx, y: p.y - B.H - GAP } : { x: p.x + d.x - bx, y: p.y + A.H + GAP };
    const hit = (q, z) => Object.entries(pos).some(([k, o]) => k !== z && q.x < o.x + out[k].W + 1 && o.x < q.x + out[z].W + 1 && q.y < o.y + out[k].H + 1 && o.y < q.y + out[z].H + 1);
    const step = { E: [1, 0], W: [-1, 0], N: [0, -1], S: [0, 1] }[d.side];
    for (let k = 0; k < 200 && hit(pos[d.to], d.to); k++) { pos[d.to].x += step[0] * 2; pos[d.to].y += step[1] * 2; }   // pas de chevauchement : on l'écarte
    queue.push(d.to);
  }
}
for (const sc of ZONES) out[sc].pos = pos[sc] || null;
writeFileSync(new URL('../docs/carte-reelle.json', import.meta.url), JSON.stringify(out));
console.log('zones placées :', Object.keys(pos).length, '/', ZONES.length, ZONES.filter(z => !pos[z]).join(' '));
