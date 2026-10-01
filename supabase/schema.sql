-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lpiwuxmkarpozalxcjux/sql/new

create table if not exists public.cemeteries (
  id text primary key,
  name text not null,
  name_ar text not null,
  commune text not null,
  commune_ar text not null,
  wilaya text not null default 'Alger',
  address text not null,
  address_ar text not null,
  lat double precision not null,
  lng double precision not null,
  opening_hours text not null,
  opening_hours_ar text not null,
  hectares numeric not null default 0,
  type text not null check (type in ('islamique', 'chrétien', 'mixte')),
  type_ar text not null,
  description text not null default '',
  description_ar text not null default '',
  image_url text not null default '',
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  kind text not null check (kind in ('hero', 'gallery', 'cemetery', 'news')),
  title text default '',
  sort_order int not null default 0,
  cemetery_id text references public.cemeteries(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  date_label text not null,
  date_label_ar text not null,
  category text not null,
  category_ar text not null,
  title text not null,
  title_ar text not null,
  description text not null,
  description_ar text not null,
  image_url text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

alter table public.cemeteries enable row level security;
alter table public.media enable row level security;
alter table public.news enable row level security;

drop policy if exists "Public read cemeteries" on public.cemeteries;
create policy "Public read cemeteries"
  on public.cemeteries for select using (true);

drop policy if exists "Public read media" on public.media;
create policy "Public read media"
  on public.media for select using (true);

drop policy if exists "Public read published news" on public.news;
create policy "Public read published news"
  on public.news for select using (published = true);

drop policy if exists "Auth write cemeteries" on public.cemeteries;
create policy "Auth write cemeteries"
  on public.cemeteries for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Auth write media" on public.media;
create policy "Auth write media"
  on public.media for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Auth write news" on public.news;
create policy "Auth write news"
  on public.news for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Public read site images" on storage.objects;
create policy "Public read site images"
  on storage.objects for select
  using (bucket_id = 'site-images');

drop policy if exists "Auth upload site images" on storage.objects;
create policy "Auth upload site images"
  on storage.objects for insert
  with check (bucket_id = 'site-images' and auth.role() = 'authenticated');

drop policy if exists "Auth update site images" on storage.objects;
create policy "Auth update site images"
  on storage.objects for update
  using (bucket_id = 'site-images' and auth.role() = 'authenticated');

drop policy if exists "Auth delete site images" on storage.objects;
create policy "Auth delete site images"
  on storage.objects for delete
  using (bucket_id = 'site-images' and auth.role() = 'authenticated');
