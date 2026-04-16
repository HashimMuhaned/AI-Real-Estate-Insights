"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactPortal,
} from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  LayoutGroup,
} from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  SlidersHorizontal,
  X,
  TrendingUp,
  TrendingDown,
  Building2,
  AlertTriangle,
  BarChart3,
  MapPin,
  Zap,
  Flame,
} from "lucide-react";
import { createPortal } from "react-dom";

// ─── Types ──────────────────────────────────────────────────────────────────

type Mode = "invest" | "buy" | "rent" | "explore";
type ChartVariant =
  | "heatmap"
  | "leaderboard"
  | "donut"
  | "radialGauge"
  | "areaSparkline"
  | "topProjects"
  | "singleLine";

interface ModeConfig { label: string; placeholder: string; prompts: string[]; route: string; }
interface FilterField { id: string; label: string; options: string[]; }

interface InsightCard {
  id: string;
  type: "yield" | "buy" | "transactions" | "offplan" | "alert";
  badge: string;
  location: string;
  kpi: string;
  kpiLabel: string;
  trend?: "up" | "down" | "neutral";
  chartVariant: ChartVariant;
  chartData: unknown;
  aiInsight: string;
  accentColor: string;
  bgFrom: string;
  bgTo: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CARD_DURATION = 7000;

const MODES: Record<Mode, ModeConfig> = {
  invest: { label: "Invest", placeholder: "Best areas for 7% ROI in Dubai...", prompts: ["Best areas for 7% ROI in Dubai", "Top off-plan projects 2026", "Where to invest 1M AED?", "Highest yielding communities"], route: "/invest" },
  buy:    { label: "Buy",    placeholder: "Best areas to buy under 1.5M AED...", prompts: ["Best areas to buy under 1.5M AED", "Ready vs off-plan in Dubai Hills", "2BR apartments in JVC", "Cheapest areas to buy a villa"], route: "/buy" },
  rent:   { label: "Rent",   placeholder: "Best areas to rent a 2BR under 80K...", prompts: ["Best areas to rent a 2BR under 80K", "Cheapest areas to rent in Dubai", "Marina vs JBR for renting", "Family-friendly areas to rent"], route: "/rent" },
  explore:{ label: "Explore",placeholder: "Explore Dubai real estate trends...", prompts: ["Market trends Q1 2026", "Most transacted areas last month", "Price growth by community", "New developer launches 2026"], route: "/explore" },
};

const FILTERS: Record<Mode, FilterField[]> = {
  invest: [
    { id: "type",     label: "Property Type",  options: ["Apartment","Villa","Townhouse","Studio"] },
    { id: "bedrooms", label: "Bedrooms",        options: ["Studio","1BR","2BR","3BR","4BR+"] },
    { id: "budget",   label: "Budget",          options: ["Under 500K","500K–1M","1M–2M","2M+"] },
    { id: "area",     label: "Area",            options: ["JVC","Dubai Hills","Marina","Business Bay","Downtown"] },
  ],
  buy: [
    { id: "budget",   label: "Budget",  options: ["Under 500K","500K–1M","1M–2M","2M+"] },
    { id: "status",   label: "Status",  options: ["Off-plan","Ready"] },
    { id: "bedrooms", label: "Bedrooms",options: ["Studio","1BR","2BR","3BR","4BR+"] },
  ],
  rent: [
    { id: "type",     label: "Property Type",   options: ["Apartment","Villa","Studio"] },
    { id: "bedrooms", label: "Bedrooms",         options: ["Studio","1BR","2BR","3BR","4BR+"] },
    { id: "budget",   label: "Annual Budget",    options: ["Under 50K","50K–80K","80K–120K","120K+"] },
    { id: "area",     label: "Area",             options: ["JVC","Marina","JBR","Deira","Silicon Oasis"] },
  ],
  explore: [
    { id: "txtype", label: "Transaction Type", options: ["Sold","Rented"] },
    { id: "area",   label: "Area",             options: ["All Dubai","Downtown","Marina","Business Bay"] },
    { id: "range",  label: "Time Range",       options: ["Last 30 days","Last 90 days","Last 12 months"] },
  ],
};

// ─── Card Data ────────────────────────────────────────────────────────────────

const INSIGHT_CARDS: InsightCard[] = [
  // 1 ── Leaderboard — Top Yield Areas
  {
    id: "yield",
    type: "yield",
    badge: "Top Rental Yield",
    location: "Dubai 2026 Rankings",
    kpi: "7.8%",
    kpiLabel: "Peak ROI",
    trend: "up",
    chartVariant: "leaderboard",
    chartData: [
      { rank: 1, area: "JVC",                 roi: 7.8, change: +0.4 },
      { rank: 2, area: "Dubai Silicon Oasis", roi: 7.2, change: +0.2 },
      { rank: 3, area: "International City",  roi: 6.9, change: -0.1 },
      { rank: 4, area: "Discovery Gardens",   roi: 6.6, change: +0.3 },
      { rank: 5, area: "Business Bay",        roi: 6.1, change: +0.1 },
    ],
    aiInsight: "JVC leads all Dubai communities for the 3rd consecutive quarter, driven by affordable 1BR stock.",
    accentColor: "#22c55e",
    bgFrom: "rgba(34,197,94,0.13)",
    bgTo:   "rgba(16,185,129,0.03)",
  },
  // 2 ── Heatmap — Price per sqft
  {
    id: "heatmap",
    type: "buy",
    badge: "Price Heat Map",
    location: "Dubai Districts",
    kpi: "AED 1,850",
    kpiLabel: "Avg / sqft",
    trend: "up",
    chartVariant: "heatmap",
    chartData: [
      { label: "Palm Jumeirah", value: 4200, pct: 1.00 },
      { label: "Downtown",      value: 3600, pct: 0.86 },
      { label: "Dubai Marina",  value: 2800, pct: 0.67 },
      { label: "Dubai Hills",   value: 2400, pct: 0.57 },
      { label: "Business Bay",  value: 2100, pct: 0.50 },
      { label: "JVC",           value: 1150, pct: 0.27 },
      { label: "Deira",         value:  950, pct: 0.23 },
      { label: "Silicon Oasis", value:  780, pct: 0.19 },
    ],
    aiInsight: "Downtown & Palm remain premium outliers. JVC offers entry-level value at 73% below Palm pricing.",
    accentColor: "#f97316",
    bgFrom: "rgba(249,115,22,0.12)",
    bgTo:   "rgba(251,146,60,0.03)",
  },
  // 3 ── Donut — Transaction mix
  {
    id: "transactions",
    type: "transactions",
    badge: "Market Activity",
    location: "Dubai Metro · April 2026",
    kpi: "14,820",
    kpiLabel: "Total Transactions",
    trend: "neutral",
    chartVariant: "donut",
    chartData: [
      { label: "Apartments",  value: 52, color: "#a855f7" },
      { label: "Villas",      value: 21, color: "#ec4899" },
      { label: "Townhouses",  value: 15, color: "#6366f1" },
      { label: "Plots",       value:  8, color: "#8b5cf6" },
      { label: "Commercial",  value:  4, color: "#c084fc" },
    ],
    aiInsight: "Apartment dominance signals strong end-user demand. Villa segment up 4 pts year-on-year.",
    accentColor: "#a855f7",
    bgFrom: "rgba(168,85,247,0.13)",
    bgTo:   "rgba(139,92,246,0.03)",
  },
  // 4 ── Top Projects table — Off-plan
  {
    id: "offplan",
    type: "offplan",
    badge: "Off-plan Hotlist",
    location: "Q2 2026 Launches",
    kpi: "9.2%",
    kpiLabel: "Best Expected ROI",
    trend: "up",
    chartVariant: "topProjects",
    chartData: [
      { name: "Sobha Hartland II",  dev: "Sobha Realty", delivery: "Q4 2027", roi: 9.2, status: "hot" },
      { name: "Creek Waters 2",     dev: "Emaar",         delivery: "Q2 2028", roi: 8.6, status: "hot" },
      { name: "Binghatti Nova",     dev: "Binghatti",     delivery: "Q1 2027", roi: 8.1, status: "new" },
      // { name: "Ellington Crest",    dev: "Ellington",     delivery: "Q3 2027", roi: 7.8, status: "new" },
    ],
    aiInsight: "Sobha Hartland II remains the highest-conviction off-plan play with best price-to-ROI entry.",
    accentColor: "#f59e0b",
    bgFrom: "rgba(245,158,11,0.13)",
    bgTo:   "rgba(251,191,36,0.03)",
  },
  // 5 ── Radial Gauge — Market risk
  {
    id: "alert",
    type: "alert",
    badge: "Market Alert",
    location: "Downtown Dubai",
    kpi: "-3.1%",
    kpiLabel: "Price Correction",
    trend: "down",
    chartVariant: "radialGauge",
    chartData: {
      value: 32,
      label: "Risk Index",
      zones: [
        { label: "Low",      color: "#22c55e", from:  0, to: 33 },
        { label: "Moderate", color: "#f59e0b", from: 33, to: 66 },
        { label: "High",     color: "#ef4444", from: 66, to: 100 },
      ],
      metrics: [
        { label: "Oversupply Risk", val: "Moderate" },
        { label: "Liquidity",       val: "High" },
        { label: "Outlook 12m",     val: "Stable" },
      ],
    },
    aiInsight: "Risk index sits at 32 (Low-Moderate boundary). Short-term correction likely — medium-term fundamentals intact.",
    accentColor: "#ef4444",
    bgFrom: "rgba(239,68,68,0.13)",
    bgTo:   "rgba(248,113,113,0.03)",
  },
  // 6 ── Multi-area sparkline — Price trends
  {
    id: "pricetrend",
    type: "buy",
    badge: "Price Trends",
    location: "Top 3 Communities",
    kpi: "+18%",
    kpiLabel: "Best YoY Growth",
    trend: "up",
    chartVariant: "areaSparkline",
    chartData: {
      months: ["Oct","Nov","Dec","Jan","Feb","Mar","Apr"],
      series: [
        { label: "Dubai Hills",   color: "#3b82f6", values: [2100,2180,2230,2310,2390,2450,2480] },
        { label: "Business Bay",  color: "#22c55e", values: [1800,1850,1870,1920,1960,2010,2050] },
        { label: "JVC",           color: "#f59e0b", values: [1050,1060,1080,1100,1120,1140,1150] },
      ],
    },
    aiInsight: "Dubai Hills leads YoY appreciation at +18%. All three communities show sustained upward momentum.",
    accentColor: "#3b82f6",
    bgFrom: "rgba(59,130,246,0.13)",
    bgTo:   "rgba(56,189,248,0.03)",
  },
  // 7 ── Single line chart — avg Dubai rent trend
  {
    id: "rental-lines",
    type: "yield",
    badge: "Rental Trend",
    location: "Dubai · Avg Annual Rent (AED)",
    kpi: "+16%",
    kpiLabel: "YoY Rent Growth",
    trend: "up",
    chartVariant: "singleLine",
    chartData: {
      labels: ["Apr 25","Jun 25","Aug 25","Oct 25","Dec 25","Feb 26","Apr 26"],
      values: [62000, 64500, 67000, 70000, 74000, 69500, 72000],
      color:  "#06b6d4",
      annotation: { index: 4, label: "Peak" },
    },
    aiInsight: "Dubai average rents climbed 16% year-on-year, with a seasonal dip in early 2026 followed by a sharp Q2 recovery.",
    accentColor: "#06b6d4",
    bgFrom: "rgba(6,182,212,0.12)",
    bgTo:   "rgba(34,211,238,0.03)",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ─── CHART COMPONENTS ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// 1 ── Leaderboard
function LeaderboardChart({ data, color, animKey }: {
  data: { rank: number; area: string; roi: number; change: number }[];
  color: string; animKey: string;
}) {
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

// 2 ── Heatmap
function HeatmapChart({ data, color, animKey }: {
  data: { label: string; value: number; pct: number }[];
  color: string; animKey: string;
}) {
  const lerp = (pct: number) => {
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
          {Array.from({ length: 20 }).map((_,i) => (
            <div key={i} className="flex-1 h-full" style={{ backgroundColor: lerp(i/19) }} />
          ))}
        </div>
        <span className="text-[9px] text-white/25">Low → High AED/sqft</span>
      </div>
    </div>
  );
}

// 3 ── Donut
function DonutChart({ data, animKey }: {
  data: { label: string; value: number; color: string }[];
  animKey: string;
}) {
  const R=42, cx=56, cy=56, stroke=13;
  const circ = 2 * Math.PI * R;
  const total = data.reduce((s,d) => s+d.value, 0);
  let cumPct = 0;
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width:112, height:112 }}>
        <svg width={112} height={112} viewBox="0 0 112 112">
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
          {data.map((seg, i) => {
            const pct = seg.value / total;
            const da = `${pct * circ} ${circ}`;
            const off = circ * (0.25 - cumPct);
            cumPct += pct;
            return (
              <motion.circle key={`${animKey}-seg-${i}`}
                cx={cx} cy={cy} r={R}
                fill="none" stroke={seg.color} strokeWidth={stroke}
                strokeDasharray={da} strokeDashoffset={off} strokeLinecap="butt"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.09, duration: 0.45 }} />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-white/30 font-medium">Total</span>
          <span className="text-sm font-black text-white leading-tight">14.8K</span>
        </div>
      </div>
      <div className="space-y-[5px] flex-1">
        {data.map((seg, i) => (
          <motion.div key={`${animKey}-leg-${i}`}
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.07, duration: 0.3 }}
            className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-[11px] text-white/60 flex-1">{seg.label}</span>
            <span className="text-[11px] font-black" style={{ color: seg.color }}>{seg.value}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// 4 ── Top Projects
function TopProjectsChart({ data, color, animKey }: {
  data: { name: string; dev: string; delivery: string; roi: number; status: string }[];
  color: string; animKey: string;
}) {
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

// 5 ── Radial Gauge
function RadialGaugeChart({ data, animKey }: {
  data: { value: number; label: string; zones: { label: string; color: string; from: number; to: number }[]; metrics: { label: string; val: string }[] };
  animKey: string;
}) {
  const W=200, H=112, cx=100, cy=108, R=82;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const arc = (from: number, to: number) => {
    const x1=cx+R*Math.cos(toRad(from)), y1=cy+R*Math.sin(toRad(from));
    const x2=cx+R*Math.cos(toRad(to)),   y2=cy+R*Math.sin(toRad(to));
    return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
  };
  const valAngle = 180 + (data.value/100)*180;
  const nx=cx+(R-20)*Math.cos(toRad(valAngle)), ny=cy+(R-20)*Math.sin(toRad(valAngle));
  const zoneColor = data.zones.find(z => data.value>=z.from && data.value<z.to)?.color ?? "#fff";
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight:100 }}>
        {data.zones.map((z,i) => (
          <motion.path key={`${animKey}-z-${i}`}
            d={arc(180+(z.from/100)*180, 180+(z.to/100)*180)}
            fill="none" stroke={z.color} strokeWidth={11} strokeLinecap="round" opacity={0.22}
            initial={{ pathLength:0 }} animate={{ pathLength:1 }}
            transition={{ delay: i*0.1, duration: 0.5 }} />
        ))}
        <motion.path d={arc(180, valAngle)}
          fill="none" stroke={zoneColor} strokeWidth={11} strokeLinecap="round"
          initial={{ pathLength:0 }} animate={{ pathLength:1 }}
          transition={{ delay:0.3, duration:0.9, ease:"easeOut" }} />
        <motion.line x1={cx} y1={cy} x2={nx} y2={ny}
          stroke="white" strokeWidth={2.5} strokeLinecap="round"
          initial={{ opacity:0 }} animate={{ opacity:0.85 }}
          transition={{ delay:1, duration:0.3 }} />
        <circle cx={cx} cy={cy} r={4.5} fill="white" opacity={0.75} />
        <text x={cx} y={cy-26} textAnchor="middle" fill={zoneColor} fontSize={22} fontWeight={900}>{data.value}</text>
        <text x={cx} y={cy-10} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9}>{data.label}</text>
        {data.zones.map((z,i) => {
          const mid=180+((z.from+z.to)/2/100)*180;
          return (
            <text key={i} x={cx+(R+14)*Math.cos(toRad(mid))} y={cy+(R+14)*Math.sin(toRad(mid))}
              textAnchor="middle" fill={z.color} fontSize={8} fontWeight={700} opacity={0.7}>{z.label}</text>
          );
        })}
      </svg>
      <div className="flex gap-1.5 w-full justify-center">
        {data.metrics.map((m,i) => (
          <motion.div key={`${animKey}-m-${i}`}
            initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
            transition={{ delay: 0.5+i*0.08 }}
            className="flex flex-col items-center px-2.5 py-1.5 rounded-lg border border-white/[0.07] flex-1"
            style={{ backgroundColor:"rgba(255,255,255,0.03)" }}>
            <span className="text-[9px] text-white/30 uppercase tracking-wider text-center">{m.label}</span>
            <span className="text-[11px] font-black text-white/80">{m.val}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// 6 ── Area Sparkline (multi-area)
function AreaSparklineChart({ data, animKey }) {
  const W = 340, H = 160;
  const padL = 44, padR = 58, padT = 12, padB = 40;
  const iW = W - padL - padR, iH = H - padT - padB;

  const all = data.series.flatMap(s => s.values);
  const minV = Math.min(...all), maxV = Math.max(...all), range = maxV - minV || 1;

  const xPos = (i) => padL + (i / (data.months.length - 1)) * iW;
  const yPos = (v) => padT + iH - ((v - minV) / range) * iH;

  // 4 y-axis ticks for better readability
  const yTicks = [minV, minV + range * 0.33, minV + range * 0.66, maxV];

  const linePath = (vals) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"} ${xPos(i).toFixed(1)} ${yPos(v).toFixed(1)}`).join(" ");

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} preserveAspectRatio="xMidYMid meet">

        {/* Y-axis grid lines + labels */}
        {yTicks.map((tick, i) => {
          const y = yPos(tick);
          return (
            <g key={`ytick-${i}`}>
              <line x1={padL} y1={y} x2={W - padR} y2={y}
                stroke="rgba(255,255,255,0.08)" strokeWidth={1}
                strokeDasharray={i === 0 ? "none" : "3 3"} />
              <text x={padL - 6} y={y + 4} textAnchor="end"
                fill="rgba(255,255,255,0.45)" fontSize={10} fontWeight={700}>
                {tick >= 1000 ? `${(tick / 1000).toFixed(1)}K` : tick}
              </text>
            </g>
          );
        })}

        {/* Vertical grid lines at each month for clarity */}
        {data.months.map((m, i) => (
          <line key={`vgrid-${i}`}
            x1={xPos(i)} y1={padT} x2={xPos(i)} y2={padT + iH}
            stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
        ))}

        {/* Series: area fill + line + dots */}
        {data.series.map((s, si) => {
          const path = linePath(s.values);
          const lastX = xPos(s.values.length - 1);
          const area = `${path} L ${lastX} ${padT + iH} L ${padL} ${padT + iH} Z`;
          const gId = `asp2-${animKey}-${si}`;

          return (
            <g key={s.label}>
              <defs>
                <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={s.color} stopOpacity="0.32" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Area */}
              <motion.path d={area} fill={`url(#${gId})`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + si * 0.1, duration: 0.5 }} />

              {/* Line — thicker for better visibility */}
              <motion.path d={path} fill="none" stroke={s.color} strokeWidth={2.8}
                strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.1, ease: "easeOut", delay: si * 0.08 }} />

              {/* Dots on each data point — larger */}
              {s.values.map((v, i) => (
                <motion.circle key={i}
                  cx={xPos(i)} cy={yPos(v)} r={3.5}
                  fill="#070e1c" stroke={s.color} strokeWidth={2}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.9 + i * 0.06 + si * 0.05, duration: 0.2, type: "spring" }} />
              ))}

              {/* End label: name + value */}
              <motion.g
                initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + si * 0.08, duration: 0.35 }}>
                <text
                  x={lastX + 8}
                  y={yPos(s.values[s.values.length - 1]) + 3}
                  fill={s.color} fontSize={10} fontWeight={800}>
                  {s.label.split(" ")[0]}
                </text>
                <text
                  x={lastX + 8}
                  y={yPos(s.values[s.values.length - 1]) + 15}
                  fill={s.color} fontSize={9} fontWeight={700} opacity={0.8}>
                  {(s.values[s.values.length - 1] / 1000).toFixed(1)}K
                </text>
              </motion.g>
            </g>
          );
        })}

        {/* X-axis month labels — bigger, bolder, with more bottom padding */}
        {data.months.map((m, i) => (
          <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }}>
            {/* Tick mark */}
            <line x1={xPos(i)} y1={padT + iH} x2={xPos(i)} y2={padT + iH + 5}
              stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            <text
              x={xPos(i)} y={H - 12}
              textAnchor="middle"
              fill="rgba(255,255,255,0.7)" fontSize={11} fontWeight={700}>
              {m}
            </text>
          </motion.g>
        ))}

        {/* X-axis baseline */}
        <line x1={padL} y1={padT + iH} x2={W - padR} y2={padT + iH}
          stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
      </svg>

      {/* Growth legend below */}
      <div className="flex gap-3 mt-3 justify-center flex-wrap">
        {data.series.map((s, i) => {
          const growth = (((s.values[s.values.length - 1] - s.values[0]) / s.values[0]) * 100).toFixed(0);
          return (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: s.color + "18", border: `1px solid ${s.color}35` }}>
              {/* <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} /> */}
              <span className="text-[11px] font-bold" style={{ color: s.color }}>{s.label}</span>
              <span className="text-[11px] font-black" style={{ color: s.color }}>+{growth}%</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// 7 ── Single line chart with gradient fill, dots, annotation, y-axis ticks
function SingleLineChart({ data, animKey }) {
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

  // 3 horizontal value labels embedded inline
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

        {/* Subtle horizontal grid */}
        {yTicks.map((tick, i) => {
          const y = yPos(tick);
          return (
            <g key={`yt-${i}`}>
              <line x1={padL} y1={y} x2={W - padR} y2={y}
                stroke="rgba(255,255,255,0.06)" strokeWidth={1}
                strokeDasharray="4 4" />
              {/* Inline value label on the right edge */}
              <text x={W - padR - 4} y={y - 4} textAnchor="end"
                fill="rgba(255,255,255,0.3)" fontSize={8.5} fontWeight={600}>
                {tick >= 1000 ? `${(tick / 1000).toFixed(0)}K` : tick}
              </text>
            </g>
          );
        })}

        {/* Baseline */}
        <line x1={padL} y1={padT + iH} x2={W - padR} y2={padT + iH}
          stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

        {/* Area fill */}
        <motion.path d={areaD} fill={`url(#${gradId})`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }} />

        {/* Main line */}
        <motion.path d={pathD} fill="none" stroke={data.color} strokeWidth={3}
          strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }} />

        {/* Data dots */}
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

        {/* Peak annotation */}
        {ann && (() => {
          const p = points[ann.index];
          return (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
              <line x1={p.x} y1={p.y - 9} x2={p.x} y2={p.y - 26}
                stroke={data.color} strokeWidth={1.5} strokeDasharray="3 2" opacity={0.7} />
              <rect x={p.x - 18} y={p.y - 39} width={36} height={15} rx={5}
                fill={data.color} />
              <text x={p.x} y={p.y - 28} textAnchor="middle"
                fill="#000" fontSize={9} fontWeight={900}>{ann.label}</text>
            </motion.g>
          );
        })()}

        {/* X-axis labels — bigger, brighter, with tick marks */}
        {data.labels.map((l, i) => (
          <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.06 }}>
            <line x1={xPos(i)} y1={padT + iH} x2={xPos(i)} y2={padT + iH + 5}
              stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            <text
              x={xPos(i)} y={H - 8}
              textAnchor="middle"
              fill="rgba(255,255,255,0.65)" fontSize={10.5} fontWeight={700}>
              {l}
            </text>
          </motion.g>
        ))}
      </svg>

      {/* Summary stats */}
      {/* <div className="flex justify-between items-center mt-3 px-2">
        {[
          { label: "Low",    val: `${(minV / 1000).toFixed(0)}K` },
          { label: "High",   val: `${(maxV / 1000).toFixed(0)}K` },
          { label: "Latest", val: `${(data.values[data.values.length - 1] / 1000).toFixed(0)}K` },
        ].map((stat, i) => (
          <motion.div key={stat.label}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.08 }}
            className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-white/30 uppercase tracking-wider">{stat.label}</span>
            <span className="text-[13px] font-black"
              style={{ color: i === 2 ? data.color : "rgba(255,255,255,0.75)" }}>
              {stat.val}
            </span>
          </motion.div>
        ))}
      </div> */}
    </div>
  );
}

// ── Dispatch ─────────────────────────────────────────────────────────────────

function CardChart({ card }: { card: InsightCard }) {
  const k = card.id;
  switch (card.chartVariant) {
    case "leaderboard":   return <LeaderboardChart   data={card.chartData as any} color={card.accentColor} animKey={k} />;
    case "heatmap":       return <HeatmapChart       data={card.chartData as any} color={card.accentColor} animKey={k} />;
    case "donut":         return <DonutChart         data={card.chartData as any} animKey={k} />;
    case "topProjects":   return <TopProjectsChart   data={card.chartData as any} color={card.accentColor} animKey={k} />;
    case "radialGauge":   return <RadialGaugeChart   data={card.chartData as any} animKey={k} />;
    case "areaSparkline": return <AreaSparklineChart data={card.chartData as any} animKey={k} />;
    case "singleLine":    return <SingleLineChart    data={card.chartData as any} animKey={k} />;
    default: return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── FILTER MODAL ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function FilterModal({ mode, onClose }: { mode: Mode; onClose: () => void }) {
  const fields = FILTERS[mode];
  const [selected, setSelected] = useState<Record<string,string>>({});
  const toggle = (id:string, opt:string) => setSelected(p => ({ ...p, [id]: p[id]===opt ? "" : opt }));
  const count = Object.values(selected).filter(Boolean).length;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const content = (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.22 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor:"rgba(2,8,20,0.82)", backdropFilter:"blur(12px)" }}
      onClick={(e) => { if (e.target===e.currentTarget) onClose(); }}>
      <motion.div
        initial={{ opacity:0, y:48, scale:0.93 }} animate={{ opacity:1, y:0, scale:1 }}
        exit={{ opacity:0, y:32, scale:0.95 }}
        transition={{ type:"spring", stiffness:340, damping:28 }}
        className="relative w-full max-w-lg bg-[#070e1c] border border-white/[0.09] rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-yellow-400/[0.08] blur-3xl rounded-full pointer-events-none" />
        <div className="relative flex items-start justify-between px-7 pt-7 pb-5">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Smart Filters</h3>
            <p className="text-xs text-white/35 mt-1">Refining for <span className="text-yellow-400 font-bold capitalize">{mode}</span> mode</p>
          </div>
          <motion.button whileHover={{ scale:1.1, rotate:90 }} whileTap={{ scale:0.9 }} transition={{ duration:0.2 }} onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </motion.button>
        </div>
        <div className="mx-7 h-px bg-white/[0.05]" />
        <div className="px-7 py-6 space-y-6 max-h-[55vh] overflow-y-auto">
          {fields.map((field, fi) => (
            <motion.div key={field.id} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:fi*0.07 }}>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em] mb-3">{field.label}</p>
              <div className="flex flex-wrap gap-2">
                {field.options.map(opt => {
                  const active = selected[field.id]===opt;
                  return (
                    <motion.button key={opt} onClick={() => toggle(field.id, opt)} whileTap={{ scale:0.93 }}
                      className={`relative text-sm px-4 py-2 rounded-xl border font-semibold transition-all duration-200 overflow-hidden ${active ? "text-black border-yellow-400" : "border-white/10 text-white/55 hover:border-white/25 hover:text-white"}`}>
                      {active && <motion.div layoutId={`fpill-${field.id}`} className="absolute inset-0 bg-yellow-400" transition={{ type:"spring", stiffness:420, damping:30 }} />}
                      <span className="relative z-10">{opt}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mx-7 h-px bg-white/[0.05]" />
        <div className="px-7 py-5 flex items-center justify-between">
          <button onClick={() => setSelected({})} className="text-sm text-white/35 hover:text-white transition-colors font-medium">Clear all</button>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {count > 0 && <motion.span initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:8 }} className="text-xs text-yellow-400 font-bold">{count} applied</motion.span>}
            </AnimatePresence>
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={onClose}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-6 py-2.5 rounded-xl text-sm transition-colors">Apply Filters</motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
  return typeof window !== "undefined" ? createPortal(content, document.body) : null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── CARD CONTENT ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function InsightCardContent({ card }: { card: InsightCard }) {
  const iconMap: Record<InsightCard["type"], React.ReactNode> = {
    yield:        <TrendingUp    className="w-3.5 h-3.5" />,
    buy:          <Building2     className="w-3.5 h-3.5" />,
    transactions: <BarChart3     className="w-3.5 h-3.5" />,
    offplan:      <Zap           className="w-3.5 h-3.5" />,
    alert:        <AlertTriangle className="w-3.5 h-3.5" />,
  };
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
        <p className="text-[12.5px] text-white/68 leading-relaxed">{card.aiInsight}</p>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── 3-D FLOATING SHELL ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function FloatingCardShell({ children, accentColor }: { children: React.ReactNode; accentColor: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx=useMotionValue(0), my=useMotionValue(0);
  const cfg={ stiffness:130, damping:22, mass:0.7 };
  const rotX=useSpring(useTransform(my,[-0.5,0.5],[7,-7]),cfg);
  const rotY=useSpring(useTransform(mx,[-0.5,0.5],[-7,7]),cfg);
  const glowX=useSpring(useTransform(mx,[-0.5,0.5],[-18,18]),cfg);
  const glowY=useSpring(useTransform(my,[-0.5,0.5],[-18,18]),cfg);

  return (
    <motion.div
      ref={ref}
      onMouseMove={e => {
        if (!ref.current) return;
        const r=ref.current.getBoundingClientRect();
        mx.set((e.clientX-r.left)/r.width-0.5);
        my.set((e.clientY-r.top)/r.height-0.5);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      style={{
        rotateX:rotX, rotateY:rotY, transformStyle:"preserve-3d",
        boxShadow: useTransform([glowX,glowY],([x,y]) =>
          `${x}px ${y}px 50px ${accentColor}35, 0 30px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.055)`),
      }}
      className="relative bg-[#070e1c] rounded-3xl overflow-hidden cursor-default"
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ANIMATED HEIGHT WRAPPER — the key to smooth transitions ─────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Measures its child's natural height after mount, then animates
 * the outer container to that height whenever the child changes.
 * Children MUST be absolutely positioned inside so they don't
 * fight each other for space during the transition.
 */
function AnimatedHeight({ children, animKey }: { children: React.ReactNode; animKey: string }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  // Observe and record height of the current child
  useEffect(() => {
    if (!innerRef.current) return;
    const el = innerRef.current;

    const measure = () => setHeight(el.scrollHeight);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [animKey]); // re-run whenever the card changes

  return (
    <motion.div
      animate={{ height }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      style={{ overflow: "hidden", position: "relative" }}
    >
      {/* Invisible measurer — always rendered, never seen */}
      <div
        ref={innerRef}
        style={{ visibility: "hidden", position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "none" }}
        aria-hidden
      >
        {children}
      </div>
      {/* The real animated content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={animKey}
          initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
          exit={{   opacity: 0, y: -22, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN HERO ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function Hero1() {
  const [mode, setMode]           = useState<Mode>("invest");
  const [query, setQuery]         = useState("");
  const [showFilters, setFilters] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [isHovered, setHovered]   = useState(false);

  // RAF-based true pause/resume
  const progressRef     = useRef(0);
  const startOffsetRef  = useRef<number | null>(null);
  const rafRef          = useRef<number | null>(null);
  const [displayProgress, setDisplayProgress] = useState(0);

  const currentCard = INSIGHT_CARDS[cardIndex];

  const goTo = useCallback((i: number) => {
    setCardIndex(i);
    progressRef.current = 0;
    startOffsetRef.current = null;
    setDisplayProgress(0);
  }, []);

  const goNext = useCallback(() => goTo((cardIndex+1) % INSIGHT_CARDS.length), [cardIndex, goTo]);
  const goPrev = useCallback(() => goTo((cardIndex-1+INSIGHT_CARDS.length) % INSIGHT_CARDS.length), [cardIndex, goTo]);

  useEffect(() => {
    if (isHovered) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startOffsetRef.current = null;
      return;
    }
    const saved = progressRef.current;
    const tick = (now: number) => {
      if (startOffsetRef.current===null) startOffsetRef.current = now - saved*CARD_DURATION;
      const p = Math.min((now-startOffsetRef.current)/CARD_DURATION, 1);
      progressRef.current = p;
      setDisplayProgress(p);
      if (p>=1) { goNext(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, cardIndex]);

  const handleAskAI = () => {
    const q = query.trim() || MODES[mode].placeholder;
    console.log(`→ ${MODES[mode].route}?q=${encodeURIComponent(q)}`);
  };

  return (
    <section className="relative min-h-screen flex items-center pt-10 bg-[#030a16] text-white overflow-hidden">

      {/* ── Animated bg ─────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <motion.div animate={{ scale:[1,1.1,1], opacity:[0.15,0.22,0.15] }} transition={{ duration:12, repeat:Infinity, ease:"easeInOut" }}
          className="absolute -top-1/3 -left-1/4 w-[75vw] h-[75vw] rounded-full"
          style={{ background:"radial-gradient(circle, #1e40af 0%, transparent 68%)" }} />
        <motion.div animate={{ scale:[1,1.15,1], opacity:[0.08,0.16,0.08] }} transition={{ duration:16, repeat:Infinity, ease:"easeInOut", delay:4 }}
          className="absolute -bottom-1/3 -right-1/4 w-[65vw] h-[65vw] rounded-full"
          style={{ background:"radial-gradient(circle, #6d28d9 0%, transparent 68%)" }} />
        <div className="absolute inset-0 opacity-[0.022]"
          style={{ backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize:"52px 52px" }} />
        <motion.div animate={{ y:["-100%","220%"] }} transition={{ duration:9, repeat:Infinity, ease:"linear", delay:3 }}
          className="absolute inset-x-0 h-[25vh] opacity-60"
          style={{ background:"linear-gradient(to bottom,transparent,rgba(255,255,255,0.012),transparent)" }} />
      </div>

      {/* Filter modal */}
      <AnimatePresence>
        {showFilters && <FilterModal mode={mode} onClose={() => setFilters(false)} />}
      </AnimatePresence>

      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center relative z-10 py-20">

        {/* ── LEFT ── */}
        <div className="space-y-7">
          <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
            className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.09] rounded-full px-4 py-2">
            <motion.div animate={{ rotate:[0,18,-12,18,0] }} transition={{ duration:2.5, repeat:Infinity, repeatDelay:5 }}>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </motion.div>
            <span className="text-xs font-semibold text-white/55 tracking-wide">AI-Powered Real Estate Intelligence</span>
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:22 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.65, delay:0.08 }}
            className="text-5xl md:text-[3.75rem] font-black leading-[1.04] tracking-tight">
            Invest{" "}
            <span className="relative inline-block text-yellow-400">
              Smarter
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 180 8" fill="none" preserveAspectRatio="none">
                <motion.path d="M2 6 Q45 1 90 5 Q135 9 178 3" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round"
                  initial={{ pathLength:0, opacity:0 }} animate={{ pathLength:1, opacity:0.65 }} transition={{ delay:0.9, duration:0.8 }} />
              </svg>
            </span>{" "}in Dubai.
          </motion.h1>

          <motion.p initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, delay:0.18 }}
            className="text-[15px] text-white/42 max-w-md leading-relaxed">
            Instant ROI analysis, price trends &amp; investment signals — powered by live Dubai Land Department data.
          </motion.p>

          {/* Mode tabs */}
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, delay:0.24 }}
            className="inline-flex bg-white/[0.04] border border-white/[0.07] rounded-2xl p-1.5 gap-1">
            {(Object.keys(MODES) as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setQuery(""); }}
                className={`relative px-5 py-2 rounded-xl text-sm font-black transition-all duration-200 ${mode===m ? "text-black" : "text-white/38 hover:text-white/65"}`}>
                {mode===m && <motion.div layoutId="tab-pill" className="absolute inset-0 bg-yellow-400 rounded-xl" transition={{ type:"spring", stiffness:440, damping:34 }} />}
                <span className="relative z-10">{MODES[m].label}</span>
              </button>
            ))}
          </motion.div>

          {/* Input */}
          <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, delay:0.3 }} className="group relative">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-yellow-400/0 via-yellow-300/25 to-yellow-400/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-[2px]" />
            <div className="relative flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-2 group-focus-within:border-yellow-400/25 transition-colors duration-300">
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key==="Enter" && handleAskAI()}
                placeholder={MODES[mode].placeholder}
                className="flex-1 px-4 py-3 bg-transparent text-white placeholder-white/22 outline-none text-sm min-w-0" />
              <motion.button whileTap={{ scale:0.94 }} onClick={() => setFilters(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border border-white/[0.08] text-white/35 hover:border-yellow-400/35 hover:text-yellow-400 transition-all duration-200 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" />Filters
              </motion.button>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={handleAskAI}
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-5 py-3 rounded-xl flex items-center gap-1.5 shrink-0 text-sm transition-colors">
                Ask AI<ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Chips */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.38 }} className="flex flex-wrap gap-2">
            <AnimatePresence mode="wait">
              {MODES[mode].prompts.map((p,i) => (
                <motion.button key={`${mode}-${i}`}
                  initial={{ opacity:0, scale:0.86, y:8 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.86 }}
                  transition={{ duration:0.2, delay:i*0.05 }} whileTap={{ scale:0.94 }} onClick={() => setQuery(p)}
                  className="text-xs px-3.5 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] hover:border-white/[0.18] text-white/45 hover:text-white/85 transition-all duration-200">
                  {p}
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Trust */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.46 }} className="flex items-center gap-8 pt-1">
            {[{ val:"40K+", label:"Properties" },{ val:"DLD", label:"Data Source" },{ val:"Live", label:"Market Feed" }].map(({ val, label },i) => (
              <motion.div key={label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5+i*0.09 }}>
                <p className="text-sm font-black text-white">{val}</p>
                <p className="text-[11px] text-white/22 font-semibold">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT – Floating Intelligence Cards ── */}
        <motion.div
          initial={{ opacity:0, x:44 }}
          animate={{ opacity:1, x:0 }}
          transition={{ duration:0.85, delay:0.32, ease:[0.22,1,0.36,1] }}
          className="relative flex flex-col items-center"
        >
          <motion.div
            animate={{ y:[0,-14,0] }}
            transition={{ duration:5.8, repeat:Infinity, ease:"easeInOut" }}
            className="w-full max-w-[440px]"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* Glow */}
            <AnimatePresence mode="wait">
              <motion.div key={currentCard.id+"-glow"}
                initial={{ opacity:0, scale:0.75 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.8 }} transition={{ duration:0.8 }}
                className="absolute -inset-10 pointer-events-none rounded-[50px] blur-[50px]"
                style={{ background:`radial-gradient(ellipse at 50% 40%, ${currentCard.accentColor}45 0%, transparent 68%)` }} />
            </AnimatePresence>
            <motion.div
              animate={{ opacity:[0.15,0.28,0.15], scale:[0.95,1.05,0.95] }}
              transition={{ duration:4, repeat:Infinity, ease:"easeInOut" }}
              className="absolute -inset-4 pointer-events-none rounded-[40px] blur-[40px]"
              style={{ background:`radial-gradient(circle at 60% 60%, ${currentCard.accentColor}30 0%, transparent 65%)` }} />

            {/* ── Card with smooth height transition ── */}
            <FloatingCardShell accentColor={currentCard.accentColor}>
              {/* Accent bar — outside AnimatedHeight so it always stays at top */}
              <AnimatePresence mode="wait">
                <motion.div key={currentCard.id+"-bar"} className="h-[3px]"
                  style={{ backgroundColor:currentCard.accentColor, transformOrigin:"left" }}
                  initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ duration:0.55, ease:"easeOut" }} />
              </AnimatePresence>

              {/* Background gradient */}
              <AnimatePresence mode="wait">
                <motion.div key={currentCard.id+"-bg"} className="absolute inset-0 pointer-events-none"
                  style={{ background:`radial-gradient(ellipse at 85% 10%, ${currentCard.bgFrom}, ${currentCard.bgTo} 55%, transparent 80%)` }}
                  initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.65 }} />
              </AnimatePresence>

              {/* ── ANIMATED HEIGHT wrapper ── */}
              <AnimatedHeight animKey={currentCard.id}>
                <InsightCardContent card={currentCard} />
              </AnimatedHeight>
            </FloatingCardShell>

            {/* Nav row */}
            <div className="mt-5 flex items-center justify-between px-1 gap-3">
              <motion.button whileHover={{ scale:1.12, x:-2 }} whileTap={{ scale:0.9 }} onClick={goPrev}
                className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shrink-0">
                <ChevronLeft className="w-4 h-4" />
              </motion.button>

              <div className="flex items-center gap-2 flex-1 justify-center">
                {INSIGHT_CARDS.map((card, i) => {
                  const active = i===cardIndex;
                  return (
                    <motion.button key={card.id} onClick={() => goTo(i)} whileHover={{ scale:1.2 }} whileTap={{ scale:0.88 }}
                      className="relative flex items-center justify-center" style={{ height:32 }} title={card.badge}>
                      <motion.div
                        animate={{ width:active?32:8, backgroundColor:active?card.accentColor:"rgba(255,255,255,0.15)", borderRadius:active?6:999, height:active?10:8 }}
                        transition={{ type:"spring", stiffness:400, damping:28 }} />
                      {active && (
                        <motion.div className="absolute inset-0 rounded-md blur-[6px]"
                          style={{ backgroundColor:card.accentColor+"60" }}
                          animate={{ opacity:[0.6,1,0.6] }} transition={{ duration:1.5, repeat:Infinity }} />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <motion.button whileHover={{ scale:1.12, x:2 }} whileTap={{ scale:0.9 }} onClick={goNext}
                className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shrink-0">
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Progress bar */}
            <div className="mt-3 mx-1 h-[3px] bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full origin-left"
                style={{ backgroundColor:currentCard.accentColor, scaleX:displayProgress, transformOrigin:"left" }}
                transition={{ duration:0 }} />
            </div>

            {/* Hint / counter */}
            <div className="mt-2 flex justify-between items-center px-1">
              <AnimatePresence>
                {isHovered && (
                  <motion.p initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:3 }}
                    className="text-[11px] text-white/22 flex items-center gap-1.5">
                    <motion.span animate={{ opacity:[1,0,1] }} transition={{ duration:1, repeat:Infinity }}>⏸</motion.span>
                    Paused — hover away to resume
                  </motion.p>
                )}
              </AnimatePresence>
              <span className="text-[11px] text-white/15 ml-auto">{cardIndex+1} / {INSIGHT_CARDS.length}</span>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}