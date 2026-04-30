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
} from "recharts";
import { Sparkles, MessageSquare, ChevronRight, TrendingUp } from "lucide-react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface RentDataPoint {
  month: string;
  property_category: string;
  rooms: number;
  median_rent: number;
}

type PropertyFilter = "apartment" | "villa" | "both";
type RangeFilter = "1 years" | "3 years" | "5 years";

/* ─────────────────────────────────────────────
   Config – which room counts exist per type
   (based on your business rules)
───────────────────────────────────────────── */
const AVAILABLE_ROOMS: Record<"apartment" | "villa", number[]> = {
  apartment: [1, 2, 3, 4],
  villa: [2, 3, 4, 5],
};

const ALL_ROOMS = [1, 2, 3, 4, 5, 6, 7];

function isRoomDisabled(room: number, property: PropertyFilter): boolean {
  if (property === "both") return false;
  return !AVAILABLE_ROOMS[property].includes(room);
}

/* ─────────────────────────────────────────────
   Extract area ID from window.location.pathname
   e.g. "/locations/al-barsha-south-fourth-441" → "441"
───────────────────────────────────────────── */
function getAreaIdFromUrl(): string {
  if (typeof window === "undefined") return "441";
  const parts = window.location.pathname.split("-");
  const last = parts[parts.length - 1];
  return /^\d+$/.test(last) ? last : "441";
}

/* ─────────────────────────────────────────────
   Format helpers
───────────────────────────────────────────── */
function formatAED(value: number) {
  return `AED ${(value / 1000).toFixed(0)}k`;
}

function formatMonth(raw: string) {
  const d = new Date(raw);
  return d.toLocaleDateString("en-AE", { month: "short", year: "2-digit" });
}

/* ─────────────────────────────────────────────
   Custom Tooltip
───────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "hsl(210 80% 12%)",
        border: "1px solid hsl(45 85% 55% / 0.3)",
        borderRadius: 10,
        padding: "10px 16px",
        boxShadow: "0 8px 30px -8px hsl(45 85% 55% / 0.25)",
      }}
    >
      <p style={{ color: "hsl(45 85% 55%)", fontWeight: 600, marginBottom: 4, fontSize: 12 }}>
        {label}
      </p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, fontSize: 13, margin: "2px 0" }}>
          {p.name}: <strong>{formatAED(p.value)}</strong>
        </p>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function RentPrice({ areaName }: { areaName?: string }) {
  const areaId = getAreaIdFromUrl();

  const [property, setProperty] = useState<PropertyFilter>("apartment");
  const [rooms, setRooms] = useState<number>(1);
  const [range, setRange] = useState<RangeFilter>("1 years");

  const [rawData, setRawData] = useState<RentDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Clamp rooms when property changes ── */
  useEffect(() => {
    if (property !== "both") {
      const available = AVAILABLE_ROOMS[property];
      if (!available.includes(rooms)) {
        setRooms(available[0]);
      }
    }
  }, [property]);

  /* ── Fetch ── */
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ areaId });
        if (property !== "both") params.set("category", property);
        params.set("rooms", String(rooms));
        params.set("range", range);

        const res = await fetch(`/api/areaCharts/rent_trend?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch data");
        const json: RentDataPoint[] = await res.json();
        setRawData(json);
      } catch (e: any) {
        setError(e.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [property, rooms, range, areaId]);

  /* ── Transform into chart data ── */
  const chartData = useMemo(() => {
    const months = Array.from(new Set(rawData.map((d) => d.month))).sort();
    return months.map((m) => {
      const point: Record<string, any> = { month: formatMonth(m) };
      const apt = rawData.find(
        (d) => d.month === m && d.property_category.toLowerCase() === "apartment"
      );
      const villa = rawData.find(
        (d) => d.month === m && d.property_category.toLowerCase() === "villa"
      );
      if (property === "apartment" || property === "both") {
        point["Apartment"] = apt?.median_rent ?? null;
      }
      if (property === "villa" || property === "both") {
        point["Villa"] = villa?.median_rent ?? null;
      }
      return point;
    });
  }, [rawData, property]);

  /* ── "Both" but only one line visible warning ── */
  const bothButOneLine =
    property === "both" &&
    chartData.length > 0 &&
    chartData.every((d) => d["Apartment"] === null || d["Villa"] === null);

  const missingType =
    bothButOneLine
      ? chartData.every((d) => d["Apartment"] === null)
        ? "Apartment"
        : "Villa"
      : null;

  /* ─────────────── Render ─────────────── */
  return (
    <div className="w-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Card wrapper ── */}
      <div
        style={{
          background: "hsl(25 20% 98%)",
          border: "1px solid hsl(35 15% 85%)",
          borderRadius: 16,
          boxShadow: "0 10px 40px -10px hsl(210 80% 12% / 0.12)",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            background: "linear-gradient(135deg, hsl(210 80% 12%), hsl(210 60% 20%))",
            padding: "20px 28px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <TrendingUp size={22} style={{ color: "hsl(45 85% 55%)" }} />
          <div>
            <h2
              style={{
                color: "hsl(25 15% 96%)",
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "'Playfair Display', serif",
                margin: 0,
              }}
            >
              Rent Trend Analysis
            </h2>
            {areaName && (
              <p style={{ color: "hsl(35 15% 70%)", fontSize: 12, margin: "2px 0 0" }}>
                {areaName}
              </p>
            )}
          </div>
        </div>

        <div style={{ padding: "20px 28px 28px" }}>
          {/* ── Filters row ── */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            {/* Property type */}
            <FilterGroup label="Property Type">
              {(["apartment", "villa", "both"] as PropertyFilter[]).map((p) => (
                <FilterPill
                  key={p}
                  active={property === p}
                  onClick={() => setProperty(p)}
                  label={p.charAt(0).toUpperCase() + p.slice(1)}
                />
              ))}
            </FilterGroup>

            {/* Rooms */}
            <FilterGroup label="Bedrooms">
              {ALL_ROOMS.map((r) => {
                const disabled = isRoomDisabled(r, property);
                return (
                  <FilterPill
                    key={r}
                    active={rooms === r && !disabled}
                    disabled={disabled}
                    onClick={() => !disabled && setRooms(r)}
                    label={String(r)}
                  />
                );
              })}
            </FilterGroup>

            {/* Date range */}
            <FilterGroup label="Time Range">
              {(["1 years", "3 years", "5 years"] as RangeFilter[]).map((rv) => (
                <FilterPill
                  key={rv}
                  active={range === rv}
                  onClick={() => setRange(rv)}
                  label={rv.replace(" years", "Y").replace("1Y", "1Y")}
                />
              ))}
            </FilterGroup>
          </div>

          {/* ── AI Insights banner ── */}
          <div
            style={{
              background: "linear-gradient(135deg, hsl(210 80% 12% / 0.04), hsl(45 85% 55% / 0.06))",
              border: "1px solid hsl(45 85% 55% / 0.2)",
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 24,
              position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <Sparkles size={15} style={{ color: "hsl(45 85% 55%)" }} />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "hsl(45 85% 55%)",
                    }}
                  >
                    AI Insights
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "hsl(210 40% 35%)", lineHeight: 1.6, margin: 0 }}>
                  Rental demand in this area has shown consistent growth over the past 12 months, with
                  1-bedroom apartments experiencing the strongest appreciation at ~8.4% YoY. Villas
                  remain resilient, driven by family relocations. Seasonal dips typically occur in
                  summer (Jun–Aug), offering potential entry points for investors.
                </p>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "hsl(45 85% 45%)",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "6px 0 0",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  View more insights <ChevronRight size={13} />
                </button>
              </div>

              {/* Ask AI button */}
              <button
                style={{
                  background: "linear-gradient(135deg, hsl(210 80% 12%), hsl(210 60% 20%))",
                  color: "hsl(45 85% 65%)",
                  border: "1px solid hsl(45 85% 55% / 0.3)",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                <MessageSquare size={13} />
                Ask AI about this chart
              </button>
            </div>
          </div>

          {/* ── Both-but-one-line warning ── */}
          {bothButOneLine && missingType && (
            <div
              style={{
                background: "hsl(35 80% 95%)",
                border: "1px solid hsl(35 70% 75%)",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 16,
                fontSize: 13,
                color: "hsl(30 60% 30%)",
              }}
            >
              ⚠️ No data available for <strong>{missingType}</strong> with {rooms} bedroom
              {rooms > 1 ? "s" : ""} in this area. Showing only the available property type.
            </div>
          )}

          {/* ── Chart ── */}
          <div style={{ width: "100%", height: 360 }}>
            {loading ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "hsl(210 40% 50%)",
                  fontSize: 14,
                }}
              >
                <span style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
                  Loading rent data…
                </span>
              </div>
            ) : error ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "hsl(0 60% 50%)",
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            ) : chartData.length === 0 ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "hsl(210 40% 50%)",
                  fontSize: 14,
                }}
              >
                No data for the selected filters.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="hsl(35 15% 88%)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "hsl(210 40% 45%)", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(35 15% 85%)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatAED}
                    tick={{ fill: "hsl(210 40% 45%)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={64}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 12, color: "hsl(210 40% 35%)" }}
                  />
                  {(property === "apartment" || property === "both") && (
                    <Line
                      type="monotone"
                      dataKey="Apartment"
                      stroke="hsl(45 85% 50%)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: "hsl(45 85% 50%)" }}
                      connectNulls
                    />
                  )}
                  {(property === "villa" || property === "both") && (
                    <Line
                      type="monotone"
                      dataKey="Villa"
                      stroke="hsl(160 65% 38%)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: "hsl(160 65% 38%)" }}
                      connectNulls
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "hsl(210 40% 50%)",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", gap: 4 }}>{children}</div>
    </div>
  );
}

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
      style={{
        padding: "5px 13px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        border: active
          ? "1.5px solid hsl(45 85% 55%)"
          : "1.5px solid hsl(35 15% 82%)",
        background: active
          ? "linear-gradient(135deg, hsl(210 80% 12%), hsl(210 60% 20%))"
          : disabled
          ? "hsl(35 10% 94%)"
          : "hsl(25 20% 98%)",
        color: active
          ? "hsl(45 85% 62%)"
          : disabled
          ? "hsl(210 20% 75%)"
          : "hsl(210 40% 35%)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s ease",
        opacity: disabled ? 0.55 : 1,
        outline: "none",
      }}
    >
      {label}
    </button>
  );
}