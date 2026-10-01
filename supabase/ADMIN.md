# Admin dashboard

Open: http://localhost:5173/admin/login

## Create an admin user (required once)

1. Supabase → Authentication → Users → Add user
2. Create with email + password (enable Auto Confirm if available)
3. Sign in at /admin/login

Write access requires an authenticated session (RLS in schema.sql).

## Features

- Dashboard overview
- Cemeteries: list / create / edit / delete
- Click map to set coordinates (Satellite / Street)
- Photos: upload to site-images storage (hero, gallery, cemetery, news)
