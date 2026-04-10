"use client"

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import ToolHeader from "@/components/market-tools/ToolHeader";
import YieldBadge from "@/components/market-tools/YieldBadge";
import { yieldData, getYieldBadge, PROPERTY_TYPES } from "./data";

export default function ROIYieldAnalyzer() {
  const [propertyType, setPropertyType] = useState("all");

  const filtered = useMemo(() => {
    let data = [...yieldData];
    if (propertyType !== "all") {
      data = data.filter(d => d.type === propertyType);
    }
    return data.sort((a, b) => b.yield - a.yield).slice(0, 10);
  }, [propertyType]);

  const topArea = filtered[0];

  return (
    <div className="luxury-card p-6">
      <ToolHeader
        icon="🟢"
        title="ROI & Yield Analyzer"
        subtitle="Top areas ranked by rental yield"
        color="emerald"
      />

      {/* KPI highlight */}
      {topArea && (
        <div className="mb-6 p-4 rounded-xl bg-emerald/5 border border-emerald/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald/5 to-transparent" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Highest Yield Area</p>
              <p className="text-xl font-serif font-bold text-foreground mt-1">{topArea.area}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald" />
                <span className="text-2xl font-bold text-emerald">{topArea.yield}%</span>
              </div>
              <YieldBadge label={getYieldBadge(topArea.yield).label} variant={getYieldBadge(topArea.yield).color} />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger className="w-40 bg-background">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {PROPERTY_TYPES.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filtered} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 15% 85%)" />
            <XAxis type="number" domain={[0, 10]} tickFormatter={v => `${v}%`} fontSize={12} />
            <YAxis type="category" dataKey="area" width={130} fontSize={12} tick={{ fill: 'hsl(210 80% 8%)' }} />
            <Tooltip
              formatter={(v) => [`${v}%`, "Rental Yield"]}
              contentStyle={{ background: 'hsl(25 20% 98%)', border: '1px solid hsl(35 15% 85%)', borderRadius: '8px' }}
            />
            <Bar dataKey="yield" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {filtered.map((entry, i) => (
                <Cell
                  key={entry.area}
                  fill={i === 0 ? "hsl(160 75% 35%)" : entry.yield > 7 ? "hsl(160 75% 45%)" : entry.yield >= 5 ? "hsl(45 85% 55%)" : "hsl(0 84% 60%)"}
                  style={i === 0 ? { filter: "drop-shadow(0 0 8px hsl(160 75% 35% / 0.4))" } : {}}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald" /> High Yield (&gt;7%)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-accent" /> Balanced (5-7%)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-destructive" /> Low Yield (&lt;5%)</span>
      </div>
    </div>
  );
}