# Farm'tastic — reprise du projet

Document à donner à une nouvelle conversation pour reprendre le jeu sans rien perdre.

## Où est quoi
- **Code** : dépôt GitHub `yvanngn/Farmtastic` (branche `main`). README.md et CLAUDE.md font foi.
- **Version jouable** : page claude.ai « Moteur Ferme » (publiée depuis `play.html` + `css/` + `src/`). Republier toujours sur la même page.
- **Base de données** : `supabase_schema.sql` (profils, sauvegardes, mondes, objets partagés, PNJ, liens sociaux, marché entre joueurs). Supabase n'est pas encore branché (`src/config.js` vide → jeu solo, sauvegarde locale).
- **Tests** : `npm test` (node:test, 118 tests au vert). Un fichier par système dans `tests/`.

## Mémoire du projet
- **`docs/CARNET.md`** : histoire, personnages, lots, ce qui existe, contradictions, idées non validées. Le lire en premier, le mettre à jour à la fin de chaque séance (skill `carnet-de-projet`).

## Skills à utiliser
- `moteur-ferme-multijoueur` : architecture, responsive, direction artistique, gameplay, multijoueur, livraison.
- `optimisation-moteur-ferme` : économie de tokens, tests par système, garde-fou d'historique.
- `charte-jeux-pixel-art` : graphisme, interface, effets, son (référence Witch'rok, dépôt `yvanngn/sol-rod-yv`).
- `animation-marche-pixel` : marche des personnages (8 images, genoux, bras, rebond, cheveux).

## Règles de l'utilisateur
- Jeu **uniquement responsive**, entièrement jouable au téléphone et à la tablette.
- Graphismes pixel art **niveau Stardew Valley ou mieux**, tout dessiné par le code.
- **Zip du projet uniquement sur demande.** Par défaut : republier la page claude.ai (et pousser sur GitHub).
- SQL : ne renvoyer que la partie nouvelle à exécuter.
- Ne pas inventer d'histoire ni de PNJ : seulement ce que l'utilisateur décrit. Mes idées → « Suggestions ».
- Après avoir écrit des répliques, les donner en **liste numérotée** pour correction ; appliquer les corrections telles quelles.
- Gros chantiers : découper par lots, tester chaque lot, publier.

## Déjà fait
- Personnalisation : homme/femme, peau, 6 coiffures (dont queue, couettes), couleurs, pantalon/jupe.
- Cultures façon Hay Day (temps réel, glisser, pluie +25 %), animaux façon Stardew (poule, lapin, mouton, chat à caresser).
- Bois/pierre, gros rochers, XP de minage (10 niveaux), forge (Cuivre → Iridium), énergie 1 par coup (0,5 dès le Fer).
- Sac de 12 cases (+6 par achat, max 36), **10 objets par case**, piles améliorables (10 → 99) au magasin d'amélioration du village.
- Écran titre animé façon Witch'rok + menu de jeu, police Lilita One.
- Maison (lit), poulailler (mangeoire), village : halle du marché (marché entre joueurs) + panneau d'affichage (6 demandes, renouvellement 2 h en temps réel).
- Temps, saisons, météo, lumière de nuit, particules, combat (slimes), carte zoomable, roues outils/sac avec aperçu du nom, joystick + bouton d'action intelligent (maintenir = répéter), animations de coups et chute d'arbre.
- Musiques et bruitages synthétisés, menu ⚙ (volumes séparés), sauvegarde auto 30 s + manuelle, multijoueur Realtime prêt.

## À faire, dans l'ordre (demandes de l'utilisateur)
1. ✅ **Titre et menu de jeu** stylés comme Witch'rok (titre lumineux qui flotte, menu), avec une **police « jeu de ferme »**.
2. ✅ **Inventaire** : piles de **10 objets max par case**, augmentables via des améliorations dans un **magasin d'amélioration**.
3. ✅ **Ressources** :
   - Arbres : poussent **aléatoirement dans la zone de bois à l'est** de la ferme, mettent **3 jours** à pousser, **nombre max** dans la zone, **3 types d'arbres** qui donnent tous du bois.
   - Pierres : mêmes règles, **2 types** ; les plus grosses rapportent **2 pierres**.
4. ✅ **Tout débloquer petit à petit avec de l'argent** : le **poulailler n'existe pas au départ**. Un **charpentier** vend poulailler, porcherie, etc. Un **marchand d'animaux**.
5. ✅ **Commerces** : **boulanger, boucher, poissonnier** (on fera de bons plats plus tard).
6. ✅ **Premier habitant : Luna**, avec sa maison. Jeune femme célibataire arrivée récemment ; elle travaillait dans l'informatique, l'IA a remplacé son poste ; elle veut monter sa ferme mais doit d'abord gagner de l'argent. Les dialogues des PNJ doivent **distiller lentement** leur vie et leurs ambitions (répliques débloquées avec l'amitié).
7. ✅ **Demandes avec code couleur** mélangeant les 4 idées :
   - chantiers de **reconstruction du village** (jauge commune entre joueurs),
   - préparation de la **fête de saison**,
   - **demandes des habitants** (liens d'amitié),
   - **caravane commerciale** qui débloque graines, animaux, outils.

## À faire ensuite (demandes du 15/11/2026, détail dans docs/CARNET.md § 3 bis)
8. ✅ Début de partie : aucun outil, accueil par le chef du village, grange-tunnels de la maison (hache, puis pioche et pelle).
9. ✅ Champ de foin à préparer + graines de foin au magasin.
10. ✅ Zone de combat façon Zelda Game Boy (slimes bleu/vert, cochon qui tire), fermée au début ; cailloux 3 types + rubis/émeraude.
11. ✅ Franck, voisin timide de Luna, et sa quête principale (le faire sortir ; objet fabriqué qui le change).
12. Atelier de fabrication à la maison (à débloquer).
Plus tard : bouclier, suite des tunnels.

## Pour démarrer la nouvelle conversation
Joindre ce fichier ou écrire : « Reprends Farm'tastic depuis le dépôt yvanngn/Farmtastic, lis HANDOFF.md et attaque le lot suivant. »
