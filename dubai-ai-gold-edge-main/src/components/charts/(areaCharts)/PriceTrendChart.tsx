"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Sparkles, ArrowUpRight } from "lucide-react";

interface RawDataPoint {
  month: string;
  property_category: string;
  rooms: number;
  median_price: number;
}

interface ChartPoint {
  date: string;
  apartmentMedian: number | null;
  villaMedian: number | null;
}

type PropertyFilter = "Apartment" | "Villa" | "Both";
type DateRangeLabel = "1Y" | "3Y" | "5Y";

const ROOM_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

const DATE_RANGES: { label: DateRangeLabel; years: number }[] = [
  { label: "1Y", years: 1 },
  { label: "3Y", years: 3 },
  { label: "5Y", years: 5 },
];

const PROPERTY_OPTIONS: PropertyFilter[] = ["Apartment", "Villa", "Both"];

const APT_COLOR = "#2563eb";
const VILLA_COLOR = "#ea580c";

function extractAreaId(pathname: string): string | null {
  const match = pathname.match(/-(\d+)(?:\/.*)?$/);
  return match ? match[1] : null;
}

function formatShort(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return `${value}`;
}

function formatFull(value: number): string {
  return `AED ${formatShort(value)}`;
}

function toMonthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AE", {
    month: "short",
    year: "2-digit",
  });
}

function buildMap(
  data: RawDataPoint[],
  room: number,
  cutoff: Date,
): Map<string, number> {
  return new Map(
    data
      .filter((d) => d.rooms === room && new Date(d.month) >= cutoff)
      .map((d) => [d.month, d.median_price]),
  );
}

function fetchCategory(
  areaId: string,
  category: "apartment" | "villa",
): Promise<RawDataPoint[]> {
  return fetch(
    `http://localhost:3000/api/areaCharts/price_trend?areaId=${areaId}&category=${category}`,
  ).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status} (${category})`);
    return r.json();
  });
}

function CustomTooltip({
  active,
  payload,
  label,
  filter,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  filter: PropertyFilter;
}) {
  if (!active || !payload?.length) return null;
  const apt = payload.find(
    (p) => p.dataKey === "apartmentMedian" && p.value != null,
  );
  const villa = payload.find(
    (p) => p.dataKey === "villaMedian" && p.value != null,
  );

  return (
    <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-xl min-w-[190px] font-sans">
      <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2.5">
        {label}
      </p>
      {apt && (filter === "Apartment" || filter === "Both") && (
        <div className="flex items-center justify-between gap-5 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
            <span className="text-[11px] text-slate-500">Apartment</span>
          </div>
          <span className="text-sm font-bold text-blue-600">
            {formatFull(apt.value)}
          </span>
        </div>
      )}
      {villa && (filter === "Villa" || filter === "Both") && (
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600 shrink-0" />
            <span className="text-[11px] text-slate-500">Villa</span>
          </div>
          <span className="text-sm font-bold text-orange-600">
            {formatFull(villa.value)}
          </span>
        </div>
      )}
    </div>
  );
}

function RoomPill({
  room,
  active,
  disabled,
  missingApt,
  missingVilla,
  filter,
  onClick,
}: {
  room: number;
  active: boolean;
  disabled: boolean;
  missingApt: boolean;
  missingVilla: boolean;
  filter: PropertyFilter;
  onClick: () => void;
}) {
  let title = "";
  if (disabled) {
    if (filter === "Apartment") title = "No apartment data for this room count";
    else if (filter === "Villa") title = "No villa data for this room count";
    else title = "No data for this room count";
  } else if (filter === "Both" && (missingApt || missingVilla)) {
    title = `No ${missingApt ? "apartment" : "villa"} data — only one line will show`;
  }

  return (
    <div className="relative group">
      <button
        onClick={disabled ? undefined : onClick}
        className={[
          "relative px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 whitespace-nowrap border-none select-none",
          disabled
            ? "opacity-30 cursor-not-allowed text-slate-400 bg-transparent"
            : active
              ? "bg-amber-400 text-[hsl(210,80%,12%)] font-bold cursor-pointer"
              : "bg-transparent text-slate-500 cursor-pointer hover:bg-stone-200",
          !disabled &&
          !active &&
          filter === "Both" &&
          (missingApt || missingVilla)
            ? "ring-1 ring-amber-400"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {room}
        {!disabled && filter === "Both" && (missingApt || missingVilla) && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-white" />
        )}
      </button>
      {title && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-slate-800 text-white text-[10px] rounded-lg px-3 py-1.5 whitespace-nowrap max-w-[200px] text-center leading-snug shadow-xl">
            {title}
          </div>
          <div className="w-2 h-2 bg-slate-800 rotate-45 mx-auto -mt-1" />
        </div>
      )}
    </div>
  );
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1 rounded-md text-xs transition-all duration-150 whitespace-nowrap cursor-pointer border-none ${
        active
          ? "bg-[hsl(210,80%,12%)] text-[hsl(25,15%,96%)] font-bold"
          : "bg-transparent text-slate-500 font-medium hover:bg-stone-200"
      }`}
    >
      {label}
    </button>
  );
}

function AIInsightsPanel() {
  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 overflow-hidden shadow-sm">
      {/* Header: icon + title + Ask AI button top-right */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-100/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <p className="text-[13px] font-semibold text-slate-700 leading-none">
            AI Insights
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer border-none shadow-sm">
          <Sparkles className="w-3 h-3" />
          Ask AI about this chart
        </button>
      </div>

      {/* Static insight text + view more link */}
      <div className="px-5 py-4 space-y-3">
        <p className="text-[13px] text-slate-600 leading-relaxed m-0">
          Dubai residential prices have shown resilience across both apartments
          and villas, driven by sustained demand from international buyers and
          limited prime inventory. Historically, 2-3 bedroom units in
          established areas have delivered the strongest capital appreciation.
          Monitoring short-term rolling trends is recommended before committing
          to a purchase decision.
        </p>
        <button className="flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer border-none bg-transparent underline-offset-2 hover:underline p-0">
          View more insights
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function PriceTrendChart() {
  const pathname = usePathname();
  const areaId = extractAreaId(pathname ?? "");

  const [aptData, setAptData] = useState<RawDataPoint[]>([]);
  const [villaData, setVillaData] = useState<RawDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedRoom, setSelectedRoom] = useState<number>(2);
  const [selectedRange, setSelectedRange] = useState<DateRangeLabel>("1Y");
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyFilter>("Both");

  useEffect(() => {
    if (!areaId) {
      setError("Could not extract area ID from the URL.");
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      fetchCategory(areaId, "apartment"),
      fetchCategory(areaId, "villa"),
    ])
      .then(([apt, villa]) => {
        setAptData(Array.isArray(apt) ? apt : []);
        setVillaData(Array.isArray(villa) ? villa : []);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message ?? "Failed to fetch data");
        setLoading(false);
      });
  }, [areaId]);

  const aptRooms = useMemo(
    () => new Set(aptData.map((d) => d.rooms)),
    [aptData],
  );
  const villaRooms = useMemo(
    () => new Set(villaData.map((d) => d.rooms)),
    [villaData],
  );

  const roomMeta = useMemo(
    () =>
      ROOM_OPTIONS.map((r) => {
        const hasApt = aptRooms.has(r);
        const hasVilla = villaRooms.has(r);
        let disabled = false;
        if (selectedProperty === "Apartment" && !hasApt) disabled = true;
        if (selectedProperty === "Villa" && !hasVilla) disabled = true;
        if (selectedProperty === "Both" && !hasApt && !hasVilla)
          disabled = true;
        return {
          room: r,
          disabled,
          missingApt: !hasApt,
          missingVilla: !hasVilla,
        };
      }),
    [aptRooms, villaRooms, selectedProperty],
  );

  useEffect(() => {
    const meta = roomMeta.find((m) => m.room === selectedRoom);
    if (meta?.disabled) {
      const firstValid = roomMeta.find((m) => !m.disabled);
      if (firstValid) setSelectedRoom(firstValid.room);
    }
  }, [roomMeta, selectedRoom]);

  const chartData = useMemo<ChartPoint[]>(() => {
    const cutoff = new Date();
    const years =
      DATE_RANGES.find((r) => r.label === selectedRange)?.years ?? 1;
    cutoff.setFullYear(cutoff.getFullYear() - years);

    const aptMap = buildMap(aptData, selectedRoom, cutoff);
    const villaMap = buildMap(villaData, selectedRoom, cutoff);

    const allMonths = Array.from(
      new Set([...Array.from(aptMap.keys()), ...Array.from(villaMap.keys())]),
    ).sort();

    if (allMonths.length === 0) return [];

    return allMonths.map((month) => ({
      date: toMonthLabel(month),
      apartmentMedian: aptMap.get(month) ?? null,
      villaMedian: villaMap.get(month) ?? null,
    }));
  }, [aptData, villaData, selectedRoom, selectedRange]);

  const showApt =
    selectedProperty === "Apartment" || selectedProperty === "Both";
  const showVilla = selectedProperty === "Villa" || selectedProperty === "Both";
  const hasAptData = chartData.some((d) => d.apartmentMedian != null);
  const hasVillaData = chartData.some((d) => d.villaMedian != null);
  const hasData = (showApt && hasAptData) || (showVilla && hasVillaData);
  const bothButOnlyApt =
    selectedProperty === "Both" && hasAptData && !hasVillaData;
  const bothButOnlyVilla =
    selectedProperty === "Both" && hasVillaData && !hasAptData;
  const partialBoth = bothButOnlyApt || bothButOnlyVilla;

  return (
    <div className="w-full bg-gradient-to-br from-white to-stone-100 rounded-2xl p-6 md:p-8 border border-stone-200 shadow-sm font-sans space-y-5">
      {/* Header */}
      <div>
        <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-amber-600 mb-1">
          Real Estate Analytics
        </p>
        <h2
          className="text-2xl font-bold text-[hsl(210,80%,12%)] m-0"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Price Trend
        </h2>
        {areaId && (
          <p className="text-[11px] text-slate-400 mt-1">Area ID: {areaId}</p>
        )}
      </div>

      {/* Single filter bar */}
      <div className="flex items-center gap-3 flex-wrap px-4 py-3 bg-white rounded-xl border border-stone-200">
        {/* Property */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-[0.07em] uppercase text-slate-400">
            Property
          </span>
          <div className="flex bg-stone-100 rounded-lg p-0.5 gap-0.5 border border-stone-200">
            {PROPERTY_OPTIONS.map((opt) => (
              <Pill
                key={opt}
                label={opt}
                active={selectedProperty === opt}
                onClick={() => setSelectedProperty(opt)}
              />
            ))}
          </div>
        </div>

        <div className="w-px h-5 bg-stone-200" />

        {/* Rooms */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-[0.07em] uppercase text-slate-400">
            Rooms
          </span>
          <div className="flex bg-stone-100 rounded-lg p-0.5 gap-1 border border-stone-200">
            {roomMeta.map(({ room, disabled, missingApt, missingVilla }) => (
              <RoomPill
                key={room}
                room={room}
                active={selectedRoom === room}
                disabled={disabled}
                missingApt={missingApt}
                missingVilla={missingVilla}
                filter={selectedProperty}
                onClick={() => setSelectedRoom(room)}
              />
            ))}
          </div>
        </div>

        <div className="w-px h-5 bg-stone-200" />

        {/* Range */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-[0.07em] uppercase text-slate-400">
            Range
          </span>
          <div className="flex bg-stone-100 rounded-lg p-0.5 gap-0.5 border border-stone-200">
            {DATE_RANGES.map((dr) => (
              <Pill
                key={dr.label}
                label={dr.label}
                active={selectedRange === dr.label}
                onClick={() => setSelectedRange(dr.label)}
              />
            ))}
          </div>
        </div>

        {selectedProperty === "Both" && !loading && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-600 ml-auto">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            Rooms with partial data
          </div>
        )}
      </div>

      {/* Partial notice */}
      {partialBoth && !loading && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-amber-500 mt-0.5">&#9888;</span>
          <p className="text-[12px] text-amber-700 leading-relaxed m-0">
            {bothButOnlyApt
              ? `No villa data for ${selectedRoom} room${selectedRoom > 1 ? "s" : ""}. Showing apartments only.`
              : `No apartment data for ${selectedRoom} room${selectedRoom > 1 ? "s" : ""}. Showing villas only.`}{" "}
            Try a different room count to see both lines.
          </p>
        </div>
      )}

      {/* Legend (Both mode) */}
      {selectedProperty === "Both" && (
        <div className="flex gap-6 pl-1">
          {[
            { color: APT_COLOR, label: "Apartment", faded: bothButOnlyVilla },
            { color: VILLA_COLOR, label: "Villa", faded: bothButOnlyApt },
          ].map(({ color, label, faded }) => (
            <div
              key={label}
              className={`flex items-center gap-2 transition-opacity ${faded ? "opacity-30" : ""}`}
            >
              <svg width="26" height="10">
                <line
                  x1="0"
                  y1="5"
                  x2="26"
                  y2="5"
                  stroke={color}
                  strokeWidth="2.5"
                />
                <circle cx="13" cy="5" r="3" fill={color} />
              </svg>
              <span className="text-xs font-medium text-slate-500">
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* AI Insights Panel */}
      <AIInsightsPanel />

      {/* Chart */}
      <div className="relative min-h-[380px] flex items-center justify-center bg-white rounded-xl border border-stone-200 pt-5 pb-3">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white rounded-xl z-10">
            <div
              className="w-7 h-7 rounded-full border-[3px] border-stone-200 border-t-amber-500"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
            <p className="text-[13px] text-slate-400">Loading data…</p>
          </div>
        )}

        {!loading && error && (
          <p className="text-red-500 font-semibold text-sm">&#9888; {error}</p>
        )}

        {!loading && !error && !hasData && (
          <p className="text-[13px] text-slate-400">
            No data available for the selected filters.
          </p>
        )}

        {!loading && !error && hasData && (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 32, bottom: 8, left: 8 }}
            >
              <CartesianGrid
                stroke="#e7e5e4"
                strokeDasharray="3 6"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#e7e5e4" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={formatShort}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={62}
              />
              <Tooltip content={<CustomTooltip filter={selectedProperty} />} />
              {showApt && (
                <Line
                  type="monotone"
                  dataKey="apartmentMedian"
                  name="Apartment"
                  stroke={APT_COLOR}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: APT_COLOR,
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  connectNulls
                />
              )}
              {showVilla && (
                <Line
                  type="monotone"
                  dataKey="villaMedian"
                  name="Villa"
                  stroke={VILLA_COLOR}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: VILLA_COLOR,
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      <p className="text-[11px] text-slate-300 text-center tracking-wide">
        Prices in AED &middot; Area {areaId ?? "?"} &middot; Median price per
        transaction
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
