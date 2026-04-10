import { useMemo } from "react";
import { Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import ToolHeader from "./ToolHeader";
import YieldBadge from "./YieldBadge";
import { AREAS, areaComparisonData, computeSmartDealScore, getSmartDealTag, formatCurrency } from "./data";

function ScoreRing({ score }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "hsl(160 75% 35%)" : score >= 55 ? "hsl(45 85% 55%)" : score >= 40 ? "hsl(30 90% 55%)" : "hsl(0 84% 60%)";

  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(35 15% 85%)" strokeWidth="5" />
        <circle
          cx="40" cy="40" r="36" fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-foreground">{score}</span>
      </div>
    </div>
  );
}

export default function SmartDealFinder() {
  const deals = useMemo(() => {
    return AREAS.map(area => {
      const score = computeSmartDealScore(area);
      const tag = getSmartDealTag(score);
      const data = areaComparisonData[area];
      return { area, score, tag, ...data };
    }).sort((a, b) => b.score - a.score);
  }, []);

  return (
    <div className="luxury-card p-6 relative overflow-hidden">
      {/* Exclusive glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative">
        <ToolHeader
          icon="🟠"
          title="Smart Deal Finder"
          subtitle="AI-computed investment scores"
          color="orange"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deals.slice(0, 6).map((deal, idx) => {
            const isTop = idx < 2;
            const tagVariant = deal.tag === "Undervalued" ? "emerald" : deal.tag === "High Growth" ? "accent" : deal.tag === "Stable" ? "orange" : "destructive";

            return (
              <div
                key={deal.area}
                className={cn(
                  "rounded-xl border transition-all hover:shadow-lg",
                  isTop ? "bg-gradient-to-br from-accent/5 to-emerald/5 border-accent/30 p-3" : "bg-card border-border hover:border-accent/30 p-3"
                )}
              >
                <div className="flex items-start gap-3">
                  <ScoreRing score={deal.score} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <h4 className="font-serif font-semibold text-sm text-foreground truncate">{deal.area}</h4>
                      {isTop && <Star className="w-3.5 h-3.5 text-accent fill-accent shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      <YieldBadge label={deal.tag} variant={tagVariant} />
                      {isTop && (
                        <span className="flex items-center gap-1 text-xs text-accent-foreground font-medium">
                          <Sparkles className="w-3 h-3" /> Top Pick
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Yield</span>
                        <span className="font-semibold text-foreground">{deal.roi}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Growth</span>
                        <span className="font-semibold text-emerald">+{deal.priceGrowth}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-semibold text-foreground">{formatCurrency(deal.avgPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rent</span>
                        <span className="font-semibold text-foreground">{formatCurrency(deal.avgRent)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Formula explanation */}
        <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Score Formula: </span>
            (Yield × 0.4) + (Growth × 0.3) + (Demand × 0.2) − (Supply Risk × 0.1)
          </p>
        </div>
      </div>
    </div>
  );
}