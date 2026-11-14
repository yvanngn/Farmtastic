// Menu ⚙ : musique et bruitages réglés séparément (couper, volume, pourcentage), mémorisés.
import { $ } from './dom.js';
import { setVolume, toggle } from '../audio/settings.js';

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
      </div>`).join('');
  }
  body.addEventListener('input', e => {
    const k = e.target.dataset.vol; if (!k) return;
    audio.update(s => setVolume(s, k, e.target.value / 100));
    const row = e.target.closest('.reglage'), c = CH.find(x => x.k === k), s = audio.settings[k];
    row.querySelector('.pct').textContent = Math.round(s.vol * 100) + ' %';
    row.querySelector('button').textContent = s.on && s.vol > 0 ? c.on : c.off;
  });
  body.addEventListener('click', e => {
    const k = e.target.dataset.mute; if (!k) return;
    audio.update(s => toggle(s, k)); render(); audio.play('ui');
  });
  $('#bSetClose').onclick = () => $('#ovSet').classList.remove('on');
  return { open() { render(); $('#ovSet').classList.add('on'); } };
}
