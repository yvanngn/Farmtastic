// HUD compact (nom, argent, heure, météo, énergie, vie) + icône du bouton d'action.
// Rafraîchi 4×/s maximum (pas à chaque frame).
import { $ } from './dom.js';
import { ITEMS, TOOLS } from '../data/items.js';
import { SEASONS, WEATHER_LABELS } from '../data/look.js';
import { fmtTime } from '../systems/time.js';
import { iconHTML } from './icons.js';

export function selIcon(S) {
  const t = TOOLS.find(x => x.id === S.sel);
  return t ? t.i : ITEMS[S.sel] ? ITEMS[S.sel].i : '✋';
}

// Jauge qui vire au orange puis au rouge vif, et tremble juste avant le rouge (et dans le rouge) pour alerter.
export const gaugeLevel = r => r <= LOW_RED ? 'rouge' : r <= LOW_ORANGE ? 'orange' : 'ok';
export const LOW_ORANGE = .5, LOW_RED = .2, SHAKE_FROM = .3;
function gauge(id, r) {
  const el = $('#' + id), bar = el.parentElement, lvl = gaugeLevel(r);
  el.style.width = Math.max(0, Math.min(1, r)) * 100 + '%';
  bar.classList.toggle('orange', lvl === 'orange'); bar.classList.toggle('rouge', lvl === 'rouge');
  bar.classList.toggle('tremble', r <= SHAKE_FROM);
}
export function createHud(g, controls) {
  return {
    show() { ['#hud', '#topbtns', '#controls'].forEach(s => { $(s).style.display = ''; }); },
    update() {
      const S = g.S;
      $('#hName').textContent = S.name; $('#hMoney').textContent = S.money;
      const where = { house: ' · 🏠', coop: ' · 🐔', pigsty: ' · 🐷', barn: ' · 🐑', luna: ' · 🏡', franck: ' · 🏚️', grange: ' · 🕳️', wild: ' · 🕳️ Caverne (étage 1)', foret: ' · 🌲', town: ' · 🏙️', quartier: ' · 🏘️' }[S.scene] || '';
      $('#hTime').textContent = `${SEASONS[S.season]} j${S.day}, an ${S.year || 1} · ${fmtTime(S.minute)} · ${WEATHER_LABELS[S.weather].split(' ')[0]}${where}`;
      gauge('hEn', S.energy / S.maxE);
      const hpR = Math.max(0, S.hp) / S.maxHp; $('#hHpRow').hidden = hpR >= 1; if (hpR < 1) gauge('hHp', hpR);
      // vie : cœurs en haut, seulement en mode combat (Caverne sombre ou monstres proches)
      const fight = S.scene === 'wild' || g.enemies.length > 0, hb = $('#hearts');
      hb.hidden = !fight;
      if (fight) { const n = Math.ceil(S.maxHp / 20), v = Math.max(0, S.hp) / 20; hb.innerHTML = Array.from({ length: n }, (_, i) => `<i class="${v >= i + 1 ? 'plein' : v > i + .4 ? 'demi' : 'vide'}"></i>`).join(''); }
      controls && controls.setAction(iconHTML(S.sel));
    },
    savedAt(res) {
      if (!res) return;
      const ok = Object.values(res).every(Boolean);
      $('#saveDot').textContent = (ok ? '💾 ' : '⚠️ partiel ') + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return ok;
    }
  };
}
