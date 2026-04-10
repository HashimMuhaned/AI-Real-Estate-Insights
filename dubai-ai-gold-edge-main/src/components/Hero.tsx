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
} from "framer-motion";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { createPortal } from "react-dom";

// ─── Types ─────────────────────────────────────────────────────────────────

type Mode = "invest" | "buy" | "rent" | "explore";

interface ModeConfig {
  label: string;
  placeholder: string;
  prompts: string[];
  route: string;
}

interface FilterField {
  id: string;
  label: string;
  options: string[];
}

interface InsightCard {
  id: string;
  type: "yield" | "buy" | "transactions" | "offplan" | "alert";
  badge: string;
  location: string;
  kpi: string;
  kpiLabel: string;
  trend?: "up" | "down" | "neutral";
  chartData: number[];
  chartType: "bar" | "line";
  aiInsight: string;
  accentColor: string;
  bgFrom: string;
  bgTo: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const CARD_DURATION = 7000;

const MODES: Record<Mode, ModeConfig> = {
  invest: {
    label: "Invest",
    placeholder: "Best areas for 7% ROI in Dubai...",
    prompts: [
      "Best areas for 7% ROI in Dubai",
      "Top off-plan projects 2026",
      "Where to invest 1M AED?",
      "Highest yielding communities",
    ],
    route: "/invest",
  },
  buy: {
    label: "Buy",
    placeholder: "Best areas to buy under 1.5M AED...",
    prompts: [
      "Best areas to buy under 1.5M AED",
      "Ready vs off-plan in Dubai Hills",
      "2BR apartments in JVC",
      "Cheapest areas to buy a villa",
    ],
    route: "/buy",
  },
  rent: {
    label: "Rent",
    placeholder: "Best areas to rent a 2BR under 80K...",
    prompts: [
      "Best areas to rent a 2BR under 80K",
      "Cheapest areas to rent in Dubai",
      "Marina vs JBR for renting",
      "Family-friendly areas to rent",
    ],
    route: "/rent",
  },
  explore: {
    label: "Explore",
    placeholder: "Explore Dubai real estate trends...",
    prompts: [
      "Market trends Q1 2026",
      "Most transacted areas last month",
      "Price growth by community",
      "New developer launches 2026",
    ],
    route: "/explore",
  },
};

const FILTERS: Record<Mode, FilterField[]> = {
  invest: [
    { id: "type", label: "Property Type", options: ["Apartment", "Villa", "Townhouse", "Studio"] },
    { id: "bedrooms", label: "Bedrooms", options: ["Studio", "1BR", "2BR", "3BR", "4BR+"] },
    { id: "budget", label: "Budget", options: ["Under 500K", "500K–1M", "1M–2M", "2M+"] },
    { id: "area", label: "Area", options: ["JVC", "Dubai Hills", "Marina", "Business Bay", "Downtown"] },
  ],
  buy: [
    { id: "budget", label: "Budget", options: ["Under 500K", "500K–1M", "1M–2M", "2M+"] },
    { id: "status", label: "Status", options: ["Off-plan", "Ready"] },
    { id: "bedrooms", label: "Bedrooms", options: ["Studio", "1BR", "2BR", "3BR", "4BR+"] },
  ],
  rent: [
    { id: "type", label: "Property Type", options: ["Apartment", "Villa", "Studio"] },
    { id: "bedrooms", label: "Bedrooms", options: ["Studio", "1BR", "2BR", "3BR", "4BR+"] },
    { id: "budget", label: "Annual Budget", options: ["Under 50K", "50K–80K", "80K–120K", "120K+"] },
    { id: "area", label: "Area", options: ["JVC", "Marina", "JBR", "Deira", "Silicon Oasis"] },
  ],
  explore: [
    { id: "txtype", label: "Transaction Type", options: ["Sold", "Rented"] },
    { id: "area", label: "Area", options: ["All Dubai", "Downtown", "Marina", "Business Bay"] },
    { id: "range", label: "Time Range", options: ["Last 30 days", "Last 90 days", "Last 12 months"] },
  ],
};

const INSIGHT_CARDS: InsightCard[] = [
  {
    id: "yield",
    type: "yield",
    badge: "Top Rental Yield",
    location: "Jumeirah Village Circle",
    kpi: "7.8%",
    kpiLabel: "ROI",
    trend: "up",
    chartData: [40, 55, 48, 70, 65, 80, 75],
    chartType: "bar",
    aiInsight: "High rental demand paired with low entry price creates an exceptional yield-to-cost ratio.",
    accentColor: "#22c55e",
    bgFrom: "rgba(34,197,94,0.13)",
    bgTo: "rgba(16,185,129,0.03)",
  },
  {
    id: "buy",
    type: "buy",
    badge: "Best to Buy",
    location: "Dubai Hills Estate",
    kpi: "+12%",
    kpiLabel: "Price Growth",
    trend: "up",
    chartData: [30, 38, 45, 52, 60, 70, 78],
    chartType: "line",
    aiInsight: "Strong capital appreciation driven by infrastructure growth and school-zone demand.",
    accentColor: "#3b82f6",
    bgFrom: "rgba(59,130,246,0.13)",
    bgTo: "rgba(56,189,248,0.03)",
  },
  {
    id: "transactions",
    type: "transactions",
    badge: "Market Activity",
    location: "Business Bay",
    kpi: "1,240",
    kpiLabel: "Transactions / mo",
    trend: "neutral",
    chartData: [80, 95, 70, 110, 100, 120, 115],
    chartType: "bar",
    aiInsight: "High-liquidity market with consistent transaction volume — ideal for short exits.",
    accentColor: "#a855f7",
    bgFrom: "rgba(168,85,247,0.13)",
    bgTo: "rgba(139,92,246,0.03)",
  },
  {
    id: "offplan",
    type: "offplan",
    badge: "Off-plan Opportunity",
    location: "Sobha Hartland II",
    kpi: "9.2%",
    kpiLabel: "Expected ROI",
    trend: "up",
    chartData: [50, 55, 62, 70, 80, 88, 95],
    chartType: "line",
    aiInsight: "Early entry pricing still available. Delivery 2027 with strong pre-launch demand signals.",
    accentColor: "#f59e0b",
    bgFrom: "rgba(245,158,11,0.13)",
    bgTo: "rgba(251,191,36,0.03)",
  },
  {
    id: "alert",
    type: "alert",
    badge: "Market Alert",
    location: "Downtown Dubai",
    kpi: "-3.1%",
    kpiLabel: "Price Correction",
    trend: "down",
    chartData: [90, 85, 88, 80, 75, 72, 70],
    chartType: "line",
    aiInsight: "Possible short-term correction. Monitor before committing — medium-term outlook remains stable.",
    accentColor: "#ef4444",
    bgFrom: "rgba(239,68,68,0.13)",
    bgTo: "rgba(248,113,113,0.03)",
  },
];

// ─── Mini Charts ─────────────────────────────────────────────────────────────

function MiniBarChart({ data, color, animKey }: { data: number[]; color: string; animKey: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-[3px] h-14 w-full">
      {data.map((val, i) => (
        <motion.div
          key={`${animKey}-${i}`}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 0.88 }}
          transition={{ delay: i * 0.07, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ height: `${(val / max) * 100}%`, backgroundColor: color, transformOrigin: "bottom" }}
          className="flex-1 rounded-[3px]"
        />
      ))}
    </div>
  );
}

function MiniLineChart({ data, color, animKey }: { data: number[]; color: string; animKey: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 260, H = 56;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * (H * 0.82) - H * 0.09,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${W} ${H} L 0 ${H} Z`;
  const gradId = `lg-${animKey}-${color.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        key={animKey + "-area"}
        d={areaD}
        fill={`url(#${gradId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      />
      <motion.path
        key={animKey + "-line"}
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
      />
      {pts.map((p, i) => (
        <motion.circle
          key={`${animKey}-dot-${i}`}
          cx={p.x}
          cy={p.y}
          r={3}
          fill={color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8 + i * 0.06, duration: 0.3, type: "spring" }}
        />
      ))}
    </svg>
  );
}

// ─── Filter Modal ─────────────────────────────────────────────────────────────

function FilterModal({ mode, onClose }: { mode: Mode; onClose: () => void }) {
  const fields = FILTERS[mode];
  const [selected, setSelected] = useState<Record<string, string>>({});

  const toggle = (fieldId: string, option: string) =>
    setSelected((prev) =>
      prev[fieldId] === option ? { ...prev, [fieldId]: "" } : { ...prev, [fieldId]: option }
    );

  const selectedCount = Object.values(selected).filter(Boolean).length;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(2,8,20,0.82)", backdropFilter: "blur(12px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 340, damping: 28, mass: 0.85 }}
        className="relative w-full max-w-lg bg-[#070e1c] border border-white/[0.09] rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Top gradient bar */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />

        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-yellow-400/8 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-start justify-between px-7 pt-7 pb-5">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Smart Filters</h3>
            <p className="text-xs text-white/35 mt-1">
              Refining results for{" "}
              <span className="text-yellow-400 font-bold capitalize">{mode}</span> mode
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 transition-colors mt-0.5"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="mx-7 h-px bg-white/[0.05]" />

        {/* Fields */}
        <div className="px-7 py-6 space-y-6 max-h-[55vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {fields.map((field, fi) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: fi * 0.07, duration: 0.35 }}
            >
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em] mb-3">
                {field.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {field.options.map((opt) => {
                  const active = selected[field.id] === opt;
                  return (
                    <motion.button
                      key={opt}
                      onClick={() => toggle(field.id, opt)}
                      whileTap={{ scale: 0.93 }}
                      className={`relative text-sm px-4 py-2 rounded-xl border font-semibold transition-all duration-200 overflow-hidden ${
                        active
                          ? "text-black border-yellow-400"
                          : "border-white/10 text-white/55 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId={`fpill-${field.id}`}
                          className="absolute inset-0 bg-yellow-400"
                          transition={{ type: "spring", stiffness: 420, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{opt}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mx-7 h-px bg-white/[0.05]" />

        {/* Footer */}
        <div className="px-7 py-5 flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelected({})}
            className="text-sm text-white/35 hover:text-white transition-colors font-medium"
          >
            Clear all
          </motion.button>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {selectedCount > 0 && (
                <motion.span
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="text-xs text-yellow-400 font-bold"
                >
                  {selectedCount} applied
                </motion.span>
              )}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Apply Filters
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return typeof window !== "undefined" ? createPortal(content, document.body) : null;
}

// ─── Card Content ─────────────────────────────────────────────────────────────

function InsightCardContent({ card }: { card: InsightCard }) {
  const iconMap: Record<InsightCard["type"], React.ReactNode> = {
    yield: <TrendingUp className="w-3.5 h-3.5" />,
    buy: <Building2 className="w-3.5 h-3.5" />,
    transactions: <BarChart3 className="w-3.5 h-3.5" />,
    offplan: <Zap className="w-3.5 h-3.5" />,
    alert: <AlertTriangle className="w-3.5 h-3.5" />,
  };

  return (
    <div className="p-7 flex flex-col gap-5">
      {/* Badge + live tag */}
      <div className="flex items-center justify-between">
        <motion.span
          initial={{ opacity: 0, scale: 0.82, x: -8 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.08, duration: 0.35, type: "spring" }}
          className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full"
          style={{ backgroundColor: card.accentColor + "22", color: card.accentColor }}
        >
          {iconMap[card.type]}
          {card.badge}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[10px] font-mono text-white/20 flex items-center gap-1"
        >
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: card.accentColor }}
          />
          LIVE · DLD
        </motion.span>
      </div>

      {/* Location + KPI */}
      <div className="flex items-start justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.4 }}
        >
          <p className="text-[11px] text-white/30 flex items-center gap-1 mb-1.5">
            <MapPin className="w-3 h-3" /> Location
          </p>
          <h3 className="text-[1.35rem] font-black text-white leading-tight tracking-tight">
            {card.location}
          </h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 280, damping: 18 }}
          className="text-right shrink-0"
        >
          <p className="text-[11px] text-white/30 mb-1.5">{card.kpiLabel}</p>
          <div className="flex items-center gap-1.5 justify-end">
            <span
              className="text-[2rem] font-black leading-none tracking-tight"
              style={{ color: card.accentColor }}
            >
              {card.kpi}
            </span>
            {card.trend === "up" && <TrendingUp className="w-5 h-5" style={{ color: card.accentColor }} />}
            {card.trend === "down" && <TrendingDown className="w-5 h-5 text-red-400" />}
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.4 }}
        className="rounded-2xl overflow-hidden px-3 pt-3 pb-2"
        style={{ backgroundColor: card.accentColor + "0e", border: `1px solid ${card.accentColor}28` }}
      >
        {card.chartType === "bar" ? (
          <MiniBarChart data={card.chartData} color={card.accentColor} animKey={card.id} />
        ) : (
          <MiniLineChart data={card.chartData} color={card.accentColor} animKey={card.id} />
        )}
      </motion.div>

      {/* AI Insight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36, duration: 0.4 }}
        className="rounded-2xl p-4"
        style={{ backgroundColor: card.accentColor + "0b", border: `1px solid ${card.accentColor}22` }}
      >
        <p className="text-[10px] text-white/30 mb-2 flex items-center gap-1.5 font-black uppercase tracking-widest">
          <Sparkles className="w-3 h-3" style={{ color: card.accentColor }} />
          AI Insight
        </p>
        <p className="text-sm text-white/70 leading-relaxed">{card.aiInsight}</p>
      </motion.div>
    </div>
  );
}

// ─── 3D Floating Card Shell ────────────────────────────────────────────────────

function FloatingCardShell({
  children,
  accentColor,
}: {
  children: React.ReactNode;
  accentColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springCfg = { stiffness: 130, damping: 22, mass: 0.7 };
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), springCfg);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), springCfg);
  const glowX = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), springCfg);
  const glowY = useSpring(useTransform(my, [-0.5, 0.5], [-18, 18]), springCfg);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      style={{
        rotateX: rotX,
        rotateY: rotY,
        transformStyle: "preserve-3d",
        boxShadow: useTransform(
          [glowX, glowY],
          ([x, y]) =>
            `${x}px ${y}px 50px ${accentColor}35, 0 30px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)`
        ),
      }}
      className="relative bg-[#070e1c] rounded-3xl overflow-hidden cursor-default"
    >
      {children}
    </motion.div>
  );
}

// ─── Main Hero ────────────────────────────────────────────────────────────────

export default function Hero() {
  const [mode, setMode] = useState<Mode>("invest");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Card state
  const [cardIndex, setCardIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // True pause-resume progress via RAF
  const progressRef = useRef(0); // 0–1
  const startOffsetRef = useRef<number | null>(null); // ms offset so resume works correctly
  const rafRef = useRef<number | null>(null);
  const [displayProgress, setDisplayProgress] = useState(0);

  const currentCard = INSIGHT_CARDS[cardIndex];

  const goTo = useCallback((i: number) => {
    setCardIndex(i);
    progressRef.current = 0;
    startOffsetRef.current = null;
    setDisplayProgress(0);
  }, []);

  const goNext = useCallback(
    () => goTo((cardIndex + 1) % INSIGHT_CARDS.length),
    [cardIndex, goTo]
  );
  const goPrev = useCallback(
    () => goTo((cardIndex - 1 + INSIGHT_CARDS.length) % INSIGHT_CARDS.length),
    [cardIndex, goTo]
  );

  // RAF loop — pauses exactly where it was, resumes from there
  useEffect(() => {
    if (isHovered) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startOffsetRef.current = null; // force recalc on resume
      return;
    }

    const savedProgress = progressRef.current;

    const tick = (now: number) => {
      if (startOffsetRef.current === null) {
        // On first tick after (re)start: compute a fake start time so elapsed reflects saved progress
        startOffsetRef.current = now - savedProgress * CARD_DURATION;
      }
      const elapsed = now - startOffsetRef.current;
      const p = Math.min(elapsed / CARD_DURATION, 1);
      progressRef.current = p;
      setDisplayProgress(p);

      if (p >= 1) {
        goNext();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, cardIndex]);

  const handleAskAI = () => {
    const q = query.trim() || MODES[mode].placeholder;
    console.log(`→ ${MODES[mode].route}?q=${encodeURIComponent(q)}`);
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 bg-[#030a16] text-white overflow-hidden">

      {/* ── Animated background ─────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.22, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/3 -left-1/4 w-[75vw] h-[75vw] rounded-full"
          style={{ background: "radial-gradient(circle, #1e40af 0%, transparent 68%)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute -bottom-1/3 -right-1/4 w-[65vw] h-[65vw] rounded-full"
          style={{ background: "radial-gradient(circle, #6d28d9 0%, transparent 68%)" }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        {/* Shimmer sweep */}
        <motion.div
          animate={{ y: ["-100%", "220%"] }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear", delay: 3 }}
          className="absolute inset-x-0 h-[25vh] opacity-60"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.012), transparent)" }}
        />
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <FilterModal mode={mode} onClose={() => setShowFilters(false)} />
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center relative z-10 py-4 pb-8">

        {/* ── LEFT ──────────────────────────────────────────── */}
        <div className="space-y-7">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.09] rounded-full px-4 py-2"
          >
            <motion.div
              animate={{ rotate: [0, 18, -12, 18, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 5 }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </motion.div>
            <span className="text-xs font-semibold text-white/55 tracking-wide">
              AI-Powered Real Estate Intelligence
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="text-5xl md:text-[3.75rem] font-black leading-[1.04] tracking-tight"
          >
            Invest{" "}
            <span className="relative inline-block text-yellow-400">
              Smarter
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 180 8" fill="none" preserveAspectRatio="none">
                <motion.path
                  d="M2 6 Q45 1 90 5 Q135 9 178 3"
                  stroke="#facc15"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.65 }}
                  transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
                />
              </svg>
            </span>{" "}
            in Dubai.
          </motion.h1>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="text-[15px] text-white/42 max-w-md leading-relaxed"
          >
            Instant ROI analysis, price trends &amp; investment signals —
            powered by live Dubai Land Department data.
          </motion.p>

          {/* Mode Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="inline-flex bg-white/[0.04] border border-white/[0.07] rounded-2xl p-1.5 gap-1"
          >
            {(Object.keys(MODES) as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setQuery(""); }}
                className={`relative px-5 py-2 rounded-xl text-sm font-black transition-all duration-200 ${
                  mode === m ? "text-black" : "text-white/38 hover:text-white/65"
                }`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 bg-yellow-400 rounded-xl"
                    transition={{ type: "spring", stiffness: 440, damping: 34 }}
                  />
                )}
                <span className="relative z-10">{MODES[m].label}</span>
              </button>
            ))}
          </motion.div>

          {/* Input */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="group relative"
          >
            {/* Focus glow */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-yellow-400/0 via-yellow-300/25 to-yellow-400/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-[2px]" />
            <div className="relative flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-2 group-focus-within:border-yellow-400/25 transition-colors duration-300">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                placeholder={MODES[mode].placeholder}
                className="flex-1 px-4 py-3 bg-transparent text-white placeholder-white/22 outline-none text-sm min-w-0"
              />
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border border-white/[0.08] text-white/35 hover:border-yellow-400/35 hover:text-yellow-400 transition-all duration-200 shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAskAI}
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-5 py-3 rounded-xl flex items-center gap-1.5 shrink-0 text-sm transition-colors"
              >
                Ask AI
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Prompt chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38 }}
            className="flex flex-wrap gap-2"
          >
            <AnimatePresence mode="wait">
              {MODES[mode].prompts.map((p, i) => (
                <motion.button
                  key={`${mode}-${i}`}
                  initial={{ opacity: 0, scale: 0.86, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.86, y: 6 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setQuery(p)}
                  className="text-xs px-3.5 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] hover:border-white/[0.18] text-white/45 hover:text-white/85 transition-all duration-200"
                >
                  {p}
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.46 }}
            className="flex items-center gap-8 pt-1"
          >
            {[
              { val: "40K+", label: "Properties" },
              { val: "DLD", label: "Data Source" },
              { val: "Live", label: "Market Feed" },
            ].map(({ val, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.09 }}
              >
                <p className="text-sm font-black text-white">{val}</p>
                <p className="text-[11px] text-white/22 font-semibold">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT – Floating Intelligence Cards ──────────── */}
        <motion.div
          initial={{ opacity: 0, x: 44 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.85, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center"
        >
          {/* Ambient vertical float */}
          <motion.div
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-full max-w-[430px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Dynamic accent glow */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCard.id + "-glow"}
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.8 }}
                className="absolute -inset-10 pointer-events-none rounded-[50px] blur-[50px]"
                style={{
                  background: `radial-gradient(ellipse at 50% 40%, ${currentCard.accentColor}45 0%, transparent 68%)`,
                }}
              />
            </AnimatePresence>

            {/* Second, softer glow layer */}
            <motion.div
              animate={{
                opacity: [0.15, 0.28, 0.15],
                scale: [0.95, 1.05, 0.95],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-4 pointer-events-none rounded-[40px] blur-[40px]"
              style={{
                background: `radial-gradient(circle at 60% 60%, ${currentCard.accentColor}30 0%, transparent 65%)`,
              }}
            />

            {/* Card */}
            <FloatingCardShell accentColor={currentCard.accentColor}>
              {/* Accent top bar */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCard.id + "-bar"}
                  className="h-[3px]"
                  style={{ backgroundColor: currentCard.accentColor, transformOrigin: "left" }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                />
              </AnimatePresence>

              {/* BG gradient overlay */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCard.id + "-bg"}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 85% 10%, ${currentCard.bgFrom}, ${currentCard.bgTo} 55%, transparent 80%)`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65 }}
                />
              </AnimatePresence>

              {/* Sliding card content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCard.id}
                  initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -22, filter: "blur(5px)" }}
                  transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10"
                >
                  <InsightCardContent card={currentCard} />
                </motion.div>
              </AnimatePresence>
            </FloatingCardShell>

            {/* ── Navigation ──────────────────────────────────── */}
            <div className="mt-5 flex items-center justify-between px-1 gap-3">
              {/* Prev button */}
              <motion.button
                whileHover={{ scale: 1.12, x: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={goPrev}
                className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>

              {/* Card pill buttons */}
              <div className="flex items-center gap-2 flex-1 justify-center">
                {INSIGHT_CARDS.map((card, i) => {
                  const active = i === cardIndex;
                  return (
                    <motion.button
                      key={card.id}
                      onClick={() => goTo(i)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.88 }}
                      className="relative flex items-center justify-center"
                      style={{ height: 32 }}
                      title={card.badge}
                    >
                      <motion.div
                        animate={{
                          width: active ? 32 : 8,
                          backgroundColor: active ? card.accentColor : "rgba(255,255,255,0.15)",
                          borderRadius: active ? 6 : 999,
                          height: active ? 10 : 8,
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      />
                      {/* Active glow */}
                      {active && (
                        <motion.div
                          className="absolute inset-0 rounded-md blur-[6px]"
                          style={{ backgroundColor: card.accentColor + "60" }}
                          animate={{ opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Next button */}
              <motion.button
                whileHover={{ scale: 1.12, x: 2 }}
                whileTap={{ scale: 0.9 }}
                onClick={goNext}
                className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>

            {/* ── Progress bar ───────────────────────────────── */}
            <div className="mt-3 mx-1 h-[3px] bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full origin-left"
                style={{
                  backgroundColor: currentCard.accentColor,
                  scaleX: displayProgress,
                  transformOrigin: "left",
                }}
                transition={{ duration: 0 }} // direct drive via state — no easing
              />
            </div>

            {/* Pause hint */}
            <div className="mt-2 flex justify-between items-center px-1">
              <AnimatePresence>
                {isHovered && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 3 }}
                    className="text-[11px] text-white/22 flex items-center gap-1.5"
                  >
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ⏸
                    </motion.span>
                    Paused — hover away to resume
                  </motion.p>
                )}
              </AnimatePresence>
              <span className="text-[11px] text-white/15 ml-auto">
                {cardIndex + 1} / {INSIGHT_CARDS.length}
              </span>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}