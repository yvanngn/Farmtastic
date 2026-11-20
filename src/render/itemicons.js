// Farmwest (7f) : icônes d'objets en pixel art (16×16, contour sombre), à la place des émojis dans le sac, les
// boutiques, les recettes et le HUD. Dessinées par familles (champignons, fleurs, poissons, minerais, bocaux…).
import { shade, disc, canvas, outline, makeCache } from './pixel.js';
const cache = makeCache(200);

const MUSH = { mousseron: ['#e8dcc0', '#c9b890'], morille: ['#8a6a4a', '#5a4430'], girolle: ['#f2b03a', '#d08a20'], oronge: ['#e85a2a', '#f4f0e0'], cepe: ['#8a4a2a', '#e8d8b0'], truffe_blanche: ['#e8e0cc', '#b8ac90'], pied_mouton: ['#f0e2c8', '#d8c4a0'], trompette: ['#3a3038', '#5a4a52'] };
const FLOW = { paquerette: '#ffffff', violette: '#8a5ac8', muguet: '#f4f4ea', coquelicot: '#e0302a', bleuet: '#4a7ae0', lavande: '#a07ad8', bruyere: '#d070b0', souci: '#f0a020', colchique: '#c890e0', perce_neige: '#eef5f7', hellebore: '#f0c8d8', edelweiss: '#f4f2e8' };
const FISH = { fish: '#8aa8c0', gardon: '#a8b8a0', carpe: '#c8a050', brochet: '#6a8a4a', anguille: '#5a5a3a', sardine: '#9ab8d0', maquereau: '#4a7a9a', dorade: '#e0b0a0', thon: '#3a5a8a', omble: '#c88a6a', truite_givre: '#a8d0e8', lotte_bleue: '#3a6ab0', salmon: '#f08a6a' };
const ORE = { copper_ore: '#d8783a', tin_ore: '#c8ccd0', zinc_ore: '#a8b4bc', cobalt_ore: '#3a5ac8', nickel_ore: '#b8b090', silver_ore: '#e8eef4', iron_ore: '#6a6a72', gold_ore: '#f2c832' };
const SEED = { wheat_seed: '#e6c34a', corn_seed: '#f2d13b', carrot_seed: '#ef7b2a', hay_seed: '#c9b45a' };
const BOWL = { chaudron: '#3a3a40', ragout: '#8a4a2a', soupe_poisson: '#e8b070', tisane: '#8ac06a', flour: '#f4f0e6' };
const JAR = { confiture_mures: '#5a2a5a', confiture_baies: '#4a5ac8', potion: '#60d0a0' };

function draw(id, c) {
  const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const base = id.replace(/_[sml]$/, ''), size = { s: 0, m: 1, l: 2 }[id.slice(-1)] ?? 1;
  if (MUSH[base]) { const [cap, st] = MUSH[base], k = size; R(7, 9 - k, 3, 6 + k, st === cap ? '#f4f0e0' : '#efe6d0'); disc(c, 8, 8 - k, 4 + k, cap); R(5 - k, 8 - k, 7 + k * 2, 1, shade(cap, .7)); R(6, 5 - k, 2, 1, shade(cap, 1.35)); if (base === 'oronge') { R(6, 6 - k, 1, 1, st); R(10, 7 - k, 1, 1, st); } return true; }
  if (FLOW[id]) { R(7, 8, 2, 7, '#3e8a34'); R(9, 11, 3, 1, '#4fa040'); for (const [x, y] of [[8, 3], [5, 6], [11, 6], [8, 9]]) disc(c, x, y, 2, FLOW[id]); disc(c, 8, 6, 1, '#f2c832'); return true; }
  if (FISH[id]) { const f = FISH[id]; disc(c, 7, 8, 4, f); R(3, 6, 9, 5, f); R(12, 5, 3, 7, shade(f, .8)); R(3, 10, 9, 1, shade(f, .75)); R(4, 6, 6, 1, shade(f, 1.3)); R(4, 7, 1, 1, '#1a1a20'); return true; }
  if (ORE[id]) { disc(c, 8, 9, 5, '#6a6672'); disc(c, 7, 8, 4, '#8a8692'); for (const [x, y] of [[5, 7], [9, 9], [7, 11], [10, 6]]) R(x, y, 2, 2, ORE[id]); R(6, 5, 2, 1, '#b4afba'); return true; }
  if (SEED[id]) { R(4, 5, 9, 10, '#d8c49a'); R(4, 5, 9, 2, '#b8a070'); R(6, 3, 5, 2, '#b8a070'); disc(c, 8, 11, 2, SEED[id]); R(5, 14, 7, 1, '#a88a5a'); return true; }
  if (BOWL[id]) { R(2, 7, 13, 2, BOWL[id]); disc(c, 8, 9, 6, '#8a5a32'); R(1, 6, 15, 3, BOWL[id]); R(2, 6, 13, 1, shade(BOWL[id], 1.25)); R(4, 14, 9, 1, '#5b3a22'); R(5, 3, 1, 2, '#e8e8e8'); R(9, 2, 1, 3, '#e8e8e8'); return true; }
  if (JAR[id]) { R(4, 5, 9, 10, JAR[id]); R(5, 6, 2, 7, shade(JAR[id], 1.5)); R(4, 3, 9, 2, '#c9955a'); R(5, 9, 7, 3, '#f4ead2'); return true; }
  const P = {
    wood: () => { R(2, 6, 13, 5, '#8a5a32'); R(2, 6, 13, 1, '#b07a48'); disc(c, 13, 8, 3, '#d9a870'); disc(c, 13, 8, 1, '#8a5a32'); R(4, 11, 9, 1, '#5b3a22'); },
    stone: () => { disc(c, 8, 9, 6, '#6a6672'); disc(c, 7, 8, 5, '#8a8692'); R(5, 5, 3, 1, '#c8c3cc'); R(9, 10, 3, 1, '#57535e'); },
    wheat: () => { for (const x of [5, 8, 11]) { R(x, 6, 1, 9, '#c9a330'); for (let y = 2; y < 8; y += 2) { R(x - 1, y, 1, 2, '#e6c34a'); R(x + 1, y + 1, 1, 2, '#e6c34a'); } } },
    corn: () => { R(6, 3, 5, 10, '#f2d13b'); for (let y = 4; y < 13; y += 2) R(7, y, 3, 1, '#d8b020'); R(4, 7, 2, 8, '#64ad3c'); R(11, 7, 2, 8, '#4a8a2a'); },
    carrot: () => { for (let k = 0; k < 8; k++) R(4 + k, 6 + k, 4 - (k >> 2), 2, '#ef7b2a'); R(3, 3, 2, 4, '#4fa040'); R(5, 2, 2, 4, '#64ad3c'); },
    egg: () => { disc(c, 8, 9, 5, '#fdf6e3'); R(6, 3, 4, 2, '#fdf6e3'); R(6, 6, 2, 2, '#ffffff'); R(5, 13, 6, 1, '#e0d4bc'); },
    hay: () => { R(3, 5, 11, 9, '#e6c34a'); R(3, 5, 11, 2, '#f5dd7a'); for (let x = 4; x < 14; x += 3) R(x, 7, 1, 7, '#c9a330'); R(3, 9, 11, 1, '#8a5a32'); },
    wool: () => { disc(c, 8, 9, 5, '#f4f1ea'); for (let k = 0; k < 4; k++) R(4 + k, 6 + k * 2, 8 - k, 1, '#d8d2c6'); },
    rabbit_wool: () => { disc(c, 8, 9, 5, '#f6dfe6'); R(5, 7, 6, 1, '#e8c0cc'); R(5, 10, 6, 1, '#e8c0cc'); },
    bread: () => { disc(c, 8, 10, 5, '#d9a050'); R(3, 9, 11, 4, '#d9a050'); for (const x of [5, 8, 11]) R(x, 7, 2, 1, '#f2c88a'); R(3, 13, 11, 1, '#9a6a2a'); },
    croissant: () => { for (let k = 0; k < 5; k++) disc(c, 3 + k * 2.5 | 0, 10 - Math.abs(2 - k), 2 + (k === 2), k % 2 ? '#e0a050' : '#c98a3a'); },
    beef: () => { disc(c, 8, 9, 5, '#c84a4a'); disc(c, 7, 8, 3, '#e06a6a'); R(10, 7, 3, 1, '#f4e0d0'); },
    ham: () => { disc(c, 9, 8, 5, '#d0605a'); R(3, 11, 5, 2, '#f4e8d8'); R(2, 12, 2, 2, '#f4e8d8'); },
    sausage: () => { R(3, 7, 11, 4, '#b8503a'); R(4, 7, 9, 1, '#d8705a'); R(2, 8, 1, 2, '#8a3a2a'); R(14, 8, 1, 2, '#8a3a2a'); },
    shrimp: () => { for (let k = 0; k < 6; k++) R(4 + k, 5 + Math.abs(3 - k) * 2, 3, 3, '#f08a6a'); R(3, 4, 1, 3, '#f0a080'); },
    truffle: () => { disc(c, 8, 9, 5, '#4a3628'); R(6, 6, 2, 1, '#6b4a36'); R(9, 10, 2, 1, '#3a2a1e'); },
    berry: () => { for (const [x, y] of [[6, 7], [10, 8], [8, 11]]) { disc(c, x, y, 3, '#4a5ac8'); R(x - 1, y - 2, 1, 1, '#9ab0ff'); } R(8, 3, 1, 3, '#3e8a34'); },
    berry_cooked: () => { for (const [x, y] of [[6, 8], [10, 9]]) { disc(c, x, y, 3, '#c83a4a'); R(x - 1, y - 2, 1, 1, '#ff9aa0'); } R(7, 3, 1, 4, '#3e8a34'); R(9, 3, 1, 4, '#3e8a34'); },
    mure: () => { for (const [x, y] of [[7, 7], [9, 7], [6, 9], [8, 9], [10, 9], [7, 11], [9, 11]]) disc(c, x, y, 1, '#3a1a3a'); R(8, 3, 1, 3, '#3e8a34'); },
    mure_grillee: () => { for (const [x, y] of [[7, 7], [9, 7], [6, 9], [8, 9], [10, 9], [7, 11], [9, 11]]) disc(c, x, y, 1, '#6a2a5a'); R(4, 13, 9, 1, '#5b3a22'); },
    louche: () => { R(9, 2, 2, 9, '#a8acb4'); disc(c, 7, 12, 3, '#c2c7cc'); R(5, 11, 5, 1, '#8a8f96'); },
    bague_cuivre: () => { disc(c, 8, 10, 4, '#d8783a'); disc(c, 8, 10, 2, 'rgba(0,0,0,0)'); c.clearRect(6, 8, 5, 5); disc(c, 8, 5, 2, '#60d0f0'); },
    bonnet: () => { disc(c, 8, 10, 6, '#c84a4a'); R(2, 11, 13, 3, '#f4f0e6'); disc(c, 8, 3, 2, '#f4f0e6'); },
    chest: () => { R(2, 5, 13, 9, '#8a5a32'); R(2, 5, 13, 3, '#a8774a'); R(2, 8, 13, 1, '#5b3a22'); R(7, 7, 3, 4, '#e8c26a'); R(2, 13, 13, 1, '#5b3a22'); },
    manteau: () => { R(4, 3, 9, 12, '#5a3a2a'); R(2, 4, 3, 8, '#4a2e1e'); R(12, 4, 3, 8, '#4a2e1e'); R(8, 3, 1, 12, '#3a2a1e'); R(6, 3, 5, 2, '#e8d8b0'); },
    tent: () => { for (let k = 0; k < 10; k++) R(8 - k * .7 | 0, 4 + k, (k * 1.4 | 0) + 1, 1, k % 3 ? '#c8a050' : '#a8803a'); R(7, 9, 2, 5, '#3a2a20'); R(2, 14, 13, 1, '#6a4a2a'); },
    campfire: () => { for (const [x, y, col] of [[8, 8, '#f2a020'], [8, 9, '#e0502a'], [8, 6, '#ffe07a']]) disc(c, x, y, y === 6 ? 1 : 3, col); R(3, 12, 11, 2, '#7a4f2e'); R(5, 11, 7, 1, '#5b3a22'); },
    backpack: () => { R(4, 4, 9, 11, '#8a5a32'); R(4, 8, 9, 1, '#5b3a22'); R(6, 9, 5, 4, '#a8774a'); R(6, 2, 5, 2, '#5b3a22'); },
    ruby: () => { for (let k = 0; k < 6; k++) R(8 - k, 4 + k, k * 2 + 1, 1, '#e0304a'); for (let k = 0; k < 5; k++) R(4 + k, 10 + k, 9 - k * 2, 1, '#a81a32'); R(6, 6, 2, 2, '#ff9aa8'); },
    emerald: () => { R(5, 3, 7, 11, '#2ab060'); R(4, 5, 9, 7, '#2ab060'); R(6, 4, 2, 6, '#8af0b0'); R(10, 5, 2, 8, '#1a7a40'); },
    slime: () => { disc(c, 8, 10, 5, '#56c45a'); R(3, 10, 11, 4, '#56c45a'); R(5, 8, 2, 2, '#1a3a1a'); R(9, 8, 2, 2, '#1a3a1a'); R(5, 6, 3, 1, '#a8f0a8'); },
    fence: () => { for (const x of [3, 11]) R(x, 3, 2, 12, '#8a5a32'); R(2, 6, 13, 2, '#a8774a'); R(2, 10, 13, 2, '#a8774a'); },
    barbe_papa: () => { disc(c, 8, 6, 5, '#f8a8d0'); disc(c, 6, 5, 2, '#ffd0e8'); R(8, 10, 1, 6, '#e8d8b0'); },
    peluche: () => { disc(c, 8, 10, 4, '#b07a48'); disc(c, 8, 5, 3, '#b07a48'); disc(c, 5, 3, 1, '#8a5a32'); disc(c, 11, 3, 1, '#8a5a32'); R(7, 5, 1, 1, '#2a1d18'); R(9, 5, 1, 1, '#2a1d18'); },
  };
  P.peluche_geante = P.peluche;
  if (P[id]) { P[id](); return true; }
  return false;
}

// URL d'image de l'icône, ou null si l'objet n'a pas encore de dessin (on garde alors son émoji).
export function itemIcon(id) {
  return cache('ii' + id, () => {
    const s = canvas(16, 16), c = s.getContext('2d');
    return draw(id, c) ? outline(s, '#2a1a10').toDataURL() : null;
  });
}
