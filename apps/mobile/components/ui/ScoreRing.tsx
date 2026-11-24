import { StyleSheet, Text, View } from "react-native";
import { CheckCircle2 } from "@/components/ui/icons";
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { DisplayTitle, Kicker } from "./Typography";
import { colors, fonts, space, typeScale } from "@/src/theme";

type Props = {
  score: number;
  max?: number;
  habits: number;
  checkInDone: boolean;
  remaining: number;
};

const RING_SIZE = 192;
/** Web arc path in a 36x36 box: circumference is exactly 100 units. */
const ARC = "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831";

export function ScoreRing({ score, max = 100, habits, checkInDone, remaining }: Props) {
  const pct = Math.max(0, Math.min(1, score / max));
  const dash = `${pct * 100}, 100`;

  return (
    <View style={styles.wrap}>
      <View style={styles.ringBox}>
        <Svg width={RING_SIZE} height={RING_SIZE} viewBox="0 0 36 36" style={styles.svg}>
          <Defs>
            <SvgGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={colors.primary} />
              <Stop offset="100%" stopColor={colors.secondary} />
            </SvgGradient>
          </Defs>
          <Path
            d={ARC}
            stroke={colors.foreground}
            strokeOpacity={0.1}
            strokeWidth={2.5}
            fill="none"
            transform="rotate(-90 18 18)"
          />
          <Path
            d={ARC}
            stroke="url(#scoreGrad)"
            strokeWidth={3}
            strokeDasharray={dash}
            strokeLinecap="round"
            fill="none"
            transform="rotate(-90 18 18)"
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
        <MetaItem label="Habits" value={`${habits} / 5`} />
        <View style={styles.divider} />
        <MetaItem
          label="Check-in"
          value={checkInDone ? "Done" : "Required"}
          muted={!checkInDone}
          accent={checkInDone}
        />
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
      <Text
        style={[styles.metaValue, muted && styles.metaValueMuted, accent && styles.metaValueAccent]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", width: "100%", alignSelf: "stretch" },
  ringBox: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  svg: { position: "absolute" },
  center: { alignItems: "center" },
  score: { marginTop: 4 },
  completeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    marginTop: space.xs,
  },
  completeText: {
    color: colors.primary,
    fontFamily: fonts.sansSemi,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: space.p6,
    paddingHorizontal: space.sm,
  },
  metaItem: { flex: 1, alignItems: "center", minWidth: 0 },
  divider: {
    width: 1,
    height: space["2xl"],
    backgroundColor: colors.border,
    flexShrink: 0,
  },
  metaKicker: { letterSpacing: 0, textAlign: "center" },
  metaValue: {
    marginTop: 2,
    fontFamily: fonts.sansSemi,
    fontSize: typeScale.bodyLg.fontSize,
    lineHeight: 24,
    color: colors.foreground,
    textAlign: "center",
  },
  metaValueMuted: { color: colors.mutedForeground },
  metaValueAccent: { color: colors.accent },
});
