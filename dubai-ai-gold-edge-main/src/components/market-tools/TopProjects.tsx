"use client"

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import ToolHeader from "./ToolHeader";
import { topProjects, getTrendColor } from "./data";

export default function TopProjects() {
  const sorted = useMemo(() => {
    return [...topProjects].sort((a, b) => b.transactions - a.transactions);
  }, []);

  return (
    <div className="luxury-card p-6">
      <ToolHeader
        icon="🟡"
        title="Top Projects & Demand"
        subtitle="Ranked by transaction volume"
        color="accent"
      />

      <div className="space-y-2">
        {sorted.map((project, idx) => {
          const isTop3 = idx < 3;
          const growthPct = ((project.transactions - project.prevTransactions) / project.prevTransactions * 100).toFixed(1);
          const TrendIcon = project.trend === "up" ? TrendingUp : project.trend === "down" ? TrendingDown : Minus;

          return (
            <div
              key={project.name}
              className={cn(
                "flex items-center gap-4 p-3.5 rounded-xl transition-all",
                isTop3 ? "bg-accent/8 border border-accent/20" : "hover:bg-muted/40"
              )}
            >
              {/* Rank */}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                isTop3 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
              )}>
                {idx + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground truncate">{project.name}</p>
                  {isTop3 && <Flame className="w-4 h-4 text-orange-500 shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground">{project.area}</p>
              </div>

              {/* Transactions */}
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-foreground">{project.transactions}</p>
                <p className="text-xs text-muted-foreground">transactions</p>
              </div>

              {/* Growth */}
              <div className={cn("flex items-center gap-1 shrink-0", getTrendColor(project.trend))}>
                <TrendIcon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">
                  {growthPct > 0 ? "+" : ""}{growthPct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}