# App Store — простые шаги

Тексты: [`STORE_LISTING.md`](STORE_LISTING.md)  
Privacy labels: [`APPLE_PRIVACY.md`](APPLE_PRIVACY.md)

Bundle ID: `com.feelgoodsociety.challenge`

## 1. Apple Developer

1. [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list)
2. App ID `com.feelgoodsociety.challenge`
3. Включите capability **Sign In with Apple**
4. В Supabase → Authentication → Providers → Apple — заполните по [`AUTH_SETUP.md`](AUTH_SETUP.md)

Без Sign in with Apple при наличии Google вход Apple часто отклоняет приложение.

## 2. App Store Connect

1. [App Store Connect](https://appstoreconnect.apple.com) → My Apps → +
2. Name: **The Feel Good Challenge**
3. Bundle ID: тот же `com.feelgoodsociety.challenge`
4. Запомните **Apple ID** (email), **Team ID**, **ASC App ID** (число в URL приложения)

Впишите в [`apps/mobile/eas.json`](../../apps/mobile/eas.json) → `submit.production.ios` вместо `REPLACE_…`.

## 3. Карточка магазина

- Subtitle / Description / Keywords — из `STORE_LISTING.md`
- Privacy Policy URL:  
  `https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/privacy.html`
- App Privacy — по [`APPLE_PRIVACY.md`](APPLE_PRIVACY.md)
- Скрины iPhone (минимум нужных размеров)

## 4. Сборка и TestFlight

```powershell
cd "d:\feel good\apps\mobile"
npx eas-cli build -p ios --profile preview
# или production:
npx eas-cli build -p ios --profile production
```

1. Дождитесь IPA на expo.dev
2. `npx eas-cli submit -p ios --latest` **или** загрузите через Transporter
3. TestFlight → Internal → поставьте на iPhone
4. Проверьте: Email, Apple Sign In, Google, Today, Delete account

## 5. Review

Submit for Review → дождитесь Apple → Release.

## Review notes (вставить в Connect)

См. блок Review notes в [`STORE_LISTING.md`](STORE_LISTING.md).
