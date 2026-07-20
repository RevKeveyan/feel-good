# Final Submit Checklist

Complete in order. Check boxes as you finish.

## A. Backend (Dashboard / CLI)
- [ ] Run SQL: `supabase/migrations/20260720120000_device_tokens.sql`
- [ ] `npx supabase login` then `.\scripts\deploy-backend.ps1`
- [ ] Google provider enabled + redirect URLs
- [ ] Apple provider enabled (iOS)
- [ ] Smoke-test Edge Functions with user JWT

## B. Device QA
- [ ] Follow [QA_RUNBOOK.md](./QA_RUNBOOK.md)
- [ ] Update [PARITY_CHECKLIST.md](./PARITY_CHECKLIST.md) to all `[x]`
- [ ] Fix any P0/P1 bugs found

## C. Brand & legal
- [x] App icons / splash generated in `apps/mobile/assets/`
- [ ] Capture store screenshots (see STORE_LISTING.md)
- [ ] Confirm Privacy/Terms live at thefeelgoodsociety.com.au (or host web `/privacy` `/terms`)
- [ ] Optional: mindset audio CDN URL

## D. Accounts & EAS
- [ ] Apple Developer Program enrolled
- [ ] Google Play Console created
- [ ] `eas login` + `eas init` → paste projectId into app.json
- [ ] Fill eas.json Apple/Google submit fields
- [ ] Set EAS secrets for Supabase keys
- [ ] `.\scripts\eas-build.ps1 -Profile production -Platform all`

## E. Store consoles
- [ ] App Store Connect: listing from [STORE_LISTING.md](./STORE_LISTING.md)
- [ ] App Privacy from [APPLE_PRIVACY.md](./APPLE_PRIVACY.md)
- [ ] TestFlight internal → external
- [ ] Submit for App Review
- [ ] Play Console: listing + [GOOGLE_DATA_SAFETY.md](./GOOGLE_DATA_SAFETY.md)
- [ ] Internal testing → Production

## Prepared in repo (no account needed)
- Deploy scripts: `scripts/deploy-backend.ps1`, `scripts/eas-build.ps1`
- Edge Functions source under `supabase/functions/`
- Store copy + privacy forms under `docs/mobile/`
- Mobile MVP screens + account deletion + legal links
