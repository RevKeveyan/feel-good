export const STRUGGLE_ACTIONS = ["breathwork", "tiny_task", "reframe", "quote", "community"] as const;

export type StruggleAction = (typeof STRUGGLE_ACTIONS)[number];

export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}
