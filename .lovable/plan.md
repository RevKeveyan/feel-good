## Phase 2 — Onboarding + Safety Net

### What we're building

**1. Full onboarding flow** (new users routed here before Day 1)
An 8-step guided experience at `/onboarding`, gated so users can't skip into the challenge until it's done:

1. **Welcome** — brand moment, "This is your commitment…" copy, single Begin button.
2. **Why are you here?** — 4 short-answer prompts (what made you join, what to change, how you want to feel, what success looks like).
3. **Choose your goals** — multi-select from the 10 goals you listed (lose weight, energy, gut, stress, muscle, hormones, confidence, sleep, healthy habits, other).
4. **Personal commitment** — the pledge sentence, typed name, Agree button. Stored as a signed commitment with timestamp.
5. **Transformation Wheel (Day 1)** — 9 sliders (energy, confidence, mood, stress, digestion, fitness, motivation, consistency, overall health), 1–10 each. Rendered as a radar chart preview so it feels real. Repeats on Day 55 for the "before vs after" reveal.
6. **Why Statement** — one longer free-text field, "Why does this matter?" Shown back to the user on Day 55.
7. **Vision Board** — upload up to 8 images (private storage bucket), optional caption per image.
8. **Future You letter** — long free-text letter to themselves. Locked until Day 55, then revealed with a "read your letter" moment.

Each step: progress dots, Back/Next, autosave on Next, editorial serif headings consistent with the landing page.

**2. Streak protection**
Replace the current hard "streak resets on any miss" with a gentle model:
- Missed day → streak pauses (not reset). Home shows a soft banner: *"You missed yesterday. Complete today's challenge to continue your transformation."*
- Completing today resumes the streak from where it paused (paused days don't count toward the streak total but don't wipe it).
- Two consecutive misses → streak resets, but framed as a fresh chapter, not a failure.

**3. Emergency "I'm struggling today" button**
Persistent small button on the daily dashboard. Opens a support sheet with 5 quick actions:
- 1-minute breathwork (guided box breathing animation)
- A tiny task ("drink one glass of water right now")
- A mindset reframe (rotating library of ~15 short prompts)
- A motivational quote
- Link to community (placeholder until community ships)
Tapping any option logs it so we can later show *"you leaned in on 4 hard days — that's strength."*

### Data model (one migration)

New tables under Lovable Cloud:
- `onboarding_responses` — one row per user: goals (text[]), why_joined, why_change, want_to_feel, success_looks_like, why_statement, future_letter, commitment_name, commitment_signed_at, completed_at.
- `transformation_wheel` — user_id, phase (`day_1` | `day_55`), 9 integer scores, taken_at. Unique on (user_id, phase).
- `vision_board_items` — user_id, storage_path, caption, sort_order.
- `struggle_moments` — user_id, entry_date, action_taken (breathwork/tiny_task/reframe/quote/community), created_at. Used for streak-protection empathy stats.

Plus a new private storage bucket `vision-board` with owner-only RLS.

`profiles` gains `onboarding_completed_at` so we can gate.

### Routing & gating

- New public-ish (auth-required but pre-challenge) route `/_authenticated/onboarding` with sub-steps via a `step` search param — one file, stepper state, no route tree explosion.
- `_authenticated/route.tsx` (integration-managed — untouched) already ensures a session. Inside `today.tsx` loader, if `profiles.onboarding_completed_at` is null → redirect to `/onboarding`.
- After step 8 → set `onboarding_completed_at` and redirect to `/today`.

### UX principles applied

- No skip on onboarding — it's the emotional foundation. But every step allows Back.
- Autosave per step so users can quit and resume exactly where they were.
- Vision Board and Future You letter are private — copy makes that explicit.
- Streak protection copy is warm, never shaming. Emergency button is discoverable but not attention-grabbing (soft ghost pill in dashboard corner).

### What's NOT in this phase (queued for later)

AI Health Coach, weekly AI review, Personal Insights, Health Timeline, Success Wall, Transformation Report, Life After 55, My Health hub. These are the other three pillars from your list — we'll pick the next one once this ships.

### Technical notes

- Radar chart: `recharts` (already Apple-clean, no extra dep footprint concerns; will confirm before install).
- All onboarding writes go through `createServerFn` with `requireSupabaseAuth` — same pattern as existing weekly photo uploads.
- Onboarding page reuses the landing page's typography tokens (`font-display` serif headings, warm neutrals) so it feels continuous with the marketing surface.
- One database migration, presented for your approval first, then the UI ships.

Ready to build once you approve — I'll start with the migration.