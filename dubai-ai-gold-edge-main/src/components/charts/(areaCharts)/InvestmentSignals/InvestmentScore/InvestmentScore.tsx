import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface InvestmentScoreData {
  area_id: string;
  median_price: number | null;
  median_rent: number | null;
  transaction_count: string;
  previous_transaction_count: string;
  price_volatility: number | null;
  rent_volatility: number | null;
  yield_score: number | null;
  growth_score: number | null;
  liquidity_score: number | null;
  volatility_score: number | null;
  final_score: number | null;
}

type PropertyType = "all" | "apartment" | "villa";
type RangeOption = "1 year" | "3 years" | "5 years";
type RoomOption = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

// ── Constants ─────────────────────────────────────────────────────────────────
const ROOM_CONFIGS: Record<PropertyType, Set<RoomOption>> = {
  all: new Set([0, 1, 2, 3, 4, 5, 6, 7]),
  apartment: new Set([0, 1, 2, 3, 4]),
  villa: new Set([0, 2, 3, 4, 5]),
};

const RANGE_OPTIONS: RangeOption[] = ["1 year", "3 years", "5 years"];
const ROOM_LABELS: Record<RoomOption, string> = {
  0: "Any",
  1: "1 BR",
  2: "2 BR",
  3: "3 BR",
  4: "4 BR",
  5: "5 BR",
  6: "6 BR",
  7: "7 BR",
};

const SCORE_COMPONENTS = [
  {
    key: "yield_score",
    label: "Yield",
    weight: 25,
    icon: "📈",
    desc: "Area vs Dubai avg yield",
  },
  {
    key: "growth_score",
    label: "Growth",
    weight: 25,
    icon: "🚀",
    desc: "YoY price & rent growth",
  },
  {
    key: "liquidity_score",
    label: "Liquidity",
    weight: 20,
    icon: "💧",
    desc: "Transaction volume & growth",
  },
  {
    key: "volatility_score",
    label: "Stability",
    weight: 15,
    icon: "🛡️",
    desc: "Price & rent dispersion",
  },
] as const;

// Supply Risk is derived/estimated when API returns null
const SUPPLY_RISK_WEIGHT = 15;

// ── Helpers ───────────────────────────────────────────────────────────────────
function getAreaIdFromUrl(): string {
  const parts = window.location.pathname.split("-");
  const last = parts[parts.length - 1];
  return /^\d+$/.test(last) ? last : "409";
}

function clamp(v: number | null, fallback = 50): number {
  if (v === null || v === undefined) return fallback;
  return Math.max(0, Math.min(100, v));
}

function computeFinalScore(data: InvestmentScoreData): number {
  const y = clamp(data.yield_score, 50);
  const g = clamp(data.growth_score, 50);
  const l = clamp(data.liquidity_score, 50);
  const vo = clamp(data.volatility_score, 50);
  // supply risk not in API yet – neutral 50
  const s = 50;
  return Math.round(y * 0.25 + g * 0.25 + l * 0.2 + vo * 0.15 + s * 0.15);
}

function scoreLabel(score: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (score >= 80)
    return {
      label: "Exceptional",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    };
  if (score >= 65)
    return {
      label: "Strong Opportunity",
      color: "text-amber-600",
      bg: "bg-amber-50",
    };
  if (score >= 50)
    return { label: "Moderate", color: "text-blue-600", bg: "bg-blue-50" };
  if (score >= 35)
    return {
      label: "Below Average",
      color: "text-orange-600",
      bg: "bg-orange-50",
    };
  return { label: "High Risk", color: "text-red-600", bg: "bg-red-50" };
}

function buildUrl(
  areaId: string,
  type: PropertyType,
  rooms: RoomOption,
  range: RangeOption,
): string {
  const base = `/api/areaCharts/investment_signals/investment_score?areaId=${areaId}`;
  const params: string[] = [];
  if (type !== "all") params.push(`category=${type}`);
  if (rooms !== 0) params.push(`rooms=${rooms}`);
  if (range !== "1 year") params.push(`range=${range}`);
  return params.length ? `${base}&${params.join("&")}` : base;
}

// ── Circular Gauge ────────────────────────────────────────────────────────────
function CircularGauge({
  score,
  loading,
}: {
  score: number;
  loading: boolean;
}) {
  const r = 88;
  const cx = 110;
  const cy = 110;
  const circumference = 2 * Math.PI * r;
  // 270° arc starting from bottom-left
  const arcLen = circumference * 0.75;
  const offset = arcLen - (arcLen * score) / 100;

  const { label, color } = scoreLabel(score);

  // gradient colour stops based on score
  const gaugeColor =
    score >= 80
      ? "#10b981"
      : score >= 65
        ? "#f59e0b"
        : score >= 50
          ? "#3b82f6"
          : score >= 35
            ? "#f97316"
            : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 220, height: 220 }}>
        <svg width="220" height="220" viewBox="0 0 220 220">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gaugeColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={gaugeColor} stopOpacity="1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="hsl(35 15% 85%)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${arcLen} ${circumference}`}
            strokeDashoffset="0"
            transform={`rotate(135 ${cx} ${cy})`}
          />
          {/* Active arc */}
          {!loading && (
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="url(#gaugeGrad)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${arcLen} ${circumference}`}
              strokeDashoffset={offset}
              transform={`rotate(135 ${cx} ${cy})`}
              style={{
                transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)",
              }}
              filter="url(#glow)"
            />
          )}
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((v) => {
            const angle = (135 + v * 2.7) * (Math.PI / 180);
            const x1 = cx + (r - 18) * Math.cos(angle);
            const y1 = cy + (r - 18) * Math.sin(angle);
            const x2 = cx + (r - 8) * Math.cos(angle);
            const y2 = cy + (r - 8) * Math.sin(angle);
            return (
              <line
                key={v}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(210 40% 35%)"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />
            );
          })}
        </svg>
        {/* Centre text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ paddingTop: 16 }}
        >
          {loading ? (
            <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
          ) : (
            <>
              <span
                className="font-serif text-5xl font-bold"
                style={{ color: gaugeColor, lineHeight: 1 }}
              >
                {score}
              </span>
              <span className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">
                / 100
              </span>
            </>
          )}
        </div>
      </div>
      {!loading && (
        <span className={`mt-2 text-sm font-semibold tracking-wide ${color}`}>
          {label}
        </span>
      )}
    </div>
  );
}

// ── Component Bar ─────────────────────────────────────────────────────────────
function ComponentBar({
  label,
  weight,
  score,
  icon,
  desc,
  loading,
}: {
  label: string;
  weight: number;
  score: number | null;
  icon: string;
  desc: string;
  loading: boolean;
}) {
  const val = clamp(score, 50);
  const barColor =
    val >= 80
      ? "bg-emerald-500"
      : val >= 65
        ? "bg-amber-400"
        : val >= 50
          ? "bg-blue-500"
          : val >= 35
            ? "bg-orange-400"
            : "bg-red-500";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <div>
            <span className="text-sm font-semibold text-foreground">
              {label}
            </span>
            <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
              {desc}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">×{weight}%</span>
          {loading ? (
            <div className="w-8 h-4 rounded bg-muted animate-pulse" />
          ) : (
            <span
              className={`text-sm font-bold tabular-nums ${
                val >= 65
                  ? "text-emerald-600"
                  : val >= 35
                    ? "text-amber-600"
                    : "text-red-500"
              }`}
            >
              {score !== null ? Math.round(val) : "—"}
            </span>
          )}
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        {!loading && (
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${val}%` }}
          />
        )}
        {loading && (
          <div className="h-full w-1/3 rounded-full bg-border animate-pulse" />
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function InvestmentScore() {
  const [areaId] = useState(() => getAreaIdFromUrl());
  const [propertyType, setPropertyType] = useState<PropertyType>("all");
  const [rooms, setRooms] = useState<RoomOption>(0);
  const [range, setRange] = useState<RangeOption>("1 year");
  const [data, setData] = useState<InvestmentScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // When property type changes, reset rooms if no longer valid
  useEffect(() => {
    if (rooms !== 0 && !ROOM_CONFIGS[propertyType].has(rooms)) {
      setRooms(0);
    }
  }, [propertyType]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = buildUrl(areaId, propertyType, rooms, range);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: InvestmentScoreData = await res.json();
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [areaId, propertyType, rooms, range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const finalScore = data
    ? data.final_score !== null
      ? clamp(data.final_score)
      : computeFinalScore(data)
    : 0;
  const { bg } = scoreLabel(finalScore);

  const availableRooms = ROOM_CONFIGS[propertyType];
  const noRoomsForType = rooms !== 0 && !availableRooms.has(rooms);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      {/* ── Filters ── */}
      <div className="luxury-card p-4 space-y-4">
        {/* Property Type */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Property Type
          </label>
          <div className="flex gap-2 flex-wrap">
            {(["all", "apartment", "villa"] as PropertyType[]).map((t) => (
              <button
                key={t}
                onClick={() => setPropertyType(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
                  propertyType === t
                    ? "border-transparent text-primary-foreground shadow-md"
                    : "border-border text-foreground hover:border-accent bg-background"
                }`}
                style={
                  propertyType === t
                    ? { background: "var(--gradient-primary)" }
                    : {}
                }
              >
                {t === "all"
                  ? "All Types"
                  : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bedrooms */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Bedrooms
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {([0, 1, 2, 3, 4, 5, 6, 7] as RoomOption[]).map((r) => {
              const disabled = r !== 0 && !availableRooms.has(r);
              return (
                <button
                  key={r}
                  disabled={disabled}
                  onClick={() => !disabled && setRooms(r)}
                  title={
                    disabled ? `Not available for ${propertyType}` : undefined
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 ${
                    disabled
                      ? "border-border text-muted-foreground/40 bg-muted/50 cursor-not-allowed line-through"
                      : rooms === r
                        ? "border-transparent text-primary-foreground shadow"
                        : "border-border text-foreground hover:border-accent bg-background"
                  }`}
                  style={
                    !disabled && rooms === r
                      ? { background: "var(--gradient-gold)" }
                      : {}
                  }
                >
                  {ROOM_LABELS[r]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Time Window
          </label>
          <div className="flex gap-2">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setRange(opt)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
                  range === opt
                    ? "border-transparent text-primary-foreground shadow"
                    : "border-border text-foreground hover:border-accent bg-background"
                }`}
                style={
                  range === opt ? { background: "var(--gradient-primary)" } : {}
                }
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── No data warning ── */}
      {noRoomsForType && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 flex items-center gap-3 text-sm text-amber-700">
          <span className="text-lg">⚠️</span>
          <span>
            <strong>{rooms} BR</strong> units are not tracked for{" "}
            <strong>{propertyType}s</strong>. Select a different room count or
            property type.
          </span>
        </div>
      )}

      {/* ── Score Card ── */}
      <div
        className={`luxury-card p-6 transition-all duration-500 ${!loading && data ? bg + "/30" : ""}`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Gauge */}
          <div className="flex-shrink-0">
            <CircularGauge score={finalScore} loading={loading} />
          </div>

          {/* Components */}
          <div className="flex-1 w-full space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-serif text-lg font-semibold text-foreground">
                Score Breakdown
              </h3>
              {data && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {parseInt(data.transaction_count).toLocaleString()} txns
                </span>
              )}
            </div>

            {SCORE_COMPONENTS.map(({ key, label, weight, icon, desc }) => (
              <ComponentBar
                key={key}
                label={label}
                weight={weight}
                score={
                  data
                    ? (data[key as keyof InvestmentScoreData] as number | null)
                    : null
                }
                icon={icon}
                desc={desc}
                loading={loading}
              />
            ))}

            {/* Supply Risk – static neutral since not in API */}
            <ComponentBar
              label="Supply Risk"
              weight={SUPPLY_RISK_WEIGHT}
              score={null}
              icon="🏗️"
              desc="Pipeline & upcoming projects"
              loading={loading}
            />
          </div>
        </div>

        {/* Footer note */}
        {!loading && !error && (
          <p className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
            Composite score weighted across 5 signals. Supply Risk score pending
            pipeline data integration.
          </p>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
            <span>⚠️</span>
            <span>Could not load score data: {error}</span>
            <button
              onClick={fetchData}
              className="ml-auto text-xs underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
