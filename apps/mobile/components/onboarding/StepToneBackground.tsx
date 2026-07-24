import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { OnboardingStep } from "@feelgood/shared";
import { colors } from "@/src/theme";

const STEP_TONES: Record<OnboardingStep, { bg: string; glowA: string; glowB: string }> = {
  welcome: { bg: colors.card, glowA: colors.accent + "73", glowB: colors.destructive + "66" },
  why: { bg: colors.destructive + "26", glowA: colors.destructive + "73", glowB: colors.secondary + "B3" },
  goals: { bg: colors.accent + "1F", glowA: colors.accent + "80", glowB: colors.destructive + "66" },
  commitment: { bg: colors.secondary + "80", glowA: colors.destructive + "73", glowB: colors.accent + "73" },
  wheel: { bg: colors.card, glowA: colors.accent + "80", glowB: colors.destructive + "73" },
  "why-statement": { bg: colors.destructive + "1F", glowA: colors.secondary + "B3", glowB: colors.accent + "73" },
  vision: { bg: colors.secondary + "66", glowA: colors.destructive + "73", glowB: colors.accent + "66" },
  letter: { bg: colors.card, glowA: colors.secondary + "B3", glowB: colors.destructive + "66" },
  done: { bg: colors.accent + "26", glowA: colors.accent + "8C", glowB: colors.destructive + "8C" },
};

type Props = {
  step: OnboardingStep;
};

export function StepToneBackground({ step }: Props) {
  const tone = STEP_TONES[step];
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: tone.bg }]}>
      <LinearGradient
        colors={[tone.glowA, "transparent"]}
        style={styles.glowTopLeft}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={[tone.glowB, "transparent"]}
        style={styles.glowBottomRight}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  glowTopLeft: {
    position: "absolute",
    width: 420,
    height: 420,
    top: -140,
    left: -140,
    borderRadius: 999,
    opacity: 0.45,
  },
  glowBottomRight: {
    position: "absolute",
    width: 450,
    height: 450,
    bottom: -160,
    right: -140,
    borderRadius: 999,
    opacity: 0.4,
  },
});
