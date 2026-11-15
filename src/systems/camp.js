// Campement du début : la tente se pose à côté de la cabane ; y dormir ne rend que 50 % de l'énergie
// (le temps de rebâtir la maison et d'y construire un lit). On peut la replier pour la revendre plus tard.
import { CFG } from '../config.js';
import { inRect, isPath, isSolid, key } from '../world/map.js';
import { add } from './inventory.js';
import { newDay } from './time.js';

export const TENT_ZONE = { x0: 1, y0: 5, x1: 9, y1: 9 };   // « à côté de la maison »
export const TENT_ENERGY = 0.5;

export function canPitch(S, x, y) {
  return (S.scene || 'farm') === 'farm' && !S.tent && inRect(x, y, TENT_ZONE.x0, TENT_ZONE.y0, TENT_ZONE.x1, TENT_ZONE.y1)
    && !isPath(x, y) && !isSolid(S, x, y) && !(S.tilled && S.tilled[key(x, y)]) && !(S.plots && S.plots[key(x, y)]);
}
export function pitchTent(g, x, y) {
  const S = g.S;
  if (!(S.inv.tent > 0)) return false;
  if (!canPitch(S, x, y)) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', '⛺ Pose ta tente sur l’herbe, juste à côté de la cabane.'); return false; }
  add(g, 'tent', -1); S.tent = { x, y };
  if (S.sel === 'tent') S.sel = 'hand';
  g.bus.emit('sfx', 'collect'); g.bus.emit('toast', '⛺ Tente montée ! Tu pourras y dormir à partir de 18h.');
  return true;
}
export const tentAt = (S, x, y) => !!(S.tent && (S.scene || 'farm') === 'farm' && S.tent.x === x && S.tent.y === y);

export function foldTent(g) {
  const S = g.S;
  if (!S.tent) return false;
  S.tent = null; add(g, 'tent', 1);
  g.bus.emit('sfx', 'collect'); g.bus.emit('toast', '⛺ Tente repliée dans ton sac.');
  return true;
}

// Dormir sous la tente : nouvelle journée, mais seulement 50 % d'énergie.
export function sleepTent(g) {
  const S = g.S;
  if (S.minute < CFG.SLEEP_FROM) { g.bus.emit('toast', 'Trop tôt pour dormir (après 18h)'); return false; }
  const t = S.tent;
  newDay(g, true);
  S.energy = Math.round(S.maxE * TENT_ENERGY);
  ((S.quests ||= {}).debut ||= {}).dormi = true;
  S.x = t.x + .5; S.y = t.y + 1.6; S.scene = 'farm';
  g.bus.emit('sfx', 'sleep'); g.bus.emit('toast', 'Nuit sous la tente… le sol est dur (50 % d’énergie) ⛺');
  return true;
}

// Toucher la tente : dormir, la replier ou rien.
export function useTent(g) {
  g.bus.emit('say', { name: g.S.name, color: '#ffdf8a', lines: ['Ma tente. Pas très confortable, mais ça dépanne.'],
    choices: ['Dormir', 'Replier la tente', 'Rien.'],
    onChoose: i => { if (i === 0) sleepTent(g); else if (i === 1) foldTent(g); } });
  return true;
}

// Déployer la tente depuis le sac (tuto de l'inventaire) : sur la case libre la plus proche, à côté de la cabane.
export function deployTent(g) {
  const S = g.S;
  if (!(S.inv.tent > 0)) return false;
  let best = null;
  for (let y = TENT_ZONE.y0; y <= TENT_ZONE.y1; y++) for (let x = TENT_ZONE.x0; x <= TENT_ZONE.x1; x++) {
    const d = Math.hypot(x + .5 - S.x, y + .5 - S.y);
    if (canPitch(S, x, y) && d > 1 && (!best || d < best.d)) best = { x, y, d };
  }
  if (!best || best.d > 5) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', '⛺ Va juste à côté de ta cabane (au nord du chemin) pour déployer la tente.'); return false; }
  return pitchTent(g, best.x, best.y);
}

// À 18h, la première fois : on explique la nuit, la tente et la clinique.
export const NIGHT_TIP = [
  '🌙 Il est 18h : la nuit tombe.',
  'Dors sous ta tente pour récupérer ton énergie (touche la tente → Dormir).',
  "Si tu ne dors pas, tu ne récupères rien le lendemain. Et si ton énergie tombe à 0, tu t'effondres : réveil à la clinique, avec 10 % de frais !"
];
export function nightTip(g) {
  const S = g.S, q = ((S.quests ||= {}).debut ||= {});
  if (q.nuit || S.minute < CFG.SLEEP_FROM || q.dormi) return false;
  q.nuit = true;
  g.bus.emit('say', { name: 'Conseil', color: '#ffdf8a', lines: NIGHT_TIP });
  return true;
}
