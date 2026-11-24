import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Body, Label } from "./Typography";
import { borders, colors, fonts, radius, space, typeScale, withAlpha } from "@/src/theme";

type Props = {
  title: string;
  done: boolean;
  subtitle?: string;
  onPress?: () => void;
  disabled?: boolean;
  trailing?: ReactNode;
  points?: number;
};

/** 24px status dot shared by every habit row. */
export function HabitStatusDot({ done }: { done: boolean }) {
  return (
    <View style={[styles.dot, done && styles.dotDone]}>
      {done ? <View style={styles.innerDot} /> : null}
    </View>
  );
}

/** Trailing points badge shared by every habit row. */
export function HabitPoints({ points, done }: { points: number; done: boolean }) {
  return (
    <Text style={[styles.points, done && styles.pointsDone]}>
      {done ? `+${points} pts` : `${points} pts`}
    </Text>
  );
}

/** Title and subtitle block shared by every habit row. */
export function HabitCopy({
  title,
  subtitle,
  done,
}: {
  title: string;
  subtitle?: string;
  done: boolean;
}) {
  return (
    <View style={styles.copy}>
      <Label style={[styles.title, done && styles.titleDone]}>{title}</Label>
      {subtitle ? (
        <Body size="sm" style={styles.sub}>
          {subtitle}
        </Body>
      ) : null}
    </View>
  );
}

/** Web habit row: `bg-card rounded-2xl p-4 ring-1` with a 24px status dot. */
export function HabitToggle({ title, done, subtitle, onPress, disabled, trailing, points }: Props) {
  return (
    <Pressable
      style={[styles.row, done ? styles.rowDone : styles.rowOpen]}
      onPress={onPress}
      disabled={disabled || !onPress}
    >
      <HabitStatusDot done={done} />
      <HabitCopy title={title} subtitle={subtitle} done={done} />
      {points != null ? <HabitPoints points={points} done={done} /> : null}
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    padding: space.p4,
    borderWidth: borders.hairline,
  },
  rowDone: {
    borderColor: colors.ringHairline,
  },
  rowOpen: {
    borderColor: colors.ringPrimary,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: borders.thick,
    borderColor: colors.ringPrimary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dotDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primaryForeground,
  },
  copy: { flex: 1 },
  title: {
    fontSize: typeScale.habitTitle.fontSize,
    lineHeight: typeScale.habitTitle.lineHeight,
  },
  titleDone: {
    textDecorationLine: "line-through",
    color: withAlpha(colors.mutedForeground, 0.6),
  },
  sub: {
    marginTop: 2,
  },
  points: {
    fontFamily: fonts.kicker,
    fontSize: typeScale.kicker.fontSize,
    lineHeight: typeScale.kicker.lineHeight,
    color: colors.primary,
    flexShrink: 0,
  },
  pointsDone: {
    color: colors.primary,
  },
});
