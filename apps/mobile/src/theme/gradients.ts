import { colors } from "./tokens";

export const gradients = {
  quote: [colors.lime + "40", colors.card, colors.destructive + "40"] as const,
  score: [colors.card, colors.lime + "1A", colors.destructive + "26"] as const,
  streak: [colors.lime + "33", colors.card, colors.accent + "33"] as const,
  journey: [colors.secondary + "66", colors.card, colors.destructive + "33"] as const,
  progress: [colors.lime, colors.accent] as const,
  goalActive: [colors.lime + "CC", "#F8EFEE", colors.destructive + "B3"] as const,
  promptField: [colors.card, colors.background, colors.secondary + "66"] as const,
  promptFieldFilled: [colors.lime + "33", colors.background, colors.destructive + "26"] as const,
  welcomeFoundation: [colors.lime + "40", colors.card, colors.destructive + "40"] as const,
  commitment: [colors.accent + "4D", colors.card, colors.destructive + "40"] as const,
  wheelCard: [colors.card, colors.card, colors.lime + "33"] as const,
  whyStatement: [colors.secondary + "B3", colors.card, colors.accent + "40"] as const,
  visionAdd: [colors.lime + "26", colors.card, colors.destructive + "26"] as const,
  doneHero: [colors.accent, colors.destructive, colors.secondary] as const,
} as const;

export const visionRingColors = [colors.lime, colors.destructive, colors.accent, colors.secondary] as const;
