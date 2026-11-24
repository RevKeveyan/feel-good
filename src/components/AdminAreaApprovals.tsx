import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { Check, X, RotateCcw, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listMemberAccess, reviewMemberAccess } from "@/lib/area-access.functions";
import { accessLabel, type AccessStatus, type AppArea } from "@/lib/area-access";

export function AdminAreaApprovals() {
  const list = useServerFn(listMemberAccess);
  const review = useServerFn(reviewMemberAccess);
  const [data, setData] = useState<Awaited<ReturnType<typeof listMemberAccess>> | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(async () => {
    try { setData(await list()); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load approvals."); }
  }, [list]);
  useEffect(() => { void load(); }, [load]);
  async function update(userId: string, area: AppArea, status: AccessStatus) {
    setBusy(`${userId}-${area}`);
    try { await review({ data: { userId, area, status } }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to update approval."); }
    finally { setBusy(null); }
  }
  return <section className="mb-10">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">Registration approvals</h2>
      <Button variant="ghost" size="icon" title="Refresh approvals" aria-label="Refresh approvals" onClick={load}><RefreshCw className="size-4" /></Button>
    </div>
    {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}
    {!data && !error && <p className="text-sm text-muted-foreground">Loading approvals…</p>}
    <div className="space-y-3">
      {data?.profiles.map((profile) => <article key={profile.id} className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-semibold">{profile.display_name || "Unnamed member"}</h3>
        <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{profile.id}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(["challenge", "clinic"] as const).map((area) => {
            const row = data.access.find((r) => r.user_id === profile.id && r.area === area);
            const status = row?.status as AccessStatus | undefined;
            return <div key={area}>
              <p className="text-sm font-semibold">{area === "challenge" ? "The Feel Good Challenge" : "Clinic Clients"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{accessLabel(status)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {status !== "approved" && <Button size="sm" disabled={busy !== null} onClick={() => update(profile.id, area, "approved")}><Check className="size-4" />Approve</Button>}
                {status !== "declined" && <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => update(profile.id, area, "declined")}><X className="size-4" />{status === "approved" ? "Revoke" : "Decline"}</Button>}
                {status === "declined" && <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => update(profile.id, area, "pending")}><RotateCcw className="size-4" />Review again</Button>}
              </div>
            </div>;
          })}
        </div>
      </article>)}
    </div>
  </section>;
}