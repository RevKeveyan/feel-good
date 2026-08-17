# Visual QA — Mobile = Web 1:1

Side-by-side checklist after the 1:1 design migration pass (code pass 2026-08-14).
Compare Expo Go at 390x844 vs web (`src/routes/*`) at the same viewport.

`[x]` = verified in code against the web source. `[ ]` = still needs an on-device look.

## Tokens

- [x] Page background cream `#EBE5DD`, cards pale pink `#F8EFEE`, text `#222222`
- [x] Accents: lime `#CCDA18`, mustard `#E1C340`, blush `#F2BDC2`
- [x] `radius["3xl"]` = 28 (web `rounded-3xl` = `calc(1rem + 12px)`)
- [x] `mutedForeground` `#5B5451` (web `oklch(0.45 0.01 40)`) on every subtitle and caption
- [x] Semantic groups in use everywhere: `borders`, `shadows`, `opacity`, `iconSizes`, `layout`, `space`
- [x] Alpha colors go through `withAlpha()` — no `color + "1A"` string concatenation left
- [x] Card chrome hairline (1px, ~5% black), thick border 2px only where web uses `border-2`

## Typography

- [x] Kickers: Raleway SemiBold, 10px, UPPERCASE, letter-spacing 1 (`tracking-widest`)
- [x] Titles: League Spartan italic; step title 36 / lh 45 / ls -0.9
- [x] Body: Open Sans; base 16 / lh 26, sm 14 / lh 22, quote 24 / lh 33
- [x] Stats (streak / journey / meta): League italic, not plain sans

## Screens

### Onboarding

- [x] Step background = solid tone + two blurred orbs (448 at `-160/-96`, 480 at `-160/-96` bottom-right), no welcome mesh
- [x] Screen padding 24 / top 40 + safe area / bottom 96, content max width 576
- [x] Progress: 8 segments, height 6, gap 6, gradient fill, empty track `foreground` 10%
- [x] Title 36/45, subtitle 16/26, nav row Back ghost + Continue `py-3.5`
- [x] `PromptField` gradient + focus state, lime border when filled
- [x] Goals grid 2 columns gap 8, active tile gradient + `shadow-md`, "Other" plain input
- [x] Commitment / wheel / done cards: paddings 32 / 24 / 32 with inner orbs
- [x] Vision grid gap 12, remove button 32 scrim, `VisionAddTile` dashed blush 50%
- [ ] Walk all 9 steps on device, check keyboard behavior on why / why-statement / letter

### Today

- [x] Quote card gradient + accent orb, quote 18
- [x] Streak / journey / score gradient cards with per-card `SoftOrb`
- [x] Score watermark «55» faint, ScoreRing 192 with lime → mustard → blush arc
- [x] Habit rows: open = primary ring 2px, done = hairline
- [x] Hydrate / check-in / weekly photo cards on card background + hairline
- [x] Move, picker and check-in modals: scrim 40% black, sheet max height 90%
- [ ] Day 55 CTA and missed-yesterday banner on device

### Mindset

- [x] Tracks grouped by category with group headers, like web
- [x] Category chips, track rows hairline, play button mustard / foreground / muted
- [x] Affirmation italic small, duration as kicker

### Complete

- [x] Locked state card, hero gradient card, stats row, rewheel scales, review input
- [ ] Reveal state against `preview.tsx` on device

### Auth / Reset

- [x] Kickers uppercase 10px, title 30 League italic, heading block margins 32 / 24
- [x] Inputs `rounded-2xl` card + hairline, 12px vertical padding
- [x] Google button border = `input`, divider spacing 24, switch text margin 24
- [ ] Soft gradient orbs on device

### Overview / Day / Settings / Legal

- [x] Same tokens as the rest (hairline, radius, kicker, `mutedForeground`), structure unchanged
- [x] Settings avatar soft primary tint + ring, danger block blush 50%
- [ ] Overview week grid cell states on device

## Known deltas from web

- Web `--destructive` is dusty rose `#DD9B9B`, which is not in the brand kit — blush `#F2BDC2` is used
  everywhere instead. In the progress bar and the done-step hero both outer stops collapse to blush, so those
  gradients read softer than on web.
- Full-screen background glows run 15% more opaque than web with a wider plateau and a slower tail, via
  `backgroundGlow` in [gradients.ts](../../apps/mobile/src/theme/gradients.ts). Brand kit hex values, gradient
  geometry and card decorations are untouched — cards keep the `falloff.glow` curve.
- Auth and reset background orbs are radial `SoftOrb`s rather than the earlier linear-gradient circles, which
  had a visible arc along the top edge. Colors, sizes and positions are unchanged. Web has no orbs here.
- The brand kit has no monospace family, so all kickers use Raleway SemiBold.
- Hydrate has a real completion state. Web draws a permanently static circle there even though `habitsComplete`
  counts hydration as the fifth habit, so on web the counter can read "5 of 5 done" while the row still looks
  untouched. Mobile fills the dot, strikes the title through and shows `+36 pts` once `water_ml` reaches the
  target, and tapping the dot fills water to the target. The stepper keeps the web behaviour.
- CSS `blur()` has no RN equivalent: orbs are SVG radial gradients whose stops approximate a 64px Gaussian blur.

## Not compared

- Admin / test-checklist (web shadcn language)
- Mobile-only flows (OTP reset UI, avatar upload) — chrome only

## Verification run 2026-08-14

- `npx tsc --noEmit` — clean
- `ReadLints` on `app/`, `components/`, `src/` — clean
- `npx expo export --platform ios --platform android` — bundles without errors

## Background boost check (device)

Screens with a gradient background are onboarding (9 tones) and auth / reset. Everything else sits on flat
`#EBE5DD`. On both platforms confirm:

- [ ] Colors read stronger, roughly 15%, on all 9 onboarding steps
- [ ] Middle neutral area still light and breathable, especially welcome, wheel and letter
- [ ] No visible circle edges or color banding, including the auth orbs
- [ ] Text contrast unchanged; cards, buttons and borders identical to before
