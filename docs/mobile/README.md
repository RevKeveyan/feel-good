# Mobile Migration Docs

**Сначала простой гайд (без жаргона):** [PUBLISH_SIMPLE_RU.md](./PUBLISH_SIMPLE_RU.md) · [PLAY_SIMPLE_RU.md](./PLAY_SIMPLE_RU.md) · [IOS_SIMPLE_RU.md](./IOS_SIMPLE_RU.md)

**Публикация в сторы (полный):** [PUBLISH_RU.md](./PUBLISH_RU.md)

| Doc | Purpose |
|-----|---------|
| [PUBLISH_SIMPLE_RU.md](./PUBLISH_SIMPLE_RU.md) | Что есть / что нужно — простыми словами |
| [PLAY_SIMPLE_RU.md](./PLAY_SIMPLE_RU.md) | Google Play по шагам |
| [IOS_SIMPLE_RU.md](./IOS_SIMPLE_RU.md) | App Store / TestFlight по шагам |
| [VISUAL_QA_WEB_PARITY.md](./VISUAL_QA_WEB_PARITY.md) | Mobile = web visual 1:1 checklist |
| [SMTP_AND_EMAIL_RU.md](./SMTP_AND_EMAIL_RU.md) | SMTP + reset OTP email (код вместо ссылки) |
| [SCREEN_SPEC.md](./SCREEN_SPEC.md) | Screen-by-screen reference from web |
| [BUG_BACKLOG.md](./BUG_BACKLOG.md) | Known issues for parity |
| [NEW_SUPABASE_SETUP.md](./NEW_SUPABASE_SETUP.md) | Create/wire new Supabase + Google + full test checklist |
| [PREPUBLISH_STATUS.md](./PREPUBLISH_STATUS.md) | Live gate: smoke results, blockers, device QA scorecard |
| [PARITY_CHECKLIST.md](./PARITY_CHECKLIST.md) | QA checklist per release |
| [QA_RUNBOOK.md](./QA_RUNBOOK.md) | Device QA steps + SQL helpers |
| [HUMAN_STEPS.md](./HUMAN_STEPS.md) | Manual account steps before publish |
| [AUTH_NOTIFY_GUIDE.md](./AUTH_NOTIFY_GUIDE.md) | Email / Google / forgot-reset / notifications test |
| [email-templates/README.md](./email-templates/README.md) | Branded Supabase Confirm + Reset email HTML |
| [AUTH_SETUP.md](./AUTH_SETUP.md) | Supabase Google/Apple/deep links |
| [BACKEND_DEPLOY.md](./BACKEND_DEPLOY.md) | Migration + Edge Functions deploy |
| [EAS_BUILD.md](./EAS_BUILD.md) | EAS build / submit |
| [STORE_LISTING.md](./STORE_LISTING.md) | App Store / Play copy |
| [APPLE_PRIVACY.md](./APPLE_PRIVACY.md) | Apple privacy labels |
| [GOOGLE_DATA_SAFETY.md](./GOOGLE_DATA_SAFETY.md) | Play Data safety |
| [STORE_SUBMISSION.md](./STORE_SUBMISSION.md) | Store checklist |
| [SUBMIT_CHECKLIST.md](./SUBMIT_CHECKLIST.md) | End-to-end publish path |

Mobile app: [apps/mobile/README.md](../../apps/mobile/README.md)

Scripts:
- `scripts/deploy-backend.ps1`
- `scripts/apply-auth-email-templates.ps1`
- `scripts/publish-legal-pages.ps1` (Privacy/Terms HTML → Supabase Storage)
- `scripts/eas-build.ps1`
