import { useState, useEffect, useCallback } from "react";
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

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = "all" | "apartment" | "villa";
type RoomCount = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Range = "1 year" | "3 years" | "5 years";

interface MomentumDataPoint {
  month: string;
  yoy_growth: number;
}

interface FetchState {
  data: MomentumDataPoint[];
  loading: boolean;
  error: string | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ROOM_OPTIONS: RoomCount[] = [1, 2, 3, 4, 5, 6, 7];
const RANGE_OPTIONS: Range[] = ["1 year", "3 years", "5 years"];

// Which room counts are valid per property type
const VALID_ROOMS: Record<"apartment" | "villa", RoomCount[]> = {
  apartment: [1, 2, 3, 4],
  villa: [2, 3, 4, 5],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildUrl(
  areaId: number,
  category: Category,
  rooms: RoomCount | null,
  range: Range
): string {
  const base = `/api/areaCharts/rent_intel/rental_momentum?areaId=${areaId}`;
  const catParam = category !== "all" ? `&category=${category}` : "";
  const roomParam = rooms ? `&rooms=${rooms}` : "";
  const rangeParam = range !== "1 year" ? `&range=${range}` : "";
  return `${base}${catParam}${roomParam}${rangeParam}`;
}

function isRoomDisabledForCategory(
  room: RoomCount,
  category: Category
): boolean {
  if (category === "all") return false;
  return !VALID_ROOMS[category].includes(room);
}

function formatMonth(month: string): string {
  // Expects "YYYY-MM" → "Jan '24"
  try {
    const [year, mon] = month.split("-");
    const date = new Date(Number(year), Number(mon) - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  } catch {
    return month;
  }
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[hsl(35,15%,85%)] bg-[hsl(25,20%,98%)] px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-[hsl(210,80%,12%)] mb-1">
        {formatMonth(label)}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-[hsl(210,40%,35%)]">{entry.name}:</span>
          <span
            className={`font-semibold ${
              Number(entry.value) > 0
                ? "text-[hsl(160,75%,35%)]"
                : "text-[hsl(0,84%,60%)]"
            }`}
          >
            {Number(entry.value) > 0 ? "+" : ""}
            {Number(entry.value).toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Dot renderer (green / red based on value) ───────────────────────────────

function ColoredDot(props: any) {
  const { cx, cy, value } = props;
  if (cx === undefined || cy === undefined) return null;
  const fill = value > 0 ? "hsl(160,75%,35%)" : "hsl(0,84%,60%)";
  return <circle cx={cx} cy={cy} r={3} fill={fill} strokeWidth={0} />;
}

// ─── Filter Pills ─────────────────────────────────────────────────────────────

function FilterPill({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "Not available for selected property type" : undefined}
      className={`
        px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 border
        ${
          disabled
            ? "opacity-30 cursor-not-allowed border-[hsl(35,15%,85%)] text-[hsl(210,40%,35%)] bg-transparent"
            : active
            ? "bg-[hsl(210,80%,12%)] text-[hsl(25,15%,96%)] border-[hsl(210,80%,12%)] shadow-sm"
            : "border-[hsl(35,15%,85%)] text-[hsl(210,40%,35%)] bg-transparent hover:border-[hsl(210,80%,12%)] hover:text-[hsl(210,80%,12%)]"
        }
      `}
    >
      {label}
    </button>
  );
}

// ─── Segment Control (Category / Range) ──────────────────────────────────────

function SegmentControl<T extends string>({
  options,
  value,
  onChange,
  labelMap,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  labelMap?: Record<string, string>;
}) {
  return (
    <div className="inline-flex rounded-lg border border-[hsl(35,15%,85%)] bg-[hsl(35,20%,92%)] p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`
            px-3 py-1 rounded-md text-xs font-medium transition-all duration-150
            ${
              value === opt
                ? "bg-[hsl(25,20%,98%)] text-[hsl(210,80%,12%)] shadow-sm"
                : "text-[hsl(210,40%,35%)] hover:text-[hsl(210,80%,12%)]"
            }
          `}
        >
          {labelMap?.[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}

// ─── No-data overlay ─────────────────────────────────────────────────────────

function NoDataOverlay({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(25,20%,98%,0.85)] rounded-xl z-10">
      <svg
        className="w-8 h-8 text-[hsl(35,15%,85%)] mb-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <p className="text-sm text-[hsl(210,40%,35%)] font-medium text-center px-6">
        {message}
      </p>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="animate-pulse space-y-2 h-full">
      {[80, 60, 90, 40, 70, 50, 85].map((h, i) => (
        <div
          key={i}
          className="bg-[hsl(35,20%,92%)] rounded"
          style={{ height: `${h * 0.4}px`, width: `${85 + Math.random() * 10}%` }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface RentalMomentumChartProps {
  areaId?: number;
  areaName?: string;
}

export default function RentalMomentumChart({
  areaId = 409,
  areaName = "Selected Area",
}: RentalMomentumChartProps) {
  const [category, setCategory] = useState<Category>("all");
  const [selectedRoom, setSelectedRoom] = useState<RoomCount | null>(null);
  const [range, setRange] = useState<Range>("1 year");

  // When category changes, clear selectedRoom if it becomes invalid
  useEffect(() => {
    if (
      selectedRoom !== null &&
      category !== "all" &&
      !VALID_ROOMS[category].includes(selectedRoom)
    ) {
      setSelectedRoom(null);
    }
  }, [category, selectedRoom]);

  // Fetch states — one per category line when "all" is chosen
  const [aptState, setAptState] = useState<FetchState>({
    data: [],
    loading: false,
    error: null,
  });
  const [villaState, setVillaState] = useState<FetchState>({
    data: [],
    loading: false,
    error: null,
  });
  const [singleState, setSingleState] = useState<FetchState>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchData = useCallback(
    async (url: string, setter: (s: FetchState) => void) => {
      setter({ data: [], loading: true, error: null });
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setter({ data: json, loading: false, error: null });
      } catch (e: any) {
        setter({ data: [], loading: false, error: e.message ?? "Failed to load" });
      }
    },
    []
  );

  useEffect(() => {
    if (category === "all") {
      fetchData(
        buildUrl(areaId, "apartment", selectedRoom, range),
        setAptState
      );
      fetchData(
        buildUrl(areaId, "villa", selectedRoom, range),
        setVillaState
      );
    } else {
      fetchData(
        buildUrl(areaId, category, selectedRoom, range),
        setSingleState
      );
    }
  }, [areaId, category, selectedRoom, range, fetchData]);

  // ── Merge data for "all" mode ──────────────────────────────────────────────
  const mergedData = (() => {
    if (category !== "all") return singleState.data;

    const months = new Set<string>();
    aptState.data.forEach((d) => months.add(d.month));
    villaState.data.forEach((d) => months.add(d.month));

    return Array.from(months)
      .sort()
      .map((month) => ({
        month,
        apartment:
          aptState.data.find((d) => d.month === month)?.yoy_growth ?? null,
        villa:
          villaState.data.find((d) => d.month === month)?.yoy_growth ?? null,
      }));
  })();

  const isLoading =
    category === "all"
      ? aptState.loading || villaState.loading
      : singleState.loading;

  const hasError =
    category === "all"
      ? aptState.error || villaState.error
      : singleState.error;

  // Detect when "all" + room filter but only one type has that room
  const aptMissing =
    category === "all" &&
    selectedRoom !== null &&
    !VALID_ROOMS.apartment.includes(selectedRoom);
  const villaMissing =
    category === "all" &&
    selectedRoom !== null &&
    !VALID_ROOMS.villa.includes(selectedRoom);

  const singleLineMismatchMessage =
    aptMissing
      ? `Apartments don't have ${selectedRoom}BR — showing Villa data only.`
      : villaMissing
      ? `Villas don't have ${selectedRoom}BR — showing Apartment data only.`
      : null;

  // ── Room selector — disable logic ─────────────────────────────────────────
  function isRoomDisabled(room: RoomCount): boolean {
    if (category === "all") return false;
    return isRoomDisabledForCategory(room, category);
  }

  // ── Determine chart lines ─────────────────────────────────────────────────
  const APARTMENT_COLOR = "hsl(210,80%,45%)";
  const VILLA_COLOR = "hsl(45,85%,48%)";
  const SINGLE_POSITIVE = "hsl(160,75%,35%)";
  const SINGLE_NEGATIVE = "hsl(0,84%,60%)";

  // For single category, we colour the line by net positive/negative overall
  const singleAvg =
    singleState.data.length > 0
      ? singleState.data.reduce((acc, d) => acc + d.yoy_growth, 0) /
        singleState.data.length
      : 0;
  const singleColor = singleAvg >= 0 ? SINGLE_POSITIVE : SINGLE_NEGATIVE;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-[hsl(35,15%,85%)] bg-[hsl(25,20%,98%)] p-5 shadow-[0_10px_40px_-10px_hsl(210,80%,12%,0.15)]">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(45,85%,48%)]">
              Rental
            </span>
          </div>
          <h3 className="font-serif text-lg font-semibold text-[hsl(210,80%,12%)]">
            Rental Momentum
          </h3>
          <p className="text-xs text-[hsl(210,40%,35%)] mt-0.5">
            Year-over-year rent growth · {areaName}
          </p>
        </div>

        {/* Range */}
        <SegmentControl<Range>
          options={RANGE_OPTIONS}
          value={range}
          onChange={(v) => setRange(v)}
          labelMap={{ "1 year": "1Y", "3 years": "3Y", "5 years": "5Y" }}
        />
      </div>

      {/* ── Filters row ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Property type */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-[hsl(210,40%,35%)] font-semibold w-16">
            Type
          </span>
          <SegmentControl
            options={["all", "apartment", "villa"] as Category[]}
            value={category}
            onChange={(v) => setCategory(v)}
            labelMap={{ all: "All", apartment: "Apartment", villa: "Villa" }}
          />
        </div>

        {/* Room count */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-[hsl(210,40%,35%)] font-semibold w-16">
            Rooms
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            <FilterPill
              label="All"
              active={selectedRoom === null}
              onClick={() => setSelectedRoom(null)}
            />
            {ROOM_OPTIONS.map((room) => (
              <FilterPill
                key={room}
                label={`${room}BR`}
                active={selectedRoom === room}
                disabled={isRoomDisabled(room)}
                onClick={() =>
                  setSelectedRoom(selectedRoom === room ? null : room)
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Mismatch notice ──────────────────────────────────────────────── */}
      {singleLineMismatchMessage && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-[hsl(45,85%,55%,0.12)] border border-[hsl(45,85%,55%,0.3)] px-3 py-2">
          <svg
            className="w-3.5 h-3.5 text-[hsl(45,65%,35%)] shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs text-[hsl(45,65%,25%)] font-medium">
            {singleLineMismatchMessage}
          </p>
        </div>
      )}

      {/* ── Chart ──────────────────────────────────────────────────────── */}
      <div className="relative h-80">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <ChartSkeleton />
          </div>
        )}

        {!isLoading && hasError && (
          <NoDataOverlay message="Unable to load rental momentum data. Please try again." />
        )}

        {!isLoading && !hasError && mergedData.length === 0 && (
          <NoDataOverlay message="No data available for the selected filters." />
        )}

        {!isLoading && !hasError && mergedData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={mergedData}
              margin={{ top: 16, right: 12, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(35,15%,88%)"
                vertical={false}
              />
              <ReferenceLine
                y={0}
                stroke="hsl(210,40%,60%)"
                strokeDasharray="4 2"
                strokeWidth={1}
              />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                tick={{
                  fontSize: 10,
                  fill: "hsl(210,40%,45%)",
                  fontFamily: "Inter, sans-serif",
                }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
                tick={{
                  fontSize: 10,
                  fill: "hsl(210,40%,45%)",
                  fontFamily: "Inter, sans-serif",
                }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} />

              {category === "all" ? (
                <>
                  {!aptMissing && (
                    <Line
                      type="monotone"
                      dataKey="apartment"
                      name="Apartment"
                      stroke={APARTMENT_COLOR}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: APARTMENT_COLOR }}
                      connectNulls
                    />
                  )}
                  {!villaMissing && (
                    <Line
                      type="monotone"
                      dataKey="villa"
                      name="Villa"
                      stroke={VILLA_COLOR}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: VILLA_COLOR }}
                      connectNulls
                    />
                  )}
                  {(aptMissing || villaMissing) && (
                    <Legend
                      wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                      formatter={(value) => (
                        <span style={{ color: "hsl(210,40%,35%)" }}>
                          {value}
                        </span>
                      )}
                    />
                  )}
                  {!aptMissing && !villaMissing && (
                    <Legend
                      wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                      formatter={(value) => (
                        <span style={{ color: "hsl(210,40%,35%)" }}>
                          {value}
                        </span>
                      )}
                    />
                  )}
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey="yoy_growth"
                  name={category === "apartment" ? "Apartment" : "Villa"}
                  stroke={singleColor}
                  strokeWidth={2.5}
                  dot={<ColoredDot />}
                  activeDot={{ r: 5 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Legend (single-category) ─────────────────────────────────── */}
      {category !== "all" && !isLoading && mergedData.length > 0 && (
        <div className="mt-3 flex items-center gap-4 justify-end">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 rounded-full bg-[hsl(160,75%,35%)]" />
            <span className="text-[10px] text-[hsl(210,40%,35%)]">
              Positive growth
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 rounded-full bg-[hsl(0,84%,60%)]" />
            <span className="text-[10px] text-[hsl(210,40%,35%)]">
              Negative growth
            </span>
          </div>
        </div>
      )}

      {/* ── Footer note ──────────────────────────────────────────────── */}
      <p className="mt-3 text-[10px] text-[hsl(210,40%,50%)]">
        YoY growth derived from median annual rent · Data reflects trailing
        12-month comparison
      </p>
    </div>
  );
}