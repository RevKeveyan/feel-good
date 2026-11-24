import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClinicView } from "@/components/ClinicView";
import { supabase } from "@/integrations/supabase/client";
import { requireAreaApproval } from "@/lib/area-access.guard";

export const Route = createFileRoute("/_authenticated/clinic")({
  beforeLoad: () => requireAreaApproval("clinic"),
  head: () => ({
    meta: [
      { title: "Clinic Clients, The Feel Good Society" },
      { name: "description", content: "Your health forms, results, treatment plan and personalised product details all in one place." },
      { property: "og:title", content: "Clinic Clients, The Feel Good Society" },
      { property: "og:description", content: "Your intake form, latest pathology report and treatment plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClinicPage,
});

function ClinicPage() {
  const [urls, setUrls] = useState<{ pathology?: string; treatment_plan?: string; personalised_pod?: string }>({});

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase
        .from("client_documents")
        .select("kind, storage_path")
        .eq("user_id", auth.user.id);
      const out: Record<string, string> = {};
      for (const d of data ?? []) {
        const { data: s } = await supabase.storage.from("clinic-docs").createSignedUrl(d.storage_path, 3600);
        if (s?.signedUrl) out[d.kind] = s.signedUrl;
      }
      setUrls(out);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <div className="px-6 pt-6">
          <Link to="/app" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            ← App areas
          </Link>
        </div>
        <ClinicView pathologyUrl={urls.pathology} treatmentPlanUrl={urls.treatment_plan} personalisedPodUrl={urls.personalised_pod} />
      </div>
    </div>
  );
}
