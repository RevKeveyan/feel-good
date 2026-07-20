# Bug Backlog — Web Reference (Mobile Parity)

## P0 — Blockers

| ID | Area | Issue | Status |
|----|------|-------|--------|
| P0-1 | Auth | Lovable OAuth web-only | Fixed on mobile — Supabase OAuth in `lib/auth.ts` |
| P0-2 | API | createServerFn not callable from mobile | Fixed — Edge Functions under `supabase/functions/` |
| P0-3 | Stores | No account deletion | Fixed — Settings + `delete-account` function |

## P1 — High

| ID | Area | Issue | Status |
|----|------|-------|--------|
| P1-1 | Security | `.env` gitignore | Fixed in `.gitignore` |
| P1-2 | Admin | claimFirstAdmin | Not in mobile app |
| P1-3 | Complete | Day 55 reveal | Wired on mobile + vision gallery |
| P1-4 | Mindset | audio CDN | Env hook ready; needs CDN assets |

## P2 — Medium

| ID | Area | Issue |
|----|------|-------|
| P2-1 | Data | No offline queue on web |
| P2-2 | UX | Large route files mix UI + data access |
| P2-3 | QA | No automated E2E on web |
| P2-4 | Push | No daily reminders |

## P3 — Low

| ID | Area | Issue |
|----|------|-------|
| P3-1 | Analytics | No product analytics |
| P3-2 | Crash | No Sentry on web |
