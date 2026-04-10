"use client"

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import ToolHeader from "@/components/market-tools/ToolHeader";
import YieldBadge from "@/components/market-tools/YieldBadge";
import { areaComparisonData, AREAS, formatCurrency } from "@/components/market-tools/data";

const METRICS = [
  { key: "roi", label: "ROI %", format: v => `${v.toFixed(1)}%`, best: "max" },
  { key: "avgPrice", label: "Avg Price", format: formatCurrency, best: "min" },
  { key: "priceGrowth", label: "Price Growth", format: v => `+${v.toFixed(1)}%`, best: "max" },
  { key: "avgRent", label: "Avg Rent", format: formatCurrency, best: "max" },
];

function getAreaTag(area, areas) {
  const data = areas.map(a => ({ area: a, ...areaComparisonData[a] }));
  const bestYield = data.reduce((best, d) => d.roi > best.roi ? d : best, data[0]);
  const bestGrowth = data.reduce((best, d) => d.priceGrowth > best.priceGrowth ? d : best, data[0]);
  const mostExpensive = data.reduce((best, d) => d.avgPrice > best.avgPrice ? d : best, data[0]);

  if (area === bestYield.area) return { label: "Best Yield", variant: "emerald" };
  if (area === bestGrowth.area) return { label: "High Growth", variant: "accent" };
  if (area === mostExpensive.area) return { label: "Premium", variant: "purple" };
  return { label: "Stable", variant: "orange" };
}

export default function AreaComparison() {
  const [selected, setSelected] = useState(["JVC", "Dubai Marina", "Business Bay"]);

  const handleChange = (idx, value) => {
    const next = [...selected];
    next[idx] = value;
    setSelected(next);
  };

  return (
    <div className="luxury-card p-6">
      <ToolHeader
        icon="🟣"
        title="Area Comparison"
        subtitle="Compare key metrics side by side"
        color="purple"
      />

      {/* Area selectors */}
      <div className="flex flex-wrap gap-3 mb-6">
        {selected.map((area, idx) => (
          <Select key={idx} value={area} onValueChange={(v) => handleChange(idx, v)}>
            <SelectTrigger className="w-44 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AREAS.map(a => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Metric</th>
              {selected.map(area => {
                const tag = getAreaTag(area, selected);
                return (
                  <th key={area} className="text-center py-3 px-4">
                    <p className="font-serif font-semibold text-sm text-foreground">{area}</p>
                    <YieldBadge label={tag.label} variant={tag.variant} />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {METRICS.map(metric => {
              const values = selected.map(a => areaComparisonData[a]?.[metric.key] || 0);
              const bestIdx = metric.best === "max"
                ? values.indexOf(Math.max(...values))
                : values.indexOf(Math.min(...values));

              return (
                <tr key={metric.key} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-4 text-sm font-medium text-muted-foreground">{metric.label}</td>
                  {selected.map((area, idx) => {
                    const val = areaComparisonData[area]?.[metric.key] || 0;
                    const isBest = idx === bestIdx;
                    return (
                      <td key={area} className="text-center py-4 px-4">
                        <span className={cn(
                          "text-sm font-semibold",
                          isBest ? "text-emerald" : "text-foreground"
                        )}>
                          {metric.format(val)}
                        </span>
                        {isBest && (
                          <span className="ml-1.5 text-emerald text-xs">★</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}