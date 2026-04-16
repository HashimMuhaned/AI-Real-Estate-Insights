import { motion } from "framer-motion";

export default function HeatmapChart({ data, color, animKey }) {
  const lerp = (pct) => {
    const [r0,g0,b0] = [15,23,42];
    const r1 = parseInt(color.slice(1,3),16), g1 = parseInt(color.slice(3,5),16), b1 = parseInt(color.slice(5,7),16);
    return `rgb(${Math.round(r0+(r1-r0)*pct)},${Math.round(g0+(g1-g0)*pct)},${Math.round(b0+(b1-b0)*pct)})`;
  };
  return (
    <div className="space-y-[5px]">
      {data.map((row, i) => (
        <motion.div key={`${animKey}-hm-${i}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05, duration: 0.35 }}
          className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 w-24 truncate shrink-0 text-right">{row.label}</span>
          <div className="flex-1 h-[14px] rounded-[3px] overflow-hidden bg-white/[0.04]">
            <motion.div className="h-full rounded-[3px]"
              style={{ backgroundColor: lerp(row.pct) }}
              initial={{ width: 0 }}
              animate={{ width: `${row.pct * 100}%` }}
              transition={{ delay: 0.08 + i * 0.05, duration: 0.6, ease: "easeOut" }} />
          </div>
          <span className="text-[10px] font-bold text-white/55 w-14 shrink-0 text-right">{row.value.toLocaleString()}</span>
        </motion.div>
      ))}
      <div className="flex justify-end items-center gap-1.5 pt-1">
        <div className="flex h-[4px] rounded-full overflow-hidden w-24">
          {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(i => (
            <div key={`grad-${i}`} className="flex-1 h-full" style={{ backgroundColor: lerp(i/19) }} />
          ))}
        </div>
        <span className="text-[9px] text-white/25">Low → High AED/sqft</span>
      </div>
    </div>
  );
}