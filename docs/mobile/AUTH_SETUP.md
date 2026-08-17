# Mobile Auth Setup (Supabase + Expo)

See also: [BACKEND_DEPLOY.md](./BACKEND_DEPLOY.md), [NEW_SUPABASE_SETUP.md](./NEW_SUPABASE_SETUP.md).

Project: `bruvmdcstlkszvjruska`  
URL: `https://bruvmdcstlkszvjruska.supabase.co`

## Redirect URLs

Supabase Dashboard -> Authentication -> **URL Configuration**:

- **Site URL:** `feelgood://auth/callback` (never `*.supabase.co` or `http://localhost:3000`)
- **Redirect URLs:**

- `feelgood://auth/callback`
- `feelgood://auth/reset`
- `https://bruvmdcstlkszvjruska.supabase.co/auth/v1/callback`
- `exp://127.0.0.1:8083/--/auth/callback`
- `exp://127.0.0.1:8083/--/auth/reset`
- `exp://127.0.0.1:8082/--/auth/callback`
- `exp://127.0.0.1:8082/--/auth/reset`
- `exp://192.168.27.8:8082/--/auth/callback`
- `exp://192.168.27.8:8082/--/auth/reset`
- `exp://192.168.27.8:8083/--/auth/callback`
- `exp://192.168.27.8:8083/--/auth/reset`

`127.0.0.1` ≠ phone LAN IP. If Metro logs a different `[auth] oauthRedirectTo`, add that exact string too.

App OAuth/reset redirects use stable `feelgood://auth/callback` and `feelgood://auth/reset` (not `exp://` — Expo Go's `Linking.createURL` always forces `exp://`, which breaks when that LAN/port URL is not allowlisted).

Branded Confirm / Reset emails: [`email-templates/README.md`](email-templates/README.md).

## Branding (remove “Supabase” from user-facing auth)

App code cannot change Gmail’s **From** name or the Google consent title. Configure these outside the repo.

### Auth emails (From: Feel Good Challenge, not Supabase Auth)

Default Supabase mailer always sends as **Supabase Auth**. On **free tier without Custom SMTP**, Supabase also **blocks** changing Reset/Confirm HTML — so users keep getting the default **link** email, not the OTP template in the repo.

Русский порядок: [`SMTP_AND_EMAIL_RU.md`](SMTP_AND_EMAIL_RU.md).

1. Use SMTP for your domain (Resend, SendGrid, SES, etc.) with e.g. `noreply@thefeelgoodsociety.com.au`.
2. Dashboard → [Authentication → SMTP](https://supabase.com/dashboard/project/bruvmdcstlkszvjruska/auth/smtp) (Emails → **SMTP Settings**):
   - Enable **Custom SMTP**
   - **Sender name:** `Feel Good Challenge`
   - **Sender email:** your domain address
   - Host / port / user / password from the provider
3. Save → then apply templates: `.\scripts\apply-auth-email-templates.ps1` (or paste from [`email-templates/`](email-templates/README.md)).

Without custom SMTP: sender stays **Supabase Auth**, and branded OTP templates **cannot** be applied.

### Google sign-in (“Feel Good Challenge wants to access…”, not Supabase)

1. [Google Cloud Console](https://console.cloud.google.com/) → the OAuth project for this app
2. **APIs & Services → OAuth consent screen**
3. **App name:** `Feel Good Challenge` (or The Feel Good Society)
4. Optional: logo, support email, authorized domains
5. Save → new Google sign-in shows your app name

Keep Web client redirect URI: `https://bruvmdcstlkszvjruska.supabase.co/auth/v1/callback`.

## Providers

### Email

Works via `signInWithPassword` / `signUp` / `resetPasswordForEmail` / `verifyOtp` / `updateUser` in `apps/mobile/lib/auth.ts`.
Forgot → email one-time code → `/auth/reset` → new password.

### Google

1. Google Cloud Console → OAuth client (**Web application**) + consent screen branding (above)
2. Redirect URI: `https://bruvmdcstlkszvjruska.supabase.co/auth/v1/callback`
3. Supabase → Auth → Providers → Google → enable + Client ID/Secret
4. Mobile: `signInWithOAuth` + `WebBrowser.openAuthSessionAsync` → `setSession`

### Apple (required on iOS for App Store — email + Apple)

1. Apple Developer -> App ID `com.feelgoodsociety.challenge` -> Sign In with Apple
2. Create Services ID + Key (.p8)
3. Supabase -> Auth -> Providers -> Apple
4. Mobile: `expo-apple-authentication` -> `signInWithIdToken` (iOS only UI)

**Client IDs** (comma-separated in Supabase Apple provider):

```
com.feelgoodsociety.challenge,host.exp.Exponent
```

- `com.feelgoodsociety.challenge` — EAS / TestFlight / App Store
- `host.exp.Exponent` — **required for Expo Go** (otherwise: `Unacceptable audience in id_token: [host.exp.Exponent]`)

Final QA of Apple Sign In: prefer a preview/production iOS build (real bundle ID). Expo Go is only for quick smoke after adding `host.exp.Exponent`.

## Env

```
EXPO_PUBLIC_SUPABASE_URL=https://bruvmdcstlkszvjruska.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
EXPO_PUBLIC_MINDSET_AUDIO_BASE_URL=
```

Mindset tracks play when this base URL is set and files exist at `{base}/day-01.mp3` … `day-21.mp3`. Unlock is CDN presence, not challenge day. Web uses `VITE_MINDSET_AUDIO_BASE_URL` the same way. Without files, tracks stay locked.

## Deep link scheme

`apps/mobile/app.json` -> `"scheme": "feelgood"`
