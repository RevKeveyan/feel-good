import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { OnboardingStep } from "@feelgood/shared";
import { SoftOrb } from "@/components/ui/SoftOrb";
import { backgroundGlow, colors, withAlpha } from "@/src/theme";

type Glow = { color: string; opacity: number };
type Tone = {
  bg: readonly [string, string, ...string[]];
  glowA: Glow;
  glowB: Glow;
};

const STEP_TONES: Record<OnboardingStep, Tone> = {
  welcome: {
    bg: [colors.card, colors.background],
    glowA: { color: colors.accent, opacity: 0.4 },
    glowB: { color: colors.primary, opacity: 0.35 },
  },
  why: {
    bg: [withAlpha(colors.primary, 0.2), colors.card, withAlpha(colors.secondary, 0.3)],
    glowA: { color: colors.primary, opacity: 0.4 },
    glowB: { color: colors.secondary, opacity: 0.6 },
  },
  goals: {
    bg: [withAlpha(colors.secondary, 0.15), colors.card, withAlpha(colors.secondary, 0.2)],
    glowA: { color: colors.secondary, opacity: 0.4 },
    glowB: { color: colors.primary, opacity: 0.35 },
  },
  commitment: {
    bg: [withAlpha(colors.secondary, 0.3), colors.card, withAlpha(colors.secondary, 0.25)],
    glowA: { color: colors.primary, opacity: 0.4 },
    glowB: { color: colors.accent, opacity: 0.45 },
  },
  wheel: {
    bg: [colors.card, colors.background, withAlpha(colors.secondary, 0.15)],
    glowA: { color: colors.secondary, opacity: 0.4 },
    glowB: { color: colors.primary, opacity: 0.35 },
  },
  "why-statement": {
    bg: [withAlpha(colors.primary, 0.15), colors.card, withAlpha(colors.secondary, 0.25)],
    glowA: { color: colors.secondary, opacity: 0.6 },
    glowB: { color: colors.accent, opacity: 0.4 },
  },
  vision: {
    bg: [withAlpha(colors.secondary, 0.25), colors.card, withAlpha(colors.primary, 0.2)],
    glowA: { color: colors.primary, opacity: 0.4 },
    glowB: { color: colors.secondary, opacity: 0.35 },
  },
  letter: {
    bg: [colors.card, colors.background, withAlpha(colors.secondary, 0.2)],
    glowA: { color: colors.secondary, opacity: 0.6 },
    glowB: { color: colors.primary, opacity: 0.35 },
  },
  done: {
    bg: [withAlpha(colors.secondary, 0.2), colors.card, withAlpha(colors.primary, 0.25)],
    glowA: { color: colors.accent, opacity: 0.5 },
    glowB: { color: colors.primary, opacity: 0.45 },
  },
};

const ORB_A = { size: 448, top: -160, left: -96 };
const ORB_B = { size: 480, bottom: -160, right: -96 };
const ORB_BLUR = 64;

type Props = {
  step: OnboardingStep;
};

export const StepToneBackground = memo(function StepToneBackground({ step }: Props) {
  const tone = STEP_TONES[step];

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.base]}>
      <LinearGradient
        colors={tone.bg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SoftOrb
        size={ORB_A.size}
        blur={ORB_BLUR}
        color={tone.glowA.color}
        opacity={tone.glowA.opacity}
        falloff={backgroundGlow.falloff.background}
        top={ORB_A.top}
        left={ORB_A.left}
      />
      <SoftOrb
        size={ORB_B.size}
        blur={ORB_BLUR}
        color={tone.glowB.color}
        opacity={tone.glowB.opacity}
        falloff={backgroundGlow.falloff.background}
        bottom={ORB_B.bottom}
        right={ORB_B.right}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  base: { overflow: "hidden" },
});
