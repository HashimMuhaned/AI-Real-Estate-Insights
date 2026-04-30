/**
 * YieldChart — Rental Yield Ranked Bar Chart
 *
 * Reads the area ID from the current URL slug ending in "-{id}":
 *   e.g. /locations/al-barsha-south-fourth-441  →  areaId = 441
 *
 * If you are using Next.js App Router, replace:
 *   const areaId = getAreaIdFromPath(window.location.pathname);
 * with:
 *   const params = useParams();
 *   const areaId = getAreaIdFromPath(\`/\${params.slug}\`);
 *
 * If you are using React Router v6, replace with:
 *   const { slug } = useParams();
 *   const areaId = getAreaIdFromPath(\`/\${slug}\`);
 */
import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface YieldEntry {
  area_id: number;
  property_category: string;
  rooms: number;
  median_price: number;
  median_rent: number;
  yield_percent: string;
}

type CategoryFilter = "all" | "villa" | "apartment";
type RoomsFilter = "all" | number;
type TimeWindow = "1Y" | "3Y" | "5Y";

// ── Constants ─────────────────────────────────────────────────────────────────
const ROOM_OPTIONS = ["all", 1, 2, 3, 4, 5, 6, 7] as const;
const TIME_OPTIONS: TimeWindow[] = ["1Y", "3Y", "5Y"];

/**
 * Extracts the numeric area ID from the current route.
 * Expects a slug ending in "-{id}", e.g. /locations/al-barsha-south-fourth-441
 * Returns null if no numeric suffix is found.
 */
function getAreaIdFromPath(pathname: string): number | null {
  const match = pathname.match(/-(\d+)(?:\/.*)?$/);
  return match ? parseInt(match[1], 10) : null;
}

function buildUrl(
  areaId: number,
  category: CategoryFilter,
  rooms: RoomsFilter,
): string {
  let url = `/api/areaCharts/yield?areaId=${areaId}`;
  if (category !== "all") url += `&category=${category}`;
  if (rooms !== "all") url += `&rooms=${rooms}`;
  return url;
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface PillProps {
  active: boolean;
  variant?: "default" | "villa" | "apartment";
  onClick: () => void;
  children: React.ReactNode;
}

function Pill({ active, variant = "default", onClick, children }: PillProps) {
  const base =
    "px-3.5 py-1 rounded-full text-xs font-medium border-[1.5px] cursor-pointer transition-all duration-200 whitespace-nowrap select-none";

  const inactive = "border-[hsl(35,15%,85%)] bg-[hsl(25,20%,98%)] text-[hsl(210,40%,35%)] hover:border-[hsl(45,85%,55%)] hover:text-[hsl(210,80%,8%)]";

  const activeStyles: Record<string, string> = {
    default: "border-[hsl(210,80%,12%)] bg-[hsl(210,80%,12%)] text-[hsl(25,15%,96%)]",
    villa: "border-[hsl(210,80%,12%)] bg-[hsl(210,80%,12%)] text-[hsl(25,15%,96%)]",
    apartment: "border-[hsl(160,75%,35%)] bg-[hsl(160,75%,35%)] text-[hsl(25,15%,96%)]",
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${active ? activeStyles[variant] : inactive}`}
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
      style={{
        animation: `fadeSlide 0.35s ease ${delay}s both`,
      }}
    >
      {/* Label */}
      <div className="w-[130px] flex-shrink-0 text-right text-xs font-medium text-[hsl(210,80%,8%)] leading-snug">
        <span
          className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded mb-0.5 ${tagStyles}`}
        >
          {entry.property_category}
        </span>
        <br />
        {entry.rooms} BR
      </div>

      {/* Track */}
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
            <span className="text-[hsl(210,40%,35%)] font-normal text-[11px]">%</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function YieldChart() {
  const [data, setData] = useState<YieldEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<CategoryFilter>("all");
  const [rooms, setRooms] = useState<RoomsFilter>("all");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("1Y");

  // Extract area ID from the current route, e.g. /locations/al-barsha-south-fourth-441
  const areaId = getAreaIdFromPath(window.location.pathname);
  const apiUrl = areaId ? buildUrl(areaId, category, rooms) : null;

  const fetchData = useCallback(async () => {
    if (!areaId) {
      setError("Could not resolve area ID from the current URL.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl!);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: YieldEntry[] = await res.json();
      // Sort DESC by yield
      const sorted = [...json].sort(
        (a, b) => parseFloat(b.yield_percent) - parseFloat(a.yield_percent)
      );
      setData(sorted);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, areaId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // X-axis
  const maxYield = data.length
    ? Math.max(...data.map((d) => parseFloat(d.yield_percent)))
    : 14;
  const maxAxis = Math.ceil(maxYield / 2) * 2 + 2;
  const ticks = Array.from({ length: Math.floor(maxAxis / 2) + 1 }, (_, i) => i * 2);

  const avg = data.length
    ? data.reduce((s, d) => s + parseFloat(d.yield_percent), 0) / data.length
    : 0;

  return (
    <>
      {/* Keyframe injection */}
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
          style={{ background: "linear-gradient(135deg, hsl(210,80%,12%) 0%, hsl(210,60%,20%) 100%)" }}
        >
          {/* Geometric pattern overlay */}
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

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="px-7 py-5 bg-[hsl(35,20%,92%)] border-b border-[hsl(35,15%,85%)] flex flex-wrap gap-5 items-center">

          {/* Property type */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[hsl(210,40%,35%)]">
              Property Type
            </span>
            <div className="flex gap-1.5">
              <Pill active={category === "all"} onClick={() => setCategory("all")}>All</Pill>
              <Pill active={category === "villa"} variant="villa" onClick={() => setCategory("villa")}>Villa</Pill>
              <Pill active={category === "apartment"} variant="apartment" onClick={() => setCategory("apartment")}>Apartment</Pill>
            </div>
          </div>

          {/* Rooms */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[hsl(210,40%,35%)]">
              Rooms
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {ROOM_OPTIONS.map((r) => (
                <Pill
                  key={r}
                  active={rooms === r}
                  onClick={() => setRooms(r)}
                >
                  {r === "all" ? "All" : r}
                </Pill>
              ))}
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

        {/* ── Chart body ─────────────────────────────────────────────────── */}
        <div className="px-7 pt-6 pb-7">

          {/* Legend */}
          <div className="flex gap-5 justify-end mb-4">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[hsl(210,40%,35%)]">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[hsl(210,80%,12%)] inline-block" />
              Villa
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[hsl(210,40%,35%)]">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[hsl(160,75%,35%)] inline-block" />
              Apartment
            </div>
          </div>

          {/* Bars */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-sm text-[hsl(210,40%,35%)]">
              <div
                className="w-7 h-7 rounded-full border-[2.5px] border-[hsl(35,15%,85%)] border-t-[hsl(45,85%,55%)]"
                style={{ animation: "spin 0.8s linear infinite" }}
              />
              Loading yields…
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-48 text-sm text-red-500">
              Error: {error}
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-[hsl(210,40%,35%)]">
              No data matches the selected filters.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
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
          {!loading && !error && data.length > 0 && (
            <div className="flex justify-between ml-[154px] mt-3.5 pr-12">
              {ticks.map((t) => (
                <span key={t} className="text-[10px] text-[hsl(210,40%,35%)] font-medium">
                  {t}%
                </span>
              ))}
            </div>
          )}

          {/* Summary cards */}
          {!loading && !error && data.length > 0 && (
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