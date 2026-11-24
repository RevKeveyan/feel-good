export const colors = {
  background: "#EAE8E2",
  foreground: "#000000",
  card: "#FFFFFF",
  cardForeground: "#000000",
  primary: "#E00B10",
  primaryForeground: "#FFFFFF",
  secondary: "#F2BDC2",
  secondaryForeground: "#000000",
  muted: "#FFEFF0",
  mutedForeground: "#4D4D4D",
  accent: "#E00B10",
  accentForeground: "#FFFFFF",
  destructive: "#E00B10",
  destructiveForeground: "#FFFFFF",
  lime: "#F2BDC2",
  limeForeground: "#000000",
  missedBanner: "#EAE8E2",
  brandRed: "#E00B10",
  offWhite: "#EAE8E2",
  white: "#FFFFFF",
  black: "#000000",
  pureBlack: "#000000",
  border: "rgba(0,0,0,0.1)",
  ringHairline: "rgba(0,0,0,0.05)",
  ring: "rgba(224,11,16,0.45)",
  ringPrimary: "rgba(224,11,16,0.3)",
  input: "rgba(0,0,0,0.14)",
  overlay: "rgba(0,0,0,0.4)",
  scrim: "rgba(0,0,0,0.6)",
  foreground70: "rgba(0,0,0,0.7)",
  foreground40: "rgba(0,0,0,0.4)",
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

/** Web `shadow-lg shadow-primary/20` and `shadow-md`. */
export const shadows = {
  button: {
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
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
