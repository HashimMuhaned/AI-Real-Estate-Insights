import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  RadialBarChart, RadialBar, PieChart, Pie, Cell,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

// ── Shared demo data ──────────────────────────────────────────────
const salesTrend = [
  { month: "Jul", volume: 1820, value: 4.2, avg: 2.3 },
  { month: "Aug", volume: 2100, value: 5.1, avg: 2.4 },
  { month: "Sep", volume: 1950, value: 4.8, avg: 2.5 },
  { month: "Oct", volume: 2340, value: 6.2, avg: 2.6 },
  { month: "Nov", volume: 2600, value: 7.1, avg: 2.7 },
  { month: "Dec", volume: 2200, value: 5.9, avg: 2.6 },
  { month: "Jan", volume: 2450, value: 6.5, avg: 2.8 },
  { month: "Feb", volume: 2800, value: 7.8, avg: 2.9 },
  { month: "Mar", volume: 3100, value: 8.9, avg: 3.0 },
  { month: "Apr", volume: 2950, value: 8.2, avg: 3.1 },
  { month: "May", volume: 3300, value: 9.4, avg: 3.2 },
  { month: "Jun", volume: 3580, value: 10.2, avg: 3.3 },
];

const propertyMix = [
  { name: "Apartments", value: 54, color: "hsl(210 80% 12%)" },
  { name: "Villas", value: 22, color: "hsl(45 85% 55%)" },
  { name: "Townhouses", value: 14, color: "hsl(160 75% 35%)" },
  { name: "Commercial", value: 10, color: "hsl(210 50% 45%)" },
];

const topAreas = [
  { area: "Dubai Marina", txn: 890, value: 3.2 },
  { area: "Downtown", txn: 720, value: 4.1 },
  { area: "Palm Jumeirah", txn: 410, value: 5.8 },
  { area: "JVC", txn: 1100, value: 1.9 },
  { area: "Business Bay", txn: 650, value: 2.7 },
];

const rentalYield = [
  { type: "Studios", yield: 7.2, rent: 52 },
  { type: "1BR", yield: 6.8, rent: 78 },
  { type: "2BR", yield: 6.1, rent: 115 },
  { type: "3BR", yield: 5.4, rent: 168 },
  { type: "Villas", yield: 4.9, rent: 240 },
];

const yoyComparison = [
  { quarter: "Q3 23", y2023: 5.8, y2024: 7.1 },
  { quarter: "Q4 23", y2023: 6.2, y2024: 7.8 },
  { quarter: "Q1 24", y2023: 6.9, y2024: 8.4 },
  { quarter: "Q2 24", y2023: 7.3, y2024: 9.6 },
  { quarter: "Q3 24", y2023: 7.1, y2024: 10.2 },
];

// ── Tooltip styles ────────────────────────────────────────────────
const TooltipStyle = {
  contentStyle: {
    background: "hsl(25 20% 98%)",
    border: "1px solid hsl(35 15% 85%)",
    borderRadius: "10px",
    fontSize: "11px",
    boxShadow: "0 4px 20px hsl(210 80% 12% / 0.10)",
    padding: "8px 12px",
  },
  labelStyle: { color: "hsl(210 80% 12%)", fontWeight: 600 },
  itemStyle: { color: "hsl(210 40% 35%)" },
};

// ── Individual chart components ───────────────────────────────────

export function SalesTrendChart({ compact = false }) {
  const h = compact ? 140 : 220;
  return (
    <ResponsiveContainer width="100%" height={h}>
      <ComposedChart data={salesTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradVolume" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(210 80% 12%)" stopOpacity={0.18} />
            <stop offset="95%" stopColor="hsl(210 80% 12%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(45 85% 55%)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="hsl(45 85% 55%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 15% 85%)" strokeOpacity={0.6} />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(210 40% 35%)" }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(210 40% 35%)" }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(45 85% 55%)" }} axisLine={false} tickLine={false} />
        <Tooltip {...TooltipStyle} />
        {!compact && <Legend wrapperStyle={{ fontSize: 11 }} />}
        <Area yAxisId="left" type="monotone" dataKey="volume" name="Transactions" stroke="hsl(210 80% 12%)" strokeWidth={2} fill="url(#gradVolume)" />
        <Line yAxisId="right" type="monotone" dataKey="value" name="Value (AED B)" stroke="hsl(45 85% 55%)" strokeWidth={2.5} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function PropertyMixChart({ compact = false }) {
  const h = compact ? 130 : 200;
  return (
    <ResponsiveContainer width="100%" height={h}>
      <PieChart>
        <Pie
          data={propertyMix}
          cx="50%"
          cy="50%"
          innerRadius={compact ? 30 : 50}
          outerRadius={compact ? 55 : 80}
          paddingAngle={3}
          dataKey="value"
        >
          {propertyMix.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          {...TooltipStyle}
          formatter={(v) => [`${v}%`, ""]}
        />
        {!compact && (
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11 }}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TopAreasChart({ compact = false }) {
  const h = compact ? 140 : 220;
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={topAreas} layout="vertical" margin={{ top: 4, right: 16, left: compact ? 60 : 80, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 15% 85%)" strokeOpacity={0.6} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(210 40% 35%)" }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="area" tick={{ fontSize: 10, fill: "hsl(210 40% 35%)" }} axisLine={false} tickLine={false} width={compact ? 60 : 80} />
        <Tooltip {...TooltipStyle} />
        <Bar dataKey="txn" name="Transactions" radius={[0, 6, 6, 0]} fill="hsl(210 80% 12%)" />
        <Bar dataKey="value" name="Value (AED B)" radius={[0, 6, 6, 0]} fill="hsl(45 85% 55%)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RentalYieldChart({ compact = false }) {
  const h = compact ? 130 : 200;
  return (
    <ResponsiveContainer width="100%" height={h}>
      <ComposedChart data={rentalYield} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 15% 85%)" strokeOpacity={0.6} />
        <XAxis dataKey="type" tick={{ fontSize: 10, fill: "hsl(210 40% 35%)" }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(210 40% 35%)" }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(160 75% 35%)" }} axisLine={false} tickLine={false} />
        <Tooltip {...TooltipStyle} />
        {!compact && <Legend wrapperStyle={{ fontSize: 11 }} />}
        <Bar yAxisId="left" dataKey="rent" name="Avg Rent (K AED)" fill="hsl(35 25% 80%)" radius={[4, 4, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="yield" name="Yield %" stroke="hsl(160 75% 35%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(160 75% 35%)" }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function YoYComparisonChart({ compact = false }) {
  const h = compact ? 130 : 200;
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={yoyComparison} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 15% 85%)" strokeOpacity={0.6} />
        <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: "hsl(210 40% 35%)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "hsl(210 40% 35%)" }} axisLine={false} tickLine={false} />
        <Tooltip {...TooltipStyle} formatter={(v) => [`AED ${v}B`]} />
        {!compact && <Legend wrapperStyle={{ fontSize: 11 }} />}
        <Bar dataKey="y2023" name="2023" fill="hsl(35 25% 80%)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="y2024" name="2024" fill="hsl(210 80% 12%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}