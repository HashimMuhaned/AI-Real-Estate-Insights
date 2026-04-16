import { motion } from "framer-motion";

export default function AreaSparklineChart({ data, animKey }) {
  console.log(data);
  const W = 340,
    H = 160;
  const padL = 44,
    padR = 70,
    padT = 12,
    padB = 40;
  const iW = W - padL - padR,
    iH = H - padT - padB;

  // ✅ Normalize data (IMPORTANT)
  const normalizedSeries = data.series.map((s) => {
    const vals = [...s.values];
    while (vals.length < data.months.length) {
      vals.push(vals[vals.length - 1] ?? 0); // fill missing
    }
    return { ...s, values: vals };
  });

  const all = normalizedSeries.flatMap((s) => s.values);
  const minV = Math.min(...all);
  const maxV = Math.max(...all);
  const range = Math.max(maxV - minV, 1);

  const xPos = (i) => padL + (i / (data.months.length - 1)) * iW;
  const yPos = (v) => padT + iH - ((v - minV) / range) * iH;

  const yTicks = [minV, minV + range * 0.33, minV + range * 0.66, maxV];

  const linePath = (vals) =>
    vals
      .map((v, i) => `${i === 0 ? "M" : "L"} ${xPos(i)} ${yPos(v)}`)
      .join(" ");

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {/* Y GRID */}
        {yTicks.map((tick, i) => {
          const y = yPos(tick);
          return (
            <g key={i}>
              <line
                x1={padL}
                y1={y}
                x2={W - padR}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray={i === 0 ? "none" : "3 3"}
              />
              <text
                x={padL - 6}
                y={y + 4}
                textAnchor="end"
                fill="rgba(255,255,255,0.45)"
                fontSize={10}
                fontWeight={700}
              >
                {(tick / 1000).toFixed(1)}K
              </text>
            </g>
          );
        })}

        {/* SERIES */}
        {normalizedSeries.map((s, si) => {
          const path = linePath(s.values);
          const lastIndex = s.values.length - 1;
          const lastX = Math.min(xPos(lastIndex) + 6, W - 40);

          const area = `${path} L ${xPos(lastIndex)} ${padT + iH} L ${padL} ${padT + iH} Z`;
          const gId = `g-${animKey}-${si}`;

          return (
            <g key={s.label}>
              <defs>
                <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
                </linearGradient>
              </defs>

              <motion.path
                d={area}
                fill={`url(#${gId})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />

              <motion.path
                d={path}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />

              {/* POINTS */}
              {s.values.map((v, i) => (
                <circle
                  key={i}
                  cx={xPos(i)}
                  cy={yPos(v)}
                  r={3}
                  fill="#070e1c"
                  stroke={s.color}
                  strokeWidth={2}
                />
              ))}

              {/* LABEL */}
              <text
                x={lastX}
                y={yPos(s.values[lastIndex])}
                fill={s.color}
                fontSize={10}
                fontWeight={800}
              >
                {s.label.split(" ")[0]}
              </text>
            </g>
          );
        })}

        {/* X AXIS */}
        {data.months.map((m, i) => (
          <text
            key={i}
            x={xPos(i)}
            y={H - 12}
            textAnchor="middle"
            fill="rgba(255,255,255,0.7)"
            fontSize={11}
          >
            {m}
          </text>
        ))}
      </svg>

      {/* LEGEND */}
      <div className="flex gap-3 mt-3 justify-center flex-wrap">
        {normalizedSeries.map((s, i) => {
          const first = s.values[0] || 1;
          const last = s.values[s.values.length - 1];
          const growth = ((last - first) / first) * 100;

          return (
            <div
              key={s.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: s.color + "18",
                border: `1px solid ${s.color}35`,
              }}
            >
              <span
                className="text-[11px] font-bold"
                style={{ color: s.color }}
              >
                {s.label}
              </span>
              <span
                className="text-[11px] font-black"
                style={{ color: s.color }}
              >
                {growth >= 0 ? "+" : ""}
                {growth.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
