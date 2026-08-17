import { memo } from "react";
import { Image, StyleSheet, View } from "react-native";

type Props = {
  size?: "sm" | "md" | "lg";
};

const SOURCE = require("../../assets/brand/tfgs-wordmark.png");

export const BrandWordmark = memo(function BrandWordmark({ size = "md" }: Props) {
  return (
    <View style={styles.wrap}>
      <Image
        source={SOURCE}
        style={styles[size]}
        resizeMode="contain"
        accessibilityLabel="The Feel Good Society"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  sm: { width: 160, height: 88 },
  md: { width: 240, height: 132 },
  lg: { width: 300, height: 165 },
});
