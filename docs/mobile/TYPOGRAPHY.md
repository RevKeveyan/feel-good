# Mobile typography (brand kit + web parity)

Source of truth for web brand-kit parts: [`src/styles.css`](../../src/styles.css).

| Role | Font | Component | Web equivalent |
|------|------|-----------|----------------|
| Display | League Spartan italic | `DisplayTitle` | `font-display italic` |
| Body | Open Sans | `Body` | `font-sans` |
| Kicker | Raleway uppercase | `Kicker` | brand kit (web still uses `font-mono`) |
| Label | Open Sans semibold | `Label` | `font-semibold text-sm` |
| Stat | Open Sans semibold | `StatValue` | numeric stats and counters |
| Wordmark | Playfair Display | `BrandWordmark` | mobile Auth only |

## DisplayTitle sizes

| Size | px | Typical use |
|------|-----|-------------|
| `sm` | 20 | Reveal CTA, quote text |
| `md` | 32 | Page titles, Auth |
| `lg` | 36 | Day 55 hero |
| `xl` | 48 | ScoreRing score, breathwork timer |

## Body sizes

| Size | px | Typical use |
|------|-----|-------------|
| `sm` | 12 | Captions, habit subtitles, quote author |
| `md` | 15 | Default body |
| `lg` | 18 | Emphasis paragraphs |

## StatValue sizes

| Size | px | Typical use |
|------|-----|-------------|
| `sm` | 18 | units, compact metrics |
| `md` | 24 | streak / journey values |
| `lg` | 28 | large counters |

## Files

- Tokens: [`apps/mobile/src/theme/typography.ts`](../../apps/mobile/src/theme/typography.ts)
- Components: [`apps/mobile/components/ui/Typography.tsx`](../../apps/mobile/components/ui/Typography.tsx)

Use `DisplayTitle`, `Kicker`, `Body`, `Label`, and `StatValue` instead of inline `fontFamily` in screens.
Use `StatValue` for numbers and counters to avoid clipped synthetic-italic digits.
