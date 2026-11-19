import { standNewDay } from './stand.js';
import { cropsNewDay } from './farming.js';
import { mailNewDay } from './mail.js';
// Temps qui passe, jours, saisons, sommeil.
import { CFG } from '../config.js';
import { SPAWN } from '../world/map.js';
import { rollWeather } from './weather.js';
import { rollRainbow } from './nature.js';
import { animalsNewDay } from './animals.js';
import { socialNewDay } from './social.js';
import { regrow, seasonRestock } from './resources.js';
import { syncForest } from '../world/scenes.js';
import { toClinic } from './clinic.js';
import { DREAMS } from '../data/npcs.js';

export function tickTime(g, dtMs) {
  g.timeAcc += dtMs;
  while (g.timeAcc >= CFG.MS_PER_MIN) {
    g.timeAcc -= CFG.MS_PER_MIN;
    g.S.minute++;
    if (g.S.minute === CFG.SLEEP_FROM) remind18(g);
    if (g.S.minute >= CFG.BED_LIMIT) { newDay(g, false); toClinic(g, 'nuit'); return; }
  }
}

export function newDay(g, slept) {
  const S = g.S;
  S.day++;
  let newSeason = false;
  if (S.day > 28) { S.day = 1; S.season = (S.season + 1) % 4; if (S.season === 0) S.year++; newSeason = true; }
  S.minute = CFG.DAY_START;
  g.timeAcc = 0;
  if (slept) S.energy = S.maxE;
  else g.bus.emit('toast', "🌙 Nuit passée dehors sans dormir : aucune énergie récupérée. Dors sous ta tente !");   // l'énergie reste comme elle était
  S.weather = rollWeather(S.season, g.rnd());
  rollRainbow(g);
  animalsNewDay(S);
  socialNewDay(S);
  regrow(g);
  cropsNewDay(S); mailNewDay(g); standNewDay(g);   // 19/11 : l'étal vend pendant la nuit
    // 18/11 : le blé mûrit en un jour ; courrier des graines le lendemain de la pelle
  if (newSeason && S.objs) seasonRestock(g);
  if (newSeason) syncForest(S);   // lot 11 : nouveau labyrinthe dans la forêt   // lot 8 : la nature reprend ses droits à chaque saison
  g.enemies.length = 0;
  g.bus.emit('newDay', { slept });
}

// Lot 8 : transition de la nuit — un court moment où l'énergie remonte, un rêve ou une prémonition, puis sauvegarde automatique
// (l'interface écoute 'night' ; la sauvegarde suit l'événement 'newDay').
export function pickDream(g) {
  const S = g.S; let i = g.rnd() * DREAMS.length | 0;
  if (i === S.lastDream) i = (i + 1) % DREAMS.length;   // jamais deux fois de suite le même
  S.lastDream = i; return DREAMS[i];
}
export function nightTransition(g, from) {
  const S = g.S, n = { from: Math.max(0, Math.round(from)), to: Math.round(S.energy), max: S.maxE, dream: pickDream(g), name: S.name };
  g.bus.emit('night', n); return n;
}

export function sleep(g) {
  if (g.S.minute < CFG.SLEEP_FROM) { g.bus.emit('toast', 'Trop tôt pour dormir (après 18h)'); return false; }
  const from = g.S.energy;
  newDay(g, true);
  nightTransition(g, from);
  ((g.S.quests ||= {}).debut ||= {}).dormi = true;
  g.bus.emit('sfx', 'sleep');
  g.bus.emit('toast', 'Bonne nuit… 🌙');
  return true;
}

export function fmtTime(m) {
  const h = Math.floor(m / 60) % 24, mm = m % 60;
  return String(h).padStart(2, '0') + ':' + String(mm - mm % 10).padStart(2, '0');
}

// Rappel de 18h, chaque soir après le premier conseil.
export function remind18(g) {
  const S = g.S, q = (S.quests || {}).debut || {};
  if (!q.nuit) return false;   // le premier soir, c'est le grand conseil (nightTip)
  g.bus.emit('toast', '🌙 18h : pense à aller dormir bientôt. Pas couché(e) à 1h → infirmerie (10 % de frais) !');
  return true;
}
