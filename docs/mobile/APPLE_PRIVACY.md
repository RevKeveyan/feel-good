# Apple App Privacy — Nutrition Labels

Fill App Store Connect → App Privacy using this map.
Last reviewed: 24 August 2026.

Definitions: **Collected** = transmitted off device. **Linked** = tied to the user account. **Tracking** = Apple’s cross-app advertising tracking definition — **No** for the current build (no ATT, no ads SDKs, analytics stub only).

## Data collected

| Data type | Linked to user? | Used for tracking? | Purpose |
|-----------|-----------------|--------------------|---------|
| Email Address | Yes | No | App Functionality (Account) |
| Name | Yes | No | App Functionality (Account / profile) |
| User ID | Yes | No | App Functionality |
| Photos or Videos | Yes | No | App Functionality (vision board, weekly progress, avatar) |
| Other User Content | Yes | No | App Functionality (check-ins, letters, testimonials, notes) |
| Fitness | Yes | No | App Functionality (self-reported water, movement minutes/type, sleep quality) |
| Health | Yes | No | App Functionality (self-reported energy, mood, stress, motivation — habit tracking only; **not** HealthKit) |
| Device ID | Yes | No | App Functionality (Expo push token when reminders enabled) |
| Product Interaction | No (production) | No | Only if Sentry/PostHog later enabled — update this table first |
| Crash Data | No (production) | No | Only if Sentry later enabled — update this table first |

## Not collected

- Precise location
- Financial info / payment info (no IAP in current build)
- Contacts
- Browsing history
- Advertising data / advertising identifier
- HealthKit / motion & fitness OS APIs

## Privacy Policy URL

https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/privacy.html

## Support URL

https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/support.html

## Terms URL

https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/terms.html

## Account deletion

In-app: Settings → Delete account  
Also via email: hello@thefeelgoodsociety.com.au  
Deletes Auth user, challenge tables, device tokens, and private Storage objects (avatars, weekly-photos, vision-board).
