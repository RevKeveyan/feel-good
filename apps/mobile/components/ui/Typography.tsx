import { Text, type TextProps, type TextStyle } from "react-native";
import { bodySizes, colors, displaySizes, fonts } from "@/src/theme";

type DisplaySize = keyof typeof displaySizes;
type BodySize = keyof typeof bodySizes;
type StatSize = "sm" | "md" | "lg";

const statSizes: Record<StatSize, number> = {
  sm: 18,
  md: 24,
  lg: 28,
};

export function DisplayTitle({
  size = "md",
  inverted = false,
  style,
  ...props
}: TextProps & { size?: DisplaySize; inverted?: boolean }) {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: fonts.display,
          fontStyle: "italic",
          fontSize: displaySizes[size],
          color: inverted ? colors.primaryForeground : colors.foreground,
          letterSpacing: -0.5,
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
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: 1.6,
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
  const lineHeight = size === "sm" ? 18 : size === "lg" ? 26 : 22;
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: fonts.sans,
          fontSize: bodySizes[size],
          lineHeight,
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
          fontSize: 14,
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
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: fonts.display,
          fontStyle: "italic",
          fontSize: statSizes[size],
          color: inverted ? colors.primaryForeground : colors.foreground,
          letterSpacing: -0.5,
        },
        style as TextStyle,
      ]}
    />
  );
}
