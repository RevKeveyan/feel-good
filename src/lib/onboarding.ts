import type { WheelScores } from "@feelgood/shared";

export const ONBOARDING_STEPS = [
  "welcome",
  "why",
  "goals",
  "commitment",
  "wheel",
  "why-statement",
  "vision",
  "letter",
  "done",
] as const;

export type { OnboardingStep, WheelKey, WheelScores } from "@feelgood/shared";

export const GOAL_OPTIONS = [
  "Lose weight",
  "Improve energy",
  "Improve gut health",
  "Reduce stress",
  "Build muscle",
  "Improve hormones",
  "Improve confidence",
  "Better sleep",
  "Create healthy habits",
  "Other",
] as const;

export const WHEEL_DIMENSIONS = [
  { key: "energy", label: "Energy" },
  { key: "confidence", label: "Confidence" },
  { key: "fitness", label: "Fitness" },
  { key: "stress", label: "Stress Management" },
  { key: "digestion", label: "Digestion" },
  { key: "consistency", label: "Consistency" },
  { key: "motivation", label: "Motivation" },
  { key: "mood", label: "Mood" },
  { key: "overall_health", label: "Overall Health" },
] as const;

export function emptyWheel(): WheelScores {
  return WHEEL_DIMENSIONS.reduce((acc, d) => {
    acc[d.key] = 5;
    return acc;
  }, {} as WheelScores);
}

export const STRUGGLE_REFRAMES = [
  "You don't have to be perfect. You just have to show up.",
  "One habit today is a win. Choose the easiest one.",
  "Feelings pass. Your commitment doesn't.",
  "The version of you at Day 55 needs you to keep going today.",
  "You've done harder things than this.",
  "Progress is not linear. This day counts too.",
  "Small doesn't mean insignificant. Small compounds.",
  "The gap between where you are and who you're becoming is habit by habit.",
  "You are allowed to have a hard day and still be on track.",
  "Show up for yourself the way you'd show up for someone you love.",
  "The streak is not the point. The person you're building is.",
  "This feeling is temporary. Your transformation is not.",
  "You started this for a reason. Come back to it.",
  "Rest is part of the work. So is starting again.",
  "You don't need motivation. You need one small action.",
];

export const STRUGGLE_QUOTES = [
  '"You do not rise to the level of your goals. You fall to the level of your systems.", James Clear',
  '"The body achieves what the mind believes."',
  '"Take care of your body. It\'s the only place you have to live.", Jim Rohn',
  '"Discipline is choosing between what you want now and what you want most."',
  '"Wellness is not a destination. It\'s a way of moving through the world."',
];
