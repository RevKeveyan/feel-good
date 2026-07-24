# New Supabase project + Google — full setup for testing

Active project (your org): **`bruvmdcstlkszvjruska`**  
URL: `https://bruvmdcstlkszvjruska.supabase.co`  
Dashboard: https://supabase.com/dashboard/project/bruvmdcstlkszvjruska

Former Lovable project `tblafyztaidgwbrabajw` is not used (no access). Fresh users/data on the new project.

## Status (agent — 2026-07-21)

| Item | Status |
|------|--------|
| Local `.env` (root + mobile) | Wired to `bruvmdcstlkszvjruska` |
| `supabase/config.toml` | `project_id = "bruvmdcstlkszvjruska"` |
| `scripts/deploy-backend.ps1` | Default ref updated |
| Migrations + Edge Functions | **You:** `npx supabase login` then `.\scripts\deploy-backend.ps1` |
| Google + Redirect URLs + emails | **You:** §3 below |

---

## 0. Create the project — DONE

Project `feel-good-challenge` exists. Keys live in local `.env` (gitignored).

In new Dashboard UI: **Settings → API Keys** (anon/publishable) and **Data API** (Project URL). Use base URL **without** `/rest/v1/`.

---

## 1. Wire the repo — DONE

Already applied for `bruvmdcstlkszvjruska`. To re-run:

```powershell
cd "d:\feel good"
.\scripts\apply-supabase-project.ps1 `
  -ProjectRef "bruvmdcstlkszvjruska" `
  -Url "https://bruvmdcstlkszvjruska.supabase.co" `
  -AnonKey "YOUR_PUBLISHABLE_KEY_FROM_API_KEYS"
```

---

## 2. Migrations + Edge Functions — DO THIS NEXT

```powershell
cd "d:\feel good"
npx supabase login
.\scripts\deploy-backend.ps1
```

Deploys migrations + `submit-testimonial`, `register-device`, `delete-account`.

### Manual fallback (SQL Editor)

https://supabase.com/dashboard/project/bruvmdcstlkszvjruska/sql — run migration files in filename order under `supabase/migrations/`, then:

```powershell
npx supabase functions deploy submit-testimonial --project-ref bruvmdcstlkszvjruska
npx supabase functions deploy register-device --project-ref bruvmdcstlkszvjruska
npx supabase functions deploy delete-account --project-ref bruvmdcstlkszvjruska
```

Confirm Storage buckets `vision-board`, `weekly-photos`.

---

## 3. Google OAuth + Redirect URLs + emails

### 3.1 Google Cloud

1. [Google Cloud Console](https://console.cloud.google.com/) → Credentials → **Create OAuth client ID** → **Web application**
2. Authorized redirect URI:

```text
https://bruvmdcstlkszvjruska.supabase.co/auth/v1/callback
```

3. Copy Client ID + Client Secret

### 3.2 Supabase Auth (do this or Google opens localhost:3000)

**#1 Site URL** — Authentication → URL Configuration. Must be:

```text
feelgood://auth/callback
```

Never use `https://….supabase.co` or `http://localhost:3000` as Site URL (that causes `requested path is invalid` after Google).

**#2 Redirect URLs** — add all, then Save. Do **not** add bare `https://bruvmdcstlkszvjruska.supabase.co`:

```text
feelgood://auth/callback
feelgood://auth/reset
feelgood://**
exp://**
https://bruvmdcstlkszvjruska.supabase.co/auth/v1/callback
exp://127.0.0.1:8081/--/auth/callback
exp://127.0.0.1:8081/--/auth/reset
exp://192.168.27.8:8081/--/auth/callback
exp://192.168.27.8:8081/--/auth/reset
exp://192.168.27.8:8082/--/auth/callback
exp://192.168.27.8:8082/--/auth/reset
```

**#3 Exact Metro URL** — if your phone IP/port differs from `192.168.27.8`, copy Metro `[auth] oauthRedirectTo` and add that string + matching `/auth/reset`.

Also enable Google provider + Email Confirm; paste email templates as below.

App uses `AuthSession.makeRedirectUri` (`exp://` in Expo Go, `feelgood://` in store builds). In Dev, Metro also logs `[auth] supabase redirect_to param` from the OAuth URL.

1. Authentication → Providers → **Google** → Enable → paste ID + Secret → Save
2. URL Configuration as above
3. Email Confirm **ON**
4. Email Templates — paste:
   - Confirm signup → [`email-templates/confirm-signup.html`](email-templates/confirm-signup.html)
   - Reset password → [`email-templates/reset-password.html`](email-templates/reset-password.html)  
   Subjects: `Confirm your Feel Good Challenge email` / `Reset your Feel Good Challenge password`


---

## 4. Restart app

```powershell
cd "d:\feel good\apps\mobile"
npx expo start --port 8082 -c
```

(Or 8083 — then allowlist that port in Redirect URLs.)

---

## 5. Full test checklist

### Auth
- [ ] Sign up → confirm mail → sign in
- [ ] Forgot password → reset → new password
- [ ] Continue with Google
- [ ] Kill app → session persists
- [ ] Sign out

### Core smoke
- [ ] Onboarding → Today
- [ ] Habits + check-in
- [ ] Vision / weekly photo upload
- [ ] Settings → Test reminder / Daily reminders / Delete account

Also tick [`PREPUBLISH_STATUS.md`](PREPUBLISH_STATUS.md) scorecard.
