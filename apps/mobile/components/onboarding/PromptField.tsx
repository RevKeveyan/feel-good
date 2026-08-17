import { useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { Kicker } from "@/components/ui";
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
import { DiagonalGradient } from "./DiagonalGradient";

type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  multiline?: boolean;
  minHeight?: number;
};

const TWO_ROWS = 46;

export function PromptField({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder = "Type your answer…",
  multiline = false,
  minHeight = TWO_ROWS,
}: Props) {
  const [focused, setFocused] = useState(false);
  const filled = value.trim().length > 0;

  return (
    <DiagonalGradient
      colorsStops={focused ? gradients.promptFieldFocus : gradients.promptField}
      style={[styles.wrap, filled ? styles.wrapFilled : null]}
      contentStyle={styles.content}
    >
      <Kicker style={styles.label}>{label}</Kicker>
      <TextInput
        style={[
          styles.input,
          multiline && { minHeight: Math.max(minHeight, TWO_ROWS), textAlignVertical: "top" },
        ]}
        placeholderTextColor={withAlpha(colors.foreground, 0.3)}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        multiline={multiline}
        returnKeyType={multiline ? "default" : "done"}
        blurOnSubmit={!multiline}
      />
    </DiagonalGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius["2xl"],
    overflow: "hidden",
    borderWidth: borders.hairline,
    borderColor: colors.ringHairline,
  },
  wrapFilled: {
    borderColor: withAlpha(colors.lime, 0.5),
  },
  content: {
    padding: space.lg,
  },
  label: {
    marginBottom: space.sm,
    color: withAlpha(colors.foreground, 0.6),
  },
  input: {
    backgroundColor: "transparent",
    fontFamily: fonts.sans,
    fontSize: typeScale.input.fontSize,
    lineHeight: 23,
    color: colors.foreground,
    padding: 0,
    minHeight: 24,
  },
});
