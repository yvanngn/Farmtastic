-- =====================================================================
-- Moteur Ferme — schéma Supabase
-- À coller dans Supabase > SQL Editor > Run.
-- Pré-requis : Authentication > Sign In / Providers > activer "Anonymous sign-ins".
-- Le multijoueur temps réel (positions, présence) passe par Realtime
-- Broadcast/Presence : aucune table nécessaire, rien n'est écrit en base à 10 Hz.
-- =====================================================================

-- 1. Profils joueurs (1 par compte, anonyme ou non)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Fermier',
  appearance   jsonb not null default '{}'::jsonb,   -- peau, coiffure, couleurs…
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 2. Sauvegardes (état complet du joueur en JSON, plusieurs emplacements possibles)
create table if not exists public.saves (
  player_id uuid not null references public.profiles(id) on delete cascade,
  slot      smallint not null default 1,
  data      jsonb not null,
  version   int not null default 1,          -- version du format, pour les migrations
  saved_at  timestamptz not null default now(),
  primary key (player_id, slot)
);

-- 3. Mondes partagés (pour une future ferme / ville commune)
create table if not exists public.worlds (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  owner_id   uuid references public.profiles(id) on delete set null,
  seed       bigint not null default floor(random()*2147483647),
  settings   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.world_members (
  world_id  uuid references public.worlds(id) on delete cascade,
  player_id uuid references public.profiles(id) on delete cascade,
  role      text not null default 'member' check (role in ('owner','member')),
  joined_at timestamptz not null default now(),
  primary key (world_id, player_id)
);

-- Objets persistants d'un monde partagé (arbres coupés, cultures communes, bâtiments)
create table if not exists public.world_objects (
  world_id   uuid references public.worlds(id) on delete cascade,
  x          int not null,
  y          int not null,
  type       text not null,
  state      jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (world_id, x, y)
);
create index if not exists world_objects_world_idx on public.world_objects(world_id);

-- 4. Données de jeu (lecture seule côté client, éditées par vous dans le dashboard)
create table if not exists public.item_definitions (
  id       text primary key,
  name     text not null,
  category text not null default 'misc',   -- seed, crop, resource, tool, food, animal_product…
  price    int not null default 0,
  data     jsonb not null default '{}'::jsonb
);

create table if not exists public.recipes (
  id     text primary key,
  output text not null references public.item_definitions(id),
  qty    int not null default 1,
  inputs jsonb not null                    -- {"wood":2,"stone":1}
);

create table if not exists public.npcs (
  id   text primary key,
  name text not null,
  data jsonb not null default '{}'::jsonb  -- apparence, planning, dialogues, cadeaux aimés…
);

-- 5. Liens sociaux
create table if not exists public.npc_relationships (
  player_id  uuid references public.profiles(id) on delete cascade,
  npc_id     text references public.npcs(id) on delete cascade,
  points     int not null default 0,
  last_talk  date,
  last_gift  date,
  primary key (player_id, npc_id)
);

create table if not exists public.player_relationships (
  player_a   uuid references public.profiles(id) on delete cascade,
  player_b   uuid references public.profiles(id) on delete cascade,
  points     int not null default 0,
  status     text not null default 'friend',
  created_at timestamptz not null default now(),
  primary key (player_a, player_b),
  check (player_a < player_b)
);

-- =====================================================================
-- Sécurité (RLS) : chaque joueur ne modifie que ses propres données
-- =====================================================================
alter table public.profiles             enable row level security;
alter table public.saves                enable row level security;
alter table public.worlds               enable row level security;
alter table public.world_members        enable row level security;
alter table public.world_objects        enable row level security;
alter table public.item_definitions     enable row level security;
alter table public.recipes              enable row level security;
alter table public.npcs                 enable row level security;
alter table public.npc_relationships    enable row level security;
alter table public.player_relationships enable row level security;

create policy "profils lisibles par tous"   on public.profiles for select using (true);
create policy "profil: insert soi"          on public.profiles for insert with check (auth.uid() = id);
create policy "profil: update soi"          on public.profiles for update using (auth.uid() = id);

create policy "saves: tout sur les siennes" on public.saves for all
  using (auth.uid() = player_id) with check (auth.uid() = player_id);

create policy "mondes lisibles"             on public.worlds for select using (true);
create policy "monde: créer"                on public.worlds for insert with check (auth.uid() = owner_id);
create policy "monde: modifier si owner"    on public.worlds for update using (auth.uid() = owner_id);

create policy "membres lisibles"            on public.world_members for select using (true);
create policy "rejoindre soi-même"          on public.world_members for insert with check (auth.uid() = player_id);
create policy "quitter soi-même"            on public.world_members for delete using (auth.uid() = player_id);

create policy "objets: lecture membres" on public.world_objects for select using (
  exists (select 1 from public.world_members m where m.world_id = world_objects.world_id and m.player_id = auth.uid()));
create policy "objets: écriture membres" on public.world_objects for all using (
  exists (select 1 from public.world_members m where m.world_id = world_objects.world_id and m.player_id = auth.uid()))
  with check (exists (select 1 from public.world_members m where m.world_id = world_objects.world_id and m.player_id = auth.uid()));

create policy "items lisibles"   on public.item_definitions for select using (true);
create policy "recettes lisibles" on public.recipes for select using (true);
create policy "pnj lisibles"     on public.npcs for select using (true);

create policy "liens pnj: les siens" on public.npc_relationships for all
  using (auth.uid() = player_id) with check (auth.uid() = player_id);

create policy "liens joueurs: concernés" on public.player_relationships for all
  using (auth.uid() in (player_a, player_b)) with check (auth.uid() in (player_a, player_b));

-- Realtime sur les objets du monde partagé (pour plus tard)
alter publication supabase_realtime add table public.world_objects;

-- =====================================================================
-- Marché entre joueurs
-- Les objets mis en vente quittent le sac du vendeur (séquestre côté jeu).
-- Achat, retrait et encaissement passent par des fonctions atomiques.
-- =====================================================================
create table if not exists public.market_listings (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references public.profiles(id) on delete cascade,
  seller_name text not null,
  item        text not null,
  qty         int  not null check (qty > 0 and qty <= 999),
  price       int  not null check (price > 0),
  status      text not null default 'open' check (status in ('open','sold','cancelled')),
  buyer_id    uuid references public.profiles(id) on delete set null,
  claimed     boolean not null default false,
  created_at  timestamptz not null default now(),
  sold_at     timestamptz
);
create index if not exists market_open_idx on public.market_listings(status, created_at desc);
alter table public.market_listings enable row level security;

create policy "annonces lisibles" on public.market_listings for select to authenticated using (true);
create policy "mettre en vente"   on public.market_listings for insert to authenticated
  with check (auth.uid() = seller_id and status = 'open' and buyer_id is null and claimed = false);
-- Pas de politique update/delete : tout passe par les fonctions ci-dessous.

create or replace function public.buy_listing(p_id uuid) returns public.market_listings
language plpgsql security definer set search_path = public as $$
declare r public.market_listings;
begin
  update market_listings set status = 'sold', buyer_id = auth.uid(), sold_at = now()
   where id = p_id and status = 'open' and seller_id <> auth.uid()
  returning * into r;
  if r.id is null then raise exception 'Annonce indisponible'; end if;
  return r;
end $$;

create or replace function public.cancel_listing(p_id uuid) returns public.market_listings
language plpgsql security definer set search_path = public as $$
declare r public.market_listings;
begin
  update market_listings set status = 'cancelled'
   where id = p_id and status = 'open' and seller_id = auth.uid()
  returning * into r;
  if r.id is null then raise exception 'Annulation impossible'; end if;
  return r;
end $$;

create or replace function public.claim_sales() returns int
language plpgsql security definer set search_path = public as $$
declare total int;
begin
  with s as (
    update market_listings set claimed = true
     where seller_id = auth.uid() and status = 'sold' and not claimed
    returning qty * price as v)
  select coalesce(sum(v), 0) into total from s;
  return total;
end $$;

revoke all on function public.buy_listing(uuid), public.cancel_listing(uuid), public.claim_sales() from public, anon;
grant execute on function public.buy_listing(uuid), public.cancel_listing(uuid), public.claim_sales() to authenticated;
