import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Building2, AlertTriangle, BarChart3, MapPin, Zap, Sparkles } from "lucide-react";
import CardChart from "./charts/CardChart";

const iconMap = {
  yield:        <TrendingUp    className="w-3.5 h-3.5" />,
  buy:          <Building2     className="w-3.5 h-3.5" />,
  transactions: <BarChart3     className="w-3.5 h-3.5" />,
  offplan:      <Zap           className="w-3.5 h-3.5" />,
  alert:        <AlertTriangle className="w-3.5 h-3.5" />,
};

export default function InsightCardContent({ card }) {
  return (
    <div className="p-6 flex flex-col gap-4">
      {/* Badge + live */}
      <div className="flex items-center justify-between">
        <motion.span initial={{ opacity:0, scale:0.82, x:-8 }} animate={{ opacity:1, scale:1, x:0 }} transition={{ delay:0.08, duration:0.35, type:"spring" }}
          className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full"
          style={{ backgroundColor: card.accentColor+"22", color: card.accentColor }}>
          {iconMap[card.type]}{card.badge}
        </motion.span>
        <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
          className="text-[10px] font-mono text-white/20 flex items-center gap-1">
          <motion.span animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.6, repeat:Infinity }}
            className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: card.accentColor }} />
          LIVE · DLD
        </motion.span>
      </div>

      {/* Location + KPI */}
      <div className="flex items-start justify-between gap-4">
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.14 }}>
          <p className="text-[11px] text-white/30 flex items-center gap-1 mb-1"><MapPin className="w-3 h-3" />Location</p>
          <h3 className="text-[1.15rem] font-black text-white leading-tight tracking-tight">{card.location}</h3>
        </motion.div>
        <motion.div initial={{ opacity:0, scale:0.75 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.2, type:"spring", stiffness:280, damping:18 }}
          className="text-right shrink-0">
          <p className="text-[11px] text-white/30 mb-1">{card.kpiLabel}</p>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-[1.8rem] font-black leading-none tracking-tight" style={{ color: card.accentColor }}>{card.kpi}</span>
            {card.trend==="up"   && <TrendingUp   className="w-5 h-5" style={{ color: card.accentColor }} />}
            {card.trend==="down" && <TrendingDown  className="w-5 h-5 text-red-400" />}
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.24 }}
        className="rounded-2xl overflow-hidden px-3 pt-3 pb-2"
        style={{ backgroundColor: card.accentColor+"0d", border:`1px solid ${card.accentColor}28` }}>
        <CardChart card={card} />
      </motion.div>

      {/* AI Insight */}
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.34 }}
        className="rounded-2xl p-3.5"
        style={{ backgroundColor: card.accentColor+"0b", border:`1px solid ${card.accentColor}22` }}>
        <p className="text-[10px] text-white/30 mb-1.5 flex items-center gap-1.5 font-black uppercase tracking-widest">
          <Sparkles className="w-3 h-3" style={{ color: card.accentColor }} />AI Insight
        </p>
        <p className="text-[12.5px] text-white/[0.68] leading-relaxed">{card.aiInsight}</p>
      </motion.div>
    </div>
  );
}