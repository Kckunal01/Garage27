-- Garage 27 — initial schema.
-- Catalogue tables are publicly readable (active/preview rows only).
-- Customer tables (quotes, service requests, orders, payments) have RLS enabled
-- with NO anon policies: they are written only by server route handlers using
-- the service-role key, which never reaches the browser.

create extension if not exists pgcrypto;

-- ── Catalogue ─────────────────────────────────────────────────────────────
create type availability_status as enum ('active', 'preview-only', 'coming-soon', 'retired');

create table public.bikes (
  id text primary key,
  slug text not null unique,
  brand text not null,
  model text not null,
  name text not null,
  status availability_status not null default 'coming-soon',
  base_price integer not null check (base_price >= 0),          -- paise
  summary text not null default '',
  preview_image text,
  silhouette text not null default 'roadster',
  model3d jsonb,                                                 -- {kind, ref, approxKb}
  default_colour_id text,
  camera jsonb not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.bike_colours (
  id text primary key,
  bike_id text not null references public.bikes(id) on delete cascade,
  name text not null,
  swatch text not null,
  material jsonb not null,
  price_delta integer not null default 0,
  status availability_status not null default 'active',
  preview_image text,
  sort_order integer not null default 0
);

-- Component slots that physically exist on a bike (drives which categories show).
create table public.bike_slots (
  bike_id text not null references public.bikes(id) on delete cascade,
  id text not null,
  category text not null check (category in ('lighting','cockpit','body','seat','detail','luggage','rearWheel')),
  label text not null,
  default_option_id text not null,
  optional boolean not null default false,
  hotspot jsonb,                                                 -- [x,y,z]
  sort_order integer not null default 0,
  primary key (bike_id, id)
);

create table public.build_options (
  id text primary key,
  bike_id text not null references public.bikes(id) on delete cascade,
  slot_id text not null,
  category text not null,
  name text not null,
  descriptor text not null default '',
  price_delta integer not null default 0,
  status availability_status not null default 'active',
  model_asset jsonb not null,
  material_config jsonb,
  preview_asset text,
  requires text[] not null default '{}',
  excludes text[] not null default '{}',
  part_id text,
  sort_order integer not null default 0,
  foreign key (bike_id, slot_id) references public.bike_slots(bike_id, id) on delete cascade
);

create table public.part_categories (
  id text primary key,
  label text not null,
  descriptor text not null default '',
  sort_order integer not null default 0
);

create table public.parts (
  id text primary key,
  slug text not null unique,
  sku text not null unique,
  name text not null,
  brand text not null default 'Garage 27',
  category text not null references public.part_categories(id),
  summary text not null default '',
  description text not null default '',
  price integer not null check (price >= 0),                      -- paise
  currency text not null default 'INR',
  material text not null default '',
  finish text not null default '',
  installation_notes text not null default '',
  stock integer not null default 0 check (stock >= 0),
  status availability_status not null default 'active',
  images jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table public.bike_compatibility (
  part_id text not null references public.parts(id) on delete cascade,
  bike_id text not null references public.bikes(id) on delete cascade,
  primary key (part_id, bike_id)
);

create table public.showcase_builds (
  id text primary key,
  number integer not null unique,
  name text not null,
  bike_id text not null references public.bikes(id),
  style text not null,
  summary text not null default '',
  image text,
  silhouette text not null default 'roadster',
  tone text not null default 'amber',
  preset jsonb,
  published boolean not null default true
);

create table public.services (
  id text primary key,
  name text not null,
  kicker text not null default '',
  summary text not null default '',
  includes text[] not null default '{}',
  sort_order integer not null default 0,
  active boolean not null default true
);

-- ── Customer data (server-only writes) ───────────────────────────────────
create table public.build_configurations (
  id uuid primary key default gen_random_uuid(),
  bike_id text not null references public.bikes(id),
  configuration jsonb not null,
  share_code text unique,
  created_at timestamptz not null default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,                                 -- G27-Q-XXXXXX
  build_configuration_id uuid references public.build_configurations(id),
  configuration jsonb not null,                                   -- full snapshot
  price_snapshot jsonb not null,                                  -- estimate at time of request
  estimated_total integer not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  city text,
  notes text,
  attachments text[] not null default '{}',                       -- storage paths
  status text not null default 'requested'
    check (status in ('requested','reviewing','quoted','approved','paid','declined','cancelled')),
  created_at timestamptz not null default now()
);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,                                 -- G27-S-XXXXXX
  service_id text not null references public.services(id),
  bike text not null,
  requirement text not null,
  location text not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  notes text,
  attachments text[] not null default '{}',
  status text not null default 'new' check (status in ('new','contacted','scheduled','done','cancelled')),
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,                                 -- G27-O-XXXXXX
  status text not null default 'pending'
    check (status in ('pending','awaiting_payment','paid','failed','cancelled','refunded','fulfilled')),
  subtotal integer not null,
  shipping integer not null default 0,
  total integer not null,
  currency text not null default 'INR',
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  payment_provider text not null,
  provider_order_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  part_id text not null references public.parts(id),
  name text not null,                                             -- snapshot
  sku text not null,
  unit_price integer not null,
  quantity integer not null check (quantity between 1 and 10)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_payment_id text,
  provider_event_id text unique,                                  -- idempotency for webhooks
  status text not null check (status in ('created','captured','failed','refunded')),
  amount integer not null,
  raw jsonb,                                                      -- verified payload, no card data
  created_at timestamptz not null default now()
);

create index on public.orders (provider_order_id);
create index on public.payments (order_id);
create index on public.build_options (bike_id, slot_id);

-- ── Row level security ───────────────────────────────────────────────────
alter table public.bikes enable row level security;
alter table public.bike_colours enable row level security;
alter table public.bike_slots enable row level security;
alter table public.build_options enable row level security;
alter table public.part_categories enable row level security;
alter table public.parts enable row level security;
alter table public.bike_compatibility enable row level security;
alter table public.showcase_builds enable row level security;
alter table public.services enable row level security;
alter table public.build_configurations enable row level security;
alter table public.quotes enable row level security;
alter table public.service_requests enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

create policy "public read bikes" on public.bikes for select using (status <> 'retired');
create policy "public read colours" on public.bike_colours for select using (status <> 'retired');
create policy "public read slots" on public.bike_slots for select using (true);
create policy "public read options" on public.build_options for select using (status <> 'retired');
create policy "public read part categories" on public.part_categories for select using (true);
create policy "public read parts" on public.parts for select using (status <> 'retired');
create policy "public read compatibility" on public.bike_compatibility for select using (true);
create policy "public read showcase" on public.showcase_builds for select using (published);
create policy "public read services" on public.services for select using (active);
-- No anon/authenticated policies on customer tables: service role only.

-- ── Storage: private bucket for reference images ─────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('references', 'references', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
