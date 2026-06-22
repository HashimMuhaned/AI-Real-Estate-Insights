"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface YieldDataPoint {
  month: string;
  property_category: string;
  rooms: number;
  median_price: number;
  median_rent: number;
  yield_percent: number;
}

interface MergedDataPoint {
  label: string;
  month: string;
  apartment_yield?: number;
  villa_yield?: number;
}

interface SingleDataPoint {
  label: string;
  month: string;
  yield_percent: number;
}

type Category = "all" | "apartment" | "villa";
type RangeOption = "1 year" | "2 years" | "5 years";

// ─── Constants ────────────────────────────────────────────────────────────────

const DUBAI_AVG = 6.8;
const APARTMENT_COLOR = "hsl(210, 80%, 45%)";
const VILLA_COLOR = "hsl(160, 75%, 35%)";
const SINGLE_COLOR_UP = "hsl(160, 75%, 35%)";
const SINGLE_COLOR_DOWN = "hsl(0, 72%, 55%)";

const DISABLED_ROOMS: Record<Category, number[]> = {
  all: [],
  apartment: [5, 6, 7],
  villa: [1, 6, 7],
};

const AI_INSIGHT =
  "Yields in this area have shown resilience over the past 18 months, with 1BR apartments consistently outperforming the Dubai market average of ~6.8%. The recent uptick in Q3 signals that rental demand is absorbing new supply — a classic rent-led growth pattern. Watch for compression risk if off-plan completions accelerate into 2025.";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAreaIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const pathname = window.location.pathname;
  const segments = pathname.split("/");
  const lastSegment = segments[segments.length - 1];
  const match = lastSegment.match(/-(\d+)$/);
  return match ? match[1] : null;
}

function formatMonth(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

async function fetchYield(params: URLSearchParams): Promise<YieldDataPoint[]> {
  const res = await fetch(`/api/areaCharts/rent_intel/yield_rent?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({
  active,
  payload,
  label,
  isBoth,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  isBoth: boolean;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {isBoth ? (
        <>
          {payload.find((p) => p.dataKey === "apartment_yield") && (
            <p className="text-muted-foreground">
              Apartment:{" "}
              <span className="font-semibold" style={{ color: APARTMENT_COLOR }}>
                {payload.find((p) => p.dataKey === "apartment_yield")?.value}%
              </span>
            </p>
          )}
          {payload.find((p) => p.dataKey === "villa_yield") && (
            <p className="text-muted-foreground">
              Villa:{" "}
              <span className="font-semibold" style={{ color: VILLA_COLOR }}>
                {payload.find((p) => p.dataKey === "villa_yield")?.value}%
              </span>
            </p>
          )}
        </>
      ) : (
        payload[0] && (
          <p className="text-muted-foreground">
            Yield:{" "}
            <span className="font-semibold" style={{ color: payload[0].stroke }}>
              {payload[0].value}%
            </span>
          </p>
        )
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function YieldTrendChart() {
  const [category, setCategory] = useState<Category>("all");
  const [rooms, setRooms] = useState<number | null>(null);
  const [range, setRange] = useState<RangeOption>("1 year");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMoreInsights, setShowMoreInsights] = useState(false);

  const [singleData, setSingleData] = useState<YieldDataPoint[]>([]);
  const [apartmentData, setApartmentData] = useState<YieldDataPoint[]>([]);
  const [villaData, setVillaData] = useState<YieldDataPoint[]>([]);

  const areaId = useMemo(() => getAreaIdFromUrl(), []);
  const isBoth = category === "all";
  const disabledRooms = DISABLED_ROOMS[category];

  // Reset room when it becomes disabled by a category switch
  useEffect(() => {
    if (rooms !== null && disabledRooms.includes(rooms)) setRooms(null);
  }, [category]);

  // ─── Fetch ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const baseParams = (): URLSearchParams => {
      const p = new URLSearchParams();
      if (rooms !== null) p.set("rooms", String(rooms));
      if (areaId) p.set("areaId", areaId);
      p.set("range", range);
      return p;
    };

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isBoth) {
          const apParams = baseParams();
          apParams.set("category", "apartment");
          const viParams = baseParams();
          viParams.set("category", "villa");
          const [ap, vi] = await Promise.all([fetchYield(apParams), fetchYield(viParams)]);
          setApartmentData(ap);
          setVillaData(vi);
        } else {
          const p = baseParams();
          p.set("category", category);
          setSingleData(await fetchYield(p));
        }
      } catch (e: any) {
        setError(e?.message ?? "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [category, rooms, range, areaId]);

  // ─── Derived chart data ────────────────────────────────────────────────────

  const mergedBothData = useMemo((): MergedDataPoint[] => {
    if (!isBoth) return [];
    const map = new Map<string, MergedDataPoint>();
    apartmentData.forEach((d) => {
      if (!map.has(d.month)) map.set(d.month, { label: formatMonth(d.month), month: d.month });
      map.get(d.month)!.apartment_yield = d.yield_percent;
    });
    villaData.forEach((d) => {
      if (!map.has(d.month)) map.set(d.month, { label: formatMonth(d.month), month: d.month });
      map.get(d.month)!.villa_yield = d.yield_percent;
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
    );
  }, [isBoth, apartmentData, villaData]);

  const singleChartData = useMemo((): SingleDataPoint[] => {
    if (isBoth) return [];
    return singleData.map((d) => ({ ...d, label: formatMonth(d.month) }));
  }, [isBoth, singleData]);

  const hasData = isBoth ? mergedBothData.length > 0 : singleChartData.length > 0;

  const singleTrendColor = useMemo(() => {
    if (singleChartData.length < 4) return SINGLE_COLOR_UP;
    const first = singleChartData.slice(0, 3).reduce((s, d) => s + d.yield_percent, 0) / 3;
    const last = singleChartData.slice(-3).reduce((s, d) => s + d.yield_percent, 0) / 3;
    return last >= first ? SINGLE_COLOR_UP : SINGLE_COLOR_DOWN;
  }, [singleChartData]);

  const avgApartment =
    apartmentData.length > 0
      ? apartmentData.reduce((s, d) => s + d.yield_percent, 0) / apartmentData.length
      : null;
  const avgVilla =
    villaData.length > 0
      ? villaData.reduce((s, d) => s + d.yield_percent, 0) / villaData.length
      : null;
  const avgSingle =
    singleChartData.length > 0
      ? singleChartData.reduce((s, d) => s + d.yield_percent, 0) / singleChartData.length
      : null;

  // ─── Shared recharts props ─────────────────────────────────────────────────

  const sharedAxisProps = {
    tickLine: false as const,
    axisLine: false as const,
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="w-full font-sans">

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-5 items-end">

        {/* Type */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Type
          </label>
          <div className="flex rounded-lg overflow-hidden border border-border">
            {(["all", "apartment", "villa"] as Category[]).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors duration-150 ${
                  category === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-muted"
                }`}
              >
                {c === "all" ? "Both" : c}
              </button>
            ))}
          </div>
        </div>

        {/* Bedrooms */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Bedrooms
          </label>
          <div className="flex rounded-lg overflow-hidden border border-border">
            <button
              onClick={() => setRooms(null)}
              className={`px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                rooms === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-muted"
              }`}
            >
              All
            </button>
            {[1, 2, 3, 4, 5, 6, 7].map((r) => {
              const disabled = disabledRooms.includes(r);
              return (
                <button
                  key={r}
                  disabled={disabled}
                  onClick={() => !disabled && setRooms(r)}
                  title={
                    disabled
                      ? isBoth
                        ? `${r}BR has limited availability across both types`
                        : `${r}BR not typical for ${category}s`
                      : undefined
                  }
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    disabled
                      ? "opacity-30 cursor-not-allowed bg-card text-muted-foreground"
                      : rooms === r
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {r}BR
                </button>
              );
            })}
          </div>
          {isBoth && (
            <p className="text-[10px] text-muted-foreground mt-0.5 italic">
              Apts: 1–4 BR · Villas: 2–5 BR · Grayed = limited availability across both
            </p>
          )}
        </div>

        {/* Period */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Period
          </label>
          <div className="flex rounded-lg overflow-hidden border border-border">
            {(["1 year", "2 years", "5 years"] as RangeOption[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                  range === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-muted"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Insight Box ── */}
      <div className="relative mb-6 rounded-2xl border border-border bg-gradient-to-br from-yellow-50/60 to-emerald-50/40 dark:from-yellow-950/20 dark:to-emerald-950/10 p-5 overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-yellow-400/10 blur-2xl" />

        {/* Header */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-yellow-400/15">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="hsl(45,75%,42%)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-400">
              AI Market Interpretation
            </span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Ask AI about this chart
          </button>
        </div>

        <p className="text-sm leading-relaxed text-foreground/80">{AI_INSIGHT}</p>

        <div className="mt-3">
          <button
            onClick={() => setShowMoreInsights((v) => !v)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline transition-all"
          >
            {showMoreInsights ? "hide insights ↑" : "view more insights →"}
          </button>
          {showMoreInsights && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Yield rising", meaning: "Rents are outpacing price growth — strong income play." },
                { label: "Yield falling", meaning: "Speculative pricing may be ahead of fundamentals." },
                { label: "Stable high yield", meaning: "Consistent cash flow; mature rental market." },
                { label: "Falling yield + volume", meaning: "Potential market stress — approach with caution." },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-card/70 border border-border px-4 py-3"
                >
                  <p className="text-xs font-bold text-foreground mb-0.5">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.meaning}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Stat Pills ── */}
      {!loading && hasData && (
        <div className="flex flex-wrap gap-3 mb-5">
          {isBoth ? (
            <>
              {avgApartment !== null && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-sm">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: APARTMENT_COLOR }} />
                  <span className="text-xs text-muted-foreground">Apt avg</span>
                  <span className="text-sm font-bold" style={{ color: APARTMENT_COLOR }}>
                    {avgApartment.toFixed(2)}%
                  </span>
                </div>
              )}
              {avgVilla !== null && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-sm">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: VILLA_COLOR }} />
                  <span className="text-xs text-muted-foreground">Villa avg</span>
                  <span className="text-sm font-bold" style={{ color: VILLA_COLOR }}>
                    {avgVilla.toFixed(2)}%
                  </span>
                </div>
              )}
            </>
          ) : (
            avgSingle !== null && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-sm">
                <span className="text-xs text-muted-foreground">Area avg yield</span>
                <span className="text-sm font-bold" style={{ color: singleTrendColor }}>
                  {avgSingle.toFixed(2)}%
                </span>
              </div>
            )
          )}

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-sm">
            <span className="text-xs text-muted-foreground">Dubai market avg</span>
            <span className="text-sm font-bold text-muted-foreground">{DUBAI_AVG}%</span>
          </div>

          {!isBoth && avgSingle !== null && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-sm">
              <span className="text-xs text-muted-foreground">vs. market</span>
              <span
                className="text-sm font-bold"
                style={{ color: avgSingle >= DUBAI_AVG ? SINGLE_COLOR_UP : SINGLE_COLOR_DOWN }}
              >
                {avgSingle >= DUBAI_AVG ? "+" : ""}
                {(avgSingle - DUBAI_AVG).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Chart ── */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Loading yield data…</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-red-500">Error: {error}</p>
          </div>
        ) : !hasData ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-muted-foreground">No data for the selected filters.</p>
          </div>
        ) : isBoth ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={mergedBothData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                strokeOpacity={0.6}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                {...sharedAxisProps}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontFamily: "inherit" }}
                interval="preserveStartEnd"
              />
              <YAxis
                {...sharedAxisProps}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontFamily: "inherit" }}
                tickFormatter={(v) => `${v}%`}
                domain={["auto", "auto"]}
              />
              <Tooltip content={(props) => <CustomTooltip {...props} isBoth={true} />} />
              <Legend
                wrapperStyle={{ fontSize: 11, fontFamily: "inherit", paddingTop: 12 }}
                iconType="circle"
                iconSize={8}
              />
              <ReferenceLine
                y={DUBAI_AVG}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="6 3"
                strokeWidth={1.5}
                label={{
                  value: `Dubai avg ${DUBAI_AVG}%`,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 10,
                  position: "insideTopRight",
                }}
              />
              <Line
                type="monotone"
                dataKey="apartment_yield"
                name="Apartment"
                stroke={APARTMENT_COLOR}
                strokeWidth={2.5}
                dot={false}
                connectNulls
                activeDot={{ r: 5, fill: APARTMENT_COLOR, stroke: "white", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="villa_yield"
                name="Villa"
                stroke={VILLA_COLOR}
                strokeWidth={2.5}
                dot={false}
                connectNulls
                activeDot={{ r: 5, fill: VILLA_COLOR, stroke: "white", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={singleChartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                strokeOpacity={0.6}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                {...sharedAxisProps}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontFamily: "inherit" }}
                interval="preserveStartEnd"
              />
              <YAxis
                {...sharedAxisProps}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontFamily: "inherit" }}
                tickFormatter={(v) => `${v}%`}
                domain={["auto", "auto"]}
              />
              <Tooltip content={(props) => <CustomTooltip {...props} isBoth={false} />} />
              <Legend
                wrapperStyle={{ fontSize: 11, fontFamily: "inherit", paddingTop: 12 }}
                iconType="circle"
                iconSize={8}
              />
              <ReferenceLine
                y={DUBAI_AVG}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="6 3"
                strokeWidth={1.5}
                label={{
                  value: `Dubai avg ${DUBAI_AVG}%`,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 10,
                  position: "insideTopRight",
                }}
              />
              <Line
                type="monotone"
                dataKey="yield_percent"
                name={category === "apartment" ? "Apartment Yield" : "Villa Yield"}
                stroke={singleTrendColor}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: singleTrendColor, stroke: "white", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Footer note ── */}
      {!loading && hasData && (
        <p className="mt-3 text-[11px] text-muted-foreground text-center">
          {isBoth
            ? "Blue = Apartment · Green = Villa · Dashed = Dubai market benchmark (6.8%)"
            : "Green = rising yield · Red = compressing yield · Dashed = Dubai market benchmark (6.8%)"}
        </p>
      )}
    </div>
  );
}