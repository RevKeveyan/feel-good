# Google Play — простые шаги

Тексты для карточки: [`STORE_LISTING.md`](STORE_LISTING.md)  
Data safety: [`GOOGLE_DATA_SAFETY.md`](GOOGLE_DATA_SAFETY.md)

Package name приложения: `com.feelgoodsociety.challenge`

## 1. Создать приложение

1. Откройте [Google Play Console](https://play.google.com/console)
2. Create app → название **The Feel Good Challenge**
3. App / Free / Declarations → Create

## 2. Заполнить обязательное

В меню слева пройдите красные пункты:

- **Store listing** — short/full description из `STORE_LISTING.md`, иконка, feature graphic, 2+ скриншота телефона
- **App content → Privacy policy** —  
  `https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/privacy.html`
- **App content → Data safety** — по [`GOOGLE_DATA_SAFETY.md`](GOOGLE_DATA_SAFETY.md)
- **App content** — остальные опросники (ads: No, target age и т.д.)

## 3. Получить файл для магазина

Нужен **AAB** (не APK):

```powershell
cd "d:\feel good\apps\mobile"
npx eas-cli build -p android --profile production
```

Скачайте `.aab` со страницы сборки на expo.dev.

## 4. Internal testing (сначала себе)

1. Testing → Internal testing → Create release
2. Загрузите AAB
3. Добавьте свой Gmail как тестера
4. Установите по ссылке теста и проверьте вход / Google / уведомления

## 5. Production

Когда Internal ок → Production → Review → Publish.

## Автозагрузка через EAS (позже)

Нужен service account JSON → `apps/mobile/google-play-service-account.json` (не в git).  
Путь уже в [`eas.json`](../../apps/mobile/eas.json). Пока JSON нет — загружайте AAB вручную в Console.
