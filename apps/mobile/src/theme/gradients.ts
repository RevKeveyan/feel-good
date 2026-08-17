import { colors, withAlpha } from "./tokens";

/**
 * Mirrors the web `bg-gradient-to-br` stops from `src/routes/**`.
 * Web `--destructive` (#DD9B9B) is outside the brand kit and maps to blush.
 */
export const gradients = {
  quote: [withAlpha(colors.lime, 0.25), colors.card, withAlpha(colors.destructive, 0.25)] as const,
  score: [colors.card, withAlpha(colors.lime, 0.1), withAlpha(colors.destructive, 0.15)] as const,
  streak: [withAlpha(colors.destructive, 0.25), withAlpha(colors.accent, 0.25)] as const,
  journey: [withAlpha(colors.lime, 0.3), colors.card] as const,
  progress: [colors.destructive, colors.accent, colors.secondary] as const,
  goalActive: [
    withAlpha(colors.lime, 0.8),
    colors.card,
    withAlpha(colors.destructive, 0.7),
  ] as const,
  promptField: [colors.card, colors.background, withAlpha(colors.secondary, 0.4)] as const,
  promptFieldFocus: [
    withAlpha(colors.lime, 0.2),
    colors.background,
    withAlpha(colors.destructive, 0.15),
  ] as const,
  welcomeFoundation: [
    withAlpha(colors.lime, 0.25),
    colors.card,
    withAlpha(colors.destructive, 0.25),
  ] as const,
  commitment: [
    withAlpha(colors.accent, 0.3),
    colors.card,
    withAlpha(colors.destructive, 0.25),
  ] as const,
  wheelCard: [colors.card, colors.card, withAlpha(colors.lime, 0.2)] as const,
  whyStatement: [
    withAlpha(colors.secondary, 0.7),
    colors.card,
    withAlpha(colors.accent, 0.25),
  ] as const,
  visionAdd: [
    withAlpha(colors.lime, 0.15),
    colors.card,
    withAlpha(colors.destructive, 0.15),
  ] as const,
  doneHero: [colors.accent, colors.destructive, colors.secondary] as const,
  day55Banner: [colors.primary, withAlpha(colors.primary, 0.8)] as const,
  completeSoft: [
    withAlpha(colors.primary, 0.1),
    colors.card,
    withAlpha(colors.accent, 0.1),
  ] as const,
} as const;

export type OrbFalloff = {
  /** Plateau stop, as a fraction of the unblurred circle radius. */
  plateau: number;
  plateauOpacity: number;
  /** Intensity left at the unblurred circle edge. */
  edgeOpacity: number;
  /** Tail stop, as a fraction of the blur spread beyond the circle edge. */
  tail: number;
  tailOpacity: number;
};

/**
 * Full-screen background glows only. `glow` is the card-decoration curve and
 * must stay as-is; `background` widens the plateau and slows the tail, and
 * `boost` lifts stop opacity without touching any brand kit color value.
 */
export const backgroundGlow = {
  boost: 1.15,
  falloff: {
    glow: {
      plateau: 0.7,
      plateauOpacity: 0.92,
      edgeOpacity: 0.5,
      tail: 0.45,
      tailOpacity: 0.14,
    },
    background: {
      plateau: 0.79,
      plateauOpacity: 0.94,
      edgeOpacity: 0.58,
      tail: 0.52,
      tailOpacity: 0.2,
    },
  },
} as const satisfies { boost: number; falloff: Record<"glow" | "background", OrbFalloff> };

/** Lifts a background stop opacity by `boost`, never past fully opaque. */
export function boostedOpacity(opacity: number): number {
  return Math.min(1, opacity * backgroundGlow.boost);
}

export const visionRingColors = [
  withAlpha(colors.lime, 0.6),
  withAlpha(colors.destructive, 0.6),
  withAlpha(colors.accent, 0.7),
  colors.secondary,
] as const;
