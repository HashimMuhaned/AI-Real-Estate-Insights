"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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
import { useDebounce } from "./Usedebounce";
import { buildParams } from "./Buildparams";

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

const RANGE_LABEL: Record<DateRange, string> = {
  "1Y": "1 year",
  "3Y": "3 years",
  "5Y": "5 years",
};

/** Convert flat API data into chart-friendly time series */
function buildChartData(
  data: GrowthDataPoint[],
  range: DateRange,
  mode: ChartMode,
) {
  const yearCount = range === "1Y" ? 1 : range === "3Y" ? 3 : 5;
  const now = new Date().getFullYear();
  const years = Array.from({ length: yearCount + 1 }, (_, i) =>
    String(now - yearCount + i),
  );

  const priceGrowths = data
    .map((d) => parseFloat(d.price_growth ?? ""))
    .filter((v) => !isNaN(v));
  const rentGrowths = data
    .map((d) => parseFloat(d.rent_growth ?? ""))
    .filter((v) => !isNaN(v));

  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const avgPrice = avg(priceGrowths);
  const avgRent = avg(rentGrowths);

  return years.map((year, i) => {
    const fraction = i / yearCount;
    if (mode === "dual") {
      return {
        year,
        "Price Growth (%)": parseFloat((avgPrice * fraction).toFixed(2)),
        "Rent Growth (%)": parseFloat((avgRent * fraction).toFixed(2)),
      };
    }
    return {
      year,
      "Price Index": parseFloat((100 + avgPrice * fraction).toFixed(2)),
      "Rent Index": parseFloat((100 + avgRent * fraction).toFixed(2)),
    };
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
        px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border whitespace-nowrap
        ${
          disabled
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
    <span className="text-[10px] uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))] font-semibold whitespace-nowrap">
      {children}
    </span>
  );
}

function Divider() {
  return (
    <span className="text-[hsl(var(--border))] text-sm select-none">|</span>
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

// ─── AI Insight Component ─────────────────────────────────────────────────────

function AIInsightBox() {
  return (
    <div className="relative rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] px-5 py-4">
      {/* Top-right button */}
      <div className="absolute top-3 right-3">
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[hsl(var(--accent)/0.5)] text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] hover:bg-[hsl(var(--accent)/0.15)] transition-all duration-200"
        >
          {/* Sparkle icon */}
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 1.5L9.2 6.8L14.5 8L9.2 9.2L8 14.5L6.8 9.2L1.5 8L6.8 6.8L8 1.5Z"
              fill="currentColor"
            />
          </svg>
          Ask AI about this chart
        </button>
      </div>

      {/* Label */}
      <div className="flex items-center gap-2 mb-2">
        <svg
          className="w-3.5 h-3.5 text-[hsl(var(--accent))]"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 1.5L9.2 6.8L14.5 8L9.2 9.2L8 14.5L6.8 9.2L1.5 8L6.8 6.8L8 1.5Z"
            fill="currentColor"
          />
        </svg>
        <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[hsl(var(--accent))]">
          AI Insight
        </span>
      </div>

      {/* Insight text */}
      <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed pr-40">
        Price growth in this area has consistently outpaced rent growth over the
        selected period, suggesting strong capital appreciation potential.
        Apartments with 2–3 bedrooms show the highest yield stability, while
        villas above 4 bedrooms display more volatility tied to seasonal demand
        cycles.{" "}
        <button className="text-[hsl(var(--accent))] hover:underline underline-offset-2 font-medium transition-colors duration-150 inline">
          View more insights →
        </button>
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ALLOWED_ROOMS: Record<PropertyCategory, number[]> = {
  apartment: [1, 2, 3, 4],
  villa: [2, 3, 4, 5],
};

const GOLD = "hsl(45, 85%, 55%)";
const EMERALD = "hsl(160, 75%, 35%)";
const ROOM_OPTIONS = Array.from({ length: 7 }, (_, i) => i + 1);

export default function GrowthComparisonChart() {
  // ── Stable area id (URL-derived, never changes) ────────────────────────────
  const areaId = useMemo(() => getAreaIdFromUrl(), []);

  // ── Filter state ───────────────────────────────────────────────────────────
  const [category, setCategory] = useState<PropertyCategory>("villa");
  const [rooms, setRooms] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("1Y");
  const [chartMode, setChartMode] = useState<ChartMode>("dual");

  // ── Debounced filters (only these trigger API calls) ───────────────────────
  const debouncedCategory = useDebounce(category, 400);
  const debouncedRooms = useDebounce(rooms, 400);
  const debouncedRange = useDebounce(dateRange, 400);

  // ── Fetch state (data is NEVER cleared between requests) ──────────────────
  const [data, setData] = useState<GrowthDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AbortController ref – cancelled on every new fetch
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const qs = buildParams({
      areaId,
      category: debouncedCategory,
      rooms: debouncedRooms,
      range: RANGE_LABEL[debouncedRange],
    });

    const url = `/api/areaCharts/growth_comparison${qs ? `?${qs}` : ""}`;

    setLoading(true);
    setError(null);
    // ⚠️  Do NOT call setData([]) here — keeps previous data visible

    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<GrowthDataPoint[]>;
      })
      .then((json) => {
        setData(json);
      })
      .catch((e) => {
        // Ignore abort errors — they're intentional
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [areaId, debouncedCategory, debouncedRooms, debouncedRange]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleCategoryChange(next: PropertyCategory) {
    setCategory(next);
    // Reset room if it's not valid for the new category
    if (rooms !== null && !ALLOWED_ROOMS[next].includes(rooms)) {
      setRooms(null);
    }
  }

  // ── Chart data (depends on chartMode too, so not behind debounce) ─────────
  const chartData = useMemo(
    () => buildChartData(data, dateRange, chartMode),
    [data, dateRange, chartMode],
  );

  const priceKey = chartMode === "dual" ? "Price Growth (%)" : "Price Index";
  const rentKey = chartMode === "dual" ? "Rent Growth (%)" : "Rent Index";

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="luxury-card p-6 space-y-5"
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
          {areaId !== null && (
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

      {/* ── All filters in one row ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Property */}
        <SectionLabel>Property</SectionLabel>
        {(["villa", "apartment"] as PropertyCategory[]).map((c) => (
          <FilterChip
            key={c}
            label={c.charAt(0).toUpperCase() + c.slice(1)}
            active={category === c}
            onClick={() => handleCategoryChange(c)}
          />
        ))}

        <Divider />

        {/* Rooms */}
        <SectionLabel>Rooms</SectionLabel>
        <FilterChip
          label="Any"
          active={rooms === null}
          onClick={() => setRooms(null)}
        />
        {ROOM_OPTIONS.map((r) => (
          <FilterChip
            key={r}
            label={String(r)}
            active={rooms === r}
            disabled={!ALLOWED_ROOMS[category].includes(r)}
            onClick={() => setRooms(r)}
          />
        ))}

        <Divider />

        {/* Period */}
        <SectionLabel>Period</SectionLabel>
        {(["1Y", "3Y", "5Y"] as DateRange[]).map((d) => (
          <FilterChip
            key={d}
            label={d}
            active={dateRange === d}
            onClick={() => setDateRange(d)}
          />
        ))}
      </div>

      {/* AI Insight Box */}
      <AIInsightBox />

      {/* Divider */}
      <div className="h-px bg-[hsl(var(--border))]" />

      {/* Chart area */}
      <div className="relative">
        {/* Subtle overlay spinner – does NOT hide the previous chart */}
        {loading && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-[hsl(var(--card)/0.85)] backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-[hsl(var(--accent))] border-t-transparent animate-spin" />
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
              Updating…
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-48 text-sm text-destructive gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
              />
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
                dataKey={priceKey}
                stroke={GOLD}
                strokeWidth={2.5}
                dot={{ r: 4, fill: GOLD, strokeWidth: 0 }}
                activeDot={{
                  r: 6,
                  fill: GOLD,
                  stroke: "hsl(var(--card))",
                  strokeWidth: 2,
                }}
              />
              <Line
                type="monotone"
                dataKey={rentKey}
                stroke={EMERALD}
                strokeWidth={2.5}
                dot={{ r: 4, fill: EMERALD, strokeWidth: 0 }}
                activeDot={{
                  r: 6,
                  fill: EMERALD,
                  stroke: "hsl(var(--card))",
                  strokeWidth: 2,
                }}
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