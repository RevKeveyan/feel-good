# Store Submission Checklist

Full path: [SUBMIT_CHECKLIST.md](./SUBMIT_CHECKLIST.md)

## Apple App Store

- [ ] Apple Developer Program ($99/year)
- [ ] App Store Connect app record
- [ ] Bundle ID: `com.feelgoodsociety.challenge`
- [ ] Age rating **16+** (must match Terms; never 4+)
- [ ] Screenshots per [SCREENSHOTS.md](./SCREENSHOTS.md)
- [ ] Privacy Policy URL: `…/legal/privacy.html` (see STORE_LISTING.md)
- [ ] Terms URL: `…/legal/terms.html`
- [ ] Support URL: `https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/support.html`
- [ ] App Privacy nutrition labels — [APPLE_PRIVACY.md](./APPLE_PRIVACY.md) (include Fitness + Health self-reported)
- [ ] Review Information: demo email + password from provision script (never in git)
- [ ] Review Notes: copy from [STORE_LISTING.md](./STORE_LISTING.md) / [REVIEW_ACCOUNT.md](./REVIEW_ACCOUNT.md)
- [ ] Screenshots: 6.7", 6.5", 5.5" iPhone
- [ ] TestFlight build **1.1.2** installed; Apple Sign-In on physical iPhone
- [ ] PrivacyInfo.xcprivacy checked per [PRIVACY_MANIFEST_CHECK.md](./PRIVACY_MANIFEST_CHECK.md)
- [x] Demo / Review account provisioned in production (`appstore.review@…`)
- [x] Account deletion in Settings (Storage purge included)

## Connect fill order (after IPA)

1. App Privacy answers from APPLE_PRIVACY.md  
2. Support URL (support.html above)  
3. Review Information username/password + Review Notes  
4. Upload screenshots  
5. Submit for review when TestFlight smoke + Apple Sign-In pass  


## Google Play

- [ ] Google Play Console ($25 one-time)
- [ ] Package: `com.feelgoodsociety.challenge`
- [ ] Data safety form — [GOOGLE_DATA_SAFETY.md](./GOOGLE_DATA_SAFETY.md)
- [ ] Content rating questionnaire
- [ ] Store listing + screenshots — [STORE_LISTING.md](./STORE_LISTING.md)
- [ ] Internal testing track → production
- [ ] Service account JSON for EAS Submit

## Pre-submit QA

- [ ] Run Maestro flows in `.maestro/`
- [ ] Parity checklist — [QA_RUNBOOK.md](./QA_RUNBOOK.md)
- [ ] Push notifications on physical device
- [ ] OAuth Google + Apple on real devices
- [ ] Offline queue sync after reconnect

## Support

- Email: hello@thefeelgoodsociety.com.au
- In-app: Settings → Contact support
