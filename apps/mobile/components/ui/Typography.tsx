import { Text, type TextProps, type TextStyle } from "react-native";
import { colors, fonts } from "@/src/theme";

export function DisplayTitle({ style, ...props }: TextProps) {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: fonts.display,
          fontStyle: "italic",
          fontSize: 32,
          color: colors.foreground,
          letterSpacing: -0.5,
        },
        style as TextStyle,
      ]}
    />
  );
}

export function Kicker({ style, ...props }: TextProps) {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: fonts.heading,
          fontSize: 10,
          letterSpacing: 2.4,
          textTransform: "uppercase",
          color: colors.mutedForeground,
        },
        style as TextStyle,
      ]}
    />
  );
}

export function Body({ style, ...props }: TextProps) {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: fonts.sans,
          fontSize: 15,
          lineHeight: 22,
          color: colors.mutedForeground,
        },
        style as TextStyle,
      ]}
    />
  );
}
