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
- [x] 2e. (v0.1.50) Le centre-ville **entouré par la rivière** (rivière aussi à l'ouest, pont vers la gare) ; la **route de l'est** descend de la montagne au **port** (sortie sud de la montagne, nord du port) ; le **port relié à la plage** par le quai (est de la plage ↔ ouest du port). La montagne reste aussi reliée à la zone résidentielle.
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
- [ ] Plus tard : le **cocher** en PNJ ; la **diligence débloquée au niveau 10**, avec **un arrêt à chaque carrefour** (décision du 18/11).

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

## Lot 10 — Carte de la région refaite comme l'image (demande du 17/11) ✅ v0.1.20
Objectif : le plan 🗺️ → Région doit ressembler à `docs/carte-region-farmwest.jpg` (même disposition, même niveau de détail).
- [x] Carte pré-rendue en grand (≈ 1400 × 770 px), dessinée par le code avec les mêmes peintres que le jeu.
- [x] Forêts en **canopée continue** (amas d'arbres fusionnés, ombrés), rivière bleue avec berges et ponts, **falaises en terrasses** autour du centre-ville, **montagnes en 3/4** enneigées, caverne dans la roche.
- [x] Mini-bâtiments reconnaissables (gare, centre-ville, 4 fermes avec champs, maisons, ranch et enclos, fête foraine, cabines et parasols, port, voiliers).
- [x] Étiquettes en police western, position du joueur, zoom et déplacement au doigt.

## Lot 11 — Deuxième passe graphique « niveau de l'image » (demande du 17/11) ✅ v0.1.21 – v0.1.22
Pour que **les scènes du jeu** atteignent le niveau de détail de l'image, scène par scène :
- [x] 11a. **Auto-tuilage** des sols : bords propres herbe ↔ terre ↔ sable ↔ eau (coins intérieurs et extérieurs), au lieu de bords aléatoires.
- [x] 11b. **Forêts denses** : canopée continue qui recouvre les bords des zones, avec lisière ombrée.
- [x] 11c. **Falaises en terrasses** partout où le relief change (paroi texturée, bord herbeux, ombre portée).
- [x] 11d. (reflets animés partout depuis v0.1.22) **Eau** : berges, écume, profondeur en dégradé, reflets animés, ponts et pontons.
- [x] 11e. (v0.1.22 : contours colorés automatiques sur tous les décors extérieurs) **Bâtiments en 3/4** : toits en tuiles ou bardeaux avec volume, façades détaillées, perrons, cheminées ; contours colorés (pas noirs).
- [x] 11f. (centre-ville et zones de l'Ouest) **Décor dense** : tonneaux, caisses, clôtures, fleurs, rochers, champs cultivés, parasols, bateaux.
- [x] 11g. Palette unique : 48 couleurs tirées des décors (k-moyennes) + 3 accents, tramage léger ; décors, carte et sprites ramenés à la palette (v0.1.22).
- [x] Forêt-labyrinthe : allées de 2 cases, murs en gros buissons (v0.1.22) ; **nouvelle forme à chaque saison**, tirée au hasard, jamais bloquante (v0.1.23). **Palette unique** (~48 couleurs) et lumière en haut à gauche partout, pour l'harmonie de l'ensemble.

## Quêtes secondaires de la cabane (demande du 18/11) ✅ v0.1.50
- [x] Les quêtes secondaires restent cachées jusqu'à la cabane retapée (confirmé).
- [x] **Agrandir la cabane** : le double de la cabane (160 bois + 60 pierres), au marteau devant la cabane ; on entre ensuite dans une **cabane plus grande** (16 × 11 au lieu de 12 × 9).
- [x] **Un vrai lit** : acheter le **plan du lit** chez Harry (💡 80 $), le fabriquer (💡 50 bois + 10 pierres), l'installer dans la cabane.
- [x] **Un coffre pour ranger** : acheter le **plan du coffre** chez Harry (💡 60 $), le fabriquer (80 bois + 20 pierres). Le coffre quitte la quête principale « Premiers pas » ; Harry ne l'apprend plus gratuitement.
- ⏳ Plus tard : la cabane agrandie vue de dehors (aujourd'hui seul l'intérieur change).

## Performances (19/11) ✅ v0.1.67
- [x] Résolution du jeu plafonnée (2× l'écran, au plus ~2,3 millions de pixels) : sur un téléphone à 3×, deux fois moins de pixels à dessiner, sans flou (agrandissement « pixelated »).
- [x] 30 images/s au repos, 60 dès qu'on bouge, qu'on touche l'écran, qu'on pêche ou pendant l'intro.
- [x] Réglage « 🔋 Économie d'énergie » : 30 images/s en permanence et résolution 1,5×.
- [x] Réverbération de la musique plus courte (moins de calcul audio).

## Correctifs du 19/11 (2) ✅ v0.1.66
- [x] Cadre du haut plus petit, il s'efface après 1,2 s sans bouger (au lieu de 2,5 s).
- [x] Marche de face / de dos refaite (4 temps, d'après Stardew Valley / Eastward) : contact (pied avant posé plus bas, talon arrière levé), passage (jambe pliée qui se lève, corps qui monte), bras qui avancent et reculent (la main monte et descend), à l'opposé des jambes.

## Correctifs du 19/11 ✅ v0.1.65
- [x] Écran d'accueil : au clavier, Entrée ne validait plus (le focus restait sur le titre derrière la fenêtre « Nouvelle partie »). Chaque fenêtre qui s'ouvre prend le focus sur son bouton principal ; flèches ↑ ↓ pour passer d'un bouton à l'autre ; Entrée dans le nom lance la partie.
- [x] Petits écrans : la barre de titre des fenêtres (avec la croix ✕) reste toujours visible en haut ; « Commencer ▶ » reste visible en bas de la création du personnage.

## Lot 20 — Souches, carrière, fleurs, cuisson, manger (demande du 19/11) ✅ v0.1.64
- [x] Un arbre abattu laisse sa **souche** (ferme et forêt). Coupée : 1 à 2 bois de plus, et l'arbre ne revient qu'à la saison suivante (ferme : remise des arbres à chaque saison). Laissée : elle repousse au bout de 4 jours, petit à petit (rejet vert sur la souche, puis jeune pousse → arbre en 3 jours).
- [x] Carrière vidée : 6 cailloux reviennent chaque jour jusqu'à la remplir.
- [x] Fleurs plus grosses.
- [x] Bug : avec des baies en main près du feu, le bouton d'action les mangeait au lieu de les griller.
- [x] Manger : petite animation (l'aliment monte à la bouche, miettes, « miam ») ; on ne peut pas enchaîner les bouchées (0,9 s).

## Lot 19 — Étal, outils, énergie, discussions (demande du 19/11) ✅ v0.1.63
- [x] Étal : prix de × 0,5 à × 2. × 0,5 → vendu en 2 à 3 min ; × 0,51 à × 0,99 → dans la journée ; × 1 à × 1,99 → pendant la nuit ; × 2 → en 2 jours.
- [x] Outils : plus de nom de palier dans les messages (« Il faut une meilleure pioche / hache / faucille »).
- [x] Énergie : couper et casser coûtent un peu plus (0,65 au lieu de 0,5 ; 0,4 au lieu de 0,3 dès le fer) ; chaque coup de marteau de réparation coûte 0,2.
- [x] Discussions : une seule par jour et par habitant (sauf quête spéciale) ; après, une bulle « Tu as déjà parlé à … aujourd’hui ».
- [x] Ed ne dit « Bienvenue au saloon » qu'au saloon ; ailleurs, réplique et petites phrases à lui 🆕.
- [x] Dernières icônes d'objets en « pixel moderne ».

## Lot 18 — Musique, icônes, réparation (demande du 19/11) ✅ v0.1.62
- [x] Musiques : 6 phrases avant de boucler (au lieu d'une) : modulation à la quarte puis un ton plus bas, mélodie ornée, décalée, à l'octave, allégée ; grille d'accords inversée une phrase sur deux ; arpèges qui changent de motif ; nuances.
- [x] Icônes d'objets refaites en « pixel moderne » 32 × 32 (tente violette, feu de camp, bûches, pierre, sachets de graines, blé, paille, minerais, champignons, fleurs, poissons, pain, coffre, baies, mûres, œuf, os, sac, maïs, carotte, laine, clôture, gemmes, gelée, chaudron, bonnet) ; affichées plus grandes dans le sac et à l'étal.
- [x] Réparation : à côté de chaque jauge, ce qu'on a dans le sac (🎒) ; « Reste à apporter » toujours affiché.
- [x] Toutes les icônes d'objets refaites (v0.1.63).

## Lot 17 — Boutons, cadre météo, étal de vente (demande du 19/11) ✅ v0.1.61
- [x] Menu : plus d'onglets Recettes ni Quêtes ; bouton ⭐ Quêtes à côté du bouton d'action (🛠️ Recettes à côté) ; icône du menu ☰.
- [x] Cadre du haut : plus de nom ni d'XP (ils passent en tête du menu) ; il s'efface quand on ne bouge plus (2,5 s) et revient quand on bouge.
- [x] Panneau de réparation : « La cabane » au lieu de « La cabane est délabrée ».
- [x] Bac de vente retiré. **Étal** à côté de la fontaine du centre-ville (façon Hay Day) : 10 objets au plus au début ; prix Bas (×1) → vendu en 1 à 3 min, ×1,25 → 3 à 6 min, ×1,5 → 8 à 12 min, ×1,75 → 15 à 25 min, Fort (×2) → pendant la nuit ; l'acheteur est un habitant (bulle d'info + journal). Les habitants y vendent aussi 3 lots par jour, à 2,5 × le prix 💡.
- [ ] Plus tard : agrandir l'étal (plus de 10 objets), habitants qui marchent jusqu'à l'étal.

## Lot 16 — Profil, pioche, joystick, marche (demande du 19/11) ✅ v0.1.60
- [x] Profil plus épais (buste, jambes, bras) pour tous les personnages.
- [x] Marche refaite façon Stardew : 4 poses (contact, passage, contact inverse, passage), jambes qui pivotent à la hanche, jambe arrière repliée au passage, bras opposés, rebond du corps ; une pose toutes les 105 ms.
- [x] Pioche de face / de dos : la tête reste à l'endroit, pointes vers le sol ; seul le manche suit le raccourci.
- [x] Téléphone : dès qu'on touche le joystick, toucher l'écran ne fait plus marcher le héros (on agit seulement sur ce qui est à portée).

## Lot 15 — Journal, carrière, saloon (demande du 19/11) ✅ v0.1.59
Décrit par l'utilisateur : cabane à moitié prix ; journal dans la cabane (200 dernières activités, onglets quêtes en cours / liens / histoire, onglet gardé) ; chevaux sans tête ; intérieur du saloon (scène, bar, tables, toilettes) ; plus de cailloux à la ferme : carrière au nord, cailloux qui repoussent, bordure de gros cailloux plus longs à casser, passage aléatoire vers une autre carrière (autre architecture, autres filons) ; filons plus gros, filons rares qui scintillent ; quêtes illisibles (jaune sur beige).
- [x] Cabane 40 bois + 15 pierres ; agrandissement 80 bois + 30 pierres.
- [x] Journal sur la table de la cabane : 📝 Activités (200 dernières bulles d'info, datées), ⭐ Quêtes en cours, 💞 Liens, 📖 Histoire (étapes accomplies des quêtes principales). L'onglet est sauvegardé.
- [x] Chevaux : encolure, tête allongée, oreille, museau, œil, bride.
- [x] Saloon 16 × 11 : scène (rideaux, rampe de lumières, piano, micro), long comptoir (Ed derrière), étagère à bouteilles, tabourets, 4 tables rondes, cabane des toilettes (porte à lune, « WC »), tonneaux, crachoirs.
- [x] Carrière (passage au nord de la ferme) : pleine au premier passage (40 cailloux, 3 filons), 3 cailloux de plus par jour ; bordure de gros cailloux (24 coups, 4 à 6 pierres, repoussent en 3 jours) ; chaque jour une des 3 bouches de la paroi nord est ouverte → carrière profonde (canyon de grès rouge, cristaux, filons de fer et d'or nombreux).
- [x] Ferme : plus de cailloux ni de gros rochers (anciennes parties nettoyées au chargement).
- [x] Filons plus gros ; fer et or : morceau de métal brut avec éclat qui scintille.
- [x] Étapes des quêtes : couleurs foncées lisibles sur le papier beige.
- [ ] 💡 À valider : 24 coups pour un gros caillou de bordure, 3 jours de repousse, filons de la carrière profonde (étain 15 %, fer 50 %, or 35 %).

## Lot 14 — Le premier champ (demande du 18/11) ✅ v0.1.58
Décrit par l'utilisateur : le lendemain du jour où l'on obtient la pelle, un courrier arrive avec des graines de blé en pièce jointe. Planter fait partie des quêtes principales. On crée des carrés à la pelle par terre, puis, comme dans Hay Day, on choisit les graines dans le sac et on glisse sur tous les carrés. Le blé pousse en 1 jour ; à la faucille on récolte tout d'un coup sans se déplacer. Tuto. La paille se vend 1 $.
- [x] Courrier des graines (boîte aux lettres de la ferme) + quête principale « Le premier champ » + tuto (dans le courrier et bulles au premier carré, premier semis, première récolte).
- [x] Bêcher sur toute l'herbe libre de la ferme ; glisser avec les graines en main sème tous les carrés.
- [x] Blé : mûr en 1 jour (≈ 20 min, ou au matin suivant) ; faucille → tout ce qui est mûr d'un coup.
- [x] Objet **paille** (1 $). 💡 20 graines dans le courrier ; 💡 un carré de blé donne 2 blés + 3 pailles.

## Lot 13 — Golgolas, la météorite et le centre de l'elfe (demande du 18/11) ✅ v0.1.56
Décrit par l'utilisateur : au niveau 5, une lettre de l'elfe **Golgolas** (vieil elfe ermite) arrive dans une **boîte aux lettres à la ferme**. La lire débloque une zone cachée au sud de la gare. Il faut d'abord casser une **météorite** (~5000 coups de pioche, 1 pierre tous les 10 coups, énergie normale), puis le **centre niveau 1** demande 500 bois, 500 pierres, 200 champignons. Récompense : piles de 10 → 15 (remplace le magasin d'amélioration).
- [x] Boîte aux lettres (drapeau rouge si lettre non lue), lettre 🆕, planches qui barrent la sortie sud de la gare jusqu'à la lecture.
- [x] Scène `golgolas` : centre en ruine puis réparé, météorite qui rétrécit avec barre de progression, Golgolas (chapeau pointu, bâton) et répliques 🆕.
- [x] Dons au centre par lots ; piles 15 ; carte « piles » du menu renvoie au centre. Quête principale « Le centre de Golgolas ».
- [x] Tests (`tests/golgolas.test.js`).
- [ ] Centre niveau 2 : à définir plus tard.

## Lot 12 — Cabane du pêcheur, Rouky et Rox, petits tas à creuser (demande du 18/11) ✅ v0.1.51
Décrit par l'utilisateur :
- La **station balnéaire** devient la **cabane du pêcheur**. Y vit **Rouky**, un vieux monsieur, avec son chien **Rox** ; il vit de la pêche. On ne sait pas grand-chose de lui : il semble être né ici et avoir travaillé dans les chemins de fer. Peu de gens viennent le voir.
- **Quête principale** débloquée quand on va le voir : trouver un **os** à donner à Rox ; Rouky donne alors une **canne à pêche sommaire mais utilisable**.
- **Petits tas** placés au hasard sur toute la carte, **une vingtaine par zone**, renouvelés **chaque jour** ; on peut marcher dessus et les **creuser une fois la pelle acquise**. Butin : pierres, bois, champignons, os, ou **rien (10 %)** ; liste à compléter plus tard.

À faire :
- [x] Scène `plage` → cabane du pêcheur : cabane en planches au toit de tôle (filets, tonneau, cannes, banc), intérieur « Chez Rouky » ; carte de la région : cabane et ponton à la place des cabines et parasols.
- [x] Rouky (casquette, barbe blanche, salopette ; poupée `paperdoll.js`) fait la sieste dehors de 6 h à 18 h (« Zzz »), puis rentre chez lui ; Rox couché à côté de lui ; répliques 🆕.
- [x] Quête principale « La canne de Rouky » (visible seulement après l'avoir vu) : aller le voir → trouver un os → le donner à Rox (ou à Rouky) → canne à pêche sommaire.
- [x] Petits tas : 20 par zone extérieure (sauf gare et centre-ville), nouvelles places chaque jour, on marche dessus, on les creuse à la pelle (1 ⚡, 1 XP) ; butin rien 10 % / pierres 30 % / bois 25 % / champignon de saison 20 % / os 15 % (💡 quantités : 1-3 pierres ou bois).
- [x] Objet **os** ; la canne active la pêche ; canne sommaire : attente × 1,6 et pas de poissons rares (thon, pieuvre, lotte bleue). ⏳ amélioration de la canne plus tard.
- [x] Tests : tas renouvelés chaque jour, pas de creusage sans pelle, butin, os → Rox → canne une seule fois, Rouky dehors le jour et chez lui le soir.
- [x] Manuel et liste de complétion à jour.

Réponses de l'utilisateur (18/11) — le lot est prêt à lancer :
- Le chien s'appelle **Rox**.
- Tas dans **toutes les zones extérieures sauf la gare et le centre-ville**.
- Butin : rien 10 %, pierres 30 %, bois 25 %, champignons 20 %, os 15 % (**répartition à faire évoluer avec le temps**).
- **Nouvelles places au hasard chaque jour**.
- La **fête foraine reste** à côté, sur la plage.
- Rouky **dort à côté de sa cabane le jour**, et il est **à l'intérieur le soir**.
- La canne sommaire est **plus lente** et attrape **moins de poissons** ; elle sera **améliorable** plus tard.

## Plus tard (déjà noté dans le carnet)
- Pièce secrète dans chaque maison.
- Histoires d'Ed, Suzie, Jade ; quête du magasin d'Ed ; boissons pour le bar.
- Routines quotidiennes de tous les PNJ (modèle : Hailey).
- Objet pour parler à l'esprit de la quête Ghostbuster (lanceur à neutrons ?).
- ~~Qui donne la canne à pêche~~ → Rouky (lot 12).
