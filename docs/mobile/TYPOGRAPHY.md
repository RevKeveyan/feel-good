# Mobile typography (brand kit + web parity)

Brand book fonts: League Spartan, Raleway, Open Sans. Colours: `#E1C340` `#F8EFEE` `#EBE5DD` `#CCDA18` `#F2BDC2` `#FFFFFF` `#222222`.

Source of truth for sizes: web Tailwind classes in [`src/styles.css`](../../src/styles.css) + default Tailwind size scale.

| Role | Font | Component | Web equivalent |
|------|------|-----------|----------------|
| Display | League Spartan italic | `DisplayTitle` | `font-display italic` |
| Body | Open Sans | `Body` | `font-sans` |
| Heading | Raleway | available via `fonts.heading` | — |
| Kicker | System mono uppercase | `Kicker` | `font-mono text-[10px] tracking-widest` |
| Label | Open Sans semibold | `Label` | `font-semibold text-sm` |
| Stat | League Spartan italic | `StatValue` | streak / journey / large numbers |
| Wordmark | PNG (`tfgs-wordmark.png`) | `BrandWordmark` | mobile Auth only |

## Web → mobile size map

| Web class | px | Mobile token / role |
|-----------|-----|---------------------|
| `text-[10px]` | 10 | `typeScale.kicker` / `Kicker` |
| `text-xs` | 12 | `typeScale.bodySm` / `Body` `sm` |
| `text-sm` | 14 | `bodyMd`, `label`, `button`, `input` |
| `text-lg` | 18 | `bodyLg` / `Body` `lg` |
| `text-xl` | 20 | `displayXl` / `DisplayTitle` `sm` |
| `text-2xl` | 24 | `display2xl` / `StatValue` `md`–`lg` |
| `text-3xl` | 30 | `display3xl` / `DisplayTitle` `md` (Auth H1) |
| `text-4xl` | 36 | `display4xl` / `DisplayTitle` `lg` |
| `text-5xl` | 48 | `display5xl` / `DisplayTitle` `xl` |
| `text-6xl` | 60 | `display6xl` (Day 55 ring) |

## DisplayTitle sizes

| Size | px | Typical use |
|------|-----|-------------|
| `sm` | 20 | Section titles (`text-xl`) |
| `md` | 30 | Page H1, Auth (`text-3xl`) |
| `lg` | 36 | Large heroes (`text-4xl`) |
| `xl` | 48 | Score (`text-5xl`) |

## Body sizes

| Size | px | Typical use |
|------|-----|-------------|
| `sm` | 12 | Captions, switch links, forgot (`text-xs`) |
| `md` | 14 | Default body (`text-sm`) |
| `lg` | 18 | Quote, muted emphasis (`text-lg`) |

## Auth pass (1:1 vs web `/auth`)

| Element | Web | Mobile |
|---------|-----|--------|
| Kicker | mono 10 / tracking ~0.25em | `Kicker` + letterSpacing 2.5 |
| Title | `font-display text-3xl italic` | `DisplayTitle` `md` = 30 |
| Input / CTA | `text-sm` | 14 (`typeScale.input` / `button`) |
| Switch / forgot | `text-xs` | `Body` `sm` = 12 |
| Legal | mono 10 | `Kicker` |

## Files

- Tokens: [`apps/mobile/src/theme/typography.ts`](../../apps/mobile/src/theme/typography.ts)
- Components: [`apps/mobile/components/ui/Typography.tsx`](../../apps/mobile/components/ui/Typography.tsx)

Use `DisplayTitle`, `Kicker`, `Body`, `Label`, and `StatValue` instead of inline `fontFamily` in screens.
Use `StatValue` for numbers and counters to avoid clipped synthetic-italic digits.
