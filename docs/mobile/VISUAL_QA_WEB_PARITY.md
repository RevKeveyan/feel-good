# Visual QA — Mobile = Web 1:1

Side-by-side checklist after design parity pass. Compare Expo Go vs web (`src/routes/*`).

## Tokens

- [ ] Page background cream `#EBE5DD`
- [ ] Cards pale pink `#F8EFEE`
- [ ] Primary / text `#222222`
- [ ] Accents: lime `#CCDA18`, mustard `#E1C340`, blush `#F2BDC2`, rose `#DD9B9B`
- [ ] Card chrome hairline ~5% black (not heavy 10% box)

## Typography

- [ ] Kickers: mono, 10px, UPPERCASE, wide tracking
- [ ] Titles: League Spartan italic
- [ ] Body: Open Sans
- [ ] Stats (streak / journey / meta): League italic (not plain sans)

## Screens

### Auth / Reset
- [ ] Soft gradient orbs (soft, not hard circles)
- [ ] Inputs `rounded-2xl` card + hairline
- [ ] Black pill CTA
- [ ] Kickers uppercase

### Today
- [ ] Quote / streak / journey / score gradient cards
- [ ] Streak ring tint rose; journey tint lime
- [ ] Score watermark «55» faint
- [ ] Habit open: stronger primary ring; done: hairline
- [ ] Today/Mindset toggle: mono uppercase pills

### Onboarding
- [ ] StepTone only (no SoftOrbs on top)
- [ ] Soft large glows per step
- [ ] PromptField hairline / lime when filled
- [ ] Goal chips hairline

### Mindset
- [ ] Category chips + track rows hairline
- [ ] Play mustard; day labels uppercase mono
- [ ] Affirmation italic small

### Complete / Settings
- [ ] BrandCard hairline
- [ ] Inputs / scales hairline
- [ ] Settings avatar soft primary tint + ring

## Not compared

- Admin / test-checklist (web shadcn language)
- Mobile-only flows (OTP reset UI, avatar upload) — chrome only
