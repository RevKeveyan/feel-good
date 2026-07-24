import { type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Body, Kicker, Label } from "./Typography";
import { colors, radius } from "@/src/theme";

type Props = {
  title: string;
  done: boolean;
  subtitle?: string;
  onPress: () => void;
  trailing?: ReactNode;
  points?: number;
};

export function HabitToggle({ title, done, subtitle, onPress, trailing, points }: Props) {
  return (
    <Pressable
      style={[styles.row, done ? styles.rowDone : styles.rowOpen]}
      onPress={onPress}
    >
      <View style={[styles.dot, done && styles.dotDone]}>
        {done ? <View style={styles.innerDot} /> : null}
      </View>
      <View style={styles.copy}>
        <Label style={[styles.title, done && styles.titleDone]}>{title}</Label>
        {subtitle ? (
          <Body size="sm" style={styles.sub}>
            {subtitle}
          </Body>
        ) : null}
      </View>
      {points != null ? (
        <Kicker style={[styles.points, done && styles.pointsDone]}>
          {done ? `+${points} pts` : `${points} pts`}
        </Kicker>
      ) : null}
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
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
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  dotDone: {
    backgroundColor: colors.primary,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  copy: { flex: 1 },
  title: {
    fontSize: 15,
  },
  titleDone: {
    textDecorationLine: "line-through",
    color: colors.mutedForeground,
  },
  sub: {
    marginTop: 2,
  },
  points: {
    color: colors.primary,
    flexShrink: 0,
  },
  pointsDone: {
    color: colors.mutedForeground,
  },
});
