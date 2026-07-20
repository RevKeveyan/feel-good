import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { colors, fonts } from "@/src/theme";

type Props = {
  score: number;
  max?: number;
  habits: number;
  checkInDone: boolean;
  remaining: number;
};

export function ScoreRing({ score, max = 100, habits, checkInDone, remaining }: Props) {
  const size = 180;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, score / max));
  const dash = `${pct * c} ${c}`;

  return (
    <View style={styles.wrap}>
      <View style={styles.ringBox}>
        <Svg width={size} height={size} style={styles.svg}>
          <Defs>
            <SvgGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.lime} />
              <Stop offset="50%" stopColor={colors.accent} />
              <Stop offset="100%" stopColor={colors.destructive} />
            </SvgGradient>
          </Defs>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.border}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="url(#scoreGrad)"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={dash}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.center}>
          <Text style={styles.label}>Daily Score</Text>
          <Text style={styles.score}>{score}</Text>
        </View>
      </View>
      <View style={styles.meta}>
        <MetaItem label="Habits" value={`${habits}/5`} />
        <MetaItem label="Check-in" value={checkInDone ? "Done" : "Open"} />
        <MetaItem label="Left" value={`${remaining}`} />
      </View>
    </View>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", width: "100%" },
  ringBox: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  svg: { position: "absolute" },
  center: { alignItems: "center" },
  label: {
    fontFamily: fonts.heading,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.mutedForeground,
  },
  score: {
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: 48,
    color: colors.foreground,
    marginTop: 2,
  },
  meta: {
    flexDirection: "row",
    width: "100%",
    marginTop: 16,
    gap: 8,
  },
  metaItem: { flex: 1, alignItems: "center" },
  metaLabel: {
    fontFamily: fonts.heading,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.mutedForeground,
  },
  metaValue: {
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: 18,
    color: colors.foreground,
    marginTop: 2,
  },
});
