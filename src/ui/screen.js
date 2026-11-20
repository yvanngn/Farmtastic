// Plein écran et verrouillage de l'orientation (Android ; sur iPhone, le navigateur ne le permet pas).
// Le choix (auto / portrait / paysage) est mémorisé sur l'appareil.
const KEY = 'ferme_orientation';
export const ORIENTS = { auto: 'Auto', portrait: 'Portrait', landscape: 'Paysage' };
export const isMobile = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
export function getOrient() { try { return localStorage.getItem(KEY) || (isMobile() ? 'landscape' : 'auto'); } catch { return 'auto'; } }   // 20/11 : paysage par défaut sur téléphone
export function setOrient(v) { try { localStorage.setItem(KEY, v); } catch { /* stockage bloqué */ } }

// Renvoie un message à afficher (réussite ou explication).
export async function goFullscreen(orient = getOrient()) {
  const el = document.documentElement, req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!req) return "Ton navigateur ne permet pas le plein écran. Sur iPhone : Partager → « Sur l'écran d'accueil ».";
  try { if (!document.fullscreenElement) await req.call(el); } catch { return 'Le plein écran a été refusé par le navigateur.'; }
  if (orient === 'auto') { try { screen.orientation && screen.orientation.unlock && screen.orientation.unlock(); } catch { /* rien */ } return 'Plein écran ✔'; }
  try { await screen.orientation.lock(orient === 'portrait' ? 'portrait' : 'landscape'); return `Plein écran, ${ORIENTS[orient].toLowerCase()} verrouillé ✔`; }
  catch { return 'Plein écran ✔ (ce téléphone ne permet pas de verrouiller l\'orientation)'; }
}
export function exitFullscreen() { try { document.fullscreenElement && document.exitFullscreen(); } catch { /* rien */ } }

// 20/11 : sur téléphone, on passe tout seul en paysage (plein écran + orientation verrouillée) au premier toucher, sans message.
export function autoLandscape() {
  if (!isMobile()) return;
  const go = () => { if (getOrient() === 'landscape' && !document.fullscreenElement) goFullscreen('landscape').catch(() => {}); };
  addEventListener('pointerdown', go, { once: true, capture: true });
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) addEventListener('pointerdown', go, { once: true, capture: true }); });
}
