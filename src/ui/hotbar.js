// Barre d'outils toujours visible en bas de l'écran (comme Stardew) : un appui = l'outil en main.
// Touches 1 à 8 au clavier. Se met à jour quand les outils ou l'objet en main changent.
import { $ } from './dom.js';
import { TOOLS } from '../data/items.js';
import { TIER_NAMES } from '../data/tools.js';
import { toolTier, hasTool } from '../systems/skills.js';
import { iconHTML } from './icons.js';

export function createHotbar(g, audio) {
  const bar = $('#hotbar');
  let last = '';
  const owned = () => TOOLS.filter(t => hasTool(g.S, t.id));
  function render() {
    const S = g.S, list = owned(), key = list.map(t => t.id + toolTier(S, t.id)).join() + '|' + S.sel;
    if (key === last) return; last = key;
    bar.innerHTML = list.map((t, i) => `<button data-tool="${t.id}" class="${S.sel === t.id ? 'on' : ''}" title="${t.n} (${i + 1})" aria-label="${t.n}">${iconHTML(t.id)}<small>${i + 1}</small></button>`).join('');
  }
  bar.addEventListener('pointerdown', e => {
    const b = e.target.closest('button[data-tool]'); if (!b) return;
    e.preventDefault(); g.S.sel = b.dataset.tool; audio.play('ui'); g.bus.emit('inv'); render();
  });
  g.bus.on('inv', render);
  return {
    render,
    pick(i) { const t = owned()[i]; if (!t) return false; g.S.sel = t.id; audio.play('ui'); g.bus.emit('inv'); render(); return true; },
    show() { bar.hidden = false; last = ''; render(); document.body.classList.add('bande'); dispatchEvent(new Event('resize')); }   // lot 8 : bande sous la scène
  };
}
