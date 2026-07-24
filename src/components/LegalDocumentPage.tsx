import { Link } from "@tanstack/react-router";
import type { LegalDocument } from "@feelgood/shared";
import { CONTACT_EMAIL } from "@/lib/contact";

export function LegalDocumentPage({ doc }: { doc: LegalDocument }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        to="/"
        className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
      >
        ← Home
      </Link>
      <h1 className="mt-6 font-display italic text-4xl">{doc.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {doc.lastUpdated}</p>

      <div className="prose prose-sm mt-8 max-w-none text-foreground/90">
        {doc.intro.map((p, i) => (
          <p key={`intro-${i}`}>{p}</p>
        ))}
        {doc.sections.map((section, i) => (
          <section key={section.heading ?? `section-${i}`}>
            {section.heading ? <h2>{section.heading}</h2> : null}
            {section.paragraphs?.map((p, pi) => (
              <p key={`p-${i}-${pi}`}>{p}</p>
            ))}
            {section.bullets && section.bullets.length > 0 ? (
              <ul>
                {section.bullets.map((b, bi) => (
                  <li key={`b-${i}-${bi}`}>{b}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
        <p>
          Questions? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </div>
    </main>
  );
}
