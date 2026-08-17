import { useId } from "react";
import Svg, { Circle, Defs, Line, Path, Polygon, RadialGradient, Stop, Text as SvgText } from "react-native-svg";
import { View } from "react-native";
import { colors, fonts } from "@/src/theme";

type Axis = { key: string; label: string };

type Props = {
  axes: readonly Axis[];
  values: Record<string, number>;
  size?: number;
  max?: number;
};

export function RadarChart({ axes, values, size = 260, max = 10 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 30;
  const n = axes.length;
  const fillId = `wheel-fill-${useId().replace(/:/g, "")}`;

  const pointFor = (i: number, v: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (Math.max(0, Math.min(max, v)) / max) * radius;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  };

  const pathPoints = axes.map((a, i) => pointFor(i, values[a.key] ?? 0));
  const pathD =
    pathPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <View style={{ width: "100%", aspectRatio: 1 }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id={fillId} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.secondary} stopOpacity={0.45} />
            <Stop offset="60%" stopColor={colors.destructive} stopOpacity={0.28} />
            <Stop offset="100%" stopColor={colors.card} stopOpacity={0.15} />
          </RadialGradient>
        </Defs>
        {gridLevels.map((lvl) => {
          const pts = axes
            .map((_, i) => {
              const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
              const r = radius * lvl;
              return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
            })
            .join(" ");
          return (
            <Polygon
              key={lvl}
              points={pts}
              fill="none"
              stroke={colors.destructive}
              strokeOpacity={0.18}
              strokeWidth={1}
            />
          );
        })}
        {axes.map((_, i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          return (
            <Line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={cx + Math.cos(angle) * radius}
              y2={cy + Math.sin(angle) * radius}
              stroke={colors.destructive}
              strokeOpacity={0.14}
              strokeWidth={1}
            />
          );
        })}
        <Path
          d={pathD}
          fill={`url(#${fillId})`}
          stroke={colors.destructive}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {pathPoints.map((p, i) => (
          <Circle key={`pt-${axes[i].key}`} cx={p.x} cy={p.y} r={3.5} fill={colors.white} stroke={colors.destructive} strokeWidth={1.5} />
        ))}
        {axes.map((a, i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          const lx = cx + Math.cos(angle) * (radius + 16);
          const ly = cy + Math.sin(angle) * (radius + 16);
          return (
            <SvgText
              key={a.key}
              x={lx}
              y={ly}
              fill={colors.foreground}
              fontSize={9}
              fontFamily={fonts.sans}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {a.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
