"use client"

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AlertTriangle, TrendingUp } from "lucide-react";
import ToolHeader from "@/components/market-tools/ToolHeader";
import YieldBadge from "@/components/market-tools/YieldBadge";
import { supplyDemandData } from "./data";

export default function SupplyDemand() {
  const signals = useMemo(() => {
    return supplyDemandData.map(d => {
      const ratio = d.supply / d.demand;
      const isRisk = ratio > 1;
      return {
        ...d,
        ratio,
        signal: isRisk ? "Oversupply Risk" : "Growth Opportunity",
        isRisk,
      };
    });
  }, []);

  const latestSignal = signals[signals.length - 1];

  return (
    <div className="luxury-card p-6">
      <ToolHeader
        icon="🔴"
        title="Supply vs Demand"
        subtitle="Market balance analysis"
        color="destructive"
      />

      {/* Signal banner */}
      <div className={`mb-6 p-4 rounded-xl border ${latestSignal.isRisk ? "bg-destructive/5 border-destructive/20" : "bg-emerald/5 border-emerald/20"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {latestSignal.isRisk ? (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            ) : (
              <TrendingUp className="w-5 h-5 text-emerald" />
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">{latestSignal.year} Outlook</p>
              <p className="text-xs text-muted-foreground">
                Supply: {(latestSignal.supply / 1000).toFixed(0)}K units · Demand: {(latestSignal.demand / 1000).toFixed(0)}K transactions
              </p>
            </div>
          </div>
          <YieldBadge
            label={latestSignal.signal}
            variant={latestSignal.isRisk ? "destructive" : "emerald"}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={signals} margin={{ left: 0, right: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 15% 85%)" />
            <XAxis dataKey="year" fontSize={12} tick={{ fill: 'hsl(210 40% 35%)' }} />
            <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}K`} fontSize={11} tick={{ fill: 'hsl(210 40% 35%)' }} />
            <Tooltip
              formatter={(v, name) => [`${(v / 1000).toFixed(1)}K`, name === "supply" ? "Supply (Units)" : "Demand (Transactions)"]}
              contentStyle={{ background: 'hsl(25 20% 98%)', border: '1px solid hsl(35 15% 85%)', borderRadius: '8px' }}
            />
            <Legend
              formatter={(v) => v === "supply" ? "Supply (Future Units)" : "Demand (Transactions)"}
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar dataKey="supply" fill="hsl(210 80% 12%)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="demand" fill="hsl(160 75% 35%)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Year-by-year signals */}
      <div className="mt-4 flex flex-wrap gap-2">
        {signals.map(s => (
          <span
            key={s.year}
            className={`text-xs px-2.5 py-1 rounded-full border ${s.isRisk ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-emerald/10 border-emerald/20 text-emerald"}`}
          >
            {s.year}: {s.isRisk ? "⚠ Risk" : "✓ Growth"}
          </span>
        ))}
      </div>
    </div>
  );
}