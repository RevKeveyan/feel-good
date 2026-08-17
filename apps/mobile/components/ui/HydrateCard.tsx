import { Pressable, StyleSheet, Text, View } from "react-native";
import { BrandCard } from "./Cards";
import { HabitCopy, HabitPoints, HabitStatusDot } from "./HabitToggle";
import { colors, fonts, radius, space, typeScale, withAlpha } from "@/src/theme";

const WATER_INCREMENT = 250;
const DOT_HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

type Props = {
  waterMl: number;
  targetMl: number;
  points: number;
  /** Omit to render a read-only row without the stepper or tap-to-complete. */
  onChange?: (waterMl: number) => void;
};

export function HydrateCard({ waterMl, targetMl, points, onChange }: Props) {
  const hasTarget = targetMl > 0;
  const done = hasTarget && waterMl >= targetMl;
  const progress = hasTarget ? Math.min(100, (waterMl / targetMl) * 100) : 0;
  const canComplete = !!onChange && hasTarget && !done;

  return (
    <BrandCard style={[styles.card, done ? styles.cardDone : styles.cardOpen]}>
      <View style={styles.row}>
        <Pressable
          onPress={canComplete ? () => onChange(targetMl) : undefined}
          disabled={!canComplete}
          hitSlop={DOT_HIT_SLOP}
          accessibilityRole="checkbox"
          accessibilityLabel="Hydrate"
          accessibilityState={{ checked: done, disabled: !canComplete }}
        >
          <HabitStatusDot done={done} />
        </Pressable>
        <HabitCopy
          title="Hydrate"
          subtitle={`${waterMl / 1000}L of ${targetMl / 1000}L`}
          done={done}
        />
        <HabitPoints points={points} done={done} />
        {onChange ? (
          <View style={styles.stepper}>
            <Pressable
              style={styles.stepBtn}
              onPress={() => onChange(Math.max(0, waterMl - WATER_INCREMENT))}
              disabled={waterMl <= 0}
              accessibilityRole="button"
              accessibilityLabel="Remove water"
            >
              <Text style={styles.stepText}>−</Text>
            </Pressable>
            <Pressable
              style={[styles.stepBtn, styles.stepBtnPrimary]}
              onPress={() => onChange(waterMl + WATER_INCREMENT)}
              accessibilityRole="button"
              accessibilityLabel="Add water"
            >
              <Text style={[styles.stepText, styles.stepTextPrimary]}>+</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
    </BrandCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius["2xl"],
    padding: space.p4,
  },
  cardOpen: { borderColor: colors.ringPrimary },
  cardDone: { borderColor: colors.ringHairline },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    marginBottom: space.lg,
  },
  stepper: { flexDirection: "row", gap: space.sm, flexShrink: 0 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnPrimary: { backgroundColor: colors.primary },
  stepText: {
    fontSize: typeScale.bodyMd.fontSize,
    color: colors.foreground,
    fontFamily: fonts.sansSemi,
  },
  stepTextPrimary: { color: colors.primaryForeground },
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: withAlpha(colors.primary, 0.1),
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
});
