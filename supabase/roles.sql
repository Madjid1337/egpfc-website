-- Roles: dev | directeur | chef_unite
-- Run in Supabase SQL Editor (after operations.sql / operations_fix.sql)

-- 1) Allow 'dev' on profiles.role
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('dev', 'directeur', 'chef_unite'));

-- 2) Helpers
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
    select 1 from public.profiles
    where id = auth.uid() and role = 'directeur'
  );
$$;

-- Full staff: Dev + Directeur (see/manage everything)
create or replace function public.is_staff_full()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('dev', 'directeur')
  );
$$;

create or replace function public.is_chef()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'chef_unite'
  );
$$;

grant execute on function public.is_staff_full() to anon, authenticated;
grant execute on function public.is_chef() to anon, authenticated;
grant execute on function public.is_directeur() to anon, authenticated;
grant execute on function public.current_role() to anon, authenticated;
grant execute on function public.current_unite_id() to anon, authenticated;

-- 3) Profiles RLS — full staff manage roles; users read own
alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_staff_full());

drop policy if exists "Directeur update profiles" on public.profiles;
drop policy if exists "Staff update profiles" on public.profiles;
create policy "Staff update profiles"
  on public.profiles for update
  using (public.is_staff_full())
  with check (public.is_staff_full());

drop policy if exists "Directeur insert profiles" on public.profiles;
drop policy if exists "Staff insert profiles" on public.profiles;
create policy "Staff insert profiles"
  on public.profiles for insert
  with check (public.is_staff_full());

-- 4) Unités — full staff only write; all auth can read
drop policy if exists "Auth read unites" on public.unites;
create policy "Auth read unites"
  on public.unites for select using (auth.role() = 'authenticated');

drop policy if exists "Directeur write unites" on public.unites;
drop policy if exists "Staff write unites" on public.unites;
create policy "Staff write unites"
  on public.unites for all
  using (public.is_staff_full())
  with check (public.is_staff_full());

-- 5) Cemeteries — public read; staff full write; chef write own unité only
-- Remove overly broad authenticated write from operations_fix
drop policy if exists "Auth write cemeteries" on public.cemeteries;
drop policy if exists "Directeur write cemeteries" on public.cemeteries;
drop policy if exists "Chef write own unite cemeteries" on public.cemeteries;

create policy "Staff write cemeteries"
  on public.cemeteries for all
  using (public.is_staff_full())
  with check (public.is_staff_full());

create policy "Chef write own unite cemeteries"
  on public.cemeteries for all
  using (
    public.is_chef()
    and unite_id is not null
    and unite_id = public.current_unite_id()
  )
  with check (
    public.is_chef()
    and unite_id = public.current_unite_id()
  );

drop policy if exists "Public read cemeteries" on public.cemeteries;
create policy "Public read cemeteries"
  on public.cemeteries for select using (true);

-- 6) Reports — public insert; staff full read/update; chef only their unité
drop policy if exists "Staff read reports" on public.reports;
drop policy if exists "Staff update reports" on public.reports;
drop policy if exists "Directeur read reports" on public.reports;
drop policy if exists "Chef read unite reports" on public.reports;
drop policy if exists "Directeur update reports" on public.reports;
drop policy if exists "Chef update unite reports" on public.reports;
drop policy if exists "Public insert reports" on public.reports;

create policy "Public insert reports"
  on public.reports for insert with check (true);

create policy "Staff read reports"
  on public.reports for select using (public.is_staff_full());

create policy "Chef read unite reports"
  on public.reports for select using (
    public.is_chef()
    and exists (
      select 1 from public.cemeteries c
      where c.id = cemetery_id and c.unite_id = public.current_unite_id()
    )
  );

create policy "Staff update reports"
  on public.reports for update
  using (public.is_staff_full())
  with check (public.is_staff_full());

create policy "Chef update unite reports"
  on public.reports for update
  using (
    public.is_chef()
    and exists (
      select 1 from public.cemeteries c
      where c.id = cemetery_id and c.unite_id = public.current_unite_id()
    )
  )
  with check (
    public.is_chef()
    and exists (
      select 1 from public.cemeteries c
      where c.id = cemetery_id and c.unite_id = public.current_unite_id()
    )
  );

-- 7) Alerts — staff can insert; recipients read
drop policy if exists "Users read own alerts" on public.alerts;
create policy "Users read own alerts"
  on public.alerts for select using (
    auth.uid() = to_user_id or public.is_staff_full()
  );

drop policy if exists "Directeur insert alerts" on public.alerts;
drop policy if exists "Staff insert alerts" on public.alerts;
create policy "Staff insert alerts"
  on public.alerts for insert with check (public.is_staff_full());

drop policy if exists "Recipient update alerts" on public.alerts;
create policy "Recipient update alerts"
  on public.alerts for update using (
    auth.uid() = to_user_id or public.is_staff_full()
  );

-- 8) ensure_my_profile: never escalate role on conflict
create or replace function public.ensure_my_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    auth.uid(),
    auth.jwt() ->> 'email',
    coalesce(auth.jwt() -> 'user_metadata' ->> 'full_name', ''),
    'chef_unite'
  )
  on conflict (id) do update
    set email = excluded.email
  returning * into row;

  if row.id is null then
    select * into row from public.profiles where id = auth.uid();
  end if;

  return row;
end;
$$;

grant execute on function public.ensure_my_profile() to authenticated;

-- Promote yourself (replace emails):
-- update public.profiles set role = 'dev' where email = 'you@example.com';
-- update public.profiles set role = 'directeur' where email = 'directeur@example.com';

select email, role, unite_id from public.profiles order by role, email;
