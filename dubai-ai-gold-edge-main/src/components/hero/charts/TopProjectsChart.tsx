import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export default function TopProjectsChart({ data, color, animKey }) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-[1fr_60px_44px] gap-2 px-1 mb-0.5">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/25">Project</span>
        <span className="text-[9px] font-black uppercase tracking-widest text-white/25 text-center">Delivery</span>
        <span className="text-[9px] font-black uppercase tracking-widest text-white/25 text-right">ROI</span>
      </div>
      {data.map((row, i) => (
        <motion.div key={`${animKey}-proj-${i}`}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.38, ease: [0.22,1,0.36,1] }}
          className="grid grid-cols-[1fr_60px_44px] gap-2 items-center px-3 py-2.5 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-colors"
          style={{ backgroundColor: i === 0 ? color+"12" : "rgba(255,255,255,0.03)" }}>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-white leading-tight">{row.name}</span>
              {row.status === "hot" && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: color+"25", color }}>
                  <Flame className="w-2.5 h-2.5" />HOT
                </span>
              )}
              {row.status === "new" && (
                <span className="inline-flex text-[9px] font-black px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">NEW</span>
              )}
            </div>
            <span className="text-[10px] text-white/35">{row.dev}</span>
          </div>
          <span className="text-[11px] text-white/50 text-center font-medium">{row.delivery}</span>
          <span className="text-sm font-black text-right" style={{ color }}>{row.roi}%</span>
        </motion.div>
      ))}
    </div>
  );
}