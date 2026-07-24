# Статус перед публикацией — mobile

> **Простой гайд:** [`PUBLISH_SIMPLE_RU.md`](PUBLISH_SIMPLE_RU.md)  
> SMTP: [`SMTP_AND_EMAIL_RU.md`](SMTP_AND_EMAIL_RU.md)

Обновлено: **2026-07-24** (publishing checks, без правок кода).  
Проект: `feel-good-challenge` / `bruvmdcstlkszvjruska`.  
EAS: `21d53822-332d-4e0b-9044-7b937398ba8a`.

## Вердикт

| Ворота | Статус |
|--------|--------|
| Код / Google OAuth (телефон) | OK |
| Env / EAS project | OK |
| Privacy / Terms в приложении | OK (Settings → экраны) |
| Privacy / Terms публичные URL | OK (HTTP 200) |
| Шаблоны писем (OTP `{{ .Token }}`) | OK (скрипт применён) |
| Custom SMTP реально шлёт | **БЛОК — вы** (поля SMTP неверные) |
| Android preview APK | **OK** — build `10b833d0-…` Finished |
| Play / App Store | Гайды готовы — заполняет **вы** |

### Preview APK (свежий, Finished)

- Страница: https://expo.dev/accounts/galaxy15478/projects/feel-good-challenge/builds/10b833d0-8dca-4ae4-bc45-8238c4874331  
- Прямой APK: https://expo.dev/artifacts/eas/N-eA2ucMX9YtspvvoePVPiDXdZ2IxWLBcSwMHgd6yO4.apk

### Живые legal URL

- Privacy: https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/privacy.html  
- Terms: https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/terms.html  
- Обновить: `.\scripts\publish-legal-pages.ps1`

## SMTP — что проверено API (сейчас)

| Поле | Значение сейчас | Проблема |
|------|-----------------|----------|
| Host | `smtp.gmail.com.` | Убрать точку в конце → `smtp.gmail.com` |
| Username | `…apps.googleusercontent.com` | Это OAuth Client ID, не email |
| Sender | `management@networkco.net` | Должен совпадать с Gmail Username (или «Send mail as») |
| Password | задан | Нужен **App Password** 16 символов того же Gmail |
| Шаблоны | recovery с `{{ .Token }}` | OK |

**Исправление только в Dashboard** (агент не может Save за вас):  
[Authentication → SMTP](https://supabase.com/dashboard/project/bruvmdcstlkszvjruska/auth/smtp)

Gmail (вариант A из [`SMTP_AND_EMAIL_RU.md`](SMTP_AND_EMAIL_RU.md)):

1. App Password: https://myaccount.google.com/apppasswords  
2. Host = `smtp.gmail.com` (без точки)  
3. Username = ваш Gmail целиком  
4. Password = App Password  
5. Sender email = тот же Gmail  
6. Sender name = `The Feel Good Society` (или `Feel Good Challenge`) → **Save**  
7. Тест: Forgot password → письмо с **кодом**

Шаблоны повторять не нужно, пока не меняли HTML.

## QA на устройстве (APK выше)

- [ ] Установить APK (разрешить «неизвестные источники», если спросит)
- [ ] Email signup / confirm / вход
- [ ] Forgot → OTP → новый пароль (**после починки SMTP**)
- [ ] Google Sign In
- [ ] Kill app → сессия жива
- [ ] Onboarding → Today
- [ ] Settings → Privacy / Terms
- [ ] Settings → Delete account

## Ваш следующий клик

1. Починить SMTP в Dashboard (таблица выше) → тест Forgot password  
2. Скачать APK → пройти QA-чеклист  
3. [`PLAY_SIMPLE_RU.md`](PLAY_SIMPLE_RU.md) / [`IOS_SIMPLE_RU.md`](IOS_SIMPLE_RU.md)
