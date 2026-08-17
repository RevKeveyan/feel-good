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
import { borders, colors, fonts, opacity, radius, shadows, space, typeScale } from "@/src/theme";

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
  leadingIcon,
  trailingIcon,
}: {
  label: string;
  loading?: boolean;
  textStyle: object;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}) {
  if (loading) {
    return <ActivityIndicator color={colors.primaryForeground} />;
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
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.primary, (disabled || loading) && styles.disabled, style]}
    >
      <ButtonContent
        label={label}
        loading={loading}
        textStyle={styles.primaryText}
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
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.outline, (disabled || loading) && styles.disabled, style]}
    >
      <ButtonContent
        label={label}
        loading={loading}
        textStyle={styles.outlineText}
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
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.ghost, (disabled || loading) && styles.disabled, style]}
    >
      <ButtonContent
        label={label}
        loading={loading}
        textStyle={styles.ghostText}
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
  ghostText: {
    fontFamily: fonts.sans,
    color: colors.foreground70,
    fontSize: typeScale.button.fontSize,
    lineHeight: typeScale.button.lineHeight,
  },
  disabled: { opacity: opacity.disabled },
});
