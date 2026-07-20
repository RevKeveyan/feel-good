type Axis = { key: string; label: string };

export function RadarChart({
  axes,
  values,
  compareValues,
  size = 260,
  max = 10,
}: {
  axes: Axis[];
  values: Record<string, number>;
  compareValues?: Record<string, number>;
  size?: number;
  max?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 30;
  const n = axes.length;

  const pointFor = (i: number, v: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (Math.max(0, Math.min(max, v)) / max) * radius;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r] as const;
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const path = axes.map((a, i) => pointFor(i, values[a.key] ?? 0)).map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ") + " Z";
  const comparePath = compareValues
    ? axes.map((a, i) => pointFor(i, compareValues[a.key] ?? 0)).map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ") + " Z"
    : null;

  const fillId = `wheel-fill-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">
      <defs>
        <radialGradient id={fillId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F2BDC2" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#DD9B9B" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#F8EFEE" stopOpacity="0.15" />
        </radialGradient>
      </defs>
      {gridLevels.map((lvl) => (
        <polygon
          key={lvl}
          points={axes
            .map((_, i) => {
              const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
              const r = radius * lvl;
              return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
            })
            .join(" ")}
          fill="none"
          stroke="#DD9B9B"
          strokeOpacity={0.18}
          strokeWidth={1}
        />
      ))}
      {axes.map((_, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * radius}
            y2={cy + Math.sin(angle) * radius}
            stroke="#DD9B9B"
            strokeOpacity={0.14}
            strokeWidth={1}
          />
        );
      })}
      {comparePath && (
        <path d={comparePath} fill="#CCDA18" fillOpacity={0.14} stroke="#CCDA18" strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="4 3" />
      )}
      <path d={path} fill={`url(#${fillId})`} stroke="#DD9B9B" strokeWidth={2} strokeLinejoin="round" />
      {axes.map((a, i) => {
        const [px, py] = pointFor(i, values[a.key] ?? 0);
        return (
          <circle key={`pt-${a.key}`} cx={px} cy={py} r={3.5} fill="#FFFFFF" stroke="#DD9B9B" strokeWidth={1.5} />
        );
      })}

      {axes.map((a, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const lx = cx + Math.cos(angle) * (radius + 16);
        const ly = cy + Math.sin(angle) * (radius + 16);
        return (
          <text
            key={a.key}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground"
            style={{ fontSize: 9, fontFamily: "ui-sans-serif, system-ui" }}
          >
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}
