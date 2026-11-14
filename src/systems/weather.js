import { CFG } from '../config.js';

// r ∈ [0,1) — injecté pour les tests.
export function rollWeather(season, r) {
  if (season === 3) return r < 0.4 ? 'snow' : r < 0.7 ? 'cloud' : 'sun';
  return r < 0.5 ? 'sun' : r < 0.7 ? 'cloud' : r < 0.92 ? 'rain' : 'storm';
}

export const isWet = w => w === 'rain' || w === 'storm';

// Assombrissement de l'écran (0 → 1) selon l'heure et la météo.
export function darkness(S) {
  const night = S.minute > 1080 ? Math.min(0.5, (S.minute - 1080) / 480) : S.minute < 420 ? 0.3 : 0;
  return night + (S.weather === 'storm' ? 0.2 : (S.weather === 'rain' || S.weather === 'cloud') ? 0.1 : 0);
}

export const isNight = S => S.minute >= CFG.NIGHT_FROM;
