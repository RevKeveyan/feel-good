# QA smoke script — run after device testing
# Usage: document results in PARITY_CHECKLIST.md

## P0 blockers fixed in code
- [x] Mobile uses Supabase Auth (not Lovable) — `apps/mobile/lib/auth.ts`
- [x] Edge Functions exist for testimonials / delete / device register
- [x] Account deletion UI in Settings + `delete-account` function
- [x] Vision board capped at 8 images
- [x] Photo library permission requested before vision upload
- [x] Legal URLs centralized in `@feelgood/shared` LEGAL_URLS

## Manual device checklist (must pass before TestFlight)

### Auth
1. Email signup → confirm email → sign in
2. Kill app → reopen → session persists
3. Sign out → lands on Auth
4. Google (after Dashboard config)
5. Apple on iOS (after Dashboard config)

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
1. Enable reminders (physical device)
2. Privacy/Terms open in browser
3. Delete account removes user

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
