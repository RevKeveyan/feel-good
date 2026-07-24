# QA smoke script — run after device testing
# Usage: document results in PARITY_CHECKLIST.md

## P0 blockers fixed in code
- [x] Mobile uses Supabase Auth (not Lovable) — `apps/mobile/lib/auth.ts`
- [x] Edge Functions exist for testimonials / delete / device register
- [x] Account deletion UI in Settings + `delete-account` function
- [x] Vision board capped at 8 images
- [x] Photo library permission requested before vision upload
- [x] Legal URLs centralized in `@feelgood/shared` LEGAL_URLS

## Before you start
- Tick results also in [`PREPUBLISH_STATUS.md`](PREPUBLISH_STATUS.md) Device QA scorecard.
- Do **not** start TestFlight until Edge Functions return 2xx, legal URLs open, and scorecard is green.
- Agent cannot run physical-device steps; this runbook is the human gate.

## Manual device checklist (must pass before TestFlight)

### Auth
1. Email signup → confirm email → sign in
2. Kill app → reopen → session persists
3. Sign out → lands on Auth
4. Forgot password → email link → Set new password → sign in with new password
5. Google (after Dashboard config — see `AUTH_NOTIFY_GUIDE.md`)
6. Apple on iOS (after Dashboard config)

### Onboarding
1. Complete all steps with Back/Next
2. Kill mid-flow → resume data present
3. Vision upload works; 9th image blocked
4. Finish → Today

### Today
1. Toggle all 5 habits + water
2. Check-in required for Day complete
3. Miss yesterday banner (set challenge_start_date back 2 days in SQL)
4. Weekly photo camera upload
5. Struggle sheet logs to `struggle_moments`

### Complete
1. Set `challenge_start_date` to 55+ days ago
2. Rewheel → reveal → testimonial → share

### Settings
1. **Test reminder (1 min)** on physical device — notification fires (~60s, app in background)
2. Enable **Daily reminders** (9:00 AM local)
3. After `register-device` deploy: `select * from device_tokens` has a row
4. Privacy/Terms open in browser
5. Delete account removes user

Full auth/notify matrix: [`AUTH_NOTIFY_GUIDE.md`](AUTH_NOTIFY_GUIDE.md).

## SQL helpers for QA

```sql
-- Jump to Day 55 for current user (replace UUID)
update profiles
set challenge_start_date = current_date - 54
where id = 'USER_UUID';

-- Reset onboarding
update profiles set onboarding_completed_at = null where id = 'USER_UUID';
delete from onboarding_responses where user_id = 'USER_UUID';
```
