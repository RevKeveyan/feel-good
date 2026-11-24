import { ClipboardCheck, ClipboardList, FileText, Stethoscope, ArrowUpRight } from "lucide-react";
import { CLINIC_CHECK_IN_FORM_URL, CLINIC_INTAKE_FORM_URL } from "@/lib/clinic";
import { Button } from "@/components/ui/button";
import { ContactUsCard } from "@/components/ContactUsCard";

function DocButton({ href, title, sub }: { href?: string | null; title: string; sub: string }) {
  const ready = Boolean(href);
  const inner = (
    <>
      <span className="size-11 shrink-0 rounded-full bg-primary flex items-center justify-center">
        <FileText className="size-5 text-primary-foreground" />
      </span>
      <span className="flex-1 min-w-0 text-left">
        <span className="block font-semibold text-sm">{title}</span>
        <span className="block text-xs text-muted-foreground">{ready ? sub : "Not uploaded yet"}</span>
      </span>
      {ready && <ArrowUpRight className="size-4 text-muted-foreground" />}
    </>
  );
  const cls = "w-full flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 transition";
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${cls} hover:ring-primary/50`}>
      {inner}
    </a>
  ) : (
    <div aria-disabled className={cls}>{inner}</div>
  );
}

export function ClinicView({
  pathologyUrl,
  treatmentPlanUrl,
  personalisedPodUrl,
}: {
  pathologyUrl?: string | null;
  treatmentPlanUrl?: string | null;
  personalisedPodUrl?: string | null;
}) {
  const intakeReady = CLINIC_INTAKE_FORM_URL.length > 0;
  const checkInReady = CLINIC_CHECK_IN_FORM_URL.length > 0;
  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary">The Feel Good Society</p>
        <h1 className="font-display text-3xl italic tracking-tight mt-1">Clinic Clients</h1>
        <p className="text-sm text-muted-foreground mt-1">Your health forms, results, treatment plan and personalised product details all in one place.</p>
      </div>

      <div className="rounded-3xl bg-foreground text-background p-5">
        <div className="flex items-center gap-2">
          <Stethoscope className="size-4 text-primary" />
          <p className="font-mono text-[10px] uppercase tracking-widest">Start here</p>
        </div>
        <p className="font-semibold mt-2">Complete your intake form</p>
        <p className="text-xs text-background/70 mt-1">Tell us about your health history, current concerns and goals so we can set good foundations now.</p>
        {intakeReady ? (
          <a
            href={CLINIC_INTAKE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-widest"
          >
            <ClipboardList className="size-4" /> Intake form
          </a>
        ) : (
          <Button disabled className="mt-4 h-auto rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-100">
            <ClipboardList className="size-4" /> Intake form, coming soon
          </Button>
        )}
      </div>


      <div className="space-y-3">
        <DocButton href={pathologyUrl} title="Latest pathology report" sub="Open PDF" />
        <DocButton href={treatmentPlanUrl} title="Treatment plan" sub="Open PDF" />
        <DocButton href={personalisedPodUrl} title="Personalised supplement details" sub="Open PDF" />
      </div>

      <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="flex items-center gap-4">
          <span className="size-11 shrink-0 rounded-full bg-primary flex items-center justify-center">
            <ClipboardCheck className="size-5 text-primary-foreground" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-semibold text-sm">Check-in form</span>
            <span className="block text-xs text-muted-foreground mt-0.5">
              You'll be advised when to complete this via message.
            </span>
          </span>
        </div>
        {checkInReady ? (
          <a
            href={CLINIC_CHECK_IN_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-widest"
          >
            <ClipboardCheck className="size-4" /> Open check-in form
          </a>
        ) : (
          <Button disabled className="mt-4 h-auto w-full rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-100">
            <ClipboardCheck className="size-4" /> Unlocks next check-in
          </Button>
        )}
      </div>

      <ContactUsCard className="mt-12" />
    </div>
  );
}
