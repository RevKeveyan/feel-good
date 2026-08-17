import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  colorsStops: readonly [string, string, ...string[]];
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  /** Decorative layer painted under the content, e.g. an inner glow. */
  backdrop?: ReactNode;
};

/** Web `bg-gradient-to-br` — top-left to bottom-right, stops spread evenly. */
export function DiagonalGradient({
  colorsStops,
  children,
  style,
  contentStyle,
  backdrop,
}: Props) {
  return (
    <LinearGradient
      colors={colorsStops as unknown as readonly [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={style}
    >
      {backdrop}
      <View style={contentStyle}>{children}</View>
    </LinearGradient>
  );
}
