"use client";

import { useMemo } from "react";
import { Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import ToolHeader from "./ToolHeader";
import YieldBadge from "./YieldBadge";
import { computeSmartDealScore, getSmartDealTag, formatCurrency } from "./data";

type ScoreRingProps = {
  score: number;
};

function ScoreRing({ score }: ScoreRingProps) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 75
      ? "hsl(160 75% 35%)"
      : score >= 55
        ? "hsl(45 85% 55%)"
        : score >= 40
          ? "hsl(30 90% 55%)"
          : "hsl(0 84% 60%)";
  console.log(score);
  return (
    <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
      <svg className="h-16 w-16 -rotate-90 sm:h-20 sm:w-20" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="hsl(35 15% 85%)"
          strokeWidth="5"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-bold text-foreground sm:text-lg">
          {score}
        </span>
      </div>
    </div>
  );
}

export default function SmartDealFinder({
  areaComparisonData,
  topProjects,
  supplyDemandData,
}) {
  console.log(areaComparisonData);
  const deals = useMemo(() => {
    const areas = Object.keys(areaComparisonData || {});

    return areas
      .map((area) => {
        const data = areaComparisonData[area];
        if (!data) return null;

        const score = computeSmartDealScore(
          area,
          data,
          areaComparisonData,
          topProjects,
          supplyDemandData,
        );
        const tag = getSmartDealTag(score);

        return { area, score, tag, ...data };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);
  }, [areaComparisonData]); // ✅ FIXED

  return (
    <div className="luxury-card relative overflow-hidden rounded-2xl p-4 sm:p-5 lg:p-6">
      <div className="absolute right-0 top-0 h-48 w-48 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent/5 blur-3xl sm:h-64 sm:w-64" />

      <div className="relative">
        <ToolHeader
          icon="🟠"
          title="Smart Deal Finder"
          subtitle="AI-computed investment scores"
          color="orange"
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {deals.slice(0, 6).map((deal, idx) => {
            const isTop = idx < 2;
            const tagVariant =
              deal.tag === "Undervalued"
                ? "emerald"
                : deal.tag === "High Growth"
                  ? "accent"
                  : deal.tag === "Stable"
                    ? "orange"
                    : "destructive";

            return (
              <div
                key={deal.area}
                className={cn(
                  "rounded-xl border p-2.5 transition-all hover:shadow-lg sm:p-3",
                  isTop
                    ? "border-accent/30 bg-gradient-to-br from-accent/5 to-emerald/5"
                    : "border-border bg-card hover:border-accent/30",
                )}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <ScoreRing score={deal.score} />

                  <div className="min-w-0 flex-1">
                    {/* Title */}
                    <div className="mb-0.5 flex flex-wrap items-center gap-1">
                      <h4 className="truncate font-serif text-sm font-semibold text-foreground">
                        {deal.area}
                      </h4>
                      {isTop && (
                        <Star className="h-3 w-3 shrink-0 fill-accent text-accent" />
                      )}
                    </div>

                    {/* Tags */}
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <YieldBadge label={deal.tag} variant={tagVariant} />
                      {isTop && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-accent-foreground">
                          <Sparkles className="h-3 w-3" />
                          Top Pick
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] sm:text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Yield</span>
                        <span className="font-semibold text-foreground">
                          {deal.roi}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Growth</span>
                        <span className="font-semibold text-emerald">
                          +{deal.priceGrowth}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(deal.avgPrice)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Rent</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(deal.avgRent)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-muted/50 p-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              Score Formula:{" "}
            </span>
            (Yield × 0.4) + (Growth × 0.3) + (Demand × 0.2) − (Supply Risk ×
            0.1)
          </p>
        </div>
      </div>
    </div>
  );
}
