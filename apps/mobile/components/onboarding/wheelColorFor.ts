export function wheelColorFor(n: number): string {
  if (n <= 3) return "#DD9B9B";
  if (n <= 6) return "#F2BDC2";
  if (n <= 8) return "#E1C340";
  return "#CCDA18";
}
