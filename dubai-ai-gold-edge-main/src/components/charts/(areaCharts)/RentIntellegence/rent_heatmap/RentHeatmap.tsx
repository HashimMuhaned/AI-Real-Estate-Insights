import { useState, useEffect, useCallback, useMemo } from "react";
import { ResponsiveHeatMap } from "@nivo/heatmap";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "apartment" | "villa";
type Range = "1 year" | "3 years" | "5 years";

interface HeatmapEntry {
  area_id: number;
  area_name_en: string;
  room_label: string;
  median_annual_rent: number;
}

interface NivoHeatmapDatum {
  x: string;
  y: number | null;
}

interface NivoHeatmapRow {
  id: string;
  data: NivoHeatmapDatum[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROOM_ORDER = ["Studio", "1BR", "2BR", "3BR", "4BR"];

const RANGE_OPTIONS: { label: string; value: Range }[] = [
  { label: "1Y", value: "1 year" },
  { label: "3Y", value: "3 years" },
  { label: "5Y", value: "5 years" },
];

// Dubai palette: sand → gold → deep navy
const DUBAI_COLOR_SCALE = [
  "#ede4d3",
  "#e8c96d",
  "#D4A017",
  "#7a6010",
  "#0d2340",
];

// Row height in px — tall enough so labels + values both breathe
const ROW_HEIGHT = 52;
// Left margin for area name column
const LEFT_MARGIN = 210;
// Top margin for column headers
const TOP_MARGIN = 64;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildUrl(category: Category, range?: Range): string {
  const base = `/api/areaCharts/rent_intel/rent_heatmap?category=${category}`;
  return range ? `${base}&range=${encodeURIComponent(range)}` : base;
}

function formatRent(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

// ─── Custom column header tick with pill background ───────────────────────────

function ColumnTick({ x, y, value }: { x: number; y: number; value: string }) {
  const pillW = 68;
  const pillH = 28;
  return (
    <g transform={`translate(${x},${y - 8})`}>
      {/* Pill background */}
      <rect
        x={-pillW / 2}
        y={-pillH / 2}
        width={pillW}
        height={pillH}
        rx={pillH / 2}
        fill="hsl(210,80%,12%)"
      />
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontSize: 13,
          fontFamily: "'Inter',sans-serif",
          fontWeight: 700,
          fill: "#f5f0e8",
          letterSpacing: "0.06em",
        }}
      >
        {value}
      </text>
    </g>
  );
}

// ─── Custom area name tick ────────────────────────────────────────────────────

function AreaTick({ x, y, value }: { x: number; y: number; value: string }) {
  const label =
    String(value).length > 28
      ? String(value).slice(0, 26) + "…"
      : String(value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        textAnchor="end"
        dominantBaseline="middle"
        style={{
          fontSize: 12,
          fontFamily: "'Inter',sans-serif",
          fontWeight: 600,
          fill: "hsl(210,70%,18%)",
        }}
      >
        {label}
      </text>
    </g>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RentHeatmap() {
  const [category, setCategory] = useState<Category>("apartment");
  const [range, setRange] = useState<Range | undefined>(undefined);
  const [data, setData] = useState<HeatmapEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(buildUrl(category, range));
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      setData(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [category, range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { nivoData, presentColumns, minVal, maxVal } = useMemo(() => {
    const presentColumns = ROOM_ORDER.filter((col) =>
      data.some((d) => d.room_label === col),
    );

    const areaMap = new Map<string, Record<string, number>>();
    for (const entry of data) {
      if (!areaMap.has(entry.area_name_en)) areaMap.set(entry.area_name_en, {});
      areaMap.get(entry.area_name_en)![entry.room_label] =
        entry.median_annual_rent;
    }

    const nivoData: NivoHeatmapRow[] = Array.from(areaMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([areaName, rooms]) => ({
        id: areaName,
        data: presentColumns.map((col) => ({
          x: col,
          y: rooms[col] ?? null,
        })),
      }));

    const allValues = data.map((d) => d.median_annual_rent).filter(Boolean);
    const minVal = allValues.length ? Math.min(...allValues) : 0;
    const maxVal = allValues.length ? Math.max(...allValues) : 0;

    return { nivoData, presentColumns, minVal, maxVal };
  }, [data]);

  // Chart height = header + rows + bottom padding for legend
  const chartHeight = TOP_MARGIN + nivoData.length * ROW_HEIGHT + 60;

  // ── Styles ─────────────────────────────────────────────────────────────────
  const pillWrap = {
    background: "hsl(35,20%,92%)",
    border: "1px solid hsl(35,15%,85%)",
  };
  const activeTabStyle = {
    background: "linear-gradient(135deg, hsl(210,80%,12%), hsl(210,60%,20%))",
    color: "hsl(25,15%,96%)",
    boxShadow: "0 4px 14px -4px hsl(210 80% 12% / 0.35)",
  };
  const activeRangeStyle = {
    background: "linear-gradient(135deg, hsl(45,85%,55%), hsl(40,80%,60%))",
    color: "hsl(210,80%,12%)",
    boxShadow: "0 4px 14px -4px hsl(45 85% 55% / 0.4)",
  };
  const inactiveStyle = { color: "hsl(210,40%,40%)" };

  return (
    <div className="min-h-screen p-6 bg-background text-foreground">
      {/* Header */}
      <div className="mb-8">
        <p
          className="text-xs tracking-[0.3em] uppercase font-semibold mb-1"
          style={{ color: "hsl(45,75%,40%)", fontFamily: "'Inter',sans-serif" }}
        >
          Dubai Rental Intelligence
        </p>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{
            fontFamily: "'Playfair Display',Georgia,serif",
            color: "hsl(210,80%,12%)",
          }}
        >
          Rent Heatmap
        </h1>
        <p
          className="text-sm mt-1"
          style={{
            color: "hsl(210,40%,40%)",
            fontFamily: "'Inter',sans-serif",
          }}
        >
          Median annual rent by area &amp; unit type · AED
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-8">
        {/* Category */}
        <div className="flex rounded-lg p-1 gap-1" style={pillWrap}>
          {(["apartment", "villa"] as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-4 py-1.5 rounded-md text-xs uppercase tracking-widest font-semibold transition-all duration-200"
              style={category === cat ? activeTabStyle : inactiveStyle}
            >
              {cat === "apartment" ? "🏢 Apartments" : "🏡 Villas"}
            </button>
          ))}
        </div>

        {/* Range */}
        <div className="flex rounded-lg p-1 gap-1" style={pillWrap}>
          <button
            onClick={() => setRange(undefined)}
            className="px-3 py-1.5 rounded-md text-xs uppercase tracking-widest font-semibold transition-all duration-200"
            style={range === undefined ? activeRangeStyle : inactiveStyle}
          >
            All
          </button>
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className="px-3 py-1.5 rounded-md text-xs uppercase tracking-widest font-semibold transition-all duration-200"
              style={range === opt.value ? activeRangeStyle : inactiveStyle}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-1.5 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all disabled:opacity-40"
          style={{ ...pillWrap, color: "hsl(210,40%,40%)" }}
        >
          {loading ? "⟳ Loading…" : "↻ Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-xl text-sm"
          style={{
            background: "hsl(0,84%,97%)",
            border: "1px solid hsl(0,84%,82%)",
            color: "hsl(0,70%,40%)",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Stats strip */}
      {!loading && nivoData.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-6">
          {[
            { label: "Areas", value: nivoData.length },
            { label: "Unit types", value: presentColumns.join(" · ") },
            { label: "Min rent", value: `AED ${formatRent(minVal)}/yr` },
            { label: "Max rent", value: `AED ${formatRent(maxVal)}/yr` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="px-4 py-2 rounded-lg"
              style={{
                background: "hsl(35,20%,93%)",
                border: "1px solid hsl(35,15%,86%)",
              }}
            >
              <p
                className="text-xs uppercase tracking-widest mb-0.5"
                style={{
                  color: "hsl(210,40%,50%)",
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                {label}
              </p>
              <p
                className="text-sm font-semibold"
                style={{
                  color: "hsl(210,80%,12%)",
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Heatmap */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: "1px solid hsl(35,15%,85%)",
          boxShadow: "0 10px 40px -10px hsl(210 80% 12% / 0.1)",
          background: "hsl(25,20%,98%)",
        }}
      >
        {loading ? (
          <div
            className="flex items-center justify-center py-32 text-sm"
            style={{
              color: "hsl(210,40%,55%)",
              fontFamily: "'Inter',sans-serif",
            }}
          >
            <span className="animate-pulse">Fetching data…</span>
          </div>
        ) : nivoData.length === 0 && !error ? (
          <div
            className="flex items-center justify-center py-32 text-sm"
            style={{
              color: "hsl(210,40%,55%)",
              fontFamily: "'Inter',sans-serif",
            }}
          >
            No data available for the selected filters.
          </div>
        ) : (
          <div style={{ height: chartHeight }}>
            <ResponsiveHeatMap
              data={nivoData}
              // ── Value & color scale ────────────────────────────────────────
              valueFormat={(v) =>
                v != null ? `AED ${formatRent(v as number)}` : "—"
              }
              colors={{
                type: "sequential",
                colors: DUBAI_COLOR_SCALE,
                minValue: minVal,
                maxValue: maxVal,
              }}
              emptyColor="hsl(35,18%,91%)"
              // ── Margins ───────────────────────────────────────────────────
              margin={{
                top: TOP_MARGIN,
                right: 32,
                bottom: 56,
                left: LEFT_MARGIN,
              }}
              // ── Cell ──────────────────────────────────────────────────────
              cellComponent="rect"
              cellOpacity={1}
              cellBorderWidth={2}
              cellBorderColor="hsl(25,20%,98%)"
              // ── Cell labels ───────────────────────────────────────────────
              enableLabels={true}
              label={(datum) =>
                datum.value != null ? formatRent(datum.value as number) : ""
              }
              labelTextColor={(datum) => {
                if (datum.value == null || maxVal === minVal) return "#1e293b";
                const t =
                  ((datum.value as number) - minVal) / (maxVal - minVal);
                return t > 0.38 ? "#f5f0e8" : "#0d2340";
              }}
              // ── Axes ──────────────────────────────────────────────────────
              axisTop={{
                tickSize: 0,
                tickPadding: 16,
                tickRotation: 0,
                renderTick: (tick) => (
                  <ColumnTick
                    x={tick.x}
                    y={tick.y}
                    value={String(tick.value)}
                  />
                ),
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 14,
                tickRotation: 0,
                renderTick: (tick) => (
                  <AreaTick x={tick.x} y={tick.y} value={String(tick.value)} />
                ),
              }}
              axisRight={null}
              axisBottom={null}
              // ── Tooltip ───────────────────────────────────────────────────
              tooltip={({ cell }) => (
                <div
                  style={{
                    background: "hsl(210,80%,12%)",
                    color: "hsl(25,15%,96%)",
                    padding: "10px 16px",
                    borderRadius: 10,
                    fontFamily: "'Inter',sans-serif",
                    fontSize: 12,
                    boxShadow: "0 8px 24px -4px hsl(210 80% 12% / 0.5)",
                    lineHeight: 1.7,
                    minWidth: 180,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      marginBottom: 2,
                      color: "#f5f0e8",
                    }}
                  >
                    {cell.serieId}
                  </div>
                  <div
                    style={{
                      color: "hsl(45,85%,65%)",
                      fontWeight: 600,
                      fontSize: 11,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    {cell.data.x}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 16, fontWeight: 800 }}>
                    {cell.value != null
                      ? `AED ${(cell.value as number).toLocaleString()}`
                      : "No data"}
                  </div>
                  {cell.value != null && (
                    <div
                      style={{ fontSize: 10, color: "#a0b4c8", marginTop: 1 }}
                    >
                      per year
                    </div>
                  )}
                </div>
              )}
              // ── Legend ────────────────────────────────────────────────────
              legends={[
                {
                  anchor: "bottom-left" as const,
                  translateX: 0,
                  translateY: 50,
                  length: 260,
                  thickness: 10,
                  direction: "row" as const,
                  tickPosition: "after" as const,
                  tickSize: 3,
                  tickSpacing: 6,
                  tickOverlap: false,
                  tickFormat: (v) => `${formatRent(v as number)}`,
                  title: "AED / year  →",
                  titleAlign: "start" as const,
                  titleOffset: 6,
                },
              ]}
              // ── Theme ─────────────────────────────────────────────────────
              theme={{
                background: "transparent",
                text: {
                  fontSize: 12,
                  fontFamily: "'Inter',sans-serif",
                  fill: "hsl(210,80%,12%)",
                },
                labels: {
                  text: {
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'Inter',sans-serif",
                  },
                },
                tooltip: {
                  container: {
                    background: "transparent",
                    padding: 0,
                    boxShadow: "none",
                  },
                },
                legends: {
                  text: {
                    fontSize: 11,
                    fontFamily: "'Inter',sans-serif",
                    fill: "hsl(210,40%,40%)",
                  },
                  title: {
                    text: {
                      fontSize: 11,
                      fontFamily: "'Inter',sans-serif",
                      fill: "hsl(210,40%,50%)",
                    },
                  },
                },
              }}
              animate={true}
              motionConfig="gentle"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      {nivoData.length > 0 && !loading && (
        <p
          className="mt-3 text-xs text-right"
          style={{
            color: "hsl(210,40%,60%)",
            fontFamily: "'Inter',sans-serif",
          }}
        >
          {nivoData.length} areas · {presentColumns.join(", ")} · AED / year
        </p>
      )}
    </div>
  );
}
