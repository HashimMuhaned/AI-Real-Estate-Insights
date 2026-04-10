"use client"

import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import ToolHeader from "@/components/market-tools/ToolHeader";
import YieldBadge from "./YieldBadge";
import { priceTrendData, AREAS, formatCurrency } from "./data";

export default function PriceTrendTool() {
  const [selectedArea, setSelectedArea] = useState("Dubai Marina");

  const data = priceTrendData[selectedArea] || [];

  const { yoy, trend, trendLabel, trendColor } = useMemo(() => {
    if (data.length < 4) return { yoy: 0, trend: "flat", trendLabel: "No Data", trendColor: "text-muted-foreground" };

    const lastYearAvg = data.slice(0, 4).reduce((s, d) => s + d.price, 0) / 4;
    const thisYearAvg = data.slice(4).reduce((s, d) => s + d.price, 0) / Math.max(data.length - 4, 1);
    const yoyVal = ((thisYearAvg - lastYearAvg) / lastYearAvg) * 100;

    const last3 = data.slice(-3).map(d => d.price);
    const slope = (last3[2] - last3[0]) / last3[0] * 100;

    let t = "flat";
    let label = "Stable";
    let color = "text-accent-foreground";

    if (slope > 2) { t = "up"; label = "Growth"; color = "text-emerald"; }
    else if (slope > 0.5) { t = "slowing"; label = "Slowing"; color = "text-orange-500"; }
    else if (slope < -0.5) { t = "down"; label = "Decline"; color = "text-destructive"; }

    return { yoy: yoyVal, trend: t, trendLabel: label, trendColor: color };
  }, [data]);

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const lineColor = trend === "up" ? "hsl(160 75% 35%)" : trend === "slowing" ? "hsl(30 90% 55%)" : trend === "down" ? "hsl(0 84% 60%)" : "hsl(45 85% 55%)";

  return (
    <div className="luxury-card p-6">
      <ToolHeader
        icon="🔵"
        title="Price Trend & Timing"
        subtitle="Track price movements over time"
        color="primary"
      />

      {/* Area selector + KPI */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="w-52 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AREAS.map(a => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">YoY Growth</p>
            <p className={`text-lg font-bold ${trendColor}`}>{yoy > 0 ? "+" : ""}{yoy.toFixed(1)}%</p>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendIcon className={`w-5 h-5 ${trendColor}`} />
            <YieldBadge
              label={trendLabel}
              variant={trend === "up" ? "emerald" : trend === "slowing" ? "orange" : trend === "down" ? "destructive" : "accent"}
            />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 15% 85%)" />
            <XAxis dataKey="period" fontSize={11} tick={{ fill: 'hsl(210 40% 35%)' }} />
            <YAxis
              tickFormatter={v => formatCurrency(v)}
              fontSize={11}
              tick={{ fill: 'hsl(210 40% 35%)' }}
              width={80}
            />
            <Tooltip
              formatter={(v) => [formatCurrency(v), "Avg Price"]}
              contentStyle={{ background: 'hsl(25 20% 98%)', border: '1px solid hsl(35 15% 85%)', borderRadius: '8px' }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={3}
              dot={{ fill: lineColor, r: 4 }}
              activeDot={{ r: 6, stroke: lineColor, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}