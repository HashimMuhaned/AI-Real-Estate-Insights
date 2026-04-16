import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function getPriceTrends() {
  const areaIds = [441, 526, 409];

  const result = await db.execute(sql`
    WITH monthly_prices AS (
      SELECT
        t.area_id,
        TO_CHAR(DATE_TRUNC('month', t.instance_date), 'YYYY-MM') AS month_key,
        AVG(t.actual_worth)::numeric AS avg_price
      FROM transactions t
      WHERE
        t.area_id IN (441, 526, 409)
        AND t.actual_worth IS NOT NULL
        AND t.instance_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '13 months'
      GROUP BY
        t.area_id,
        DATE_TRUNC('month', t.instance_date)
    ),
    area_names AS (
      SELECT DISTINCT ON (area_id)
        area_id,
        commercial_name
      FROM area_commercial_mapping
      WHERE area_id IN (441, 526, 409)
      ORDER BY area_id, confidence_score DESC NULLS LAST
    )
    SELECT
      mp.area_id,
      an.commercial_name,
      mp.month_key,
      mp.avg_price
    FROM monthly_prices mp
    LEFT JOIN area_names an
      ON mp.area_id = an.area_id
    ORDER BY mp.month_key, mp.area_id;
  `);

  const rows = result as any[];

  const colorMap = ["#3b82f6", "#22c55e", "#f59e0b"];

  const monthKeys = Array.from(new Set(rows.map((r) => r.month_key))).sort();
  const months = monthKeys.map((k) => {
    const d = new Date(`${k}-01T00:00:00Z`);
    return d.toLocaleString("en-US", { month: "short" });
  });

  const monthIndex = new Map<string, number>();
  monthKeys.forEach((k, i) => monthIndex.set(k, i));

  const byArea: Record<string, { label: string; color: string; values: number[] }> = {};

  areaIds.forEach((id, i) => {
    const row = rows.find((r) => Number(r.area_id) === id);
    byArea[String(id)] = {
      label: row?.commercial_name || `Area ${id}`,
      color: colorMap[i],
      values: Array(monthKeys.length).fill(0),
    };
  });

  rows.forEach((r) => {
    const areaKey = String(r.area_id);
    const idx = monthIndex.get(r.month_key);

    if (idx !== undefined && byArea[areaKey]) {
      byArea[areaKey].values[idx] = Number(r.avg_price);
    }
  });

  const series = areaIds.map((id) => byArea[String(id)]).filter(Boolean);

  const growths = series.map((s) => {
    const clean = s.values.filter((v) => v > 0);
    if (clean.length < 2) return 0;

    const first = clean[0];
    const last = clean[clean.length - 1];
    return ((last - first) / first) * 100;
  });

  const bestGrowth = Math.max(...growths);
  const growth = `${bestGrowth >= 0 ? "+" : ""}${Math.round(bestGrowth)}%`;

  return {
    months,
    series,
    growth,
  };
}