"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as echarts from "echarts";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DistributionData {
  area_id: number;
  property_category: string;
  rooms: number | null;
  min_rent: string | number;
  q1_rent: string | number;
  median_rent: string | number;
  q3_rent: string | number;
  max_rent: string | number;
  sample_size: string | number;
}

/** Normalised version with all numbers guaranteed */
interface NormData {
  rooms: number;
  label: string;
  category: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  sample: number;
}

type PropertyType = "all" | "apartment" | "villa";
type RangeOption = "1 year" | "3 years" | "5 years";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Rooms available per category — used only to disable buttons when a specific
 *  room filter is active. With the array API we no longer need this for fetching. */
const AVAILABLE_ROOMS: Record<"apartment" | "villa", number[]> = {
  apartment: [1, 2, 3, 4],
  villa: [2, 3, 4, 5],
};

const RANGE_OPTIONS: RangeOption[] = ["1 year", "3 years", "5 years"];

const AREA_ID = 409;

// ─── Colours ─────────────────────────────────────────────────────────────────

const COLOR = {
  gold: "hsl(45,85%,55%)",
  goldDim: "hsl(45,85%,55%,0.18)",
  emerald: "hsl(160,75%,35%)",
  emeraldDim: "hsl(160,75%,35%,0.18)",
  navy: "hsl(210,80%,12%)",
  navyDim: "hsl(210,80%,12%,0.15)",
  muted: "hsl(210,40%,35%)",
  border: "hsl(35,15%,85%)",
  card: "hsl(25,20%,98%)",
};

// apartment → navy, villa → gold
const CAT_COLOR: Record<string, { stroke: string; fill: string }> = {
  apartment: { stroke: COLOR.navy, fill: COLOR.navyDim },
  villa: { stroke: COLOR.gold, fill: COLOR.goldDim },
};

function catColor(cat: string) {
  return (
    CAT_COLOR[cat.toLowerCase()] ?? {
      stroke: COLOR.emerald,
      fill: COLOR.emeraldDim,
    }
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const n = (v: string | number) => Number(v);

function titleCase(s: string | undefined | null): string {
  if (!s) return "Unknown";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function formatAED(v: number) {
  if (!v && v !== 0) return "—";
  return v >= 1_000_000
    ? `AED ${(v / 1_000_000).toFixed(2)}M`
    : `AED ${(v / 1_000).toFixed(0)}K`;
}

function roomLabel(r: number) {
  return r === 1 ? "1BR" : `${r}BR`;
}

function normalise(raw: DistributionData[]): NormData[] {
  return raw
    .filter((d) => d.rooms !== null && d.rooms !== undefined)
    .map((d) => ({
      rooms: Number(d.rooms),
      label: roomLabel(Number(d.rooms)),
      category: titleCase(d.property_category),
      min: n(d.min_rent),
      q1: n(d.q1_rent),
      median: n(d.median_rent),
      q3: n(d.q3_rent),
      max: n(d.max_rent),
      sample: n(d.sample_size),
    }))
    .sort((a, b) => a.rooms - b.rooms);
}

function insightText(items: NormData[]): string {
  if (!items.length) return "";
  // pick the entry with the widest IQR
  const widest = items.reduce((a, b) => (b.q3 - b.q1 > a.q3 - a.q1 ? b : a));
  const iqrRatio = (widest.q3 - widest.q1) / widest.median;
  const whiskerRatio = widest.max / widest.q3;
  if (iqrRatio > 0.35)
    return `High volatility in ${widest.label} segment — wide IQR signals inconsistent pricing.`;
  if (whiskerRatio > 1.6)
    return `Luxury skew in ${widest.label} — long upper whisker signals premium outliers.`;
  if (iqrRatio < 0.12)
    return `Stable rental market — tight IQR across segments signals predictable demand.`;
  return "Moderate spread across segments — balanced mix of budget and premium units.";
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchDistribution(
  areaId: number,
  category?: "apartment" | "villa",
  range?: RangeOption,
): Promise<DistributionData[]> {
  const params = new URLSearchParams({ areaId: String(areaId) });
  if (category) params.set("category", category);
  if (range) params.set("range", range);

  const res = await fetch(
    `/api/areaCharts/rent_intel/rental_distribution?${params}`,
  );
  if (!res.ok) throw new Error("Failed to fetch");
  const json = await res.json();
  // API may return array or single object — normalise to array
  return Array.isArray(json) ? json : [json];
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-[hsl(35,20%,90%)] ${className}`}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RentalDistribution() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [range, setRange] = useState<RangeOption>("1 year");

  const [items, setItems] = useState<NormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let raw: DistributionData[] = [];

      if (propertyType === "all") {
        // fetch both in parallel, merge
        const [apts, villas] = await Promise.allSettled([
          fetchDistribution(AREA_ID, "apartment", range),
          fetchDistribution(AREA_ID, "villa", range),
        ]);
        if (apts.status === "fulfilled") raw = [...raw, ...apts.value];
        if (villas.status === "fulfilled") raw = [...raw, ...villas.value];
      } else {
        raw = await fetchDistribution(AREA_ID, propertyType, range);
      }

      setItems(normalise(raw));
    } catch {
      setError("Unable to load rental distribution data.");
    } finally {
      setLoading(false);
    }
  }, [propertyType, range]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Chart ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!chartRef.current) return;
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: "svg",
      });
    }
    const chart = chartInstance.current;

    if (loading || !items.length) {
      chart.clear();
      return;
    }

    // Group by category so each category becomes one series
    const categories = Array.from(new Set(items.map((d) => d.category)));
    // X-axis labels: unique room labels across all data, sorted
    const allRooms = Array.from(new Set(items.map((d) => d.label)));

    const series: echarts.SeriesOption[] = categories.map((cat) => {
      const catItems = items.filter((d) => d.category === cat);
      const { stroke, fill } = catColor(cat);

      // Build boxplot data aligned to allRooms x-axis
      const boxData = allRooms.map((lbl) => {
        const d = catItems.find((i) => i.label === lbl);
        if (!d) return null; // no data for this room in this category
        return [d.min, d.q1, d.median, d.q3, d.max];
      });

      return {
        name: cat,
        type: "boxplot" as const,
        data: boxData,
        itemStyle: { color: fill, borderColor: stroke, borderWidth: 2 },
        emphasis: {
          itemStyle: { borderWidth: 3, shadowBlur: 14, shadowColor: stroke },
        },
        tooltip: {
          formatter: (params: any) => {
            const idx = params.dataIndex;
            const d = catItems.find((i) => i.label === allRooms[idx]);
            if (!d)
              return `<span style="color:${COLOR.muted};font-size:11px">No data</span>`;
            return `
              <div style="font-family:'Playfair Display',serif;font-size:13px;font-weight:600;color:${COLOR.navy};margin-bottom:8px">
                ${cat} · ${d.label}
              </div>
              <div style="display:grid;grid-template-columns:auto auto;gap:3px 14px;font-size:11px;font-family:Inter,sans-serif">
                <span style="color:${COLOR.muted}">Maximum</span><span style="font-weight:600">${formatAED(d.max)}</span>
                <span style="color:${COLOR.muted}">Q3 (75th%)</span><span style="font-weight:600">${formatAED(d.q3)}</span>
                <span style="color:${stroke};font-weight:700">Median</span><span style="font-weight:700;color:${stroke}">${formatAED(d.median)}</span>
                <span style="color:${COLOR.muted}">Q1 (25th%)</span><span style="font-weight:600">${formatAED(d.q1)}</span>
                <span style="color:${COLOR.muted}">Minimum</span><span style="font-weight:600">${formatAED(d.min)}</span>
                <span style="color:${COLOR.muted}">Sample</span><span style="font-weight:600">${d.sample.toLocaleString()} units</span>
              </div>`;
          },
        },
      };
    });

    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: COLOR.card,
        borderColor: COLOR.border,
        borderWidth: 1,
        padding: [10, 14],
      },
      legend: {
        data: categories,
        bottom: 4,
        textStyle: {
          color: COLOR.muted,
          fontFamily: "Inter, sans-serif",
          fontSize: 11,
          fontWeight: "bold",
        },
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
      },
      grid: { left: 80, right: 24, top: 20, bottom: 48 },
      xAxis: {
        type: "category",
        data: allRooms,
        axisLine: { lineStyle: { color: COLOR.border } },
        axisTick: { show: false },
        axisLabel: {
          color: COLOR.muted,
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          fontWeight: "bold",
        },
      },
      yAxis: {
        type: "value",
        name: "Annual Rent (AED)",
        nameTextStyle: {
          color: COLOR.muted,
          fontFamily: "Inter, sans-serif",
          fontSize: 11,
          padding: [0, 0, 0, -40],
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: COLOR.border, type: "dashed" } },
        axisLabel: {
          color: COLOR.muted,
          fontFamily: "Inter, sans-serif",
          fontSize: 11,
          formatter: (v: number) => formatAED(v),
        },
      },
      series,
      animation: true,
      animationDuration: 500,
      animationEasing: "cubicOut",
    };

    chart.setOption(option, true);
  }, [items, loading]);

  // ── Resize ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const ro = new ResizeObserver(() => chartInstance.current?.resize());
    if (chartRef.current) ro.observe(chartRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Derived stats (first/widest IQR item) ─────────────────────────────────

  const highlight = items.length
    ? items.reduce((a, b) => (b.q3 - b.q1 > a.q3 - a.q1 ? b : a))
    : null;

  const totalSample = items.reduce((s, d) => s + d.sample, 0);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[hsl(25,15%,96%)] p-6 font-sans">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 rounded-full bg-[hsl(45,85%,55%)]" />
          <h2 className="font-serif text-2xl font-semibold text-[hsl(210,80%,12%)] tracking-tight">
            Rental Price Distribution
          </h2>
        </div>
        <p className="ml-4 text-sm text-[hsl(210,40%,35%)]">
          Spread, consistency &amp; luxury skew by bedroom count
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-[hsl(35,15%,85%)] bg-[hsl(25,20%,98%)] shadow-[0_10px_40px_-10px_hsl(210,80%,12%,0.12)] overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap items-end gap-5 border-b border-[hsl(35,15%,85%)] bg-[hsl(35,20%,96%)] px-6 py-4">
          {/* Property type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(210,40%,35%)]">
              Property Type
            </label>
            <div className="flex rounded-lg border border-[hsl(35,15%,85%)] overflow-hidden">
              {(["all", "apartment", "villa"] as PropertyType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setPropertyType(t)}
                  className={`px-4 py-1.5 text-xs font-semibold transition-all ${
                    propertyType === t
                      ? "bg-[hsl(210,80%,12%)] text-[hsl(25,15%,96%)]"
                      : "bg-white text-[hsl(210,40%,35%)] hover:bg-[hsl(35,20%,92%)]"
                  }`}
                >
                  {t === "all" ? "Both" : titleCase(t)}
                </button>
              ))}
            </div>
          </div>

          {/* Time range */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(210,40%,35%)]">
              Time Range
            </label>
            <div className="flex rounded-lg border border-[hsl(35,15%,85%)] overflow-hidden">
              {RANGE_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                    range === r
                      ? "bg-[hsl(210,80%,12%)] text-[hsl(25,15%,96%)]"
                      : "bg-white text-[hsl(210,40%,35%)] hover:bg-[hsl(35,20%,92%)]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          {!loading && items.length > 0 && (
            <div className="ml-auto flex items-center gap-4 pb-0.5">
              {Array.from(new Set(items.map((d) => d.category))).map((cat) => {
                const { stroke } = catColor(cat);
                return (
                  <span
                    key={cat}
                    className="flex items-center gap-1.5 text-xs font-medium text-[hsl(210,40%,35%)]"
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: stroke }}
                    />
                    {cat}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="relative px-6 pt-4 pb-2">
          {loading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center text-sm text-red-500">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-[hsl(210,40%,45%)]">
              No data available for this selection.
            </div>
          ) : (
            <div ref={chartRef} className="h-80 w-full" />
          )}
        </div>

        {/* Stats strip */}
        {!loading && !error && highlight && (
          <div className="grid grid-cols-2 gap-px border-t border-[hsl(35,15%,85%)] sm:grid-cols-4">
            {[
              {
                label: "Widest IQR Segment",
                value: `${highlight.label} · ${highlight.category}`,
                accent: false,
              },
              {
                label: "Median (Widest IQR)",
                value: formatAED(highlight.median),
                accent: true,
              },
              {
                label: "IQR Spread",
                value: formatAED(highlight.q3 - highlight.q1),
                accent: false,
              },
              {
                label: "Total Sample",
                value: totalSample.toLocaleString() + " units",
                accent: false,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col gap-0.5 bg-[hsl(25,20%,98%)] px-5 py-4"
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(210,40%,35%)]">
                  {s.label}
                </span>
                <span
                  className={`font-serif text-xl font-semibold ${s.accent ? "text-[hsl(45,85%,45%)]" : "text-[hsl(210,80%,12%)]"}`}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Insight bar */}
        {!loading && !error && items.length > 0 && (
          <div className="flex items-center gap-3 border-t border-[hsl(35,15%,85%)] bg-[hsl(210,80%,12%)] px-6 py-3">
            <svg
              className="h-4 w-4 shrink-0 text-[hsl(45,85%,55%)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"
              />
            </svg>
            <p className="text-xs font-medium text-[hsl(35,20%,88%)]">
              <span className="text-[hsl(45,85%,55%)] font-semibold">
                Investor Insight:{" "}
              </span>
              {insightText(items)}
            </p>
          </div>
        )}
      </div>

      {/* Box plot key */}
      <div className="mt-4 flex flex-wrap items-center gap-5 px-1">
        {[
          {
            icon: (
              <span
                className="inline-block h-0.5 w-5"
                style={{
                  background: `repeating-linear-gradient(90deg,${COLOR.muted} 0,${COLOR.muted} 3px,transparent 3px,transparent 6px)`,
                }}
              />
            ),
            label: "Whiskers = Min / Max",
          },
          {
            icon: (
              <span
                className="inline-block h-3 w-5 rounded-sm border-2"
                style={{ borderColor: COLOR.navy, background: COLOR.navyDim }}
              />
            ),
            label: "Box = Q1 → Q3 (IQR)",
          },
          {
            icon: (
              <span
                className="inline-block h-0.5 w-6 rounded"
                style={{ background: COLOR.gold }}
              />
            ),
            label: "Centre line = Median",
          },
        ].map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2 text-[11px] text-[hsl(210,40%,45%)]"
          >
            {item.icon}
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
