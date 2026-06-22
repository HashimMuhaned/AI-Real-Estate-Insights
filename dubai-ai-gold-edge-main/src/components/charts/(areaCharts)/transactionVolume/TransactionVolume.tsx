// components/VolumeChart.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useDebounce } from "./useDebounce";
import { buildParams } from "./buildParams";

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

// ─── Design tokens ────────────────────────────────────────────────────────────

const T = {
  primary:      "hsl(210, 80%, 12%)",
  primaryLight: "hsl(210, 60%, 20%)",
  accent:       "hsl(45, 85%, 55%)",
  accentDark:   "hsl(40, 70%, 30%)",
  emerald:      "hsl(160, 75%, 35%)",
  background:   "hsl(25, 15%, 96%)",
  card:         "hsl(25, 20%, 98%)",
  muted:        "hsl(35, 20%, 92%)",
  border:       "hsl(35, 15%, 85%)",
  mutedFg:      "hsl(210, 40%, 35%)",
  foreground:   "hsl(210, 80%, 8%)",
};

// ─── Room availability rules ─────────────────────────────────────────────────

// Rooms NOT available for each property type
const DISABLED_ROOMS: Record<"Apartment" | "Villa", number[]> = {
  Apartment: [5, 6, 7],
  Villa:     [1, 6, 7],
};

// Which property type does NOT support a given room number
function getUnsupportedTypes(room: number): string[] {
  const types: string[] = [];
  if (DISABLED_ROOMS.Apartment.includes(room)) types.push("Apartment");
  if (DISABLED_ROOMS.Villa.includes(room))     types.push("Villa");
  return types;
}

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
      <p className="font-semibold mb-2 text-xs tracking-widest uppercase" style={{ color: T.mutedFg }}>
        {label}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ background: entry.color }} />
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
  disabled?: boolean;
  onClick: () => void;
}

const Pill = ({ label, active, disabled = false, onClick }: PillProps) => {
  const [hovered, setHovered] = useState(false);

  const activeStyle = {
    background: `linear-gradient(135deg, ${T.primary}, ${T.primaryLight})`,
    borderColor: T.primaryLight,
    color: "hsl(25,15%,96%)",
    boxShadow: "0 4px 14px -4px hsl(210 80% 12% / 0.3)",
    opacity: 1,
    cursor: "pointer",
  };
  const disabledStyle = {
    background: "transparent",
    borderColor: "hsl(35,15%,88%)",
    color: "hsl(210,20%,72%)",
    boxShadow: "none",
    opacity: 0.55,
    cursor: "not-allowed",
    textDecoration: "line-through",
  };
  const hoverStyle  = { background: "transparent", borderColor: T.accent,  color: T.primary,  boxShadow: "none", opacity: 1, cursor: "pointer" };
  const idleStyle   = { background: "transparent", borderColor: T.border,  color: T.mutedFg,  boxShadow: "none", opacity: 1, cursor: "pointer" };

  const computedStyle = disabled
    ? disabledStyle
    : active
    ? activeStyle
    : hovered
    ? hoverStyle
    : idleStyle;

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 border"
      style={computedStyle}
    >
      {label}
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VolumeChart() {
  const [areaId] = useState<string>(getAreaIdFromUrl);
  const [data, setData]       = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Raw (immediate) filter state
  const [category, setCategory] = useState<PropertyCategory>("");
  const [rooms, setRooms]       = useState<number | "">("");
  const [range, setRange]       = useState<RangeOption>("3 years");

  // Debounced versions — API calls only fire when these settle
  const debouncedCategory = useDebounce(category, 350);
  const debouncedRooms    = useDebounce(rooms, 350);
  const debouncedRange    = useDebounce(range, 350);

  const rangeOptions: RangeOption[] = ["1 years", "3 years", "5 years"];
  const rangeLabels: Record<RangeOption, string> = {
    "1 years": "1Y",
    "3 years": "3Y",
    "5 years": "5Y",
  };
  const roomOptions = Array.from({ length: 7 }, (_, i) => i + 1);

  // Stable retry ref
  const retryCount = useRef(0);
  const [, forceRetry] = useState(0);
  const handleRetry = useCallback(() => {
    retryCount.current += 1;
    forceRetry((n) => n + 1);
  }, []);

  // ── Auto-clear room if it becomes disabled when category changes ──
  const handleCategoryChange = (val: PropertyCategory) => {
    setCategory(val);
    if (val !== "" && rooms !== "") {
      const disabledForType = DISABLED_ROOMS[val as "Apartment" | "Villa"];
      if (disabledForType.includes(rooms as number)) {
        setRooms("");
      }
    }
  };

  // ── Room conflict warning (only relevant when category === "") ──
  const roomConflictWarning: string | null = (() => {
    if (category !== "" || rooms === "") return null;
    const unsupported = getUnsupportedTypes(rooms as number);
    if (unsupported.length === 0) return null;
    return `Room ${rooms} is not available for ${unsupported.join(" or ")} properties. Results will only include ${unsupported.includes("Apartment") ? "Villa" : "Apartment"} data.`;
  })();

  useEffect(() => {
    const controller = new AbortController();

    const params = buildParams({
      areaId,
      category: debouncedCategory,
      rooms: debouncedRooms,
      range: debouncedRange,
    });

    setLoading(true);
    setError(null);

    fetch(`/api/areaCharts/transaction_volume?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<RawRecord[]>;
      })
      .then((json) => {
        const mapped: ChartPoint[] = json.map((r) => ({
          month: formatMonth(r.month),
          transaction_count: Number(r.transaction_count),
          volume_3m_avg: Math.round(Number(r.volume_3m_avg)),
        }));
        setData(mapped);
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setError(err.message ?? "Failed to load data");
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [areaId, debouncedCategory, debouncedRooms, debouncedRange, retryCount.current]);

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
          <p className="text-xs font-bold tracking-[0.18em] uppercase mb-1" style={{ color: T.accent }}>
            Area · {areaId}
          </p>
          <h2
            className="text-2xl font-bold tracking-tight leading-tight"
            style={{ color: T.primary, fontFamily: "'Playfair Display', serif" }}
          >
            Transaction Volume
          </h2>
          <p className="text-sm mt-1" style={{ color: T.mutedFg }}>
            Monthly transactions with 3-month rolling average
          </p>
        </div>
        <div
          className="w-1 self-stretch rounded-full hidden sm:block"
          style={{
            background: `linear-gradient(180deg, ${T.accent}, hsl(40,80%,60%))`,
            minHeight: 56,
          }}
        />
      </div>

      {/* ── Filter Panel — single row ── */}
      <div
        className="rounded-xl px-4 py-3 mb-2 flex flex-wrap items-center gap-x-5 gap-y-2"
        style={{ background: T.muted, border: `1px solid ${T.border}` }}
      >
        {/* Property */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="text-xs font-semibold uppercase tracking-widest mr-1 shrink-0"
            style={{ color: T.mutedFg }}
          >
            Property
          </span>
          <Pill label="All"       active={category === ""}          onClick={() => handleCategoryChange("")} />
          <Pill label="Apartment" active={category === "Apartment"} onClick={() => handleCategoryChange("Apartment")} />
          <Pill label="Villa"     active={category === "Villa"}     onClick={() => handleCategoryChange("Villa")} />
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px self-stretch" style={{ background: T.border }} />

        {/* Rooms */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-xs font-semibold uppercase tracking-widest mr-1 shrink-0"
            style={{ color: T.mutedFg }}
          >
            Rooms
          </span>
          <Pill label="All" active={rooms === ""} onClick={() => setRooms("")} />
          {roomOptions.map((r) => {
            const isDisabled =
              category !== ""
                ? DISABLED_ROOMS[category as "Apartment" | "Villa"].includes(r)
                : false;
            return (
              <Pill
                key={r}
                label={String(r)}
                active={rooms === r}
                disabled={isDisabled}
                onClick={() => setRooms(r)}
              />
            );
          })}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px self-stretch" style={{ background: T.border }} />

        {/* Range */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="text-xs font-semibold uppercase tracking-widest mr-1 shrink-0"
            style={{ color: T.mutedFg }}
          >
            Range
          </span>
          {rangeOptions.map((opt) => (
            <Pill key={opt} label={rangeLabels[opt]} active={range === opt} onClick={() => setRange(opt)} />
          ))}
        </div>
      </div>

      {/* ── Room Conflict Warning ── */}
      {roomConflictWarning && (
        <div
          className="flex items-start gap-2 rounded-lg px-3.5 py-2.5 mb-3 text-xs"
          style={{
            background: "hsl(38,90%,95%)",
            border: "1px solid hsl(38,80%,78%)",
            color: "hsl(32,70%,28%)",
          }}
        >
          <svg
            className="shrink-0 mt-0.5"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 1.5L1 14.5h14L8 1.5z"
              stroke="hsl(32,70%,38%)"
              strokeWidth="1.4"
              strokeLinejoin="round"
              fill="hsl(38,90%,85%)"
            />
            <path d="M8 6v4" stroke="hsl(32,70%,28%)" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="0.75" fill="hsl(32,70%,28%)" />
          </svg>
          <span className="font-medium leading-relaxed">{roomConflictWarning}</span>
        </div>
      )}

      {/* ── Active Filter Badges ── */}
      <div className="flex flex-wrap gap-2 mb-4 min-h-[24px]">
        {category && (
          <span
            className="text-xs px-2.5 py-1 rounded-md font-semibold capitalize"
            style={{ background: "hsl(210,80%,12%,0.07)", color: T.primary, border: "1px solid hsl(210,80%,12%,0.12)" }}
          >
            {category}
          </span>
        )}
        {rooms !== "" && (
          <span
            className="text-xs px-2.5 py-1 rounded-md font-semibold"
            style={{ background: "hsl(210,80%,12%,0.07)", color: T.primary, border: "1px solid hsl(210,80%,12%,0.12)" }}
          >
            {rooms} room{rooms !== 1 ? "s" : ""}
          </span>
        )}
        <span
          className="text-xs px-2.5 py-1 rounded-md font-semibold"
          style={{ background: "hsl(45,85%,55%,0.12)", color: T.accentDark, border: "1px solid hsl(45,85%,55%,0.25)" }}
        >
          {rangeLabels[range]}
        </span>

        {loading && (
          <span
            className="text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5"
            style={{ background: "hsl(45,85%,55%,0.08)", color: T.accentDark, border: "1px solid hsl(45,85%,55%,0.2)" }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full border border-current animate-spin inline-block"
              style={{ borderRightColor: "transparent" }}
            />
            Updating…
          </span>
        )}
      </div>

      {/* ── AI Insight Box ── */}
      <div
        className="rounded-xl p-4 mb-5"
        style={{
          background: `linear-gradient(135deg, hsl(210,60%,97%), hsl(45,60%,97%))`,
          border: `1px solid hsl(210,40%,88%)`,
        }}
      >
        {/* Box header */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.primaryLight})` }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v2M6 9v2M1 6h2M9 6h2M2.93 2.93l1.41 1.41M7.66 7.66l1.41 1.41M2.93 9.07l1.41-1.41M7.66 4.34l1.41-1.41" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: T.primary }}
            >
              AI Insight
            </span>
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border"
            style={{
              background: `linear-gradient(135deg, ${T.primary}, ${T.primaryLight})`,
              borderColor: T.primaryLight,
              color: "hsl(25,15%,96%)",
              boxShadow: "0 3px 10px -3px hsl(210 80% 12% / 0.35)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v2M6 9v2M1 6h2M9 6h2M2.93 2.93l1.41 1.41M7.66 7.66l1.41 1.41M2.93 9.07l1.41-1.41M7.66 4.34l1.41-1.41" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Ask AI about this chart
          </button>
        </div>

        {/* Insight text */}
        <p
          className="text-sm leading-relaxed"
          style={{ color: T.mutedFg, fontFamily: "'Inter', sans-serif" }}
        >
          Transaction volume in this area has shown consistent seasonal peaks in Q1 and Q3, driven primarily by apartment demand. The 3-month rolling average smooths short-term noise and reveals a moderate upward trend over the past two years, suggesting growing buyer interest. Villa transactions remain lower in absolute count but show stronger month-over-month growth rates in recent quarters.
        </p>

        {/* View more insights link */}
        <div className="mt-2.5">
          <button
            className="text-xs font-semibold inline-flex items-center gap-1 transition-all duration-150"
            style={{ color: T.accentDark, textDecoration: "underline", textUnderlineOffset: "3px" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = T.primary;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = T.accentDark;
            }}
          >
            View more insights
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Error State ── */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center h-72 gap-2">
          <span className="text-sm font-medium text-red-500">{error}</span>
          <button onClick={handleRetry} className="text-xs underline underline-offset-2" style={{ color: T.accent }}>
            Retry
          </button>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && data.length === 0 && (
        <div className="flex items-center justify-center h-72">
          <span className="text-sm" style={{ color: T.mutedFg }}>No data for selected filters</span>
        </div>
      )}

      {/* ── Chart ── */}
      {!error && data.length > 0 && (
        <div style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.2s ease" }}>
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="hsl(210,80%,22%)" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="hsl(210,60%,30%)" stopOpacity={0.6} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 4" stroke={T.border} vertical={false} />

              <XAxis
                dataKey="month"
                tick={{ fill: T.mutedFg, fontSize: 11, fontFamily: "'Inter', sans-serif" }}
                axisLine={false} tickLine={false} interval="preserveStartEnd"
              />
              <YAxis yAxisId="left"  tick={{ fill: T.mutedFg, fontSize: 11, fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} tickFormatter={formatCount} width={44} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: T.mutedFg, fontSize: 11, fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} tickFormatter={formatCount} width={44} />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(210,80%,12%,0.04)" }} />

              <Legend
                wrapperStyle={{ paddingTop: 16 }}
                formatter={(value) => (
                  <span style={{ fontSize: 12, color: T.mutedFg, fontFamily: "'Inter', sans-serif" }}>
                    {value === "transaction_count" ? "Transactions" : "3M Rolling Avg"}
                  </span>
                )}
              />

              <Bar   yAxisId="left"  dataKey="transaction_count" fill="url(#barGrad)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Line  yAxisId="right" type="monotone" dataKey="volume_3m_avg" stroke={T.accent} strokeWidth={2.5} dot={false}
                activeDot={{ r: 5, fill: T.accent, stroke: T.card, strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: `1px solid ${T.border}` }}>
        <p className="text-xs" style={{ color: "hsl(210,40%,60%)" }}>
          /api/areaCharts/volume · Area {areaId}
        </p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: T.mutedFg }}>
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "hsl(210,80%,22%)" }} />
            Transactions
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: T.mutedFg }}>
            <span className="w-5 h-0.5 inline-block rounded-full" style={{ background: T.accent }} />
            3M Avg
          </span>
        </div>
      </div>
    </div>
  );
}