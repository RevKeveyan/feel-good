# Legal intake brief — The Feel Good Challenge

Source: existing `/terms`, `/privacy`, landing prize/FAQ copy, mobile store privacy docs, Supabase `delete-account`, `packages/shared/src/legal.ts`.

Status: draft inputs for counsel review. Fields marked **TO CONFIRM** were not found in the repo and use stated defaults.

## 1. Legal entity and contacts

| Field | Value |
|-------|-------|
| Trading / brand name | The Feel Good Society |
| Product name | The Feel Good Challenge |
| Legal entity name | **TO CONFIRM** (drafts use “The Feel Good Society”) |
| ABN / company number | **TO CONFIRM** |
| Registered address | **TO CONFIRM** |
| Support / privacy email | hello@thefeelgoodsociety.com.au |
| Privacy / data controller | Same entity as operator (**TO CONFIRM**) |
| Public URLs | https://thefeelgoodsociety.com.au/privacy , /terms |

## 2. Jurisdiction

| Field | Value |
|-------|-------|
| Primary market signal | Australia (`.com.au` domain and email) |
| Governing law (default) | Laws of Australia |
| Dispute venue (default) | Courts of New South Wales, Australia |
| GDPR / CCPA modules | Not added as primary; Australian Privacy Act framing. Cross-border hosting via Supabase noted. **TO CONFIRM** if EU/CA users need extra sections |

## 3. Age and audience

| Field | Value |
|-------|-------|
| Service minimum age (default) | 16 |
| Prize eligibility (default) | 18 |
| Parental consent accounts | Not offered (default) |
| Audience | Wellness / habit building; not a medical app |

## 4. Commerce and prize

| Field | Value |
|-------|-------|
| In-app payments today | None (no Stripe / IAP in codebase) |
| Paid features | Possible later; refunds described at checkout if introduced |
| Prize | AUD-implied **$5,000 Transformation Prize** |
| Judging criteria (landing) | Physical transformation; habit consistency; nutrition adherence; mindset growth; personal transformation story; community participation |
| Eligibility notes | Daily check-in required for that day’s score; miss a day → lose that day’s score eligibility but may continue; employees/family/contractors of The Feel Good Society ineligible |
| Prize Terms | Currently referenced as “separate Prize Terms on landing”; drafts fold core prize rules into Terms and keep landing summary consistent |
| Taxes on prize | Winner responsible (**TO CONFIRM**) |

## 5. Data practices (Privacy)

| Field | Value |
|-------|-------|
| Account | Email, display name, password (hashed), user ID |
| Auth providers | Email/password, Google OAuth, Apple Sign In |
| Challenge data | Daily habit check-ins, mood/energy/stress/motivation/sleep, notes, water, move type/minutes, transformation wheel, why statement, Future You letter, onboarding responses |
| Media | Weekly progress photos, vision board images (private Supabase Storage) |
| Testimonials | Rating, text, display name, publish permission; admin moderation |
| Device | Push notification tokens (`device_tokens`) |
| Web session | First-party session cookie |
| Not collected | HealthKit, precise location, contacts, financial info (per store docs) |
| Processors | Supabase (Auth, Postgres, Storage); Google/Apple for OAuth |
| Analytics | Sentry / PostHog prepared but not connected — drafts state “may enable crash/product analytics” |
| Advertising cookies | None |
| Marketing | Challenge-related transactional emails (welcome, milestones, reminders); no sale of personal data |
| Retention / deletion | In-app Delete account or email; associated data deleted (target within 30 days per current privacy); edge function deletes profile-linked rows then auth user |
| Response SLA | Privacy questions: within 5 business days (current privacy) |
| Medical disclaimer | Not medical, psychological, or nutritional advice |

## 6. Scope of drafts

| Field | Choice |
|-------|--------|
| Approach | Full rewrite drafts (expand thin current pages) |
| Language | English only (site language) |
| Platforms | Web + iOS + Android |
| Code update | Not applied yet — wait for confirmation before editing `src/routes/terms.tsx` / `privacy.tsx` |

## Open items for operator

1. Legal entity full name, ABN, registered address.
2. Confirm NSW / Australia governing law and venue.
3. Confirm ages 16 (service) / 18 (prize).
4. Confirm prize currency (AUD), number of winners, and payout method.
5. Confirm whether challenge-related marketing push/email beyond transactional is used.
6. Confirm if analytics will launch with the mobile apps.
