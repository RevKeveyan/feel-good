import { memo, useId } from "react";
import { View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { backgroundGlow, type OrbFalloff } from "@/src/theme";

type Props = {
  /** Diameter of the unblurred circle, matching web `size-*`. */
  size: number;
  /** Web `blur-2xl` = 40, `blur-3xl` = 64. */
  blur: number;
  color: string;
  /** Omit for a solid brand fill; screens outside onboarding pass a wash. */
  opacity?: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  /** Defaults to the card-decoration curve; screen backgrounds pass the wider one. */
  falloff?: OrbFalloff;
};

/** Falloff of a solid circle under a gaussian blur: half intensity at the original edge. */
const SPREAD_RATIO = 1.5;

/**
 * Web `rounded-full blur-*` glow. Offsets refer to the unblurred circle box,
 * so they can be copied from the web classes as-is.
 *
 * Memoized: the SVG surface is expensive to repaint, and screens that own text
 * input state re-render on every keystroke.
 */
export const SoftOrb = memo(function SoftOrb({
  size,
  blur,
  color,
  opacity = 1,
  top,
  left,
  right,
  bottom,
  falloff = backgroundGlow.falloff.glow,
}: Props) {
  const gradientId = `orb-${useId().replace(/:/g, "")}`;
  const spread = blur * SPREAD_RATIO;
  const box = size + spread * 2;
  const center = box / 2;
  const edge = size / 2 / center;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: box,
        height: box,
        top: top == null ? undefined : top - spread,
        left: left == null ? undefined : left - spread,
        right: right == null ? undefined : right - spread,
        bottom: bottom == null ? undefined : bottom - spread,
      }}
    >
      <Svg width={box} height={box}>
        <Defs>
          <RadialGradient
            id={gradientId}
            cx={center}
            cy={center}
            fx={center}
            fy={center}
            rx={center}
            ry={center}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop
              offset={edge * falloff.plateau}
              stopColor={color}
              stopOpacity={opacity * falloff.plateauOpacity}
            />
            <Stop offset={edge} stopColor={color} stopOpacity={opacity * falloff.edgeOpacity} />
            <Stop
              offset={edge + (1 - edge) * falloff.tail}
              stopColor={color}
              stopOpacity={opacity * falloff.tailOpacity}
            />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={box} height={box} fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
});
