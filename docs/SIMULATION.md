# Simulation de Farmwest

Générée par `node tools/simulate.mjs 120 12345` le 20/11/2026 (version 0.1.88).
Un joueur-type joue 120 jours de jeu en accéléré. Les valeurs viennent du jeu lui-même : changer un réglage puis relancer la simulation suffit.

## Hypothèses du joueur-type

- `bedtime` = 1320
- `walkTree` = 3
- `walkRock` = 2
- `tripQuarry` = 40
- `tripTown` = 90
- `sowPerSquare` = 0.4
- `tillPerSquare` = 1.2
- `fieldMax` = 120
- `introS` = 240
- `sellPrice` = 1
- `grind` = true
- forêt : 60 arbres adultes une fois ouverte (💡 estimation)
- Une journée jouée = 12.5 min réelles (6 h → 22 h, 780 ms par minute de jeu). Énergie : 100 par jour (le lit ou la tente rend tout).
- Arbres de la ferme au départ : 171. Carrière : 40 cailloux, +6 par jour ; 92 gros cailloux de bordure (pioche en cuivre).

## Étapes

| Jour | Temps de jeu cumulé | Étape | Niveau | Argent |
|---|---|---|---|---|
| 1 | 5 min | Niveau 1 (18 XP) | 1 | 500 $ |
| 1 | 5 min | Feu de camp | 1 | 500 $ |
| 1 | 7 min | Niveau 2 (35 XP) | 2 | 500 $ |
| 2 | 11 min | Cabane retapée | 2 | 500 $ |
| 3 | 21 min | Niveau 3 (79 XP) | 3 | 500 $ |
| 3 | 22 min | Four de Remy (couteau) | 3 | 500 $ |
| 10 | 85 min | Niveau 4 (156 XP) | 4 | 500 $ |
| 13 | 114 min | Grange rafistolée (pelle) — fin de « Premiers pas » | 4 | 500 $ |
| 13 | 115 min | Niveau 5 (290 XP) | 5 | 500 $ |
| 14 | 122 min | Courrier : 20 graines de blé | 5 | 500 $ |
| 14 | 122 min | Premier carré bêché | 5 | 500 $ |
| 14 | 124 min | Premières graines semées | 5 | 250 $ |
| 15 | 131 min | Première récolte de blé | 5 | 250 $ |
| 18 | 162 min | Cabane agrandie | 5 | 1 800 $ |
| 19 | 171 min | Lit (plan 80 $) | 5 | 2 920 $ |
| 23 | 208 min | Niveau 6 (540 XP) | 6 | 7 660 $ |
| 23 | 208 min | Coffre (plan 60 $) | 6 | 7 660 $ |
| 28 | 255 min | Hache Cuivre (600 $, 30 pierres, minage 2) | 6 | 13 060 $ |
| 28 | 255 min | Forêt ouverte (gros arbre abattu à la hache en cuivre) | 6 | 13 060 $ |
| 33 | 302 min | Pioche Cuivre (600 $, 30 pierres, minage 2) | 6 | 18 460 $ |
| 33 | 305 min | Hache Fer (2400 $, 60 pierres, minage 4) | 6 | 16 060 $ |
| 34 | 313 min | Pioche Fer (2400 $, 60 pierres, minage 4) | 6 | 14 860 $ |
| 35 | 321 min | Faucille Cuivre (600 $, 30 pierres, minage 2) | 6 | 15 460 $ |
| 39 | 359 min | Niveau 7 (934 XP) | 7 | 21 980 $ |
| 58 | 537 min | Niveau 8 (1652 XP) | 8 | 51 597 $ |
| 89 | 827 min | Niveau 9 (2909 XP) | 9 | 101 016 $ |

## Niveaux

| Niveau | XP nécessaire | Atteint le jour |
|---|---|---|
| 1 | 10 | 1 |
| 2 | 35 | 1 |
| 3 | 79 | 3 |
| 4 | 156 | 10 |
| 5 | 290 | 13 |
| 6 | 524 | 23 |
| 7 | 934 | 39 |
| 8 | 1652 | 58 |
| 9 | 2909 | 89 |
| 10 | 5108 | — |

## Économie

- Gagné : blé, paille et ventes de bois / pierres 222 900 $ (dont bois / pierres : 33 900 $) (15 $ par carré récolté, graine 5 $ → 10 $ de bénéfice par carré et par jour).
- Dépensé : graines 63 500 $, plans 140 $, forge 6 600 $.
- Fin de simulation : 153 160 $, 4 bois, 2 pierres, champ de 120 carrés, niveau 9 (4241 XP), minage 10.

## Goulets

- Journées finies par manque d'**énergie** : 21 ; par manque de **temps** : 99 ; plus rien à faire : 0.
- Journées bloquées par : l'argent 0, le niveau de minage 0, les cailloux épuisés 29, les arbres épuisés 74.

## Constats automatiques

- Le blé fait 85 % des revenus : 10 $ de bénéfice par carré et par jour, pour 1 énergie une seule fois (la terre reste bêchée). C'est le levier n° 1 de l'équilibrage (prix du blé, de la paille, de la graine, taille du champ).
- « Premiers pas » se termine le jour 13 : le goulet est la pierre (29 journées où la carrière était vide ; 6 cailloux par jour).
- La forêt s'ouvre le jour 28 (hache en cuivre : 600 $ et minage 2).
- Niveau 10 : pas atteint en 120 jours ; après les objectifs, l'XP ne vient plus que des arbres et des cailloux (1 XP chacun).

## Jour par jour

| Jour | Argent | Bois | Pierres | Niveau (XP) | Minage | Champ | Énergie utilisée | Temps joué | Fin de journée | Freins |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 500 | 34 | 11 | 2 (35) | 2 | 0 | 96 | 9.4 min | énergie |  |
| 2 | 500 | 10 | 14 | 2 (66) | 4 | 0 | 98 | 9.4 min | énergie |  |
| 3 | 500 | 6 | 4 | 3 (98) | 4 | 0 | 97 | 9.4 min | énergie |  |
| 4 | 500 | 67 | 11 | 3 (116) | 5 | 0 | 99 | 9.4 min | énergie | cailloux |
| 5 | 500 | 105 | 17 | 3 (129) | 5 | 0 | 69 | 9.4 min | temps | cailloux |
| 6 | 500 | 105 | 23 | 3 (135) | 5 | 0 | 23 | 9.4 min | temps | cailloux |
| 7 | 500 | 105 | 29 | 3 (141) | 5 | 0 | 23 | 9.4 min | temps | cailloux |
| 8 | 500 | 105 | 35 | 3 (147) | 5 | 0 | 23 | 9.4 min | temps | cailloux |
| 9 | 500 | 105 | 41 | 3 (153) | 6 | 0 | 23 | 9.4 min | temps | cailloux |
| 10 | 500 | 105 | 47 | 4 (159) | 6 | 0 | 23 | 9.4 min | temps | cailloux |
| 11 | 500 | 105 | 53 | 4 (165) | 6 | 0 | 23 | 9.4 min | temps | cailloux |
| 12 | 500 | 105 | 59 | 4 (171) | 6 | 0 | 23 | 9.4 min | temps | cailloux |
| 13 | 500 | 49 | 5 | 5 (295) | 6 | 0 | 95 | 9.4 min | énergie | cailloux |
| 14 | 250 | 55 | 11 | 5 (332) | 6 | 70 | 100 | 9.4 min | énergie | cailloux |
| 15 | 0 | 82 | 17 | 5 (343) | 6 | 70 | 56 | 9.4 min | temps | cailloux |
| 16 | 450 | 82 | 23 | 5 (349) | 7 | 120 | 73 | 9.4 min | temps | cailloux |
| 17 | 600 | 82 | 29 | 5 (355) | 7 | 120 | 23 | 9.4 min | temps | cailloux |
| 18 | 1 800 | 52 | 5 | 5 (410) | 7 | 120 | 98 | 9.4 min | temps | cailloux |
| 19 | 2 920 | 62 | 1 | 5 (472) | 7 | 120 | 95 | 9.4 min | énergie | cailloux |
| 20 | 4 120 | 84 | 7 | 5 (482) | 7 | 120 | 49 | 9.4 min | temps | cailloux |
| 21 | 5 320 | 84 | 13 | 5 (488) | 7 | 120 | 23 | 9.4 min | temps | cailloux |
| 22 | 6 520 | 84 | 19 | 5 (494) | 7 | 120 | 23 | 9.4 min | temps | cailloux |
| 23 | 7 660 | 4 | 5 | 6 (545) | 7 | 120 | 23 | 9.4 min | temps | cailloux |
| 24 | 8 860 | 4 | 11 | 6 (551) | 7 | 120 | 23 | 9.4 min | temps | cailloux |
| 25 | 10 060 | 4 | 17 | 6 (557) | 7 | 120 | 23 | 9.4 min | temps | cailloux |
| 26 | 11 260 | 4 | 23 | 6 (563) | 8 | 120 | 23 | 9.4 min | temps | cailloux |
| 27 | 12 460 | 4 | 29 | 6 (569) | 8 | 120 | 23 | 9.4 min | temps | cailloux |
| 28 | 13 060 | 4 | 5 | 6 (575) | 8 | 120 | 23 | 9.4 min | temps | cailloux |
| 29 | 14 260 | 4 | 11 | 6 (581) | 8 | 120 | 23 | 9.4 min | temps | cailloux |
| 30 | 15 460 | 4 | 17 | 6 (587) | 8 | 120 | 23 | 9.4 min | temps | cailloux |
| 35 | 15 460 | 4 | 2 | 6 (719) | 9 | 120 | 98 | 9.4 min | énergie | fini |
| 40 | 23 841 | 4 | 2 | 7 (1043) | 10 | 120 | 99 | 9.4 min | énergie | fini |
| 45 | 31 144 | 4 | 2 | 7 (1186) | 10 | 120 | 99 | 9.4 min | temps | fini, arbres |
| 50 | 39 360 | 4 | 2 | 7 (1353) | 10 | 120 | 5 | 9.4 min | temps | fini, arbres |
| 55 | 47 752 | 4 | 2 | 7 (1614) | 10 | 120 | 35 | 9.4 min | temps | fini, arbres |
| 60 | 55 055 | 4 | 2 | 8 (1797) | 10 | 120 | 99 | 9.4 min | temps | fini, arbres |
| 65 | 64 305 | 4 | 2 | 8 (2058) | 10 | 120 | 5 | 9.4 min | temps | fini, arbres |
| 70 | 71 663 | 4 | 2 | 8 (2265) | 10 | 120 | 99 | 9.4 min | temps | fini, arbres |
| 75 | 78 966 | 4 | 2 | 8 (2408) | 10 | 120 | 99 | 9.4 min | temps | fini, arbres |
| 80 | 87 567 | 4 | 2 | 8 (2610) | 10 | 120 | 5 | 9.4 min | temps | fini, arbres |
| 85 | 95 574 | 4 | 2 | 8 (2871) | 10 | 120 | 91 | 9.4 min | temps | fini, arbres |
| 90 | 102 877 | 4 | 2 | 9 (3019) | 10 | 120 | 99 | 9.4 min | temps | fini, arbres |
| 95 | 112 127 | 4 | 2 | 9 (3280) | 10 | 120 | 5 | 9.4 min | temps | fini, arbres |
| 100 | 119 485 | 4 | 2 | 9 (3487) | 10 | 120 | 99 | 9.4 min | temps | fini, arbres |
| 105 | 126 788 | 4 | 2 | 9 (3630) | 10 | 120 | 99 | 9.4 min | temps | fini, arbres |
| 110 | 135 389 | 4 | 2 | 9 (3832) | 10 | 120 | 5 | 9.4 min | temps | fini, arbres |
| 115 | 143 396 | 4 | 2 | 9 (4093) | 10 | 120 | 91 | 9.4 min | temps | fini, arbres |
| 120 | 150 699 | 4 | 2 | 9 (4241) | 10 | 120 | 99 | 9.4 min | temps | fini, arbres |

## Où régler

| Réglage | Fichier |
|---|---|
| Durée d'une journée (`MS_PER_MIN`), délai entre deux coups (`HIT_MS`) | src/config.js |
| Courbe de niveaux (`LEVELS`), XP par action / quête (`XP`) | src/systems/level.js |
| Prix et énergie de la forge (`upgradeCost`, `energyCost`), XP de minage (`MINING_XP`, `MINING_GAIN`) | src/data/tools.js |
| Coups pour un arbre / un caillou (`TREE_HP`, `ROCK_HPS`) | src/world/map.js |
| Bois par arbre, souches, repousse (`TREE_KINDS`, `STUMP_*`, `TREE_GROW_DAYS`) | src/data/forest.js |
| Cailloux de la carrière (`NATURE.carriere`), gros cailloux (`BORDER_*`) | src/data/nature.js, src/systems/quarry.js |
| Coût des réparations (`REPAIRS`, `REPAIR_STEP`), énergie au marteau (`REPAIR_ENERGY`) | src/data/repairs.js, src/systems/repair.js |
| Prix de vente / d'achat (`ITEMS[id].p`, `.buy`), cultures (`CROPS`), graines offertes (`SEED_GIFT`) | src/data/items.js, src/data/crops.js, src/systems/mail.js |
| Recettes (`HAND_RECIPES`), four de Remy (`OVEN_COST`) | src/data/recipes.js, src/systems/resto.js |
| Hypothèses du joueur-type (`P`) | tools/simulate.mjs |
