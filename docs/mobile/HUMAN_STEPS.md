# Pre-publish — what you still do manually

Code + docs + scripts for publication are ready in the repo.
These steps need **your accounts** (cannot be automated without login):

1. **Supabase**
   - `npx supabase login`
   - `.\scripts\deploy-backend.ps1`
   - Or paste `supabase/migrations/20260720120000_device_tokens.sql` in SQL Editor
   - Enable Google + Apple + redirect `feelgood://auth/callback`
   - Details: `docs/mobile/BACKEND_DEPLOY.md`

2. **Device QA**
   - Follow `docs/mobile/QA_RUNBOOK.md`
   - Tick items in `docs/mobile/PARITY_CHECKLIST.md`

3. **Legal hosting**
   - Confirm `https://thefeelgoodsociety.com.au/privacy` and `/terms` are live
   - Or deploy the web app and point Settings links there

4. **EAS + stores**
   - Enroll Apple Developer + Google Play
   - `cd apps/mobile` → `npx eas login` → `npx eas init`
   - Paste projectId into `app.json`
   - `.\scripts\eas-build.ps1 -Profile production -Platform all`
   - Submit using listing/privacy docs under `docs/mobile/`
   - Master list: `docs/mobile/SUBMIT_CHECKLIST.md`
