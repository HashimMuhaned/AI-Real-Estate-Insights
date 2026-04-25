"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, ShieldCheck, Users, Zap } from "lucide-react";
import ToolHeader from "./ToolHeader";
import YieldBadge from "./YieldBadge";
import { formatCurrency } from "./data";

function computeScore(
  area: string,
  areaComparisonData: any,
  topProjects: any[],
  supplyDemandData: any[]
) {
  const d = areaComparisonData?.[area];
  if (!d) return null;

  const allYields = Object.values(areaComparisonData).map((a: any) => a.roi);
  const allGrowths = Object.values(areaComparisonData).map((a: any) => a.priceGrowth);

  const maxYield = Math.max(...allYields);
  const minYield = Math.min(...allYields);
  const maxGrowth = Math.max(...allGrowths);
  const minGrowth = Math.min(...allGrowths);

  const normalizedYield = (d.roi - minYield) / ((maxYield - minYield) || 1);
  const normalizedGrowth = (d.priceGrowth - minGrowth) / ((maxGrowth - minGrowth) || 1);

  const areaProjects = (topProjects || []).filter((p) => p.area === area);
  const totalTx = areaProjects.reduce((sum, p) => sum + Number(p.transactions || 0), 0);
  const demandScore = Math.min(totalTx / 700, 1);

  const latest = supplyDemandData?.[supplyDemandData.length - 1];
  const supplyRisk = latest && latest.supply > latest.demand ? 0.7 : 0.2;

  const roiScore = Math.round(normalizedYield * 100);
  const growthScore = Math.round(normalizedGrowth * 100);
  const demandPct = Math.round(demandScore * 100);
  const riskScore = Math.round((1 - supplyRisk) * 100);

  const finalScore = Math.min(
    Math.max(
      Math.round(
        (normalizedYield * 0.35 +
          normalizedGrowth * 0.3 +
          demandScore * 0.25 -
          supplyRisk * 0.1) * 100
      ),
      10
    ),
    98
  );

  return { roiScore, growthScore, demandPct, riskScore, finalScore };
}

function getLetterGrade(score: number) {
  if (score >= 80) return { grade: "A", color: "text-emerald" };
  if (score >= 65) return { grade: "B", color: "text-accent-foreground" };
  if (score >= 50) return { grade: "C", color: "text-orange-500" };
  return { grade: "D", color: "text-destructive" };
}

function getLevelLabel(score: number) {
  if (score >= 75) return { label: "High", variant: "emerald" };
  if (score >= 45) return { label: "Medium", variant: "accent" };
  return { label: "Low", variant: "destructive" };
}

function getRiskLabel(score: number) {
  if (score >= 75) return { label: "Low Risk", variant: "emerald" };
  if (score >= 45) return { label: "Moderate", variant: "accent" };
  return { label: "High Risk", variant: "destructive" };
}

function getAIInsight(area: string, scores: any) {
  const { roiScore, growthScore, demandPct, riskScore } = scores;

  const parts = [];
  if (roiScore >= 70) parts.push("strong rental returns");
  else if (roiScore >= 45) parts.push("moderate rental yield");
  else parts.push("lower rental income");

  if (growthScore >= 70) parts.push("excellent long-term appreciation");
  else if (growthScore >= 45) parts.push("steady price growth");
  else parts.push("limited price appreciation");

  if (demandPct >= 60) parts.push("high transaction demand");
  else parts.push("moderate market demand");

  const risk = riskScore >= 70 ? "low supply risk" : "watch for supply imbalance";

  return `${area} offers ${parts[0]}, ${parts[1]}, and ${parts[2]}. ${risk.charAt(0).toUpperCase() + risk.slice(1)}.`;
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  const barColor =
    color === "emerald"
      ? "bg-emerald"
      : color === "accent"
      ? "bg-accent"
      : color === "orange"
      ? "bg-orange-500"
      : "bg-destructive";

  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function BigScoreRing({ score }: { score: number }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const { grade, color } = getLetterGrade(score);

  const strokeColor =
    score >= 80
      ? "hsl(160 75% 35%)"
      : score >= 65
      ? "hsl(45 85% 55%)"
      : score >= 50
      ? "hsl(30 90% 55%)"
      : "hsl(0 84% 60%)";

  return (
    <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
      <svg
        className="w-28 h-28 sm:w-32 sm:h-32 -rotate-90"
        viewBox="0 0 120 120"
      >
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="hsl(35 15% 85%)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl sm:text-2xl font-bold leading-none">{score}</span>
        <span className={`text-base sm:text-lg font-bold leading-tight ${color}`}>{grade}</span>
      </div>
    </div>
  );
}

export default function InvestmentScore({
  areaComparisonData,
  topProjects,
  supplyDemandData,
}: any) {
  const areas = Object.keys(areaComparisonData || {});
  const [selectedArea, setSelectedArea] = useState<string>("");

  useEffect(() => {
    if (!selectedArea && areas.length > 0) {
      setSelectedArea(areas[0]);
    }
  }, [areas, selectedArea]);

  const activeArea = selectedArea || areas[0] || "";

  const scores = useMemo(() => {
    if (!activeArea || !areaComparisonData) return null;
    return computeScore(activeArea, areaComparisonData, topProjects, supplyDemandData);
  }, [activeArea, areaComparisonData, topProjects, supplyDemandData]);

  if (!areas.length) {
    return <div className="luxury-card p-6">No area data available.</div>;
  }

  const data = areaComparisonData?.[activeArea];
  if (!data || !scores) {
    return <div className="luxury-card p-6">Loading investment score...</div>;
  }

  const breakdown = [
    { label: "ROI", icon: TrendingUp, score: scores.roiScore, badge: getLevelLabel(scores.roiScore) },
    { label: "Growth", icon: Zap, score: scores.growthScore, badge: getLevelLabel(scores.growthScore) },
    { label: "Demand", icon: Users, score: scores.demandPct, badge: getLevelLabel(scores.demandPct) },
    { label: "Risk Level", icon: ShieldCheck, score: scores.riskScore, badge: getRiskLabel(scores.riskScore) },
  ];

  return (
    <div className="luxury-card p-4 sm:p-6">
      {/* Header */}
      <ToolHeader
        icon="⭐"
        title="Deal Quality / Investment Score"
        subtitle="AI-rated investment quality per area"
        color="emerald"
      />

      {/* Area selector */}
      <div className="mb-5 mt-1">
        <Select value={activeArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="w-full sm:w-52 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {areas.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Score hero card */}
      <div className="flex flex-col xs:flex-row items-center xs:items-start gap-4 sm:gap-6 mb-6 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-primary/5 to-emerald/5 border border-border">
        <BigScoreRing score={scores.finalScore} />

        <div className="flex-1 w-full text-center xs:text-left">
          <h3 className="font-serif text-lg sm:text-xl font-bold leading-tight">
            {activeArea}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">
            {scores.finalScore}/100 composite score
          </p>

          {/* Stats grid — 2 cols on all sizes, labels clean */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:text-sm">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Avg Price
              </span>
              <span className="font-semibold">{formatCurrency(data.avgPrice)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Avg Rent
              </span>
              <span className="font-semibold">{formatCurrency(data.avgRent)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Yield
              </span>
              <span className="font-semibold">{data.roi}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Growth
              </span>
              <span className="font-semibold">+{data.priceGrowth}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="space-y-3.5 mb-6">
        {breakdown.map(({ label, icon: Icon, score, badge }) => (
          <div key={label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                {label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-muted">
                  {badge.label}
                </span>
                <span className="font-semibold tabular-nums w-12 text-right">
                  {score}/100
                </span>
              </div>
            </div>
            <ScoreBar value={score} color={badge.variant} />
          </div>
        ))}
      </div>

      {/* AI insight */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-primary/5 border border-border/60">
        <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">AI Insight · </span>
          {getAIInsight(activeArea, scores)}
        </p>
      </div>
    </div>
  );
}