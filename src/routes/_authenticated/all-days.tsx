import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AllDaysView } from "@/components/AllDaysView";
import { requireAreaApproval } from "@/lib/area-access.guard";
import {
  CHALLENGE_LENGTH,
  completedDaysCount,
  computeStreak,
  currentDay,
  todayISO,
  type DailyEntry,
  type Profile,
} from "@/lib/challenge";

export const Route = createFileRoute("/_authenticated/all-days")({
  beforeLoad: () => requireAreaApproval("challenge"),
  head: () => ({
    meta: [
      { title: "All days, The Feel Good Challenge" },
      {
        name: "description",
        content:
          "Your 55-day journey at a glance: streak, completed days and every day of The Feel Good Challenge.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "All days, The Feel Good Challenge" },
      {
        property: "og:description",
        content:
          "Your 55-day journey at a glance: streak, completed days and every day of The Feel Good Challenge.",
      },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AllDaysPage,
});

function AllDaysPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [finalCheckInDone, setFinalCheckInDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const uid = userData.user.id;

    const [{ data: p }, { data: rows }, { data: finalWheel }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", uid)
        .order("entry_date", { ascending: false })
        .limit(CHALLENGE_LENGTH + 5),
      supabase
        .from("transformation_wheel")
        .select("id")
        .eq("user_id", uid)
        .eq("phase", "day_55")
        .maybeSingle(),
    ]);
    const profileRow = p as Profile | null;
    if (profileRow && !profileRow.onboarding_completed_at) {
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    setProfile(profileRow);
    setEntries((rows ?? []) as DailyEntry[]);
    setFinalCheckInDone(!!finalWheel);
    setLoading(false);
  }

  const streak = useMemo(() => computeStreak(entries), [entries]);
  const completed = useMemo(() => completedDaysCount(entries), [entries]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Loading…
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <p className="text-sm text-muted-foreground text-center">
          We could not load your challenge. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground max-w-md mx-auto">
      <AllDaysView
        startDate={profile.challenge_start_date}
        entries={entries}
        today={todayISO()}
        waterTarget={profile.water_target_ml ?? 2500}
        streak={streak}
        completed={completed}
        currentDayNum={currentDay(profile.challenge_start_date)}
        onOpenToday={() => navigate({ to: "/today" })}
        finalCheckInDone={finalCheckInDone}
        onOpenFinalCheckIn={() => navigate({ to: "/complete" })}
      />
    </div>
  );
}
