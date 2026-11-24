import { memo } from "react";
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "@/src/theme";

type Props = {
  size?: "compact" | "header" | "headerLg" | "modal" | "sm" | "md" | "lg";
  style?: StyleProp<ViewStyle>;
};

const SOURCE = require("../../assets/brand/tfgs-wordmark.png");

export const BrandWordmark = memo(function BrandWordmark({ size = "md", style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={SOURCE}
        style={[styles[size], { tintColor: colors.foreground }]}
        resizeMode="contain"
        accessibilityLabel="The Feel Good Society"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  compact: { width: 44, height: 44 },
  header: { width: 72, height: 72 },
  headerLg: { width: 96, height: 96 },
  modal: { width: 112, height: 112 },
  sm: { width: 160, height: 88 },
  md: { width: 240, height: 132 },
  lg: { width: 300, height: 165 },
});
