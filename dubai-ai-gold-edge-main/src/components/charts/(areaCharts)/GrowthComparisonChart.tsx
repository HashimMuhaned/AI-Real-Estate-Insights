"use client";

import { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GrowthDataPoint {
  area_id: number;
  property_category: string;
  rooms: number;
  price_growth: string | null;
  rent_growth: string | null;
}

type ChartMode = "dual" | "indexed";
type DateRange = "1Y" | "3Y" | "5Y";
type PropertyCategory = "villa" | "apartment";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAreaIdFromUrl(): number | null {
  if (typeof window === "undefined") return null;
  const parts = window.location.pathname.split("-");
  const last = parts[parts.length - 1];
  const id = parseInt(last, 10);
  return isNaN(id) ? null : id;
}

const RANGE_MAP: Record<DateRange, string> = {
  "1Y": "1 year",
  "3Y": "3 years",
  "5Y": "5 years",
};

function buildApiUrl(
  areaId: number | null,
  category: PropertyCategory,
  rooms: number | null,
  dateRange: DateRange
): string {
  const base = "/api/areaCharts/growth_comparison";
  const params = new URLSearchParams();
  if (areaId) params.set("areaId", String(areaId));
  params.set("category", category);
  if (rooms !== null) params.set("rooms", String(rooms));
  params.set("range", RANGE_MAP[dateRange]);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Convert flat API data into chart-friendly time series  */
function buildChartData(
  data: GrowthDataPoint[],
  range: DateRange,
  mode: ChartMode
) {
  const yearCount = range === "1Y" ? 1 : range === "3Y" ? 3 : 5;
  const now = new Date().getFullYear();
  const years = Array.from({ length: yearCount + 1 }, (_, i) =>
    String(now - yearCount + i)
  );

  const priceGrowths = data
    .map((d) => parseFloat(d.price_growth ?? ""))
    .filter((v) => !isNaN(v));
  const rentGrowths = data
    .map((d) => parseFloat(d.rent_growth ?? ""))
    .filter((v) => !isNaN(v));

  const avgPrice =
    priceGrowths.length > 0
      ? priceGrowths.reduce((a, b) => a + b, 0) / priceGrowths.length
      : 0;
  const avgRent =
    rentGrowths.length > 0
      ? rentGrowths.reduce((a, b) => a + b, 0) / rentGrowths.length
      : 0;

  return years.map((year, i) => {
    const fraction = i / yearCount;
    if (mode === "dual") {
      return {
        year,
        "Price Growth (%)": parseFloat((avgPrice * fraction).toFixed(2)),
        "Rent Growth (%)": parseFloat((avgRent * fraction).toFixed(2)),
      };
    } else {
      return {
        year,
        "Price Index": parseFloat((100 + avgPrice * fraction).toFixed(2)),
        "Rent Index": parseFloat((100 + avgRent * fraction).toFixed(2)),
      };
    }
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onClick,
  disabled = false,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-1.5 rounded-full text-sm font-medium tracking-wide transition-all duration-200 border
        ${disabled
          ? "opacity-30 cursor-not-allowed bg-transparent text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]"
          : active
            ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border-[hsl(var(--accent))] shadow-[var(--shadow-gold)]"
            : "bg-transparent text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
        }
      `}
    >
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))] font-semibold">
      {children}
    </span>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl px-4 py-3 shadow-[var(--shadow-luxury)]">
      <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2 font-medium">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-[hsl(var(--foreground))] font-medium">
            {entry.name}:
          </span>
          <span style={{ color: entry.color }} className="font-semibold">
            {entry.value}
            {entry.name.includes("%") ? "%" : ""}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GrowthComparisonChart() {
  const [data, setData] = useState<GrowthDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [category, setCategory] = useState<PropertyCategory>("villa");
  const [rooms, setRooms] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("1Y");
  const [chartMode, setChartMode] = useState<ChartMode>("dual");

  // Rooms allowed per category:
  // apartment: 1–4 only (disable 5, 6, 7)
  // villa: 2–5 only (disable 1, 6, 7)
  const ALLOWED_ROOMS: Record<PropertyCategory, number[]> = {
    apartment: [1, 2, 3, 4],
    villa: [2, 3, 4, 5],
  };

  function handleCategoryChange(next: PropertyCategory) {
    setCategory(next);
    // Reset room selection if current room is not valid for the new category
    if (rooms !== null && !ALLOWED_ROOMS[next].includes(rooms)) {
      setRooms(null);
    }
  }

  const areaId = useMemo(() => getAreaIdFromUrl(), []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const url = buildApiUrl(areaId, category, rooms, dateRange);
    setLoading(true);
    setError(null);

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: GrowthDataPoint[]) => setData(json))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [areaId, category, rooms, dateRange]);

  // ── Chart data ────────────────────────────────────────────────────────────
  const chartData = useMemo(
    () => buildChartData(data, dateRange, chartMode),
    [data, dateRange, chartMode]
  );

  const isPriceKey = chartMode === "dual" ? "Price Growth (%)" : "Price Index";
  const isRentKey = chartMode === "dual" ? "Rent Growth (%)" : "Rent Index";

  // Gold & Emerald from design system
  const GOLD = "hsl(45, 85%, 55%)";
  const EMERALD = "hsl(160, 75%, 35%)";

  const roomOptions = Array.from({ length: 7 }, (_, i) => i + 1);

  return (
    <div
      className="luxury-card p-6 space-y-6"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2
            className="text-xl font-semibold text-[hsl(var(--foreground))]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Growth Comparison
          </h2>
          {areaId && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              Area ID:{" "}
              <span className="text-[hsl(var(--accent))] font-semibold">
                {areaId}
              </span>
            </p>
          )}
        </div>

        {/* Chart mode toggle */}
        <div className="flex items-center gap-1 bg-[hsl(var(--muted))] rounded-lg p-1">
          {(["dual", "indexed"] as ChartMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setChartMode(m)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                chartMode === m
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              {m === "dual" ? "Dual Line" : "Indexed (100)"}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Property type */}
        <div className="flex items-center gap-3 flex-wrap">
          <SectionLabel>Property</SectionLabel>
          <div className="flex gap-2 flex-wrap">
            {(["villa", "apartment"] as PropertyCategory[]).map((c) => (
              <FilterChip
                key={c}
                label={c.charAt(0).toUpperCase() + c.slice(1)}
                active={category === c}
                onClick={() => handleCategoryChange(c)}
              />
            ))}
          </div>
        </div>

        {/* Room count */}
        <div className="flex items-center gap-3 flex-wrap">
          <SectionLabel>Rooms</SectionLabel>
          <div className="flex gap-2 flex-wrap">
            <FilterChip
              label="Any"
              active={rooms === null}
              onClick={() => setRooms(null)}
            />
            {roomOptions.map((r) => {
              const isDisabled = !ALLOWED_ROOMS[category].includes(r);
              return (
                <FilterChip
                  key={r}
                  label={String(r)}
                  active={rooms === r}
                  disabled={isDisabled}
                  onClick={() => setRooms(r)}
                />
              );
            })}
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-3">
          <SectionLabel>Period</SectionLabel>
          <div className="flex gap-2">
            {(["1Y", "3Y", "5Y"] as DateRange[]).map((d) => (
              <FilterChip
                key={d}
                label={d}
                active={dateRange === d}
                onClick={() => setDateRange(d)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[hsl(var(--border))]" />

      {/* Chart area */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--card)/0.7)] backdrop-blur-sm rounded-xl z-10">
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 rounded-full border-2 border-[hsl(var(--accent))] border-t-transparent animate-spin"
              />
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                Fetching data…
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-48 text-sm text-destructive gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
            {error}
          </div>
        )}

        {!error && (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(45,85%,55%)" />
                  <stop offset="100%" stopColor="hsl(40,80%,60%)" />
                </linearGradient>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(160,75%,35%)" />
                  <stop offset="100%" stopColor="hsl(160,65%,45%)" />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.5}
              />

              {chartMode === "dual" && (
                <ReferenceLine
                  y={0}
                  stroke="hsl(var(--border))"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                />
              )}
              {chartMode === "indexed" && (
                <ReferenceLine
                  y={100}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1}
                  strokeDasharray="4 2"
                  label={{
                    value: "Base 100",
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                />
              )}

              <XAxis
                dataKey="year"
                tick={{
                  fontSize: 12,
                  fill: "hsl(var(--muted-foreground))",
                  fontFamily: "Inter, sans-serif",
                }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fontSize: 11,
                  fill: "hsl(var(--muted-foreground))",
                  fontFamily: "Inter, sans-serif",
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  chartMode === "dual" ? `${v}%` : String(v)
                }
                width={48}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                wrapperStyle={{
                  fontSize: "12px",
                  fontFamily: "Inter, sans-serif",
                  paddingTop: "16px",
                  color: "hsl(var(--foreground))",
                }}
                iconType="circle"
                iconSize={8}
              />

              <Line
                type="monotone"
                dataKey={isPriceKey}
                stroke={GOLD}
                strokeWidth={2.5}
                dot={{ r: 4, fill: GOLD, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: GOLD, stroke: "hsl(var(--card))", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey={isRentKey}
                stroke={EMERALD}
                strokeWidth={2.5}
                dot={{ r: 4, fill: EMERALD, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: EMERALD, stroke: "hsl(var(--card))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend strip */}
      <div className="flex items-center gap-6 pt-1">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-8 h-0.5 rounded"
            style={{ background: GOLD }}
          />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            Price Growth
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-8 h-0.5 rounded"
            style={{ background: EMERALD }}
          />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            Rent Growth
          </span>
        </div>
        {data.length > 0 && (
          <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">
            {data.filter((d) => d.price_growth !== null).length} data point
            {data.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}