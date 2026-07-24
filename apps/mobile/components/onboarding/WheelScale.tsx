import { Pressable, StyleSheet, Text, View } from "react-native";
import { wheelColorFor } from "./wheelColorFor";
import { colors, fonts } from "@/src/theme";

type Props = {
  label: string;
  value: number;
  onChange: (n: number) => void;
};

export function WheelScale({ label, value, onChange }: Props) {
  return (
    <View style={styles.row}>
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
  row: { marginBottom: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
  },
  label: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.foreground,
    flex: 1,
  },
  score: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.mutedForeground,
  },
  dots: { flexDirection: "row", gap: 4 },
  dot: {
    flex: 1,
    height: 28,
    borderRadius: 999,
  },
  dotIdle: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "rgba(34,34,34,0.12)",
  },
});
