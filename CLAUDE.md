# Règles pour Claude — Moteur Ferme

- Lire ce fichier et README.md avant tout ; ils font foi.
- `src/systems/` ne touche JAMAIS le DOM ni `Math.random`/`Date.now` directement : utiliser `g.bus.emit`, `g.rnd()`, `g.now()`.
- Tout ce qui persiste vit dans `g.S` (sérialisable JSON). L'éphémère (ennemis, autres joueurs, fx) vit hors de `S`.
- Nouveau champ dans `S` → valeur par défaut dans `defaultState()` (la migration complète les vieilles sauvegardes). Changement incompatible → incrémenter `CFG.VERSION` et migrer dans `migrate()`.
- Réseau : jamais d'écriture base à chaque frame. Positions = Broadcast (≤ 10 Hz, seulement si changement). Identité = Presence. Base = sauvegarde (30 s) et objets partagés.
- Rendu : sol statique pré-rendu, culling des tuiles visibles, HUD ≤ 4×/s.
- Toute fonctionnalité ou correction = un test dans le fichier du système concerné. Lancer uniquement ce fichier.

## Dialogues (règle de l'utilisateur)
- Toutes les répliques des PNJ sont dans `src/data/npcs.js`. `node tools/export-dialogues.mjs` écrit `docs/DIALOGUES.md` avec 🆕 sur les répliques non validées et affiche leur nombre.
- **Dès 100 répliques 🆕**, envoyer `docs/DIALOGUES.md` à l'utilisateur pour relecture. Ses corrections s'appliquent telles quelles, puis `node tools/export-dialogues.mjs --valider` et committer `tools/dialogues_valides.txt`.
- Discussions comme dans Witch'rok : la réplique du jour reste en tête, puis le choix des sujets du PNJ (`topics`) et « Rien. ».
- Mémoire du projet : `docs/CARNET.md` (le lire en début de séance, le compléter à la fin).
- `index.html` (GitHub Pages) est **généré** depuis `play.html` (claude.ai) : après toute modification de `play.html`, lancer `node tools/build-index.mjs` (un test vérifie qu'ils sont synchronisés).
