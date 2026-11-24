# Seed first admin

Primary admin account: `management@networkco.net`

After that user exists in `auth.users`, run in Supabase SQL:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users u
WHERE lower(u.email) = lower('management@networkco.net')
ON CONFLICT (user_id, role) DO NOTHING;
```

`scripts/reset-users-and-seed.mjs` also assigns this role when reseeding.

Never grant admin from the mobile UI.
