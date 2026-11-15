// Commentaire du héros sur un élément du décor qu'on ne peut pas prendre.
import { EXAMINE } from '../data/examine.js';
import { tileAt } from '../world/scenes.js';
import { isRepaired } from './repair.js';
import { isMystHouse, isStation, isHouse, isGrange, isFence, isPond, isLunaHouse, isFranckHouse, buildingAt } from '../world/map.js';

export function examineText(S, tx, ty) {
  const sc = S.scene || 'farm', E = EXAMINE.farm, K = EXAMINE.tiles;
  if (sc === 'farm') {
    const b = buildingAt(S.built, tx, ty);
    if (b) return E[b];
    if (isHouse(tx, ty)) return isRepaired(S, 'house') ? E.house : E.houseRuin;
    if (isGrange(tx, ty)) return isRepaired(S, 'grange') ? E.grange : E.grangeRuin;
    if (isMystHouse(tx, ty)) return E.myst;
    if (isStation(tx, ty)) return E.station;
    if (tx === 0 && ty >= 13) return E.rails;
    if (isLunaHouse(tx, ty)) return E.luna;
    if (isFranckHouse(tx, ty)) return S.social && S.social.franck && S.social.franck.points >= 750 ? E.franckOpen : E.franck;
    if (tx === 47 && ty >= 16 && ty <= 20) return E.gate;
    if (isPond(tx, ty)) return E.water;
    if (isFence(tx, ty, S.built)) return E.fence;
    return null;
  }
  const t = tileAt(sc, tx, ty);
  if (sc === 'town') return t === 'W' ? K.villa : t === 'T' ? K.treeTown : t === 'L' ? (S.village && S.village.done.includes('lampadaires') ? K.Lon : K.L) : K[t] || null;
  if (sc === 'wild') return t === 'T' ? K.treeWild : t === '#' ? K.rockWild : null;
  if (sc === 'grange') return t === '#' ? K.rockGrange : t === 'W' ? K.wallGrange : null;
  if (sc === 'house' && t === 'B') return null; // le lit sert à dormir
  return K[t] || null;
}
