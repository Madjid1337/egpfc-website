# Supabase setup

Project: https://supabase.com/dashboard/project/lpiwuxmkarpozalxcjux

## 1. Create tables

Open [SQL Editor](https://supabase.com/dashboard/project/lpiwuxmkarpozalxcjux/sql/new) and run:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

## 2. Env (already in `.env.local`)

```
VITE_SUPABASE_URL=https://lpiwuxmkarpozalxcjux.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Restart `npm run dev` after changing env.

## 3. What the app does

- Reads cemeteries from Supabase when the table has rows
- Falls back to local `src/data/cemeteries.ts` if the table is empty or missing
- Auth users can write (for a future admin dashboard)
