# Roadmap de Farmwest

Le jeu Farm'tastic devient **Farmwest** : une ferme au **Far West**.
- Dépôt : `yvanngn/farmwest`. Version GitHub Pages : https://yvanngn.github.io/farmwest/
- Jeu sur claude.ai : toujours la même page, republiée au même endroit.
- Carte de référence de la région : `docs/carte-region-farmwest.jpg` (donnée par l'utilisateur le 17/11/2026).

**Règle** : on avance **un lot à la fois**, dans l'ordre, quand l'utilisateur le demande. Chaque lot se termine par les tests, une version (`node tools/version.mjs`), la publication, le carnet et cette roadmap cochés.
Les ❓ sont des questions à trancher par l'utilisateur **avant** de lancer le lot.

---

## Lot 0 — Renommage ✅ (17/11/2026)
- [x] Nom du jeu : Farm'tastic → **Farmwest** (titre de la page, logo de l'écran titre, Réglages, outils, documents).
- [x] Sous-titre de l'écran titre : « ✦ une ferme au Far West ✦ ».
- [x] Nom du joueur par défaut : **Cloud Jimny**.
- [x] Carte de la région enregistrée dans `docs/`.
- [x] CLAUDE.md, carnet et roadmap mis à jour.
- Gardés exprès pour ne pas perdre les parties : la clé de sauvegarde du navigateur (`ferme_save_v1`) et le préfixe des tables Supabase (`ferme_`).

## Lot 1 — Ambiance Far West ✅ (17/11/2026, v0.1.7)
Réponses de l'utilisateur : monnaie en **dollars**, lieux renommés en 💡 western, **PNJ inchangés**, seuls les **nouveaux textes** prennent le ton western (les répliques validées restent).
- [x] Écran titre : coucher de soleil, mesas rouges, désert ocre, cactus, virevoltant qui roule, vautours, poussière dorée ; logo en police d'affiche western (Rye).
- [x] Musique : thème du titre à l'harmonica, thème du jour à la guitare « twang », rythme au galop. Nouveaux bruitages : sifflet de locomotive (servira au lot 3), éperons, portes battantes du saloon (en entrant / sortant).
- [x] Monnaie : 🪙 → **$** partout (HUD, magasins, quêtes, ventes).
- [x] Lieux renommés (💡, à corriger si besoin) : bar d'Ed → **Saloon**, Étal du marché → **Magasin général**, Quartier → **Zone résidentielle**, Caverne → **Caverne sombre** (noms de la carte).
- Gardés : « Clinique » (les répliques validées de Hailey en parlent), « Centre-ville », « Forêt », « Montagne ». Le panneau « FARM-LAND » de la fête foraine sera revu au lot 2.

## Lot 2 — Nouvelle carte de la région (d'après l'image) ✅ en grande partie (17/11, v0.1.8)
Zones de l'image → scènes du jeu :

| Zone de la carte | Aujourd'hui | À faire |
|---|---|---|
| Gare (ouest) | quai sur la ferme | gare à part, voie ferrée qui longe l'ouest |
| Centre-ville (entouré par la rivière, ponts) | `town` | rivière et ponts autour |
| Les 4 Fermes (nord, autour d'un chemin en croix) | `farm` + 4 emplacements | placer les 4 fermes comme sur l'image |
| Rond-point avec fontaine (centre) | — | **nouveau** carrefour |
| Zone résidentielle | `quartier` | à l'est du rond-point |
| Ranch du Maire | — | **nouveau** (chevaux, enclos) |
| Fête foraine (sud) | parc FARM-LAND | déplacer au sud, sur la plage |
| Station balnéaire (sud-ouest) | `plage` | cabines, parasols, ponton |
| Zone portuaire (sud-est) | — | **nouveau** (quais, bateaux) |
| Forêt (nord-est) | `foret` | — |
| Montagne (est) | `montagne` | — |
| Caverne sombre (nord-est, en haut) | `wild` | entrée dans la falaise |
| Tunnel (ouest, dans la colline) | — | **nouveau** (à définir) |

- [x] 2a. Carte de la région (🗺️ → Région) redessinée comme l'image : terre ocre, rivière et ponts, océan au sud, 13 zones nommées (v0.1.8).
- [x] 2b. Le **rond-point** devient le carrefour : fermes au nord, centre-ville à l'ouest, zone résidentielle à l'est, ranch au sud (v0.1.8).
- [x] 2c. Nouvelles zones jouables (encore vides de PNJ) : **rond-point** (fontaine, panneaux), **ranch du Maire** (maison « MAIRE », grange, enclos à chevaux, abreuvoir), **zone portuaire** (entrepôts, quai, pontons, voiliers) (v0.1.8).
- [x] Le « chef du village » devient **le Maire, Manu (Manuel)** partout.
- [ ] 2d. Reste à aligner sur l'image (petits lots) : la route de l'est de la ferme mène encore directement au centre-ville ; la plage est encore au nord du centre-ville ; la fête foraine (panneau « FARM-LAND ») est encore cachée derrière la forêt au lieu d'être sur la plage ; la montagne s'ouvre depuis la zone résidentielle ; la rivière n'existe pas encore dans les scènes.
- Le tunnel de l'ouest reste tel quel pour l'instant (décision du 17/11).
- ❓ Le Maire vit-il au ranch (nouvelle maison) ou garde-t-il sa villa du centre-ville ? Pour l'instant : ranch dessiné, villa gardée, Manuel passe ses journées sur la place.

## Lot 3 — Nouveau début de partie
- [ ] Arrivée en **locomotive** (train à vapeur qui entre en gare, fumée, sifflet).
- [ ] **Myst** nous accueille sur le quai, comme avant.
- [ ] Une **diligence** nous fait traverser le **centre-ville** (petite scène où l'on voit la ville défiler).
- [ ] Arrêt au **premier rond-point** : Myst explique qu'il faut **choisir une des 4 fermes**.
- [ ] Choix de la ferme (les fermes prises par d'autres joueurs en multijoueur sont grisées), puis arrivée sur sa ferme.
- ❓ Qui conduit la diligence (Myst ou un cocher) ? Peut-on reprendre la diligence plus tard (transport payant entre les zones) ?

## Lot 4 — Nouvelles quêtes du début
- [ ] Quêtes **principales** de départ : **retaper la cabane**, **construire un coffre**, **trouver la pelle**, **trouver la pioche**.
- [ ] Les quêtes **secondaires** sont gardées mais **cachées au début** (onglet vide ou verrouillé).
- [ ] Revoir `docs/PARCOURS.md` (temps, énergie, moments creux) avec ce nouvel ordre.
- ❓ Où trouve-t-on la pelle et la pioche (aujourd'hui : pioche contre la grange, pelle dans la grange à réparer) ?
- ❓ Quand les quêtes secondaires se débloquent-elles (jour 2 ? cabane finie ?) ?
- ❓ **Contradiction à régler** : « construire un coffre » est une quête principale, mais le patron du coffre est donné par le **charpentier** après la **première quête secondaire**. Faut-il que cette 1re quête secondaire fasse partie du parcours principal, ou que la quête « construire un coffre » attende qu'elle soit débloquée ?
- ❓ Que devient la quête du bijou d'Igor, qui donne aujourd'hui la recette du coffre ?

## Lot 5 — Cueillette au couteau
- [ ] Il faut un **couteau** pour prendre les **fleurs** (comme pour les champignons).
- [ ] Cueillir = **petite jauge de temps** (rester appuyé, comme la louche au chaudron).
- [ ] Le couteau apparaît dans la barre d'outils.
- ❓ Qui donne ou vend le couteau, et quand ? Les champignons demandent-ils déjà le couteau partout ?

## Lot 6 — Métier de charpentier
- [ ] Nouveau métier **charpentier** (avec forgeron, alchimiste, couturier, joaillier, cuisinier), 10 niveaux.
- [ ] Le **charpentier** donne le **patron du coffre** après la **première quête secondaire** (donnée plus tard).
- [ ] Le coffre ne s'apprend plus chez Igor (voir ❓ du lot 4).
- ❓ Quel PNJ est le charpentier (celui qui construit les bâtiments aujourd'hui ?) et quelle est cette 1re quête secondaire ?

## Lot 7 et suivants — Grand upgrade graphique (style de l'image et de Stardew Valley)
Objectif : le rendu de `docs/carte-region-farmwest.jpg` : terre ocre et chemins de sable, rivière bleue avec ponts en bois, forêts denses en grappes, falaises en terrasses, bâtiments de l'Ouest en planches avec toits colorés, plage et pontons.
La liste détaillée est dans `docs/CARNET.md`, section « Chantier graphique niveau Stardew ». Ordre proposé :
- [ ] 7a. Palette Far West (ocre, sable, vert sapin, bleu rivière) et sols de toutes les zones.
- [ ] 7b. Falaises en terrasses, rivière et ponts en bois.
- [ ] 7c. Bâtiments western (saloon, banque, shérif, magasins en planches avec auvents).
- [ ] 7d. Arbres et forêts denses, cactus, rochers.
- [ ] 7e. Personnages et animaux redessinés (chapeaux de cow-boy, bottes…).
- [ ] 7f. Intérieurs, icônes d'objets en pixel art, interface en bois / affiche.
- [ ] 7g. Lumière, ombres et ambiance (poussière, couchers de soleil).

---

## Plus tard (déjà noté dans le carnet)
- Pièce secrète dans chaque maison.
- Histoires d'Ed, Suzie, Jade ; quête du magasin d'Ed ; boissons pour le bar.
- Routines quotidiennes de tous les PNJ (modèle : Hailey).
- Objet pour parler à l'esprit de la quête Ghostbuster (lanceur à neutrons ?).
- Qui donne la canne à pêche.
