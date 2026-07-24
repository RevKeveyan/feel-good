export const CHALLENGE_LENGTH = 55;

export type DailyEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  nourish: boolean;
  fuel: boolean;
  move_done: boolean;
  move_type: string | null;
  move_minutes: number | null;
  mindset: boolean;
  mindset_type: string | null;
  water_ml: number;
  energy: number | null;
  mood: number | null;
  stress: number | null;
  motivation: number | null;
  sleep_quality: number | null;
  notes: string | null;
};

export type Profile = {
  id: string;
  display_name: string | null;
  water_target_ml: number;
  challenge_start_date: string;
  onboarding_completed_at: string | null;
  avatar_path: string | null;
};

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function currentDay(startDateISO: string): number {
  const start = new Date(startDateISO + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
  return Math.max(1, Math.min(CHALLENGE_LENGTH, diff));
}

export function daysRemaining(startDateISO: string): number {
  return Math.max(0, CHALLENGE_LENGTH - currentDay(startDateISO));
}

export function dailyScore(entry: Partial<DailyEntry> | null, waterTargetMl: number): number {
  if (!entry) return 0;
  const habits = [entry.nourish, entry.fuel, entry.move_done, entry.mindset].filter(Boolean).length;
  const water = Math.min(1, (entry.water_ml ?? 0) / Math.max(1, waterTargetMl));
  return Math.round(habits * 16 + water * 36);
}

export function habitsComplete(entry: Partial<DailyEntry> | null, waterTargetMl?: number): number {
  if (!entry) return 0;
  const habits = [entry.nourish, entry.fuel, entry.move_done, entry.mindset].filter(Boolean).length;
  const hydrateComplete = waterTargetMl != null && (entry.water_ml ?? 0) >= waterTargetMl ? 1 : 0;
  return habits + hydrateComplete;
}

export function isCheckInComplete(entry: Partial<DailyEntry> | null): boolean {
  if (!entry) return false;
  return entry.energy != null && entry.mood != null && entry.stress != null && entry.motivation != null;
}

export function isDayComplete(entry: Partial<DailyEntry> | null): boolean {
  if (!entry) return false;
  return !!entry.nourish && !!entry.fuel && !!entry.move_done && !!entry.mindset && isCheckInComplete(entry);
}

export function computeStreak(entries: Partial<DailyEntry>[]): number {
  const byDate = new Map<string, Partial<DailyEntry>>();
  for (const e of entries) if (e.entry_date) byDate.set(e.entry_date, e);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cursor = new Date(today);
  let streak = 0;
  let consecutiveMisses = 0;
  let firstIteration = true;
  while (true) {
    const iso = toISO(cursor);
    const complete = isDayComplete(byDate.get(iso) ?? null);
    if (complete) {
      streak += 1;
      consecutiveMisses = 0;
    } else if (firstIteration) {
      // today in progress
    } else {
      consecutiveMisses += 1;
      if (consecutiveMisses >= 2) break;
    }
    firstIteration = false;
    cursor.setDate(cursor.getDate() - 1);
    if (streak > 400) break;
  }
  return streak;
}

export function missedYesterday(entries: Partial<DailyEntry>[], challengeStartISO: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const start = new Date(challengeStartISO + "T00:00:00");
  if (yesterday < start) return false;
  const iso = toISO(yesterday);
  const byDate = new Map<string, Partial<DailyEntry>>();
  for (const e of entries) if (e.entry_date) byDate.set(e.entry_date, e);
  return !isDayComplete(byDate.get(iso) ?? null);
}

export function completedDaysCount(entries: Partial<DailyEntry>[]): number {
  return entries.filter((e) => isDayComplete(e)).length;
}

export function checkInsCount(entries: Partial<DailyEntry>[]): number {
  return entries.filter((e) => isCheckInComplete(e)).length;
}

export function longestStreak(entries: Partial<DailyEntry>[]): number {
  const dates = [...new Set(entries.map((e) => e.entry_date).filter(Boolean))].sort();
  let best = 0;
  let current = 0;
  let previous: Date | null = null;
  for (const iso of dates) {
    const complete = isDayComplete(entries.find((e) => e.entry_date === iso) ?? null);
    if (!complete) {
      current = 0;
      previous = null;
      continue;
    }
    const day = new Date(`${iso}T00:00:00`);
    if (previous) {
      const diff = Math.round((day.getTime() - previous.getTime()) / 86400000);
      current = diff === 1 ? current + 1 : 1;
    } else {
      current = 1;
    }
    previous = day;
    best = Math.max(best, current);
  }
  return best;
}

export function currentWeek(startDateISO: string): number {
  return Math.max(1, Math.min(8, Math.ceil(currentDay(startDateISO) / 7)));
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const MOVE_TYPES = ["Walk", "Gym", "Pilates", "Yoga", "Swim", "Run", "Strength", "Cycling", "Other"];

export const MINDSET_TYPES = [
  "Meditation",
  "Gratitude",
  "Journalling",
  "Breathwork",
  "Visualisation",
  "Reading",
  "Other",
];

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}
