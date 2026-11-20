# Carnet de Farmwest

Mémoire du projet. À lire avant chaque séance, à compléter à la fin.
**Nettoyé le 17/11/2026 (15h10)** à la demande de l'utilisateur : le détail de ce qui est fait a été retiré (il est dans `docs/ROADMAP.md`, `docs/VERSIONS.md` et l'historique Git). Ce carnet garde : le monde et les personnages, les **questions en suspens**, les **décisions à faire plus tard**, les idées 💡 et ce qui est abandonné.

Légende : ✅ fait · ⏳ à faire · ❓ question pour l'utilisateur · 💡 idée de Claude (à valider) · ❌ abandonné

- 🧪 **Essai du 18/11** : Manu d'après la **planche fournie** (`docs/sprites/manu.png` : chapeau marron, barbe grise, gilet vert, chemise blanche, pantalon et bottes marron), **en qualité d'origine** via `tools/sprite-from-planche.py` (72 × 107 par image, affichée à 27 × 40 pixels du monde). Le tour de la fontaine (essai) a été **retiré le 18/11** ; `orbitNPC` reste disponible pour un prochain essai. ❓ On garde ce design ? (L'ancien : costume blanc, gilet bordeaux.)
- **18/11 : design « A »** (Jade plus mignonne : nœuds rouges, manches bouffantes, short-salopette à poche cœur, chaussettes, chaussures à bride) choisi par l'utilisateur et **adapté à tous** (têtes plus rondes, grands yeux, joues roses). PNG de chaque personnage : `docs/personnages/` et `claude/PERSONNAGES.md` dans le Projet. Pas de sprites PNG dans le jeu : chaque pose est dessinée une fois puis gardée en cache, le gain serait négligeable.
- **18/11 : tous les personnages dessinés par le code** (« poupée » `src/render/paperdoll.js`, héros Cloud compris), après comparaison avec la planche de Manu : l'utilisateur préfère ce rendu, et les tenues restent faciles à changer. Tenues reprises des sprites actuels (Manu gilet vert et chapeau marron, Franck en cow-boy, Luna chapeau et bandana, Jade cheveux noirs…). Les planches (`assets/sprites`, `sheet:`) ne servent plus, mais restent dans le dépôt.
- **18/11 : plus de Gemini.** Les personnages viendront des planches de sprites fournies par l'utilisateur, gardées en qualité d'origine. ⚠️ Tant que les autres ne sont pas refaits, Manu est nettement plus fin qu'eux (deux niveaux de détail à l'écran).
- **18/11 (soir) : personnages en « pixel moderne »** (`src/render/folk.js`), choisis sur maquette parmi 3 directions (Stardew 16 × 32, pixel moderne 32 × 64, Day of the Tentacle) d'après la planche de référence ; proportions de la 1re comparaison Cloud / Myst (tête ronde, pas la version à grosse tête). **Écran titre « pixel crépuscule enrichi »** (mesas striées, soleil en bandes, train sur un pont, ranch éclairé, lucioles). ⏳ Intérieurs de maison : 3 maquettes proposées (Stardew, pixel éclairé, vue de côté), pas encore de choix. v0.1.53-55 : personnalisation du héros (sexe et plus de choix), diligence, cocher, train, fontaines, façades du centre-ville, maisons, ranch, grange, gare, entrepôts, cabane et carte de la région au même niveau ; plus de noms de lieux sur la carte de la région.

## ⭐ À lire en premier
- **Farmwest** (ancien nom Farm'tastic) : une ferme au **Far West**. Dépôt `yvanngn/farmwest`, GitHub Pages https://yvanngn.github.io/farmwest/, jeu claude.ai toujours republié sur la même page.
- **Feuille de route : `docs/ROADMAP.md`** (un lot à la fois, ❓ à trancher avant chaque lot). Carte de référence : `docs/carte-region-farmwest.jpg`.
- **Parcours du joueur** (à faire, possible, temps moyens, moments creux) : `docs/PARCOURS.md`, à remettre à jour avec le skill `parcours-debut` (il date d'avant Farmwest : ⏳ à refaire).
- **Manuel du joueur** : `docs/MANUEL.md` ; **liste de complétion** : `docs/COMPLETION.md` (à tenir à jour à chaque lot).
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
| **Cabane du pêcheur** (ancienne station balnéaire, lot 12 ✅) | sud du centre-ville | plage, mer au sud, ponton, cabane de Rouky ; pêche en mer |
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
| **Rouky** et son chien **Rox** (18/11, lot 12 ✅) | Vieux monsieur, vit de la pêche ; on ne sait pas grand-chose de lui : il semble être né ici et avoir travaillé dans les chemins de fer ; peu de gens viennent le voir. Donne une canne à pêche sommaire contre un os pour Rox (quête principale). | cabane du pêcheur |
| **Remy Gusto** (le cuistot) | Fils abandonné d'un cuisinier renommé ; vu partout comme « le fils de », a perdu beaucoup de concours à cause de son nom ; venu à Farmwest, loin de tout, pour vivre de sa passion ; déteste son père, retentera sa chance à sa mort. Four en panne → donne le **couteau**. | restaurant / sa maison |
| **Harry Fordson** (le charpentier) | Charpentier de père en fils, très doué ; maladie inconnue sans symptôme visible ; aimerait se marier ; travaille beaucoup ; beaucoup de dettes envers Manu. Apprend le **coffre**. | devant son atelier |
| L'esprit de la vieille femme | Pleure la nuit sur la ferme, disparaît quand on approche (quête Ghostbuster). | ferme, la nuit |
| Le cocher | Conduit la diligence ; peut-être un PNJ plus tard. | — |

**Liens dits par l'utilisateur** : Franck → Luna (un peu amoureux) ; Myst ↔ le village (mis de côté) ; Manu ↔ villageois (impôts, future enquête) ; Hailey soigne tout le monde ; Luna ↔ héros (même parcours) ; Harry → Manu (dettes) ; Remy → son père (haine) ; Ed ↔ Suzie, Jade.

## 3. Questions en suspens (❓ à trancher par l'utilisateur)
- ✅ **Canne à pêche** (18/11) : Rouky, contre un os pour Rox (lot 12).
- ✅ **Quête du coffre** (18/11) : quête secondaire ; le plan du coffre s'achète chez Harry, comme le plan du lit. Autres premières quêtes secondaires : agrandir la cabane (double des composants), fabriquer son lit (v0.1.50).
- ✅ **Quêtes secondaires** (18/11) : restent cachées jusqu'à la cabane retapée ; l'utilisateur ajustera le moment à l'usage.
- ❓ **Objet pour parler à l'esprit** (Ghostbuster) : lanceur à neutrons ? à quel niveau (lot 8) ou métier ?
- ❓ **Objet qui animera Franck** : lequel ?
- ❓ **Enquête sur Manu** : qu'apprend-on, par qui ? (💡 Myst témoin, Igor forge pour lui, Harry endetté)
- ❓ **Manu « à refaire en partie »** (dit le 15/11) : quoi exactement ?
- ❓ **Histoires** à écrire : Ed (route, goûts), Suzie, Jade (âge, caractère), le cocher ; goûts d'Ed, Suzie, Jade, Harry.
- ❓ **Boissons et alcools pour le saloon d'Ed** : quel métier les fabrique, que donne Ed ?
- ❓ **Quête du magasin d'Ed** : quel magasin, où, quelles étapes ?
- ❓ **Hailey** : l'utilisateur adaptera sa routine (§ 6).
- ✅ **Gros rochers de la ferme** (18/11) : moins nombreux (v0.1.49 : 1 % des cases de la forêt de la ferme au lieu de 2 %, 3 à 5 au lieu d'environ 8).
- ❓ **Vente** : les commerces ne rachètent rien, tout se vend au bac de la ferme — à revoir ?
- ❓ **Énergie** : avec la tente à 100 % et les confitures à +45 ⚡ (≈ 400 ⚡ / jour possibles), est-ce trop ? (à vérifier en jouant)
- ❓ **Mode en ligne** : SQL `supabase_ferme.sql` + « Anonymous sign-ins » à faire côté Supabase, puis tester ; visiter la ferme d'un autre joueur (objets non partagés).
- ❓ **Passer l'intro** en multijoueur : on prend la première ferme libre (💡) — ou faut-il quand même choisir ?
- ❓ **Niveaux** : que débloquer aux niveaux 2, 4, 6-10 ? Niveaux des recettes hors début (💡 : tisane 2, pain 2, potion 2, bonnet 3, soupe de poisson 3, bague 4, ragoût 4) à confirmer. Quête qui ouvrira la caverne (niveau 5).

## 4. Décidé, à faire dans un lot ultérieur
- ⏳ **Lot 7 (a → g)** : grand upgrade graphique façon carte de référence / Stardew (détail § 7), dont **7e bis : vêtements western** (chapeaux, bandanas, gilets, bottes à éperons…).
- ✅ **Lot 8** (v0.1.18) — ancien détail : (notes du 17/11) : plus de gare dans les fermes ; hache plantée dans le grand arbre ; suppression des parties à plusieurs + validation de toute suppression ; beaucoup plus de cailloux et d'arbres au départ, remis en même quantité à chaque saison ; transition de nuit (énergie qui remonte, rêves / prémonitions, sauvegarde auto). Puis : locomotive qui repart, plus de panneaux indicateurs, boîtes aux lettres muettes (nom à la lecture), plus de nom au-dessus des PNJ, barre d'outils sous la scène, forêt-labyrinthe (cailloux, chemin garanti, coffre au bout).
- ✅ **Lot 10** (v0.1.20) : carte de la région refaite comme l'image (`src/render/regionmap.js`). ✅ **Lot 11** (v0.1.21-22) : deuxième passe graphique « niveau de l'image » (auto-tuilage, forêts, falaises, eau, bâtiments 3/4, décor dense, palette).
- ✅ **Lot 8** : **expérience et niveaux** du joueur : 1 XP par petit objet cassé, fleur ou champignon ; 5 par objet fabriqué ; dizaines par quête (plus pour une principale) ; courbe exponentielle ; **niveau 10 max** ; déblocages de zones et de choses.
- ✅ **Lot 9** (v0.1.19) : demandes de fabrication, une par habitant et par semaine, + panneau.
- ✅ **Lot 2e** (v0.1.50) : rivière autour du centre-ville, route de l'est montagne ↔ port, port ↔ plage.
- ✅ **Lot 12** (v0.1.51) : cabane du pêcheur (Rouky, Rox), quête de la canne, petits tas à creuser. ⏳ Plus tard : canne améliorable, butin des tas à faire évoluer.
- ✅ **Lot 20** (v0.1.64) : souches (bois en plus ou repousse en 4 jours), carrière qui se remplit, fleurs plus grosses, cuisson des baies réparée, animation quand on mange.
- ✅ **Lot 19** (v0.1.63) : étal × 0,5 à × 2, messages d'outils sans palier, énergie un peu plus chère, une discussion par jour, Ed hors du saloon, toutes les icônes.
- ✅ **Lot 18** (v0.1.62) : musiques plus variées (6 phrases, modulations), icônes d'objets « pixel moderne », sac affiché pendant les réparations.
- ✅ **Lot 17** (v0.1.61) : boutons Quêtes / Recettes, cadre du haut allégé, étal de vente du centre-ville (bac retiré).
- ✅ **Lot 16** (v0.1.60) : profil épaissi, marche en 4 poses façon Stardew, pioche à l'endroit, joystick sans déplacement au toucher.
- ✅ **Lot 15** (v0.1.59) : journal de la cabane, carrière et carrière profonde, saloon, chevaux, cabane à moitié prix, quêtes lisibles.
- ✅ **Lot 14** (v0.1.58) : premier champ (courrier des graines, carrés à la pelle partout, semis en glissant, blé en 1 jour, récolte d'un coup, paille 1 $).
- ✅ **18/11** (v0.1.57) : plus de noms sur les flèches de sortie ; grange rouge nettoyée ; héros en transparence derrière les toits ; images Gemini supprimées.
- ✅ **Lot 13** (v0.1.56) : lettre de Golgolas au niveau 5, zone cachée au sud de la gare, météorite, centre niveau 1 (piles 15). ⏳ Centre niveau 2 à définir.
- ⏳ **Diligence** : débloquée au **niveau 10**, **un arrêt à chaque carrefour** (18/11) ; le cocher en PNJ.
- ⏳ **Pièce secrète** dans chaque maison.
- ⏳ **Routines quotidiennes** pour tous les PNJ, sur le modèle de Hailey.
- ⏳ **Patrons « Bientôt »** (bague, tisane, bonnet, pain, ragoût, soupe de poisson) : à ouvrir plus tard ; boutiques propres pour l'alchimiste, le couturier, le joaillier (PNJ à décrire).
- ⏳ **Bouclier** (zone de combat) ; **épée** à l'ouverture de la caverne ; étages suivants de la caverne ; suite des tunnels de la grange (grand éboulement).
- ✅ Silhouette d'enfant (Jade, v0.1.16). ⏳ Personnes âgées : aucun PNJ âgé décrit pour l'instant.
- ⏳ `docs/PARCOURS.md` à refaire pour le nouveau début (skill `parcours-debut`).

## 5. Idées de Claude (💡 à valider)
- Lot 20 : souche 2 coups, 1 à 2 bois ; 6 cailloux par jour à la carrière ; 0,9 s pour manger.
- Lot 17 : délais de vente par palier de prix ; 3 offres des habitants par jour à 2,5 × ; icônes ☰ menu, ⭐ quêtes, 🛠️ recettes ; cadre effacé après 2,5 s sans bouger.
- Lot 15 : bordure 24 coups / 4-6 pierres / repousse 3 jours ; carrière 40 cailloux, 3 filons ; carrière profonde 16 cailloux, 8 filons (étain 15, fer 50, or 35) ; bouche ouverte tirée d'après la date ; décor du saloon.
- Lot 14 : 20 graines dans le courrier ; 2 blés + 3 pailles par carré ; texte du courrier (signé « L'étal du marché ») 🆕.
- Lot 13 : boîte aux lettres en (8,5) à la ferme ; texte de la lettre et répliques de Golgolas 🆕 ; dons au centre par paquets de ce qu'on a en sac.
- Lot 12 : 1 à 3 pierres ou bois par tas, 1 champignon (le courant de la saison, petit), 1 os ; 1 ⚡ et 1 XP par tas ; canne sommaire : attente × 1,6, pas de poisson de rareté < 2 ; répliques de Rouky 🆕 ; tenue de Rouky (casquette, barbe blanche, salopette).
- 18/11 : plan du lit 80 $, plan du coffre 60 $, lit 50 bois + 10 pierres.
- v0.1.26 : 0,65 s entre deux coups de hache / pioche (`CFG.HIT_MS`) ; énergie par coup 0,5 (0,3 dès le fer) au lieu de 1 (0,5).
- v0.1.24 : seuil « grande maison » = 72 px de large (pan de toit), en dessous pignon pointu ; contour des personnages = teinte foncée de leurs cheveux.
- Lot 9 : récompense 2 × prix de vente + 20 $, +60 points d'amitié, quantités (2 grillades, 2 pains, 3 clôtures), le coffre et le chaudron ne sont jamais demandés, 5 répliques génériques 🆕 (les mêmes pour tous les habitants).
- Lot 8 : coffre du labyrinthe 80-160 $ + 3 tirages de bois / pierre / baies / mûres / minerai de cuivre (2-5), rempli à chaque saison ; XP des quêtes (40 / 100 / étape 10 / jour 30) ; gros rocher 2 XP ; courbe × 1,75 ; 10 rêves ; anciennes parties remises au niveau 1 (niveau 3 si cabane retapée).
- Toutes les valeurs chiffrées non données par l'utilisateur (prix, temps, quantités, horaires, positions) sont des 💡 : chaudron 20 🪨 + 10 🪵, louche 30 $, quêtes du jour (50-90 $), métiers 15 XP par fabrication, mûres +2 / +6 ⚡, emplacements des buissons, horaires d'Ed (11 h-23 h 30) et de Remy (7 h-22 h), routine de Hailey, maisons de Remy et d'Ed, apparences de Remy et Harry, répliques 🆕.
- Noms de lieux western : Saloon, Magasin général, Zone résidentielle, Caverne sombre.
- Tenues western des PNJ (17/11) : Manu chapeau + gilet + bandana, Harry chapeau + bandana, Myst chapeau melon, Ed gilet.
- **Bureau du shérif** (décor, 17/11) au sud-ouest du centre-ville : pas de shérif pour l'instant (PNJ à décrire si besoin).
- Luna et le héros se comprennent (« tout recommencer ») ; Myst témoin de l'enquête sur Manu ; Igor forge pour Manu ; Igor motive Franck à marcher ; Hailey et Franck.

## 6. Routine quotidienne de Hailey (16/11, 💡 à adapter par l'utilisateur)
Principe : étapes « à partir de telle heure → tel lieu », avec variantes selon le jour ; « ? » = un jour sur deux. Données dans `src/data/npcs.js`, moteur `routinePlace` (`src/systems/social.js`).
- **Travail (6 jours sur 7)** : 6 h-7 h chez elle ; 7 h-12 h clinique ; 12 h-13 h déjeuner (banc de la place, devant chez elle, ou à la clinique) ; clinique jusqu'à 20 h, 21 h ou 22 h ; un soir sur deux 30 min devant chez elle ; puis chez elle.
- **Repos (jours 7, 14, 21, 28)** : grasse matinée ; 14 h-17 h balade en forêt ; 17 h-18 h 30 devant chez elle ; puis chez elle.

## 7. Chantier graphique « niveau Stardew » (lot 7, liste à faire petit à petit)
Fait : sol de la ferme (v0.1.5) ; **7a** palette Far West et sols (centre-ville ocre, rues à ornières, trottoirs en planches, herbe en brins partout) et **7b** falaise, rivière et ponts autour du centre-ville (v0.1.14). **7c** bâtiments western et **7d** arbres, cactus, rochers (v0.1.15) ; **7e** personnages et animaux, **7f** intérieurs, icônes, interface en bois (v0.1.16) ; **7e bis** tenue western et **7g** lumière (v0.1.17). **Lot 7 terminé.** Suite : lot 8 (XP et niveaux).
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
- ❌ Bouton « Passer » des dialogues (17/11 : ▸ quand il y a une suite, comme Witch'rok).
- ❌ Roue des objets (→ sac en cases) ; ❌ roue des outils en bouton (→ barre d'outils en bas, roue sur Tab) ; ❌ bouton 👕 apparence.
- ❌ Piles de 99 dès le départ (→ 10 par case) ; ❌ « on entre chez un habitant à 5 cœurs » (→ toutes les maisons ouvertes).

## 9. Historique (une ligne par séance ; détail dans Git et `docs/VERSIONS.md`)
- 15/11 : écran titre, inventaire, arbres et pierres, charpentier, commerces, Luna, panneau d'affichage, début sans outils, champ, zone de combat, Franck, établi, discussions façon Witch'rok, objets au sol, mode en ligne préparé.
- 16/11 : lots 1-4 (tuto des baies, rappel 18 h, clinique à 1 h, patrons, chaudron, quête du jour, métiers), Ghostbuster, équilibrage, versions, objets qui tombent, forêt coupable, maisons ouvertes, Hailey (routine), Ed et sa famille, barre d'outils, essai d'herbe façon Stardew.
- 17/11 : **Farmwest** — renommage, lot 1 ambiance western, lot 2 nouvelle carte (rond-point, ranch, port, liaisons), lot 3 nouveau début (gare, diligence, choix de la ferme), lot 4 quêtes principales (grand arbre, outils uniques, plus de bijou), lot 5 restaurant et couteau (cueillette à la jauge), lot 6 charpentier Harry Fordson, Remy Gusto ; carnet nettoyé ; lots 7a-7b (sols Far West, falaise, rivière, ponts) ; lots 7c-7d (façades western, saloon, shérif, arbres, cactus, rochers) ; arrivée dans le train ; lots 7e-7f (marche en 8 images, chapeaux, icônes pixel art, interface en bois) ; intro accélérable / passable, plus de « Passer » dans les dialogues (▸ seulement s'il y a une suite) ; lots 7e bis et 7g. ; **lot 8** (v0.1.18) : plus de gare dans les fermes, hache plantée, suppression des parties à plusieurs, plus d'arbres et de cailloux (remis chaque saison), locomotive qui repart, boîtes aux lettres, bande d'outils, forêt-labyrinthe et coffre, nuit (rêves, sauvegarde), XP et niveaux. ; **lot 9** (v0.1.19) : demandes de fabrication (habitants + panneau, une par semaine). ; **lot 10** (v0.1.20) : carte de la région refaite comme l'image (pré-rendue 1408 × 768, zoom et déplacement). ; **lot 11** (v0.1.21) : auto-tuilage des sols, canopée continue, falaises, eau, façades, décor dense. ; v0.1.22 : palette unique, contours colorés, eau animée partout, labyrinthe à allées larges. ; v0.1.23 : labyrinthe de la forêt redessiné à chaque saison (même forme pour tous les joueurs d'une partie ; arbres coupés, champignons et cailloux de la forêt remis à zéro). ; v0.1.24 : toits refaits (pan d'ardoises pour les grandes maisons, pignon pointu pour les petites — avant ils étaient à l'envers), personnages (16 × 31, grosse tête, yeux avec du blanc, 3 tons) et animaux redessinés façon Stardew. ; v0.1.25 : tête des personnages un peu plus petite (8 × 10), animaux vus de face et de dos selon leur marche, chien et chat assis à l'arrêt, bras des coups d'outil recalé, roses du cochon ajoutés à la palette. ; v0.1.26 : coups de hache et de pioche plus lents (un geste à la fois), énergie par coup divisée par deux. ; v0.1.27 : délai caché de 0,3 s entre deux actions du bouton ✋ / espace (doigt ou touche maintenus). ; v0.1.28 : zoom « Loin » par défaut. ; v0.1.29 : enseignes réécrites nettes à la résolution de l'écran, plus de tramage, nouvelle diligence détaillée, sols en nappes rondes (plus de plaques carrées), façades du centre-ville détaillées (volets, croisillons, rideaux, jardinières, ombres), lumière chaude et ombres de nuages, lucioles dans toutes les zones extérieures. ; v0.1.30 : personnages refaits d'après la planche de l'utilisateur (héros en salopette verte, Myst manteau + grand chapeau + foulard, Luna sweat bleu et chignon au crayon, Franck pull en maille, Hailey blouse et stéthoscope, Manu costume crème et gilet bordeaux, Igor forgeron, Ed barbe-casquette-bretelles, Remy toque, Harry casquette plate et ceinture à outils), esprit en robe d'époque, cocher en haut-de-forme. ; v0.1.31 : une partie effacée est retenue sur l'appareil (ferme_parties_effacees) et ne revient plus au rechargement. ; v0.1.32 : intro — bulle en haut (téléphone en portrait), enseigne « GARE DE FARMWEST » nette, Myst reste sur le quai pendant la descente du train, un clic / toucher n'importe où fait avancer les textes. ; v0.1.33 : sac de départ = seulement la tente ; chaque zoom montre plus loin que le précédent ; zoom « Loin » remis par défaut pour tout le monde (nouvelle clé ferme_zoom_v2). ; v0.1.34 : planche des personnages enregistrée (docs/personnages-reference.jpg) ; héros salopette bleue + chemise à carreaux + sac à dos, Myst cheveux noirs en épis sans chapeau, Luna sweat à capuche, Hailey chignon, Igor chauve + gants, Ed casquette bleue + chemise grise, Suzie robe bleue + tablier fleuri, Jade couettes + salopette, cocher en melon, esprit aux cheveux longs. ; v0.1.35 : essai de planche de sprites pour Manu (assets/sprites/manu.png, src/render/sheets.js, tools/sprite-from-reference.py) ; à généraliser si validé. ; v0.1.36 : tous les personnages (héros par défaut, habitants, esprit) affichés depuis des planches tirées de la référence ; le héros repasse au dessin par code dès qu'on le personnalise ; Franck, Jade et le cocher n'ont pas de profil sur la planche (vue de face utilisée). ; v0.1.37 : maisons de la zone résidentielle refaites en western (bardage à clin, véranda sur poteaux, volets, fer à cheval, rocking-chair, tonneau, lanterne ; fausse façade pour Remy et la clinique ; Ed sur 2 étages). ; v0.1.38 : planches de marche fournies par l'utilisateur (docs/sprites/) utilisées pour Myst, Manu, Igor, Ed, Suzie (6 images), Jade, Harry, esprit (3), Remy, cocher (2) ; le héros, Luna, Franck et Hailey restent tirés de la planche de référence. ; v0.1.39 : héros dessiné depuis la planche (heros pour homme, luna pour femme) recolorée selon la personnalisation (peau, cheveux, haut, bas) + chapeau posé dessus ; gilet, bandana, jambières, éperons, jupe, manteau et autres coiffures repassent au dessin par code. ; v0.1.86 : nouvelle disposition (place du panneau avec calendrier et étal, ferme principale imposée, 3 fermes à l'ouest avec tas de planches au double du prix), Luna et Manu d'après leurs nouvelles planches. ; v0.1.87 : carte de la région = image fournie (étiquettes comprises), Hailey et Harry d'après leurs nouvelles planches. ; v0.1.88 : train fourni, Remy et Myst, chemin de Myst, caméra qui suit jusqu'aux bords, cadre toujours affiché, simulateur (docs/SIMULATION.md). ; v0.1.89 : compétences minage / bûcheron au lieu des paliers d'outils, filons zinc / cobalt / nickel / argent, fête foraine à une entrée ouverte le jour 30, simulation du blé avec l'étal, carte réelle (docs/carte-reelle.png).
