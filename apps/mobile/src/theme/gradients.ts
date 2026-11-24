import { colors, withAlpha } from "./tokens";

/**
 * Mirrors the web `bg-gradient-to-br` stops from `src/routes/**`.
 * Card fills use washed `withAlpha` mixes; the onboarding mesh paints brand hex.
 */
export const gradients = {
  quote: [withAlpha(colors.lime, 0.25), colors.card, withAlpha(colors.destructive, 0.25)] as const,
  score: [colors.card, withAlpha(colors.lime, 0.1), withAlpha(colors.destructive, 0.15)] as const,
  streak: [withAlpha(colors.destructive, 0.25), withAlpha(colors.accent, 0.25)] as const,
  journey: [withAlpha(colors.lime, 0.3), colors.card] as const,
  progress: [colors.primary, colors.secondary, colors.secondary] as const,
  goalActive: [colors.primary, colors.primary] as const,
  promptField: [colors.card, withAlpha(colors.background, 0.6), withAlpha(colors.secondary, 0.4)] as const,
  promptFieldFocus: [
    withAlpha(colors.secondary, 0.2),
    colors.card,
    withAlpha(colors.primary, 0.2),
  ] as const,
  welcomeFoundation: [
    withAlpha(colors.secondary, 0.3),
    colors.card,
    withAlpha(colors.primary, 0.3),
  ] as const,
  commitment: [withAlpha(colors.secondary, 0.3), colors.card, withAlpha(colors.primary, 0.25)] as const,
  wheelCard: [colors.card, colors.background, withAlpha(colors.secondary, 0.2)] as const,
  whyStatement: [
    withAlpha(colors.secondary, 0.5),
    colors.card,
    withAlpha(colors.secondary, 0.3),
  ] as const,
  visionAdd: [withAlpha(colors.secondary, 0.2), colors.card, withAlpha(colors.primary, 0.2)] as const,
  doneHero: [colors.secondary, colors.primary, colors.secondary] as const,
  day55Banner: [colors.primary, withAlpha(colors.primary, 0.8)] as const,
  completeSoft: [
    withAlpha(colors.primary, 0.1),
    colors.card,
    withAlpha(colors.accent, 0.1),
  ] as const,
  wheelSegment: [colors.secondary, colors.secondary, colors.primary] as const,
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
 * `glow` is the washed card-decoration curve used outside onboarding.
 * `background` holds the brand hex through most of the unblurred radius, then
 * eases toward the cream base only near the outer stop.
 */
export const backgroundGlow = {
  boost: 1.28,
  falloff: {
    glow: {
      plateau: 0.7,
      plateauOpacity: 0.92,
      edgeOpacity: 0.5,
      tail: 0.45,
      tailOpacity: 0.14,
    },
    background: {
      plateau: 0.62,
      plateauOpacity: 1,
      edgeOpacity: 0.72,
      tail: 0.4,
      tailOpacity: 0.28,
    },
  },
} as const satisfies { boost: number; falloff: Record<"glow" | "background", OrbFalloff> };

/** Lifts a background stop opacity by `boost`, never past fully opaque. */
export function boostedOpacity(opacity: number): number {
  return Math.min(1, opacity * backgroundGlow.boost);
}

/** Web vision frame fills: pink40→pink30, red40→pink30, pink40→pink20, pink40→red20. */
export const visionFrameGradients = [
  [withAlpha(colors.secondary, 0.4), withAlpha(colors.secondary, 0.3)] as const,
  [withAlpha(colors.primary, 0.4), withAlpha(colors.secondary, 0.3)] as const,
  [withAlpha(colors.secondary, 0.4), withAlpha(colors.secondary, 0.2)] as const,
  [withAlpha(colors.secondary, 0.4), withAlpha(colors.primary, 0.2)] as const,
] as const;

/** @deprecated Prefer visionFrameGradients; kept for any leftover imports. */
export const visionRingColors = [
  withAlpha(colors.white, 0.6),
  withAlpha(colors.white, 0.6),
  withAlpha(colors.white, 0.6),
  withAlpha(colors.white, 0.6),
] as const;
