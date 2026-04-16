"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Signal {
  id: number;
  name: string;
  shortDesc: string;
  value: number; // 0-100
  trend: "up" | "down" | "neutral";
  color: "gold" | "emerald" | "blue";
}

interface DecisionCard {
  type: "insight" | "prediction" | "recommendation";
  area: string;
  title: string;
  body: string;
  tag: string;
}

// ─── Fake Data ─────────────────────────────────────────────────────────────────
const DATA_STATS = [
  { label: "Sales Transactions", value: "1.4M+", badge: "DLD Verified" },
  { label: "Rental Records", value: "8.9M+", badge: "DLD Verified" },
  { label: "Project Launches", value: "3,200+", badge: "Live Tracked" },
  { label: "Price Updates / Day", value: "50K+", badge: "Real-Time" },
];

const DATA_SOURCES = [
  { name: "Dubai Land Department", main: true },
  { name: "Sales Transactions" },
  { name: "Rental Data" },
  { name: "Project Launches" },
];

const SIGNALS: Signal[] = [
  { id: 1,  name: "Rental Yield",       shortDesc: "Return based on rent vs price",       value: 82, trend: "up",      color: "gold"    },
  { id: 2,  name: "Price Growth",        shortDesc: "YoY appreciation momentum",            value: 67, trend: "up",      color: "emerald" },
  { id: 3,  name: "Rental Demand",       shortDesc: "Vacancy rate & absorption speed",      value: 74, trend: "up",      color: "emerald" },
  { id: 4,  name: "Transaction Volume",  shortDesc: "Monthly deal count in area",           value: 58, trend: "neutral", color: "blue"    },
  { id: 5,  name: "Supply Pipeline",     shortDesc: "Units coming to market 12–24 mo",      value: 43, trend: "down",    color: "gold"    },
  { id: 6,  name: "Price Volatility",    shortDesc: "Standard deviation of price swings",   value: 30, trend: "down",    color: "blue"    },
  { id: 7,  name: "Entry Price",         shortDesc: "Relative affordability vs area avg",   value: 71, trend: "up",      color: "gold"    },
  { id: 8,  name: "Liquidity",           shortDesc: "Days-on-market for comparable units",  value: 65, trend: "up",      color: "emerald" },
  { id: 9,  name: "Off-Plan Activity",   shortDesc: "Developer launches & booking rate",    value: 88, trend: "up",      color: "gold"    },
  { id: 10, name: "Absorption Rate",     shortDesc: "Speed inventory is cleared",           value: 77, trend: "up",      color: "emerald" },
  { id: 11, name: "Area Momentum",       shortDesc: "Composite trend across 6 months",      value: 80, trend: "up",      color: "blue"    },
  { id: 12, name: "Affordability",       shortDesc: "Price-to-income ratio benchmark",      value: 54, trend: "neutral", color: "blue"    },
];

const DECISIONS: DecisionCard[] = [
  {
    type: "insight",
    area: "JVC",
    title: "Highest ROI from Low Entry Price",
    body: "JVC delivers 7.8% gross yield — driven by strong rental demand relative to its affordable per-sqft cost, below the city median by 34%.",
    tag: "Yield Leader",
  },
  {
    type: "prediction",
    area: "Dubai Hills",
    title: "8–12% Capital Growth Expected",
    body: "Absorption rate hit 91% last quarter. With limited new supply entering in 2025 and consistent demand, price appreciation is strongly forecast.",
    tag: "Growth Forecast",
  },
  {
    type: "recommendation",
    area: "Business Bay",
    title: "Optimal for Short-Term Rental",
    body: "High footfall, tourism density, and a landlord-friendly STR regulatory zone make Business Bay the top pick for Airbnb-strategy investors right now.",
    tag: "Action Signal",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const trendIcon = (t: Signal["trend"]) =>
  t === "up" ? "↑" : t === "down" ? "↓" : "→";

const colorMap = {
  gold:    { bar: "#C9A84C", glow: "rgba(201,168,76,0.3)",  text: "text-[#C9A84C]" },
  emerald: { bar: "#2E9D70", glow: "rgba(46,157,112,0.3)",  text: "text-[#2E9D70]" },
  blue:    { bar: "#1C4A7E", glow: "rgba(28,74,126,0.3)",   text: "text-[#1C4A7E]" },
};

const decisionMeta = {
  insight:        { icon: "📊", label: "Insight",        ring: "#C9A84C" },
  prediction:     { icon: "📈", label: "Prediction",     ring: "#2E9D70" },
  recommendation: { icon: "🎯", label: "Recommendation", ring: "#1C4A7E" },
};

// ─── Mini Bar Sparkline ───────────────────────────────────────────────────────
function MiniBar({ value, color }: { value: number; color: Signal["color"] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const col = colorMap[color];

  return (
    <div ref={ref} className="flex items-end gap-[2px] h-6 mt-1">
      {[0.35, 0.55, 0.45, 0.70, 0.60, 0.80, value / 100].map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-sm"
          style={{ backgroundColor: col.bar, boxShadow: `0 0 4px ${col.glow}` }}
          initial={{ scaleY: 0, originY: 1 }}
          animate={inView ? { scaleY: h } : { scaleY: 0 }}
          transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
          custom={h}
        />
      ))}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className="text-center mb-20 px-4"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Eyebrow */}
      <div className="inline-flex items-center gap-2 mb-5">
        <div className="h-px w-8 bg-[#C9A84C]" />
        <span className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase font-sans">
          Intelligence Engine
        </span>
        <div className="h-px w-8 bg-[#C9A84C]" />
      </div>

      <h2
        className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-5"
        style={{ color: "hsl(210 80% 12%)" }}
      >
        How Our AI Thinks{" "}
        <span
          className="italic"
          style={{
            background: "linear-gradient(135deg, #C9A84C, #e0ba6a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Like an Investor
        </span>
      </h2>

      <p className="max-w-2xl mx-auto text-base md:text-lg leading-relaxed" style={{ color: "hsl(210 40% 35%)" }}>
        We analyze millions of transactions, extract key signals, and turn them into
        actionable investment decisions.
      </p>

      {/* Three layer labels */}
      <div className="flex justify-center gap-3 mt-8 flex-wrap">
        {[
          { num: "01", label: "Data",      color: "#1C4A7E" },
          { num: "02", label: "Signals",   color: "#C9A84C" },
          { num: "03", label: "Decisions", color: "#2E9D70" },
        ].map((l) => (
          <div
            key={l.label}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-sans font-medium"
            style={{ borderColor: l.color + "55", color: l.color, background: l.color + "0D" }}
          >
            <span className="opacity-60 text-xs">{l.num}</span>
            {l.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── BLOCK 1: DATA ────────────────────────────────────────────────────────────
function DataBlock() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className="mb-16"
    >
      {/* Layer Label */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white font-sans"
          style={{ background: "#1C4A7E" }}
        >
          01
        </div>
        <div>
          <div className="text-xs font-semibold tracking-widest uppercase font-sans" style={{ color: "#1C4A7E" }}>
            Foundation Layer
          </div>
          <div className="text-xl font-serif font-bold" style={{ color: "hsl(210 80% 12%)" }}>
            Data · What We See
          </div>
        </div>
      </div>

      {/* Main card */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(25 20% 98%), hsl(35 20% 95%))",
          borderColor: "hsl(35 15% 85%)",
          boxShadow: "0 10px 40px -10px rgba(28,74,126,0.12)",
        }}
      >
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: description */}
          <div className="p-8 border-r border-[hsl(35,15%,85%)]">
            <h3 className="text-2xl font-serif font-bold mb-3" style={{ color: "hsl(210 80% 12%)" }}>
              Built on Real Market Data
            </h3>
            <p className="text-sm leading-relaxed mb-6 font-sans" style={{ color: "hsl(210 40% 35%)" }}>
              Every recommendation is grounded in verified government data — not
              estimates or scraped listings. We ingest directly from official Dubai
              sources, updated continuously.
            </p>

            {/* Sources */}
            <div className="space-y-2">
              {DATA_SOURCES.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: s.main ? "#C9A84C" : "#1C4A7E" }}
                  />
                  <span
                    className="text-sm font-sans"
                    style={{
                      color: s.main ? "#C9A84C" : "hsl(210 40% 35%)",
                      fontWeight: s.main ? 600 : 400,
                    }}
                  >
                    {s.name}
                    {s.main && (
                      <span className="ml-2 text-[10px] font-semibold tracking-widest uppercase opacity-60">
                        PRIMARY
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: stats grid */}
          <div className="grid grid-cols-2 gap-px bg-[hsl(35,15%,85%)]">
            {DATA_STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="p-6 flex flex-col justify-between"
                style={{ background: "hsl(25 20% 98%)" }}
              >
                <div
                  className="text-2xl font-serif font-bold"
                  style={{ color: "hsl(210 80% 12%)" }}
                >
                  {s.value}
                </div>
                <div className="mt-2">
                  <div className="text-xs font-sans" style={{ color: "hsl(210 40% 35%)" }}>
                    {s.label}
                  </div>
                  <span
                    className="inline-block mt-1 text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full border font-sans"
                    style={{ borderColor: "#C9A84C55", color: "#C9A84C", background: "#C9A84C0D" }}
                  >
                    {s.badge}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── BLOCK 2: SIGNALS ─────────────────────────────────────────────────────────
function SignalsBlock() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.1 }}
      className="mb-16"
    >
      {/* Layer Label */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white font-sans"
          style={{ background: "#C9A84C" }}
        >
          02
        </div>
        <div>
          <div className="text-xs font-semibold tracking-widest uppercase font-sans" style={{ color: "#C9A84C" }}>
            Intelligence Layer
          </div>
          <div className="text-xl font-serif font-bold" style={{ color: "hsl(210 80% 12%)" }}>
            Signals · How We Think
          </div>
        </div>
      </div>

      {/* Header row */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h3 className="text-2xl font-serif font-bold" style={{ color: "hsl(210 80% 12%)" }}>
            12 Investor Signals We Analyze
          </h3>
          <p className="text-sm font-sans mt-1" style={{ color: "hsl(210 40% 35%)" }}>
            Signal-based intelligence — not generic text
          </p>
        </div>
      </div>

      {/* Signals grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {SIGNALS.map((sig, i) => {
          const col = colorMap[sig.color];
          const isHov = hovered === sig.id;
          return (
            <motion.div
              key={sig.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.45 }}
              whileHover={{ y: -3, scale: 1.02 }}
              onHoverStart={() => setHovered(sig.id)}
              onHoverEnd={() => setHovered(null)}
              className="relative rounded-xl border p-4 cursor-pointer transition-shadow duration-300"
              style={{
                background: isHov ? col.bar + "10" : "hsl(25 20% 98%)",
                borderColor: isHov ? col.bar + "60" : "hsl(35 15% 85%)",
                boxShadow: isHov ? `0 8px 24px -6px ${col.glow}` : "none",
              }}
            >
              {/* Trend badge */}
              <div
                className="absolute top-3 right-3 text-xs font-bold font-sans"
                style={{ color: col.bar }}
              >
                {trendIcon(sig.trend)}
              </div>

              {/* Value pill */}
              <div
                className="text-xs font-semibold font-sans mb-1"
                style={{ color: col.bar }}
              >
                {sig.value}
                <span className="opacity-50">/100</span>
              </div>

              {/* Name */}
              <div className="text-sm font-serif font-semibold leading-tight mb-1" style={{ color: "hsl(210 80% 12%)" }}>
                {sig.name}
              </div>

              {/* Mini bar */}
              <MiniBar value={sig.value} color={sig.color} />

              {/* Desc */}
              <AnimatePresence>
                {isHov && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[11px] leading-snug mt-2 font-sans overflow-hidden"
                    style={{ color: "hsl(210 40% 35%)" }}
                  >
                    {sig.shortDesc}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── BLOCK 3: DECISIONS ───────────────────────────────────────────────────────
function DecisionsBlock() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.15 }}
    >
      {/* Layer Label */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white font-sans"
          style={{ background: "#2E9D70" }}
        >
          03
        </div>
        <div>
          <div className="text-xs font-semibold tracking-widest uppercase font-sans" style={{ color: "#2E9D70" }}>
            Output Layer
          </div>
          <div className="text-xl font-serif font-bold" style={{ color: "hsl(210 80% 12%)" }}>
            Decisions · What You Get
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-serif font-bold mb-2" style={{ color: "hsl(210 80% 12%)" }}>
        AI-Powered Investment Decisions
      </h3>
      <p className="text-sm font-sans mb-7" style={{ color: "hsl(210 40% 35%)" }}>
        Generated from signal relationships — not generic statements.
      </p>

      <div className="grid md:grid-cols-3 gap-5">
        {DECISIONS.map((d, i) => {
          const meta = decisionMeta[d.type];
          return (
            <motion.div
              key={d.type}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.55 }}
              whileHover={{ y: -4 }}
              className="relative rounded-2xl border overflow-hidden"
              style={{
                background: "linear-gradient(135deg, hsl(25 20% 98%), hsl(35 20% 95%))",
                borderColor: meta.ring + "40",
                boxShadow: `0 8px 30px -8px ${meta.ring}25`,
              }}
            >
              {/* Top accent bar */}
              <div className="h-1 w-full" style={{ background: meta.ring }} />

              <div className="p-6">
                {/* Icon + type */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{meta.icon}</span>
                  <span
                    className="text-[10px] font-semibold tracking-widest uppercase px-2 py-1 rounded-full border font-sans"
                    style={{ borderColor: meta.ring + "50", color: meta.ring, background: meta.ring + "10" }}
                  >
                    {meta.label}
                  </span>
                </div>

                {/* Area */}
                <div
                  className="text-xs font-semibold tracking-widest uppercase font-sans mb-1"
                  style={{ color: meta.ring }}
                >
                  {d.area}
                </div>

                {/* Title */}
                <h4 className="text-base font-serif font-bold leading-snug mb-3" style={{ color: "hsl(210 80% 12%)" }}>
                  {d.title}
                </h4>

                {/* Body */}
                <p className="text-sm leading-relaxed font-sans" style={{ color: "hsl(210 40% 35%)" }}>
                  {d.body}
                </p>

                {/* Tag chip */}
                <div className="mt-4">
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full font-sans"
                    style={{ background: meta.ring + "15", color: meta.ring }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.ring }} />
                    {d.tag}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* AI Prompt reveal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-8 rounded-xl border p-5 font-mono text-xs leading-relaxed"
        style={{
          background: "hsl(210 80% 8%)",
          borderColor: "#C9A84C30",
          color: "#8aabcd",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-80" />
          <span className="ml-2 text-[10px] tracking-widest uppercase opacity-40" style={{ fontFamily: "monospace" }}>
            AI Signal Prompt
          </span>
        </div>
        <div style={{ color: "#C9A84C" }}>You are an AI real estate investment advisor.</div>
        <div className="mt-2 opacity-60">Given structured signals:</div>
        <div className="pl-3 opacity-50">
          - yield · growth · demand · supply · volatility
        </div>
        <div className="mt-2 opacity-60">Generate:</div>
        <div className="pl-3">
          <span style={{ color: "#2E9D70" }}>1.</span>
          <span className="opacity-70"> insight</span>
          <span className="opacity-40"> (why something is happening)</span>
        </div>
        <div className="pl-3">
          <span style={{ color: "#C9A84C" }}>2.</span>
          <span className="opacity-70"> prediction</span>
          <span className="opacity-40"> (what will happen)</span>
        </div>
        <div className="pl-3">
          <span style={{ color: "#1C6EAE" }}>3.</span>
          <span className="opacity-70"> recommendation</span>
          <span className="opacity-40"> (what to do)</span>
        </div>
        <div className="mt-2 opacity-40">Avoid generic statements. Use data relationships.</div>
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function HowItWorks() {
  return (
    <section
      className="relative py-24 px-4 overflow-hidden"
      style={{ background: "hsl(25 15% 96%)" }}
    >
      {/* Background geometric decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(30deg, rgba(201,168,76,0.04) 12%, transparent 12.5%, transparent 87%, rgba(201,168,76,0.04) 87.5%),
            linear-gradient(150deg, rgba(46,157,112,0.04) 12%, transparent 12.5%, transparent 87%, rgba(46,157,112,0.04) 87.5%)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Radial glows */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
          transform: "translate(-50%, -30%)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(46,157,112,0.06) 0%, transparent 70%)",
          transform: "translate(50%, 30%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        <SectionHeader />

        {/* Connector line */}
        <div className="relative">
          <div
            className="absolute left-5 top-0 bottom-0 w-px hidden md:block"
            style={{
              background:
                "linear-gradient(to bottom, #1C4A7E33, #C9A84C33, #2E9D7033)",
            }}
          />

          <div className="md:pl-16 space-y-4">
            <DataBlock />
            <SignalsBlock />
            <DecisionsBlock />
          </div>
        </div>
      </div>
    </section>
  );
}