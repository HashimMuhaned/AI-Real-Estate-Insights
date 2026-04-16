import { motion } from "framer-motion";

export default function LeaderboardChart({ data, color, animKey }) {
  return (
    <div className="space-y-[7px]">
      {data.map((row, i) => (
        <motion.div key={`${animKey}-${i}`}
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07, duration: 0.38, ease: [0.22,1,0.36,1] }}
          className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0"
            style={i === 0
              ? { backgroundColor: color + "30", color }
              : { backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
            {row.rank}
          </span>
          <span className="text-xs text-white/70 flex-1 truncate font-medium">{row.area}</span>
          <div className="w-20 h-[5px] rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div className="h-full rounded-full"
              style={{ backgroundColor: i === 0 ? color : color + "70" }}
              initial={{ width: 0 }}
              animate={{ width: `${(row.roi / 8) * 100}%` }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.55, ease: "easeOut" }} />
          </div>
          <span className="text-xs font-black w-10 text-right"
            style={{ color: i === 0 ? color : "rgba(255,255,255,0.5)" }}>{row.roi}%</span>
          <span className={`text-[10px] font-bold w-9 text-right ${row.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {row.change >= 0 ? "+" : ""}{row.change}
          </span>
        </motion.div>
      ))}
    </div>
  );
}