import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  borders,
  colors,
  fonts,
  gradients,
  radius,
  space,
  typeScale,
  withAlpha,
} from "@/src/theme";

type Props = {
  label: string;
  value: number;
  onChange: (n: number) => void;
};

export function WheelScale({ label, value, onChange }: Props) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[colors.card, withAlpha(colors.background, 0.6)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.score}>{value}/10</Text>
        </View>
        <View style={styles.dots}>
          {Array.from({ length: 10 }).map((_, i) => {
            const n = i + 1;
            const active = n <= value;
            return (
              <Pressable key={n} style={styles.dotWrap} onPress={() => onChange(n)}>
                {active ? (
                  <LinearGradient
                    colors={[...gradients.wheelSegment]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.dot}
                  />
                ) : (
                  <View style={[styles.dot, styles.dotIdle]} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius["2xl"],
    overflow: "hidden",
    borderWidth: borders.hairline,
    borderColor: colors.ringHairline,
  },
  inner: {
    padding: space.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.md,
  },
  label: {
    fontFamily: fonts.sansSemi,
    fontSize: typeScale.label.fontSize,
    lineHeight: typeScale.label.lineHeight,
    color: colors.foreground,
    flex: 1,
  },
  score: {
    fontFamily: fonts.kicker,
    fontSize: typeScale.bodySm.fontSize,
    color: colors.mutedForeground,
  },
  dots: { flexDirection: "row", gap: 4 },
  dotWrap: { flex: 1 },
  dot: {
    height: 32,
    borderRadius: radius.md,
  },
  dotIdle: { backgroundColor: colors.background },
});
