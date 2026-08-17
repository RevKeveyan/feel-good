import { memo } from "react";
import { StyleSheet, View } from "react-native";
import type { OnboardingStep } from "@feelgood/shared";
import { SoftOrb } from "@/components/ui/SoftOrb";
import { backgroundGlow, boostedOpacity, colors, withAlpha } from "@/src/theme";

type Layer = { color: string; opacity: number };
type Tone = { bg: Layer; glowA: Layer; glowB: Layer };

const accent = (opacity: number): Layer => ({ color: colors.accent, opacity });
const blush = (opacity: number): Layer => ({ color: colors.destructive, opacity });
const secondary = (opacity: number): Layer => ({ color: colors.secondary, opacity });
const card: Layer = { color: colors.card, opacity: 1 };

/** Mirrors `STEP_TONES` in `src/routes/_authenticated/onboarding.tsx`, before the background boost. */
const STEP_TONES: Record<OnboardingStep, Tone> = {
  welcome: { bg: card, glowA: accent(0.45), glowB: blush(0.4) },
  why: { bg: blush(0.15), glowA: blush(0.45), glowB: blush(0.7) },
  goals: { bg: accent(0.12), glowA: accent(0.5), glowB: blush(0.4) },
  commitment: { bg: secondary(0.5), glowA: blush(0.45), glowB: accent(0.45) },
  wheel: { bg: card, glowA: accent(0.5), glowB: blush(0.45) },
  "why-statement": { bg: blush(0.12), glowA: blush(0.7), glowB: accent(0.45) },
  vision: { bg: secondary(0.4), glowA: blush(0.45), glowB: accent(0.4) },
  letter: { bg: card, glowA: blush(0.7), glowB: blush(0.4) },
  done: { bg: accent(0.15), glowA: accent(0.55), glowB: blush(0.55) },
};

/** Web `-top-40 -left-24 size-[28rem] blur-3xl` / `-bottom-40 -right-24 size-[30rem] blur-3xl`. */
const ORB_A = { size: 448, top: -160, left: -96 };
const ORB_B = { size: 480, bottom: -160, right: -96 };
const ORB_BLUR = 64;

type Props = {
  step: OnboardingStep;
};

/** Memoized: the onboarding screen owns every field's state and re-renders on each keystroke. */
export const StepToneBackground = memo(function StepToneBackground({ step }: Props) {
  const tone = STEP_TONES[step];

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        styles.base,
        { backgroundColor: withAlpha(tone.bg.color, boostedOpacity(tone.bg.opacity)) },
      ]}
    >
      <SoftOrb
        size={ORB_A.size}
        blur={ORB_BLUR}
        color={tone.glowA.color}
        opacity={boostedOpacity(tone.glowA.opacity)}
        falloff={backgroundGlow.falloff.background}
        top={ORB_A.top}
        left={ORB_A.left}
      />
      <SoftOrb
        size={ORB_B.size}
        blur={ORB_BLUR}
        color={tone.glowB.color}
        opacity={boostedOpacity(tone.glowB.opacity)}
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
