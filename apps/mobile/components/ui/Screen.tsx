import { type ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, space } from "@/src/theme";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  edges?: ("top" | "bottom" | "left" | "right")[];
};

export function Screen({ children, style, edges = ["top", "bottom"] }: Props) {
  return (
    <SafeAreaView edges={edges} style={styles.safe}>
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, paddingHorizontal: space.screenX },
});
