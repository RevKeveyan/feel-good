# Backend Deploy — Pre-Publish

Project: `bruvmdcstlkszvjruska`  
URL: `https://bruvmdcstlkszvjruska.supabase.co`  
Dashboard: https://supabase.com/dashboard/project/bruvmdcstlkszvjruska

Full switch guide: [`NEW_SUPABASE_SETUP.md`](NEW_SUPABASE_SETUP.md).

## 1. Apply migration `device_tokens`

### Option A — SQL Editor (fastest)

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/bruvmdcstlkszvjruska/sql)
2. Paste contents of `supabase/migrations/20260720120000_device_tokens.sql`
3. Run

### Option B — CLI

```bash
npx supabase login
npx supabase link --project-ref bruvmdcstlkszvjruska
npx supabase db push
```

Or:

```powershell
cd "d:\feel good"
.\scripts\deploy-backend.ps1
```

## 2. Deploy Edge Functions

Requires `supabase login` (or `$env:SUPABASE_ACCESS_TOKEN`).

```bash
npx supabase functions deploy submit-testimonial --project-ref bruvmdcstlkszvjruska
npx supabase functions deploy register-device --project-ref bruvmdcstlkszvjruska
npx supabase functions deploy delete-account --project-ref bruvmdcstlkszvjruska
```

## 3. Auth redirects (Dashboard)

Authentication → URL Configuration → Redirect URLs:

- `feelgood://auth/callback`
- `feelgood://auth/reset`
- `exp://127.0.0.1:8083/--/auth/callback`
- `exp://127.0.0.1:8083/--/auth/reset`
- `exp://127.0.0.1:8082/--/auth/callback`
- `exp://127.0.0.1:8082/--/auth/reset`
- `https://bruvmdcstlkszvjruska.supabase.co/auth/v1/callback`

See [`AUTH_NOTIFY_GUIDE.md`](AUTH_NOTIFY_GUIDE.md) and [`NEW_SUPABASE_SETUP.md`](NEW_SUPABASE_SETUP.md).

## 4. Enable providers

### Google

1. Google Cloud Console → OAuth 2.0 Client ID (**Web application**)
2. Authorized redirect URI: `https://bruvmdcstlkszvjruska.supabase.co/auth/v1/callback`
3. Supabase → Authentication → Providers → Google → enable + Client ID/Secret

### Apple (iOS)

See [`AUTH_SETUP.md`](AUTH_SETUP.md).

## 5. Storage RLS smoke test

After login: vision-board + weekly-photos uploads.

## 6. Verify functions

```bash
curl -X POST "https://bruvmdcstlkszvjruska.supabase.co/functions/v1/submit-testimonial" \
  -H "Authorization: Bearer USER_JWT" \
  -H "apikey: PUBLISHABLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"rating\":5,\"story\":\"I finished my 55 days and feel stronger.\",\"permissionToPublish\":true}"
```
