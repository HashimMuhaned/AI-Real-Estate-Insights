"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawRecord {
  month: string;
  property_category: string;
  rooms: number;
  transaction_count: string;
  volume_3m_avg: string;
}

interface ChartPoint {
  month: string;
  transaction_count: number;
  volume_3m_avg: number;
}

type PropertyCategory = "Apartment" | "Villa" | "";
type RangeOption = "1 years" | "3 years" | "5 years";

// ─── Design tokens — Dubai Real Estate design system ─────────────────────────
// Maps directly to CSS variables in globals.css (light mode)
const T = {
  primary:      "hsl(210, 80%, 12%)",   // --primary
  primaryLight: "hsl(210, 60%, 20%)",
  accent:       "hsl(45, 85%, 55%)",    // --accent  (gold)
  accentDark:   "hsl(40, 70%, 30%)",
  emerald:      "hsl(160, 75%, 35%)",   // --emerald
  background:   "hsl(25, 15%, 96%)",    // --background
  card:         "hsl(25, 20%, 98%)",    // --card
  muted:        "hsl(35, 20%, 92%)",    // --muted
  border:       "hsl(35, 15%, 85%)",    // --border
  mutedFg:      "hsl(210, 40%, 35%)",   // --muted-foreground
  foreground:   "hsl(210, 80%, 8%)",    // --foreground
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAreaIdFromUrl(): string {
  if (typeof window === "undefined") return "441";
  const parts = window.location.pathname.split("-");
  const last = parts[parts.length - 1];
  return /^\d+$/.test(last) ? last : "441";
}

function formatMonth(raw: string): string {
  const d = new Date(raw);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function formatCount(val: number): string {
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
  return String(val);
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm"
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        boxShadow: "0 10px 40px -10px hsl(210 80% 12% / 0.18)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <p
        className="font-semibold mb-2 text-xs tracking-widest uppercase"
        style={{ color: T.mutedFg }}
      >
        {label}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
            style={{ background: entry.color }}
          />
          <span style={{ color: T.mutedFg, fontSize: 12 }}>
            {entry.name === "transaction_count" ? "Transactions" : "3M Avg"}:
          </span>
          <span className="font-bold ml-auto pl-4" style={{ color: T.foreground }}>
            {Number(entry.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Filter Pill ──────────────────────────────────────────────────────────────

interface PillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const Pill = ({ label, active, onClick }: PillProps) => {
  const [hovered, setHovered] = useState(false);

  const activeStyle = {
    background: `linear-gradient(135deg, ${T.primary}, ${T.primaryLight})`,
    borderColor: T.primaryLight,
    color: "hsl(25,15%,96%)",
    boxShadow: "0 4px 14px -4px hsl(210 80% 12% / 0.3)",
  };

  const hoverStyle = {
    background: "transparent",
    borderColor: T.accent,
    color: T.primary,
    boxShadow: "none",
  };

  const idleStyle = {
    background: "transparent",
    borderColor: T.border,
    color: T.mutedFg,
    boxShadow: "none",
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 border"
      style={active ? activeStyle : hovered ? hoverStyle : idleStyle}
    >
      {label}
    </button>
  );
};

// ─── Section Label ────────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <span
    className="text-xs font-semibold uppercase tracking-widest w-24 shrink-0"
    style={{ color: T.mutedFg, fontFamily: "'Inter', sans-serif" }}
  >
    {children}
  </span>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VolumeChart() {
  const [areaId] = useState<string>(getAreaIdFromUrl);
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<PropertyCategory>("");
  const [rooms, setRooms] = useState<number | "">("");
  const [range, setRange] = useState<RangeOption>("3 years");

  const roomOptions = Array.from({ length: 7 }, (_, i) => i + 1);
  const rangeOptions: RangeOption[] = ["1 years", "3 years", "5 years"];
  const rangeLabels: Record<RangeOption, string> = {
    "1 years": "1Y",
    "3 years": "3Y",
    "5 years": "5Y",
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ areaId });
      if (category) params.set("category", category.toLowerCase());
      if (rooms !== "") params.set("rooms", String(rooms));
      params.set("range", range);

      const res = await fetch(`/api/areaCharts/transaction_volume?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: RawRecord[] = await res.json();

      const mapped: ChartPoint[] = json.map((r) => ({
        month: formatMonth(r.month),
        transaction_count: Number(r.transaction_count),
        volume_3m_avg: Math.round(Number(r.volume_3m_avg)),
      }));

      setData(mapped);
    } catch (e: any) {
      setError(e.message ?? "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [areaId, category, rooms, range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div
      className="w-full rounded-2xl p-6"
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        boxShadow: "0 10px 40px -10px hsl(210 80% 12% / 0.1)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Header ── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p
            className="text-xs font-bold tracking-[0.18em] uppercase mb-1"
            style={{ color: T.accent }}
          >
            Area · {areaId}
          </p>
          <h2
            className="text-2xl font-bold tracking-tight leading-tight"
            style={{
              color: T.primary,
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Transaction Volume
          </h2>
          <p className="text-sm mt-1" style={{ color: T.mutedFg }}>
            Monthly transactions with 3-month rolling average
          </p>
        </div>

        {/* Gold accent bar */}
        <div
          className="w-1 self-stretch rounded-full hidden sm:block"
          style={{
            background: `linear-gradient(180deg, ${T.accent}, hsl(40,80%,60%))`,
            minHeight: 56,
          }}
        />
      </div>

      {/* ── Filter Panel ── */}
      <div
        className="rounded-xl p-4 mb-5 space-y-3"
        style={{
          background: T.muted,
          border: `1px solid ${T.border}`,
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <SectionLabel>Property</SectionLabel>
          <Pill label="All" active={category === ""} onClick={() => setCategory("")} />
          <Pill label="Apartment" active={category === "Apartment"} onClick={() => setCategory("Apartment")} />
          <Pill label="Villa" active={category === "Villa"} onClick={() => setCategory("Villa")} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SectionLabel>Rooms</SectionLabel>
          <Pill label="All" active={rooms === ""} onClick={() => setRooms("")} />
          {roomOptions.map((r) => (
            <Pill key={r} label={String(r)} active={rooms === r} onClick={() => setRooms(r)} />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SectionLabel>Range</SectionLabel>
          {rangeOptions.map((opt) => (
            <Pill key={opt} label={rangeLabels[opt]} active={range === opt} onClick={() => setRange(opt)} />
          ))}
        </div>
      </div>

      {/* ── Active Filter Badges ── */}
      <div className="flex flex-wrap gap-2 mb-4 min-h-[24px]">
        {category && (
          <span
            className="text-xs px-2.5 py-1 rounded-md font-semibold capitalize"
            style={{
              background: "hsl(210,80%,12%,0.07)",
              color: T.primary,
              border: "1px solid hsl(210,80%,12%,0.12)",
            }}
          >
            {category}
          </span>
        )}
        {rooms !== "" && (
          <span
            className="text-xs px-2.5 py-1 rounded-md font-semibold"
            style={{
              background: "hsl(210,80%,12%,0.07)",
              color: T.primary,
              border: "1px solid hsl(210,80%,12%,0.12)",
            }}
          >
            {rooms} room{rooms !== 1 ? "s" : ""}
          </span>
        )}
        <span
          className="text-xs px-2.5 py-1 rounded-md font-semibold"
          style={{
            background: "hsl(45,85%,55%,0.12)",
            color: T.accentDark,
            border: "1px solid hsl(45,85%,55%,0.25)",
          }}
        >
          {rangeLabels[range]}
        </span>
      </div>

      {/* ── States ── */}
      {loading && (
        <div className="flex items-center justify-center h-72 gap-3">
          <div
            className="w-5 h-5 rounded-full border-2 animate-spin"
            style={{ borderColor: `${T.accent} transparent ${T.accent} ${T.accent}` }}
          />
          <span className="text-sm" style={{ color: T.mutedFg }}>
            Loading data…
          </span>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center h-72 gap-2">
          <span className="text-sm font-medium text-red-500">{error}</span>
          <button
            onClick={fetchData}
            className="text-xs underline underline-offset-2"
            style={{ color: T.accent }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="flex items-center justify-center h-72">
          <span className="text-sm" style={{ color: T.mutedFg }}>
            No data for selected filters
          </span>
        </div>
      )}

      {/* ── Chart ── */}
      {!loading && !error && data.length > 0 && (
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              {/* Bars: deep navy gradient (--primary family) */}
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(210,80%,22%)" stopOpacity={0.95} />
                <stop offset="100%" stopColor="hsl(210,60%,30%)" stopOpacity={0.6} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 4"
              stroke={T.border}
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{ fill: T.mutedFg, fontSize: 11, fontFamily: "'Inter', sans-serif" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />

            <YAxis
              yAxisId="left"
              tick={{ fill: T.mutedFg, fontSize: 11, fontFamily: "'Inter', sans-serif" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCount}
              width={44}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: T.mutedFg, fontSize: 11, fontFamily: "'Inter', sans-serif" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCount}
              width={44}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "hsl(210,80%,12%,0.04)" }}
            />

            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => (
                <span
                  style={{
                    fontSize: 12,
                    color: T.mutedFg,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {value === "transaction_count" ? "Transactions" : "3M Rolling Avg"}
                </span>
              )}
            />

            {/* Bars — navy (primary) */}
            <Bar
              yAxisId="left"
              dataKey="transaction_count"
              fill="url(#barGrad)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />

            {/* Line — gold (accent) */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="volume_3m_avg"
              stroke={T.accent}
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                fill: T.accent,
                stroke: T.card,
                strokeWidth: 2,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      {/* ── Footer ── */}
      <div
        className="flex items-center justify-between mt-4 pt-4"
        style={{ borderTop: `1px solid ${T.border}` }}
      >
        <p className="text-xs" style={{ color: "hsl(210,40%,60%)" }}>
          /api/areaCharts/volume · Area {areaId}
        </p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: T.mutedFg }}>
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ background: "hsl(210,80%,22%)" }}
            />
            Transactions
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: T.mutedFg }}>
            <span
              className="w-5 h-0.5 inline-block rounded-full"
              style={{ background: T.accent }}
            />
            3M Avg
          </span>
        </div>
      </div>
    </div>
  );
}