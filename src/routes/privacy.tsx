import { createFileRoute, Link } from "@tanstack/react-router";
import { CONTACT_EMAIL } from "@/lib/contact";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — The Feel Good Challenge" },
      {
        name: "description",
        content:
          "How The Feel Good Society collects, uses, and protects your personal information during the 55-day challenge.",
      },
      { property: "og:title", content: "Privacy Policy — The Feel Good Challenge" },
      { property: "og:url", content: "/privacy" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        to="/"
        className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
      >
        ← Home
      </Link>
      <h1 className="mt-6 font-display italic text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="prose prose-sm mt-8 max-w-none text-foreground/90">
        <p>
          The Feel Good Society ("we", "us") runs the 55-day Feel Good Challenge. This
          policy explains what we collect and how we use it.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Account data:</strong> your email address, display name, and password
            (stored hashed, never in plain text).
          </li>
          <li>
            <strong>Challenge data:</strong> your daily habit check-ins, transformation
            wheel scores, personal "why" statement, vision board, and Future You letter.
          </li>
          <li>
            <strong>Optional media:</strong> weekly progress photos and vision board images
            you choose to upload. These are stored privately and never shared without your
            explicit permission.
          </li>
          <li>
            <strong>Testimonials:</strong> if you submit a review at Day 55, we store the
            text, rating, and display name you provide.
          </li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To power your dashboard, streaks, and Day-55 reveal.</li>
          <li>To moderate testimonials before they appear publicly.</li>
          <li>To send you challenge-related emails (welcome, milestones, reminders).</li>
          <li>To improve the challenge experience in aggregate.</li>
        </ul>

        <h2>Who can see your data</h2>
        <p>
          Only you can see your check-ins, photos, and letter. Testimonials are private by
          default and only appear publicly if you tick "permission to publish" AND an admin
          approves them. Approved public testimonials show your chosen display name only.
        </p>

        <h2>Your rights</h2>
        <p>
          You can request a copy or deletion of your data at any time by emailing us. We
          delete your account and all associated data within 30 days of request.
        </p>

        <h2>Security</h2>
        <p>
          Data is stored on managed infrastructure with row-level security so each user can
          only read their own private data. Passwords are hashed and checked against known
          breach databases before you can use them.
        </p>

        <h2>Cookies</h2>
        <p>
          We use a first-party session cookie to keep you signed in. We do not run
          third-party advertising or tracking cookies.
        </p>

        <h2>Contact</h2>
        <p>Questions? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> — we'll get back within 5 business days.</p>
      </div>
    </main>
  );
}
