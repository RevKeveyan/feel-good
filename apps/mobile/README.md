# Feel Good Mobile (Expo)

React Native app for App Store and Google Play. Web app at repo root remains the design/functionality reference.

## Setup

```bash
cd apps/mobile
cp .env.example .env
npm install
npm run start:clean
```

**Phone only (recommended):** after `start:clean`, scan the QR in Expo Go on your physical phone. Do **not** press `a` and do **not** run `npm run android` — that opens the emulator. Leave emulators off.

If the screen is **black**: Force stop Expo Go on the phone, ensure no emulator is running (`adb devices` empty of `emulator-*`), then `npm run start:clean` again. One client only. Enter the exact Metro URL in Expo Go if needed. Details: `docs/mobile/AUTH_NOTIFY_GUIDE.md` (section «2× Expo Go / black screen»).

## Env

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_MINDSET_AUDIO_BASE_URL` (optional CDN base for audio)

## Build (EAS)

```bash
npm install -g eas-cli
eas login
eas build --profile preview --platform all
```

Replace placeholders in `app.json` and `eas.json` before production builds.

## Assets

Add PNG files to `assets/`:
- `icon.png` (1024x1024)
- `splash.png` (1284x2778)
- `adaptive-icon.png` (1024x1024)
- `notification-icon.png` (96x96)

## Docs

- `docs/mobile/AUTH_SETUP.md`
- `docs/mobile/PARITY_CHECKLIST.md`
- `docs/mobile/STORE_SUBMISSION.md`
