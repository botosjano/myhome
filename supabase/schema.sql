-- ============================================================================
--  My Home Budapest — Supabase séma
--  Másold be ezt az egészet a Supabase → SQL Editor ablakba, és futtasd le
--  egyszer (RUN). Létrehozza a táblákat, a megszorításokat és a biztonsági
--  szabályokat (RLS). Újrafuttatható: minden "if not exists" / "drop ... if".
-- ============================================================================

-- A properties.id-hoz UUID generátor kell:
create extension if not exists "pgcrypto";

-- ── properties ──────────────────────────────────────────────────────────────
create table if not exists public.properties (
  id               uuid primary key default gen_random_uuid(),
  title_hu         text        not null default '',
  title_en         text        not null default '',
  description_hu   text        not null default '',
  description_en   text        not null default '',
  price            bigint      not null default 0,
  currency         text        not null default 'HUF' check (currency in ('HUF','EUR')),
  size_m2          integer     not null default 0,
  rooms            numeric     not null default 0,
  floor            integer,
  listing_type     text        not null default 'elado' check (listing_type in ('elado','kiado')),
  region           text        not null default 'budapest' check (region in ('budapest','videk')),
  district         text        not null default '',
  city             text,
  type             text        not null default 'lakás'
                     check (type in ('lakás','ház','villa','penthouse','telek',
                                     'nyaraló','iroda','üzlethelyiség','fejlesztési terület')),
  status           text        not null default 'active' check (status in ('active','hidden','sold')),
  featured         boolean     not null default false,
  images           text[]      not null default '{}',
  video_url        text,
  lat              double precision,
  lng              double precision,
  reference_number text        not null unique,
  year_built       integer,
  parking          boolean     not null default false,
  garden           boolean     not null default false,
  lift             boolean     not null default false,
  balcony          boolean     not null default false,
  ac               boolean     not null default false,
  heating          text        not null default 'gaz'
                     check (heating in ('gaz','tavfutes','hoszivatyu','elektromos','kandallo','egyeb')),
  energy_rating    text        not null default 'A' check (energy_rating in ('AA','A+','A','B','C','D','E')),
  condition        text        not null default 'új' check (condition in ('új','felújított','felújítandó')),
  created_at       timestamptz not null default now()
);

create index if not exists properties_status_idx   on public.properties (status);
create index if not exists properties_featured_idx on public.properties (featured);
create index if not exists properties_created_idx  on public.properties (created_at desc);

-- ── inquiries ───────────────────────────────────────────────────────────────
create table if not exists public.inquiries (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text        not null default '',
  email        text        not null default '',
  phone        text        not null default '',
  property_id  uuid references public.properties (id) on delete set null,
  property_ref text,
  message      text        not null default '',
  read         boolean     not null default false
);

create index if not exists inquiries_created_idx on public.inquiries (created_at desc);

-- ── Row Level Security (RLS) ────────────────────────────────────────────────
-- A nyilvános oldal a publikus "anon" kulcsot használja. Ezzel a kulccsal CSAK:
--   • aktív ingatlanokat lehet OLVASNI,
--   • érdeklődést lehet BEKÜLDENI.
-- Minden admin művelet (összes ingatlan, szerkesztés, érdeklődők olvasása,
-- törlés) a szerveroldali "service_role" kulccsal megy, ami megkerüli az RLS-t,
-- és soha nem kerül a böngészőbe. Így az érdeklődők adatai privátak maradnak.

alter table public.properties enable row level security;
alter table public.inquiries  enable row level security;

drop policy if exists "public read active properties" on public.properties;
create policy "public read active properties"
  on public.properties for select
  using (status = 'active');

drop policy if exists "public submit inquiry" on public.inquiries;
create policy "public submit inquiry"
  on public.inquiries for insert
  with check (true);

-- (Szándékosan NINCS publikus SELECT az inquiries táblán: az érdeklődéseket
--  csak az admin éri el a service_role kulccsal.)
