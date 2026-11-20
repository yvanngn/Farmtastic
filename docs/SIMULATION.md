# Simulation de Farmwest

Générée par `node tools/simulate.mjs 120 12345` (version 0.1.89). Un joueur-type joue 120 jours de jeu en accéléré ;
les valeurs viennent du jeu lui-même : changer un réglage puis relancer la simulation suffit.

## Hypothèses du joueur-type

- `bedtime` = 1320
- `introS` = 240
- `walkTree` = 3
- `walkRock` = 2
- `tripQuarry` = 40
- `tripPlace` = 30
- `tripTown` = 120
- `tillPerSquare` = 1.2
- `sowPerSquare` = 0.4
- `harvestS` = 4
- `listS` = 15
- `standDay` = 1
- `standFast` = 0
- `fieldMax` = 120
- `stockDays` = 2
- `grind` = true
- forêt : 60 arbres adultes une fois ouverte (💡 estimation)
- Une journée jouée = 12.5 min réelles au plus (6 h → 22 h), 9.4 min au moins (on ne dort pas avant 18 h). Énergie : 100 par jour.
- Ferme : 171 arbres. Carrière : 40 cailloux (+6/jour), 3 filons au plus, 92 gros cailloux de bordure. Étal : 10 objets à la fois.

## Étapes

| Jour | Temps de jeu cumulé | Étape | Niveau | Argent |
|---|---|---|---|---|
| 1 | 0 h 05 | Niveau 1 (18 XP) | 1 | 500 $ |
| 1 | 0 h 05 | Feu de camp | 1 | 500 $ |
| 1 | 0 h 06 | Minage niveau 2 | 1 | 500 $ |
| 1 | 0 h 06 | Bûcheron niveau 2 | 1 | 500 $ |
| 1 | 0 h 07 | Niveau 2 (35 XP) | 2 | 500 $ |
| 2 | 0 h 10 | Minage niveau 3 | 2 | 500 $ |
| 2 | 0 h 11 | Cabane retapée | 2 | 500 $ |
| 2 | 0 h 12 | Bûcheron niveau 3 | 2 | 500 $ |
| 2 | 0 h 13 | Minage niveau 4 | 2 | 500 $ |
| 3 | 0 h 21 | Niveau 3 (79 XP) | 3 | 500 $ |
| 3 | 0 h 22 | Four de Remy (couteau) | 3 | 500 $ |
| 4 | 0 h 29 | Minage niveau 5 | 3 | 500 $ |
| 4 | 0 h 30 | Premier filon de cuivre cassé | 3 | 500 $ |
| 4 | 0 h 31 | Forêt ouverte (arbre tombé abattu) | 3 | 500 $ |
| 5 | 0 h 40 | Bûcheron niveau 4 | 3 | 635 $ |
| 6 | 0 h 48 | Minage niveau 6 | 3 | 635 $ |
| 7 | 0 h 58 | Premier filon de zinc cassé | 3 | 680 $ |
| 7 | 0 h 59 | Niveau 4 (265 XP) | 4 | 680 $ |
| 7 | 0 h 59 | Grange rafistolée (pelle) — fin de « Premiers pas » | 4 | 680 $ |
| 8 | 1 h 06 | Courrier : 20 graines de blé | 4 | 740 $ |
| 8 | 1 h 06 | Premier carré bêché | 4 | 740 $ |
| 8 | 1 h 06 | Premières graines semées | 4 | 740 $ |
| 8 | 1 h 06 | Niveau 5 (297 XP) | 5 | 740 $ |
| 8 | 1 h 07 | Bûcheron niveau 5 | 5 | 740 $ |
| 9 | 1 h 15 | Première récolte de blé | 5 | 800 $ |
| 9 | 1 h 17 | Minage niveau 7 | 5 | 850 $ |
| 10 | 1 h 26 | Cabane agrandie | 5 | 920 $ |
| 11 | 1 h 37 | Lit (plan 80 $) | 5 | 890 $ |
| 11 | 1 h 37 | Bûcheron niveau 6 | 5 | 890 $ |
| 13 | 1 h 55 | Coffre (plan 60 $) | 5 | 1 044 $ |
| 14 | 2 h 03 | Premier filon de fer cassé | 5 | 1 137 $ |
| 14 | 2 h 04 | Niveau 6 (524 XP) | 6 | 1 137 $ |
| 14 | 2 h 05 | Bûcheron niveau 7 | 6 | 1 137 $ |
| 14 | 2 h 05 | Minage niveau 8 | 6 | 1 137 $ |
| 19 | 2 h 52 | Bûcheron niveau 8 | 6 | 1 668 $ |
| 21 | 3 h 10 | Minage niveau 9 | 6 | 1 776 $ |
| 25 | 3 h 48 | Bûcheron niveau 9 | 6 | 2 085 $ |
| 30 | 4 h 34 | Minage niveau 10 | 6 | 2 601 $ |
| 34 | 5 h 11 | Bûcheron niveau 10 | 6 | 3 084 $ |
| 36 | 5 h 29 | Premier filon de cobalt cassé | 6 | 3 192 $ |
| 39 | 5 h 58 | Niveau 7 (934 XP) | 7 | 3 552 $ |
| 48 | 7 h 22 | Premier filon de nickel cassé | 7 | 4 413 $ |
| 83 | 12 h 49 | Niveau 8 (1652 XP) | 8 | 8 544 $ |

## Niveaux

| Niveau | XP nécessaire | Atteint le jour | Minage atteint le jour | Bûcheron atteint le jour |
|---|---|---|---|---|
| 1 | 10 | 1 | 1 | 1 |
| 2 | 35 | 1 | 1 | 1 |
| 3 | 79 | 3 | 2 | 2 |
| 4 | 156 | 7 | 2 | 5 |
| 5 | 290 | 8 | 4 | 8 |
| 6 | 524 | 14 | 6 | 11 |
| 7 | 934 | 39 | 9 | 14 |
| 8 | 1652 | 83 | 14 | 19 |
| 9 | 2909 | — | 21 | 25 |
| 10 | 5108 | — | 30 | 34 |

## Économie

| Vendu | $ | Part |
|---|---|---|
| Blé | 9 596 | 58 % |
| Minerai de zinc | 1 500 | 9 % |
| Minerai de nickel | 1 470 | 9 % |
| Minerai de cuivre | 1 305 | 8 % |
| Minerai de fer | 1 200 | 7 % |
| Minerai de cobalt | 990 | 6 % |
| Bois | 442 | 3 % |
| Paille | 10 | 0 % |

- Blé : un carré rend 2 blés (6 $) + 3 pailles (1 $) = 5 objets à vendre ; la graine coûte 5 $. L'étal n'en prend que 10 à la fois : c'est lui qui limite le champ (8 carrés à la fin).
- Dépensé : graines 4 420 $, plans 140 $. Fin : 12 453 $, stock invendu 8 546 objets, niveau 8 (2290 XP), minage 10, bûcheron 10.

## Goulets

- Journées finies par manque d'**énergie** : 120 ; par manque de **temps** : 0.
- Journées où il a manqué : de l'argent 0, des cailloux 27, des arbres 0.

## Constats automatiques

- « Premiers pas » se termine le jour 7 ; la pierre est le frein (6 cailloux par jour à la carrière une fois vidée).
- La forêt s'ouvre le jour 4 (bûcheron 3). Filons : de cuivre niv. 3 → jour 4, de zinc niv. 4 → jour 7, de fer niv. 5 → jour 14, de cobalt niv. 6 → jour 36, de nickel niv. 7 → jour 48, d'argent niv. 8 → jour —, d'or niv. 10 → jour —.
- Revenus : blé et paille 58 %, bois et pierres 3 %, minerais 39 %. L'étal (10 objets, 2 passages par jour) plafonne les ventes.
- Niveau 10 : pas atteint en 120 jours ; compétences au plus 10.

## Jour par jour

| Jour | Argent | Bois | Pierres | Niveau (XP) | Minage | Bûcheron | Champ | Stock | Énergie | Temps joué | Fin | Manques |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 500 | 34 | 11 | 2 (35) | 2 | 2 | 0 | 0 | 96 | 9.4 min | énergie |  |
| 2 | 500 | 10 | 14 | 2 (66) | 4 | 3 | 0 | 0 | 98 | 9.4 min | énergie |  |
| 3 | 500 | 6 | 4 | 3 (98) | 4 | 3 | 0 | 0 | 97 | 9.4 min | énergie |  |
| 4 | 500 | 40 | 14 | 3 (112) | 5 | 3 | 0 | 0 | 92 | 9.4 min | énergie |  |
| 5 | 635 | 62 | 35 | 3 (128) | 5 | 4 | 0 | 0 | 96 | 9.4 min | énergie |  |
| 6 | 635 | 90 | 52 | 3 (144) | 6 | 4 | 0 | 0 | 98 | 9.4 min | énergie |  |
| 7 | 680 | 12 | 4 | 4 (267) | 6 | 4 | 0 | 0 | 95 | 9.4 min | énergie |  |
| 8 | 740 | 45 | 16 | 5 (312) | 6 | 5 | 8 | 0 | 96 | 9.4 min | énergie |  |
| 9 | 850 | 78 | 32 | 5 (328) | 7 | 5 | 8 | 20 | 94 | 9.4 min | énergie |  |
| 10 | 920 | 42 | 8 | 5 (382) | 7 | 5 | 8 | 40 | 91 | 9.4 min | énergie |  |
| 11 | 890 | 25 | 11 | 5 (443) | 7 | 6 | 8 | 66 | 99 | 9.4 min | énergie |  |
| 12 | 1 044 | 74 | 22 | 5 (460) | 7 | 6 | 8 | 86 | 98 | 9.4 min | énergie |  |
| 13 | 1 044 | 5 | 2 | 5 (522) | 7 | 6 | 8 | 160 | 99 | 9.4 min | énergie |  |
| 14 | 1 137 | 5 | 2 | 6 (538) | 8 | 7 | 8 | 234 | 95 | 9.4 min | énergie |  |
| 15 | 1 305 | 5 | 2 | 6 (554) | 8 | 7 | 8 | 307 | 95 | 9.4 min | énergie |  |
| 16 | 1 413 | 5 | 2 | 6 (570) | 8 | 7 | 8 | 381 | 95 | 9.4 min | énergie |  |
| 17 | 1 521 | 5 | 2 | 6 (586) | 8 | 7 | 8 | 454 | 95 | 9.4 min | énergie |  |
| 18 | 1 614 | 5 | 2 | 6 (603) | 8 | 7 | 8 | 535 | 98 | 9.4 min | énergie |  |
| 19 | 1 668 | 5 | 2 | 6 (620) | 8 | 8 | 8 | 615 | 98 | 9.4 min | énergie |  |
| 20 | 1 722 | 5 | 2 | 6 (637) | 8 | 8 | 8 | 696 | 98 | 9.4 min | énergie |  |
| 21 | 1 776 | 5 | 2 | 6 (653) | 9 | 8 | 8 | 769 | 95 | 9.4 min | énergie |  |
| 22 | 1 869 | 5 | 2 | 6 (670) | 9 | 8 | 8 | 850 | 98 | 9.4 min | énergie |  |
| 23 | 1 923 | 5 | 2 | 6 (687) | 9 | 8 | 8 | 930 | 98 | 9.4 min | énergie |  |
| 24 | 1 977 | 5 | 2 | 6 (703) | 9 | 8 | 8 | 1004 | 95 | 9.4 min | énergie |  |
| 25 | 2 085 | 5 | 2 | 6 (719) | 9 | 9 | 8 | 1077 | 95 | 9.4 min | énergie |  |
| 26 | 2 178 | 5 | 2 | 6 (735) | 9 | 9 | 8 | 1151 | 95 | 9.4 min | énergie |  |
| 27 | 2 271 | 5 | 2 | 6 (751) | 9 | 9 | 8 | 1224 | 95 | 9.4 min | énergie |  |
| 28 | 2 379 | 5 | 2 | 6 (767) | 9 | 9 | 8 | 1298 | 95 | 9.4 min | énergie |  |
| 29 | 2 547 | 5 | 2 | 6 (784) | 9 | 9 | 8 | 1378 | 98 | 9.4 min | énergie |  |
| 30 | 2 601 | 5 | 2 | 6 (800) | 10 | 9 | 8 | 1452 | 95 | 9.4 min | énergie |  |
| 35 | 3 138 | 5 | 2 | 6 (883) | 10 | 10 | 8 | 1840 | 98 | 9.4 min | énergie |  |
| 40 | 3 660 | 5 | 2 | 7 (965) | 10 | 10 | 8 | 2222 | 98 | 9.4 min | énergie |  |
| 45 | 4 212 | 5 | 2 | 7 (1046) | 10 | 10 | 8 | 2596 | 95 | 9.4 min | énergie |  |
| 50 | 4 725 | 5 | 2 | 7 (1130) | 10 | 10 | 8 | 2992 | 98 | 9.4 min | énergie |  |
| 55 | 5 208 | 5 | 2 | 7 (1212) | 10 | 10 | 8 | 3373 | 95 | 9.4 min | énergie |  |
| 60 | 5 874 | 5 | 2 | 7 (1293) | 10 | 10 | 8 | 3748 | 95 | 9.4 min | énergie |  |
| 65 | 6 654 | 5 | 2 | 7 (1374) | 10 | 10 | 8 | 4122 | 98 | 9.4 min | énergie |  |
| 70 | 7 131 | 5 | 2 | 7 (1455) | 10 | 10 | 8 | 4497 | 95 | 9.4 min | énergie |  |
| 75 | 7 533 | 5 | 2 | 7 (1537) | 10 | 10 | 8 | 4878 | 95 | 9.4 min | énergie |  |
| 80 | 8 100 | 5 | 2 | 7 (1619) | 10 | 10 | 8 | 5260 | 95 | 9.4 min | énergie |  |
| 85 | 8 706 | 5 | 2 | 8 (1700) | 10 | 10 | 8 | 5634 | 95 | 9.4 min | énergie |  |
| 90 | 9 372 | 5 | 2 | 8 (1782) | 10 | 10 | 8 | 6016 | 98 | 9.4 min | énergie |  |
| 95 | 9 720 | 5 | 2 | 8 (1865) | 10 | 10 | 8 | 6409 | 99 | 9.4 min | énergie | cailloux |
| 100 | 10 137 | 5 | 2 | 8 (1950) | 10 | 10 | 8 | 6838 | 95 | 9.4 min | énergie | cailloux |
| 105 | 10 848 | 5 | 2 | 8 (2035) | 10 | 10 | 8 | 7265 | 95 | 9.4 min | énergie | cailloux |
| 110 | 11 376 | 5 | 2 | 8 (2120) | 10 | 10 | 8 | 7694 | 95 | 9.4 min | énergie | cailloux |
| 115 | 11 943 | 5 | 2 | 8 (2205) | 10 | 10 | 8 | 8121 | 99 | 9.4 min | énergie | cailloux |
| 120 | 12 453 | 5 | 2 | 8 (2290) | 10 | 10 | 8 | 8546 | 99 | 9.4 min | énergie | cailloux |

## Où régler

| Réglage | Fichier |
|---|---|
| Durée d'une journée (`MS_PER_MIN`), délai entre deux coups (`HIT_MS`) | src/config.js |
| Courbe de niveaux (`LEVELS`), XP par action / quête (`XP`) | src/systems/level.js |
| Compétences : XP par niveau (`MINING_XP`), gains (`MINING_GAIN`, `WOOD_GAIN`), niveaux requis (`NEED`), énergie par coup (`energyCost`) | src/data/tools.js |
| Coups pour un arbre / un caillou (`TREE_HP`, `ROCK_HPS`), filons (`VEINS`, `VEIN_HP`, `VEIN_ORE`) | src/world/map.js, src/data/nature.js |
| Bois par arbre, souches, repousse (`TREE_KINDS`, `STUMP_*`, `TREE_GROW_DAYS`) | src/data/forest.js |
| Carrière (`NATURE.carriere`), gros cailloux (`BORDER_*`) | src/data/nature.js, src/systems/quarry.js |
| Réparations (`REPAIRS`, `REPAIR_STEP`, `REPAIR_ENERGY`) | src/data/repairs.js, src/systems/repair.js |
| Prix (`ITEMS[id].p`, `.buy`), cultures (`CROPS`), graines offertes (`SEED_GIFT`), étal (`STAND_CAP`, `PRICE_STEPS`) | src/data/items.js, src/data/crops.js, src/systems/mail.js, src/systems/stand.js |
| Hypothèses du joueur-type (`P`) | tools/simulate.mjs |
