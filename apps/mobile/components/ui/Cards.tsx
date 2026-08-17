import { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { borders, colors, radius, space } from "@/src/theme";

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function BrandCard({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type GradientProps = CardProps & {
  colorsStops: readonly [string, string, ...string[]];
  /** Decorative glow painted under the content, typically a `SoftOrb`. */
  orb?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function GradientCard({ children, colorsStops, orb, style, contentStyle }: GradientProps) {
  return (
    <LinearGradient
      colors={[...colorsStops]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, styles.overflow, style]}
    >
      {orb}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius["3xl"],
    padding: space.p5,
    borderWidth: borders.hairline,
    borderColor: colors.ringHairline,
  },
  overflow: { overflow: "hidden", position: "relative" },
  content: {
    position: "relative",
    zIndex: 1,
  },
});
