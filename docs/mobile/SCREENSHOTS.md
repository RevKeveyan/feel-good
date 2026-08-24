# App Store screenshots checklist

Capture on a physical iPhone or Simulator after UI polish. Store files under `docs/mobile/qa-screenshots/` (gitignored media is fine if too large; keep a local copy for Connect upload).

## Required Apple sizes

| Size | Device example | Folder / prefix |
|------|----------------|-----------------|
| 6.7" | iPhone 15 Pro Max / 16 Plus | `iphone-6.7/` |
| 6.5" | iPhone 11 Pro Max / Xs Max | `iphone-6.5/` |
| 5.5" | iPhone 8 Plus | `iphone-5.5/` |

iPad screenshots: **not required** (`supportsTablet: false`).

## Required scenes (each size)

| # | Filename stem | Screen |
|---|---------------|--------|
| 1 | `01-today` | Today dashboard — score + Feel Good Five |
| 2 | `02-checkin` | Daily check-in modal |
| 3 | `03-wheel` | Onboarding Transformation Wheel |
| 4 | `04-mindset` | Mindset library |
| 5 | `05-day55` | Day 55 reveal / before-after (use review account with adjusted start date) |
| 6 | `06-struggle` | Struggle support sheet |

Example: `iphone-6.7/01-today.png`

## Capture steps

1. Install latest TestFlight build (or run production-like preview).
2. Sign in with the App Review demo account (no real user PII in screenshots).
3. Use light mode; hide debug overlays; fill realistic but fictional data.
4. Capture each scene at the three iPhone sizes listed above.
5. Upload the same six scenes (per size) in App Store Connect → App Preview and Screenshots.
6. Mark this checklist complete in [STORE_SUBMISSION.md](./STORE_SUBMISSION.md).

## Status

- [ ] 6.7" set (6 images)
- [ ] 6.5" set (6 images)
- [ ] 5.5" set (6 images)
- [ ] Uploaded to App Store Connect
