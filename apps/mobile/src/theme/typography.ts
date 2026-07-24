import { Platform } from "react-native";

export const fonts = {
  display: "LeagueSpartan_700Bold",
  displayRegular: "LeagueSpartan_400Regular",
  displaySemi: "LeagueSpartan_600SemiBold",
  displayExtra: "LeagueSpartan_800ExtraBold",
  heading: "Raleway_500Medium",
  headingSemi: "Raleway_600SemiBold",
  sans: "OpenSans_400Regular",
  sansMedium: "OpenSans_500Medium",
  sansSemi: "OpenSans_600SemiBold",
  sansBold: "OpenSans_700Bold",
  mono: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  }) as string,
  brand: "PlayfairDisplay_700Bold",
} as const;

export const displaySizes = {
  sm: 20,
  md: 30,
  lg: 36,
  xl: 48,
} as const;

export const bodySizes = {
  sm: 12,
  md: 14,
  lg: 18,
} as const;

export const typographyRoles = {
  display: "League Spartan italic — headings (web font-display)",
  body: "Open Sans — body and UI (web font-sans)",
  kicker: "System mono uppercase 10px — web font-mono kickers",
  label: "Open Sans semibold — habit titles and form labels",
  brand: "Playfair Display — BrandWordmark on Auth only",
} as const;
