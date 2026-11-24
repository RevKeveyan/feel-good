import { Pressable, StyleSheet, Text } from "react-native";
import { ImagePlus } from "@/components/ui/icons";
import {
  borders,
  colors,
  fonts,
  gradients,
  iconSizes,
  opacity,
  radius,
  space,
  typeScale,
  withAlpha,
} from "@/src/theme";
import { DiagonalGradient } from "./DiagonalGradient";

type Props = {
  onPress: () => void;
  uploading?: boolean;
  disabled?: boolean;
  tileWidth: number;
};

export function VisionAddTile({ onPress, uploading, disabled, tileWidth }: Props) {
  return (
    <Pressable
      style={[
        styles.cell,
        { width: tileWidth, height: tileWidth },
        (disabled || uploading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || uploading}
    >
      <DiagonalGradient
        colorsStops={gradients.visionAdd}
        style={styles.fill}
        contentStyle={styles.inner}
      >
        <ImagePlus
          size={iconSizes.xl}
          color={withAlpha(colors.foreground, 0.7)}
          strokeWidth={2}
        />
        <Text style={styles.label}>{uploading ? "Uploading…" : "Add image"}</Text>
      </DiagonalGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignSelf: "flex-start",
    borderRadius: radius["2xl"],
    borderWidth: borders.thick,
    borderStyle: "dashed",
    borderColor: withAlpha(colors.primary, 0.5),
    overflow: "hidden",
  },
  disabled: { opacity: opacity.disabledSoft },
  fill: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: typeScale.bodySm.fontSize,
    color: colors.mutedForeground,
  },
});
