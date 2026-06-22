import React from "react";
import { motion } from "framer-motion";

const TABS = [
  { id: "general",    label: "Market Overview",     sub: "Prices & trends",     icon: "TrendingUp" },
  { id: "rental",     label: "Rental Intelligence", sub: "Yield analysis",       icon: "BarChart2", badge: "Live" },
  { id: "comparison", label: "Market Comparison",   sub: "Area benchmarks",      icon: "GitCompare" },
  { id: "signals",    label: "Investment Signals",  sub: "Smart indicators",     icon: "Zap" },
  { id: "supply_dev", label: "Supply & Dev",        sub: "Pipeline data",        icon: "Package" },
  { id: "AI",         label: "AI Advisor",          sub: "Ask anything",         icon: "Bot", badge: "AI" },
];

export { TABS };

export default function InsightsTabNav({ active, setActive, icons }) {
  return (
    <div
      className="sticky top-0 z-30 border-b border-border/60"
      style={{ background: "hsl(var(--background) / 0.97)", backdropFilter: "blur(16px)" }}
    >
      <div className="flex items-center overflow-x-auto scrollbar-hide px-4 sm:px-8">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const Icon = icons[tab.icon];
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`relative flex-shrink-0 flex items-center gap-2 px-4 sm:px-5 py-4 text-[13px] font-body font-medium whitespace-nowrap transition-all duration-200 ${
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/60"
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                    isActive ? "text-accent" : "text-current opacity-70"
                  }`}
                />
              )}
              <span className="tracking-tight">{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 rounded transition-all ${
                    isActive
                      ? "bg-accent/15 text-accent"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <motion.span
                  layoutId="insights-active-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}