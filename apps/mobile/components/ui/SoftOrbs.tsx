import { StyleSheet, View } from "react-native";
import { colors } from "@/src/theme";

export function SoftOrbs() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.orb, styles.topRight]} />
      <View style={[styles.orb, styles.bottomLeft]} />
      <View style={[styles.orb, styles.midLeft]} />
      <View style={[styles.orb, styles.bottomRight]} />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: colors.card,
  },
  topRight: {
    width: 220,
    height: 220,
    top: -80,
    right: -70,
    backgroundColor: colors.card,
  },
  bottomLeft: {
    width: 180,
    height: 180,
    bottom: 40,
    left: -90,
    backgroundColor: colors.white,
    opacity: 0.7,
  },
  midLeft: {
    width: 70,
    height: 70,
    top: 320,
    left: -20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bottomRight: {
    width: 90,
    height: 90,
    bottom: 120,
    right: 24,
    backgroundColor: colors.secondary,
    opacity: 0.35,
  },
});
