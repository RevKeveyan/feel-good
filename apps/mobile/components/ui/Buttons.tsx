import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { colors, fonts, radius } from "@/src/theme";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({ label, onPress, disabled, loading, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.primary, (disabled || loading) && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={colors.primaryForeground} />
      ) : (
        <Text style={styles.primaryText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function OutlineButton({ label, onPress, disabled, loading, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.outline, (disabled || loading) && styles.disabled, style]}
    >
      <Text style={styles.outlineText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: {
    fontFamily: fonts.sansSemi,
    color: colors.primaryForeground,
    fontSize: 15,
  },
  outline: {
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.input,
  },
  outlineText: {
    fontFamily: fonts.sansSemi,
    color: colors.foreground,
    fontSize: 15,
  },
  disabled: { opacity: 0.5 },
});
