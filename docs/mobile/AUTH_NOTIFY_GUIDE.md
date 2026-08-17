# Auth, Google, notifications — status and how to test

Full guide for mobile. Code: `apps/mobile/lib/auth.ts`, `apps/mobile/lib/notifications.ts`.

**Backend:** project `bruvmdcstlkszvjruska` — see [`NEW_SUPABASE_SETUP.md`](NEW_SUPABASE_SETUP.md) (deploy -> Google -> emails -> QA).

## Status matrix

| Feature | In code | Works now without Dashboard |
|---------|---------|-----------------------------|
| Email sign up + verify | Yes (Supabase mail) | Yes, if Confirm email + mail arrive |
| Forgot / reset password | Yes (`/auth` + `/auth/reset`) | Needs Redirect URLs + email delivery |
| Branded auth emails | HTML in repo | Paste into Dashboard Email Templates |
| Google Sign In | Yes | No — enable Provider + redirects first |
| Local 9:00 reminder | Yes | Yes on physical device (Settings) |
| Test reminder (1 min) | Yes | Yes — Settings -> Test reminder |
| Remote token -> `device_tokens` | Yes | No until migration + `register-device` deploy |

## Forgot / reset password

OTP-only flow (email template must use `{{ .Token }}`, not only a link):

1. Auth → **Forgot password?** → email → **Send reset code** → `/auth/reset`.
2. Enter one-time code → **Verify code** → **Set new password** (do not remount back to code).
3. **Update password** → Today. Mid-flow **Back to Sign in** signs out (does not open Today).

App gate: while recovery is pending (`isPasswordRecoveryPending`), `/` and `/(app)` redirect to `/auth/reset` so a recovery session cannot skip setting a password.

### Dashboard (required)

**Site URL** (Authentication -> URL Configuration): `feelgood://auth/callback`  
Do **not** use `https://….supabase.co` or `http://localhost:3000` as Site URL — that causes `requested path is invalid` after Google.

Redirect URLs — add (Save after):

```
feelgood://auth/callback
feelgood://auth/reset
feelgood://**
exp://**
exp://127.0.0.1:8081/--/auth/callback
exp://127.0.0.1:8081/--/auth/reset
exp://127.0.0.1:8082/--/auth/callback
exp://127.0.0.1:8082/--/auth/reset
exp://192.168.27.8:8081/--/auth/callback
exp://192.168.27.8:8081/--/auth/reset
exp://192.168.27.8:8082/--/auth/callback
exp://192.168.27.8:8082/--/auth/reset
https://bruvmdcstlkszvjruska.supabase.co/auth/v1/callback
```

Do **not** add bare `https://bruvmdcstlkszvjruska.supabase.co` (without `/auth/v1/callback`) — Auth may redirect there and show path is invalid.

`exp://**` covers changing LAN IP / Metro port. Always also add the exact Metro log `[auth] oauthRedirectTo` if Google still fails.

Branded templates: [`email-templates/README.md`](email-templates/README.md).

## Register + email verify

1. Auth → Create account → check-inbox alert → **confirm** mode (OTP).
2. Enter code → Today. Unconfirmed sign-in switches to confirm mode (code, not link).
3. Recovery / OAuth deep links use `completeSessionFromUrl` in root layout; `PASSWORD_RECOVERY` only sets the pending flag (no remount of `/auth/reset`).

## Google — enable (Dashboard)

1. Google Cloud Console -> OAuth 2.0 Client ID (**Web application**).
2. Authorized redirect URI: `https://bruvmdcstlkszvjruska.supabase.co/auth/v1/callback`
3. Copy Client ID + Client Secret.
4. Supabase `bruvmdcstlkszvjruska` -> Authentication -> Providers -> **Google** -> Enable -> paste -> Save.
5. Authentication -> **URL Configuration** (order matters):
   - **#1 Site URL** = `feelgood://auth/callback` — never `*.supabase.co` or `localhost:3000`
   - **Redirect URLs** — include wildcards `exp://**` and `feelgood://**`, plus `8081`/`8082`/`8083` LAN entries (see list above)
   - Confirm Metro `[auth] oauthRedirectTo` is allowlisted (often `exp://192.168.27.8:8081/--/auth/callback`)
6. Restart Expo (`npm run start:clean`) -> Sign out -> **Continue with Google** -> browser should close signed in.

Dev logs: `[auth] oauthRedirectTo` and `[auth] supabase redirect_to param` must match an allowlisted URL.

Also see [`BACKEND_DEPLOY.md`](BACKEND_DEPLOY.md).

## «requested path is invalid» / «required path is invalid» (Expo Go)

This is **not OK** — Google OAuth did not return into the app.

After Google, the browser lands on `https://bruvmdcstlkszvjruska.supabase.co/#…` instead of your Expo deep link. Supabase Auth then shows JSON `requested path is invalid`.

**Cause:** Auth redirected to **Site URL**. If Site URL is `https://….supabase.co` (and/or that bare URL is in Redirect URLs), the browser shows JSON `requested path is invalid`.

**Fix:**

1. Site URL → `feelgood://auth/callback`
2. Redirect URLs → **delete** bare `https://bruvmdcstlkszvjruska.supabase.co` (keep only `…/auth/v1/callback`)
3. Keep `exp://…:8081/…` (and `feelgood://…`) entries
4. Save → Force stop Expo Go → `npm run start:clean` → retry Google
5. Alert **Share URL** shows app `redirectTo` vs OAuth `redirect_to` param for debugging

Apple Sign In uses native `signInWithIdToken` (no browser). Full Apple QA is more reliable on a preview/dev build than Expo Go.

## Notifications

Settings -> Daily reminders / Test reminder (1 min). Prefer physical device.

### Expo Go (SDK 53+)

- **Local** reminders work after notification permission.
- **Remote push** (`getExpoPushTokenAsync` / `device_tokens`) is **not** available in Expo Go on Android — Expo logs a red ERROR on first import of `expo-notifications`. That is expected, not an app crash.
- Use a **development** or **preview** EAS build for real push tokens.
- Settings no longer requires a push token to schedule local Daily / Test reminders.

### 2× Expo Go / black screen

Two Expo Go clients on one Metro, a stale port (8081 vs 8082), or a stuck native splash → **black screen** (not the cream loading spinner).

**Recovery:**

1. Force stop / close Expo Go on **phone and emulator**.
2. From `apps/mobile`: `npm run start:clean` (kills 8081/8082, then `expo start -c`).
3. Connect **one** way only:
   - QR on the **phone**, or
   - emulator via `a` / `npm run android` —
   **not both**.
4. Do not press `a` if you are testing on a physical phone.
5. In Expo Go, open the **exact** URL from Metro (e.g. `exp://192.168.27.8:8081`) if the QR is stale.
6. After Google OAuth, if a second Expo Go opens — close the extra one, Reload (`r`) in the remaining client.

`npm start` / `npm run start:clear` do not open Android. `npm run android` opens the emulator on purpose. Prefer `start:clean` when you see a black screen or “port is being used”.

## How to test (checklist)

### A. Email
- [ ] Create account -> confirm -> sign in
- [ ] Kill app -> session persists
- [ ] Sign out -> Sign in again

### B. Forgot / reset
- [ ] Forgot password -> email -> `/auth/reset` -> new password

### C. Google
- [ ] Continue with Google succeeds
- [ ] Session persists; Sign out works

### D. Notifications
- [ ] Test reminder 1 min
- [ ] Daily reminders on
- [ ] `device_tokens` row after deploy

### E. Backend
- [ ] `.\scripts\deploy-backend.ps1` succeeded

## Related docs

- [`NEW_SUPABASE_SETUP.md`](NEW_SUPABASE_SETUP.md)
- [`email-templates/README.md`](email-templates/README.md)
- [`QA_RUNBOOK.md`](QA_RUNBOOK.md)
- [`PARITY_CHECKLIST.md`](PARITY_CHECKLIST.md)
