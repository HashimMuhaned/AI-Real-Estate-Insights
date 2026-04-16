import { motion } from "framer-motion";

export default function RadialGaugeChart({ data, animKey }) {
  const W = 200, H = 112, cx = 100, cy = 108, R = 82;

  const zones = data?.zones ?? [];
  const metrics = data?.metrics ?? [];
  const value = Number(data?.value ?? 0);
  const label = data?.label ?? "Risk Index";

  const toRad = (d) => (d * Math.PI) / 180;

  const arc = (from, to) => {
    const x1 = cx + R * Math.cos(toRad(from));
    const y1 = cy + R * Math.sin(toRad(from));
    const x2 = cx + R * Math.cos(toRad(to));
    const y2 = cy + R * Math.sin(toRad(to));
    return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
  };

  const valAngle = 180 + (value / 100) * 180;
  const nx = cx + (R - 20) * Math.cos(toRad(valAngle));
  const ny = cy + (R - 20) * Math.sin(toRad(valAngle));

  const zoneColor =
    zones.find((z) => value >= z.from && value < z.to)?.color ?? "#fff";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 100 }}>
        {zones.map((z, i) => (
          <motion.path
            key={`${animKey}-z-${i}`}
            d={arc(180 + (z.from / 100) * 180, 180 + (z.to / 100) * 180)}
            fill="none"
            stroke={z.color}
            strokeWidth={11}
            strokeLinecap="round"
            opacity={0.22}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          />
        ))}

        <motion.path
          d={arc(180, valAngle)}
          fill="none"
          stroke={zoneColor}
          strokeWidth={11}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3, duration: 0.9, ease: "easeOut" }}
        />

        <motion.line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke="white"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ delay: 1, duration: 0.3 }}
        />

        <circle cx={cx} cy={cy} r={4.5} fill="white" opacity={0.75} />
        <text
          x={cx}
          y={cy - 26}
          textAnchor="middle"
          fill={zoneColor}
          fontSize={22}
          fontWeight={900}
        >
          {value}
        </text>
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
          fontSize={9}
        >
          {label}
        </text>

        {zones.map((z, i) => {
          const mid = 180 + (((z.from + z.to) / 2) / 100) * 180;
          return (
            <text
              key={i}
              x={cx + (R + 14) * Math.cos(toRad(mid))}
              y={cy + (R + 14) * Math.sin(toRad(mid))}
              textAnchor="middle"
              fill={z.color}
              fontSize={8}
              fontWeight={700}
              opacity={0.7}
            >
              {z.label}
            </text>
          );
        })}
      </svg>

      <div className="flex gap-1.5 w-full justify-center">
        {metrics.map((m, i) => (
          <motion.div
            key={`${animKey}-m-${i}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.08 }}
            className="flex flex-col items-center px-2.5 py-1.5 rounded-lg border border-white/[0.07] flex-1"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          >
            <span className="text-[9px] text-white/30 uppercase tracking-wider text-center">
              {m.label}
            </span>
            <span className="text-[11px] font-black text-white/80">{m.val}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}