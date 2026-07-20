import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback } from "react";
import {
  seedMultiUserMockData,
  clearMockUsers,
  getPublicTestimonialsCheck,
  listTestimonials,
  runOneClickE2E,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, PlayCircle, RefreshCw, Trash2, Eye, Zap, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/test-checklist")({
  head: () => ({
    meta: [
      { title: "End-to-End Test Checklist" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TestChecklistPage,
});

type Step = {
  id: string;
  title: string;
  detail: string;
  action?: { label: string; run: () => Promise<string> };
  linkTo?: string;
  linkLabel?: string;
};

const STORAGE_KEY = "fgs-test-checklist-v1";

function TestChecklistPage() {
  const seedMulti = useServerFn(seedMultiUserMockData);
  const clearMulti = useServerFn(clearMockUsers);
  const publicCheck = useServerFn(getPublicTestimonialsCheck);
  const listAll = useServerFn(listTestimonials);
  const oneClick = useServerFn(runOneClickE2E);

  const [e2e, setE2e] = useState<{
    running: boolean;
    result?: { ok: boolean; steps: Array<{ step: string; ok: boolean; detail: string }>; testimonialId?: string };
    error?: string;
  }>({ running: false });

  const [done, setDone] = useState<Record<string, boolean>>({});
  const [log, setLog] = useState<Array<{ id: string; msg: string; ts: number; ok: boolean }>>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {}
  }, []);

  const toggle = useCallback((id: string) => {
    setDone((d) => {
      const next = { ...d, [id]: !d[id] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const runAction = useCallback(async (id: string, run: () => Promise<string>) => {
    setBusy(id);
    try {
      const msg = await run();
      setLog((l) => [{ id, msg, ts: Date.now(), ok: true }, ...l].slice(0, 20));
      setDone((d) => {
        const next = { ...d, [id]: true };
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    } catch (e: any) {
      setLog((l) => [{ id, msg: e?.message ?? "Failed", ts: Date.now(), ok: false }, ...l].slice(0, 20));
    } finally {
      setBusy(null);
    }
  }, []);

  const steps: Step[] = [
    {
      id: "1-seed",
      title: "Seed mock users, wheels & testimonials",
      detail:
        "Creates 7 mock accounts at different challenge days (5, 30, 54, 55, 60, 60, 70) with wheel entries and testimonials in pending, approved-public, approved-private, and rejected states.",
      action: {
        label: "Run seed",
        run: async () => {
          const r = await seedMulti({});
          return `Seeded ${r.users.length} users: ${r.users.map((u) => `${u.email.split("@")[0]}(d${u.day})`).join(", ")}`;
        },
      },
    },
    {
      id: "2-verify-admin",
      title: "Verify pending queue in Admin",
      detail: "Open the admin dashboard and confirm the pending mock testimonial from 'Dana' appears in the Pending tab.",
      linkTo: "/admin",
      linkLabel: "Open admin",
      action: {
        label: "Count pending via API",
        run: async () => {
          const rows = (await listAll({ data: { status: "pending" } })) as any[];
          return `${rows.length} pending testimonials in queue.`;
        },
      },
    },
    {
      id: "3-approve",
      title: "Approve a testimonial",
      detail: "In the admin dashboard, approve Dana's pending testimonial. Confirm it moves out of Pending into Approved.",
      linkTo: "/admin",
      linkLabel: "Open admin",
    },
    {
      id: "4-submit-own",
      title: "Submit your own testimonial (preview)",
      detail: "Open the preview flow, jump to the 'Challenge Complete' tab, and submit a testimonial with your own words. Confirm the success screen appears.",
      linkTo: "/preview",
      linkLabel: "Open preview",
    },
    {
      id: "5-gating-early",
      title: "Verify Day 55 gating (early user)",
      detail: "Emma is on Day 5 and Marcus on Day 30. Signing in as them (or reading via the checked API) should hit the 'Sealed until Day 55' lock screen on /complete.",
    },
    {
      id: "6-gating-unlocked",
      title: "Verify Day 55 unlock (Dana/Vera)",
      detail: "Dana (Day 55) and Vera (Day 70) should see the unlock screen on /complete with the 'Begin the reveal' button.",
      linkTo: "/complete",
      linkLabel: "Open /complete",
    },
    {
      id: "7-public-anon",
      title: "Verify public visibility (anon)",
      detail:
        "Fetches testimonials as an anonymous visitor. ONLY approved + permission_to_publish=true should return. Rejected, pending, and approved-but-private must be hidden.",
      action: {
        label: "Run anon check",
        run: async () => {
          const rows = (await publicCheck()) as any[];
          const bad = rows.filter(
            (r) => r.status !== "approved" || r.permission_to_publish !== true,
          );
          if (bad.length > 0) {
            throw new Error(`Privacy leak: ${bad.length} row(s) shouldn't be public.`);
          }
          return `OK — ${rows.length} public testimonials, all approved & permitted. Privacy rules pass.`;
        },
      },
    },
    {
      id: "8-cleanup",
      title: "(Optional) Clean up mock users",
      detail: "Deletes every @fgs-mock.test auth user and cascades their profiles, wheels, and testimonials.",
      action: {
        label: "Delete mock users",
        run: async () => {
          const r = await clearMulti({});
          return `Deleted ${r.deleted} mock users.`;
        },
      },
    },
  ];

  const completed = steps.filter((s) => done[s.id]).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">End-to-End Test Checklist</h1>
          <p className="text-sm text-muted-foreground">
            Walk through seeding, moderation, gating, and privacy checks. Progress saves locally.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            {completed} / {steps.length} done
          </Badge>
          <Link to="/today" className="text-sm underline">← Today</Link>
        </div>
      </header>

      <Card className="mb-8 border-primary/40 bg-primary/5 p-6">
        <div className="flex items-start gap-4">
          <Zap className="mt-1 h-6 w-6 shrink-0 text-primary" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold">One-click end-to-end test</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Seeds a Day 55 mock user, submits a testimonial, approves it as admin, and verifies it becomes publicly visible to anonymous visitors — with a privacy sweep to confirm no pending, rejected, or private rows leak.
            </p>
            <div className="mt-3">
              <Button
                onClick={async () => {
                  setE2e({ running: true });
                  try {
                    const result = await oneClick({});
                    setE2e({ running: false, result });
                  } catch (err: any) {
                    setE2e({ running: false, error: err?.message ?? "Failed" });
                  }
                }}
                disabled={e2e.running}
              >
                <Zap className="mr-1 h-3 w-3" />
                {e2e.running ? "Running full test…" : "Run full end-to-end test"}
              </Button>
            </div>

            {e2e.error && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                {e2e.error}
              </div>
            )}

            {e2e.result && (
              <div className="mt-4 space-y-2">
                <div
                  className={`flex items-center gap-2 rounded-md p-2 text-sm font-semibold ${
                    e2e.result.ok
                      ? "bg-green-100 text-green-900"
                      : "bg-red-100 text-red-900"
                  }`}
                >
                  {e2e.result.ok ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {e2e.result.ok
                    ? "All checks passed — submit → approve → public → privacy."
                    : "End-to-end test failed. See steps below."}
                </div>
                <ol className="space-y-1 text-sm">
                  {e2e.result.steps.map((st) => (
                    <li key={st.step} className="flex items-start gap-2">
                      {st.ok ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                      )}
                      <span>
                        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                          {st.step}
                        </span>
                        {" — "}
                        {st.detail}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </Card>

      <ol className="space-y-4">
        {steps.map((s, i) => {
          const isDone = !!done[s.id];
          return (
            <Card key={s.id} className="p-5">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggle(s.id)}
                  className="mt-0.5 shrink-0 text-primary"
                  aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                >
                  {isDone ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Step {i + 1}
                    </span>
                    {isDone && <Badge variant="default">Complete</Badge>}
                  </div>
                  <h2 className={`mt-1 text-lg font-semibold ${isDone ? "line-through opacity-60" : ""}`}>
                    {s.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{s.detail}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.action && (
                      <Button
                        size="sm"
                        onClick={() => runAction(s.id, s.action!.run)}
                        disabled={busy === s.id}
                      >
                        {s.id === "8-cleanup" ? (
                          <Trash2 className="mr-1 h-3 w-3" />
                        ) : s.id === "7-public-anon" ? (
                          <Eye className="mr-1 h-3 w-3" />
                        ) : (
                          <PlayCircle className="mr-1 h-3 w-3" />
                        )}
                        {busy === s.id ? "Running…" : s.action.label}
                      </Button>
                    )}
                    {s.linkTo && (
                      <Button size="sm" variant="outline" asChild>
                        <Link to={s.linkTo}>{s.linkLabel ?? "Open"}</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </ol>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Action log
          </h2>
          <Button size="sm" variant="ghost" onClick={() => setLog([])}>
            <RefreshCw className="mr-1 h-3 w-3" /> Clear
          </Button>
        </div>
        {log.length === 0 ? (
          <p className="text-sm text-muted-foreground">No actions yet. Run a step to see results here.</p>
        ) : (
          <ul className="space-y-2">
            {log.map((l, i) => (
              <li
                key={i}
                className={`rounded-md border p-3 text-sm ${
                  l.ok ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">
                    {l.id}
                  </span>
                  <time className="text-[10px] opacity-70">
                    {new Date(l.ts).toLocaleTimeString()}
                  </time>
                </div>
                <p className="mt-1">{l.msg}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
