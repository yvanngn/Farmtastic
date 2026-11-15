// Menu ⚙ : musique et bruitages réglés séparément (couper, volume, pourcentage), mémorisés.
import { $ } from './dom.js';
import { setVolume, toggle } from '../audio/settings.js';
import { ORIENTS, getOrient, setOrient, goFullscreen, exitFullscreen } from './screen.js';
import { toast } from './dom.js';

const CH = [
  { k: 'music', label: 'Musique', on: '🎵', off: '🔇' },
  { k: 'sfx', label: 'Bruitages', on: '🔔', off: '🔕' }
];

export function createSettingsPanel(audio) {
  const body = $('#setBody');
  function render() {
    const s = audio.settings;
    body.innerHTML = CH.map(c => `
      <div class="reglage">
        <button data-mute="${c.k}" aria-label="Couper ${c.label}">${s[c.k].on && s[c.k].vol > 0 ? c.on : c.off}</button>
        <label for="vol-${c.k}">${c.label}</label>
        <input id="vol-${c.k}" type="range" min="0" max="100" value="${Math.round(s[c.k].vol * 100)}" data-vol="${c.k}">
        <span class="pct">${s[c.k].on ? Math.round(s[c.k].vol * 100) : 0} %</span>
      </div>`).join('') + `
      <div class="ecran"><b>📱 Écran</b>
        <div class="row">${Object.entries(ORIENTS).map(([k, v]) => `<button data-orient="${k}" class="${getOrient() === k ? 'on' : ''}">${v}</button>`).join('')}</div>
        <div class="row"><button data-fs="1" class="primaire">⛶ Plein écran</button>${document.fullscreenElement ? '<button data-fs="0">Quitter</button>' : ''}</div>
        <small>Le verrouillage de l'orientation marche en plein écran sur Android. Sur iPhone : Partager → « Sur l'écran d'accueil ».</small></div>`;
  }
  body.addEventListener('input', e => {
    const k = e.target.dataset.vol; if (!k) return;
    audio.update(s => setVolume(s, k, e.target.value / 100));
    const row = e.target.closest('.reglage'), c = CH.find(x => x.k === k), s = audio.settings[k];
    row.querySelector('.pct').textContent = Math.round(s.vol * 100) + ' %';
    row.querySelector('button').textContent = s.on && s.vol > 0 ? c.on : c.off;
  });
  body.addEventListener('click', async e => {
    const d = e.target.dataset;
    if (d.orient) { setOrient(d.orient); audio.play('ui'); if (document.fullscreenElement) toast(await goFullscreen(d.orient)); render(); return; }
    if (d.fs === '1') { toast(await goFullscreen()); render(); return; }
    if (d.fs === '0') { exitFullscreen(); setTimeout(render, 200); return; }
    const k = d.mute; if (!k) return;
    audio.update(s => toggle(s, k)); render(); audio.play('ui');
  });
  $('#bSetClose').onclick = () => $('#ovSet').classList.remove('on');
  return { open() { render(); $('#ovSet').classList.add('on'); } };
}
