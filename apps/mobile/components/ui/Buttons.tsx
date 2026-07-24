import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { colors, fonts, radius } from "@/src/theme";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
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

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryText: {
    fontFamily: fonts.sansSemi,
    color: colors.primaryForeground,
    fontSize: 14,
  },
  outline: {
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.ringHairline,
  },
  outlineText: {
    fontFamily: fonts.sansSemi,
    color: colors.foreground,
    fontSize: 14,
  },
  disabled: { opacity: 0.5 },
});
