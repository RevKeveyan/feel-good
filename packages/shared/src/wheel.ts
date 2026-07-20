import { WHEEL_DIMENSIONS, type WheelKey, type WheelScores } from "./onboarding";

export function wheelRowToScores(row: Record<string, number>): WheelScores {
  return WHEEL_DIMENSIONS.reduce((acc, axis) => {
    acc[axis.key] = row[axis.key] ?? 5;
    return acc;
  }, {} as WheelScores);
}

export function scoresToWheelRow(userId: string, phase: "day_1" | "day_55", scores: WheelScores) {
  return { user_id: userId, phase, ...scores };
}

export type WheelShift = {
  key: WheelKey;
  label: string;
  from: number;
  to: number;
  delta: number;
};

export function biggestShifts(before: WheelScores, after: WheelScores, limit = 4): WheelShift[] {
  return WHEEL_DIMENSIONS.map((axis) => {
    const from = before[axis.key];
    const to = after[axis.key];
    const delta = axis.key === "stress" ? from - to : to - from;
    return { key: axis.key, label: axis.label, from, to, delta };
  })
    .sort((a, b) => b.delta - a.delta)
    .slice(0, limit);
}
