import { motion } from "framer-motion";

export default function SingleLineChart({ data, animKey }) {
  const W = 400, H = 150;
  const padL = 8, padR = 8, padT = 24, padB = 34;
  const iW = W - padL - padR, iH = H - padT - padB;

  const minV = Math.min(...data.values);
  const maxV = Math.max(...data.values);
  const range = maxV - minV || 1;

  const xPos = (i) => padL + (i / (data.values.length - 1)) * iW;
  const yPos = (v) => padT + iH - ((v - minV) / range) * iH;

  const points = data.values.map((v, i) => ({ x: xPos(i), y: yPos(v), v }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${xPos(data.values.length - 1)} ${padT + iH} L ${padL} ${padT + iH} Z`;

  const gradId = `sl-${animKey}`;
  const ann = data.annotation;
  const yTicks = [minV, minV + range / 2, maxV];

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={data.color} stopOpacity="0.45" />
            <stop offset="55%"  stopColor={data.color} stopOpacity="0.1" />
            <stop offset="100%" stopColor={data.color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((tick, i) => {
          const y = yPos(tick);
          return (
            <g key={`yt-${i}`}>
              <line x1={padL} y1={y} x2={W - padR} y2={y}
                stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="4 4" />
              <text x={W - padR - 4} y={y - 4} textAnchor="end"
                fill="rgba(255,255,255,0.3)" fontSize={8.5} fontWeight={600}>
                {tick >= 1000 ? `${(tick / 1000).toFixed(0)}K` : tick}
              </text>
            </g>
          );
        })}

        <line x1={padL} y1={padT + iH} x2={W - padR} y2={padT + iH}
          stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

        <motion.path d={areaD} fill={`url(#${gradId})`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }} />

        <motion.path d={pathD} fill="none" stroke={data.color} strokeWidth={3}
          strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }} />

        {points.map((p, i) => {
          const isPeak = i === ann?.index;
          return (
            <motion.circle key={i}
              cx={p.x} cy={p.y}
              r={isPeak ? 6 : 3.5}
              fill={isPeak ? data.color : "#070e1c"}
              stroke={data.color}
              strokeWidth={isPeak ? 0 : 2.2}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.85 + i * 0.07, duration: 0.25, type: "spring" }} />
          );
        })}

        {ann && (() => {
          const p = points[ann.index];
          return (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
              <line x1={p.x} y1={p.y - 9} x2={p.x} y2={p.y - 26}
                stroke={data.color} strokeWidth={1.5} strokeDasharray="3 2" opacity={0.7} />
              <rect x={p.x - 18} y={p.y - 39} width={36} height={15} rx={5} fill={data.color} />
              <text x={p.x} y={p.y - 28} textAnchor="middle"
                fill="#000" fontSize={9} fontWeight={900}>{ann.label}</text>
            </motion.g>
          );
        })()}

        {data.labels.map((l, i) => (
          <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.06 }}>
            <line x1={xPos(i)} y1={padT + iH} x2={xPos(i)} y2={padT + iH + 5}
              stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            <text x={xPos(i)} y={H - 8} textAnchor="middle"
              fill="rgba(255,255,255,0.65)" fontSize={10.5} fontWeight={700}>
              {l}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}