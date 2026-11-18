# Règles pour Claude — Farmwest (moteur Ferme)

## Farmwest (depuis le 17/11/2026)
- Le jeu s'appelle **Farmwest** (ancien nom : Farm'tastic), thème **Far West**. Dépôt `yvanngn/farmwest`, GitHub Pages https://yvanngn.github.io/farmwest/, jeu claude.ai toujours republié sur la même page.
- **Feuille de route : `docs/ROADMAP.md`**. On fait **un lot à la fois**, dans l'ordre, sur demande ; poser d'abord les questions ❓ du lot. En fin de lot : cocher la roadmap et compléter le carnet.
- Carte de référence de la région et du style graphique visé : `docs/carte-region-farmwest.jpg`.
- **Personnages (depuis le 18/11) : on part des planches de sprites fournies par l'utilisateur** (plus de Gemini). Chaque planche est déposée dans `docs/sprites/<nom>.png` et passée par `python3 -I tools/sprite-from-planche.py` (ajouter le personnage dans `PLANCHES` : taille du pixel d'origine `PX`, hauteur dans le monde `H`, poses de face / dos / profil, miroirs). **Qualité gardée telle quelle** : grille d'origine retrouvée, toutes les couleurs et le contour d'origine, seul le fond devient transparent ; le jeu l'affiche à `H` pixels du monde (champs `sw`/`sh` dans `sheets.js`), donc tout le détail se voit à l'écran. Ne pas réduire, ni réduire les couleurs, ni recontourer une planche fournie. Les anciens outils (`sprite-from-sheets.py`, `sprite-from-reference.py`, `sprite-from-gemini.py`) ne touchent plus à ces personnages.
- Ancienne règle (personnages pas encore refaits) : **planche de référence `docs/personnages-reference.jpg`** (tous les personnages, de face, de profil et de dos). Tout nouveau personnage garde cet esprit : petit sprite 16 × 31 « façon Stardew », tête 8 × 10, yeux avec du blanc, 3 tons par couleur (lumière en haut à gauche), contour coloré (jamais noir), tenue lisible en une silhouette (chapeau, manteau, salopette…). Depuis la v0.1.36, chaque personnage est affiché depuis sa **planche de sprites** (`assets/sprites/<nom>.png`, `sheet:` dans son `look`), générée par `python3 tools/sprite-from-sheets.py` depuis les planches de marche fournies par l'utilisateur (`docs/sprites/*.jpg`, prioritaires) ou, à défaut, depuis la planche de référence (`python3 tools/sprite-from-reference.py`, à lancer avant) ; cadres des cellules à indiquer dans le script pour un nouveau personnage ; le dessin par code (`rawChar`, `src/render/sprites.js`) reste le secours et sert au héros personnalisé.
- Ne pas renommer la clé de sauvegarde (`ferme_save_v1`) ni le préfixe Supabase (`ferme_`) : les parties existantes seraient perdues.

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

## Versions (règle de l'utilisateur)
- Semver horodaté dans `src/version.js`, affiché sur l'écran titre et dans ⚙ Réglages ; historique dans `docs/VERSIONS.md`.
- **À chaque publication** : `node tools/version.mjs "courte note"` (patch +1, date et heure de Paris), puis `node tools/build-index.mjs`, publier, committer.
- **Mineure / majeure : jamais de moi-même**, seulement quand l'utilisateur le demande (`node tools/version.mjs minor` / `major`).
