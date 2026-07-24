# Перед публикацией — что делаете вручную

> Полная инструкция на русском: [`PUBLISH_RU.md`](PUBLISH_RU.md)

Живой статус: [`PREPUBLISH_STATUS.md`](PREPUBLISH_STATUS.md).

**Supabase:** локальный env → `bruvmdcstlkszvjruska`. Дальше — деплой и Google: [`NEW_SUPABASE_SETUP.md`](NEW_SUPABASE_SETUP.md).

1. **Supabase + Google + письма**
   - `npx supabase login` затем `.\scripts\deploy-backend.ps1`
   - Google provider + Redirect URLs (NEW_SUPABASE_SETUP §3)
   - **Сначала Custom SMTP**, затем шаблоны OTP — иначе письмо reset останется со ссылкой ([`SMTP_AND_EMAIL_RU.md`](SMTP_AND_EMAIL_RU.md))
   - После SMTP: `.\scripts\apply-auth-email-templates.ps1` (Reset = `{{ .Token }}`, Sender = Feel Good Challenge)
   - Google OAuth consent **App name** = Feel Good Challenge
   - [`AUTH_NOTIFY_GUIDE.md`](AUTH_NOTIFY_GUIDE.md)

2. **Mindset audio**
   - `EXPO_PUBLIC_MINDSET_AUDIO_BASE_URL` в `apps/mobile/.env`
   - Expo `-c`

3. **Legal**
   - `/privacy` и `/terms` не должны быть 404 — хостинг или правка `LEGAL_URLS`

4. **Device QA**
   - [`QA_RUNBOOK.md`](QA_RUNBOOK.md) + чеклист в [`PREPUBLISH_STATUS.md`](PREPUBLISH_STATUS.md)

5. **EAS + сторы**
   - [`SUBMIT_CHECKLIST.md`](SUBMIT_CHECKLIST.md) и [`EAS_BUILD.md`](EAS_BUILD.md)
