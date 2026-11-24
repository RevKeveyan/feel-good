import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  borders,
  colors,
  fonts,
  motion,
  opacity,
  radius,
  shadows,
  space,
  typeScale,
} from "@/src/theme";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

function ButtonContent({
  label,
  loading,
  textStyle,
  spinnerColor,
  leadingIcon,
  trailingIcon,
}: {
  label: string;
  loading?: boolean;
  textStyle: object;
  spinnerColor: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}) {
  if (loading) {
    return <ActivityIndicator color={spinnerColor} />;
  }

  if (!leadingIcon && !trailingIcon) {
    return <Text style={textStyle}>{label}</Text>;
  }

  return (
    <View style={styles.content}>
      {leadingIcon}
      <Text style={textStyle}>{label}</Text>
      {trailingIcon}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  style,
  leadingIcon,
  trailingIcon,
}: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.primary,
        inactive && styles.disabledNoShadow,
        pressed && !inactive && styles.pressed,
        style,
      ]}
    >
      <ButtonContent
        label={label}
        loading={loading}
        textStyle={styles.primaryText}
        spinnerColor={colors.primaryForeground}
        leadingIcon={leadingIcon}
        trailingIcon={trailingIcon}
      />
    </Pressable>
  );
}

export function OutlineButton({
  label,
  onPress,
  disabled,
  loading,
  style,
  leadingIcon,
  trailingIcon,
}: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.outline,
        inactive && styles.disabled,
        pressed && !inactive && styles.pressed,
        style,
      ]}
    >
      <ButtonContent
        label={label}
        loading={loading}
        textStyle={styles.outlineText}
        spinnerColor={colors.foreground}
        leadingIcon={leadingIcon}
        trailingIcon={trailingIcon}
      />
    </Pressable>
  );
}

/** Web `rounded-full px-4 py-2 text-sm text-foreground/70` — borderless nav action. */
export function GhostButton({
  label,
  onPress,
  disabled,
  loading,
  style,
  leadingIcon,
  trailingIcon,
}: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.ghost,
        inactive && styles.disabled,
        pressed && !inactive && styles.ghostPressed,
        style,
      ]}
    >
      <ButtonContent
        label={label}
        loading={loading}
        textStyle={styles.ghostText}
        spinnerColor={colors.foreground}
        leadingIcon={leadingIcon}
        trailingIcon={trailingIcon}
      />
    </Pressable>
  );
}

/** Web `bg-foreground text-background` pill — Open today, Message us, active tabs. */
export function DarkButton({
  label,
  onPress,
  disabled,
  loading,
  style,
  leadingIcon,
  trailingIcon,
}: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.dark,
        inactive && styles.disabled,
        pressed && !inactive && styles.pressed,
        style,
      ]}
    >
      <ButtonContent
        label={label}
        loading={loading}
        textStyle={styles.darkText}
        spinnerColor={colors.background}
        leadingIcon={leadingIcon}
        trailingIcon={trailingIcon}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: space.buttonY,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.button,
  },
  primaryText: {
    fontFamily: fonts.sansSemi,
    color: colors.primaryForeground,
    fontSize: typeScale.button.fontSize,
    lineHeight: typeScale.button.lineHeight,
  },
  outline: {
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingVertical: space.buttonY,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: borders.hairline,
    borderColor: colors.input,
  },
  outlineText: {
    fontFamily: fonts.sansSemi,
    color: colors.foreground,
    fontSize: typeScale.button.fontSize,
    lineHeight: typeScale.button.lineHeight,
  },
  ghost: {
    borderRadius: radius.full,
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostPressed: {
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  ghostText: {
    fontFamily: fonts.sans,
    color: colors.foreground70,
    fontSize: typeScale.button.fontSize,
    lineHeight: typeScale.button.lineHeight,
  },
  dark: {
    backgroundColor: colors.foreground,
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  darkText: {
    fontFamily: fonts.sansSemi,
    color: colors.background,
    fontSize: typeScale.button.fontSize,
    lineHeight: typeScale.button.lineHeight,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  pressed: {
    transform: [{ scale: motion.pressScale }],
  },
  disabled: { opacity: opacity.disabled },
  disabledNoShadow: {
    opacity: opacity.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
});
