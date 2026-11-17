# Carnet de Farmwest

Mémoire du projet. À lire avant chaque séance, à compléter à la fin.
**Nettoyé le 17/11/2026 (15h10)** à la demande de l'utilisateur : le détail de ce qui est fait a été retiré (il est dans `docs/ROADMAP.md`, `docs/VERSIONS.md` et l'historique Git). Ce carnet garde : le monde et les personnages, les **questions en suspens**, les **décisions à faire plus tard**, les idées 💡 et ce qui est abandonné.

Légende : ✅ fait · ⏳ à faire · ❓ question pour l'utilisateur · 💡 idée de Claude (à valider) · ❌ abandonné

## ⭐ À lire en premier
- **Farmwest** (ancien nom Farm'tastic) : une ferme au **Far West**. Dépôt `yvanngn/farmwest`, GitHub Pages https://yvanngn.github.io/farmwest/, jeu claude.ai toujours republié sur la même page.
- **Feuille de route : `docs/ROADMAP.md`** (un lot à la fois, ❓ à trancher avant chaque lot). Carte de référence : `docs/carte-region-farmwest.jpg`.
- **Parcours du joueur** (à faire, possible, temps moyens, moments creux) : `docs/PARCOURS.md`, à remettre à jour avec le skill `parcours-debut` (il date d'avant Farmwest : ⏳ à refaire).
- **Dialogues** : `docs/DIALOGUES.md` (🆕 = à valider ; envoi à l'utilisateur dès 100 🆕). Versions : `docs/VERSIONS.md` (semver horodaté ; mineure / majeure seulement sur demande).
- Pas d'histoire inventée par Claude : seulement ce que l'utilisateur décrit ; les idées de Claude vont en 💡.

## 1. Le monde (à jour le 17/11/2026)
- Jeu de ferme pixel art multijoueur, style Stardew Valley, cultures façon Hay Day, thème Far West. Ton doux, un peu d'humour ; les habitants dévoilent **lentement** leur vie au fil de l'amitié (réplique par palier de cœurs, 10 cœurs max). Monnaie : **dollars ($)**.
- **Le héros** (nom par défaut **Cloud Jimny**, modifiable) a été licencié et cherche à redonner un sens à sa vie ; il rêve de construire sa maison. Une annonce offrait une cabane abandonnée ; peu de gens sont venus, à cause de la **légende du fantôme** : personne n'a osé habiter les **fermes du Nord**.
- **Début** : arrivée en **locomotive** à la gare → **Myst** l'accueille → **diligence** (un cocher) à travers le centre-ville, Myst raconte la légende et présente les bâtiments → **rond-point** → choix d'une des **4 fermes** → dépôt devant la ferme.

### La région (d'après la carte de référence)
| Zone | Où | Contenu |
|---|---|---|
| **Gare** | ouest | voie ferrée, quai, gare « FARMWEST » |
| **Centre-ville** | entre la gare et le rond-point (pont sur la rivière à l'est) | halle du marché, panneau d'affichage, fontaine, charpentier (Harry), **saloon** (Ed), magasin d'améliorations, marchand d'animaux, rue des commerces (boulangerie, boucherie, poissonnerie, **magasin général**), **restaurant** (Remy) au sud |
| **Les 4 fermes** | nord du rond-point | une par joueur : cabane, grange, champ, **grand arbre incassable** (hache à son pied), quai de l'ancienne arrivée à l'ouest |
| **Rond-point** | centre | fontaine, panneaux ; rivière et pont à l'ouest |
| **Zone résidentielle** | est du rond-point | Luna, Franck, Hailey, clinique, Myst (au fond), Ed / Suzie / Jade (maison à étages), **Remy** ; Igor traîne dans la ruelle |
| **Ranch du Maire** | sud du rond-point | maison de Manu (intérieur), grange rouge, enclos à chevaux |
| **Fête foraine** | sud du ranch | attractions (ancien parc FARM-LAND, plus caché) |
| **Station balnéaire** | sud du centre-ville | plage, mer au sud, ponton, pêche en mer |
| **Zone portuaire** | est du ranch | entrepôts, quai, pontons, voiliers |
| **Forêt** | est des fermes | arbres coupables (repoussent), champignons (couteau) |
| **Montagne** | est (encore reliée par la zone résidentielle) | froid, lac gelé, filons |
| **Caverne sombre** | après la forêt | **fermée** pour l'instant |
| **Tunnel de l'ouest** | colline à l'ouest | sur la carte seulement, reste tel quel pour l'instant |

## 2. Personnages (ce que l'utilisateur a décrit fait foi)
| Qui | Ce qu'on sait | Où |
|---|---|---|
| Le héros | Licencié, veut construire sa maison ; personnalisable. | sa ferme |
| **Myst** | Grand, mince, long manteau noir ; vieille maison sombre au fond de la zone résidentielle ; sort le soir, parle peu, écoute tout ; mis de côté par le village ; content qu'on bouscule les choses. **Accueille le héros à la gare** et l'accompagne en diligence. | zone résidentielle |
| **Luna** | Arrivée récemment ; travaillait dans l'informatique, remplacée par une IA ; veut sa ferme, gagne d'abord de l'argent. | zone résidentielle |
| **Franck** | Voisin de Luna, timide, sort peu ; traumatisme d'enfance dont on ne saura jamais rien ; un objet fabriqué l'animera ; un peu amoureux de Luna. | zone résidentielle |
| **Hailey** | Infirmière fraîchement diplômée, débordée, frise le burn-out. Routine quotidienne (§ 6). Hors service (repos, nuit), elle soigne quand même mais double le tarif. | clinique / sa maison |
| **Manu (Manuel), le Maire** | « Élu à l'unanimité », dit aimer ses villageois ; en secret, fait payer cher les impôts et en profite (vacances). **Vit dans son ranch** ; la journée sur la place. Harry lui doit beaucoup d'argent. | ranch du Maire / place |
| **Igor** | Forgeron ; ancien sportif de haut niveau, cheville abîmée, rêves de JO brisés ; fait de bons outils, rêve de forger des armes. Vend le patron du chaudron et la louche. | ruelle de la zone résidentielle |
| **Ed** | Barman du saloon ; ancien chauffeur routier, aime le contact des gens ; rêve d'ouvrir un magasin en ville ; marié à Suzie, papa de Jade. | saloon / maison à étages |
| **Suzie**, **Jade** | Femme et enfant d'Ed ; histoires à écrire. | maison à étages |
| **Remy Gusto** (le cuistot) | Fils abandonné d'un cuisinier renommé ; vu partout comme « le fils de », a perdu beaucoup de concours à cause de son nom ; venu à Farmwest, loin de tout, pour vivre de sa passion ; déteste son père, retentera sa chance à sa mort. Four en panne → donne le **couteau**. | restaurant / sa maison |
| **Harry Fordson** (le charpentier) | Charpentier de père en fils, très doué ; maladie inconnue sans symptôme visible ; aimerait se marier ; travaille beaucoup ; beaucoup de dettes envers Manu. Apprend le **coffre**. | devant son atelier |
| L'esprit de la vieille femme | Pleure la nuit sur la ferme, disparaît quand on approche (quête Ghostbuster). | ferme, la nuit |
| Le cocher | Conduit la diligence ; peut-être un PNJ plus tard. | — |

**Liens dits par l'utilisateur** : Franck → Luna (un peu amoureux) ; Myst ↔ le village (mis de côté) ; Manu ↔ villageois (impôts, future enquête) ; Hailey soigne tout le monde ; Luna ↔ héros (même parcours) ; Harry → Manu (dettes) ; Remy → son père (haine) ; Ed ↔ Suzie, Jade.

## 3. Questions en suspens (❓ à trancher par l'utilisateur)
- ❓ **Canne à pêche** : qui la donne, quand ? (plage ouverte, pêche impossible sans test)
- ❓ **Quête du coffre** : Harry l'apprend une fois la cabane retapée (💡 lot 6) — à confirmer ; la « première quête secondaire » prévue pour le coffre n'a plus lieu d'être ?
- ❓ **Quêtes secondaires** : cachées jusqu'à la cabane retapée (💡 confirmé le 17/11 sans moment précis) — garder ce moment ?
- ❓ **Objet pour parler à l'esprit** (Ghostbuster) : lanceur à neutrons ? à quel niveau (lot 8) ou métier ?
- ❓ **Objet qui animera Franck** : lequel ?
- ❓ **Enquête sur Manu** : qu'apprend-on, par qui ? (💡 Myst témoin, Igor forge pour lui, Harry endetté)
- ❓ **Manu « à refaire en partie »** (dit le 15/11) : quoi exactement ?
- ❓ **Histoires** à écrire : Ed (route, goûts), Suzie, Jade (âge, caractère), le cocher ; goûts d'Ed, Suzie, Jade, Harry.
- ❓ **Boissons et alcools pour le saloon d'Ed** : quel métier les fabrique, que donne Ed ?
- ❓ **Quête du magasin d'Ed** : quel magasin, où, quelles étapes ?
- ❓ **Hailey** : l'utilisateur adaptera sa routine (§ 6).
- ❓ **Gros rochers de la ferme** (pioche Cuivre) : garder, faire repousser ou retirer ?
- ❓ **Vente** : les commerces ne rachètent rien, tout se vend au bac de la ferme — à revoir ?
- ❓ **Énergie** : avec la tente à 100 % et les confitures à +45 ⚡ (≈ 400 ⚡ / jour possibles), est-ce trop ? (à vérifier en jouant)
- ❓ **Mode en ligne** : SQL `supabase_ferme.sql` + « Anonymous sign-ins » à faire côté Supabase, puis tester ; visiter la ferme d'un autre joueur (objets non partagés).
- ❓ **Lot 8** : qu'est-ce qui se débloque à quel niveau ? affichage de l'XP ?

## 4. Décidé, à faire dans un lot ultérieur
- ⏳ **Lot 7 (a → g)** : grand upgrade graphique façon carte de référence / Stardew (détail § 7), dont **7e bis : vêtements western** (chapeaux, bandanas, gilets, bottes à éperons…).
- ⏳ **Lot 8** : **expérience et niveaux** du joueur : 1 XP par petit objet cassé, fleur ou champignon ; 5 par objet fabriqué ; dizaines par quête (plus pour une principale) ; courbe exponentielle ; **niveau 10 max** ; déblocages de zones et de choses.
- ⏳ **Lot 9** : **quêtes secondaires de fabrication** (cuisine : confitures, plats au chaudron…).
- ⏳ **Lot 2e** : rivière autour du centre-ville dans la scène elle-même ; montagne reliée par la route de l'est ; port relié à la plage.
- ⏳ **Diligence** : arrêts pour voyager entre les zones (payants ?) ; le cocher en PNJ.
- ⏳ **Pièce secrète** dans chaque maison.
- ⏳ **Routines quotidiennes** pour tous les PNJ, sur le modèle de Hailey.
- ⏳ **Patrons « Bientôt »** (bague, tisane, bonnet, pain, ragoût, soupe de poisson) : à ouvrir plus tard ; boutiques propres pour l'alchimiste, le couturier, le joaillier (PNJ à décrire).
- ⏳ **Bouclier** (zone de combat) ; **épée** à l'ouverture de la caverne ; étages suivants de la caverne ; suite des tunnels de la grange (grand éboulement).
- ⏳ **Silhouettes** d'enfant (Jade) et de personnes âgées (lot 7e).
- ⏳ `docs/PARCOURS.md` à refaire pour le nouveau début (skill `parcours-debut`).

## 5. Idées de Claude (💡 à valider)
- Toutes les valeurs chiffrées non données par l'utilisateur (prix, temps, quantités, horaires, positions) sont des 💡 : chaudron 20 🪨 + 10 🪵, louche 30 $, quêtes du jour (50-90 $), métiers 15 XP par fabrication, mûres +2 / +6 ⚡, emplacements des buissons, horaires d'Ed (11 h-23 h 30) et de Remy (7 h-22 h), routine de Hailey, maisons de Remy et d'Ed, apparences de Remy et Harry, répliques 🆕.
- Noms de lieux western : Saloon, Magasin général, Zone résidentielle, Caverne sombre.
- Luna et le héros se comprennent (« tout recommencer ») ; Myst témoin de l'enquête sur Manu ; Igor forge pour Manu ; Igor motive Franck à marcher ; Hailey et Franck.

## 6. Routine quotidienne de Hailey (16/11, 💡 à adapter par l'utilisateur)
Principe : étapes « à partir de telle heure → tel lieu », avec variantes selon le jour ; « ? » = un jour sur deux. Données dans `src/data/npcs.js`, moteur `routinePlace` (`src/systems/social.js`).
- **Travail (6 jours sur 7)** : 6 h-7 h chez elle ; 7 h-12 h clinique ; 12 h-13 h déjeuner (banc de la place, devant chez elle, ou à la clinique) ; clinique jusqu'à 20 h, 21 h ou 22 h ; un soir sur deux 30 min devant chez elle ; puis chez elle.
- **Repos (jours 7, 14, 21, 28)** : grasse matinée ; 14 h-17 h balade en forêt ; 17 h-18 h 30 devant chez elle ; puis chez elle.

## 7. Chantier graphique « niveau Stardew » (lot 7, liste à faire petit à petit)
Fait : sol de la ferme (herbe en brins, nappes de tons, bords de chemins adoucis, v0.1.5).
- **Sols et décors** : même herbe partout ; transitions douces herbe ↔ terre ↔ pavés ↔ sable ↔ eau ; pavés variés ; eau animée (reflets, écume, nénuphars) ; herbe qui ondule ; saisons plus marquées.
- **Personnages** : sprites plus détaillés avec contour ; marche en 8 images ; animations d'outils ; portraits dans les dialogues ; enfant et personnes âgées ; animaux animés ; **vêtements western**.
- **Objets et bâtiments** : arbres plus volumineux qui tombent ; contours sombres ; façades détaillées, fumée des cheminées ; intérieurs meublés pièce par pièce ; icônes en pixel art à la place des émojis.
- **Lumière et ambiance** : ombres selon l'heure ; lumière dorée le matin, orangée le soir ; particules de saison ; ombres de nuages.
- **Interface** : fenêtres en bois / parchemin, police pixel ; barre d'outils façon Stardew ; horloge dessinée.

## 8. Abandonné
- ❌ Quête du **bijou d'Igor** (17/11) ; ❌ **villa** de Manu au centre-ville (17/11, il vit au ranch) ; ❌ étape **confiture** de « Premiers pas » (17/11) ; ❌ étape **pelle** séparée (fusionnée avec la grange).
- ❌ Accueil du joueur par le chef du village (→ Myst) ; ❌ « chef du village » (→ le Maire, Manu).
- ❌ Arrivée sur le quai de la ferme (→ gare + diligence) ; ❌ parc d'attractions caché derrière la forêt (→ fête foraine au sud du ranch).
- ❌ Hache dans la grange puis parmi les arbres (→ au pied du grand arbre) ; ❌ indice précis sur la hache.
- ❌ Soupes de baies (→ confitures) ; ❌ amende si on ne dort pas (→ clinique à 1 h, frais 10 % / 20 % hors service) ; ❌ tente à 50 % (→ 100 %).
- ❌ Roue des objets (→ sac en cases) ; ❌ roue des outils en bouton (→ barre d'outils en bas, roue sur Tab) ; ❌ bouton 👕 apparence.
- ❌ Piles de 99 dès le départ (→ 10 par case) ; ❌ « on entre chez un habitant à 5 cœurs » (→ toutes les maisons ouvertes).

## 9. Historique (une ligne par séance ; détail dans Git et `docs/VERSIONS.md`)
- 15/11 : écran titre, inventaire, arbres et pierres, charpentier, commerces, Luna, panneau d'affichage, début sans outils, champ, zone de combat, Franck, établi, discussions façon Witch'rok, objets au sol, mode en ligne préparé.
- 16/11 : lots 1-4 (tuto des baies, rappel 18 h, clinique à 1 h, patrons, chaudron, quête du jour, métiers), Ghostbuster, équilibrage, versions, objets qui tombent, forêt coupable, maisons ouvertes, Hailey (routine), Ed et sa famille, barre d'outils, essai d'herbe façon Stardew.
- 17/11 : **Farmwest** — renommage, lot 1 ambiance western, lot 2 nouvelle carte (rond-point, ranch, port, liaisons), lot 3 nouveau début (gare, diligence, choix de la ferme), lot 4 quêtes principales (grand arbre, outils uniques, plus de bijou), lot 5 restaurant et couteau (cueillette à la jauge), lot 6 charpentier Harry Fordson, Remy Gusto ; carnet nettoyé.
