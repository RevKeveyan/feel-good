# Branded Supabase auth emails

HTML templates matching the mobile app palette (cream `#EBE5DD`, card `#F8EFEE`, charcoal `#222222`, accents lime / gold / blush).

**Русский пошаговый гайд (SMTP → шаблоны → проверка):** [`../SMTP_AND_EMAIL_RU.md`](../SMTP_AND_EMAIL_RU.md)

Supabase sends these emails — the app cannot ship email HTML by itself.

## Free-tier blocker (важно)

Без **Custom SMTP** на free-tier проект **нельзя** менять email templates (ни Dashboard, ни API). Поэтому письмо reset остаётся дефолтным со **ссылкой** и From **Supabase Auth**, пока SMTP не включён.

Порядок: **1) SMTP** → **2) применить шаблоны** (`.\scripts\apply-auth-email-templates.ps1`).

## Files

| File | Dashboard template |
|------|-------------------|
| [`confirm-signup.html`](./confirm-signup.html) | **Confirm signup** |
| [`reset-password.html`](./reset-password.html) | **Reset password** |

## Subjects (recommended)

| Template | Subject |
|----------|---------|
| Confirm signup | Confirm your Feel Good Challenge email |
| Reset password | Reset your Feel Good Challenge password |

## Sender name (not “Supabase Auth”)

1. Dashboard → [Authentication → SMTP](https://supabase.com/dashboard/project/bruvmdcstlkszvjruska/auth/smtp)
2. Enable Custom SMTP
3. **Sender name:** `Feel Good Challenge`
4. **Sender email** + host/port/user/password from your SMTP provider
5. Save

See [`../SMTP_AND_EMAIL_RU.md`](../SMTP_AND_EMAIL_RU.md) for Resend example.

## Apply templates (after SMTP)

```powershell
cd "d:\feel good"
.\scripts\apply-auth-email-templates.ps1
```

Or paste HTML manually:

1. Open [Authentication → Email Templates](https://supabase.com/dashboard/project/bruvmdcstlkszvjruska/auth/templates).
2. **Confirm signup** → body from `confirm-signup.html` → Subject → Save.
3. **Reset password** → body from `reset-password.html` (**`{{ .Token }}`**, no link) → Subject → Save.

## Mobile reset flow

1. App: Forgot password → email → Send.
2. Email: 6-digit code (`{{ .Token }}`).
3. App: `/auth/reset` → enter code → `verifyOtp` type `recovery` → set new password.

## Redirect URLs (OAuth / optional deep links)

Authentication → URL Configuration → **Redirect URLs** — add:

```text
feelgood://auth/reset
feelgood://auth/callback
exp://127.0.0.1:8083/--/auth/reset
exp://127.0.0.1:8082/--/auth/reset
exp://127.0.0.1:8083/--/auth/callback
exp://127.0.0.1:8082/--/auth/callback
https://bruvmdcstlkszvjruska.supabase.co/auth/v1/callback
```

## Design notes

- Email-safe fonts: Georgia (title) + Helvetica/Arial (body/CTA).
- Gradient strip echoes SoftOrbs / quote card accents.
