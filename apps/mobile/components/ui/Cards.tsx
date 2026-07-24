import { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius } from "@/src/theme";

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
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
    <LinearGradient
      colors={[...colorsStops]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, styles.overflow, style]}
    >
      {orb ? (
        <LinearGradient
          colors={[colors.accent + "66", colors.accent + "00"]}
          style={styles.orb}
        />
      ) : null}
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
    borderColor: colors.ringHairline,
  },
  overflow: { overflow: "hidden", position: "relative" },
  orb: {
    position: "absolute",
    right: -50,
    top: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
});
