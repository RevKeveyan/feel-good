import { type ReactNode } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/src/theme";

type KeyboardScreenProps = {
  children: ReactNode;
  background?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  edges?: ("top" | "right" | "bottom" | "left")[];
};

export function KeyboardScreen({
  children,
  background,
  contentContainerStyle,
  style,
  edges = ["top", "right", "bottom", "left"],
}: KeyboardScreenProps) {
  return (
    <SafeAreaView style={[styles.root, style]} edges={edges}>
      {background}
      <ScrollView
        style={styles.flex}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        bounces={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
