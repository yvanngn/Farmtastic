// Mode test (admin) : réservé à Yvan pour tester. Pas dans la sauvegarde : activé sur l'appareil (réglages ⚙ + code).
// Effets : tous les outils, tous les passages ouverts, déplacement ×3, un appui ferme toute une discussion.
import { TOOLS } from '../data/items.js';
export const ADMIN = { on: false };
export const ADMIN_CODE = 'GEMINI';
export const ADMIN_SPEED = 3;
export const checkCode = c => String(c || '').trim().toUpperCase() === ADMIN_CODE;
export function setAdmin(g, on) {
  ADMIN.on = !!on;
  if (on) { const t = { ...g.S.tools }; for (const o of TOOLS) if (o.id !== 'hand') t[o.id] = 1; g.S.tools = t; }
  g.bus.emit('admin', ADMIN.on);
}
export const seaOpen = S => true;   // 16/11 : la plage est ouverte à tous (demande de l'utilisateur)
