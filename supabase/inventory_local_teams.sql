-- Team accounts stored on the campaign (name, email, password).
-- No Supabase Auth user is created.
-- Run in the Supabase SQL Editor after inventory.sql.

alter table public.inventory_teams
  add column if not exists full_name text not null default '';

create or replace function public.inventory_team_login(p_email text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'teamId', t.id,
    'team', t.team,
    'fullName', t.full_name,
    'email', t.email,
    'campaignId', c.id,
    'year', c.year
  )
  into result
  from public.inventory_teams t
  join public.inventory_campaigns c on c.id = t.campaign_id
  where lower(t.email) = lower(trim(p_email))
    and t.temp_password = p_password
    and c.status = 'open'
  order by c.year desc
  limit 1;

  return result;
end;
$$;

create or replace function public.inventory_item_by_barcode(
  p_email text,
  p_password text,
  p_barcode text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if public.inventory_team_login(p_email, p_password) is null then
    return null;
  end if;

  select jsonb_build_object(
    'id', i.id,
    'name', i.name,
    'category', i.category,
    'cemeteryId', i.cemetery_id,
    'condition', i.condition,
    'barcode', i.barcode
  )
  into result
  from public.inventory_items i
  where i.barcode = trim(p_barcode);

  return result;
end;
$$;

create or replace function public.inventory_item_counts(
  p_email text,
  p_password text,
  p_item_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  session jsonb;
begin
  session := public.inventory_team_login(p_email, p_password);
  if session is null then
    return null;
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object('team', c.team, 'condition', c.condition))
    from public.inventory_counts c
    where c.campaign_id = (session->>'campaignId')::uuid
      and c.item_id = p_item_id
  ), '[]'::jsonb);
end;
$$;

create or replace function public.inventory_submit_count(
  p_email text,
  p_password text,
  p_item_id uuid,
  p_condition text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  session jsonb;
  v_team int;
  v_campaign uuid;
begin
  if p_condition not in ('bon', 'pas_bon', 'use') then
    return 'État invalide';
  end if;

  session := public.inventory_team_login(p_email, p_password);
  if session is null then
    return 'Compte équipe invalide';
  end if;

  v_team := (session->>'team')::int;
  v_campaign := (session->>'campaignId')::uuid;

  insert into public.inventory_counts (campaign_id, item_id, team, condition)
  values (v_campaign, p_item_id, v_team, p_condition)
  on conflict (campaign_id, item_id, team)
  do update set condition = excluded.condition, created_at = now();

  if v_team = 3 then
    update public.inventory_items
    set condition = p_condition
    where id = p_item_id;
  end if;

  return null;
end;
$$;

create or replace function public.inventory_list_unites(p_email text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.inventory_team_login(p_email, p_password) is null then
    return null;
  end if;

  return coalesce((
    select jsonb_agg(
      jsonb_build_object('id', u.id, 'name', u.name, 'nameAr', u.name_ar)
      order by u.name
    )
    from public.unites u
  ), '[]'::jsonb);
end;
$$;

grant execute on function public.inventory_team_login(text, text) to anon, authenticated;
grant execute on function public.inventory_list_unites(text, text) to anon, authenticated;
grant execute on function public.inventory_item_by_barcode(text, text, text) to anon, authenticated;
grant execute on function public.inventory_item_counts(text, text, uuid) to anon, authenticated;
grant execute on function public.inventory_submit_count(text, text, uuid, text) to anon, authenticated;
