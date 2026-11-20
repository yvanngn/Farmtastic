// Menu ⚙ : musique et bruitages réglés séparément (couper, volume, pourcentage), mémorisés.
import { $ } from './dom.js';
import { setVolume, toggle } from '../audio/settings.js';
import { ORIENTS, getOrient, setOrient, goFullscreen, exitFullscreen } from './screen.js';
import { toast } from './dom.js';
import { ADMIN, setAdmin, checkCode } from '../systems/admin.js';
export const adminSaved = () => { try { return localStorage.getItem('ferme_admin') === '1'; } catch { return false; } };

const CH = [
  { k: 'music', label: 'Musique', on: '🎵', off: '🔇' },
  { k: 'sfx', label: 'Bruitages', on: '🔔', off: '🔕' }
];

// Zoom : nombre de cases visibles sur le petit côté de l'écran (mémorisé sur cet appareil).
export const ZOOMS = { 9: 'Proche', 12: 'Normal', 15: 'Loin', 20: 'Très loin' };   // 16/11 : un niveau de plus
// Taille des pixels pour chaque niveau : chaque niveau montre vraiment plus loin que le précédent
// (avant, l'arrondi donnait parfois la même taille pour « Loin » et « Très loin »).
export function zoomScale(minSide, zoom, T = 16) {
  let prev = Infinity, s = 1;
  for (const z of Object.keys(ZOOMS).map(Number).sort((a, b) => a - b)) { s = Math.max(1, Math.min(8, Math.round(minSide / (T * z)), prev === Infinity ? 8 : prev - 1)); if (z >= zoom) return s; prev = s; }
  return s;
}
export const ZOOM_DEFAULT = 15;   // 17/11 : « Loin » par défaut (demande de l'utilisateur)
const ZOOM_KEY = 'ferme_zoom_v2';   // 17/11 : nouvelle clé → tout le monde repart sur « Loin »
export function getZoom() { try { const v = +localStorage.getItem(ZOOM_KEY); return ZOOMS[v] ? v : ZOOM_DEFAULT; } catch { return ZOOM_DEFAULT; } }
// 19/11 : économie d'énergie (téléphone qui chauffe) : 30 images/s en permanence et résolution réduite.
const ECO_KEY = 'ferme_eco';
export function getEco() { try { return localStorage.getItem(ECO_KEY) === '1'; } catch { return false; } }
function setEco(v) { try { localStorage.setItem(ECO_KEY, v ? '1' : '0'); } catch {} window.dispatchEvent(new Event('ferme-zoom')); }
function setZoom(v) { try { localStorage.setItem(ZOOM_KEY, v); } catch {} window.dispatchEvent(new Event('ferme-zoom')); }
import { versionLabel } from '../version.js';
export function createSettingsPanel(audio, g) {
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
      ${g.inGame ? '<div class="row" style="justify-content:center"><button data-save="1" class="primaire">💾 Sauvegarder</button><button data-totitle="1">🏠 Revenir au menu principal</button></div><div class="row" style="justify-content:center"><button data-refresh="1">🔄 Rafraîchir l’affichage</button><button data-reload="1">♻️ Recharger le jeu</button></div>' : ''}
      <p class="info" style="text-align:center;opacity:.7">Farmwest ${versionLabel()}</p>
      <div class="ecran"><b>📱 Écran</b>
        <div class="row">${Object.entries(ORIENTS).map(([k, v]) => `<button data-orient="${k}" class="${getOrient() === k ? 'on' : ''}">${v}</button>`).join('')}</div>
        <div class="row"><button data-fs="1" class="primaire">⛶ Plein écran</button>${document.fullscreenElement ? '<button data-fs="0">Quitter</button>' : ''}</div>
        <div class="row"><span>🔋 Économie d'énergie</span><button data-eco="1" class="${getEco() ? 'on' : ''}">Oui</button><button data-eco="0" class="${getEco() ? '' : 'on'}">Non</button></div>
        <div class="row"><span>🔍 Zoom</span>${Object.entries(ZOOMS).map(([k, v]) => `<button data-zoom="${k}" class="${getZoom() === +k ? 'on' : ''}">${v}</button>`).join('')}</div>
        <small>Le verrouillage de l'orientation marche en plein écran sur Android. Sur iPhone : Partager → « Sur l'écran d'accueil ».</small></div>
      <div class="ecran"><b>🛠️ Mode test</b>
        <div class="row">${ADMIN.on ? '<span>Activé : tous les outils et passages, vitesse ×3, un appui passe une discussion.</span><button data-admin="0">Désactiver</button>'
          : '<input id="admCode" type="password" placeholder="Code" autocomplete="off" style="width:7em"><button data-admin="1">Activer</button>'}</div></div>`;
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
    if (d.refresh) { audio.play('ui'); g.bus.emit('refreshView'); toast('🔄 Affichage redessiné'); return; }   // 20/11 : si le décor a disparu
    if (d.reload) { g.bus.emit('saveNow'); setTimeout(() => location.reload(), 400); return; }
    if (d.save) { audio.play('ui'); g.bus.emit('saveNow'); return; }   // 20/11
    if (d.totitle) { $('#ovSet').classList.remove('on'); g.bus.emit('toTitle'); return; }
    if (d.zoom) { setZoom(+d.zoom); audio.play('ui'); render(); return; }
    if (d.eco != null) { setEco(d.eco === '1'); audio.play('ui'); render(); return; }
    if (d.fs === '1') { toast(await goFullscreen()); render(); return; }
    if (d.fs === '0') { exitFullscreen(); setTimeout(render, 200); return; }
    if (d.admin) {
      const on = d.admin === '1';
      if (on && !checkCode($('#admCode').value)) { toast('Code incorrect.'); return; }
      setAdmin(g, on); try { localStorage.setItem('ferme_admin', on ? '1' : '0'); } catch {}
      document.body.classList.toggle('admin', on); toast(on ? '🛠️ Mode test activé' : 'Mode test désactivé'); render(); return;
    }
    const k = d.mute; if (!k) return;
    audio.update(s => toggle(s, k)); render(); audio.play('ui');
  });
  $('#bSetClose').onclick = () => $('#ovSet').classList.remove('on');
  return { open() { render(); $('#ovSet').classList.add('on'); } };
}
