import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, space, withAlpha } from "@/src/theme";

type Props = {
  progress: number;
};

/** Web `h-1.5 bg-black/10` track with a `from-lime to-accent` fill. */
export function ProgressBar({ progress }: Props) {
  const width = Math.max(0, Math.min(100, progress));
  return (
    <View style={styles.track}>
      <LinearGradient
        colors={[colors.lime, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${width}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: withAlpha(colors.pureBlack, 0.1),
    overflow: "hidden",
    marginTop: space.sm,
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
  },
});
