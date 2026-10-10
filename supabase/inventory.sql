-- Annual inventory: items, barcodes, campaigns, team counts
-- Run in the Supabase SQL Editor after roles.sql

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('dev', 'directeur', 'chef_unite', 'inventaire'));

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  cemetery_id text references public.cemeteries(id) on delete set null,
  condition text not null default 'bon'
    check (condition in ('bon', 'pas_bon', 'use')),
  barcode text not null unique,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_campaigns (
  id uuid primary key default gen_random_uuid(),
  year int not null unique,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_teams (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.inventory_campaigns(id) on delete cascade,
  team smallint not null check (team in (1, 2, 3)),
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null default '',
  email text not null,
  temp_password text not null default '',
  unique (campaign_id, team)
);

create table if not exists public.inventory_counts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.inventory_campaigns(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  team smallint not null check (team in (1, 2, 3)),
  condition text not null check (condition in ('bon', 'pas_bon', 'use')),
  counted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (campaign_id, item_id, team)
);

create or replace function public.current_inventory_team()
returns int
language sql
stable
security definer
set search_path = public
as $$
  select t.team
  from public.inventory_teams t
  join public.inventory_campaigns c on c.id = t.campaign_id
  where t.user_id = auth.uid()
    and c.status = 'open'
  order by c.year desc
  limit 1;
$$;

grant execute on function public.current_inventory_team() to authenticated;

alter table public.inventory_items enable row level security;
alter table public.inventory_campaigns enable row level security;
alter table public.inventory_teams enable row level security;
alter table public.inventory_counts enable row level security;

drop policy if exists "Staff manage inventory items" on public.inventory_items;
create policy "Staff manage inventory items"
  on public.inventory_items for all
  using (public.is_staff_full())
  with check (public.is_staff_full());

drop policy if exists "Teams read inventory items" on public.inventory_items;
create policy "Teams read inventory items"
  on public.inventory_items for select
  using (public.current_role() = 'inventaire');

drop policy if exists "Team3 update item condition" on public.inventory_items;
create policy "Team3 update item condition"
  on public.inventory_items for update
  using (public.current_inventory_team() = 3)
  with check (public.current_inventory_team() = 3);

drop policy if exists "Staff manage campaigns" on public.inventory_campaigns;
create policy "Staff manage campaigns"
  on public.inventory_campaigns for all
  using (public.is_staff_full())
  with check (public.is_staff_full());

drop policy if exists "Teams read own campaign" on public.inventory_campaigns;
create policy "Teams read own campaign"
  on public.inventory_campaigns for select
  using (
    exists (
      select 1 from public.inventory_teams t
      where t.campaign_id = id and t.user_id = auth.uid()
    )
  );

drop policy if exists "Staff manage inventory teams" on public.inventory_teams;
create policy "Staff manage inventory teams"
  on public.inventory_teams for all
  using (public.is_staff_full())
  with check (public.is_staff_full());

drop policy if exists "Member read own team row" on public.inventory_teams;
create policy "Member read own team row"
  on public.inventory_teams for select
  using (user_id = auth.uid());

drop policy if exists "Staff manage counts" on public.inventory_counts;
create policy "Staff manage counts"
  on public.inventory_counts for all
  using (public.is_staff_full())
  with check (public.is_staff_full());

drop policy if exists "Teams read campaign counts" on public.inventory_counts;
create policy "Teams read campaign counts"
  on public.inventory_counts for select
  using (
    exists (
      select 1 from public.inventory_teams t
      where t.campaign_id = inventory_counts.campaign_id
        and t.user_id = auth.uid()
    )
  );

drop policy if exists "Teams write own counts" on public.inventory_counts;
create policy "Teams write own counts"
  on public.inventory_counts for insert
  with check (
    team = public.current_inventory_team()
    and counted_by = auth.uid()
  );

drop policy if exists "Teams update own counts" on public.inventory_counts;
create policy "Teams update own counts"
  on public.inventory_counts for update
  using (team = public.current_inventory_team())
  with check (
    team = public.current_inventory_team()
    and counted_by = auth.uid()
  );

grant select, insert, update, delete on public.inventory_items to authenticated;
grant select, insert, update, delete on public.inventory_campaigns to authenticated;
grant select, insert, update, delete on public.inventory_teams to authenticated;
grant select, insert, update, delete on public.inventory_counts to authenticated;
