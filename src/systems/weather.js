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

// Farmwest (7g) : étalonnage selon l'heure — lumière dorée le matin, chaude à midi, orangée puis rose le soir.
// Renvoie [r, g, b, a] à poser par-dessus la scène (a = 0 : rien).
export function timeTint(minute, weather = 'sun') {
  const covered = weather === 'rain' || weather === 'storm' || weather === 'snow' ? .4 : weather === 'cloud' ? .7 : 1;
  if (minute >= 360 && minute < 540) return [255, 196, 110, .13 * (1 - (minute - 360) / 180) * covered];        // 6 h → 9 h : matin doré
  if (minute >= 540 && minute < 960) return [255, 214, 150, .035 * covered];                                     // journée : soleil de l'Ouest
  if (minute >= 960 && minute < 1170) { const k = Math.sin((minute - 960) / 210 * Math.PI); return [255, minute < 1080 ? 150 : 110, minute < 1080 ? 70 : 110, .17 * k * covered]; }   // 16 h → 19 h 30 : orangé puis rose
  return [0, 0, 0, 0];
}
// Ombres portées selon l'heure : décalage horizontal (px) et étirement — vers l'ouest le matin, vers l'est le soir.
export function sunShadow(minute) {
  if (minute < 360 || minute > 1170) return { dx: 0, sx: 1 };
  const k = (minute - 765) / 405;   // -1 à 6 h, 0 vers 12 h 45, +1 à 19 h 30
  return { dx: Math.round(k * 4), sx: 1 + Math.abs(k) * .5 };
}

export const isNight = S => S.minute >= CFG.NIGHT_FROM;
