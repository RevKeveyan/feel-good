import { Pressable, StyleSheet, Text, View } from "react-native";
import { wheelColorFor } from "./wheelColorFor";
import { colors, fonts, radius, space, typeScale } from "@/src/theme";

type Props = {
  label: string;
  value: number;
  onChange: (n: number) => void;
};

export function WheelScale({ label, value, onChange }: Props) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.score}>{value}/10</Text>
      </View>
      <View style={styles.dots}>
        {Array.from({ length: 10 }).map((_, i) => {
          const n = i + 1;
          const active = n <= value;
          return (
            <Pressable
              key={n}
              style={[
                styles.dot,
                active
                  ? { backgroundColor: wheelColorFor(n) }
                  : styles.dotIdle,
              ]}
              onPress={() => onChange(n)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: space.md,
    marginBottom: space.sm,
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
  dots: { flexDirection: "row", gap: space.xs },
  dot: {
    flex: 1,
    height: 28,
    borderRadius: radius.md,
  },
  dotIdle: { backgroundColor: colors.muted },
});
