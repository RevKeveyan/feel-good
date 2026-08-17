import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { backgroundGlow, boostedOpacity, colors } from "@/src/theme";
import { SoftOrb } from "./SoftOrb";

type Orb = {
  key: string;
  size: number;
  color: string;
  opacity: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
};

const ORB_BLUR = 40;

/** Positions and sizes match the original circles; opacities are the same alphas, boosted. */
const ORBS: Orb[] = [
  { key: "lime", size: 280, color: colors.lime, opacity: 0.2, top: -100, right: -90 },
  { key: "accent", size: 240, color: colors.accent, opacity: 0.251, bottom: 20, left: -110 },
  { key: "blush", size: 160, color: colors.destructive, opacity: 0.2, top: 300, left: -50 },
  { key: "secondary", size: 140, color: colors.secondary, opacity: 0.349, bottom: 100, right: 10 },
];

export const SoftOrbs = memo(function SoftOrbs() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.base]}>
      {ORBS.map((orb) => (
        <SoftOrb
          key={orb.key}
          size={orb.size}
          blur={ORB_BLUR}
          color={orb.color}
          opacity={boostedOpacity(orb.opacity)}
          falloff={backgroundGlow.falloff.background}
          top={orb.top}
          left={orb.left}
          right={orb.right}
          bottom={orb.bottom}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  base: { overflow: "hidden" },
});
