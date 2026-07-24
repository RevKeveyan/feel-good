import { StyleSheet, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Kicker } from "@/components/ui";
import { colors, fonts, gradients, radius } from "@/src/theme";

type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  multiline?: boolean;
  minHeight?: number;
};

export function PromptField({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder = "Type your answer…",
  multiline = false,
  minHeight = 48,
}: Props) {
  const filled = value.trim().length > 0;
  return (
    <View
      style={[
        styles.wrap,
        filled ? styles.wrapFilled : null,
      ]}
    >
      <LinearGradient
        colors={filled ? [...gradients.promptFieldFilled] : [...gradients.promptField]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Kicker style={styles.label}>{label}</Kicker>
        <TextInput
          style={[
            styles.input,
            multiline && { minHeight: Math.max(minHeight, 72), textAlignVertical: "top" },
          ]}
          placeholderTextColor={colors.mutedForeground + "80"}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          multiline={multiline}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius["2xl"],
    borderWidth: 1,
    borderColor: colors.ringHairline,
    overflow: "hidden",
    marginBottom: 12,
  },
  wrapFilled: {
    borderColor: colors.lime + "99",
  },
  gradient: {
    padding: 16,
  },
  label: {
    marginBottom: 8,
    color: colors.mutedForeground,
  },
  input: {
    backgroundColor: "transparent",
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    color: colors.foreground,
    padding: 0,
    minHeight: 24,
  },
});
