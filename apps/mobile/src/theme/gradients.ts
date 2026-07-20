import { colors } from "./tokens";

export const gradients = {
  quote: [colors.lime + "40", colors.card, colors.destructive + "40"] as const,
  score: [colors.card, colors.lime + "1A", colors.destructive + "26"] as const,
  streak: [colors.lime + "33", colors.card, colors.accent + "33"] as const,
  journey: [colors.secondary + "66", colors.card, colors.destructive + "33"] as const,
  progress: [colors.lime, colors.accent] as const,
  goalActive: [colors.lime + "66", colors.destructive + "55"] as const,
} as const;
