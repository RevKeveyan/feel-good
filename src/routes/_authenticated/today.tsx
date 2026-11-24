import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Flame, CheckCircle2, Lock, Heart, CalendarDays, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireAreaApproval } from "@/lib/area-access.guard";
import { MindsetLibrary } from "@/components/MindsetLibrary";
import { supabase } from "@/integrations/supabase/client";
import {
  CHALLENGE_LENGTH,
  MINDSET_TYPES,
  MOVE_TYPES,
  completedDaysCount,
  computeStreak,
  currentDay,
  currentWeek,
  dailyScore,
  daysRemaining,
  formatDate,
  habitsComplete,
  isCheckInComplete,
  isDayComplete,
  missedYesterday,
  todayISO,
  type DailyEntry,
  type Profile,
} from "@/lib/challenge";

import { quoteForDate } from "@/lib/quotes";

export const Route = createFileRoute("/_authenticated/today")({
  beforeLoad: () => requireAreaApproval("challenge"),
  head: () => ({
    meta: [
      { title: "Today, The Feel Good Challenge" },
      { name: "description", content: "Your daily habits and check-in for The Feel Good Challenge." },
      { property: "og:title", content: "Today, The Feel Good Challenge" },
      { property: "og:description", content: "Your daily habits and check-in for The Feel Good Challenge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TodayPage,
});

const WATER_INCREMENT = 250;

type WeeklyPhoto = {
  id: string;
  week_number: number;
  storage_path: string;
  note: string | null;
  created_at: string;
};

function TodayPage() {
  const navigate = useNavigate();
  const { queryClient } = Route.useRouteContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [allEntries, setAllEntries] = useState<DailyEntry[]>([]);
  const [weeklyPhoto, setWeeklyPhoto] = useState<WeeklyPhoto | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [showMindset, setShowMindset] = useState(false);
  const [view, setView] = useState<"today" | "mindset">("today");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const today = todayISO();

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const uid = userData.user.id;

    const [{ data: p }, { data: entries }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", uid)
        .order("entry_date", { ascending: false })
        .limit(CHALLENGE_LENGTH + 5),
    ]);
    const profileRow = p as Profile | null;
    const rows = (entries ?? []) as DailyEntry[];
    if (profileRow && !profileRow.onboarding_completed_at) {
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    setProfile(profileRow);
    setAllEntries(rows);
    setEntry(rows.find((r) => r.entry_date === today) ?? null);

    if (profileRow) {
      const week = currentWeek(profileRow.challenge_start_date);
      const { data: photo } = await supabase
        .from("weekly_photos")
        .select("*")
        .eq("user_id", uid)
        .eq("week_number", week)
        .maybeSingle();
      const wp = (photo as WeeklyPhoto | null) ?? null;
      setWeeklyPhoto(wp);
      if (wp) {
        const { data: signed } = await supabase.storage
          .from("weekly-photos")
          .createSignedUrl(wp.storage_path, 3600);
        setPhotoUrl(signed?.signedUrl ?? null);
      } else {
        setPhotoUrl(null);
      }
    }
    setLoading(false);
  }

  async function upsertEntry(patch: Partial<DailyEntry>) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const uid = userData.user.id;
    const base = entry ?? {
      user_id: uid,
      entry_date: today,
      nourish: false,
      fuel: false,
      move_done: false,
      mindset: false,
      water_ml: 0,
    };
    const merged = { ...base, ...patch };
    const { data, error } = await supabase
      .from("daily_entries")
      .upsert({ ...merged, user_id: uid, entry_date: today }, { onConflict: "user_id,entry_date" })
      .select()
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    const updated = data as DailyEntry;
    setEntry(updated);
    setAllEntries((prev) => {
      const rest = prev.filter((r) => r.entry_date !== updated.entry_date);
      return [updated, ...rest].sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1));
    });
  }

  async function handlePhotoUpload(file: File) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user || !profile) return;
    const uid = userData.user.id;
    const week = currentWeek(profile.challenge_start_date);
    setUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${uid}/week-${week}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("weekly-photos")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      // Remove old file if we're replacing
      if (weeklyPhoto?.storage_path && weeklyPhoto.storage_path !== path) {
        await supabase.storage.from("weekly-photos").remove([weeklyPhoto.storage_path]);
      }

      const { data, error } = await supabase
        .from("weekly_photos")
        .upsert(
          { user_id: uid, week_number: week, storage_path: path, note: weeklyPhoto?.note ?? null },
          { onConflict: "user_id,week_number" },
        )
        .select()
        .single();
      if (error) throw error;
      const wp = data as WeeklyPhoto;
      setWeeklyPhoto(wp);
      const { data: signed } = await supabase.storage
        .from("weekly-photos")
        .createSignedUrl(path, 3600);
      setPhotoUrl(signed?.signedUrl ?? null);
      toast.success(`Week ${week} photo saved`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const target = profile?.water_target_ml ?? 2500;
  const score = dailyScore(entry, target);
  const habits = habitsComplete(entry, target);
  const day = profile ? currentDay(profile.challenge_start_date) : 1;
  const week = profile ? currentWeek(profile.challenge_start_date) : 1;
  const remaining = profile ? daysRemaining(profile.challenge_start_date) : CHALLENGE_LENGTH - 1;
  const checkInDone = isCheckInComplete(entry);
  const dayComplete = isDayComplete(entry);
  const streak = useMemo(() => computeStreak(allEntries), [allEntries]);
  const completedDays = useMemo(() => completedDaysCount(allEntries), [allEntries]);
  const journeyPct = Math.round((completedDays / CHALLENGE_LENGTH) * 100);
  const missedYest = useMemo(
    () => (profile ? missedYesterday(allEntries, profile.challenge_start_date) : false),
    [allEntries, profile],
  );

  const dash = useMemo(() => `${(score / 100) * 100}, 100`, [score]);
  const initials = profile?.display_name?.slice(0, 2).toUpperCase() ?? "•";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground max-w-md mx-auto pb-32">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-end animate-entrance">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            {formatDate(today)}
          </p>
          <h1 className="font-display text-3xl italic tracking-tight">
            Day {day}{" "}
            <span className="text-lg font-sans not-italic font-normal text-muted-foreground">
              of {CHALLENGE_LENGTH}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ to: "/all-days" })}
            className="size-10 rounded-full bg-card flex items-center justify-center ring-1 ring-foreground/10"
            title="All days"
          >
            <CalendarDays className="size-4 text-muted-foreground" />
          </button>
          <Button variant="ghost" size="icon"
            onClick={() => navigate({ to: "/app" })}
            className="size-10 rounded-full bg-card flex items-center justify-center ring-1 ring-foreground/10"
            title="App areas" aria-label="App areas"
          >
            <LayoutGrid className="size-4 text-muted-foreground" />
          </Button>
          <button
            onClick={handleSignOut}
            className="size-10 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20"
            title="Sign out"
          >
            <span className="text-xs font-semibold text-primary">{initials}</span>
          </button>
        </div>
      </header>

      {/* Day 55 unlock CTA */}
      {day >= CHALLENGE_LENGTH && (
        <section className="px-6 mb-4 animate-entrance">
          <button
            onClick={() => navigate({ to: "/complete" })}
            className="w-full rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground p-5 text-left flex items-center justify-between ring-1 ring-primary/20"
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest opacity-80">Day 55 · Unlocked</p>
              <p className="font-display italic text-xl mt-1">Reveal your transformation</p>
            </div>
            <span className="text-2xl">→</span>
          </button>
        </section>
      )}

      {/* Missed-yesterday grace banner */}
      {missedYest && (
        <section className="px-6 mb-4 animate-entrance">
          <div className="rounded-2xl bg-accent/10 ring-1 ring-accent/30 p-4 flex gap-3">
            <Heart className="size-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">You missed yesterday.</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your streak is paused, not lost. Complete today's challenge to continue your transformation.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Daily quote */}
      <section className="px-6 mb-6 animate-entrance">
        <div className="rounded-3xl bg-linear-to-br from-[color:var(--lime)]/25 via-card to-[color:var(--destructive)]/25 ring-1 ring-foreground/5 p-6 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-[color:var(--accent)]/40 blur-3xl" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-3 relative">
            Today's reminder
          </p>
          <p className="font-display italic text-lg leading-snug text-foreground relative">
            "{quoteForDate(today).text}"
          </p>
          {quoteForDate(today).author && (
            <p className="mt-3 text-xs text-muted-foreground relative">- {quoteForDate(today).author}</p>
          )}
        </div>
      </section>

      {/* View tabs */}
      <section className="px-6 mb-6 animate-entrance">
        <div className="inline-flex w-full rounded-full bg-card ring-1 ring-foreground/5 p-1">
          {(["today", "mindset"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${
                view === v
                  ? "bg-foreground text-background"
                  : "text-muted-foreground"
              }`}
            >
              {v === "today" ? "Today" : "Mindset"}
            </button>
          ))}
        </div>
      </section>

      {view === "mindset" ? (
        <MindsetLibrary compact />
      ) : (
      <>


      {/* Streak & journey */}
      <section className="px-6 mb-6 grid grid-cols-2 gap-3 animate-entrance">
        <div className="rounded-2xl p-4 ring-1 ring-[color:var(--destructive)]/30 bg-linear-to-br from-[color:var(--destructive)]/25 to-[color:var(--accent)]/25">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="size-4 text-[color:var(--destructive)]" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/70">
              Streak
            </p>
          </div>
          <p className="text-2xl font-display italic">
            {streak}
            <span className="text-xs font-sans not-italic text-muted-foreground ml-1">
              {streak === 1 ? "day" : "days"}
            </span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {streak === 0 ? "Complete today to start" : "Keep it going"}
          </p>
        </div>
        <div className="rounded-2xl p-4 ring-1 ring-[color:var(--lime)]/50 bg-linear-to-br from-[color:var(--lime)]/30 to-card">
          <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/70 mb-1">
            Journey
          </p>
          <p className="text-2xl font-display italic">
            {journeyPct}
            <span className="text-xs font-sans not-italic text-muted-foreground ml-0.5">%</span>
          </p>
          <div className="mt-2 h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-[color:var(--lime)] to-[color:var(--accent)] transition-all"
              style={{ width: `${Math.min(100, journeyPct)}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {completedDays} of {CHALLENGE_LENGTH} days complete
          </p>
        </div>
      </section>


      {/* Score Ring */}
      <section className="px-6 mb-8 animate-entrance">
        <div className="rounded-3xl p-8 ring-1 ring-foreground/5 flex flex-col items-center relative overflow-hidden bg-linear-to-br from-card via-[color:var(--lime)]/10 to-[color:var(--destructive)]/15">
          <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-[color:var(--accent)]/25 blur-3xl" />
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <h2 className="font-display italic text-6xl">55</h2>
          </div>
          <div className="relative size-48 flex items-center justify-center">
            <svg className="size-full -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
              <defs>
                <linearGradient id="score-arc" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-red)" />
                  <stop offset="100%" stopColor="var(--brand-pink)" />
                </linearGradient>
              </defs>
              <path
                stroke="var(--foreground)"
                strokeOpacity={0.1}
                strokeWidth="2.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke="url(#score-arc)"
                className="transition-all duration-700"
                strokeWidth="3"
                strokeDasharray={dash}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Daily Score
              </span>
              <span className="text-5xl font-display italic mt-1">{score}</span>
              {dayComplete && (
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
                  <CheckCircle2 className="size-3" /> Day complete
                </span>
              )}
            </div>
          </div>
          <div className="mt-6 flex gap-8">
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase text-muted-foreground">Habits</p>
              <p className="text-lg font-semibold">{habits} / 5</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase text-muted-foreground">Check-in</p>
              <p className={`text-lg font-semibold ${checkInDone ? "text-primary" : "text-muted-foreground"}`}>
                {checkInDone ? "Done" : "Required"}
              </p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase text-muted-foreground">Remaining</p>
              <p className="text-lg font-semibold text-accent">{remaining} days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feel Good Five */}
      <section className="px-6 mb-8">
        <div className="flex justify-between items-baseline mb-4">
          <h3 className="font-display text-xl italic">The Feel Good Five</h3>
          <span className="font-mono text-[10px] text-muted-foreground">
            {habits} of 5 done
          </span>
        </div>

        <div className="space-y-3">
          <HabitRow
            title="Nourish"
            sub={entry?.nourish ? "Personalised plan followed" : "Follow your nutrition plan"}
            done={!!entry?.nourish}
            points={16}
            onToggle={() => upsertEntry({ nourish: !entry?.nourish })}
          />
          <HabitRow
            title="Fuel"
            sub={entry?.fuel ? "Pods & powders taken" : "Take your pods & powders"}
            done={!!entry?.fuel}
            points={16}
            onToggle={() => upsertEntry({ fuel: !entry?.fuel })}
          />

          {/* Move */}
          <div
            className={`bg-card rounded-2xl p-4 ring-1 animate-entrance ${
              entry?.move_done ? "ring-foreground/5" : "ring-primary/30"
            } flex items-center gap-4`}
          >
            <button
              onClick={() => upsertEntry({ move_done: !entry?.move_done })}
              className={`size-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                entry?.move_done ? "border-primary bg-primary" : "border-primary/30"
              }`}
            >
              {entry?.move_done && <div className="size-1.5 rounded-full bg-primary-foreground" />}
            </button>
            <div className="flex-1">
              <h4
                className={`text-sm font-semibold ${
                  entry?.move_done ? "text-muted-foreground/60 line-through" : ""
                }`}
              >
                Move
              </h4>
              <p className="text-xs text-muted-foreground">
                {entry?.move_done && entry.move_type
                  ? `${entry.move_type} · ${entry.move_minutes ?? 0}m`
                  : "Move for 30 mins + 5,000 steps"}
              </p>
            </div>
            <button
              onClick={() => setShowMove(true)}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-[11px] font-semibold rounded-full"
            >
              {entry?.move_done ? "Edit" : "Log"}
            </button>
          </div>

          {/* Mindset */}
          <div
            className={`bg-card rounded-2xl p-4 ring-1 animate-entrance ${
              entry?.mindset ? "ring-foreground/5" : "ring-primary/30"
            } flex items-center gap-4`}
          >
            <button
              onClick={() => upsertEntry({ mindset: !entry?.mindset })}
              className={`size-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                entry?.mindset ? "border-primary bg-primary" : "border-primary/30"
              }`}
            >
              {entry?.mindset && <div className="size-1.5 rounded-full bg-primary-foreground" />}
            </button>
            <div className="flex-1">
              <h4
                className={`text-sm font-semibold ${
                  entry?.mindset ? "text-muted-foreground/60 line-through" : ""
                }`}
              >
                Mindset
              </h4>
              <p className="text-xs text-muted-foreground">
                {entry?.mindset && entry.mindset_type
                  ? entry.mindset_type
                  : "5-10 mins of mindset practice"}
              </p>
            </div>
            <button
              onClick={() => setShowMindset(true)}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-[11px] font-semibold rounded-full"
            >
              {entry?.mindset ? "Edit" : "Log"}
            </button>
          </div>

          {/* Hydrate */}
          <div className="bg-card rounded-2xl p-4 ring-1 ring-foreground/5 animate-entrance">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-6 rounded-full border-2 border-primary/30 flex items-center justify-center shrink-0">
                <div className="size-1.5 rounded-full bg-primary/20" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold">Hydrate</h4>
                <p className="text-xs text-muted-foreground">
                  {(entry?.water_ml ?? 0) / 1000}L of {target / 1000}L
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    upsertEntry({ water_ml: Math.max(0, (entry?.water_ml ?? 0) - WATER_INCREMENT) })
                  }
                  className="size-8 rounded-full bg-muted text-sm"
                >
                  −
                </button>
                <button
                  onClick={() =>
                    upsertEntry({ water_ml: (entry?.water_ml ?? 0) + WATER_INCREMENT })
                  }
                  className="size-8 rounded-full bg-primary text-primary-foreground text-sm"
                >
                  +
                </button>
              </div>
            </div>
            <div className="h-1.5 flex-1 bg-primary/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${Math.min(100, ((entry?.water_ml ?? 0) / target) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Required check-in gate */}
      <section className="px-6 mb-8 animate-entrance">
        <button
          onClick={() => setShowCheckIn(true)}
          className={`w-full text-left rounded-3xl p-6 relative overflow-hidden transition ring-1 ${
            checkInDone
              ? "bg-card ring-foreground/5 hover:ring-primary/20"
              : "bg-primary text-primary-foreground ring-primary hover:opacity-95"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {checkInDone ? (
              <CheckCircle2 className="size-3.5 text-primary" />
            ) : (
              <Lock className="size-3.5 opacity-80" />
            )}
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">
              {checkInDone ? "Daily check-in complete" : "Required to complete today"}
            </span>
          </div>
          <h4 className="font-display text-2xl italic mt-1 mb-2">
            {checkInDone ? "Update today's reflection" : "How are you today?"}
          </h4>
          <p className={`text-sm leading-relaxed ${checkInDone ? "text-muted-foreground" : "opacity-80"}`}>
            Energy, mood, stress, motivation, the daily check-in is what
            marks Day {day} as complete and keeps your streak alive.
          </p>
          <div className="absolute -bottom-4 -right-4 opacity-10 pointer-events-none">
            <svg className="size-32 fill-current" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" />
            </svg>
          </div>
        </button>
      </section>

      {/* Weekly photo */}
      <section className="px-6 animate-entrance">
        <div className="bg-card rounded-3xl p-6 ring-1 ring-foreground/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Week {week} of 8
              </p>
              <h4 className="font-display text-xl italic mt-1">Weekly progress photo</h4>
            </div>
            <Camera className="size-5 text-primary" />
          </div>
          {photoUrl ? (
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-muted mb-4">
              <img src={photoUrl} alt={`Week ${week} progress`} className="w-full h-full object-cover" />
              <span className="absolute top-3 left-3 rounded-full bg-foreground/50 text-primary-foreground font-mono text-[10px] uppercase tracking-widest px-2 py-1">
                Week {week}
              </span>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-primary/30 aspect-[4/5] flex flex-col items-center justify-center text-center gap-2 mb-4 hover:bg-primary/5 transition"
            >
              <Camera className="size-8 text-primary/60" />
              <p className="text-sm font-semibold">Add your Week {week} photo</p>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                Same pose, same light. Future you will thank you.
              </p>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handlePhotoUpload(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {uploadingPhoto ? "Uploading…" : photoUrl ? "Replace photo" : "Upload photo"}
          </button>
          {weeklyPhoto?.created_at && (
            <p className="text-[11px] text-muted-foreground text-center mt-3">
              Saved {new Date(weeklyPhoto.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </section>
      </>
      )}


      {showMove && (
        <MoveModal
          entry={entry}
          onClose={() => setShowMove(false)}
          onSave={async (patch) => {
            await upsertEntry({ ...patch, move_done: true });
            setShowMove(false);
          }}
        />
      )}

      {showMindset && (
        <MindsetModal
          entry={entry}
          onClose={() => setShowMindset(false)}
          onSave={async (patch) => {
            await upsertEntry({ ...patch, mindset: true });
            setShowMindset(false);
          }}
        />
      )}

      {showCheckIn && (
        <CheckInModal
          entry={entry}
          onClose={() => setShowCheckIn(false)}
          onSave={async (patch) => {
            await upsertEntry(patch);
            setShowCheckIn(false);
            toast.success("Check-in saved");
          }}
        />
      )}
    </div>
  );
}

function HabitRow({
  title,
  sub,
  done,
  points,
  onToggle,
}: {
  title: string;
  sub: string;
  done: boolean;
  points: number;
  onToggle: () => void;
}) {
  return (
    <div
      className={`bg-card rounded-2xl p-4 ring-1 ${
        done ? "ring-foreground/5" : "ring-primary/30"
      } flex items-center gap-4 animate-entrance`}
    >
      <button
        onClick={onToggle}
        className={`size-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
          done ? "border-primary bg-primary" : "border-primary/30"
        }`}
      >
        {done && <div className="size-1.5 rounded-full bg-primary-foreground" />}
      </button>
      <div className="flex-1">
        <h4
          className={`text-sm font-semibold ${
            done ? "text-muted-foreground/60 line-through" : ""
          }`}
        >
          {title}
        </h4>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <span className="font-mono text-[10px] text-primary">
        {done ? `+${points} pts` : `${points} pts`}
      </span>
    </div>
  );
}

function ModalShell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 p-0 sm:p-6">
      <div className="w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-xl italic">{title}</h3>
          <button onClick={onClose} className="size-8 rounded-full bg-muted text-sm">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MoveModal({
  entry,
  onClose,
  onSave,
}: {
  entry: DailyEntry | null;
  onClose: () => void;
  onSave: (p: Partial<DailyEntry>) => Promise<void>;
}) {
  const [type, setType] = useState(entry?.move_type ?? MOVE_TYPES[0]);
  const [minutes, setMinutes] = useState(entry?.move_minutes ?? 30);
  return (
    <ModalShell title="Log movement" onClose={onClose}>
      <div className="grid grid-cols-3 gap-2 mb-6">
        {MOVE_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-xl px-3 py-2 text-xs font-semibold ring-1 ${
              type === t ? "bg-primary text-primary-foreground ring-primary" : "bg-card ring-foreground/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Duration (minutes)
      </label>
      <input
        type="number"
        min={1}
        value={minutes}
        onChange={(e) => setMinutes(Number(e.target.value))}
        className="w-full rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/5"
      />
      <button
        onClick={() => onSave({ move_type: type, move_minutes: minutes })}
        className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
      >
        Save
      </button>
    </ModalShell>
  );
}

function MindsetModal({
  entry,
  onClose,
  onSave,
}: {
  entry: DailyEntry | null;
  onClose: () => void;
  onSave: (p: Partial<DailyEntry>) => Promise<void>;
}) {
  const [type, setType] = useState(entry?.mindset_type ?? MINDSET_TYPES[0]);
  return (
    <ModalShell title="Log mindset" onClose={onClose}>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {MINDSET_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ring-1 ${
              type === t ? "bg-primary text-primary-foreground ring-primary" : "bg-card ring-foreground/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <button
        onClick={() => onSave({ mindset_type: type })}
        className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
      >
        Save
      </button>
    </ModalShell>
  );
}

function Scale({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-semibold">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">{value ?? "-"}/10</span>
      </div>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }).map((_, i) => {
          const n = i + 1;
          const active = value !== null && n <= value;
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`h-8 rounded-md ${active ? "bg-primary" : "bg-muted"}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function CheckInModal({
  entry,
  onClose,
  onSave,
}: {
  entry: DailyEntry | null;
  onClose: () => void;
  onSave: (p: Partial<DailyEntry>) => Promise<void>;
}) {
  const [energy, setEnergy] = useState<number | null>(entry?.energy ?? null);
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null);
  const [stress, setStress] = useState<number | null>(entry?.stress ?? null);
  const [motivation, setMotivation] = useState<number | null>(entry?.motivation ?? null);
  const [sleep, setSleep] = useState<number | null>(entry?.sleep_quality ?? null);
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const required = energy != null && mood != null && stress != null && motivation != null;

  return (
    <ModalShell title="Daily check-in" onClose={onClose}>
      <p className="text-xs text-muted-foreground -mt-2 mb-5">
        Energy, mood, stress and motivation are required to complete the day.
      </p>
      <div className="space-y-5">
        <Scale label="Energy" value={energy} onChange={setEnergy} />
        <Scale label="Mood" value={mood} onChange={setMood} />
        <Scale label="Stress" value={stress} onChange={setStress} />
        <Scale label="Motivation" value={motivation} onChange={setMotivation} />
        <Scale label="Sleep quality (optional)" value={sleep} onChange={setSleep} />
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Reflection
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="One thing you noticed today…"
            className="w-full rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/5"
          />
        </div>
      </div>
      <button
        disabled={!required}
        onClick={() =>
          onSave({
            energy,
            mood,
            stress,
            motivation,
            sleep_quality: sleep,
            notes: notes || null,
          })
        }
        className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        Submit now
      </button>
    </ModalShell>
  );
}
