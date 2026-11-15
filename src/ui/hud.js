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

export function createHud(g, controls) {
  return {
    show() { ['#hud', '#topbtns', '#controls'].forEach(s => { $(s).style.display = ''; }); },
    update() {
      const S = g.S;
      $('#hName').textContent = S.name; $('#hMoney').textContent = S.money;
      const where = { house: ' · 🏠', coop: ' · 🐔', pigsty: ' · 🐷', barn: ' · 🐑', luna: ' · 🏡', franck: ' · 🏚️', grange: ' · 🕳️', wild: ' · ⚔️', town: ' · 🏘️' }[S.scene] || '';
      $('#hTime').textContent = `${SEASONS[S.season]} j${S.day} · ${fmtTime(S.minute)} · ${WEATHER_LABELS[S.weather].split(' ')[0]}${where}`;
      $('#hEn').style.width = (S.energy / S.maxE * 100) + '%';
      // vie : cœurs en haut, seulement en mode combat (Terres sauvages ou monstres proches)
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
