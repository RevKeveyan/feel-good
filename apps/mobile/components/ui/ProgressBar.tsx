import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, gradients } from "@/src/theme";

type Props = {
  progress: number;
};

export function ProgressBar({ progress }: Props) {
  const width = Math.max(0, Math.min(100, progress));
  return (
    <View style={styles.track}>
      <LinearGradient
        colors={[...gradients.progress]}
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
    backgroundColor: colors.border,
    overflow: "hidden",
    marginTop: 8,
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
  },
});
