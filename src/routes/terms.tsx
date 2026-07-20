import { createFileRoute, Link } from "@tanstack/react-router";
import { CONTACT_EMAIL } from "@/lib/contact";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — The Feel Good Challenge" },
      {
        name: "description",
        content:
          "The rules of participation, prize eligibility, and user conduct for The Feel Good Society's 55-day challenge.",
      },
      { property: "og:title", content: "Terms of Service — The Feel Good Challenge" },
      { property: "og:url", content: "/terms" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        to="/"
        className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
      >
        ← Home
      </Link>
      <h1 className="mt-6 font-display italic text-4xl">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="prose prose-sm mt-8 max-w-none text-foreground/90">
        <p>
          By creating an account or joining The Feel Good Challenge you agree to these
          terms. If you don't agree, please don't use the service.
        </p>

        <h2>Not medical advice</h2>
        <p>
          The Feel Good Challenge is a wellness and habit-building program. It is NOT
          medical, psychological, or nutritional advice. Consult a qualified professional
          before making changes to your diet, exercise, or medication.
        </p>

        <h2>Your account</h2>
        <p>
          You are responsible for keeping your password safe and for everything that
          happens under your account. Tell us immediately if you suspect unauthorized use.
        </p>

        <h2>Content you submit</h2>
        <p>
          You keep ownership of everything you write, photograph, or upload. By submitting
          a testimonial and ticking "permission to publish", you grant us a worldwide,
          royalty-free licence to display it on our marketing pages under your chosen
          display name.
        </p>

        <h2>Acceptable use</h2>
        <ul>
          <li>No harassment, hate speech, spam, or illegal content.</li>
          <li>No impersonating another person or misrepresenting your progress.</li>
          <li>We may remove content or suspend accounts that break these rules.</li>
        </ul>

        <h2>Transformation Prize</h2>
        <p>
          Prize eligibility, judging, and payout are governed by the separate Prize Terms
          published on the challenge landing page. Employees, family members, and
          contractors of The Feel Good Society are not eligible.
        </p>

        <h2>Refunds & cancellation</h2>
        <p>
          You can cancel your account at any time from the settings page. Refund policy
          for any paid features is described at checkout.
        </p>

        <h2>Liability</h2>
        <p>
          To the maximum extent permitted by law, we are not liable for indirect or
          consequential damages arising from your use of the service.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms. Material changes will be announced on the site and by
          email at least 14 days before they take effect.
        </p>

        <h2>Contact</h2>
        <p>Questions? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      </div>
    </main>
  );
}
