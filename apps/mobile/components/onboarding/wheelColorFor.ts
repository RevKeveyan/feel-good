import { colors } from "@/src/theme";

export function wheelColorFor(n: number): string {
  if (n <= 6) return colors.secondary;
  if (n <= 8) return colors.accent;
  return colors.lime;
}
