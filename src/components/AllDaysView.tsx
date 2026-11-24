import { useMemo, useState } from "react";
import { Check, ClipboardCheck, Lock, Minus, X } from "lucide-react";
import { ContactUsCard } from "@/components/ContactUsCard";
import {
  CHALLENGE_LENGTH,
  dailyScore,
  formatDate,
  isDayComplete,
  type DailyEntry,
} from "@/lib/challenge";

type DayStatus = "done" | "today" | "missed" | "locked";

export type AllDaysViewProps = {
  startDate: string;
  entries: DailyEntry[];
  today: string;
  waterTarget: number;
  streak: number;
  completed: number;
  currentDayNum: number;
  onOpenToday: () => void;
  finalCheckInDone: boolean;
  onOpenFinalCheckIn: () => void;
};

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const CELL_BASE =
  "relative flex aspect-square items-center justify-center rounded-2xl transition";

const CELL_STYLES: Record<DayStatus, string> = {
  done: "bg-primary text-primary-foreground shadow-sm shadow-primary/20",
  today: "bg-secondary text-foreground ring-2 ring-primary",
  missed: "bg-card ring-1 ring-foreground/10",
  locked: "bg-card/60 ring-1 ring-foreground/5",
};

export function AllDaysView({
  startDate,
  entries,
  today,
  waterTarget,
  streak,
  completed,
  currentDayNum,
  onOpenToday,
  finalCheckInDone,
  onOpenFinalCheckIn,
}: AllDaysViewProps) {
  const [openDay, setOpenDay] = useState<number | null>(null);

  const byDate = useMemo(() => {
    const map = new Map<string, DailyEntry>();
    for (const e of entries) map.set(e.entry_date, e);
    return map;
  }, [entries]);

  const weeks = useMemo(() => {
    const out: { week: number; days: number[] }[] = [];
    for (let i = 1; i <= CHALLENGE_LENGTH; i += 7) {
      const week = Math.ceil(i / 7);
      const days: number[] = [];
      for (let d = i; d < i + 7 && d <= CHALLENGE_LENGTH; d++) days.push(d);
      out.push({ week, days });
    }
    return out;
  }, []);

  function statusFor(day: number): DayStatus {
    if (day > currentDayNum) return "locked";
    const entry = byDate.get(addDays(startDate, day - 1)) ?? null;
    if (entry && isDayComplete(entry)) return "done";
    if (day === currentDayNum) return "today";
    return "missed";
  }

  const finalReached = currentDayNum >= CHALLENGE_LENGTH;
  const finalStatus: DayStatus = finalCheckInDone ? "done" : finalReached ? "today" : "locked";
  const finalOpenable = finalCheckInDone || finalReached;

  const openEntry = openDay != null ? byDate.get(addDays(startDate, openDay - 1)) ?? null : null;

  return (
    <div className="pb-12">
      <header className="px-6 pt-10 pb-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          The Feel Good Challenge
        </p>
        <h1 className="font-display text-4xl italic tracking-tight">All days</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Day {currentDayNum} of {CHALLENGE_LENGTH}. Open today to log, or look back at a day you
          have already reached.
        </p>
      </header>

      <section className="px-6 mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-card p-4 ring-1 ring-foreground/5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Streak</p>
          <p className="mt-1 text-2xl font-display italic">
            {streak} <span className="text-sm font-sans not-italic font-normal text-muted-foreground">days</span>
          </p>
        </div>
        <div className="rounded-3xl bg-card p-4 ring-1 ring-foreground/5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Complete</p>
          <p className="mt-1 text-2xl font-display italic">
            {completed} <span className="text-sm font-sans not-italic font-normal text-muted-foreground">of {CHALLENGE_LENGTH}</span>
          </p>
        </div>
      </section>

      <section className="px-6 mb-8">
        <button
          onClick={onOpenToday}
          className="w-full rounded-full bg-foreground py-4 text-sm font-semibold uppercase tracking-widest text-background shadow-lg shadow-foreground/10 transition hover:opacity-90"
        >
          Open today
        </button>
      </section>

      <section className="px-6 space-y-5">
        {weeks.map(({ week, days }) => {
          const isLastWeek = week === weeks.length;
          return (
            <div key={week}>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Week {week}
              </p>
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const status = statusFor(day);
                  const reached = status !== "locked";
                  return (
                    <button
                      key={day}
                      onClick={() => reached && setOpenDay(day)}
                      className={`${CELL_BASE} ${CELL_STYLES[status]} ${reached ? "cursor-pointer hover:opacity-85" : "cursor-default"}`}
                      title={reached ? formatDate(addDays(startDate, day - 1)) : "Locked"}
                    >
                      {status === "done" && <Check className="size-4" />}
                      {status === "today" && <span className="text-sm font-semibold">{day}</span>}
                      {status === "missed" && <Minus className="size-4 text-muted-foreground" />}
                      {status === "locked" && <Lock className="size-3.5 text-muted-foreground/60" />}
                    </button>
                  );
                })}

                {isLastWeek && (
                  <button
                    onClick={() => finalOpenable && onOpenFinalCheckIn()}
                    className={`${CELL_BASE} ${CELL_STYLES[finalStatus]} ${finalOpenable ? "cursor-pointer hover:opacity-85" : "cursor-default"}`}
                    title={
                      finalCheckInDone
                        ? "Final check-in form, complete"
                        : finalReached
                          ? "Final check-in form, ready for you"
                          : "Final check-in form, opens on Day 55"
                    }
                  >
                    {finalCheckInDone && <Check className="size-4" />}
                    {!finalCheckInDone && finalReached && <ClipboardCheck className="size-4" />}
                    {!finalCheckInDone && !finalReached && (
                      <Lock className="size-3.5 text-muted-foreground/60" />
                    )}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </section>

      <ContactUsCard />


      {/* Day detail sheet */}
      {openDay != null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            aria-label="Close"
            onClick={() => setOpenDay(null)}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md rounded-t-3xl bg-background p-6 pb-10 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {formatDate(addDays(startDate, openDay - 1))}
                </p>
                <h3 className="font-display text-2xl italic mt-0.5">
                  Day {openDay}{" "}
                  <span className="text-sm font-sans not-italic font-normal text-muted-foreground">
                    of {CHALLENGE_LENGTH}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setOpenDay(null)}
                className="size-9 rounded-full bg-card ring-1 ring-foreground/10 flex items-center justify-center"
                title="Close"
              >
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>

            {openEntry ? (
              <>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-4xl font-display italic">{dailyScore(openEntry, waterTarget)}</span>
                  <span className="text-xs text-muted-foreground">daily score</span>
                </div>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {[
                    { label: "Nourish", done: !!openEntry.nourish },
                    { label: "Fuel", done: !!openEntry.fuel },
                    { label: "Move", done: !!openEntry.move_done },
                    { label: "Mindset", done: !!openEntry.mindset },
                    {
                      label: "Hydrate",
                      done: (openEntry.water_ml ?? 0) >= waterTarget,
                    },
                  ].map((h) => (
                    <div
                      key={h.label}
                      className={`rounded-xl p-2 text-center ring-1 ${h.done ? "bg-secondary/60 ring-primary/30" : "bg-card ring-foreground/10"}`}
                    >
                      {h.done ? (
                        <Check className="mx-auto size-4" />
                      ) : (
                        <Minus className="mx-auto size-4 text-muted-foreground" />
                      )}
                      <p className="mt-1 text-[9px] uppercase tracking-wide text-muted-foreground">{h.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {[
                    { label: "Energy", value: openEntry.energy },
                    { label: "Mood", value: openEntry.mood },
                    { label: "Stress", value: openEntry.stress },
                    { label: "Motivation", value: openEntry.motivation },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl bg-card p-2 text-center ring-1 ring-foreground/10">
                      <p className="text-sm font-semibold">{m.value != null ? m.value : "-"}</p>
                      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
                {openEntry.notes && (
                  <p className="mt-4 rounded-xl bg-card p-3 text-sm text-muted-foreground ring-1 ring-foreground/10">
                    "{openEntry.notes}"
                  </p>
                )}
              </>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">
                You reached this day but nothing was logged.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
