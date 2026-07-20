import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/src/theme";

type Props = {
  size?: "sm" | "md" | "lg";
};

export function BrandWordmark({ size = "md" }: Props) {
  const theSize = size === "lg" ? 18 : size === "sm" ? 12 : 14;
  const mainSize = size === "lg" ? 42 : size === "sm" ? 26 : 34;
  const societySize = size === "lg" ? 28 : size === "sm" ? 18 : 22;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.line, { fontSize: theSize }]}>The</Text>
      <Text style={[styles.line, styles.main, { fontSize: mainSize }]}>Feel Good</Text>
      <Text style={[styles.line, { fontSize: societySize }]}>Society</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  line: {
    fontFamily: fonts.brand,
    color: colors.foreground,
    textAlign: "center",
    lineHeight: undefined,
  },
  main: { marginVertical: 2 },
});
