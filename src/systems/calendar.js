// 19/11 : le grand panneau de la place : météo du jour et des 3 jours suivants, événements à venir. Logique pure.
import { CFG } from '../config.js';
import { rollWeather } from './weather.js';
import { FESTIVALS } from '../data/requests.js';
export const FORECAST_DAYS = 3;
const DE = ['du printemps', "de l'été", "de l'automne", "de l'hiver"];
const M = () => CFG.MONTH_DAYS;
// Jour n après aujourd'hui → { day, season, year, idx (dayIndex), wd (0 = lundi) }
export function dayAfter(S, n) {
  const idx0 = ((S.year || 1) - 1) * 4 * M() + (S.season || 0) * M() + (S.day || 1), idx = idx0 + n, z = idx - 1;
  return { idx, day: z % M() + 1, season: Math.floor(z / M()) % 4, year: Math.floor(z / (4 * M())) + 1, wd: z % 7 };
}
// Prévisions : S.forecast[k] = météo du jour J+1+k (tirées d'avance, pour qu'elles soient justes).
export function ensureForecast(g) {
  const S = g.S; S.forecast ||= [];
  while (S.forecast.length < FORECAST_DAYS) S.forecast.push(rollWeather(dayAfter(S, S.forecast.length + 1).season, g.rnd()));
  return S.forecast;
}
// Au matin (après S.day++) : la météo du jour est celle prévue la veille.
export function forecastNewDay(g) {
  const S = g.S, next = S.forecast && S.forecast.length ? S.forecast.shift() : null;
  if (next) S.weather = next;
  ensureForecast(g);
}
// Événements des `span` prochains jours (aujourd'hui compris), triés.
export function upcoming(S, span = 14) {
  const out = [];
  for (let n = 0; n < span; n++) {
    const d = dayAfter(S, n);
    if (d.day === 1 && n > 0) out.push({ n, d, ic: '🍂', t: 'Début ' + DE[d.season] });
    if (d.day === M()) out.push({ n, d, ic: '🎉', t: `${FESTIVALS[d.season]} : dernier jour pour les commandes de la fête` });   // 💡
    if (d.wd === 5) out.push({ n, d, ic: '🛌', t: 'Week-end : les habitants ne travaillent pas' });
  }
  return out;
}
