import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/src/theme";

export function SoftOrbs() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[colors.lime + "33", colors.lime + "00"]}
        style={[styles.orb, styles.topRight]}
      />
      <LinearGradient
        colors={[colors.accent + "40", colors.accent + "00"]}
        style={[styles.orb, styles.bottomLeft]}
      />
      <LinearGradient
        colors={[colors.destructive + "33", colors.destructive + "00"]}
        style={[styles.orb, styles.midLeft]}
      />
      <LinearGradient
        colors={[colors.secondary + "59", colors.secondary + "00"]}
        style={[styles.orb, styles.bottomRight]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  topRight: {
    width: 280,
    height: 280,
    top: -100,
    right: -90,
  },
  bottomLeft: {
    width: 240,
    height: 240,
    bottom: 20,
    left: -110,
  },
  midLeft: {
    width: 160,
    height: 160,
    top: 300,
    left: -50,
  },
  bottomRight: {
    width: 140,
    height: 140,
    bottom: 100,
    right: 10,
  },
});
