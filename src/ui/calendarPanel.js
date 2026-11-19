// 19/11 : fenêtre du grand panneau de la place : météo (aujourd'hui + 3 jours) et événements à venir.
import { CFG } from '../config.js';
import { WEATHER_LABELS, SEASONS } from '../data/look.js';
import { ensureForecast, upcoming, dayAfter } from '../systems/calendar.js';

export function createCalendarPanel(g, audio) {
  const ov = document.createElement('div');
  ov.id = 'ovCalendar'; ov.className = 'overlay';
  ov.innerHTML = '<div class="panel box"><div class="row" style="justify-content:space-between;margin:0"><h2>📅 Le grand panneau</h2><button id="calClose" aria-label="Fermer">✕</button></div><div id="calBody"></div></div>';
  document.body.appendChild(ov);
  const body = ov.querySelector('#calBody');
  ov.querySelector('#calClose').onclick = () => { audio.play('ui'); ov.classList.remove('on'); };
  const when = n => n === 0 ? "Aujourd'hui" : n === 1 ? 'Demain' : `${CFG.WEEKDAYS[dayAfter(g.S, n).wd]} ${dayAfter(g.S, n).day}`;
  function open() {
    const S = g.S, fc = ensureForecast(g), days = [S.weather || 'sun', ...fc];
    const meteo = days.map((w, n) => `<div class="cal-day"><small>${n === 0 ? "Aujourd'hui" : n === 1 ? 'Demain' : 'J+' + n}</small><b>${WEATHER_LABELS[w] || w}</b></div>`).join('');
    const ev = upcoming(S).map(e => `<div class="sell-row"><span class="sell-ic">${e.ic}</span><div class="sell-n"><b>${e.t}</b><small>${when(e.n)} · ${SEASONS[e.d.season]}</small></div></div>`).join('');
    body.innerHTML = `<p class="info">${CFG.WEEKDAYS[dayAfter(S, 0).wd]} ${S.day} · ${SEASONS[S.season]} · an ${S.year || 1}</p><h4>Météo</h4><div class="cal-meteo">${meteo}</div><h4>À venir</h4>${ev || '<p class="info">Rien de prévu.</p>'}`;
    ov.classList.add('on');
  }
  return { open };
}
