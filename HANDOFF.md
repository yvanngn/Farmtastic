# Farmwest — reprise du projet (à jour le 17/11/2026, v0.1.39)

Pour reprendre dans n'importe quel compte Claude : « Reprends Farmwest depuis le dépôt yvanngn/farmwest, lis CLAUDE.md, HANDOFF.md, docs/ROADMAP.md et docs/CARNET.md, puis demande la suite (feuille de route terminée, voir « Plus tard »). »

## Où est quoi
- **Code** : dépôt GitHub `yvanngn/farmwest` (branche `main`). CLAUDE.md et README.md font foi.
- **Jeu en ligne** : GitHub Pages https://yvanngn.github.io/farmwest/ (index.html généré depuis play.html par `node tools/build-index.mjs`).
- **Page claude.ai « Farmwest »** : appartient au compte personnel. Depuis un autre compte, ne pas la republier : pousser sur GitHub ; elle sera republiée au retour sur le compte personnel.
- **Personnages** : planche de référence `docs/personnages-reference.jpg` (règle dans CLAUDE.md).
- **Feuille de route** : `docs/ROADMAP.md` (lots 8-11 faits). **Mémoire** : `docs/CARNET.md` (questions ❓, idées 💡, abandons ❌). **Versions** : `docs/VERSIONS.md`. **Dialogues** : `docs/DIALOGUES.md` (138 répliques 🆕 en attente de relecture).
- **Tests** : `npm test` (node:test, 238 tests).

## Règles de l'utilisateur (résumé ; détail dans CLAUDE.md)
- Un lot à la fois ; poser d'abord les ❓ du lot. Fin de lot : tests, `node tools/version.mjs "note"` (patch seulement), build-index, commit + push, roadmap et carnet à jour, captures d'écran.
- Jeu uniquement responsive (téléphone, tablette). Pixel art dessiné par le code, niveau Stardew ou mieux (référence : docs/carte-region-farmwest.jpg).
- Pas d'histoire ni de PNJ inventés : seulement ce que l'utilisateur décrit ; idées de Claude marquées 💡.
- Répliques nouvelles = 🆕 dans src/data/npcs.js ; dès 100, envoyer docs/DIALOGUES.md pour relecture.
- Zip seulement sur demande. SQL : seulement la partie nouvelle.
- Systèmes (`src/systems`) sans DOM ni Math.random / Date.now ; un test par fonctionnalité dans le fichier du système.
- Ne jamais renommer la clé de sauvegarde `ferme_save_v1` ni le préfixe Supabase `ferme_`.
