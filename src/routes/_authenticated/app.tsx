import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LogOut, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AppAreaChooser } from "@/components/AppAreaChooser";
import { getAppAccess, requestAreaAccess } from "@/lib/area-access.functions";
import type { AccessStatus, AppArea } from "@/lib/area-access";
import { supabase } from "@/integrations/supabase/client";

const accessOptions = queryOptions({ queryKey: ["app-area-access"], queryFn: () => getAppAccess(), staleTime: 0 });

export const Route = createFileRoute("/_authenticated/app")({
  loader: ({ context }) => context.queryClient.ensureQueryData(accessOptions),
  head: () => ({ meta: [
    { title: "Your App, The Feel Good Society" },
    { name: "description", content: "Access The Feel Good Challenge and your Clinic Clients area." },
    { property: "og:title", content: "Your App, The Feel Good Society" },
    { property: "og:description", content: "Your Challenge and Clinic Clients access in one place." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: AppPage,
});

function AppPage() {
  const { data, refetch, isFetching } = useSuspenseQuery(accessOptions);
  const { queryClient } = Route.useRouteContext();
  const navigate = useNavigate();
  const request = useServerFn(requestAreaAccess);
  const [busy, setBusy] = useState(false);
  const access: Partial<Record<AppArea, AccessStatus>> = {};
  for (const row of data.access) {
    if ((row.area === "challenge" || row.area === "clinic") && (row.status === "approved" || row.status === "pending" || row.status === "declined")) access[row.area] = row.status;
  }
  async function requestAccess(area: AppArea) {
    setBusy(true);
    try { await request({ data: area }); await refetch(); toast.success("Access requested. Your registration is awaiting approval."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to request access."); }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }
  return <div className="min-h-screen bg-background text-foreground">
    <header className="mx-auto flex max-w-3xl items-center justify-end gap-2 px-6 pt-6">
      {data.isAdmin && <Button asChild variant="outline" size="sm"><Link to="/admin"><Shield className="size-4" />Manage approvals</Link></Button>}
      <Button variant="ghost" size="sm" disabled={busy} onClick={signOut}><LogOut className="size-4" />Sign out</Button>
    </header>
    <main><AppAreaChooser access={access} onEnter={(area) => navigate({ to: area === "challenge" ? "/today" : "/clinic" })} onRequest={requestAccess} onRefresh={() => { void refetch(); }} busy={busy || isFetching} /></main>
  </div>;
}