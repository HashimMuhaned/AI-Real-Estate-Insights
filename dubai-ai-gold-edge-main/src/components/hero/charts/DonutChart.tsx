import { motion } from "framer-motion";

export default function DonutChart({ data, total, animKey }) {
  const R = 42,
    cx = 56,
    cy = 56,
    stroke = 13;
  const circ = 2 * Math.PI * R;
  const totalPct = data.reduce((s, d) => s + d.value, 0);
  let cumPct = 0;
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: 112, height: 112 }}>
        <svg width={112} height={112} viewBox="0 0 112 112">
          <circle
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={stroke}
          />
          {data.map((seg, i) => {
            const pct = seg.value / totalPct;

            const prevPct =
              data.slice(0, i).reduce((sum, d) => sum + d.value, 0) / totalPct;

            const dashArray = `${pct * circ} ${circ}`;
            const dashOffset = circ * (0.25 - prevPct);

            return (
              <motion.circle
                key={`${animKey}-seg-${i}`}
                cx={cx}
                cy={cy}
                r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-white/30 font-medium">Total</span>
          <span className="text-sm font-black text-white leading-tight">
            {total}
          </span>
        </div>
      </div>
      <div className="space-y-[5px] flex-1">
        {data.map((seg, i) => (
          <motion.div
            key={`${animKey}-leg-${i}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.07, duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-[11px] text-white/60 flex-1">
              {seg.label}
            </span>
            <span
              className="text-[11px] font-black"
              style={{ color: seg.color }}
            >
              {seg.value}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
