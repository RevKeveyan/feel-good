import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CHALLENGE_LENGTH, currentDay, type Profile } from "@/lib/challenge";
import { requireAreaApproval } from "@/lib/area-access.guard";

export const Route = createFileRoute("/_authenticated/complete")({
  beforeLoad: () => requireAreaApproval("challenge"),
  head: () => ({
    meta: [
      { title: "Challenge Complete, The Feel Good Society" },
      { name: "description", content: "Reveal and share your transformation after completing The Feel Good Society 55-Day Challenge." },
      { property: "og:title", content: "Challenge Complete, The Feel Good Society" },
      { property: "og:description", content: "Reveal and share your transformation after completing The Feel Good Society 55-Day Challenge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CompletePage,
});

function CompletePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
      setProfile(data as Profile);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const day = profile ? currentDay(profile.challenge_start_date) : 1;
  const gated = day < CHALLENGE_LENGTH;

  if (gated) {
    const daysLeft = CHALLENGE_LENGTH - day;
    return (
      <div className="min-h-screen bg-background text-foreground max-w-md mx-auto p-6 pt-16">
        <div className="rounded-3xl bg-card p-8 ring-1 ring-foreground/5 text-center">
          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="size-6 text-primary" />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Sealed until Day {CHALLENGE_LENGTH}
          </p>
          <h1 className="font-display italic text-3xl mb-3">Not yet.</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your completion reveal — the before-and-after wheel, your Future You letter, and your transformation — unlocks on Day {CHALLENGE_LENGTH}.
          </p>
          <div className="rounded-2xl bg-muted/40 p-4 mb-6">
            <p className="font-mono text-[10px] uppercase text-muted-foreground">You're on</p>
            <p className="font-display italic text-4xl mt-1">Day {day}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {daysLeft} day{daysLeft === 1 ? "" : "s"} to go.
            </p>
          </div>
          <button
            onClick={() => navigate({ to: "/today" })}
            className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold flex items-center justify-center gap-2"
          >
            Back to today <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground max-w-md mx-auto p-6 pt-16">
      <div className="rounded-3xl bg-linear-to-br from-primary/10 via-card to-accent/10 p-8 ring-1 ring-foreground/5 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2">
          Day {CHALLENGE_LENGTH} · Unlocked
        </p>
        <h1 className="font-display italic text-4xl leading-tight mb-3">You did it.</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Rate yourself one last time to reveal your transformation, read your Future You letter, and leave your review.
        </p>
        <Link
          to="/preview"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold"
        >
          Begin the reveal <ArrowRight className="size-4" />
        </Link>
        <p className="text-[11px] text-muted-foreground mt-3">
          The full reveal experience will live here once we wire it to your real data.
        </p>
      </div>
    </div>
  );
}
