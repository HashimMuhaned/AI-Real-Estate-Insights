import { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import ToolHeader from "./ToolHeader";
import YieldBadge from "./YieldBadge";
import { formatCurrency } from "./data";

const METRICS = [
  {
    key: "roi",
    label: "ROI %",
    format: (v) => `${v.toFixed(1)}%`,
    best: "max",
  },
  { key: "avgPrice", label: "Avg Price", format: formatCurrency, best: "min" },
  {
    key: "priceGrowth",
    label: "Price Growth",
    format: (v) => `+${v.toFixed(1)}%`,
    best: "max",
  },
  { key: "avgRent", label: "Avg Rent", format: formatCurrency, best: "max" },
];

function getAreaTag(area, ranking) {
  if (area === ranking.bestYield.area)
    return { label: "Best Yield", variant: "emerald" };

  if (area === ranking.bestGrowth.area)
    return { label: "High Growth", variant: "accent" };

  if (area === ranking.mostExpensive.area)
    return { label: "Premium", variant: "purple" };

  return { label: "Stable", variant: "orange" };
}

export default function AreaComparison({ areaComparisonData }: any) {
  const allAreas = Object.keys(areaComparisonData || []);

  console.log("area comparison", areaComparisonData)

  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (allAreas.length && selected.length === 0) {
      setSelected(allAreas.slice(0, 3));
    }
  }, [allAreas]);

  const handleChange = (idx, value) => {
    const next = [...selected];
    next[idx] = value;
    setSelected(next);
  };

  const ranking = useMemo(() => {
    const data = Object.entries(areaComparisonData || {}).map(
      ([area, v]: any) => ({
        area,
        ...v,
      }),
    );

    return {
      bestYield: data.reduce((a, b) => (b.roi > a.roi ? b : a), data[0] || {}),
      bestGrowth: data.reduce(
        (a, b) => (b.priceGrowth > a.priceGrowth ? b : a),
        data[0] || {},
      ),
      mostExpensive: data.reduce(
        (a, b) => (b.avgPrice > a.avgPrice ? b : a),
        data[0] || {},
      ),
    };
  }, [areaComparisonData]);

  if (!areaComparisonData || Object.keys(areaComparisonData).length === 0) {
    return <div className="luxury-card p-6">No area data available</div>;
  }

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
        {selected.map((area, idx) => {
          const otherSelected = selected.filter((_, i) => i !== idx);
          const AREAS = Object.keys(areaComparisonData || {});
          return (
            <Select
              key={idx}
              value={area}
              onValueChange={(v) => handleChange(idx, v)}
            >
              <SelectTrigger className="w-44 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AREAS.map((a) => (
                  <SelectItem
                    key={a}
                    value={a}
                    disabled={otherSelected.includes(a)}
                  >
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        })}
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Metric
              </th>
              {selected.map((area, idx) => {
                const tag = getAreaTag(area, ranking);
                return (
                  <th key={idx} className="text-center py-3 px-4">
                    <p className="font-serif font-semibold text-sm text-foreground">
                      {area}
                    </p>
                    <YieldBadge label={tag.label} variant={tag.variant} />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric) => {
              const values = selected.map(
                (a) => areaComparisonData[a]?.[metric.key] || 0,
              );
              const bestIdx =
                metric.best === "max"
                  ? values.indexOf(Math.max(...values))
                  : values.indexOf(Math.min(...values));

              return (
                <tr
                  key={metric.key}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-4 text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </td>
                  {selected.map((area, idx) => {
                    const val = areaComparisonData[area]?.[metric.key] || 0;
                    const isBest = idx === bestIdx;
                    return (
                      <td key={idx} className="text-center py-4 px-4">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            isBest ? "text-emerald" : "text-foreground",
                          )}
                        >
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
