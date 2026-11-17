// Icône HTML d'un outil ou d'un objet : image pixel pour les outils dessinés, émoji sinon.
import { ITEMS, TOOLS } from '../data/items.js';
import { toolIcon } from '../render/sprites.js';
import { itemIcon } from '../render/itemicons.js';

export function iconHTML(id) {
  const url = toolIcon(id);
  if (url) return `<img class="pix" src="${url}" alt="">`;
  const ii = itemIcon(id); if (ii) return `<img class="pix" src="${ii}" alt="">`;   // 7f : icône pixel art
  const t = TOOLS.find(x => x.id === id);
  return t ? t.i : ITEMS[id] ? ITEMS[id].i : '❔';
}
