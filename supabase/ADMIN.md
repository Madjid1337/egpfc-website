# Admin dashboard

Open: http://localhost:5173/admin/login

## Create users

1. Supabase → Authentication → Users → Add user (email + password)
2. User signs in once (profile auto-created as `chef_unite` by default)
3. A **Dev** or **Directeur** assigns the real role in `/admin/utilisateurs`

## SQL to run (once, in order)

1. `supabase/schema.sql`
2. `supabase/seed.sql`
3. `supabase/content.sql`
4. `supabase/operations.sql`
5. `supabase/operations_fix.sql` (if you already hit save/report bugs)
6. **`supabase/roles.sql`** — adds `dev` role + enforces Dev/Directeur vs Chef isolation

## Promote Dev / Directeur

```sql
update public.profiles set role = 'dev', unite_id = null
where email = 'dev@example.com';

update public.profiles set role = 'directeur', unite_id = null
where email = 'directeur@example.com';
```

## Roles

| Role | Access |
|---|---|
| `dev` | Everything + can assign any role including Dev |
| `directeur` | Everything + can create/assign Chef (not Dev) |
| `chef_unite` | Only cemeteries + signalements of their unité |

Only **Dev** and **Directeur** can assign Chef accounts (via Unités / Utilisateurs).

### Unités — create Chef with email + password

In `/admin/unites` → **Créer l’unité** you enter unité FR/AR + Chef email/password.
That uses Supabase Auth signUp (admin session stays logged in).

In Supabase → Authentication → Providers → Email:
- **Enable sign ups** = ON
- **Confirm email** = OFF (recommended for admin-created Chefs)

## Admin sections

| Page | Who |
|---|---|
| `/admin/utilisateurs` | Dev / Directeur — assign roles |
| `/admin/unites` | Dev / Directeur |
| `/admin/cimetieres` | All (Chef sees own unité only) |
| `/admin/signalements` | All (RLS filters Chef) |
| `/admin/actualites` etc. | Dev / Directeur |

## Public reports

Visitors open `/cimetieres/:id` → **Signaler un problème**.
