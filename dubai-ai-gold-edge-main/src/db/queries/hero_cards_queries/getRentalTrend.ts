import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function getRentalTrend() {
  const result = await db.execute(sql`
    WITH monthly_rent AS (
      SELECT
        DATE_TRUNC('month', contract_start_date) AS month_date,
        TO_CHAR(DATE_TRUNC('month', contract_start_date), 'YYYY-MM') AS month_key,
        AVG(annual_amount)::numeric AS mean_rent
      FROM rents
      WHERE
        annual_amount IS NOT NULL
        AND contract_start_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', contract_start_date)
    )

    SELECT
      month_date,
      month_key,
      mean_rent
    FROM monthly_rent
    ORDER BY month_date;
  `);

  const rows = result as any[];

  // -----------------------------
  // FIXED 7 POINT TIME WINDOW
  // -----------------------------
  const labels: string[] = [];
  const keys: string[] = [];

  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  start.setDate(1);

  for (let i = 0; i < 7; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    keys.push(key);

    labels.push(
      d.toLocaleString("en-US", { month: "short", year: "2-digit" })
    );
  }

  const indexMap = new Map<string, number>();
  keys.forEach((k, i) => indexMap.set(k, i));

  const values = Array(7).fill(0);

  rows.forEach((r) => {
    const idx = indexMap.get(r.month_key);
    if (idx !== undefined) {
      values[idx] = Number(r.mean_rent);
    }
  });

  // -----------------------------
  // GROWTH (first → last non-zero)
  // -----------------------------
  const clean = values.filter(v => v > 0);

  const first = clean[0] ?? 0;
  const last = clean[clean.length - 1] ?? 0;

  const growth =
    first > 0 ? ((last - first) / first) * 100 : 0;

  // -----------------------------
  // PEAK ANNOTATION
  // -----------------------------
  let maxIndex = 0;
  let maxValue = 0;

  values.forEach((v, i) => {
    if (v > maxValue) {
      maxValue = v;
      maxIndex = i;
    }
  });

  return {
    labels,
    values,
    color: "#06b6d4",
    annotation: {
      index: maxIndex,
      label: "Peak",
    },
    kpi: `${growth >= 0 ? "+" : ""}${Math.round(growth)}%`,
  };
}