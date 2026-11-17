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
- [x] 2d. Liaisons alignées sur l'image (v0.1.9) : ferme → **forêt** à l'est ; centre-ville ↔ rond-point par un **pont sur la rivière** (à l'est du centre-ville) ; **station balnéaire au sud** du centre-ville (plage retournée : mer au sud) ; **fête foraine** au sud du ranch (panneau « FÊTE FORAINE », plus de trouée secrète dans la forêt). L'entrée ouest du centre-ville est fermée en attendant la gare du lot 3.
- [ ] 2e. Plus tard : la rivière autour du centre-ville dans la scène du centre-ville elle-même, la montagne à rattacher par la route de l'est (aujourd'hui depuis la zone résidentielle), le port relié à la plage.
- Le tunnel de l'ouest reste tel quel pour l'instant (décision du 17/11).
- [x] Le Maire **vit dans son ranch** (maison avec intérieur) ; la **villa du centre-ville est effacée** (décision du 17/11). Il passe toujours ses journées sur la place.

## Lot 3 — Nouveau début de partie ✅ (17/11/2026, v0.1.10)
Réponses de l'utilisateur : un **cocher** conduit la diligence (peut-être un PNJ plus tard) ; **Myst est assis à côté** du héros, raconte la **légende du fantôme** (personne n'a osé habiter les fermes du Nord) et **présente les bâtiments** du centre-ville ; le rythme suit ses explications ; la diligence aura des **arrêts plus tard**.
- [x] Nouvelle scène **Gare** (à l'ouest du centre-ville) : voie ferrée, quai en planches, gare « FARMWEST » avec horloge, bancs.
- [x] Une **locomotive à vapeur** entre en gare (fumée, sifflet) ; pensées du héros.
- [x] **Myst** accueille le héros sur le quai.
- [x] (v0.1.17) Pendant l'intro : bouton **⏩ maintenir pour accélérer** (×6), bouton **⏭ Passer l'intro** (direct devant la ferme, la première libre) ; plus rien d'autre de cliquable (barre d'outils, sac, touches) que la bulle de dialogue.
- [x] (v0.1.16) Le héros **arrive dans le train** (visible à la fenêtre du wagon), pense pendant que le train est à quai, puis **descend sur le quai** où l'attend Myst.
- [x] **Diligence** (deux chevaux, cocher au chapeau, roues qui tournent) : traversée du centre-ville d'ouest en est ; Myst raconte la légende, puis la diligence **s'arrête devant chaque bâtiment le temps de son explication** (charpentier et halle, saloon, place et fontaine, magasin d'outils et marchand d'animaux, pont) ; elle passe le pont et entre au rond-point.
- [x] Au **rond-point**, Myst fait **choisir une des 4 fermes** (en multijoueur, une ferme prise par un autre joueur est indiquée et refusée).
- [x] Conseils de fin (tente, liste des tâches, plan, où habite Myst), puis le héros est **déposé devant sa ferme** et le plan s'ouvre.
- Les parties déjà commencées ne rejouent pas ce début.
- [ ] Plus tard : le **cocher** en PNJ ; des **arrêts de diligence** pour voyager entre les zones (payants ?).

## Lot 4 — Nouvelles quêtes du début ✅ (17/11/2026, v0.1.11)
Réponses de l'utilisateur : la **pelle** est dans la grange une fois réparée ; la **pioche** reste contre la grange ; chaque ferme a un **grand arbre incassable** au pied duquel on trouve la **hache** ; on ne peut **jamais avoir deux fois le même outil** (multijoueur) ; la **quête du bijou d'Igor est supprimée** (dialogues nettoyés) ; le **coffre devient une quête principale**.
- [x] Quête principale « Premiers pas » : tente → nuit → **pioche** (contre la grange) → **hache** (au pied du grand arbre) → feu → **retaper la cabane** → **construire un coffre** → rafistoler la grange → **pelle** (dans la grange) → cuisine.
- [x] **Grand arbre** incassable sur chaque ferme (au sud-ouest, x6 y30), la hache posée à son pied ; les anciennes parties le reçoivent aussi.
- [x] Pas deux fois le même outil (hache, pioche, pelle, faucille) : test ajouté.
- [x] Quête du bijou d'Igor supprimée (code, objet, répliques).
- [x] Quêtes **secondaires cachées au début** : elles apparaissent quand la cabane est retapée (💡 à confirmer).
- ⏳ **À réfléchir : ce que sera la quête du coffre.** En attendant, la recette du coffre s'apprend en retapant la cabane (provisoire).

## Lot 5 — Le couteau du cuistot et la cueillette ✅ (17/11/2026, v0.1.12)
Décisions : le couteau fait partie d'une **quête principale** ; un **restaurant** au centre-ville, avec une **cuisine** où l'on entre ; le **cuistot** a son **four en panne**, on le répare (**30 pierres + 15 bois**) et on reçoit le **couteau**. Quête « Premiers pas » : étape « pelle » fusionnée avec la grange, étape « confiture » retirée ; quêtes secondaires cachées au début (confirmé).
- [x] **Restaurant** (sud du centre-ville, à la place de l'ancienne villa) : façade, auvent rayé, ardoise du menu ; intérieur avec salle et **cuisine** (four, plan de travail).
- [x] **Le cuistot** (💡 nom et répliques à valider) : en cuisine la journée ; il demande de réparer le four.
- [x] **Four** : toucher avec le marteau et 30 🪨 + 15 🪵 → réparé (il s'allume) → le cuistot donne le **couteau** (jamais deux fois).
- [x] **Fleurs et champignons** : il faut le couteau, et une **jauge** se remplit en restant appuyé (3 coups d'action).
- [x] Étape « Aider le cuistot » dans « Premiers pas » ; « grange + pelle » en une seule étape ; plus de confiture.

## Lot 6 — Métier de charpentier, Harry Fordson et Remy Gusto ✅ (17/11/2026, v0.1.13)
Décrits par l'utilisateur :
- **Harry Fordson**, le charpentier : charpentier de père en fils, très doué ; une maladie inconnue, sans symptôme visible ; aimerait se marier un jour ; travaille beaucoup et a beaucoup de dettes envers Manu, le Maire.
- **Remy Gusto**, le cuistot : fils abandonné d'un cuisinier renommé ; vu partout comme « le fils de », il a perdu beaucoup de concours à cause de son nom ; venu à Farmwest, loin de tout, pour vivre de sa passion ; déteste son père et retentera sa chance à sa mort. Maison dans la zone résidentielle.

- [x] Nouveau métier **charpentier** (10 niveaux) : XP en fabriquant le coffre et à chaque coup de marteau sur la cabane ou la grange.
- [x] **Harry Fordson** devant son atelier du centre-ville ; son sujet « Tu construis quoi ? » ouvre la boutique du charpentier ; histoire en 5 étapes d'amitié.
- [x] **Quête principale du coffre** : une fois la cabane retapée, **Harry apprend à faire le coffre** (remplace la solution provisoire du lot 4). 💡 à confirmer.
- [x] **Remy Gusto** : nom, histoire en 5 étapes, au restaurant de 7 h à 22 h, puis chez lui ; **maison** (bleu pâle, toit rouge, herbes aromatiques) dans la zone résidentielle.
- ❓ La « première quête secondaire » qui devait donner le coffre n'est plus nécessaire : à confirmer.

## Lot 7 et suivants — Grand upgrade graphique (style de l'image et de Stardew Valley)
Objectif : le rendu de `docs/carte-region-farmwest.jpg` : terre ocre et chemins de sable, rivière bleue avec ponts en bois, forêts denses en grappes, falaises en terrasses, bâtiments de l'Ouest en planches avec toits colorés, plage et pontons.
La liste détaillée est dans `docs/CARNET.md`, section « Chantier graphique niveau Stardew ». Ordre proposé :
- [x] 7a. Palette Far West et sols (v0.1.14) : herbe plus chaude en brins partout (ferme, zone résidentielle, forêt), **centre-ville en terre ocre** avec **rues de sable à ornières**, **trottoirs en planches** devant chaque commerce, place pavée gardée ; allées de sable aux bords adoucis dans la zone résidentielle ; peintres de sol partagés (`src/render/terrain.js`).
- [x] 7b. Falaises, rivière et ponts (v0.1.14) : le centre-ville sur son **plateau** — **falaise de terre rouge en terrasses** au nord, **rivière** à l'est et au sud, **ponts en bois** vers le rond-point et la station balnéaire ; panneau « ROND-POINT → ». (Rond-point : rivière et pont depuis le lot 2.)
- [x] 7c. Bâtiments western (v0.1.15) : **fausses façades en planches** à gradins et corniche, **auvent sur poteaux** au-dessus du trottoir, contours sombres, ombre au sol ; **saloon** plus haut avec balcon, rideaux rouges et **portes battantes** ; nouveau **bureau du shérif** (décor : étoile, barreaux, avis de recherche) au sud-ouest.
- [x] 7d. Arbres, cactus, rochers (v0.1.15) : chênes plus volumineux (lumière en haut à gauche, ombre en dessous) ; rochers avec reflets, facettes et mousse ; **cactus saguaro** (fleur au printemps, neige l'hiver) et cailloux ocre à la gare, au rond-point et au ranch.
- [x] 7e. Personnages et animaux (v0.1.16) : **marche de profil en 8 images** (cuisse + tibia, genoux qui plient, bras opposés, rebond, cheveux qui suivent) ; **bottes** pour tous ; chapeaux western (**cowboy**, **melon**, paille), **gilets** et **bandanas** ; 💡 Manu (chapeau, gilet, bandana), Harry (chapeau, chemise rouge, bandana), Myst (melon), Ed (gilet) ; **Jade en taille enfant** ; pattes des animaux et de la poule qui bougent, bandana du chien.
- [x] 7e bis. **Tenue western** dans l'écran de création (v0.1.17) : chapeau (cow-boy, melon, paille), gilet et bandana (6 couleurs ou aucun), chemise à carreaux, jambières en cuir, bottes à éperons, **robe de saloon** à volant. ⏳ À changer en cours de partie (👕) plus tard.
- [x] 7f. Intérieurs, icônes, interface (v0.1.16) : **parquet en lames décalées**, tableaux western et étagères aux murs, ombre des meubles ; **icônes pixel art** pour ~110 objets (bois, pierre, graines, récoltes, champignons, fleurs, poissons, minerais, gemmes, bocaux, plats…) à la place des émojis ; **interface en planches de bois** (cadres, boutons en bois, titres en police western), **cartes et dialogues sur parchemin**.
- [x] 7g. Lumière et ambiance (v0.1.17) : **lumière dorée le matin**, chaude en journée, **orangée puis rose le soir** (atténuée par les nuages et la pluie) ; **ombres portées qui tournent avec le soleil** (longues vers l'ouest le matin, vers l'est le soir) ; **ombres de nuages** qui glissent ; **poussière dorée** qui flotte, **pétales** au printemps.

---

## Lot 8 — Expérience et niveaux du joueur (demande du 17/11) ✅ v0.1.18
- [x] **Plus de gare dans les fermes** : petite gare et voie retirées ; la falaise court sur tout le bord ouest.
- [x] **Hache plantée dans le tronc** du grand arbre.
- [x] **Supprimer une partie à plusieurs** (si on l'a créée : pour tous ; sinon on la quitte) + validation « Supprimer cette partie ? » pour **toutes** les suppressions. SQL : nouvelle version de `ferme_delete_game`.
- [x] **Beaucoup plus de cailloux et d'arbres** au départ (≈ 170 arbres et 115 cailloux, contre 75 et 42).
- [x] **À chaque changement de saison**, on en remet autant qu'au départ (cases libres seulement).
- [x] **La locomotive repart** une fois le héros dans la diligence (la diligence part de la gare).
- [x] **Plus de panneaux indicateurs** (rond-point, route de la ferme, sortie est du centre-ville).
- [x] **Boîtes aux lettres** sans texte devant chez les habitants ; on lit le nom en l'examinant.
- [x] **Plus de nom au-dessus des PNJ** (les autres joueurs gardent le leur).
- [x] **Barre d'outils dans une bande sous la scène**.
- [x] **Forêt-labyrinthe** : murs d'arbres et de gros cailloux, cailloux à casser jamais sur le chemin, chemin garanti (test) vers la caverne, la trouée et le **coffre au bout** (or + composants simples au hasard, rempli à chaque saison 💡).
- [x] **Transition de nuit** : énergie qui remonte, rêve ou prémonition (10 rêves 💡 🆕), sauvegarde automatique.
- [x] **XP** : 1 par arbre / caillou / fleur / champignon, 5 par objet fabriqué ou plat, 40 par quête secondaire, 100 par quête principale (+10 par étape), 30 par quête du jour (💡 valeurs des quêtes).
- [x] **Niveaux** : niveau 1 à 10 XP, puis × 1,75 par niveau (niveau 10 à ≈ 5100 XP) ; **niveau 10 max**. Barre d'XP fine + niveau dans le HUD.
- [x] **Déblocages** : forêt au **niveau 3**, caverne au **niveau 5** (la quête qui l'ouvre viendra), recettes selon le niveau (celles du début au niveau 1 ; autres niveaux 💡). Suite à décider par l'utilisateur.

## Lot 9 — Quêtes secondaires de fabrication (demande du 17/11) ✅ v0.1.19
- [x] Demandes de **fabrication** données par les **habitants** (choix « 🛠️ Une demande ? » en discutant) et par le **panneau d'affichage**.
- [x] **Une par habitant et par semaine** (le panneau aussi) ; seulement des objets que le joueur **sait fabriquer** à son niveau (feu de camp, confitures et plats du chaudron, grillades, objets de l'établi).
- [x] Récompense : argent (💡 2 × prix de vente + 20 $), **40 XP** (quête secondaire), **+60 points d'amitié** pour un habitant (💡).

## Lot 10 — Carte de la région refaite comme l'image (demande du 17/11)
Objectif : le plan 🗺️ → Région doit ressembler à `docs/carte-region-farmwest.jpg` (même disposition, même niveau de détail).
- [ ] Carte pré-rendue en grand (≈ 1400 × 770 px), dessinée par le code avec les mêmes peintres que le jeu.
- [ ] Forêts en **canopée continue** (amas d'arbres fusionnés, ombrés), rivière bleue avec berges et ponts, **falaises en terrasses** autour du centre-ville, **montagnes en 3/4** enneigées, caverne dans la roche.
- [ ] Mini-bâtiments reconnaissables (gare, centre-ville, 4 fermes avec champs, maisons, ranch et enclos, fête foraine, cabines et parasols, port, voiliers).
- [ ] Étiquettes en police western, position du joueur, zoom et déplacement au doigt.

## Lot 11 — Deuxième passe graphique « niveau de l'image » (demande du 17/11)
Pour que **les scènes du jeu** atteignent le niveau de détail de l'image, scène par scène :
- [ ] 11a. **Auto-tuilage** des sols : bords propres herbe ↔ terre ↔ sable ↔ eau (coins intérieurs et extérieurs), au lieu de bords aléatoires.
- [ ] 11b. **Forêts denses** : canopée continue qui recouvre les bords des zones, avec lisière ombrée.
- [ ] 11c. **Falaises en terrasses** partout où le relief change (paroi texturée, bord herbeux, ombre portée).
- [ ] 11d. **Eau** : berges, écume, profondeur en dégradé, reflets animés, ponts et pontons.
- [ ] 11e. **Bâtiments en 3/4** : toits en tuiles ou bardeaux avec volume, façades détaillées, perrons, cheminées ; contours colorés (pas noirs).
- [ ] 11f. **Décor dense** : tonneaux, caisses, clôtures, fleurs, rochers, champs cultivés, parasols, bateaux.
- [ ] 11g. **Palette unique** (~48 couleurs) et lumière en haut à gauche partout, pour l'harmonie de l'ensemble.

## Plus tard (déjà noté dans le carnet)
- Pièce secrète dans chaque maison.
- Histoires d'Ed, Suzie, Jade ; quête du magasin d'Ed ; boissons pour le bar.
- Routines quotidiennes de tous les PNJ (modèle : Hailey).
- Objet pour parler à l'esprit de la quête Ghostbuster (lanceur à neutrons ?).
- Qui donne la canne à pêche.
