# Статус перед публикацией — mobile

> **Простой гайд:** [`PUBLISH_SIMPLE_RU.md`](PUBLISH_SIMPLE_RU.md)  
> SMTP: [`SMTP_AND_EMAIL_RU.md`](SMTP_AND_EMAIL_RU.md)

Обновлено: **2026-07-24**.  
Проект: `feel-good-challenge` / `bruvmdcstlkszvjruska`.  
EAS: `21d53822-332d-4e0b-9044-7b937398ba8a`.

## Вердикт

| Ворота | Статус |
|--------|--------|
| Код / Google OAuth (телефон) | OK |
| Env / EAS project | OK |
| Privacy / Terms в браузере | **OK** — публичные HTML в Supabase Storage |
| Письма (Custom SMTP + шаблоны) | **БЛОК — вы** (гайд готов) |
| Android preview APK (SDK 54) | **OK** — build `cb3c4b5f-…` |
| Play / App Store | Гайды готовы — заполняет **вы** |

### Preview APK (свежий)

https://expo.dev/accounts/galaxy15478/projects/feel-good-challenge/builds/cb3c4b5f-8935-41c9-9cd6-d916673013ec

### Живые legal URL

- Privacy: https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/privacy.html
- Terms: https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/terms.html
- Обновить: `.\scripts\publish-legal-pages.ps1`
- Позже можно повесить те же тексты на `thefeelgoodsociety.com.au` (сейчас там 404)

## Ваш следующий клик

1. [SMTP](https://supabase.com/dashboard/project/bruvmdcstlkszvjruska/auth/smtp) → Custom SMTP → Save  
2. `.\scripts\apply-auth-email-templates.ps1`  
3. Тест Forgot password  
4. Установить APK по ссылке выше → QA на телефоне  
5. [`PLAY_SIMPLE_RU.md`](PLAY_SIMPLE_RU.md) / [`IOS_SIMPLE_RU.md`](IOS_SIMPLE_RU.md)

## Чеклист QA на устройстве (коротко)

- [ ] Email signup / confirm / вход
- [ ] Forgot → OTP → новый пароль
- [ ] Google Sign In
- [ ] Kill app → сессия жива
- [ ] Onboarding → Today
- [ ] Settings → Privacy/Terms / Delete account
