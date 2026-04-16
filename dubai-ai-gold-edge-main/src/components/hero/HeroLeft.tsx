"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles, SlidersHorizontal } from "lucide-react";
import FilterModal from "./FilterModal";

export const MODES = {
  invest: { label: "Invest", placeholder: "Best areas for 7% ROI in Dubai...", prompts: ["Best areas for 7% ROI in Dubai", "Top off-plan projects 2026", "Where to invest 1M AED?", "Highest yielding communities"], route: "/invest" },
  buy:    { label: "Buy",    placeholder: "Best areas to buy under 1.5M AED...", prompts: ["Best areas to buy under 1.5M AED", "Ready vs off-plan in Dubai Hills", "2BR apartments in JVC", "Cheapest areas to buy a villa"], route: "/buy" },
  rent:   { label: "Rent",   placeholder: "Best areas to rent a 2BR under 80K...", prompts: ["Best areas to rent a 2BR under 80K", "Cheapest areas to rent in Dubai", "Marina vs JBR for renting", "Family-friendly areas to rent"], route: "/rent" },
  explore:{ label: "Explore",placeholder: "Explore Dubai real estate trends...", prompts: ["Market trends Q1 2026", "Most transacted areas last month", "Price growth by community", "New developer launches 2026"], route: "/explore" },
};


export default function HeroLeft() {
  const [mode, setMode] = useState("invest");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});

  const filterCount = Object.values(filters).filter(Boolean).length;

  const handleAskAI = () => {
    const q = query.trim() || MODES[mode].placeholder;
    setFilters({});
    console.log(`→ ${MODES[mode].route}?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="space-y-7">
      <AnimatePresence>
        {showFilters && <FilterModal mode={mode} selected={filters} onChange={setFilters} onClose={() => setShowFilters(false)} />}
      </AnimatePresence>

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
        className="text-[15px] text-white/[0.42] max-w-md leading-relaxed">
        Instant ROI analysis, price trends &amp; investment signals — powered by live Dubai Land Department data.
      </motion.p>

      {/* Mode tabs */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, delay:0.24 }}
        className="inline-flex bg-white/[0.04] border border-white/[0.07] rounded-2xl p-1.5 gap-1">
        {Object.keys(MODES).map(m => (
          <button key={m} onClick={() => { setMode(m); setQuery(""); }}
            className={`relative px-5 py-2 rounded-xl text-sm font-black transition-all duration-200 ${mode===m ? "text-black" : "text-white/[0.38] hover:text-white/[0.65]"}`}>
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
            className="flex-1 px-4 py-3 bg-transparent text-white placeholder-white/[0.22] outline-none text-sm min-w-0" />
          <motion.button whileTap={{ scale:0.94 }} onClick={() => setShowFilters(true)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 shrink-0 ${filterCount > 0 ? "border-yellow-400/50 text-yellow-400 bg-yellow-400/10" : "border-white/[0.08] text-white/35 hover:border-yellow-400/35 hover:text-yellow-400"}`}>
            <SlidersHorizontal className="w-3.5 h-3.5" />Filters{filterCount > 0 ? ` (${filterCount})` : ""}
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
              className="text-xs px-3.5 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] hover:border-white/[0.18] text-white/[0.45] hover:text-white/[0.85] transition-all duration-200">
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
            <p className="text-[11px] text-white/[0.22] font-semibold">{label}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}