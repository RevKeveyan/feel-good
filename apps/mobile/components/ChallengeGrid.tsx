import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Check, ClipboardCheck, Lock, Minus } from "@/components/ui/icons";
import {
  CHALLENGE_LENGTH,
  dayAvailability,
  type DailyEntry,
  type DayAvailability,
  type Profile,
} from "@feelgood/shared";
import { Body, Kicker, Label, StatValue } from "@/components/ui";
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
        <View style={styles.statRow}>
          <StatValue size="md">{streak}</StatValue>
          <Body size="md" style={styles.statUnit}>
            {streak === 1 ? "day" : "days"}
          </Body>
        </View>
      </View>
      <View style={styles.stat}>
        <Kicker>Complete</Kicker>
        <View style={styles.statRow}>
          <StatValue size="md">{completed}</StatValue>
          <Body size="md" style={styles.statUnit}>
            of {CHALLENGE_LENGTH}
          </Body>
        </View>
      </View>
    </View>
  );
}

type GridProps = {
  profile: Profile | null;
  entries: DailyEntry[];
  currentDay: number;
  onPressDay: (day: number, status: DayAvailability) => void;
  onPressFinalCheckIn?: () => void;
};

export function ChallengeGrid({
  profile,
  entries,
  currentDay,
  onPressDay,
  onPressFinalCheckIn,
}: GridProps) {
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

  const finalUnlocked = currentDay >= CHALLENGE_LENGTH;

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
                    <Check size={16} color={colors.primaryForeground} strokeWidth={2} />
                  ) : status === "future" ? (
                    <Lock
                      size={14}
                      color={withAlpha(colors.mutedForeground, 0.6)}
                      strokeWidth={2}
                    />
                  ) : status === "past_incomplete" || status === "past_empty" ? (
                    <Minus size={16} color={colors.mutedForeground} strokeWidth={2} />
                  ) : (
                    <Label style={[styles.cellNum, status === "today" && styles.cellNumToday]}>
                      {n}
                    </Label>
                  )}
                </Pressable>
              );
            })}
            {weekIndex === WEEKS.length - 1 && weekDays.length < WEEK_LENGTH ? (
              <Pressable
                onPress={() => {
                  if (!finalUnlocked) return;
                  onPressFinalCheckIn?.();
                }}
                style={[styles.cell, finalUnlocked ? styles.cellToday : styles.cellFuture]}
                accessibilityLabel={
                  finalUnlocked ? "Final check-in form" : "Final check-in form locked until Day 55"
                }
              >
                {finalUnlocked ? (
                  <ClipboardCheck size={16} color={colors.foreground} strokeWidth={2} />
                ) : (
                  <Lock
                    size={14}
                    color={withAlpha(colors.mutedForeground, 0.6)}
                    strokeWidth={2}
                  />
                )}
              </Pressable>
            ) : weekDays.length < WEEK_LENGTH ? (
              Array.from({ length: WEEK_LENGTH - weekDays.length }).map((_, i) => (
                <View key={`pad-${i}`} style={styles.cellPad} />
              ))
            ) : null}
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
    case "past_empty":
      return styles.cellMissed;
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
    borderRadius: radius["3xl"],
    padding: space.p4,
    borderWidth: borders.hairline,
    borderColor: colors.ringHairline,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: space.xs,
    marginTop: 6,
  },
  statUnit: { color: colors.mutedForeground },
  week: { marginBottom: space.lg },
  weekLabel: { marginBottom: space.sm },
  grid: { flexDirection: "row", gap: space.sm },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius["2xl"],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: borders.hairline,
  },
  cellPad: { flex: 1, aspectRatio: 1 },
  cellToday: {
    backgroundColor: colors.secondary,
    borderWidth: borders.thick,
    borderColor: colors.primary,
  },
  cellComplete: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cellMissed: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  cellFuture: {
    backgroundColor: withAlpha(colors.card, 0.6),
    borderColor: colors.ringHairline,
  },
  cellNum: {
    fontFamily: fonts.sansSemi,
    fontSize: typeScale.bodyMd.fontSize,
  },
  cellNumToday: {
    color: colors.foreground,
  },
});
