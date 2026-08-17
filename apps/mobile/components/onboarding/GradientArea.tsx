import { type ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { borders, colors, radius } from "@/src/theme";
import { DiagonalGradient } from "./DiagonalGradient";

type Props = {
  colorsStops: readonly [string, string, ...string[]];
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  hairline?: boolean;
  backdrop?: ReactNode;
};

/** Web `rounded-3xl ring-1 ring-black/5 bg-gradient-to-br` panel. */
export function GradientArea({
  colorsStops,
  children,
  style,
  contentStyle,
  hairline = true,
  backdrop,
}: Props) {
  return (
    <DiagonalGradient
      colorsStops={colorsStops}
      style={[styles.wrap, hairline && styles.hairline, style]}
      contentStyle={contentStyle}
      backdrop={backdrop}
    >
      {children}
    </DiagonalGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius["3xl"],
    overflow: "hidden",
  },
  hairline: {
    borderWidth: borders.hairline,
    borderColor: colors.ringHairline,
  },
});
