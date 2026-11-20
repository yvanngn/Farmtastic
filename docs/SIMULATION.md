# Simulation de Farmwest

Générée par `node tools/simulate.mjs 120 12345` (version 0.1.93). Un joueur-type joue 120 jours de jeu en accéléré ;
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
- Ferme : 166 arbres. Carrière : 40 cailloux (+6/jour), 3 filons au plus, 92 gros cailloux de bordure. Étal : 10 objets à la fois.

## Étapes

| Jour | Temps de jeu cumulé | Étape | Niveau | Argent |
|---|---|---|---|---|
| 1 | 0 h 05 | Minage niveau 2 | 0 | 500 $ |
| 1 | 0 h 05 | Bûcheron niveau 2 | 0 | 500 $ |
| 1 | 0 h 06 | Niveau 1 (10 XP) | 1 | 500 $ |
| 1 | 0 h 06 | Minage niveau 3 | 1 | 500 $ |
| 1 | 0 h 07 | Bûcheron niveau 3 | 1 | 500 $ |
| 2 | 0 h 11 | Cabane retapée | 1 | 500 $ |
| 2 | 0 h 11 | Niveau 2 (35 XP) | 2 | 500 $ |
| 2 | 0 h 12 | Minage niveau 4 | 2 | 500 $ |
| 3 | 0 h 22 | Four de Remy (couteau) | 2 | 500 $ |
| 3 | 0 h 23 | Niveau 3 (79 XP) | 3 | 500 $ |
| 4 | 0 h 30 | Premier filon de cuivre cassé | 3 | 500 $ |
| 4 | 0 h 30 | Minage niveau 5 | 3 | 500 $ |
| 5 | 0 h 38 | Bûcheron niveau 4 | 3 | 635 $ |
| 7 | 0 h 59 | Niveau 4 (249 XP) | 4 | 680 $ |
| 7 | 0 h 59 | Grange rafistolée (pelle) — fin de « Premiers pas » | 4 | 680 $ |
| 7 | 0 h 59 | Premier filon de zinc cassé | 4 | 680 $ |
| 8 | 1 h 06 | Courrier : 20 graines de blé | 4 | 740 $ |
| 8 | 1 h 06 | Premier carré bêché | 4 | 740 $ |
| 8 | 1 h 06 | Premières graines semées | 4 | 740 $ |
| 8 | 1 h 07 | Niveau 5 (290 XP) | 5 | 740 $ |
| 9 | 1 h 15 | Première récolte de blé | 5 | 800 $ |
| 9 | 1 h 18 | Bûcheron niveau 5 | 5 | 850 $ |
| 10 | 1 h 26 | Cabane agrandie | 5 | 920 $ |
| 10 | 1 h 28 | Minage niveau 6 | 5 | 920 $ |
| 10 | 1 h 30 | Lit (plan 80 $) | 5 | 840 $ |
| 12 | 1 h 48 | Coffre (plan 60 $) | 5 | 984 $ |
| 14 | 2 h 03 | Premier filon de fer cassé | 5 | 1 137 $ |
| 14 | 2 h 05 | Niveau 6 (525 XP) | 6 | 1 137 $ |
| 16 | 2 h 22 | Bûcheron niveau 6 | 6 | 1 413 $ |
| 22 | 3 h 20 | Minage niveau 7 | 6 | 1 869 $ |
| 27 | 4 h 06 | Bûcheron niveau 7 | 6 | 2 271 $ |
| 36 | 5 h 29 | Premier filon de cobalt cassé | 6 | 3 192 $ |
| 39 | 5 h 59 | Niveau 7 (935 XP) | 7 | 3 552 $ |
| 44 | 6 h 46 | Minage niveau 8 | 7 | 4 104 $ |
| 47 | 7 h 13 | Bûcheron niveau 8 | 7 | 4 359 $ |
| 48 | 7 h 22 | Premier filon de nickel cassé | 7 | 4 413 $ |
| 80 | 12 h 22 | Minage niveau 9 | 7 | 8 100 $ |
| 80 | 12 h 23 | Bûcheron niveau 9 | 7 | 8 100 $ |
| 83 | 12 h 51 | Niveau 8 (1652 XP) | 8 | 8 544 $ |

## Niveaux

| Niveau | XP nécessaire | Atteint le jour | Minage atteint le jour | Bûcheron atteint le jour |
|---|---|---|---|---|
| 1 | 10 | 1 | 1 | 1 |
| 2 | 35 | 2 | 1 | 1 |
| 3 | 79 | 3 | 1 | 1 |
| 4 | 156 | 7 | 2 | 5 |
| 5 | 290 | 8 | 4 | 9 |
| 6 | 524 | 14 | 10 | 16 |
| 7 | 934 | 39 | 22 | 27 |
| 8 | 1652 | 83 | 44 | 47 |
| 9 | 2909 | — | 80 | 80 |
| 10 | 5108 | — | — | — |

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
- Dépensé : graines 4 420 $, plans 140 $. Fin : 12 453 $, stock invendu 8 551 objets, niveau 8 (2277 XP), minage 9, bûcheron 9.

## Goulets

- Journées finies par manque d'**énergie** : 119 ; par manque de **temps** : 1.
- Journées où il a manqué : de l'argent 0, des cailloux 28, des arbres 0.

## Constats automatiques

- « Premiers pas » se termine le jour 7 ; la pierre est le frein (6 cailloux par jour à la carrière une fois vidée).
- La forêt s'ouvre le jour — (bûcheron 3). Filons : de cuivre niv. 3 → jour 4, de zinc niv. 4 → jour 7, de fer niv. 5 → jour 14, de cobalt niv. 6 → jour 36, de nickel niv. 7 → jour 48, d'argent niv. 8 → jour —, d'or niv. 10 → jour —.
- Revenus : blé et paille 58 %, bois et pierres 3 %, minerais 39 %. L'étal (10 objets, 2 passages par jour) plafonne les ventes.
- Niveau 10 : pas atteint en 120 jours ; compétences au plus 10.

## Jour par jour

| Jour | Argent | Bois | Pierres | Niveau (XP) | Minage | Bûcheron | Champ | Stock | Énergie | Temps joué | Fin | Manques |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 500 | 39 | 13 | 1 (20) | 3 | 3 | 0 | 0 | 96 | 9.4 min | énergie |  |
| 2 | 500 | 10 | 18 | 2 (52) | 4 | 3 | 0 | 0 | 99 | 9.4 min | énergie |  |
| 3 | 500 | 11 | 7 | 3 (84) | 4 | 3 | 0 | 0 | 100 | 9.4 min | énergie |  |
| 4 | 500 | 33 | 21 | 3 (99) | 5 | 3 | 0 | 0 | 96 | 9.4 min | énergie |  |
| 5 | 635 | 66 | 37 | 3 (115) | 5 | 4 | 0 | 0 | 94 | 9.4 min | énergie |  |
| 6 | 635 | 94 | 54 | 3 (131) | 5 | 4 | 0 | 0 | 98 | 9.4 min | énergie |  |
| 7 | 680 | 16 | 6 | 4 (254) | 5 | 4 | 0 | 0 | 95 | 9.4 min | énergie |  |
| 8 | 740 | 49 | 18 | 5 (299) | 5 | 4 | 8 | 0 | 96 | 9.4 min | énergie |  |
| 9 | 850 | 82 | 34 | 5 (315) | 5 | 5 | 8 | 20 | 94 | 9.4 min | temps |  |
| 10 | 840 | 1 | 0 | 5 (415) | 6 | 5 | 8 | 40 | 98 | 9.4 min | énergie |  |
| 11 | 890 | 34 | 13 | 5 (431) | 6 | 5 | 8 | 66 | 99 | 9.4 min | énergie |  |
| 12 | 984 | 4 | 4 | 5 (493) | 6 | 5 | 8 | 86 | 98 | 9.4 min | énergie |  |
| 13 | 1 044 | 4 | 4 | 5 (509) | 6 | 5 | 8 | 160 | 95 | 9.4 min | énergie |  |
| 14 | 1 137 | 4 | 4 | 6 (525) | 6 | 5 | 8 | 233 | 95 | 9.4 min | énergie |  |
| 15 | 1 305 | 4 | 4 | 6 (541) | 6 | 5 | 8 | 307 | 95 | 9.4 min | énergie |  |
| 16 | 1 413 | 4 | 4 | 6 (557) | 6 | 6 | 8 | 380 | 95 | 9.4 min | énergie |  |
| 17 | 1 521 | 4 | 4 | 6 (573) | 6 | 6 | 8 | 454 | 95 | 9.4 min | énergie |  |
| 18 | 1 614 | 4 | 4 | 6 (590) | 6 | 6 | 8 | 534 | 98 | 9.4 min | énergie |  |
| 19 | 1 668 | 4 | 4 | 6 (607) | 6 | 6 | 8 | 615 | 98 | 9.4 min | énergie |  |
| 20 | 1 722 | 4 | 4 | 6 (624) | 6 | 6 | 8 | 695 | 98 | 9.4 min | énergie |  |
| 21 | 1 776 | 4 | 4 | 6 (640) | 6 | 6 | 8 | 769 | 95 | 9.4 min | énergie |  |
| 22 | 1 869 | 4 | 4 | 6 (657) | 7 | 6 | 8 | 849 | 98 | 9.4 min | énergie |  |
| 23 | 1 923 | 4 | 4 | 6 (674) | 7 | 6 | 8 | 930 | 98 | 9.4 min | énergie |  |
| 24 | 1 977 | 4 | 4 | 6 (690) | 7 | 6 | 8 | 1003 | 95 | 9.4 min | énergie |  |
| 25 | 2 085 | 4 | 4 | 6 (706) | 7 | 6 | 8 | 1077 | 95 | 9.4 min | énergie |  |
| 26 | 2 178 | 4 | 4 | 6 (722) | 7 | 6 | 8 | 1150 | 95 | 9.4 min | énergie |  |
| 27 | 2 271 | 4 | 4 | 6 (738) | 7 | 7 | 8 | 1224 | 95 | 9.4 min | énergie |  |
| 28 | 2 379 | 4 | 4 | 6 (754) | 7 | 7 | 8 | 1297 | 95 | 9.4 min | énergie |  |
| 29 | 2 547 | 4 | 4 | 6 (771) | 7 | 7 | 8 | 1378 | 98 | 9.4 min | énergie |  |
| 30 | 2 601 | 4 | 4 | 6 (787) | 7 | 7 | 8 | 1451 | 95 | 9.4 min | énergie |  |
| 35 | 3 138 | 4 | 4 | 6 (870) | 7 | 7 | 8 | 1840 | 98 | 9.4 min | énergie |  |
| 40 | 3 660 | 4 | 4 | 7 (952) | 7 | 7 | 8 | 2221 | 98 | 9.4 min | énergie |  |
| 45 | 4 212 | 4 | 4 | 7 (1033) | 8 | 7 | 8 | 2596 | 95 | 9.4 min | énergie |  |
| 50 | 4 725 | 4 | 4 | 7 (1117) | 8 | 8 | 8 | 2991 | 98 | 9.4 min | énergie |  |
| 55 | 5 208 | 4 | 4 | 7 (1199) | 8 | 8 | 8 | 3373 | 95 | 9.4 min | énergie |  |
| 60 | 5 874 | 4 | 4 | 7 (1280) | 8 | 8 | 8 | 3747 | 95 | 9.4 min | énergie |  |
| 65 | 6 654 | 4 | 4 | 7 (1361) | 8 | 8 | 8 | 4122 | 98 | 9.4 min | énergie |  |
| 70 | 7 131 | 4 | 4 | 7 (1442) | 8 | 8 | 8 | 4496 | 95 | 9.4 min | énergie |  |
| 75 | 7 533 | 4 | 4 | 7 (1524) | 8 | 8 | 8 | 4878 | 95 | 9.4 min | énergie |  |
| 80 | 8 100 | 4 | 4 | 7 (1606) | 9 | 9 | 8 | 5259 | 95 | 9.4 min | énergie |  |
| 85 | 8 706 | 4 | 4 | 8 (1687) | 9 | 9 | 8 | 5634 | 95 | 9.4 min | énergie |  |
| 90 | 9 372 | 4 | 4 | 8 (1769) | 9 | 9 | 8 | 6015 | 98 | 9.4 min | énergie |  |
| 95 | 9 720 | 4 | 4 | 8 (1852) | 9 | 9 | 8 | 6414 | 99 | 9.4 min | énergie | cailloux |
| 100 | 10 137 | 4 | 4 | 8 (1937) | 9 | 9 | 8 | 6844 | 95 | 9.4 min | énergie | cailloux |
| 105 | 10 848 | 4 | 4 | 8 (2022) | 9 | 9 | 8 | 7270 | 95 | 9.4 min | énergie | cailloux |
| 110 | 11 376 | 4 | 4 | 8 (2107) | 9 | 9 | 8 | 7700 | 95 | 9.4 min | énergie | cailloux |
| 115 | 11 943 | 4 | 4 | 8 (2192) | 9 | 9 | 8 | 8126 | 99 | 9.4 min | énergie | cailloux |
| 120 | 12 453 | 4 | 4 | 8 (2277) | 9 | 9 | 8 | 8551 | 99 | 9.4 min | énergie | cailloux |

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
