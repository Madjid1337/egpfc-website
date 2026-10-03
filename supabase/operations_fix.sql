-- Fix: cemetery save, QR storage, reports visibility
-- Run once in Supabase SQL Editor after operations.sql

-- Ensure every logged-in user can create/refresh their own profile row
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

-- Allow authenticated CMS writes again (RLS was blocking saves when role helpers failed)
drop policy if exists "Auth write cemeteries" on public.cemeteries;
create policy "Auth write cemeteries"
  on public.cemeteries for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Let any logged-in staff read reports (app still filters by unité for chefs)
drop policy if exists "Staff read reports" on public.reports;
create policy "Staff read reports"
  on public.reports for select
  using (auth.role() = 'authenticated');

-- Public insert (re-assert)
drop policy if exists "Public insert reports" on public.reports;
create policy "Public insert reports"
  on public.reports for insert
  with check (true);

grant select, insert, update on public.reports to anon, authenticated;
grant select, insert, update, delete on public.cemeteries to authenticated;
grant select on public.cemeteries to anon;

-- Storage: auth upload/update/delete for site-images (QR + covers)
drop policy if exists "Auth upload site images" on storage.objects;
create policy "Auth upload site images"
  on storage.objects for insert
  with check (bucket_id = 'site-images' and auth.role() = 'authenticated');

drop policy if exists "Auth update site images" on storage.objects;
create policy "Auth update site images"
  on storage.objects for update
  using (bucket_id = 'site-images' and auth.role() = 'authenticated')
  with check (bucket_id = 'site-images' and auth.role() = 'authenticated');

drop policy if exists "Auth delete site images" on storage.objects;
create policy "Auth delete site images"
  on storage.objects for delete
  using (bucket_id = 'site-images' and auth.role() = 'authenticated');

-- Public report photo uploads
drop policy if exists "Public upload report images" on storage.objects;
create policy "Public upload report images"
  on storage.objects for insert
  with check (
    bucket_id = 'site-images'
    and (storage.foldername(name))[1] = 'reports'
  );

-- Verify your role is directeur
select id, email, role, unite_id from public.profiles;
