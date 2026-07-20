# Mobile Auth Setup (Supabase + Expo)

See also: [BACKEND_DEPLOY.md](./BACKEND_DEPLOY.md)

## Redirect URLs

Supabase Dashboard → Authentication → URL Configuration → Redirect URLs:

- `feelgood://auth/callback`
- `exp://127.0.0.1:8082/--/auth/callback`
- `exp://127.0.0.1:8081/--/auth/callback`
- Production web origin if using web OAuth too

## Providers

### Email
Works out of the box via `signInWithPassword` / `signUp` in `apps/mobile/lib/auth.ts`.

### Google
1. Google Cloud Console → create OAuth clients (Web, iOS, Android with package `com.feelgoodsociety.challenge`)
2. Supabase → Auth → Providers → Google → enable + Client ID/Secret
3. Mobile flow: `signInWithOAuth` + `WebBrowser.openAuthSessionAsync` → `setSession`

### Apple (required on iOS if Google is offered)
1. Apple Developer → App ID `com.feelgoodsociety.challenge` → Sign In with Apple
2. Create Services ID + Key (.p8)
3. Supabase → Auth → Providers → Apple
4. Mobile: `expo-apple-authentication` → `signInWithIdToken`

## Env

```
EXPO_PUBLIC_SUPABASE_URL=https://tblafyztaidgwbrabajw.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
EXPO_PUBLIC_MINDSET_AUDIO_BASE_URL=
```

## Deep link scheme

`apps/mobile/app.json` → `"scheme": "feelgood"`
