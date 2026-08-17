# EAS: сборка и отправка в сторы

> Полная инструкция на русском: [`PUBLISH_RU.md`](PUBLISH_RU.md)

## Что нужно заранее
1. Аккаунт Expo: https://expo.dev/signup  
2. Apple Developer Program (~$99/год)  
3. Google Play Console (~$25)  
4. Supabase: OAuth + Edge Functions (см. [`BACKEND_DEPLOY.md`](BACKEND_DEPLOY.md))  
5. Custom SMTP для писем Auth (см. [`AUTH_SETUP.md`](AUTH_SETUP.md))

## Первичная настройка

```powershell
cd "d:\feel good\apps\mobile"
npm install -g eas-cli
eas login
eas init
```

Скопируйте Project ID в `app.json` → `expo.extra.eas.projectId` (сейчас стоит `REPLACE_WITH_EAS_PROJECT_ID`).

### Apple
1. App ID `com.feelgoodsociety.challenge` с Sign In with Apple  
2. Приложение в App Store Connect  
3. В `eas.json` → `submit.production.ios`:
   - `appleId`
   - `ascAppId`
   - `appleTeamId`

### Google
1. Приложение с package `com.feelgoodsociety.challenge`  
2. Service account с доступом к Play Console  
3. JSON → `apps/mobile/google-play-service-account.json` (gitignore)  
4. Путь уже в `eas.json` → `serviceAccountKeyPath`

## Секреты EAS

```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://bruvmdcstlkszvjruska.supabase.co"
eas secret:create --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "<publishable key>"
# опционально:
eas secret:create --name EXPO_PUBLIC_MINDSET_AUDIO_BASE_URL --value "https://cdn.example.com/mindset"
```

Файлы на CDN: `day-01.mp3` … `day-21.mp3`. Трек открывается, когда файл есть по этому URL (не по дню челленджа).

Локальный `.env` для Expo Go **не** подставляется автоматически в store-сборку — нужны именно EAS secrets.

## Сборка

```powershell
# Внутреннее / TestFlight-ready
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Production для сторов
eas build --platform all --profile production
```

Или:

```powershell
.\scripts\eas-build.ps1 -Profile preview -Platform all
```

## Отправка в сторы

```powershell
eas submit --platform ios --profile production --latest
eas submit --platform android --profile production --latest
```

## Тестирование до Production
1. **iOS:** App Store Connect → TestFlight → internal → external  
2. **Android:** Play Console → Testing → Internal testing → после QA в Production  
