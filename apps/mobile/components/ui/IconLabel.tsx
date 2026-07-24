import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  icon: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  gap?: number;
};

export function IconLabel({ icon, children, style, gap = 8 }: Props) {
  return (
    <View style={[styles.row, { gap }, style]}>
      {icon}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
