// Écran de personnalisation du personnage.
import { $ } from './dom.js';
import { LOOK_OPTS, HAIR_NAMES, BODY_NAMES, BOTTOM_NAMES } from '../data/look.js';
import { drawChar } from '../render/sprites.js';
import { GRASS } from '../render/ground.js';

const ROT_L = [2, 3, 1, 0], ROT_R = [3, 2, 0, 1];

export function createCustomizer({ getLook, getName, onStart, onContinue, onBack }) {
  const pctx = $('#preview').getContext('2d');
  let dir = 0, inGame = false;

  function buildOpts() {
    const L = getLook();
    // labels === 1 : nuancier de couleurs ; sinon tableau/objet de libellés pour des boutons.
    const sec = (title, k, vals, labels) => `<div style="margin-top:8px"><b>${title}</b><div class="row">` + vals.map((v, i) => labels === 1
      ? `<div class="chip ${L[k] === v ? 'sel' : ''}" style="background:${v}" data-k="${k}" data-v="${v}"></div>`
      : `<button class="${L[k] === v ? 'on' : ''}" data-k="${k}" data-v="${v}">${labels[v] ?? labels[i]}</button>`).join('') + '</div></div>';
    $('#lookOpts').innerHTML = sec('Silhouette', 'body', LOOK_OPTS.body, BODY_NAMES) + sec('Peau', 'skin', LOOK_OPTS.skin, 1)
      + sec('Coiffure', 'hair', LOOK_OPTS.hair, HAIR_NAMES) + sec('Cheveux', 'hairC', LOOK_OPTS.hairC, 1)
      + sec('Haut', 'shirt', LOOK_OPTS.shirt, 1) + sec('Bas', 'bottom', LOOK_OPTS.bottom, BOTTOM_NAMES) + sec('Couleur du bas', 'pants', LOOK_OPTS.pants, 1);
  }
  $('#lookOpts').onclick = e => {
    const { k, v } = e.target.dataset; if (!k) return;
    getLook()[k] = k === 'hair' ? +v : v; buildOpts();
  };
  $('#rotL').onclick = () => { dir = ROT_L[dir]; };
  $('#rotR').onclick = () => { dir = ROT_R[dir]; };
  $('#bStart').onclick = () => onStart(($('#iName').value.trim() || 'Cloud Jimny').slice(0, 14), inGame);
  $('#bContinue').onclick = () => onContinue();
  $('#bBack').onclick = () => onBack && onBack();

  return {
    open(game, hasSave) {
      inGame = game;
      $('#ovLook').classList.add('on'); $('#iName').value = getName(); buildOpts();
      $('#bStart').textContent = game ? 'Valider ✔' : (hasSave ? 'Nouvelle partie ▶' : 'Commencer ▶');
      $('#bContinue').style.display = 'none';
      $('#bBack').style.display = game ? 'none' : '';
    },
    close() { $('#ovLook').classList.remove('on'); },
    isOpen: () => $('#ovLook').classList.contains('on'),
    status(t) { $('#netState').textContent = t; },
    draw(t) {
      pctx.fillStyle = GRASS[0]; pctx.fillRect(0, 0, 36, 45);
      pctx.fillStyle = '#5a9a3e'; for (const [x, y] of [[4, 8], [27, 6], [6, 36], [29, 33], [17, 4]]) { pctx.fillRect(x, y + 1, 1, 2); pctx.fillRect(x + 2, y + 1, 1, 2); pctx.fillRect(x + 1, y, 1, 3); }
      pctx.fillStyle = '#f07ab0'; pctx.fillRect(30, 40, 2, 2); pctx.fillStyle = '#f5e050'; pctx.fillRect(3, 24, 2, 2);
      drawChar(pctx, 12, 14, getLook(), dir, dir >= 2 ? 1 + ((t / 85 | 0) % 8) : 0, t);
    }
  };
}
