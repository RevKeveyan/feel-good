export type LegalSection = {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocument = {
  title: string;
  lastUpdated: string;
  intro: string[];
  sections: LegalSection[];
};

export const LEGAL_LAST_UPDATED = "24 July 2026";

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  lastUpdated: LEGAL_LAST_UPDATED,
  intro: [
    'The Feel Good Society ("we", "us", "our") operates the 55-day Feel Good Challenge on thefeelgoodsociety.com.au and related iOS/Android apps (the "Service"). This Privacy Policy explains what personal information we collect, how we use it, who can access it, and the choices you have.',
    "The Service is a wellness and habit-building program. It is not a medical service.",
    "We handle personal information in line with the Australian Privacy Act 1988 (Cth) and the Australian Privacy Principles where they apply. If you are outside Australia, your information may still be processed in Australia or in other countries where our service providers operate.",
  ],
  sections: [
    {
      heading: "1. Personal information we collect",
      paragraphs: ["Account and authentication:"],
      bullets: [
        "Email address",
        "Display name (optional / profile)",
        "Password (stored hashed; never stored in plain text)",
        "User ID",
        "Sign-in via Google or Apple when you choose those options (we receive identifiers and profile details those providers share with us for authentication)",
      ],
    },
    {
      paragraphs: ["Challenge and onboarding data:"],
      bullets: [
        "Daily habit check-ins and related fields (for example water intake, movement type/minutes, notes)",
        "Self-reported wellbeing metrics you choose to log (such as energy, mood, stress, motivation, sleep)",
        "Transformation wheel scores and related onboarding answers",
        'Your "why" statement, commitment details, and Future You letter',
        "Struggle / support moments you log in-app",
      ],
    },
    {
      paragraphs: [
        "Media (optional): weekly progress photos and vision board images. These files are stored in private storage and are not published without your explicit permission.",
        "Testimonials: if you submit a review (for example at Day 55), we store the text, rating, display name, and whether you grant permission to publish. Testimonials remain private until you grant publish permission and an admin approves them. Public testimonials show your chosen display name only.",
        "Device and technical data: push notification device tokens (mobile), a first-party session cookie on the website to keep you signed in, and basic technical logs needed to operate and secure the Service (for example IP address in server logs).",
        "What we do not collect (current product): we do not use HealthKit or similar OS health APIs. We do not collect precise location, contacts, or financial account details through the Service. We do not run third-party advertising cookies.",
      ],
    },
    {
      heading: "2. How we use personal information",
      paragraphs: ["We use personal information to:"],
      bullets: [
        "create and secure your account;",
        "power your dashboard, streaks, check-ins, and Day-55 reveal;",
        "personalise challenge flows and onboarding;",
        "moderate testimonials before any public display;",
        "send challenge-related transactional emails (welcome, milestones, reminders, security/account notices);",
        "send push notifications you enable;",
        "operate, maintain, debug, and improve the Service in aggregate;",
        "detect abuse, enforce our Terms, and protect users and our systems; and",
        "comply with law and respond to lawful requests.",
      ],
    },
    {
      paragraphs: ["We do not sell your personal information."],
    },
    {
      heading: "3. Legal bases / grounds (where relevant)",
      paragraphs: [
        "Where a legal basis framework applies, we rely on one or more of: performing our contract with you (providing the Service); our legitimate interests in operating a secure wellness product; your consent (for example optional photo uploads, publish permission for testimonials, optional notifications); and legal obligations.",
      ],
    },
    {
      heading: "4. Who can see your data",
      bullets: [
        "You can access your check-ins, private photos, letters, and profile data through the Service.",
        "Our administrators may access content needed for moderation (especially testimonials) and support, under access controls.",
        "Other users / the public see only content you explicitly allow to be published (for example an approved testimonial with publish permission). Private challenge data and private media are not shown publicly by default.",
      ],
    },
    {
      heading: "5. Service providers and sharing",
      paragraphs: [
        "We share personal information with processors who help us run the Service, under contractual and security obligations, including:",
      ],
      bullets: [
        "Supabase — authentication, database, and file storage;",
        "Google and/or Apple — if you use their sign-in;",
        "infrastructure and email delivery providers we engage to operate the Service.",
      ],
    },
    {
      paragraphs: [
        "We may disclose information if required by law, to protect rights and safety, or in connection with a business transfer (merger, acquisition, or asset sale), subject to appropriate safeguards.",
        "We do not share personal information with third parties for their own advertising.",
        "Crash reporting or product analytics tools (for example Sentry or PostHog) may be enabled to improve reliability and usability. If enabled, they may process device/app interaction or crash data linked to your account or device. We will update store privacy questionnaires and this Policy as needed when those tools go live.",
      ],
    },
    {
      heading: "6. Cookies and similar technologies",
      paragraphs: [
        "On the website we use a first-party session cookie to keep you signed in. We do not use third-party advertising or tracking cookies in the current Service.",
        "Mobile apps may store local session tokens and push tokens as needed for functionality.",
      ],
    },
    {
      heading: "7. International transfers",
      paragraphs: [
        "Our primary brand and operations are associated with Australia. Service providers (including cloud hosts) may process data in Australia and other countries. Where required, we take steps designed to protect personal information transferred internationally.",
      ],
    },
    {
      heading: "8. Retention",
      paragraphs: [
        "We keep personal information while your account is active and as needed to provide the Service.",
        "When you delete your account in Settings, or request deletion by email, we delete your account and associated personal data from our primary systems within 30 days, except where we must retain limited information for legal, security, dispute, or accounting reasons (for example records of a prize payout or abuse investigation).",
        "Account deletion removes linked challenge data, private media records, device tokens, and profile data via our deletion process, then deletes the authentication user.",
      ],
    },
    {
      heading: "9. Your rights and choices",
      paragraphs: ["Subject to applicable law, you may:"],
      bullets: [
        "access a copy of personal information we hold about you;",
        "correct inaccurate information;",
        "delete your account and request deletion of associated data;",
        "withdraw consent where processing is based on consent (for example revoke publish permission for future use, disable notifications);",
        "complain to the Office of the Australian Information Commissioner (OAIC) or another competent authority.",
      ],
    },
    {
      paragraphs: [
        "How to exercise rights: in-app Settings → Delete account (where available), or email hello@thefeelgoodsociety.com.au.",
        "We aim to respond to privacy questions within 5 business days and to complete deletion requests within 30 days of a verified request.",
      ],
    },
    {
      heading: "10. Security",
      paragraphs: [
        "We use managed infrastructure with access controls, including row-level security so users can only read their own private data under normal operation. Passwords are hashed. Data is transmitted over HTTPS/TLS. No method of transmission or storage is completely secure; we work to protect information using appropriate technical and organisational measures.",
      ],
    },
    {
      heading: "11. Children",
      paragraphs: [
        "The Service is not directed to children under 16. We do not knowingly collect personal information from children under 16. If you believe a child has provided personal information, contact us and we will take appropriate steps to delete it.",
        "Prize participation requires age 18 or older under our Terms.",
      ],
    },
    {
      heading: "12. Health-related notes",
      paragraphs: [
        "Self-reported mood, sleep, energy, and similar fields are provided by you for habit tracking only. We do not provide medical diagnosis or treatment. Do not use the Service as a substitute for professional care. In an emergency, contact local emergency services.",
      ],
    },
    {
      heading: "13. Changes to this Policy",
      paragraphs: [
        'We may update this Privacy Policy. We will post the updated version on the Service and change the "Last updated" date. Material changes will be communicated on the site and, where reasonably practicable, by email.',
      ],
    },
    {
      heading: "14. Contact",
      paragraphs: [
        "Privacy questions and requests: hello@thefeelgoodsociety.com.au.",
        "For registered business details (ABN and postal address), contact us at the same email. Trading as The Feel Good Society.",
      ],
    },
  ],
};

export const termsOfService: LegalDocument = {
  title: "Terms of Service",
  lastUpdated: LEGAL_LAST_UPDATED,
  intro: [
    'The Feel Good Society ("we", "us", "our") operates The Feel Good Challenge on the website at thefeelgoodsociety.com.au and related iOS/Android apps (the "Service").',
    'By creating an account, accessing, or using the Service, you agree to these Terms of Service ("Terms") and our Privacy Policy. If you do not agree, do not use the Service.',
  ],
  sections: [
    {
      heading: "1. Agreement",
      paragraphs: [
        "We may update these Terms from time to time. Material changes will be announced on the Service and, where reasonably practicable, by email at least 14 days before they take effect. Continued use after the effective date constitutes acceptance of the updated Terms.",
      ],
    },
    {
      heading: "2. Who may use the Service",
      paragraphs: [
        "You must be at least 16 years old to create an account and use the Service.",
        "To be eligible for the Transformation Prize described in Section 8, you must be at least 18 years old and meet the additional eligibility rules in that section.",
        "You represent that the information you provide is accurate and that you have authority to accept these Terms.",
      ],
    },
    {
      heading: "3. Not medical advice",
      paragraphs: [
        "The Feel Good Challenge is a wellness and habit-building program. It is not medical, psychological, dietary, or nutritional advice, diagnosis, or treatment.",
        "Always consult a qualified healthcare professional before changing your diet, exercise, supplements, sleep practices, or medication. You use the Service and any recommendations or content at your own risk. If you have a medical condition, are pregnant, or take medication, seek professional advice before participating.",
      ],
    },
    {
      heading: "4. Accounts and security",
      paragraphs: [
        "You may register with email and password or via supported third-party sign-in (such as Google or Apple).",
        "You are responsible for keeping your credentials and device access secure; all activity under your account; and notifying us promptly at hello@thefeelgoodsociety.com.au if you suspect unauthorised use.",
        "We may suspend or terminate accounts that violate these Terms, create risk to other users or the Service, or appear fraudulent or abusive.",
      ],
    },
    {
      heading: "5. The Challenge",
      paragraphs: [
        "The Service provides tools for a 55-day habit challenge built around daily practices (including nourishment, fuel/supplements as you choose, movement, mindset, and hydration), progress tracking, onboarding exercises, optional media uploads, and related features.",
        "Daily tracking rules for challenge scoring and prize eligibility are described in Section 8 and on the challenge landing page. Missing a day may affect that day's score eligibility while still allowing you to continue the program.",
        "Features may change as we improve the Service. We do not guarantee uninterrupted availability.",
      ],
    },
    {
      heading: "6. Your content",
      paragraphs: [
        '"User Content" means anything you submit, upload, or create in the Service, including check-ins, notes, letters, photos, vision-board images, testimonials, and profile information.',
        "You retain ownership of your User Content. You grant us a worldwide, non-exclusive, royalty-free licence to host, store, process, display, and use User Content as needed to operate and improve the Service and as otherwise described in the Privacy Policy.",
        "Testimonials. If you submit a testimonial and grant permission to publish, you also grant us a worldwide, royalty-free, perpetual licence to display that testimonial (and your chosen display name) on our marketing pages and related materials, subject to our moderation. We may decline, edit for length/clarity, or remove testimonials.",
        "Photos and private media. Progress photos and vision-board images are private by default and are not published without your explicit permission (for example, via a testimonial publish permission or another clear consent mechanism we provide).",
        "You represent that you have all rights needed to submit User Content and that it does not infringe others' rights or violate law.",
      ],
    },
    {
      heading: "7. Acceptable use",
      paragraphs: ["You agree not to:"],
      bullets: [
        "harass, threaten, or abuse others, or post hate speech, spam, or illegal content;",
        "impersonate any person or misrepresent your identity or progress;",
        "attempt to gain unauthorised access to the Service, other accounts, or our systems;",
        "scrape, reverse engineer, or interfere with the Service except as allowed by law;",
        "use the Service to distribute malware or conduct fraud; or",
        "upload content you do not have the right to share.",
      ],
    },
    {
      paragraphs: ["We may remove content or suspend accounts that break these rules."],
    },
    {
      heading: "8. Transformation Prize",
      paragraphs: [
        "We may offer a $5,000 Transformation Prize (or another prize amount we announce) in connection with the Challenge. Prize currency is Australian dollars (AUD) unless we state otherwise.",
        "Eligibility — unless we publish different Prize Terms for a specific cohort:",
      ],
      bullets: [
        "you must be 18 or older;",
        "you must create an account and participate in the Challenge through the Service;",
        "you must complete daily check-ins as required for scoring (a missed day loses eligibility for that day's score, but you may continue);",
        "employees, contractors, and immediate family members of The Feel Good Society are not eligible; and",
        "we may require proof of identity and eligibility before payout.",
      ],
    },
    {
      paragraphs: [
        "Judging: winners are selected by a panel based on overall transformation, not weight loss alone. Criteria may include physical transformation; habit consistency; nutrition adherence; mindset growth; personal transformation story; and community participation. Judging decisions are final to the extent permitted by law.",
        "Additional or cohort-specific Prize Terms may be published on the challenge landing page. If those Prize Terms conflict with this Section 8, the Prize Terms on the landing page for that cohort control for prize matters only.",
        "Winners are responsible for any taxes arising from receipt of a prize, unless applicable law requires otherwise. We may withhold or report amounts where required by law. Void where prohibited.",
      ],
    },
    {
      heading: "9. Fees, cancellation, and refunds",
      paragraphs: [
        "Access to the core Challenge features may be free. If we introduce paid features, subscriptions, or in-app purchases, the applicable price, billing terms, and refund policy will be presented at checkout or in the relevant store listing before you pay.",
        "You may cancel and delete your account at any time from Settings (or by emailing us). Deletion does not automatically entitle you to a refund for any paid fees already charged, except as required by law or stated at checkout.",
      ],
    },
    {
      heading: "10. Intellectual property",
      paragraphs: [
        "The Service, including branding, design, text, and software (excluding User Content), is owned by us or our licensors. You may not copy, modify, distribute, or create derivative works from our materials except as expressly allowed.",
      ],
    },
    {
      heading: "11. Third-party services",
      paragraphs: [
        "The Service relies on third parties such as hosting, authentication, and sign-in providers (including Supabase and, where you choose, Google or Apple). Their terms and privacy policies apply to their processing. We are not responsible for third-party services outside our reasonable control.",
      ],
    },
    {
      heading: "12. Disclaimers",
      paragraphs: [
        'To the maximum extent permitted by law, the Service is provided "as is" and "as available" without warranties of any kind, whether express or implied, including fitness for a particular purpose, merchantability, and non-infringement.',
        "We do not warrant that the Service will be uninterrupted, error-free, or that participation will achieve any specific health, fitness, or life outcome.",
      ],
    },
    {
      heading: "13. Limitation of liability",
      paragraphs: [
        "To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, goodwill, or opportunity, arising from your use of the Service.",
        "Our total aggregate liability arising out of or relating to the Service or these Terms is limited to the greater of (a) AUD $100 or (b) the amounts you paid us for the Service in the 12 months before the claim.",
        "Nothing in these Terms excludes or limits liability that cannot be excluded or limited under Australian Consumer Law or other applicable law.",
      ],
    },
    {
      heading: "14. Indemnity",
      paragraphs: [
        "You agree to indemnify and hold us harmless from claims, damages, losses, and expenses (including reasonable legal fees) arising from your User Content, your misuse of the Service, or your breach of these Terms, to the extent permitted by law.",
      ],
    },
    {
      heading: "15. Termination",
      paragraphs: [
        "You may stop using the Service and delete your account at any time. We may suspend or terminate access if you breach these Terms or if we discontinue the Service. Provisions that by nature should survive (including ownership, licences already granted for published testimonials, disclaimers, liability limits, and governing law) survive termination.",
      ],
    },
    {
      heading: "16. Governing law and disputes",
      paragraphs: [
        "These Terms are governed by the laws of Australia. Subject to any non-excludable consumer rights, courts located in New South Wales, Australia have non-exclusive jurisdiction over disputes arising from these Terms or the Service.",
      ],
    },
    {
      heading: "17. Contact",
      paragraphs: [
        "Questions about these Terms: hello@thefeelgoodsociety.com.au.",
        "For registered business details (ABN and postal address), contact us at the same email. Trading as The Feel Good Society.",
      ],
    },
  ],
};

export const storePrivacySummary = {
  dataCollected:
    "email, name, user ID, photos you upload, challenge content you enter, push token",
  uses: "account, app functionality, customer support; optional analytics if enabled",
  sharing: "service providers (hosting/auth); not sold; not used for third-party ads",
  deletion: "Settings → Delete account, or email hello@thefeelgoodsociety.com.au",
  fullPolicyUrl:
    "https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/privacy.html",
} as const;
