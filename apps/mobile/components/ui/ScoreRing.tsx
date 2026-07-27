import { StyleSheet, View } from "react-native";
import { CheckCircle2 } from "@/components/ui/icons";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { DisplayTitle, Kicker, StatValue } from "./Typography";
import { colors } from "@/src/theme";

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
            stroke={colors.ringHairline}
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
          <Kicker>Daily Score</Kicker>
          <DisplayTitle size="xl" style={styles.score}>
            {score}
          </DisplayTitle>
          {checkInDone ? (
            <View style={styles.completeRow}>
              <CheckCircle2 size={12} color={colors.primary} strokeWidth={2} />
              <Kicker style={styles.completeText}>Day complete</Kicker>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.meta}>
        <MetaItem label="Habits" value={`${habits}/5`} />
        <View style={styles.divider} />
        <MetaItem label="Check-in" value={checkInDone ? "Done" : "Required"} muted={!checkInDone} />
        <View style={styles.divider} />
        <MetaItem label="Remaining" value={`${remaining} days`} accent />
      </View>
    </View>
  );
}

function MetaItem({
  label,
  value,
  muted,
  accent,
}: {
  label: string;
  value: string;
  muted?: boolean;
  accent?: boolean;
}) {
  return (
    <View style={styles.metaItem}>
      <Kicker numberOfLines={1} style={styles.metaKicker}>
        {label}
      </Kicker>
      <StatValue
        size="sm"
        style={[styles.metaValue, muted && styles.metaValueMuted, accent && styles.metaValueAccent]}
      >
        {value}
      </StatValue>
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
  score: { marginTop: 2 },
  completeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  completeText: {
    color: colors.primary,
  },
  meta: {
    flexDirection: "row",
    width: "100%",
    marginTop: 16,
    alignItems: "stretch",
  },
  metaItem: { flex: 1, alignItems: "center", minWidth: 0, paddingHorizontal: 4 },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  metaKicker: { letterSpacing: 1.5 },
  metaValue: { marginTop: 2 },
  metaValueMuted: { color: colors.mutedForeground },
  metaValueAccent: { color: colors.accent },
});
