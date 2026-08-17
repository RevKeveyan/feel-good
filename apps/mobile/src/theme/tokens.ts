export const colors = {
  background: "#EBE5DD",
  foreground: "#222222",
  card: "#F8EFEE",
  cardForeground: "#222222",
  primary: "#222222",
  primaryForeground: "#F8EFEE",
  secondary: "#F2BDC2",
  secondaryForeground: "#222222",
  muted: "#F8EFEE",
  mutedForeground: "#5B5451",
  accent: "#E1C340",
  accentForeground: "#222222",
  destructive: "#F2BDC2",
  destructiveForeground: "#222222",
  lime: "#CCDA18",
  limeForeground: "#222222",
  missedBanner: "#EBE5DD",
  white: "#FFFFFF",
  black: "#222222",
  pureBlack: "#000000",
  border: "rgba(34,34,34,0.1)",
  ringHairline: "rgba(34,34,34,0.05)",
  ring: "rgba(225,195,64,0.5)",
  ringPrimary: "rgba(34,34,34,0.3)",
  input: "rgba(34,34,34,0.14)",
  overlay: "rgba(34,34,34,0.4)",
  scrim: "rgba(0,0,0,0.6)",
  foreground70: "rgba(34,34,34,0.7)",
  foreground40: "rgba(34,34,34,0.4)",
} as const;

const ALPHA_STEPS = 255;

/** Web `bg-color/NN` → 8-digit hex with the same alpha. */
export function withAlpha(hex: string, opacity: number): string {
  const clamped = Math.min(1, Math.max(0, opacity));
  const channel = Math.round(clamped * ALPHA_STEPS)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
  return `${hex.slice(0, 7)}${channel}`;
}

export const radius = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  full: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  p4: 16,
  p5: 20,
  p6: 24,
  p8: 32,
  gap3: 12,
  screenX: 24,
  inputY: 12,
  inputX: 16,
  buttonY: 12,
} as const;

export const borders = {
  hairline: 1,
  thick: 2,
} as const;

/** Web `shadow-lg shadow-primary/25` and `shadow-md`. */
export const shadows = {
  button: {
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  card: {
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
} as const;

export const opacity = {
  disabled: 0.4,
  disabledSoft: 0.6,
  pressed: 0.85,
} as const;

export const motion = {
  pressScale: 0.98,
} as const;

export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

/** Web `max-w-xl mx-auto px-6 pt-10 pb-24`. */
export const layout = {
  contentMaxWidth: 576,
  screenPadX: 24,
  screenPadTop: 40,
  screenPadBottom: 96,
} as const;
