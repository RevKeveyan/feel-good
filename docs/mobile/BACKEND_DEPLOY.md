# Backend Deploy — Pre-Publish

Project: `tblafyztaidgwbrabajw`  
URL: `https://tblafyztaidgwbrabajw.supabase.co`

## 1. Apply migration `device_tokens`

### Option A — SQL Editor (fastest)

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/tblafyztaidgwbrabajw/sql)
2. Paste contents of `supabase/migrations/20260720120000_device_tokens.sql`
3. Run

### Option B — CLI

```bash
npx supabase login
npx supabase link --project-ref tblafyztaidgwbrabajw
npx supabase db push
```

Or run the helper:

```powershell
cd "d:\feel good"
.\scripts\deploy-backend.ps1
```

## 2. Deploy Edge Functions

Requires `SUPABASE_ACCESS_TOKEN` (Account → Access Tokens) and project linked.

```bash
npx supabase functions deploy submit-testimonial --project-ref tblafyztaidgwbrabajw
npx supabase functions deploy register-device --project-ref tblafyztaidgwbrabajw
npx supabase functions deploy delete-account --project-ref tblafyztaidgwbrabajw
```

Secrets are auto-injected (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) for Edge Functions.

## 3. Auth redirects (Dashboard)

Authentication → URL Configuration → **Redirect URLs** add:

- `feelgood://auth/callback`
- `exp://127.0.0.1:8082/--/auth/callback`
- `https://tblafyztaidgwbrabajw.supabase.co/auth/v1/callback`

Site URL can remain the web origin.

## 4. Enable providers

### Google
1. Google Cloud Console → OAuth 2.0 Client (Web + iOS + Android)
2. Supabase → Authentication → Providers → Google → enable
3. Paste Client ID + Secret

### Apple (required if Google is on iOS)
1. Apple Developer → Identifiers → App ID → Sign In with Apple
2. Supabase → Providers → Apple → enable
3. Services ID, Team ID, Key ID, private key `.p8`

## 5. Storage RLS smoke test

After login in the app, upload:
- Vision board image → bucket `vision-board`
- Weekly photo → bucket `weekly-photos`

If upload fails with RLS, confirm policies from migrations `20260712070942_*` and `20260712072823_*` are applied.

## 6. Verify functions

```bash
# After auth, from app or curl with user JWT:
curl -X POST "https://tblafyztaidgwbrabajw.supabase.co/functions/v1/submit-testimonial" \
  -H "Authorization: Bearer USER_JWT" \
  -H "apikey: PUBLISHABLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"rating\":5,\"story\":\"I finished my 55 days and feel stronger.\",\"permissionToPublish\":true}"
```
