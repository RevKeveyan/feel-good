# Выложить приложение — простыми словами

Длинные чеклисты: [`PUBLISH_RU.md`](PUBLISH_RU.md).  
Этот файл — короткая карта: **что уже есть** и **что сделать по порядку**.

---

## Два разных «приложения»

| | Сейчас (Expo Go) | В магазинах |
|--|--|--|
| Как ставят | QR с вашего ПК | App Store / Google Play |
| Нужен ли ПК | Да | Нет |
| Для публикации | Не подходит | Нужна отдельная сборка |

«На телефоне в Expo Go работает» ≠ «можно жать Publish».

---

## Что уже есть

- Приложение (экраны, логин, челлендж)
- Аккаунты Apple Developer и Google Play
- Сервер Supabase + Google вход на телефоне (`feelgood://`)
- Проект сборки Expo (EAS)
- **Privacy / Terms в интернете** (живые ссылки):
  - Privacy: https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/privacy.html
  - Terms: https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/terms.html  
  (позже можно перенести на `thefeelgoodsociety.com.au` — сейчас сайт отдаёт 404)

---

## Что ещё нужно (по порядку)

### 1. Письма (вы — обязательно)

Без этого регистрация / «забыл пароль» в магазине будут ломаться.

1. Откройте [Supabase → Authentication → SMTP](https://supabase.com/dashboard/project/bruvmdcstlkszvjruska/auth/smtp)
2. Включите Custom SMTP (Gmail App Password или Resend) — пошагово: [`SMTP_AND_EMAIL_RU.md`](SMTP_AND_EMAIL_RU.md)
3. Sender name: `Feel Good Challenge` → Save
4. Скажите агенту «SMTP готов» или сами:

```powershell
cd "d:\feel good"
.\scripts\apply-auth-email-templates.ps1
```

Проверка: Forgot password → в письме **код**, From = Feel Good Challenge.

### 2. Тестовая сборка на телефон

Не Expo Go — настоящий файл приложения (APK / TestFlight).

```powershell
cd "d:\feel good\apps\mobile"
npx eas-cli build -p android --profile preview
```

Ссылка на APK появится на [expo.dev](https://expo.dev/accounts/galaxy15478/projects/feel-good-challenge/builds).  
Поставьте на телефон и проверьте: вход, Google, Today, удаление аккаунта.

### 3. Google Play (вы)

См. [`PLAY_SIMPLE_RU.md`](PLAY_SIMPLE_RU.md): создать приложение → описание/скрины → Internal testing → Production.

### 4. App Store (вы)

См. [`IOS_SIMPLE_RU.md`](IOS_SIMPLE_RU.md): App ID + Sign in with Apple → App Store Connect → TestFlight → Review.

---

## Кто что делает

| Задача | Кто |
|--------|-----|
| SMTP, карточки магазинов, скрины, проверка на телефоне | **Вы** |
| Сборка EAS, шаблоны писем, деплой legal/бэкенда | **Агент** |

---

## Сейчас не делайте

- Не публикуйте в Production, пока нет SMTP и проверки на APK/TestFlight
- Не ждите OAuth на эмуляторе — для стора важен телефон

---

## Один следующий шаг

**Сейчас:** починить SMTP в Dashboard (Username = Gmail email, Host = `smtp.gmail.com` без точки) → Forgot password.  
APK уже готов: https://expo.dev/accounts/galaxy15478/projects/feel-good-challenge/builds/10b833d0-8dca-4ae4-bc45-8238c4874331  
Потом: QA на телефоне → Play Internal.  
Статус: [`PREPUBLISH_STATUS.md`](PREPUBLISH_STATUS.md).
