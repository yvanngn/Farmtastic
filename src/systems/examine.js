// Commentaire du héros sur un élément du décor qu'on ne peut pas prendre.
import { EXAMINE } from '../data/examine.js';
import { tileAt } from '../world/scenes.js';
import { isRepaired } from './repair.js';
import { QUARTIER, mailboxOwner, SCENES } from '../world/scenes.js';
import { isMystHouse, isHouse, isGrange, isFence, isPond, isLunaHouse, isFranckHouse, buildingAt } from '../world/map.js';

const MAILBOX = { luna: 'Une boîte aux lettres. Il est écrit dessus : « Luna ».', franck: 'Une boîte aux lettres. Il est écrit dessus : « Franck ».', hailey: 'Une boîte aux lettres. Il est écrit dessus : « Hailey ».', myst: 'Une boîte aux lettres. Il est écrit dessus : « Myst ».', ed: 'Une boîte aux lettres. Il est écrit dessus : « Famille Ed — Ed, Suzie et Jade ».', remy: 'Une boîte aux lettres. Il est écrit dessus : « Remy Gusto ».' };
export function examineText(S, tx, ty) {
  const sc = S.scene || 'farm', E = EXAMINE.farm, K = EXAMINE.tiles;
  if (sc === 'farm') {
    const b = buildingAt(S.built, tx, ty);
    if (b) return E[b];
    if (isHouse(tx, ty)) return isRepaired(S, 'house') ? E.house : E.houseRuin;
    if (isGrange(tx, ty)) return isRepaired(S, 'grange') ? E.grange : E.grangeRuin;
    if (isMystHouse(tx, ty)) return E.myst;
    if (isLunaHouse(tx, ty)) return E.luna;
    if (isFranckHouse(tx, ty)) return S.social && S.social.franck && S.social.franck.points >= 750 ? E.franckOpen : E.franck;
    if (tx === 47 && ty >= 16 && ty <= 20) return E.gate;
    if (isPond(tx, ty)) return E.water;
    if (isFence(tx, ty, S.built)) return E.fence;
    return null;
  }
  const t = tileAt(sc, tx, ty);
  if (sc === 'quartier' && t === 'k') return MAILBOX[mailboxOwner(tx, ty)] || null;   // lot 8 : on lit le nom sur la boîte aux lettres
  if (sc === 'quartier') {
    if (t === 'T') return K.treeTown;
    if (t !== 'X') return null;
    const Q = QUARTIER, inH = h => tx >= h.x && tx < h.x + h.w && ty >= h.y && ty < h.y + (h.porch ? 4 : 3);
    if (inH(Q.remy)) return E.remy; if (inH(Q.ed)) return E.ed; if (inH(Q.myst)) return E.myst; if (inH(Q.clinique)) return E.clinic; if (inH(Q.hailey)) return E.hailey; if (inH(Q.luna)) return E.luna;
    return S.social && S.social.franck && S.social.franck.points >= 750 ? E.franckOpen : E.franck;
  }
  if (sc === 'town' && (t === '^' || t === 'w')) return t === '^' ? K.cliff : K.river;
  if (sc === 'town') return t === 'R' ? K.bar : t === 'E' ? K.sheriff : t === 'T' ? K.treeTown : t === 'L' ? (S.village && S.village.done.includes('lampadaires') ? K.Lon : K.L) : K[t] || null;
  if (sc === 'foret') return t === 'T' ? K.treeForest : null;   // 'T' = arbre dehors, pas la table des intérieurs
  if (['montagne', 'plage', 'parc', 'rondpoint', 'ranch', 'port'].includes(sc) && t === 'T') return K.treeTown;
  if (['rondpoint', 'ranch', 'port'].includes(sc)) return { F: K.F, P: K.signWest, f: K.fenceRanch, H: K.ranchHouse, B: K.ranchBarn, E: K.warehouse, w: K.sea }[t] || null;   // Farmwest, lot 2
  if (sc === 'wild') return t === 'T' ? K.treeWild : t === '#' ? K.rockWild : null;
  if (sc === 'grange') return t === '#' ? K.rockGrange : t === 'W' ? K.wallGrange : null;
  if ((sc === 'house' || sc === 'maison') && t === 'B') return null; // le lit sert à dormir
  if (SCENES[sc] && SCENES[sc].outdoor) return t === 'T' ? K.treeTown : null;   // 20/11 : dehors, un « T » est un arbre (pas la table des intérieurs)
  return K[t] || null;
}
