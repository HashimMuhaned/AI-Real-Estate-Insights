import { db } from "@/db";
import { sql } from "drizzle-orm";

export type YieldRow = {
  area: string;
  avgPrice: number;
  avgRent: number;
  yield: number;
};

export async function getYieldData(): Promise<YieldRow[]> {
  const result = await db.execute(sql`
    WITH price AS (
      SELECT
        t.area_id,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.actual_worth) AS avg_price
      FROM transactions t
      WHERE t.actual_worth IS NOT NULL
      GROUP BY t.area_id
    ),
    rent AS (
      SELECT
        r.area_id,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.annual_amount) AS avg_rent
      FROM rents r
      WHERE r.annual_amount IS NOT NULL
      GROUP BY r.area_id
    ),
    area_names AS (
      SELECT DISTINCT ON (area_id)
        area_id,
        commercial_name
      FROM area_commercial_mapping
      ORDER BY area_id, confidence_score DESC NULLS LAST
    )
    SELECT
      an.commercial_name AS area,
      p.avg_price,
      r.avg_rent,
      (r.avg_rent / NULLIF(p.avg_price, 0)) * 100 AS yield
    FROM price p
    JOIN rent r USING (area_id)
    JOIN area_names an USING (area_id)
  `);

  const rows = result as any[];

  console.log("yield data: ", rows)
  return rows.map((r) => ({
    area: r.area,
    avgPrice: Number(r.avg_price),
    avgRent: Number(r.avg_rent),
    yield: Number(Number(r.yield).toFixed(2)),
  }));
}