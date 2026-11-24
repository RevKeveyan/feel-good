import { ArrowRight, CheckCircle2, Lock, Flame, Stethoscope, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { accessLabel, canEnterArea, type AccessStatus, type AppArea } from "@/lib/area-access";

const AREAS = [
  { area: "challenge" as const, title: "Challenge", description: "Your 55-day journey, daily habits, transformation and cash prizes.", Icon: Flame },
  { area: "clinic" as const, title: "Clinic", description: "Your health forms, results, treatment plan and product details.", Icon: Stethoscope },
];

export function AppAreaChooser({ access, onEnter, onRequest, onRefresh, busy }: {
  access: Partial<Record<AppArea, AccessStatus>>;
  onEnter: (area: AppArea) => void;
  onRequest: (area: AppArea) => void;
  onRefresh: () => void;
  busy?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <p className="font-mono text-xs uppercase text-primary">The Feel Good Society</p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {AREAS.map(({ area, title, description, Icon }) => {
          const status = access[area];
          const approved = canEnterArea(status);
          return (
            <section key={area} className="flex min-w-0 flex-col rounded-lg border border-border bg-card p-6 text-left">
              <div className="flex min-h-11 items-center justify-between gap-3">
                <Icon className="size-8 shrink-0 text-primary" strokeWidth={1.5} />
                {approved && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    <CheckCircle2 className="size-3.5" />
                    {accessLabel(status)}
                  </span>
                )}
              </div>
              <h2 className="mt-6 font-display text-2xl leading-tight text-balance">{title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
              <div className="pt-6">
                {approved ? (
                  <Button className="h-auto min-h-11 w-full whitespace-normal py-2.5" onClick={() => onEnter(area)}>Open {area === "clinic" ? "Clinic" : "Challenge"}<ArrowRight className="size-4" /></Button>
                ) : status ? (
                  <Button className="h-auto min-h-11 w-full whitespace-normal py-2.5" variant="outline" disabled><Lock className="size-4 shrink-0" />{status === "declined" ? "Not approved" : "Awaiting approval"}</Button>
                ) : (
                  <Button className="h-auto min-h-11 w-full whitespace-normal py-2.5" variant="outline" disabled={busy} onClick={() => onRequest(area)}>Request access<ArrowRight className="size-4" /></Button>
                )}
              </div>
            </section>
          );
        })}
      </div>
      <div className="mt-7 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={busy}><RefreshCw className="size-4" />Check approval</Button>
      </div>
    </div>
  );
}