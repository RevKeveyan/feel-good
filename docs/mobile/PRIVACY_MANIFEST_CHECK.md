# PrivacyInfo / required-reason API checklist (post-EAS)

Managed Expo ships privacy manifests via `apps/mobile/app.json` → `ios.privacyManifests`.
There is no checked-in `PrivacyInfo.xcprivacy` file.

## Declared in app.json today

| API | Reason | Matches app usage? |
|-----|--------|--------------------|
| UserDefaults (`NSPrivacyAccessedAPICategoryUserDefaults`) | `CA92.1` | Yes — AsyncStorage offline queue + SecureStore session chunks / legacy migration |

## After each iOS production build

1. Download the IPA from EAS or open the build logs.
2. Confirm embedded `PrivacyInfo.xcprivacy` (app + third-party SDKs).
3. If Apple reports missing reasons for File Timestamp / Disk Space / System Boot / Active Keyboards:
   - Identify which SDK introduced the API
   - Upgrade the SDK or declare a **truthful** reason only if the app/SDK actually uses that API
   - Do **not** invent reasons to silence warnings
4. Record findings here for the build number:

| Build | Date | Extra APIs found | Action |
|-------|------|------------------|--------|
| | | | |

## Tracking

`NSPrivacyTracking` should remain false while no ATT / ads / cross-app tracking SDKs are present.
