// Fenêtre des parties : nouvelle partie (solo, créer à plusieurs, rejoindre avec un code) et « Mes parties ».
import { gameLabel, normCode } from '../net/games.js';

export function createGamesPanel({ audio, online, onPick }) {
  const ov = document.createElement('div');
  ov.id = 'ovGames'; ov.className = 'overlay';
  ov.innerHTML = '<div class="panel box"><div class="row" style="justify-content:space-between;margin:0"><h2 id="gpTitle"></h2><button id="gpClose" aria-label="Fermer">✕</button></div><div id="gpBody"></div></div>';
  document.body.appendChild(ov);
  const body = ov.querySelector('#gpBody'), close = () => ov.classList.remove('on');
  ov.querySelector('#gpClose').onclick = () => { audio.play('ui'); close(); };
  const fmt = t => t ? new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'jamais sauvegardée';
  function showNew() {
    ov.querySelector('#gpTitle').textContent = '🌱 Nouvelle partie';
    const on = online();
    body.innerHTML = `<div class="gp-list">
      <button class="primaire" data-k="solo">🧑‍🌾 Partie solo<small>Ta ferme, rien qu'à toi${on ? ' (sauvegardée en ligne)' : ''}</small></button>
      <button data-k="create" ${on ? '' : 'disabled'}>👥 Créer une partie à plusieurs<small>Tu reçois un code à envoyer à tes amis (4 joueurs max)</small></button>
      <div class="gp-join"><input id="gpCode" placeholder="Code : FERME-XXXX" maxlength="12" autocomplete="off" ${on ? '' : 'disabled'}><button data-k="join" ${on ? '' : 'disabled'}>🔑 Rejoindre</button></div>
      ${on ? '' : '<small class="gp-off">Hors ligne : le jeu à plusieurs n\'est pas disponible ici (version GitHub Pages conseillée).</small>'}</div>`;
    ov.classList.add('on');
  }
  function showList(games) {
    ov.querySelector('#gpTitle').textContent = '📂 Mes parties';
    body.innerHTML = '<div class="gp-list">' + games.map((x, i) => `<button data-i="${i}" class="${i ? '' : 'primaire'}">${gameLabel(x)}<small>${x.offline ? 'Sur cet appareil · ' : ''}${fmt(x.at)}</small></button>`).join('') + '</div>';
    body.onclickGames = games; ov.classList.add('on');
  }
  body.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    audio.play('ui');
    if (b.dataset.i != null) { close(); onPick({ kind: 'continue', game: body.onclickGames[+b.dataset.i] }); return; }
    const k = b.dataset.k; if (!k) return;
    if (k === 'join') { const code = normCode(body.querySelector('#gpCode').value); if (!code) { body.querySelector('#gpCode').focus(); return; } close(); onPick({ kind: 'join', code }); return; }
    close(); onPick({ kind: k });
  });
  return { showNew, showList, isOpen: () => ov.classList.contains('on') };
}
