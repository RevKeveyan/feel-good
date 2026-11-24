import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

type Client = { id: string; display_name: string | null };
type Doc = { user_id: string; kind: string; file_name: string | null };
const KINDS = [
  { key: "pathology", label: "Pathology report" },
  { key: "treatment_plan", label: "Treatment plan" },
  { key: "personalised_pod", label: "Personalised supplement details" },
] as const;

export function AdminClinicUploads() {
  const [clients, setClients] = useState<Client[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const [{ data: p }, { data: d }] = await Promise.all([
      supabase.from("profiles").select("id, display_name").order("display_name"),
      supabase.from("client_documents").select("user_id, kind, file_name"),
    ]);
    setClients(p ?? []);
    setDocs(d ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function upload(userId: string, kind: string, file: File) {
    if (file.type !== "application/pdf") return setMsg("Please choose a PDF file.");
    const key = `${userId}-${kind}`;
    setBusy(key);
    setMsg(null);
    try {
      const path = `${userId}/${kind}-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage
        .from("clinic-docs")
        .upload(path, file, { contentType: "application/pdf" });
      if (upErr) throw upErr;
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("client_documents").upsert(
        { user_id: userId, kind, storage_path: path, file_name: file.name, uploaded_by: auth.user?.id },
        { onConflict: "user_id,kind" },
      );
      if (error) throw error;
      setMsg("Uploaded.");
      await load();
    } catch (e: any) {
      setMsg(e?.message ?? "Upload failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-1">Clinic documents</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Upload each client's own pathology report, treatment plan and personalised supplement details (PDF). Uploading again replaces the old one.
      </p>
      {msg && <p className="text-sm mb-3">{msg}</p>}
      <div className="space-y-3">
        {clients.map((c) => (
          <Card key={c.id} className="p-4">
            <p className="font-medium mb-3">{c.display_name || "Unnamed client"}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {KINDS.map((k) => {
                const doc = docs.find((d) => d.user_id === c.id && d.kind === k.key);
                const key = `${c.id}-${k.key}`;
                return (
                  <label
                    key={k.key}
                    className="flex items-center gap-3 rounded-xl ring-1 ring-foreground/10 p-3 cursor-pointer hover:ring-primary/50"
                  >
                    <FileText className="size-4 text-primary" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium">{k.label}</span>
                      <span className="block text-xs text-muted-foreground truncate">
                        {busy === key ? "Uploading…" : doc?.file_name ?? "No file yet, tap to upload"}
                      </span>
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      disabled={busy === key}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) upload(c.id, k.key, f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                );
              })}
            </div>
          </Card>
        ))}
        {clients.length === 0 && <p className="text-sm text-muted-foreground">No clients yet.</p>}
      </div>
    </section>
  );
}
