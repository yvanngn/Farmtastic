-- =====================================================================
-- Farm'tastic — tables Supabase, toutes préfixées « ferme_ » (le projet contient d'autres jeux).
-- À coller dans Supabase > SQL Editor > Run (une seule fois ; relançable sans danger).
-- Pré-requis : Authentication > Sign In / Providers > activer « Anonymous sign-ins ».
-- Les positions des joueurs passent par Realtime (Broadcast/Presence) : rien n'est écrit en base en continu.
-- =====================================================================

-- 1. Joueurs (un par compte, anonyme)
create table if not exists public.ferme_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Fermier',
  appearance   jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);

-- 2. Parties : solo (un seul joueur) ou multijoueur (jusqu'à 4, rejointe avec un code)
create table if not exists public.ferme_games (
  id         uuid primary key default gen_random_uuid(),
  code       text unique,                       -- ex. FERME-7K2Q (multijoueur seulement)
  mode       text not null check (mode in ('solo','multi')),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  max_players smallint not null default 4,
  created_at timestamptz not null default now()
);

-- 3. Qui joue dans quelle partie, et sur quel emplacement de ferme (0 Nord, 1 Est, 2 Sud, 3 Ouest)
create table if not exists public.ferme_players (
  game_id   uuid not null references public.ferme_games(id) on delete cascade,
  player_id uuid not null references auth.users(id) on delete cascade,
  farm_lot  smallint not null check (farm_lot between 0 and 3),
  name      text not null default 'Fermier',
  joined_at timestamptz not null default now(),
  primary key (game_id, player_id),
  unique (game_id, farm_lot)
);

-- 4. Sauvegardes : une par joueur et par partie
create table if not exists public.ferme_saves (
  game_id   uuid not null references public.ferme_games(id) on delete cascade,
  player_id uuid not null references auth.users(id) on delete cascade,
  data      jsonb not null,
  version   int not null default 1,
  saved_at  timestamptz not null default now(),
  primary key (game_id, player_id)
);

-- 5. Marché entre joueurs
create table if not exists public.ferme_market_listings (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references auth.users(id) on delete cascade,
  seller_name text not null,
  item        text not null,
  qty         int  not null check (qty > 0 and qty <= 999),
  price       int  not null check (price > 0),
  status      text not null default 'open' check (status in ('open','sold','cancelled')),
  buyer_id    uuid references auth.users(id) on delete set null,
  claimed     boolean not null default false,
  created_at  timestamptz not null default now(),
  sold_at     timestamptz
);
create index if not exists ferme_market_open_idx on public.ferme_market_listings(status, created_at desc);

-- =====================================================================
-- Sécurité : chacun ne touche qu'à ses données ; créer / rejoindre passe par des fonctions
-- =====================================================================
alter table public.ferme_profiles        enable row level security;
alter table public.ferme_games           enable row level security;
alter table public.ferme_players         enable row level security;
alter table public.ferme_saves           enable row level security;
alter table public.ferme_market_listings enable row level security;

drop policy if exists "ferme profils lisibles" on public.ferme_profiles;
drop policy if exists "ferme profil soi"       on public.ferme_profiles;
create policy "ferme profils lisibles" on public.ferme_profiles for select to authenticated using (true);
create policy "ferme profil soi"       on public.ferme_profiles for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "ferme parties de mes parties" on public.ferme_games;
create policy "ferme parties de mes parties" on public.ferme_games for select to authenticated using (
  exists (select 1 from public.ferme_players p where p.game_id = ferme_games.id and p.player_id = auth.uid()));

drop policy if exists "ferme joueurs de mes parties" on public.ferme_players;
create policy "ferme joueurs de mes parties" on public.ferme_players for select to authenticated using (
  exists (select 1 from public.ferme_players p where p.game_id = ferme_players.game_id and p.player_id = auth.uid()));

drop policy if exists "ferme mes sauvegardes" on public.ferme_saves;
create policy "ferme mes sauvegardes" on public.ferme_saves for all to authenticated
  using (auth.uid() = player_id)
  with check (auth.uid() = player_id and exists (select 1 from public.ferme_players p where p.game_id = ferme_saves.game_id and p.player_id = auth.uid()));

drop policy if exists "ferme annonces lisibles" on public.ferme_market_listings;
drop policy if exists "ferme mettre en vente"   on public.ferme_market_listings;
create policy "ferme annonces lisibles" on public.ferme_market_listings for select to authenticated using (true);
create policy "ferme mettre en vente"   on public.ferme_market_listings for insert to authenticated
  with check (auth.uid() = seller_id and status = 'open' and buyer_id is null and claimed = false);

-- La politique « joueurs de mes parties » se lit elle-même : on évite la récursion avec une fonction.
create or replace function public.ferme_is_member(p_game uuid) returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from ferme_players where game_id = p_game and player_id = auth.uid());
$$;
drop policy if exists "ferme joueurs de mes parties" on public.ferme_players;
create policy "ferme joueurs de mes parties" on public.ferme_players for select to authenticated using (public.ferme_is_member(game_id));
drop policy if exists "ferme parties de mes parties" on public.ferme_games;
create policy "ferme parties de mes parties" on public.ferme_games for select to authenticated using (public.ferme_is_member(id));

-- Créer une partie (solo ou multi) : le créateur prend l'emplacement 0 (Nord).
create or replace function public.ferme_create_game(p_mode text, p_name text)
returns table (game_id uuid, code text, mode text, farm_lot smallint)
language plpgsql security definer set search_path = public as $$
declare gid uuid; c text; tries int := 0;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  if p_mode not in ('solo','multi') then raise exception 'Mode inconnu'; end if;
  loop
    c := case when p_mode = 'multi' then 'FERME-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4)) else null end;
    begin
      insert into ferme_games (code, mode, owner_id, max_players) values (c, p_mode, auth.uid(), case when p_mode = 'solo' then 1 else 4 end)
      returning id into gid;
      exit;
    exception when unique_violation then tries := tries + 1; if tries > 5 then raise; end if;
    end;
  end loop;
  insert into ferme_players (game_id, player_id, farm_lot, name) values (gid, auth.uid(), 0, coalesce(nullif(p_name, ''), 'Fermier'));
  return query select gid, c, p_mode, 0::smallint;
end $$;

-- Rejoindre une partie multijoueur avec son code : on reçoit le premier emplacement libre.
create or replace function public.ferme_join_game(p_code text, p_name text)
returns table (game_id uuid, code text, mode text, farm_lot smallint)
language plpgsql security definer set search_path = public as $$
declare g ferme_games; lot smallint;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  select * into g from ferme_games where ferme_games.code = upper(trim(p_code)) and ferme_games.mode = 'multi';
  if g.id is null then raise exception 'Partie introuvable'; end if;
  select p.farm_lot into lot from ferme_players p where p.game_id = g.id and p.player_id = auth.uid();
  if lot is null then
    select min(s) into lot from generate_series(0, g.max_players - 1) s
     where s not in (select p.farm_lot from ferme_players p where p.game_id = g.id);
    if lot is null then raise exception 'Partie complète'; end if;
    insert into ferme_players (game_id, player_id, farm_lot, name) values (g.id, auth.uid(), lot, coalesce(nullif(p_name, ''), 'Fermier'));
  end if;
  return query select g.id, g.code, g.mode, lot;
end $$;

-- Mes parties (pour « Continuer ») avec la date de ma dernière sauvegarde.
create or replace function public.ferme_my_games()
returns table (game_id uuid, code text, mode text, farm_lot smallint, players int, saved_at timestamptz)
language sql security definer set search_path = public stable as $$
  select g.id, g.code, g.mode, p.farm_lot,
         (select count(*)::int from ferme_players q where q.game_id = g.id),
         (select s.saved_at from ferme_saves s where s.game_id = g.id and s.player_id = auth.uid())
    from ferme_players p join ferme_games g on g.id = p.game_id
   where p.player_id = auth.uid()
   order by 6 desc nulls last;
$$;

-- Marché : achat, retrait, encaissement atomiques.
create or replace function public.ferme_buy_listing(p_id uuid) returns public.ferme_market_listings
language plpgsql security definer set search_path = public as $$
declare r ferme_market_listings;
begin
  update ferme_market_listings set status = 'sold', buyer_id = auth.uid(), sold_at = now()
   where id = p_id and status = 'open' and seller_id <> auth.uid() returning * into r;
  if r.id is null then raise exception 'Annonce indisponible'; end if;
  return r;
end $$;
create or replace function public.ferme_cancel_listing(p_id uuid) returns public.ferme_market_listings
language plpgsql security definer set search_path = public as $$
declare r ferme_market_listings;
begin
  update ferme_market_listings set status = 'cancelled'
   where id = p_id and status = 'open' and seller_id = auth.uid() returning * into r;
  if r.id is null then raise exception 'Annulation impossible'; end if;
  return r;
end $$;
create or replace function public.ferme_claim_sales() returns int
language plpgsql security definer set search_path = public as $$
declare total int;
begin
  with s as (update ferme_market_listings set claimed = true
              where seller_id = auth.uid() and status = 'sold' and not claimed returning qty * price as v)
  select coalesce(sum(v), 0) into total from s;
  return total;
end $$;

revoke all on function public.ferme_create_game(text, text), public.ferme_join_game(text, text), public.ferme_my_games(),
  public.ferme_buy_listing(uuid), public.ferme_cancel_listing(uuid), public.ferme_claim_sales(), public.ferme_is_member(uuid) from public, anon;
grant execute on function public.ferme_create_game(text, text), public.ferme_join_game(text, text), public.ferme_my_games(),
  public.ferme_buy_listing(uuid), public.ferme_cancel_listing(uuid), public.ferme_claim_sales(), public.ferme_is_member(uuid) to authenticated;
