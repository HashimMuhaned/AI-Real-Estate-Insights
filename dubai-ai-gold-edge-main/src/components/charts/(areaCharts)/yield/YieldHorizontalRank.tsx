/**
 * YieldChart — Rental Yield Ranked Bar Chart (Updated)
 *
 * Changes:
 * 1. Filters consolidated into a single row
 * 2. Room options are disabled based on property type:
 *    - Apartment: disables rooms 5, 6, 7
 *    - Villa: disables rooms 1, 6, 7
 *    - All + incompatible room: shows a contextual warning
 * 3. AI Insight box added below filters
 */
import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "./Usedebounce";
import { buildParams } from "./Buildparams";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface YieldEntry {
  area_id: number;
  property_category: string;
  rooms: number;
  median_price: number;
  median_rent: number;
  yield_percent: string;
}

export type CategoryFilter = "all" | "villa" | "apartment";
export type RoomsFilter = "all" | number;
type TimeWindow = "1Y" | "3Y" | "5Y";

// ── Constants ─────────────────────────────────────────────────────────────────
const ROOM_OPTIONS = ["all", 1, 2, 3, 4, 5, 6, 7] as const;
const TIME_OPTIONS: TimeWindow[] = ["1Y", "3Y", "5Y"];

// Rooms unavailable per category
const UNAVAILABLE_FOR_APARTMENT = new Set([5, 6, 7]);
const UNAVAILABLE_FOR_VILLA = new Set([1, 6, 7]);

function getAreaIdFromPath(pathname: string): number | null {
  const match = pathname.match(/-(\d+)(?:\/.*)?$/);
  return match ? parseInt(match[1], 10) : null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface PillProps {
  active: boolean;
  variant?: "default" | "villa" | "apartment";
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

function Pill({
  active,
  variant = "default",
  onClick,
  disabled = false,
  children,
}: PillProps) {
  const base =
    "px-3.5 py-1 rounded-full text-xs font-medium border-[1.5px] transition-all duration-200 whitespace-nowrap select-none";

  const disabledStyle =
    "border-[hsl(35,10%,88%)] bg-[hsl(35,10%,94%)] text-[hsl(210,10%,72%)] cursor-not-allowed opacity-50";

  const inactive =
    "border-[hsl(35,15%,85%)] bg-[hsl(25,20%,98%)] text-[hsl(210,40%,35%)] hover:border-[hsl(45,85%,55%)] hover:text-[hsl(210,80%,8%)] cursor-pointer";

  const activeStyles: Record<string, string> = {
    default:
      "border-[hsl(210,80%,12%)] bg-[hsl(210,80%,12%)] text-[hsl(25,15%,96%)] cursor-pointer",
    villa:
      "border-[hsl(210,80%,12%)] bg-[hsl(210,80%,12%)] text-[hsl(25,15%,96%)] cursor-pointer",
    apartment:
      "border-[hsl(160,75%,35%)] bg-[hsl(160,75%,35%)] text-[hsl(25,15%,96%)] cursor-pointer",
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${base} ${disabled ? disabledStyle : active ? activeStyles[variant] : inactive}`}
      title={disabled ? "Not available for this property type" : undefined}
    >
      {children}
    </button>
  );
}

interface BarItemProps {
  entry: YieldEntry;
  maxAxis: number;
  rank: number;
  isTop: boolean;
  delay: number;
}

function BarItem({ entry, maxAxis, isTop, delay }: BarItemProps) {
  const pct = parseFloat(entry.yield_percent);
  const widthPct = (pct / maxAxis) * 100;
  const cat = entry.property_category.toLowerCase() as "villa" | "apartment";

  const fillGradient = isTop
    ? "linear-gradient(90deg, hsl(45,85%,45%) 0%, hsl(40,80%,58%) 100%)"
    : cat === "villa"
      ? "linear-gradient(90deg, hsl(210,80%,12%) 0%, hsl(210,60%,22%) 100%)"
      : "linear-gradient(90deg, hsl(160,75%,32%) 0%, hsl(160,70%,42%) 100%)";

  const tagStyles =
    cat === "villa"
      ? "bg-[hsl(210,80%,12%,0.1)] text-[hsl(210,80%,12%)]"
      : "bg-[hsl(160,75%,35%,0.12)] text-[hsl(160,75%,35%)]";

  return (
    <div
      className="flex items-center gap-3 opacity-0"
      style={{ animation: `fadeSlide 0.35s ease ${delay}s both` }}
    >
      <div className="w-[130px] flex-shrink-0 text-right text-xs font-medium text-[hsl(210,80%,8%)] leading-snug">
        <span
          className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded mb-0.5 ${tagStyles}`}
        >
          {entry.property_category}
        </span>
        <br />
        {entry.rooms} BR
      </div>

      <div className="flex-1 h-8 bg-[hsl(35,20%,92%)] rounded-md overflow-visible relative">
        <div
          className="h-full rounded-md flex items-center relative transition-all duration-500"
          style={{
            width: `${widthPct}%`,
            background: fillGradient,
            minWidth: "4px",
          }}
        >
          <span className="absolute -right-11 text-xs font-bold text-[hsl(210,80%,8%)] whitespace-nowrap">
            {pct.toFixed(2)}
            <span className="text-[hsl(210,40%,35%)] font-normal text-[11px]">
              %
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── AI Insight Box ─────────────────────────────────────────────────────────────
function AIInsightBox() {
  return (
    <div className="mx-7 mb-5 rounded-xl border border-[hsl(45,80%,75%)] bg-[hsl(45,100%,97%)] px-5 py-4 relative">
      {/* Top-right buttons */}
      <div className="absolute top-3.5 right-4 flex items-center gap-2">
        <button className="flex items-center gap-1.5 text-[11px] font-semibold text-[hsl(25,15%,96%)] bg-[hsl(210,80%,12%)] border border-[hsl(210,80%,12%)] px-3 py-1.5 rounded-full hover:bg-[hsl(210,60%,22%)] transition-colors duration-200 whitespace-nowrap">
          {/* Sparkle icon */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            <path
              d="M8 1L9.5 6H14.5L10.5 9.5L12 14.5L8 11L4 14.5L5.5 9.5L1.5 6H6.5L8 1Z"
              fill="hsl(45,85%,60%)"
            />
          </svg>
          Ask AI about this chart
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-2 pr-52">
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 1L9.5 6H14.5L10.5 9.5L12 14.5L8 11L4 14.5L5.5 9.5L1.5 6H6.5L8 1Z"
            fill="hsl(45,85%,50%)"
          />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-[0.9px] text-[hsl(45,75%,38%)]">
          AI Insight
        </span>
      </div>

      {/* Insight text */}
      <p className="text-[13px] text-[hsl(210,40%,25%)] leading-relaxed pr-52">
        Smaller unit types (1–2 BR apartments) tend to generate the highest
        gross yields in this area, driven by stronger rental demand relative to
        purchase price. Villas typically offer lower yields but greater capital
        appreciation potential. Yields above 7% are considered strong for this
        market — compare across room types to identify the best risk-return
        balance for your investment strategy.
      </p>

      {/* View more link */}
      <div className="mt-2.5">
        <button className="text-[12px] font-semibold text-[hsl(210,80%,38%)] underline underline-offset-2 hover:text-[hsl(210,80%,22%)] transition-colors duration-150">
          View more insights →
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function YieldChart() {
  const areaId = useMemo(() => getAreaIdFromPath(window.location.pathname), []);

  const [category, setCategory] = useState<CategoryFilter>("all");
  const [rooms, setRooms] = useState<RoomsFilter>("all");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("1Y");

  const debouncedCategory = useDebounce(category, 400);
  const debouncedRooms = useDebounce(rooms, 400);

  const [data, setData] = useState<YieldEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Room availability logic ────────────────────────────────────────────────
  function isRoomDisabled(r: RoomsFilter): boolean {
    if (r === "all") return false;
    if (category === "apartment") return UNAVAILABLE_FOR_APARTMENT.has(r);
    if (category === "villa") return UNAVAILABLE_FOR_VILLA.has(r);
    return false;
  }

  // When category changes, reset room if it becomes disabled
  useEffect(() => {
    if (rooms !== "all" && isRoomDisabled(rooms)) {
      setRooms("all");
    }
  }, [category]);

  // Warning for "All" category + room that's only available for one type
  const roomWarning: string | null = useMemo(() => {
    if (category !== "all" || rooms === "all") return null;
    const r = rooms as number;
    const notForApartment = UNAVAILABLE_FOR_APARTMENT.has(r);
    const notForVilla = UNAVAILABLE_FOR_VILLA.has(r);
    if (notForApartment && !notForVilla) {
      return `${r} BR is not a typical configuration for apartments. Results will only include villas.`;
    }
    if (notForVilla && !notForApartment) {
      return `${r} BR is not a typical configuration for villas. Results will only include apartments.`;
    }
    return null;
  }, [category, rooms]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!areaId) {
      setError("Could not resolve area ID from the current URL.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const url = buildParams(
      { areaId, category: debouncedCategory, rooms: debouncedRooms },
      true,
    );

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: YieldEntry[] = await res.json();
        const sorted = [...json].sort(
          (a, b) => parseFloat(b.yield_percent) - parseFloat(a.yield_percent),
        );
        setData(sorted);
      } catch (e) {
        if ((e as DOMException).name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [areaId, debouncedCategory, debouncedRooms]);

  // ── Derived display values ────────────────────────────────────────────────
  const maxYield = data.length
    ? Math.max(...data.map((d) => parseFloat(d.yield_percent)))
    : 14;
  const maxAxis = Math.ceil(maxYield / 2) * 2 + 2;
  const ticks = Array.from(
    { length: Math.floor(maxAxis / 2) + 1 },
    (_, i) => i * 2,
  );
  const avg = data.length
    ? data.reduce((s, d) => s + parseFloat(d.yield_percent), 0) / data.length
    : 0;

  const apiUrl = areaId ? buildParams({ areaId, category, rooms }, true) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="bg-[hsl(25,20%,98%)] border border-[hsl(35,15%,85%)] rounded-2xl shadow-[0_10px_40px_-10px_hsl(210_80%_12%/0.15)] overflow-hidden font-sans">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden px-7 pt-6 pb-5"
          style={{
            background:
              "linear-gradient(135deg, hsl(210,80%,12%) 0%, hsl(210,60%,20%) 100%)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(30deg, hsl(45 85% 55% / 0.07) 12%, transparent 12.5%, transparent 87%, hsl(45 85% 55% / 0.07) 87.5%),
                linear-gradient(150deg, hsl(160 75% 35% / 0.07) 12%, transparent 12.5%, transparent 87%, hsl(160 75% 35% / 0.07) 87.5%)
              `,
              backgroundSize: "60px 60px",
            }}
          />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <h2
                className="text-[hsl(25,15%,96%)] text-[22px] font-bold tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Rental Yield Analysis
              </h2>
              <p className="text-[hsl(45,85%,55%)] text-[11px] font-semibold uppercase tracking-[0.8px] mt-1">
                Area {areaId ?? "—"} · Ranked by Gross Yield %
              </p>
            </div>
            <code className="text-[10px] text-[hsl(210,40%,35%)] bg-[hsl(35,25%,88%)] px-2 py-1 rounded border border-[hsl(35,15%,85%)] font-mono">
              {apiUrl ?? "/api/areaCharts/yield?areaId=…"}
            </code>
          </div>
        </div>

        {/* ── Filters — single row ───────────────────────────────────────── */}
        <div className="px-7 py-4 bg-[hsl(35,20%,92%)] border-b border-[hsl(35,15%,85%)] flex flex-wrap gap-x-6 gap-y-3 items-end">
          {/* Property type */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[hsl(210,40%,35%)]">
              Property Type
            </span>
            <div className="flex gap-1.5">
              <Pill
                active={category === "all"}
                onClick={() => setCategory("all")}
              >
                All
              </Pill>
              <Pill
                active={category === "villa"}
                variant="villa"
                onClick={() => setCategory("villa")}
              >
                Villa
              </Pill>
              <Pill
                active={category === "apartment"}
                variant="apartment"
                onClick={() => setCategory("apartment")}
              >
                Apartment
              </Pill>
            </div>
          </div>

          {/* Rooms */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[hsl(210,40%,35%)]">
              Rooms
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {ROOM_OPTIONS.map((r) => {
                const disabled = isRoomDisabled(r);
                return (
                  <Pill
                    key={r}
                    active={rooms === r}
                    disabled={disabled}
                    onClick={() => !disabled && setRooms(r)}
                  >
                    {r === "all" ? "All" : r}
                  </Pill>
                );
              })}
            </div>
          </div>

          {/* Time window */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[hsl(210,40%,35%)]">
              Time Window
            </span>
            <div className="flex gap-1.5">
              {TIME_OPTIONS.map((t) => (
                <Pill
                  key={t}
                  active={timeWindow === t}
                  onClick={() => setTimeWindow(t)}
                >
                  {t}
                </Pill>
              ))}
            </div>
          </div>
        </div>

        {/* ── Room warning banner ────────────────────────────────────────── */}
        {roomWarning && (
          <div className="mx-7 mt-4 flex items-start gap-2.5 bg-[hsl(38,100%,95%)] border border-[hsl(38,90%,78%)] rounded-lg px-4 py-3">
            <svg
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0 mt-px"
            >
              <path
                d="M8 1.5L14.5 13H1.5L8 1.5Z"
                stroke="hsl(38,90%,45%)"
                strokeWidth="1.4"
                fill="hsl(38,100%,90%)"
              />
              <path
                d="M8 6V9"
                stroke="hsl(38,90%,35%)"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <circle cx="8" cy="11" r="0.7" fill="hsl(38,90%,35%)" />
            </svg>
            <p className="text-[12px] text-[hsl(38,70%,28%)] leading-relaxed font-medium">
              {roomWarning}
            </p>
          </div>
        )}

        {/* ── AI Insight Box ─────────────────────────────────────────────── */}
        <div className={roomWarning ? "mt-3" : "mt-5"}>
          <AIInsightBox />
        </div>

        {/* ── Chart body ─────────────────────────────────────────────────── */}
        <div className="px-7 pt-2 pb-7">
          {/* Legend + loading indicator row */}
          <div className="flex gap-5 justify-between items-center mb-4">
            <div>
              {loading && (
                <div className="flex items-center gap-2 text-[11px] text-[hsl(210,40%,35%)]">
                  <div
                    className="w-3.5 h-3.5 rounded-full border-[2px] border-[hsl(35,15%,85%)] border-t-[hsl(45,85%,55%)] flex-shrink-0"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                  Updating…
                </div>
              )}
            </div>
            <div className="flex gap-5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[hsl(210,40%,35%)]">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-[hsl(210,80%,12%)] inline-block" />
                Villa
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[hsl(210,40%,35%)]">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-[hsl(160,75%,35%)] inline-block" />
                Apartment
              </div>
            </div>
          </div>

          {error ? (
            <div className="flex items-center justify-center h-48 text-sm text-red-500">
              Error: {error}
            </div>
          ) : data.length === 0 && !loading ? (
            <div className="flex items-center justify-center h-48 text-sm text-[hsl(210,40%,35%)]">
              No data matches the selected filters.
            </div>
          ) : (
            <div
              className="flex flex-col gap-2.5 transition-opacity duration-200"
              style={{ opacity: loading ? 0.5 : 1 }}
            >
              {data.map((entry, i) => (
                <BarItem
                  key={`${entry.property_category}-${entry.rooms}`}
                  entry={entry}
                  maxAxis={maxAxis}
                  rank={i + 1}
                  isTop={i === 0}
                  delay={i * 0.06}
                />
              ))}
            </div>
          )}

          {/* X-axis */}
          {!error && data.length > 0 && (
            <div className="flex justify-between ml-[154px] mt-3.5 pr-12">
              {ticks.map((t) => (
                <span
                  key={t}
                  className="text-[10px] text-[hsl(210,40%,35%)] font-medium"
                >
                  {t}%
                </span>
              ))}
            </div>
          )}

          {/* Summary cards */}
          {!error && data.length > 0 && (
            <div className="flex gap-4 mt-5 pt-5 border-t border-[hsl(35,15%,85%)]">
              <div className="flex-1 bg-[hsl(35,20%,92%)] rounded-xl p-3 px-4 border border-[hsl(35,15%,85%)]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.7px] text-[hsl(210,40%,35%)] mb-1">
                  Highest Yield
                </div>
                <div
                  className="text-[20px] font-bold text-[hsl(45,85%,55%)]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {maxYield.toFixed(2)}%
                </div>
              </div>
              <div className="flex-1 bg-[hsl(35,20%,92%)] rounded-xl p-3 px-4 border border-[hsl(35,15%,85%)]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.7px] text-[hsl(210,40%,35%)] mb-1">
                  Avg Yield
                </div>
                <div
                  className="text-[20px] font-bold text-[hsl(210,80%,8%)]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {avg.toFixed(2)}%
                </div>
              </div>
              <div className="flex-1 bg-[hsl(35,20%,92%)] rounded-xl p-3 px-4 border border-[hsl(35,15%,85%)]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.7px] text-[hsl(210,40%,35%)] mb-1">
                  Listings Shown
                </div>
                <div
                  className="text-[20px] font-bold text-[hsl(160,75%,35%)]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {data.length}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
