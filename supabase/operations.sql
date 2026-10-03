-- Operations platform: roles, unités, reports, alerts, cemetery QR
-- Run in Supabase SQL Editor AFTER using the new dashboards.

-- Profiles (roles)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  role text not null check (role in ('dev', 'directeur', 'chef_unite')) default 'chef_unite',
  unite_id uuid,
  created_at timestamptz not null default now()
);

-- Unités
create table if not exists public.unites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text not null default '',
  chef_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Link profiles.unite_id → unites (after unites exists)
do $$ begin
  alter table public.profiles
    add constraint profiles_unite_id_fkey
    foreign key (unite_id) references public.unites(id) on delete set null;
exception when duplicate_object then null;
end $$;

-- Extend cemeteries
alter table public.cemeteries add column if not exists unite_id uuid references public.unites(id) on delete set null;
alter table public.cemeteries add column if not exists qr_code_url text not null default '';

-- Reports (public incident submissions)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  cemetery_id text not null references public.cemeteries(id) on delete cascade,
  issue_type text not null,
  description text not null,
  image_url text not null default '',
  status text not null default 'PENDING'
    check (status in ('PENDING', 'IN_PROGRESS', 'RESOLVED')),
  resolution_note text not null default '',
  reporter_ip text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_cemetery_id_idx on public.reports(cemetery_id);
create index if not exists reports_status_idx on public.reports(status);

-- Alerts (Directeur → Chef)
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  from_user_id uuid references public.profiles(id) on delete set null,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup (default chef until Directeur promotes)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'chef_unite')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpers for RLS
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_unite_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select unite_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_directeur()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'directeur'
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.unites enable row level security;
alter table public.reports enable row level security;
alter table public.alerts enable row level security;

-- Profiles
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id or public.is_directeur());

drop policy if exists "Directeur update profiles" on public.profiles;
create policy "Directeur update profiles"
  on public.profiles for update using (public.is_directeur());

drop policy if exists "Directeur insert profiles" on public.profiles;
create policy "Directeur insert profiles"
  on public.profiles for insert with check (public.is_directeur());

-- Unités
drop policy if exists "Auth read unites" on public.unites;
create policy "Auth read unites"
  on public.unites for select using (auth.role() = 'authenticated');

drop policy if exists "Directeur write unites" on public.unites;
create policy "Directeur write unites"
  on public.unites for all
  using (public.is_directeur())
  with check (public.is_directeur());

-- Cemeteries: chefs only see/edit their unité; directeur all; public still reads all
drop policy if exists "Auth write cemeteries" on public.cemeteries;
create policy "Directeur write cemeteries"
  on public.cemeteries for all
  using (public.is_directeur())
  with check (public.is_directeur());

drop policy if exists "Chef write own unite cemeteries" on public.cemeteries;
create policy "Chef write own unite cemeteries"
  on public.cemeteries for all
  using (
    public.current_role() = 'chef_unite'
    and unite_id is not null
    and unite_id = public.current_unite_id()
  )
  with check (
    public.current_role() = 'chef_unite'
    and unite_id = public.current_unite_id()
  );

-- Keep public read
drop policy if exists "Public read cemeteries" on public.cemeteries;
create policy "Public read cemeteries"
  on public.cemeteries for select using (true);

-- Reports
drop policy if exists "Public insert reports" on public.reports;
create policy "Public insert reports"
  on public.reports for insert with check (true);

drop policy if exists "Directeur read reports" on public.reports;
create policy "Directeur read reports"
  on public.reports for select using (public.is_directeur());

drop policy if exists "Chef read unite reports" on public.reports;
create policy "Chef read unite reports"
  on public.reports for select using (
    public.current_role() = 'chef_unite'
    and exists (
      select 1 from public.cemeteries c
      where c.id = cemetery_id and c.unite_id = public.current_unite_id()
    )
  );

drop policy if exists "Directeur update reports" on public.reports;
create policy "Directeur update reports"
  on public.reports for update using (public.is_directeur());

drop policy if exists "Chef update unite reports" on public.reports;
create policy "Chef update unite reports"
  on public.reports for update using (
    public.current_role() = 'chef_unite'
    and exists (
      select 1 from public.cemeteries c
      where c.id = cemetery_id and c.unite_id = public.current_unite_id()
    )
  );

-- Alerts
drop policy if exists "Users read own alerts" on public.alerts;
create policy "Users read own alerts"
  on public.alerts for select using (
    auth.uid() = to_user_id or public.is_directeur()
  );

drop policy if exists "Directeur insert alerts" on public.alerts;
create policy "Directeur insert alerts"
  on public.alerts for insert with check (public.is_directeur());

drop policy if exists "Recipient update alerts" on public.alerts;
create policy "Recipient update alerts"
  on public.alerts for update using (auth.uid() = to_user_id or public.is_directeur());

-- Backfill profiles for existing Auth users
insert into public.profiles (id, email, full_name, role)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  'chef_unite'
from auth.users u
on conflict (id) do nothing;

-- Promote first admin to Directeur (run after creating Auth user — replace email)
-- update public.profiles set role = 'directeur', unite_id = null
-- where email = 'your-admin@email.com';

-- Public may upload report photos only under reports/
drop policy if exists "Public upload report images" on storage.objects;
create policy "Public upload report images"
  on storage.objects for insert
  with check (
    bucket_id = 'site-images'
    and (storage.foldername(name))[1] = 'reports'
  );
