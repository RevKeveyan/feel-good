import { type ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius } from "@/src/theme";

type Props = {
  colorsStops: readonly [string, string, ...string[]];
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
};

export function GradientArea({ colorsStops, children, style, padded = true }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <LinearGradient
        colors={[...colorsStops]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.inner, padded && styles.padded]}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius["3xl"],
    borderWidth: 1,
    borderColor: colors.ringHairline,
    overflow: "hidden",
    marginBottom: 12,
  },
  inner: { width: "100%" },
  padded: { padding: 16 },
});
