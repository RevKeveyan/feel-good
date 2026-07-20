# Screen Spec — Web Reference for Mobile

## Auth (`/auth`)

| Field | Type | Notes |
|-------|------|-------|
| email | string | required |
| password | string | min 6 |
| display_name | string | signup only |

**API:** `supabase.auth.signUp`, `signInWithPassword`, OAuth Google/Apple (mobile native).

**Post-auth:** redirect to `/today`; if `onboarding_completed_at` null → `/onboarding`.

---

## Onboarding (`/onboarding?step=`)

Steps: welcome → why → goals → commitment → wheel → why-statement → vision → letter → done.

| Step | Tables | Storage |
|------|--------|---------|
| why, goals, commitment, letter | `onboarding_responses` | — |
| wheel | `transformation_wheel` phase `day_1` | — |
| vision | `vision_board_items` | `vision-board` bucket |

**Gate:** set `profiles.onboarding_completed_at` on done.

---

## Today (`/today`)

| Feature | Table | Notes |
|---------|-------|-------|
| Feel Good Five | `daily_entries` | upsert on `(user_id, entry_date)` |
| Check-in | `daily_entries` | energy/mood/stress/motivation required |
| Weekly photo | `weekly_photos` | `weekly-photos` bucket, week 1–8 |
| Struggle | `struggle_moments` | breathwork/tiny_task/reframe/quote/community |

**Business rules:** see `packages/shared/src/challenge.ts`.

---

## Mindset (`/mindset`)

Static catalog `MINDSET_TRACKS` (21 days). Audio from `VITE_MINDSET_AUDIO_BASE_URL/day-XX.mp3`.

---

## Complete (`/complete`)

**Gate:** `currentDay >= 55`.

1. Rewheel → `transformation_wheel` phase `day_55`
2. Reveal: day_1 vs day_55 wheel, letter, vision, stats, testimonial

---

## Edge cases

- Timezone: `entry_date` uses local date (`todayISO`)
- Streak: 1 miss = pause, 2 consecutive = reset
- Day complete: 4 habits + check-in (hydration not required for complete, only score)
