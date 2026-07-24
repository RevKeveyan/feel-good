import { Pressable, StyleSheet, Text } from "react-native";
import { ImagePlus } from "@/components/ui/icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, gradients, radius } from "@/src/theme";

type Props = {
  onPress: () => void;
  uploading?: boolean;
  disabled?: boolean;
};

export function VisionAddTile({ onPress, uploading, disabled }: Props) {
  return (
    <Pressable
      style={[styles.cell, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || uploading}
    >
      <LinearGradient
        colors={[...gradients.visionAdd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.inner}
      >
        <ImagePlus size={32} color={colors.foreground + "B3"} strokeWidth={2} />
        <Text style={styles.label}>{uploading ? "Uploading…" : "Add image"}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: radius["2xl"],
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.destructive + "80",
    overflow: "hidden",
  },
  disabled: { opacity: 0.5 },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.mutedForeground,
  },
});
