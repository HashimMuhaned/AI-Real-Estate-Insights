"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = "invest" | "buy" | "rent" | "explore";

interface FilterField {
  label: string;
  opts: string[];
  full?: boolean;
}

interface ModeConfig {
  placeholder: string;
  chips: string[];
  filterTitle: string;
  filters: FilterField[];
}

interface InsightCard {
  tag: "green" | "blue" | "purple" | "amber" | "red";
  tagLabel: string;
  area: string;
  kpis: { label: string; value: string; color?: "green" | "blue" | "red" | "amber" }[];
  chart: "bar" | "line";
  chartColor: string;
  ai: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const MODES: Record<Mode, ModeConfig> = {
  invest: {
    placeholder: "Best areas for 7% ROI in Dubai",
    chips: ["JVC vs Dubai Hills ROI", "Off-plan yield 2026", "Best ROI under 1M AED", "Downtown vs Business Bay"],
    filterTitle: "Investment filters",
    filters: [
      { label: "Budget", opts: ["Any", "500K–1M AED", "1M–2M AED", "2M–5M AED", "5M+"] },
      { label: "Property type", opts: ["Any", "Apartment", "Villa", "Townhouse"] },
      { label: "Bedrooms", opts: ["Any", "Studio", "1BR", "2BR", "3BR", "4BR+"] },
      { label: "Area", opts: ["Any", "JVC", "Marina", "Dubai Hills", "Downtown", "Business Bay"], full: true },
    ],
  },
  buy: {
    placeholder: "Best areas to buy under 1.5M AED",
    chips: ["Off-plan vs ready", "Dubai Hills vs JVC", "Safest developer 2026", "Best community under 2M"],
    filterTitle: "Buy filters",
    filters: [
      { label: "Budget", opts: ["Any", "Under 1M", "1M–2M", "2M–5M", "5M+"] },
      { label: "Status", opts: ["Any", "Off-plan", "Ready to move"] },
      { label: "Bedrooms", opts: ["Any", "Studio", "1BR", "2BR", "3BR", "4BR+"] },
      { label: "Area", opts: ["Any", "JVC", "Marina", "Dubai Hills", "Downtown", "Business Bay"], full: true },
    ],
  },
  rent: {
    placeholder: "Best areas to rent a 2BR under 80K AED",
    chips: ["Cheapest 2BR in Dubai", "JLT vs Marina rent", "Pet-friendly areas", "Best value near Metro"],
    filterTitle: "Rent filters",
    filters: [
      { label: "Property type", opts: ["Any", "Apartment", "Villa", "Studio"] },
      { label: "Annual budget", opts: ["Any", "Under 50K", "50–100K", "100–150K", "150K+"] },
      { label: "Bedrooms", opts: ["Any", "Studio", "1BR", "2BR", "3BR", "4BR+"] },
      { label: "Area", opts: ["Any", "JVC", "Marina", "JLT", "Business Bay", "Downtown"], full: true },
    ],
  },
  explore: {
    placeholder: "What's happening in the Dubai property market?",
    chips: ["Market trends Q2 2026", "Cheapest freehold areas", "Top developers 2026", "Foreigners buying guide"],
    filterTitle: "Explore filters",
    filters: [
      { label: "Transaction type", opts: ["Any", "Sold", "Rented"] },
      { label: "Time range", opts: ["Last 30 days", "Last 90 days", "Last 12 months", "All time"] },
      { label: "Area", opts: ["Any", "JVC", "Marina", "Downtown", "Business Bay", "Dubai Hills"], full: true },
    ],
  },
};

const CARDS: InsightCard[] = [
  {
    tag: "green", tagLabel: "Top rental yield", area: "Jumeirah Village Circle",
    kpis: [{ label: "ROI", value: "7.8%", color: "green" }, { label: "Avg price", value: "AED 850K" }],
    chart: "bar", chartColor: "#1a7a40",
    ai: "High rental demand with low entry prices vs nearby communities keeps yields elevated.",
  },
  {
    tag: "blue", tagLabel: "Best area to buy", area: "Dubai Hills Estate",
    kpis: [{ label: "Price growth", value: "+12% YoY", color: "blue" }, { label: "Avg price", value: "AED 2.1M" }],
    chart: "line", chartColor: "#185fa5",
    ai: "Strong capital appreciation driven by master-plan completion and school proximity demand.",
  },
  {
    tag: "purple", tagLabel: "Transaction activity", area: "Business Bay",
    kpis: [{ label: "Transactions", value: "1,240 / mo", color: "blue" }, { label: "Liquidity", value: "High" }],
    chart: "bar", chartColor: "#5348b7",
    ai: "One of Dubai's most liquid submarkets — high turnover supports resale confidence.",
  },
  {
    tag: "amber", tagLabel: "Off-plan opportunity", area: "Sobha Hartland II",
    kpis: [{ label: "Delivery", value: "2027 Q3" }, { label: "Exp. ROI", value: "9.1%", color: "green" }],
    chart: "bar", chartColor: "#ba7517",
    ai: "Early-stage pricing advantage — developer track record adds credibility to yield forecast.",
  },
  {
    tag: "red", tagLabel: "Market alert", area: "Downtown Dubai",
    kpis: [{ label: "Price change", value: "–3.2%", color: "red" }, { label: "Signal", value: "Cooling", color: "red" }],
    chart: "line", chartColor: "#c0392b",
    ai: "Possible short-term correction after two-year run-up. Watch Q3 data before entering.",
  },
];

const INTERVAL = 6000;
const BAR_VALS = [38, 58, 46, 80, 66, 90, 72];
const LINE_PTS = [28, 36, 30, 48, 42, 58, 52, 70, 61, 74];

// ─── Sub-components ───────────────────────────────────────────────────────────

function BarChart({ color }: { color: string }) {
  const max = Math.max(...BAR_VALS);
  return (
    <div className="flex items-end gap-1 h-10 mb-3">
      {BAR_VALS.map((v, i) => (
        <div
          key={i}
          className="rounded-t-sm flex-1"
          style={{ height: `${Math.round((v / max) * 100)}%`, background: color, opacity: 0.85 }}
        />
      ))}
    </div>
  );
}

function LineChart({ color }: { color: string }) {
  const w = 260, h = 40, n = LINE_PTS.length;
  const max = Math.max(...LINE_PTS), min = Math.min(...LINE_PTS);
  const X = (i: number) => ((i / (n - 1)) * w).toFixed(1);
  const Y = (v: number) => (h - 4 - ((v - min) / (max - min)) * (h - 12)).toFixed(1);
  const d = LINE_PTS.map((v, i) => `${i === 0 ? "M" : "L"}${X(i)},${Y(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full mb-3" style={{ height: 40, display: "block" }}>
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const KPI_COLORS: Record<string, string> = {
  green: "#1a6e38", blue: "#185fa5", red: "#c0392b", amber: "#8a5000",
};

const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  green:  { bg: "#e7f7ee", color: "#1a6e38" },
  blue:   { bg: "#e6f1fb", color: "#0c447c" },
  purple: { bg: "#eeedfe", color: "#3c3489" },
  amber:  { bg: "#faeeda", color: "#633806" },
  red:    { bg: "#fcebeb", color: "#a32d2d" },
};

// ─── Filter Modal ─────────────────────────────────────────────────────────────

function FilterModal({ mode, open, onClose }: { mode: Mode; open: boolean; onClose: () => void }) {
  const cfg = MODES[mode];
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "absolute", inset: 0,
        background: "rgba(5,10,20,0.78)",
        borderRadius: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 30,
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.25s ease",
      }}
    >
      <div
        style={{
          background: "#111e30",
          border: "0.5px solid rgba(255,255,255,0.12)",
          borderRadius: 18,
          padding: "28px 28px 24px",
          width: 360,
          transform: open ? "translateY(0) scale(1)" : "translateY(18px) scale(0.96)",
          opacity: open ? 1 : 0,
          transition: "transform 0.3s ease, opacity 0.3s ease",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{cfg.filterTitle}</div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)", border: "none", color: "rgba(255,255,255,0.6)",
              width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
              fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
        </div>

        {/* Fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
          {cfg.filters.map((f) => (
            <div key={f.label} style={{ gridColumn: f.full ? "1 / -1" : undefined }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                {f.label}
              </div>
              <select
                defaultValue={f.opts[0]}
                style={{
                  width: "100%", background: "#0b1524",
                  border: "0.5px solid rgba(255,255,255,0.14)",
                  borderRadius: 9, padding: "9px 12px",
                  fontSize: 13, color: "rgba(255,255,255,0.85)",
                  outline: "none", appearance: "none", cursor: "pointer",
                }}
              >
                {f.opts.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Apply */}
        <button
          onClick={onClose}
          style={{
            width: "100%", background: "#f5c842", color: "#0b1524",
            border: "none", borderRadius: 10, padding: "12px 0",
            fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "0.01em",
          }}
        >
          Apply filters
        </button>
        <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 10 }}>
          Filters refine AI-generated results
        </div>
      </div>
    </div>
  );
}

// ─── Rotating Cards Panel ─────────────────────────────────────────────────────

function InsightPanel() {
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    setExiting(current);
    setTimeout(() => setExiting(null), 700);
    setCurrent(idx);
    setProgress(0);
  }, [current]);

  const next = useCallback(() => goTo((current + 1) % CARDS.length), [current, goTo]);

  useEffect(() => {
    if (!paused) {
      timerRef.current = setInterval(next, INTERVAL);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next]);

  useEffect(() => {
    setProgress(0);
    if (!paused) {
      progRef.current = setInterval(() => {
        setProgress((p) => Math.min(p + 100 / (INTERVAL / 120), 100));
      }, 120);
    }
    return () => { if (progRef.current) clearInterval(progRef.current); };
  }, [current, paused]);

  return (
    <div>
      {/* Card stage */}
      <div
        style={{ position: "relative", height: 310 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {CARDS.map((card, i) => {
          const isActive = i === current;
          const isExiting = i === exiting;
          const tag = TAG_STYLES[card.tag];
          return (
            <div
              key={i}
              style={{
                position: "absolute", top: "50%", left: "50%",
                transform: `translate(-50%, -50%) translateY(${isActive ? 0 : isExiting ? -22 : 18}px)`,
                width: "calc(100% - 8px)",
                background: "#fff", borderRadius: 18, padding: "22px 22px 18px",
                opacity: isActive ? 1 : 0,
                transition: "opacity 0.65s ease, transform 0.65s ease",
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              {/* Tag */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 11, fontWeight: 600, padding: "4px 11px",
                borderRadius: 100, marginBottom: 14, letterSpacing: "0.02em",
                background: tag.bg, color: tag.color,
              }}>
                {card.tagLabel}
              </div>

              {/* Area name */}
              <div style={{ fontSize: 19, fontWeight: 700, color: "#0b1524", marginBottom: 12, letterSpacing: "-0.3px" }}>
                {card.area}
              </div>

              {/* KPIs */}
              <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
                {card.kpis.map((k) => (
                  <div key={k.label}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 3 }}>{k.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: k.color ? KPI_COLORS[k.color] : "#0b1524" }}>
                      {k.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              {card.chart === "bar"
                ? <BarChart color={card.chartColor} />
                : <LineChart color={card.chartColor} />
              }

              {/* AI insight */}
              <div style={{ background: "#f7f8fa", borderRadius: 9, padding: "10px 13px" }}>
                <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>
                  AI insight
                </div>
                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{card.ai}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div style={{ display: "flex", gap: 7, justifyContent: "center", marginTop: 14 }}>
        {CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: 7, height: 7, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0,
              background: i === current ? "#f5c842" : "rgba(255,255,255,0.2)",
              transition: "background 0.2s, transform 0.2s",
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
        <div style={{ height: "100%", background: "#f5c842", borderRadius: 2, width: `${progress.toFixed(1)}%`, transition: "width 0.12s linear" }} />
      </div>
    </div>
  );
}

// ─── Main Hero ────────────────────────────────────────────────────────────────

export default function Hero() {
  const [mode, setMode] = useState<Mode>("invest");
  const [query, setQuery] = useState(MODES.invest.placeholder);
  const [filterOpen, setFilterOpen] = useState(false);

  const cfg = MODES[mode];

  const handleModeChange = (m: Mode) => {
    setMode(m);
    setQuery(MODES[m].placeholder);
  };

  const handleAsk = () => {
    if (!query.trim()) return;
    // TODO: router.push(`/ai?q=${encodeURIComponent(query)}&mode=${mode}`);
    console.log("Ask AI:", { query, mode });
  };

  return (
    <section
      style={{
        background: "#0b1524", color: "#fff",
        padding: "6rem 7rem",
        minHeight: 800,
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 60, alignItems: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── LEFT ── */}
      <div>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(245,200,66,0.1)", border: "0.5px solid rgba(245,200,66,0.3)",
          borderRadius: 100, padding: "6px 14px", fontSize: 12,
          color: "rgba(245,200,66,0.9)", marginBottom: 22,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f5c842", display: "inline-block" }} />
          AI-powered real estate advisor
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 38, fontWeight: 600, lineHeight: 1.18, marginBottom: 12, color: "#fff", letterSpacing: "-0.5px" }}>
          Ask AI.<br />
          Invest{" "}
          <span style={{ color: "#f5c842" }}>smarter</span>
          <br />in Dubai.
        </h1>

        {/* Sub */}
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 26, lineHeight: 1.7, maxWidth: 390 }}>
          Instant ROI analysis, price trends, and investment signals powered by live market data.
        </p>

        {/* Mode tabs */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 18,
          background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 4,
        }}>
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              style={{
                flex: 1, padding: "8px 4px", borderRadius: 7,
                fontSize: 13, cursor: "pointer", border: "none",
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#0b1524" : "rgba(255,255,255,0.45)",
                fontWeight: mode === m ? 600 : 500,
                transition: "all 0.2s",
                textTransform: "capitalize",
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ background: "#fff", borderRadius: 13, padding: 5, display: "flex", alignItems: "center", marginBottom: 12 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Ask anything about Dubai real estate..."
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: 14, color: "#111", background: "transparent", padding: "10px 12px",
            }}
          />
          <button
            onClick={handleAsk}
            style={{
              background: "#0b1524", color: "#fff", border: "none",
              borderRadius: 9, padding: "11px 22px", fontSize: 13,
              fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            Ask AI
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 7h10M8 3l4 4-4 4" />
            </svg>
          </button>
        </div>

        {/* Chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {cfg.chips.map((c) => (
            <button
              key={c}
              onClick={() => setQuery(c)}
              style={{
                fontSize: 12, padding: "6px 13px", borderRadius: 100,
                background: "rgba(255,255,255,0.06)",
                border: "0.5px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.6)", cursor: "pointer",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Filter trigger */}
        <button
          onClick={() => setFilterOpen(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "transparent",
            border: "0.5px solid rgba(255,255,255,0.18)",
            borderRadius: 9, padding: "8px 16px", fontSize: 13,
            color: "rgba(255,255,255,0.55)", cursor: "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 3h12M3 7h8M5 11h4" />
          </svg>
          Add filters
        </button>
      </div>

      {/* ── RIGHT ── */}
      <InsightPanel />

      {/* ── FILTER MODAL ── */}
      <FilterModal mode={mode} open={filterOpen} onClose={() => setFilterOpen(false)} />
    </section>
  );
}