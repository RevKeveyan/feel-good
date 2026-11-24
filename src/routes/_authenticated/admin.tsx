import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback } from "react";
import {
  claimFirstAdmin,
  listTestimonials,
  moderateTestimonial,
  seedMockData,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Shield, Sparkles, Check, X, RefreshCw, Database } from "lucide-react";
import { AdminClinicUploads } from "@/components/AdminClinicUploads";
import { AdminAreaApprovals } from "@/components/AdminAreaApprovals";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin, The Feel Good Society App" },
      { name: "description", content: "Manage member approvals, clinic documents and transformation stories." },
      { property: "og:title", content: "Admin, The Feel Good Society App" },
      { property: "og:description", content: "Manage member approvals, clinic documents and transformation stories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type Testimonial = {
  id: string;
  user_id: string;
  rating: number;
  display_name: string | null;
  headline: string | null;
  story: string;
  permission_to_publish: boolean;
  status: "pending" | "approved" | "rejected";
  moderated_at: string | null;
  created_at: string;
};

type Filter = "pending" | "approved" | "rejected" | "all";

function AdminDashboard() {
  const list = useServerFn(listTestimonials);
  const moderate = useServerFn(moderateTestimonial);
  const seed = useServerFn(seedMockData);
  const claim = useServerFn(claimFirstAdmin);

  const [rows, setRows] = useState<Testimonial[]>([]);
  const [filter, setFilter] = useState<Filter>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const refresh = useCallback(
    async (f: Filter = filter) => {
      setLoading(true);
      setError(null);
      try {
        const data = await list({ data: { status: f } });
        setRows(data as Testimonial[]);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    },
    [filter, list],
  );

  useEffect(() => {
    refresh(filter);
  }, [filter, refresh]);

  async function onModerate(id: string, action: "approve" | "reject") {
    setBusy(id);
    try {
      await moderate({ data: { id, action } });
      setRows((r) => r.filter((x) => x.id !== id));
      setFlash(`Testimonial ${action === "approve" ? "approved" : "rejected"}.`);
      setTimeout(() => setFlash(null), 2200);
    } catch (e: any) {
      setError(e?.message ?? "Action failed");
    } finally {
      setBusy(null);
    }
  }

  async function onSeed() {
    setBusy("seed");
    try {
      const r = await seed({});
      setFlash(
        `Seeded ${r.testimonialsSeeded} testimonial(s) and ${r.wheelSeeded} wheel entries.`,
      );
      setTimeout(() => setFlash(null), 3000);
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? "Seed failed");
    } finally {
      setBusy(null);
    }
  }

  async function onClaim() {
    setBusy("claim");
    try {
      const r = await claim({});
      setFlash(r.granted ? "You are now admin. Reloading…" : "An admin already exists.");
      if (r.granted) setTimeout(() => window.location.reload(), 800);
    } catch (e: any) {
      setError(e?.message ?? "Claim failed");
    } finally {
      setBusy(null);
    }
  }

  const isForbidden = error?.toLowerCase().includes("forbidden");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {!isForbidden && <><AdminAreaApprovals /><AdminClinicUploads /></>}
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-semibold">The Feel Good Society Admin</h1>
            <p className="text-sm text-muted-foreground">
              Review pending submissions and seed mock data for testing.
            </p>
          </div>
        </div>
        <Link to="/test-checklist" className="text-sm underline">
          Test checklist →
        </Link>
        <Link to="/app" className="text-sm underline">
          ← App areas
        </Link>
      </header>

      {flash && (
        <div className="mb-4 rounded-md border border-secondary bg-secondary/30 p-3 text-sm text-foreground">
          {flash}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
          {error}
          {isForbidden && (
            <div className="mt-3">
              <p className="mt-2 text-xs text-primary/80">
                An administrator account is required to manage approvals.
              </p>
            </div>
          )}
        </div>
      )}

      {!isForbidden && (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {(["pending", "approved", "rejected", "all"] as Filter[]).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f[0].toUpperCase() + f.slice(1)}
              </Button>
            ))}
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={() => refresh()} disabled={loading}>
                <RefreshCw className="mr-1 h-3 w-3" /> Refresh
              </Button>
              <Button size="sm" variant="secondary" onClick={onSeed} disabled={busy === "seed"}>
                <Database className="mr-1 h-3 w-3" />
                {busy === "seed" ? "Seeding…" : "Seed mock data"}
              </Button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <Card className="p-10 text-center text-sm text-muted-foreground">
              No {filter === "all" ? "" : filter} testimonials yet.
              {filter === "pending" && (
                <div className="mt-3">
                  Use <strong>Seed mock data</strong> to create some for testing.
                </div>
              )}
            </Card>
          ) : (
            <ul className="space-y-4">
              {rows.map((t) => (
                <Card key={t.id} className="p-5">
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong>{t.display_name ?? "Anonymous"}</strong>
                        <Badge
                          variant={
                            t.status === "approved"
                              ? "default"
                              : t.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {t.status}
                        </Badge>
                        <span className="flex items-center gap-0.5 text-primary">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Sparkles key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </span>
                      </div>
                      {t.headline && (
                        <p className="mt-1 text-sm font-medium">{t.headline}</p>
                      )}
                    </div>
                    <time className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {t.story}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {t.permission_to_publish
                        ? "✓ Permission to publish"
                        : "✗ No publish permission"}
                    </span>
                    {t.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onModerate(t.id, "reject")}
                          disabled={busy === t.id}
                        >
                          <X className="mr-1 h-3 w-3" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onModerate(t.id, "approve")}
                          disabled={busy === t.id}
                        >
                          <Check className="mr-1 h-3 w-3" /> Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
