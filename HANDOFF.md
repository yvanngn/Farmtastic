# Farmwest — reprise du projet (à jour le 18/11/2026, v0.1.51)

Pour reprendre dans n'importe quel compte Claude : « Reprends Farmwest depuis le dépôt yvanngn/farmwest, lis CLAUDE.md, HANDOFF.md, docs/ROADMAP.md et docs/CARNET.md, puis demande la suite (feuille de route : voir « Plus tard » et les ❓ du carnet). »

## Où est quoi
- **Code** : dépôt GitHub `yvanngn/farmwest` (branche `main`). CLAUDE.md et README.md font foi.
- **Jeu en ligne** : GitHub Pages https://yvanngn.github.io/farmwest/ (index.html généré depuis play.html par `node tools/build-index.mjs`).
- **Page claude.ai « Farmwest »** : artefact multi-fichiers (index.html tiré de play.html + `src/` + `css/`), republié depuis le compte Klee le 18/11 (https://claude.ai/artifact/QLpkFecSF5zoEtGHa418oD). Le mode en ligne n'y marche pas (les pages ne peuvent pas joindre Supabase) : le jeu à plusieurs passe par GitHub Pages.
- **Personnages** : depuis le 18/11 (v0.1.46-48), **tous dessinés par le code** avec la poupée `src/render/paperdoll.js` (héros compris), design « A » validé sur Jade ; la tenue de chacun est dans son `look` (src/data/npcs.js). Plus de Gemini ni de planches de sprites pour le jeu (règle dans CLAUDE.md). Après un changement de tenue : `node tools/export-personnages.cjs`.
- **Feuille de route** : `docs/ROADMAP.md` (lots 0-11 faits, lots 0-12 faits (lot 12 : cabane du pêcheur, Rouky et Rox, petits tas à creuser) ; suite : voir « Plus tard »). **Manuel du joueur** : `docs/MANUEL.md`. **Liste de complétion** : `docs/COMPLETION.md` (les deux à tenir à jour à chaque lot). **Mémoire** : `docs/CARNET.md` (questions ❓, idées 💡, abandons ❌). **Versions** : `docs/VERSIONS.md`. **Dialogues** : `docs/DIALOGUES.md` (répliques 🆕 en attente de relecture).
- **Tests** : `npm test` (node:test, 249 tests).
- **Publication depuis une session sans droit de push** : commit local, `git format-patch -1`, le patch déposé dans les Téléchargements de l'utilisateur, qui fait `git am` puis `git push` dans WSL (`/var/www/farmwest`).

## Règles de l'utilisateur (résumé ; détail dans CLAUDE.md)
- Un lot à la fois ; poser d'abord les ❓ du lot. Fin de lot : tests, `node tools/version.mjs "note"` (patch seulement ; la note est gardée dans docs/VERSIONS.md depuis la v0.1.51), build-index, commit + push, roadmap et carnet à jour, captures d'écran.
- Jeu uniquement responsive (téléphone, tablette). Pixel art dessiné par le code, niveau Stardew ou mieux (référence : docs/carte-region-farmwest.jpg).
- Pas d'histoire ni de PNJ inventés : seulement ce que l'utilisateur décrit ; idées de Claude marquées 💡.
- Répliques nouvelles = 🆕 dans src/data/npcs.js ; dès 100, envoyer docs/DIALOGUES.md pour relecture.
- Zip seulement sur demande. SQL : seulement la partie nouvelle.
- Systèmes (`src/systems`) sans DOM ni Math.random / Date.now ; un test par fonctionnalité dans le fichier du système.
- Ne jamais renommer la clé de sauvegarde `ferme_save_v1` ni le préfixe Supabase `ferme_`.
