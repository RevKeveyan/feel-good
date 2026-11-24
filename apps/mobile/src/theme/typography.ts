import { Platform } from "react-native";

export const fonts = {
  display: "LeagueSpartan_400Regular",
  displayRegular: "LeagueSpartan_400Regular",
  displaySemi: "LeagueSpartan_600SemiBold",
  displayExtra: "LeagueSpartan_800ExtraBold",
  heading: "Raleway_500Medium",
  headingSemi: "Raleway_600SemiBold",
  sans: "OpenSans_400Regular",
  sansMedium: "OpenSans_500Medium",
  sansSemi: "OpenSans_600SemiBold",
  sansBold: "OpenSans_700Bold",
  kicker: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }) as string,
  brand: "LeagueSpartan_800ExtraBold",
} as const;

/** Web Tailwind text-* → px (default theme). */
export const webText = {
  "10": 10,
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
  "6xl": 60,
} as const;

export const displaySizes = {
  sm: webText.xl,
  md: webText["3xl"],
  lg: webText["4xl"],
  xl: webText["5xl"],
} as const;

export const bodySizes = {
  sm: webText.xs,
  md: webText.sm,
  lg: webText.lg,
} as const;

export const typeScale = {
  kicker: { fontSize: webText["10"], lineHeight: 14, letterSpacing: 1 },
  bodySm: { fontSize: webText.xs, lineHeight: 18 },
  bodyMd: { fontSize: webText.sm, lineHeight: 22 },
  bodyBase: { fontSize: webText.base, lineHeight: 26 },
  bodyLg: { fontSize: webText.lg, lineHeight: 26 },
  stepTitle: { fontSize: webText["4xl"], lineHeight: 45, letterSpacing: -0.9 },
  quote: { fontSize: webText["2xl"], lineHeight: 33, letterSpacing: -0.5 },
  label: { fontSize: webText.sm, lineHeight: 20 },
  button: { fontSize: webText.sm, lineHeight: 20 },
  input: { fontSize: webText.sm, lineHeight: 20 },
  displayXl: { fontSize: webText.xl, lineHeight: 26, letterSpacing: -0.5 },
  displayLg: { fontSize: webText.lg, lineHeight: 24, letterSpacing: -0.5 },
  display2xl: { fontSize: webText["2xl"], lineHeight: 30, letterSpacing: -0.5 },
  display3xl: { fontSize: webText["3xl"], lineHeight: 36, letterSpacing: -0.5 },
  display4xl: { fontSize: webText["4xl"], lineHeight: 42, letterSpacing: -0.5 },
  display5xl: { fontSize: webText["5xl"], lineHeight: 52, letterSpacing: -0.5 },
  display6xl: { fontSize: webText["6xl"], lineHeight: 64, letterSpacing: -0.5 },
  displayAuth: { fontSize: webText["3xl"], lineHeight: 36, letterSpacing: -0.5 },
  meta: { fontSize: 11, lineHeight: 16 },
  habitTitle: { fontSize: webText.sm, lineHeight: 20 },
  statSm: { fontSize: webText.lg, lineHeight: 22, letterSpacing: -0.5 },
  statMd: { fontSize: webText["2xl"], lineHeight: 28, letterSpacing: -0.5 },
  statLg: { fontSize: webText["2xl"], lineHeight: 28, letterSpacing: -0.5 },
} as const;

export const typographyRoles = {
  display: "League Spartan italic — headings (web font-display)",
  body: "Open Sans — body and UI (web font-sans)",
  kicker: "System monospace uppercase 10px — web font-mono kickers",
  label: "Open Sans semibold — habit titles and form labels (web text-sm)",
  brand: "League Spartan extra bold — brand wordmark fallback (PNG used on Auth)",
} as const;
