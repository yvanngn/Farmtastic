// Écran de personnalisation du personnage.
import { $ } from './dom.js';
import { LOOK_OPTS, HAIR_NAMES, BODY_NAMES, BOTTOM_NAMES, WEST_OPTS, HAT_NAMES, YESNO } from '../data/look.js';
import { drawChar } from '../render/sprites.js';
import { HERO_OPTS } from '../render/folk.js';
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
      : `<button class="${String(L[k] ?? '') === String(v) ? 'on' : ''}" data-k="${k}" data-v="${v}">${labels[v] ?? labels[i]}</button>`).join('') + '</div></div>';
    // 18/11 (soir) : héros en « pixel moderne » — sexe et plus de choix (src/render/folk.js, HERO_OPTS)
    const O = HERO_OPTS, f = L.body === 'f', bt = (title, k) => sec(title, k, Object.keys(O[k]), O[k]);
    $('#lookOpts').innerHTML = bt('Sexe', 'body') + sec('Peau', 'skin', O.skin, 1) + sec('Yeux', 'eye', O.eye, 1)
      + bt('Coiffure', 'hair') + sec('Couleur des cheveux', 'hairC', O.hairC, 1) + (f ? '' : bt('Barbe', 'beard'))
      + bt('Chapeau', 'hat') + (L.hat && L.hat !== 'paille' ? sec('Couleur du chapeau', 'hatC', O.hatC, 1) : '')
      + bt('Haut', 'top') + sec('Couleur du haut', 'shirt', O.shirt, 1)
      + bt('Par-dessus', 'extra') + (L.extra ? sec('Couleur', 'extraC', O.extraC, 1) : '')
      + opt('Bandana', 'scarf', O.scarf) + bt('Bas', 'bottom') + sec('Couleur du bas', 'pants', O.pants, 1)
      + sec('Chaussures', 'shoes', O.shoes, 1) + bt('Sac à dos', 'backpack');
  }
  // couleur facultative : « Aucun » puis le nuancier
  function opt(title, k, vals = WEST_OPTS[k]) {
    const L = getLook(), cur = L[k] || '';
    return `<div style="margin-top:8px"><b>${title}</b><div class="row"><button class="${cur ? '' : 'on'}" data-k="${k}" data-v="">Aucun</button>`
      + vals.filter(Boolean).map(v => `<div class="chip ${cur === v ? 'sel' : ''}" style="background:${v}" data-k="${k}" data-v="${v}"></div>`).join('') + '</div></div>';
  }
  function yn(title, k) {
    const L = getLook();
    return `<div style="margin-top:8px"><b>${title}</b><div class="row">` + YESNO[k].map((t, i) => `<button class="${!!L[k] === !!i ? 'on' : ''}" data-k="${k}" data-b="${i}">${t}</button>`).join('') + '</div></div>';
  }
  $('#lookOpts').onclick = e => {
    const { k, v, b } = e.target.dataset; if (!k) return;
    const L = getLook(); delete L.sheet; L.doll = true;
    L[k] = b != null ? b === '1' : k === 'backpack' ? +v : v; buildOpts();
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
      pctx.setTransform(4, 0, 0, 4, 0, 0); pctx.imageSmoothingEnabled = false;   // aperçu 36 × 50, dessiné ×4 (1 pixel du dessin = 3 pixels) (poupée haute définition)
      pctx.fillStyle = GRASS[0]; pctx.fillRect(0, 0, 36, 50);
      pctx.fillStyle = '#5a9a3e'; for (const [x, y] of [[4, 8], [27, 6], [6, 36], [29, 33], [17, 4]]) { pctx.fillRect(x, y + 1, 1, 2); pctx.fillRect(x + 2, y + 1, 1, 2); pctx.fillRect(x + 1, y, 1, 3); }
      pctx.fillStyle = '#f07ab0'; pctx.fillRect(30, 40, 2, 2); pctx.fillStyle = '#f5e050'; pctx.fillRect(3, 24, 2, 2);
      drawChar(pctx, 12, 27, getLook(), dir, dir >= 2 ? 1 + ((t / 85 | 0) % 8) : 0, t);
    }
  };
}
