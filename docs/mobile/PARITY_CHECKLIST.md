# Mobile Parity Checklist

Use after each screen ships. Mark: `[ ]` todo `[x]` done `[~]` partial (code ready, needs device verify) `[!]` blocked.

## QA session — 2026-07-20 (emulator-5556 + Expo 8083 + Supabase API)

### Visual (brand guide + web)
- [x] Today: cream bg, streak/journey cards, ScoreRing (lime→mustard→rose), HabitToggle filled dots, Feel Good Five, hydrate — screenshot `qa-screenshots/01-screen-sm.png`
- [x] Mindset: blush tile, category pills, pale-pink track rows, mustard lock when no audio CDN — `qa-screenshots/04-mindset-sm.png`
- [~] Auth wordmark / SoftOrbs — code live; device session already signed in (Auth not on screen this run)
- [~] Onboarding step tones / progress — code live; not re-run full wizard on device this session
- [~] Struggle sheet / Settings chrome — code live; UI tap after Mindset inconclusive (stayed on library)

### Auth
- [x] Email sign up / sign in — **API PASS** (strong password required by Supabase)
- [!] Google Sign In (native) — code ready; needs Dashboard OAuth
- [!] Apple Sign In (iOS) — code ready; needs Apple + Supabase config
- [~] Session persists across app restart — device still logged in after Expo reopen (observed)
- [x] Sign out clears session — **API PASS**

### Onboarding
- [~] All 8 steps with back/next — code; not full UI run this session
- [x] Autosave / responses upsert — **API PASS** (`onboarding_responses`)
- [x] Wheel day_1 saved — **API PASS** (keys: energy/confidence/fitness/…)
- [~] Vision board upload (max 8) — needs camera/library UI pass
- [x] Future letter saved — **API PASS**
- [~] Redirect to today on complete — code path exists

### Today
- [x] Day number / week / streak / score — **UI PASS** (Day 1, score ring, streak/journey)
- [x] Nourish, Fuel, Move, Mindset, Hydrate — **UI+API PASS** (5/5, Yoga·30m, Gratitude, 2.5L)
- [x] Move / Mindset modals — data present on device
- [~] Check-in gate (4 scales) — UI showed Check-in Open while habits 5/5; confirm on device tap
- [~] Missed yesterday banner — needs SQL backdate
- [~] Weekly photo upload/replace — needs camera UI
- [x] Struggle log to DB — **API PASS** (`struggle_moments` breathwork)

### Mindset
- [x] 21 tracks listed by category — **UI PASS**
- [!] Audio play — blocked: set `EXPO_PUBLIC_MINDSET_AUDIO_BASE_URL` (hint shown on screen)

### Complete (Day 55)
- [x] Gate logic day &lt; 55 vs ≥ 55 — **API PASS** (jump `challenge_start_date` → day 55)
- [x] Rewheel day_55 upsert — **API PASS**
- [~] Reveal UI / shifts / letter / vision / share — code ready; open Complete on device after SQL jump for logged-in user
- [!] Testimonial submit — **Edge Function non-2xx** (deploy/fix)
- [!] Delete account — **Edge Function non-2xx**
- [!] register-device — **Edge Function non-2xx**

### Non-functional
- [~] Offline queue — not tested (needs airplane mode)
- [!] Push daily reminder — needs physical device + register-device deploy
- [x] Privacy + Terms links — code wired to `LEGAL_URLS`

### Blocked until backend / config
| Item | Blocker |
|------|---------|
| Google / Apple OAuth | Supabase Dashboard + `feelgood://auth/callback` |
| Testimonials / delete / push register | Deploy Edge Functions |
| Mindset audio | `EXPO_PUBLIC_MINDSET_AUDIO_BASE_URL` |
| Store push QA | Physical device + EAS projectId |

### SQL helpers
```sql
update profiles
set challenge_start_date = current_date - 54
where id = 'USER_UUID';

update profiles set onboarding_completed_at = null where id = 'USER_UUID';
delete from onboarding_responses where user_id = 'USER_UUID';
```

### Artifacts
Screenshots under [`docs/mobile/qa-screenshots/`](qa-screenshots/).
