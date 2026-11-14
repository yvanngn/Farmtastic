# Règles pour Claude — Moteur Ferme

- Lire ce fichier et README.md avant tout ; ils font foi.
- `src/systems/` ne touche JAMAIS le DOM ni `Math.random`/`Date.now` directement : utiliser `g.bus.emit`, `g.rnd()`, `g.now()`.
- Tout ce qui persiste vit dans `g.S` (sérialisable JSON). L'éphémère (ennemis, autres joueurs, fx) vit hors de `S`.
- Nouveau champ dans `S` → valeur par défaut dans `defaultState()` (la migration complète les vieilles sauvegardes). Changement incompatible → incrémenter `CFG.VERSION` et migrer dans `migrate()`.
- Réseau : jamais d'écriture base à chaque frame. Positions = Broadcast (≤ 10 Hz, seulement si changement). Identité = Presence. Base = sauvegarde (30 s) et objets partagés.
- Rendu : sol statique pré-rendu, culling des tuiles visibles, HUD ≤ 4×/s.
- Toute fonctionnalité ou correction = un test dans le fichier du système concerné. Lancer uniquement ce fichier.
