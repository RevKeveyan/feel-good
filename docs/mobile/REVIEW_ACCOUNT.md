# App Review demo account

Production review account for App Store Connect. **Never commit the password.**

## Account

| Field | Value |
|-------|--------|
| Email | `appstore.review@thefeelgoodsociety.com.au` |
| Password | Generated at provision time — paste only into App Store Connect |
| Display name | App Review |
| `challenge_start_date` | UTC today − 54 days (so `currentDay` = 55) |
| `onboarding_completed_at` | Set at provision |
| Password policy | Does **not** expire; no forced change on first login |

## Provision

```powershell
cd "d:\feel good"
.\scripts\provision-app-review-account.ps1
```

The script prints the password once to the terminal. Copy it into App Store Connect → App Review Information immediately.

## Review notes (copy into Connect)

```text
Demo account
Username: appstore.review@thefeelgoodsociety.com.au
Password: [SET_IN_APP_STORE_CONNECT_ONLY]

The demo account has completed onboarding and is configured so the Day 55 transformation experience can be reviewed immediately.

Sign in with Apple is available on iOS. Google Sign-In is disabled in this build.

Demo path:
1. Sign in using the demo account
2. Open Today to review daily habits and check-in
3. From Today, open the Day 55 transformation experience (Complete)
4. Optional: Settings → My progress for vision board and 55-day grid

Account deletion:
Settings → Delete account

The Feel Good Challenge is a personal habit and wellness tracker. It does not provide medical diagnosis, treatment, or medical advice.

User-submitted testimonials are not displayed to other users inside the iOS app. There is no in-app social feed.
```

## Checklist

- [x] Account created / updated in production (`appstore.review@thefeelgoodsociety.com.au`)
- [x] `challenge_start_date` = today − 54 days (Day 55)
- [x] Onboarding marked complete; day_1 wheel seeded
- [ ] Password stored only in App Store Connect (valid for entire review) — copy from provision script output
- [ ] Apple Sign-In tested on a physical iPhone (build 1.1.2+)
