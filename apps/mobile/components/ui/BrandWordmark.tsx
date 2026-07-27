import { Image, StyleSheet, View } from "react-native";

type Props = {
  size?: "sm" | "md" | "lg";
};

const WIDTH = { sm: 160, md: 240, lg: 300 } as const;
const HEIGHT = { sm: 88, md: 132, lg: 165 } as const;

export function BrandWordmark({ size = "md" }: Props) {
  return (
    <View style={styles.wrap}>
      <Image
        source={require("../../assets/brand/tfgs-wordmark.png")}
        style={{ width: WIDTH[size], height: HEIGHT[size] }}
        resizeMode="contain"
        accessibilityLabel="The Feel Good Society"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
});
