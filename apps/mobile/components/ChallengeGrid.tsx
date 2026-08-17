import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Check, Lock } from "@/components/ui/icons";
import {
  CHALLENGE_LENGTH,
  dayAvailability,
  type DailyEntry,
  type DayAvailability,
  type Profile,
} from "@feelgood/shared";
import { Kicker, Label } from "@/components/ui";
import { borders, colors, fonts, radius, space, typeScale, withAlpha } from "@/src/theme";

const DAYS = Array.from({ length: CHALLENGE_LENGTH }, (_, i) => i + 1);
const WEEK_LENGTH = 7;

const WEEKS: number[][] = [];
for (let i = 0; i < DAYS.length; i += WEEK_LENGTH) WEEKS.push(DAYS.slice(i, i + WEEK_LENGTH));

type StatsProps = {
  streak: number;
  completed: number;
};

export function ChallengeStats({ streak, completed }: StatsProps) {
  return (
    <View style={styles.stats}>
      <View style={styles.stat}>
        <Kicker>Streak</Kicker>
        <Label style={styles.statValue}>
          {streak} {streak === 1 ? "day" : "days"}
        </Label>
      </View>
      <View style={styles.stat}>
        <Kicker>Complete</Kicker>
        <Label style={styles.statValue}>
          {completed} of {CHALLENGE_LENGTH}
        </Label>
      </View>
    </View>
  );
}

type GridProps = {
  profile: Profile | null;
  entries: DailyEntry[];
  currentDay: number;
  onPressDay: (day: number, status: DayAvailability) => void;
};

export function ChallengeGrid({ profile, entries, currentDay, onPressDay }: GridProps) {
  const statuses = useMemo(
    () =>
      DAYS.map((n) =>
        profile
          ? dayAvailability(n, currentDay, entries, profile.challenge_start_date)
          : n === 1
            ? "today"
            : "future",
      ),
    [profile, entries, currentDay],
  );

  return (
    <>
      {WEEKS.map((weekDays, weekIndex) => (
        <View key={weekIndex} style={styles.week}>
          <Kicker style={styles.weekLabel}>Week {weekIndex + 1}</Kicker>
          <View style={styles.grid}>
            {weekDays.map((n) => {
              const status = statuses[n - 1];
              return (
                <Pressable
                  key={n}
                  onPress={() => onPressDay(n, status)}
                  style={[styles.cell, cellStyle(status)]}
                  accessibilityLabel={labelForStatus(n, status)}
                >
                  {status === "past_complete" ? (
                    <Check size={14} color={colors.primaryForeground} strokeWidth={2.5} />
                  ) : status === "future" ? (
                    <Lock size={12} color={colors.mutedForeground} strokeWidth={2} />
                  ) : (
                    <Label style={[styles.cellNum, status === "today" && styles.cellNumToday]}>
                      {n}
                    </Label>
                  )}
                </Pressable>
              );
            })}
            {weekDays.length < WEEK_LENGTH
              ? Array.from({ length: WEEK_LENGTH - weekDays.length }).map((_, i) => (
                  <View key={`pad-${i}`} style={styles.cellPad} />
                ))
              : null}
          </View>
        </View>
      ))}
    </>
  );
}

function cellStyle(status: DayAvailability) {
  switch (status) {
    case "today":
      return styles.cellToday;
    case "past_complete":
      return styles.cellComplete;
    case "past_incomplete":
      return styles.cellIncomplete;
    case "past_empty":
      return styles.cellEmpty;
    default:
      return styles.cellFuture;
  }
}

function labelForStatus(n: number, status: DayAvailability) {
  switch (status) {
    case "today":
      return `Day ${n}, today`;
    case "past_complete":
      return `Day ${n}, complete`;
    case "past_incomplete":
      return `Day ${n}, incomplete`;
    case "past_empty":
      return `Day ${n}, no entry`;
    default:
      return `Day ${n}, locked`;
  }
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", gap: space.md, marginBottom: space.lg },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    padding: space.p4,
    borderWidth: borders.hairline,
    borderColor: colors.ringHairline,
  },
  statValue: { marginTop: 6, fontSize: typeScale.bodyLg.fontSize },
  week: { marginBottom: space.lg },
  weekLabel: { marginBottom: space.sm },
  grid: { flexDirection: "row", gap: space.sm },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: borders.hairline,
  },
  cellPad: { flex: 1, aspectRatio: 1 },
  cellToday: {
    backgroundColor: withAlpha(colors.accent, 0.3),
    borderColor: colors.accent,
  },
  cellComplete: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cellIncomplete: {
    backgroundColor: colors.card,
    borderColor: withAlpha(colors.destructive, 0.6),
  },
  cellEmpty: {
    backgroundColor: colors.card,
    borderColor: colors.ringPrimary,
  },
  cellFuture: {
    backgroundColor: colors.muted,
    borderColor: colors.border,
    opacity: 0.55,
  },
  cellNum: {
    fontFamily: fonts.sansSemi,
    fontSize: typeScale.bodySm.fontSize,
  },
  cellNumToday: {
    color: colors.foreground,
  },
});
