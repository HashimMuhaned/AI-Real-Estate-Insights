import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface YieldRecord {
  area_id: number;
  area_name?: string;
  property_category: string;
  rooms: number;
  median_price: number;
  median_rent: number;
  estimated_gross_yield: number;
}

interface FilterState {
  areaId?: number;
  category?: "apartment" | "villa" | "";
  rooms?: number | "";
  range?: string;
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────
async function fetchYields(filters: FilterState): Promise<YieldRecord[]> {
  const params = new URLSearchParams();
  if (filters.areaId !== undefined)
    params.set("areaId", String(filters.areaId));
  if (filters.category) params.set("category", filters.category);
  if (filters.rooms !== "" && filters.rooms !== undefined)
    params.set("rooms", String(filters.rooms));
  if (filters.range) params.set("range", filters.range);

  const query = params.toString();
  const url = `/api/areaCharts/rent_intel/gross_yield${query ? `?${query}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  const json = await res.json();
  // Support both a bare array and { data: [...] } envelope
  const raw: YieldRecord[] = Array.isArray(json) ? json : (json.data ?? []);
  const records = raw.map((r) => ({
    ...r,
    rooms: Number(r.rooms),
    median_price: Number(r.median_price),
    median_rent: Number(r.median_rent),
    estimated_gross_yield: Number(r.estimated_gross_yield),
  }));
  return records.sort(
    (a, b) => b.estimated_gross_yield - a.estimated_gross_yield,
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function roomLabel(n: number) {
  return n === 0 ? "Studio" : `${n}BR`;
}

function segmentLabel(r: YieldRecord) {
  const area = r.area_name ?? `Area ${r.area_id}`;
  return `${area} · ${r.property_category} · ${roomLabel(r.rooms)}`;
}

function yieldColor(y: number): string {
  if (y >= 7.5) return "hsl(160 75% 35%)"; // emerald — top
  if (y >= 6.5) return "hsl(45 85% 55%)"; // gold — good
  if (y >= 5.5) return "hsl(210 60% 45%)"; // mid-blue
  return "hsl(210 80% 12% / 0.55)"; // muted navy — low
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d: YieldRecord = payload[0].payload._raw;
  return (
    <div
      className="rounded-xl border p-4 text-sm shadow-xl"
      style={{
        background: "hsl(25 20% 98%)",
        borderColor: "hsl(35 15% 85%)",
        minWidth: 220,
      }}
    >
      <p
        className="font-serif text-base font-semibold mb-2"
        style={{ color: "hsl(210 80% 12%)" }}
      >
        {segmentLabel(d)}
      </p>
      <div className="space-y-1" style={{ color: "hsl(210 40% 35%)" }}>
        <div className="flex justify-between gap-6">
          <span>Gross Yield</span>
          <span
            className="font-semibold"
            style={{ color: yieldColor(d.estimated_gross_yield) }}
          >
            {d.estimated_gross_yield.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span>Median Price</span>
          <span className="font-medium" style={{ color: "hsl(210 80% 12%)" }}>
            {formatCurrency(d.median_price)}
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span>Annual Rent</span>
          <span className="font-medium" style={{ color: "hsl(210 80% 12%)" }}>
            {formatCurrency(d.median_rent)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Legend badge ─────────────────────────────────────────────────────────────
function LegendBadge({ color, label }: { color: string; label: string }) {
  return (
    <div
      className="flex items-center gap-2 text-xs"
      style={{ color: "hsl(210 40% 35%)" }}
    >
      <span
        className="w-3 h-3 rounded-sm shrink-0"
        style={{ background: color }}
      />
      {label}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GrossYieldChart() {
  const [data, setData] = useState<YieldRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    areaId: undefined,
    category: "",
    rooms: "",
    range: "",
  });

  const AREAS = [
    { id: undefined, label: "All Areas" },
    { id: 409, label: "Al Barshaa South Third – Arjan" },
    { id: 526, label: "Business Bay" },
    { id: 441, label: "Al Barsha South Fourth – JVC" },
    { id: 390, label: "Burj Khalifa · Downtown Dubai" },
    { id: 467, label: "Wadi Al Safa 5" },
  ];

  const RANGES = ["", "1 year", "3 years", "5 years"];

  // Rooms available per category (based on known data ranges)
  const ROOM_OPTIONS: { value: "" | number; label: string }[] = [
    { value: "", label: "All" },
    { value: 0, label: "Studio" },
    { value: 1, label: "1BR" },
    { value: 2, label: "2BR" },
    { value: 3, label: "3BR" },
    { value: 4, label: "4BR" },
    { value: 5, label: "5BR" },
    { value: 6, label: "6BR" },
    { value: 7, label: "7BR" },
  ];

  // Which room counts exist per category
  const APARTMENT_ROOMS = new Set([0, 1, 2, 3, 4]); // Studio–4BR
  const VILLA_ROOMS = new Set([2, 3, 4, 5]); // 2–5BR (no Studio/1BR, no 6/7BR)

  function isRoomDisabled(roomVal: "" | number): boolean {
    if (roomVal === "") return false;
    if (filters.category === "apartment")
      return !APARTMENT_ROOMS.has(roomVal as number);
    if (filters.category === "villa")
      return !VILLA_ROOMS.has(roomVal as number);
    return false;
  }

  // Banner: selected rooms filter incompatible with selected category
  const roomsMismatch =
    filters.rooms !== "" &&
    filters.category !== "" &&
    isRoomDisabled(filters.rooms);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchYields(filters)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setData([]);
        setLoading(false);
      });
  }, [filters]);

  // Recharts needs the label on the record for the YAxis
  const chartData = data.map((r) => ({
    label: segmentLabel(r),
    yield: r.estimated_gross_yield,
    _raw: r,
  }));

  const avgYield =
    data.length > 0
      ? data.reduce((s, r) => s + r.estimated_gross_yield, 0) / data.length
      : 0;

  const barHeight = 44;
  const minHeight = 300;
  const chartHeight = Math.max(minHeight, chartData.length * barHeight + 80);

  // ── Pill button helper ─────────────────────────────────────────────────────
  const pill = (
    active: boolean,
    onClick: () => void,
    label: string,
    key: string | number,
  ) => (
    <button
      key={key}
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
      style={{
        background: active ? "hsl(210 80% 12%)" : "hsl(35 20% 92%)",
        color: active ? "hsl(25 15% 96%)" : "hsl(210 40% 35%)",
        border: `1px solid ${active ? "hsl(210 80% 12%)" : "hsl(35 15% 85%)"}`,
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      className="min-h-screen p-6 md:p-10"
      style={{
        background: "hsl(25 15% 96%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-2"
          style={{ color: "hsl(45 85% 45%)" }}
        >
          Dubai Real Estate · Investment Analytics
        </p>
        <h1
          className="text-3xl md:text-4xl font-bold mb-1"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "hsl(210 80% 12%)",
          }}
        >
          Gross Yield Rankings
        </h1>
        <p className="text-sm" style={{ color: "hsl(210 40% 35%)" }}>
          Ranked segments by estimated annual gross yield
        </p>
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 mb-6 flex flex-wrap gap-4"
        style={{
          background: "hsl(25 20% 98%)",
          border: "1px solid hsl(35 15% 85%)",
          boxShadow: "0 4px 20px -4px hsl(210 80% 12% / 0.08)",
        }}
      >
        {/* Area */}
        <div>
          <p
            className="text-xs font-medium mb-2"
            style={{ color: "hsl(210 40% 35%)" }}
          >
            Area
          </p>
          <div className="flex flex-wrap gap-1.5">
            {AREAS.map((a) =>
              pill(
                filters.areaId === a.id,
                () => setFilters((f) => ({ ...f, areaId: a.id })),
                a.label,
                a.id ?? "all",
              ),
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <p
            className="text-xs font-medium mb-2"
            style={{ color: "hsl(210 40% 35%)" }}
          >
            Category
          </p>
          <div className="flex gap-1.5">
            {(["", "apartment", "villa"] as const).map((c) =>
              pill(
                filters.category === c,
                () => setFilters((f) => ({ ...f, category: c })),
                c === "" ? "All" : c.charAt(0).toUpperCase() + c.slice(1),
                c || "all-cat",
              ),
            )}
          </div>
        </div>

        {/* Rooms */}
        <div className="w-full">
          <p
            className="text-xs font-medium mb-2"
            style={{ color: "hsl(210 40% 35%)" }}
          >
            Bedrooms
            {filters.category !== "" && (
              <span
                className="ml-2 font-normal"
                style={{ color: "hsl(210 40% 55%)" }}
              >
                (greyed options unavailable for{" "}
                {filters.category === "apartment" ? "Apartments" : "Villas"})
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ROOM_OPTIONS.map(({ value, label }) => {
              const disabled = isRoomDisabled(value);
              const active = filters.rooms === value && !disabled;
              return (
                <button
                  key={value === "" ? "all-rooms" : value}
                  disabled={disabled}
                  onClick={() =>
                    !disabled && setFilters((f) => ({ ...f, rooms: value }))
                  }
                  title={
                    disabled
                      ? `Not available for ${filters.category === "apartment" ? "Apartments" : "Villas"}`
                      : undefined
                  }
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                  style={{
                    background: disabled
                      ? "hsl(35 10% 90%)"
                      : active
                        ? "hsl(210 80% 12%)"
                        : "hsl(35 20% 92%)",
                    color: disabled
                      ? "hsl(210 20% 70%)"
                      : active
                        ? "hsl(25 15% 96%)"
                        : "hsl(210 40% 35%)",
                    border: `1px solid ${disabled ? "hsl(35 10% 86%)" : active ? "hsl(210 80% 12%)" : "hsl(35 15% 85%)"}`,
                    cursor: disabled ? "not-allowed" : "pointer",
                    textDecoration: disabled ? "line-through" : "none",
                    opacity: disabled ? 0.5 : 1,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Mismatch warning */}
          {roomsMismatch && (
            <div
              className="mt-2 flex items-center gap-2 text-xs rounded-lg px-3 py-2"
              style={{
                background: "hsl(45 85% 55% / 0.12)",
                border: "1px solid hsl(45 85% 55% / 0.35)",
                color: "hsl(40 60% 30%)",
              }}
            >
              <span>⚠️</span>
              <span>
                <strong>
                  {filters.category === "apartment" ? "Apartments" : "Villas"}
                </strong>{" "}
                don&apos;t have{" "}
                {filters.rooms === 0 ? "Studio" : `${filters.rooms}BR`} units —
                no results will match.{" "}
                <button
                  onClick={() => setFilters((f) => ({ ...f, rooms: "" }))}
                  className="underline font-medium"
                  style={{ color: "hsl(210 80% 30%)" }}
                >
                  Clear bedroom filter
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Range */}
        <div>
          <p
            className="text-xs font-medium mb-2"
            style={{ color: "hsl(210 40% 35%)" }}
          >
            Range
          </p>
          <div className="flex gap-1.5">
            {RANGES.map((rng) =>
              pill(
                filters.range === rng,
                () => setFilters((f) => ({ ...f, range: rng })),
                rng === "" ? "Default" : rng,
                rng || "default-range",
              ),
            )}
          </div>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Segments",
              value: data.length,
              suffix: "",
              color: "hsl(210 80% 12%)",
            },
            {
              label: "Avg Yield",
              value: avgYield.toFixed(2),
              suffix: "%",
              color: "hsl(45 85% 45%)",
            },
            {
              label: "Top Yield",
              value: data[0]?.estimated_gross_yield.toFixed(2),
              suffix: "%",
              color: "hsl(160 75% 35%)",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-4 text-center"
              style={{
                background: "hsl(25 20% 98%)",
                border: "1px solid hsl(35 15% 85%)",
              }}
            >
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: s.color,
                }}
              >
                {s.value}
                {s.suffix}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "hsl(210 40% 35%)" }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Chart card ─────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "hsl(25 20% 98%)",
          border: "1px solid hsl(35 15% 85%)",
          boxShadow: "0 10px 40px -10px hsl(210 80% 12% / 0.10)",
        }}
      >
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-5">
          <LegendBadge color="hsl(160 75% 35%)" label="≥ 7.5% — Exceptional" />
          <LegendBadge color="hsl(45 85% 55%)" label="6.5–7.5% — Strong" />
          <LegendBadge color="hsl(210 60% 45%)" label="5.5–6.5% — Moderate" />
          <LegendBadge color="hsl(210 80% 12% / 0.55)" label="< 5.5% — Low" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{
                borderColor: "hsl(210 80% 12%)",
                borderTopColor: "transparent",
              }}
            />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2">
            <p
              className="text-sm font-medium"
              style={{ color: "hsl(0 84% 60%)" }}
            >
              Failed to load data
            </p>
            <p className="text-xs" style={{ color: "hsl(210 40% 50%)" }}>
              {error}
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p style={{ color: "hsl(210 40% 35%)" }}>
              No segments match the selected filters.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 0, right: 60, bottom: 0, left: 0 }}
              barCategoryGap="28%"
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="4 4"
                stroke="hsl(35 15% 88%)"
              />

              {/* Average reference line */}
              {avgYield > 0 && (
                <ReferenceLine
                  x={avgYield}
                  stroke="hsl(210 80% 12% / 0.3)"
                  strokeDasharray="6 3"
                  label={{
                    value: `Avg ${avgYield.toFixed(2)}%`,
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "hsl(210 40% 35%)",
                    dy: -6,
                  }}
                />
              )}

              <XAxis
                type="number"
                domain={[0, (dataMax: number) => Math.ceil(dataMax + 0.5)]}
                tickFormatter={(v) => `${v}%`}
                tick={{
                  fontSize: 11,
                  fill: "hsl(210 40% 35%)",
                  fontFamily: "Inter",
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                type="category"
                dataKey="label"
                width={200}
                tick={{
                  fontSize: 11,
                  fill: "hsl(210 60% 25%)",
                  fontFamily: "Inter",
                  fontWeight: 500,
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "hsl(35 20% 92% / 0.6)" }}
              />

              <Bar dataKey="yield" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={yieldColor(entry.yield)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Footer note ────────────────────────────────────────────────────── */}
      <p
        className="text-xs mt-4 text-center"
        style={{ color: "hsl(210 40% 50%)" }}
      >
        Gross yield = annual median rent ÷ median sale price × 100. Data via{" "}
        <code className="font-mono">/api/areaCharts/gross_yield</code>
      </p>
    </div>
  );
}
