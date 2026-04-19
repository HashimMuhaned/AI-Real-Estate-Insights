import { db } from "@/db";
import { sql } from "drizzle-orm";

type Row = {
  area: string | null;
  year: number;
  quarter: number;
  median_price: number;
};

export async function getPriceTrendData() {
  console.log("🚀 getPriceTrendData CALLED");

  const result = await db.execute(sql`
    WITH areas AS (
      SELECT DISTINCT ON (area_id)
        area_id,
        commercial_name
      FROM area_commercial_mapping
      WHERE commercial_name IS NOT NULL
      ORDER BY area_id, confidence_score DESC NULLS LAST
    ),

    quarterly_prices AS (
      SELECT
        t.area_id,
        EXTRACT(YEAR FROM t.instance_date)::int AS year,
        EXTRACT(QUARTER FROM t.instance_date)::int AS quarter,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.actual_worth)::float AS median_price
      FROM transactions t
      WHERE t.actual_worth IS NOT NULL
        AND t.instance_date IS NOT NULL
      GROUP BY t.area_id, year, quarter
    )

    SELECT
      a.commercial_name AS area,
      qp.year,
      qp.quarter,
      qp.median_price
    FROM quarterly_prices qp
    JOIN areas a ON a.area_id = qp.area_id
    ORDER BY a.commercial_name, qp.year, qp.quarter
  `);

  const rows = result as unknown as Row[];

  console.log("RAW price trend rows:", rows.length);

  const data: Record<string, any[]> = {};

  for (const row of rows) {
    if (!row.area) continue;

    const period = `Q${row.quarter} ${row.year}`;

    if (!data[row.area]) {
      data[row.area] = [];
    }

    data[row.area].push({
      period,
      price: Number(row.median_price || 0),
    });
  }

  console.log("FINAL priceTrendData:", data);

  return data;
}