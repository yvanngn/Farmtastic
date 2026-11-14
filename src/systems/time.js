// Temps qui passe, jours, saisons, sommeil.
import { CFG } from '../config.js';
import { SPAWN } from '../world/map.js';
import { rollWeather } from './weather.js';
import { animalsNewDay } from './animals.js';
import { socialNewDay } from './social.js';
import { regrow } from './resources.js';

export function tickTime(g, dtMs) {
  g.timeAcc += dtMs;
  while (g.timeAcc >= CFG.MS_PER_MIN) {
    g.timeAcc -= CFG.MS_PER_MIN;
    g.S.minute++;
    if (g.S.minute >= CFG.DAY_END) { newDay(g, false); return; }
  }
}

export function newDay(g, slept) {
  const S = g.S;
  S.day++;
  if (S.day > 28) { S.day = 1; S.season = (S.season + 1) % 4; if (S.season === 0) S.year++; }
  S.minute = CFG.DAY_START;
  g.timeAcc = 0;
  S.energy = slept ? S.maxE : Math.round(S.maxE * 0.6);
  if (!slept) {
    S.money = Math.round(S.money * 0.9);
    S.x = SPAWN.x; S.y = SPAWN.y;
    g.bus.emit('toast', "Évanoui de fatigue… -10% d'argent");
  }
  S.weather = rollWeather(S.season, g.rnd());
  animalsNewDay(S);
  socialNewDay(S);
  regrow(g);
  g.enemies.length = 0;
  g.bus.emit('newDay', { slept });
}

export function sleep(g) {
  if (g.S.minute < CFG.SLEEP_FROM) { g.bus.emit('toast', 'Trop tôt pour dormir (après 18h)'); return false; }
  newDay(g, true);
  g.bus.emit('sfx', 'sleep');
  g.bus.emit('toast', 'Bonne nuit… 🌙');
  return true;
}

export function fmtTime(m) {
  const h = Math.floor(m / 60) % 24, mm = m % 60;
  return String(h).padStart(2, '0') + ':' + String(mm - mm % 10).padStart(2, '0');
}
