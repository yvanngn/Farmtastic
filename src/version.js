// Version du jeu (semver horodaté). Fichier écrit par `node tools/version.mjs` : ne pas modifier à la main.
// Patch = automatique à chaque publication ; mineure et majeure = seulement quand l'utilisateur le demande.
export const VERSION = { major: 0, minor: 1, patch: 73, date: '2026-11-19T14:49' };
export const versionLabel = (v = VERSION) => `v${v.major}.${v.minor}.${v.patch} · ${v.date.slice(8, 10)}/${v.date.slice(5, 7)}/${v.date.slice(0, 4)} ${v.date.slice(11, 16)}`;
