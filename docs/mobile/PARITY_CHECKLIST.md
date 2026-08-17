# Mobile Parity Checklist

Use after each screen ships. Mark: `[ ]` todo `[x]` done `[~]` partial (code ready, needs device verify) `[!]` blocked.

## Pre-publish code pass — 2026-07-20

### Copy parity vs web (2026-07-20)
- [x] Onboarding: welcome / Why prompts / goals / commitment / wheel / vision / letter / done — web titles & body
- [x] Onboarding visual: uppercase PromptField labels, gradient inputs, RadarChart + colored WheelScale, vision dashed Add image tile, per-step tone backgrounds
- [x] Lucide icons: `lucide-react-native` same names as web (onboarding, today, mindset, complete, settings); import via `@/components/ui/icons` deep paths (avoid package barrel)
- [x] Auth signup alert; Today missed/Move/Mindset/check-in/ScoreRing Remaining; Mindset header; Complete gate/rewheel/reveal

### Fixed in code (await device re-verify)
- [x] Auth: Welcome back / Join the challenge; Google above email; Create account CTA
- [x] ScoreRing Check-in meta: Required (not Open)
- [x] Today: loading early-return no longer hangs; Nourish/Fuel subtitles; quote author; Move minutes + Clear; weekly photo replaces old storage object
- [x] Onboarding: 4 Why prompts (`why_joined` / `why_change` / `want_to_feel` / `success_looks_like`); goals Other text; commitment pledge + sign; vision grid + delete; wheel autosave; step validation
- [x] Mindset: full category labels; header copy; duration meta; iOS silent-mode audio
- [x] Complete: Day 1 vs Day 55 on rewheel; publish permission checkbox; gated back link

### Typography parity (brand kit + web) — 2026-07-21
- [x] Shared primitives: `DisplayTitle`, `Kicker`, `Body`, `Label`, `StatValue` — see [`TYPOGRAPHY.md`](TYPOGRAPHY.md)
- [x] `typeScale` aligned to web Tailwind map (`text-3xl` = 30, `text-sm` = 14, etc.)
- [x] Auth + reset typography 1:1: title 30 League italic; kickers mono 10; inputs/buttons 14; switch/forgot 12
- [x] League Spartan display italic on headings (Today, Onboarding, Complete, Auth title)
- [x] Open Sans body via `Body` / `Label`; mono kickers via `Kicker` (match current web `font-mono`)
- [x] Playfair `BrandWordmark` kept on Auth
- [x] ScoreRing, HabitToggle, Settings, StruggleSheet use typography primitives
- [x] Stats and counters use `StatValue` to avoid clipped synthetic-italic digits on mobile
- [x] Today quote card: lime→card→destructive gradient + accent orb; `text-lg` (18px); content above orb
- [x] Missed banner `#F1E8D7` (web accent/10 wash); Heart 20; body `text-xs`
- [x] Move modal layout 1:1 web (pills → duration → Save)
- [~] Device visual pass vs web Today header / quote / ScoreRing / check-in contrast — re-verify on emulator
- [ ] Later passes: Onboarding → Today → Mindset → Complete → Settings (size roles per [`TYPOGRAPHY.md`](TYPOGRAPHY.md))

### Legal pages (in-app) — 2026-07-24
- [x] Shared content: `@feelgood/shared` `privacyPolicy` / `termsOfService` (`legal-content.ts`)
- [x] Web `/privacy` and `/terms` render from shared
- [x] Native `/privacy` and `/terms` screens (`LegalDocScreen`)
- [x] Settings opens in-app Privacy / Terms (not external browser)
- [x] Auth links to Privacy Policy · Terms of Service
- [x] Store listing URLs remain `LEGAL_URLS` (thefeelgoodsociety.com.au)
### Visual (brand guide + web)
- [x] Today: cream bg, streak/journey cards, ScoreRing, HabitToggle, Feel Good Five, hydrate — `qa-screenshots/01-screen-sm.png`
- [x] Mindset: blush tile, category pills, track rows — `qa-screenshots/04-mindset-sm.png`
- [~] Auth wordmark / SoftOrbs — code updated; re-verify on signed-out session
- [~] Onboarding step tones / progress / Why×4 / wheel radar / vision grid — code updated; full wizard device pass pending
- [~] Struggle sheet / Settings chrome — code live

### Auth
- [x] Email sign up / sign in — **API PASS**
- [x] Forgot password + reset screen (`/auth/reset`) — OTP verify → set password; recovery pending gate blocks Today until password set; Back to Sign in signs out
- [~] Branded Confirm / Reset emails — HTML in [`email-templates/`](email-templates/); paste in Dashboard
- [!] Google Sign In (native) — code ready; needs Dashboard OAuth
- [!] Apple Sign In (iOS) — code ready; needs Apple + Supabase config
- [~] Session persists across app restart — observed
- [x] Sign out clears session — **API PASS**

### Onboarding
- [~] All steps with back/next + validation — code; device wizard pass pending
- [x] Autosave / responses upsert — **API PASS** (extend verify for new Why columns)
- [x] Wheel day_1 saved — **API PASS**
- [~] Vision board upload / preview / delete (max 8) — code; device pass pending
- [x] Future letter saved — **API PASS**
- [~] Redirect to today on complete — code path exists

### Today
- [x] Day number / week / streak / score — **UI PASS**
- [x] Nourish, Fuel, Move, Mindset, Hydrate — **UI+API PASS** (Move minutes: code; device re-check)
- [~] Check-in gate (4 scales) — Required label + dark-card contrast fixed; device tap confirm
- [~] Missed yesterday banner — Heart icon + copy; bg `#F1E8D7` + accent ring (web `accent/10`); device SQL backdate for QA
- [x] Log movement modal 1:1 web: 3×3 type pills, Duration kicker, minutes input, Save CTA, ✕ close
- [~] Weekly photo upload/replace + old object cleanup — code; device confirm
- [x] Struggle log to DB — **API PASS**

### Mindset
- [x] 21 tracks listed by category — **UI PASS** (labels/duration updated)
- [!] Audio play — blocked: set `EXPO_PUBLIC_MINDSET_AUDIO_BASE_URL` (silent-mode mode set in code)

### Complete (Day 55)
- [x] Gate logic day &lt; 55 vs ≥ 55 — **API PASS**
- [x] Rewheel day_55 upsert — **API PASS**
- [~] Reveal UI / shifts / letter / vision / share / publish permission — code; device after SQL jump
- [!] Testimonial submit — **Edge Function non-2xx** (deploy)
- [!] Delete account — **Edge Function non-2xx**
- [!] register-device — **Edge Function non-2xx**

### Non-functional
- [~] Offline queue — not tested (airplane mode)
- [!] Push daily reminder — needs physical device + register-device deploy
- [x] Privacy + Terms links — code wired to `LEGAL_URLS`

### Agent smoke — 2026-07-21
- [x] `npx tsc --noEmit` + `npx expo export --platform android` (1416 modules) — PASS
- [x] Quote / icons / StatValue code paths re-verified in repo (device visual still `[~]`)
- [!] Edge Functions still 404 until `supabase login` + `.\scripts\deploy-backend.ps1`
- [!] Legal: production `/privacy` `/terms` 404 — see `PREPUBLISH_STATUS.md`

### Blocked until backend / config (human)
| Item | Blocker | Doc |
|------|---------|-----|
| Supabase `bruvmdcstlkszvjruska` | Env wired; run `deploy-backend.ps1` + Google + emails | `NEW_SUPABASE_SETUP.md` |
| Google / Apple OAuth | Supabase Dashboard + `feelgood://auth/callback` (+ `/auth/reset`) | `NEW_SUPABASE_SETUP.md`, `BACKEND_DEPLOY.md` |
| Testimonials / delete / push register | Deploy Edge Functions + migrations | `NEW_SUPABASE_SETUP.md`, `scripts/deploy-backend.ps1` |
| Mindset audio | `EXPO_PUBLIC_MINDSET_AUDIO_BASE_URL` in `apps/mobile/.env` | `.env.example` |
| Privacy / Terms links | Host pages (domain currently 404) | `HUMAN_STEPS.md`, `PREPUBLISH_STATUS.md` |
| Store builds | EAS `projectId` in `app.json` | `SUBMIT_CHECKLIST.md` |
| Store submit | Apple Developer / Play Console | `HUMAN_STEPS.md` |

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
Human blockers: [`HUMAN_STEPS.md`](HUMAN_STEPS.md) · [`PREPUBLISH_STATUS.md`](PREPUBLISH_STATUS.md)
