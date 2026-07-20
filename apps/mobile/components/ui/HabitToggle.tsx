import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius } from "@/src/theme";

type Props = {
  title: string;
  done: boolean;
  subtitle?: string;
  onPress: () => void;
  trailing?: ReactNode;
};

export function HabitToggle({ title, done, subtitle, onPress, trailing }: Props) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.dot, done && styles.dotDone]}>
        {done ? <View style={styles.innerDot} /> : null}
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, done && styles.titleDone]}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  dotDone: {
    backgroundColor: colors.primary,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  copy: { flex: 1 },
  title: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: colors.foreground,
  },
  titleDone: {
    textDecorationLine: "line-through",
    color: colors.mutedForeground,
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
});
