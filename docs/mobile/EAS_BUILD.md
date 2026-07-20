# EAS Build & Submit

## Prerequisites
1. Expo account: https://expo.dev/signup
2. Apple Developer Program ($99/year)
3. Google Play Console ($25)
4. Supabase OAuth + Edge Functions deployed (see BACKEND_DEPLOY.md)

## One-time setup

```powershell
cd "d:\feel good\apps\mobile"
npm install -g eas-cli
eas login
eas init
```

Copy the printed Project ID into `app.json` → `expo.extra.eas.projectId`.

### Apple
1. Create App ID `com.feelgoodsociety.challenge` with Sign In with Apple
2. Create App in App Store Connect
3. Update `eas.json` submit.production.ios:
   - appleId
   - ascAppId
   - appleTeamId

### Google
1. Create app with package `com.feelgoodsociety.challenge`
2. Create service account with Play Console access
3. Save JSON as `apps/mobile/google-play-service-account.json` (gitignored)
4. Point `eas.json` submit.android.serviceAccountKeyPath

## Secrets (EAS)

```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://tblafyztaidgwbrabajw.supabase.co"
eas secret:create --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "<publishable key>"
# optional:
eas secret:create --name EXPO_PUBLIC_MINDSET_AUDIO_BASE_URL --value "https://cdn.example.com/mindset"
```

## Build

```powershell
# Internal / TestFlight-ready
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Store production
eas build --platform all --profile production
```

Or:

```powershell
.\scripts\eas-build.ps1 -Profile preview -Platform all
```

## Submit

```powershell
eas submit --platform ios --profile production --latest
eas submit --platform android --profile production --latest
```

## TestFlight / Internal testing
1. iOS: App Store Connect → TestFlight → add internal testers → then external
2. Android: Play Console → Testing → Internal testing → promote to Production after QA
