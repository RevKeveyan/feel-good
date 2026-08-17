import { Text, type TextProps, type TextStyle } from "react-native";
import { colors, fonts, typeScale } from "@/src/theme";

type DisplaySize = "sm" | "md" | "lg" | "xl";
type BodySize = "sm" | "md" | "base" | "lg";
type StatSize = "sm" | "md" | "lg";

const displayMap = {
  sm: typeScale.displayXl,
  md: typeScale.display3xl,
  lg: typeScale.display4xl,
  xl: typeScale.display5xl,
} as const;

const bodyMap = {
  sm: typeScale.bodySm,
  md: typeScale.bodyMd,
  base: typeScale.bodyBase,
  lg: typeScale.bodyLg,
} as const;

const statMap = {
  sm: typeScale.statSm,
  md: typeScale.statMd,
  lg: typeScale.statLg,
} as const;

export function DisplayTitle({
  size = "md",
  inverted = false,
  style,
  ...props
}: TextProps & { size?: DisplaySize; inverted?: boolean }) {
  const scale = displayMap[size];
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: fonts.display,
          fontStyle: "italic",
          fontSize: scale.fontSize,
          lineHeight: scale.lineHeight,
          letterSpacing: scale.letterSpacing,
          color: inverted ? colors.primaryForeground : colors.foreground,
        },
        style as TextStyle,
      ]}
    />
  );
}

export function Kicker({ inverted = false, style, ...props }: TextProps & { inverted?: boolean }) {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: fonts.kicker,
          fontSize: typeScale.kicker.fontSize,
          lineHeight: typeScale.kicker.lineHeight,
          letterSpacing: typeScale.kicker.letterSpacing,
          textTransform: "uppercase",
          color: inverted ? colors.primaryForeground : colors.mutedForeground,
        },
        style as TextStyle,
      ]}
    />
  );
}

export function Body({
  size = "md",
  inverted = false,
  style,
  ...props
}: TextProps & { size?: BodySize; inverted?: boolean }) {
  const scale = bodyMap[size];
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: fonts.sans,
          fontSize: scale.fontSize,
          lineHeight: scale.lineHeight,
          color: inverted ? colors.primaryForeground : colors.mutedForeground,
        },
        style as TextStyle,
      ]}
    />
  );
}

export function Label({ style, ...props }: TextProps) {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: fonts.sansSemi,
          fontSize: typeScale.label.fontSize,
          lineHeight: typeScale.label.lineHeight,
          color: colors.foreground,
        },
        style as TextStyle,
      ]}
    />
  );
}

export function StatValue({
  size = "md",
  inverted = false,
  style,
  ...props
}: TextProps & { size?: StatSize; inverted?: boolean }) {
  const scale = statMap[size];
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: fonts.display,
          fontStyle: "italic",
          fontSize: scale.fontSize,
          lineHeight: scale.lineHeight,
          letterSpacing: scale.letterSpacing,
          color: inverted ? colors.primaryForeground : colors.foreground,
        },
        style as TextStyle,
      ]}
    />
  );
}
