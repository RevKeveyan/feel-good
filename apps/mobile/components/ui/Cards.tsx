import { type ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius } from "@/src/theme";

type CardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function BrandCard({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type GradientProps = CardProps & {
  colorsStops: readonly [string, string, ...string[]];
  orb?: boolean;
};

export function GradientCard({ children, colorsStops, orb, style }: GradientProps) {
  return (
    <LinearGradient colors={[...colorsStops]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, styles.overflow, style]}>
      {orb ? <View style={styles.orb} /> : null}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius["3xl"],
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overflow: { overflow: "hidden", position: "relative" },
  orb: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.accent,
    opacity: 0.25,
  },
});
