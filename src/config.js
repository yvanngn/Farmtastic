// Configuration globale du moteur. Seul fichier à modifier pour brancher Supabase.
export const CFG = {
  SUPABASE_URL: 'https://hhyudxnkuoxzrkfkjipn.supabase.co',
  SUPABASE_KEY: 'sb_publishable_buAHqM4Mu-XuRKMM8uJaNQ_PYZhJZ23',   // clé publique (faite pour être dans le jeu)
  TABLE: 'ferme_',           // préfixe des tables (le projet Supabase contient d'autres jeux)
  WORLD: 'monde-principal',  // nom du canal multijoueur
  T: 16,                     // taille d'une tuile (px)
  W: 48, H: 36,              // taille de la carte (tuiles)
  AUTOSAVE_MS: 30000,        // sauvegarde auto
  NET_MS: 100,               // 10 envois réseau / s max
  MS_PER_MIN: 1000,          // 1 min de jeu = 1 s réelle (une journée ≈ 20 min)
  DAY_START: 360,            // 6h00
  DAY_END: 1560,             // 2h00 : évanouissement
  SLEEP_FROM: 1080,
  BED_LIMIT: 1500,           // 1h00 : pas couché → infirmerie (frais 10 %)          // dormir possible dès 18h
  NIGHT_FROM: 1200,          // monstres dès 20h
  INV_SLOTS: 12,             // places du sac au départ
  INV_MAX: 36,               // places max après agrandissements
  BOARD_OPEN: false,         // panneau d'affichage vide au début (les demandes existent, gardées de côté)
  CAVE_OPEN: false,          // la Caverne sombre est fermée pour l'instant (pas d'épée non plus)
  HIT_MS: 650,               // délai entre deux coups de hache / pioche (ms) : un meilleur outil casse en moins de coups, donc plus vite
  ACCES_TEST: false,          // TEST : portail des Caverne sombre ouvert dès le début + épée posée devant (mettre false pour le jeu normal)
  VERSION: 1,
  LSKEY: 'ferme_save_v1'
};
