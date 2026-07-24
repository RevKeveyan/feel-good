# Письма Auth: код reset + имя отправителя

> Простой publish-гайд: [`PUBLISH_SIMPLE_RU.md`](PUBLISH_SIMPLE_RU.md)

## За 10 минут (вы)

1. [Authentication → SMTP](https://supabase.com/dashboard/project/bruvmdcstlkszvjruska/auth/smtp)
2. Enable Custom SMTP = ON  
3. Sender name = `Feel Good Challenge`  
4. Заполните Gmail App Password **или** Resend (таблицы ниже) → **Save**
5. В PowerShell:

```powershell
cd "d:\feel good"
.\scripts\apply-auth-email-templates.ps1
```

6. В приложении: Forgot password → письмо с **кодом**, From = Feel Good Challenge.

Пока SMTP выключен, шаблоны **нельзя** залить (free-tier + default mailer). Проверено скриптом 2026-07-24.

---

## Почему в письме ссылка и «Supabase Auth»

На free-tier **без Custom SMTP** Supabase:

1. Шлёт дефолтное письмо Recovery со **ссылкой** (не с кодом).
2. Отправитель всегда **Supabase Auth**.
3. **Блокирует** смену HTML-шаблонов (API и Dashboard):  
   *«Email template modification is not available for free tier projects using the default email provider»*.

Пока SMTP не включён, правки UI в приложении **не меняют** письмо. Шаблон с `{{ .Token }}` лежит в репо, но в проект его нельзя залить.

**Исправление:** любой Custom SMTP (Google / Resend / …) → применить шаблоны → в письме появится код.

Dashboard SMTP: [Authentication → SMTP](https://supabase.com/dashboard/project/bruvmdcstlkszvjruska/auth/smtp)

---

## Вариант A — Google / Gmail SMTP (быстрый тест)

Для разработки и проверки OTP. Для продакшена лимиты Gmail (~100–500 писем/день) неудобны — лучше Resend (вариант B).

### Подготовка Google

1. Включить **2-Step Verification**: https://myaccount.google.com/security  
2. Создать **App Password** (не обычный пароль Gmail): https://myaccount.google.com/apppasswords  
   - имя: `Supabase`  
   - скопировать **16 символов**

### Поля в Supabase

| Поле | Значение |
|------|----------|
| Enable Custom SMTP | ON |
| Sender name | `Feel Good Challenge` |
| Sender email | ваш Gmail, например `you@gmail.com` |
| Host | `smtp.gmail.com` |
| Port | `465` (SSL) или `587` (TLS) |
| Username | тот же Gmail целиком |
| Password | **App Password** (16 символов) |

Save.

**Google Workspace**, если `smtp.gmail.com` не работает ([дока Supabase](https://supabase.com/docs/guides/troubleshooting/using-google-smtp-with-supabase-custom-smtp-ZZzU4Y)):

| Поле | Значение |
|------|----------|
| Host | `smtp-relay.gmail.com` |
| Port | `465` |
| Username | admin email Workspace |
| Password | App Password этого аккаунта |
| Sender email | тот же admin email |

---

## Вариант B — Resend (рекомендуется для прода)

1. [resend.com](https://resend.com) → API Keys → создайте ключ.  
2. Domains → добавьте домен (или onboarding-домен Resend для теста, если доступен).  
3. В Supabase SMTP:

| Поле | Значение |
|------|----------|
| Enable Custom SMTP | ON |
| Sender name | `Feel Good Challenge` |
| Sender email | адрес с вашего домена (например `noreply@thefeelgoodsociety.com.au`) |
| Host | `smtp.resend.com` |
| Port | `465` или `587` |
| Username | `resend` |
| Password | API key Resend |

4. Save → Authentication → **Rate Limits** — поднимите лимиты email.

Без ваших SMTP-учёток агент **не может** включить SMTP за вас.

---

## После любого SMTP — применить шаблоны (код вместо ссылки)

```powershell
cd "d:\feel good"
.\scripts\apply-auth-email-templates.ps1
```

Скрипт заливает:

- Reset → [`email-templates/reset-password.html`](email-templates/reset-password.html) (`{{ .Token }}`)
- Confirm → [`email-templates/confirm-signup.html`](email-templates/confirm-signup.html)

Или вручную: [Email Templates](https://supabase.com/dashboard/project/bruvmdcstlkszvjruska/auth/templates) → Reset password / Confirm signup → вставить HTML → Save.

### Проверка

1. В приложении: Forgot password → Send reset code.  
2. В письме: From **Feel Good Challenge**, в теле **6-значный код** (не синяя ссылка).  
3. Экран `/auth/reset` → код → новый пароль.

Если снова ссылка — SMTP не сохранён или шаблон не применился; повторите SMTP → скрипт.

## Связанные файлы

- [`email-templates/README.md`](email-templates/README.md)
- [`AUTH_SETUP.md`](AUTH_SETUP.md)
- [`scripts/apply-auth-email-templates.ps1`](../../scripts/apply-auth-email-templates.ps1)
