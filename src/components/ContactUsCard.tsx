import { WhatsAppGlyph } from "@/components/WhatsAppContact";
import { EMAIL_LINK, WHATSAPP_LINK } from "@/lib/contact";

export function ContactUsCard({ className = "px-6 mt-12" }: { className?: string }) {
  return (
    <section className={className}>
      <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/5 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Here to help
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Have a question, feeling stuck or have a win to share? We'd love to hear from you.
        </p>
        <div className="mt-5 flex flex-col items-center gap-3">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-background transition hover:opacity-90"
          >
            <WhatsAppGlyph className="size-4" />
            Message us
          </a>
          <a
            href={EMAIL_LINK}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3.5 text-xs font-semibold uppercase tracking-widest transition hover:border-foreground/30"
          >
            Email us
          </a>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          We reply between 9am and 5pm AEST, usually within 12-24 hours.
        </p>
      </div>
    </section>
  );
}
