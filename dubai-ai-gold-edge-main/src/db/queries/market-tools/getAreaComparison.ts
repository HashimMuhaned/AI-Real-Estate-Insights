import { db } from "@/db";
import { sql } from "drizzle-orm";

type AreaRow = {
  area: string | null;
  median_price: number | string | null;
  median_rent: number | string | null;
  recent_price: number | string | null;
  old_price: number | string | null;
};

export async function getAreaComparisonData() {
  console.log("🚀 getAreaComparisonData CALLED");

  const result = await db.execute(sql`
    WITH areas AS (
      SELECT DISTINCT ON (area_id)
        area_id,
        commercial_name
      FROM area_commercial_mapping
      WHERE commercial_name IS NOT NULL
      ORDER BY area_id, confidence_score DESC NULLS LAST
    ),

    price AS (
      SELECT 
        t.area_id,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.actual_worth)::float AS median_price
      FROM transactions t
      WHERE t.actual_worth IS NOT NULL
      GROUP BY t.area_id
    ),

    rent AS (
      SELECT 
        r.area_id,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.annual_amount)::float AS median_rent
      FROM rents r
      WHERE r.annual_amount IS NOT NULL
      GROUP BY r.area_id
    ),

    -- ✅ FIXED: split into two CTEs instead of FILTER
    growth_recent AS (
      SELECT
        t.area_id,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.actual_worth)::float AS recent_price
      FROM transactions t
      WHERE t.actual_worth IS NOT NULL
        AND t.instance_date >= CURRENT_DATE - INTERVAL '1 year'
      GROUP BY t.area_id
    ),

    growth_old AS (
      SELECT
        t.area_id,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.actual_worth)::float AS old_price
      FROM transactions t
      WHERE t.actual_worth IS NOT NULL
        AND t.instance_date < CURRENT_DATE - INTERVAL '1 year'
      GROUP BY t.area_id
    )

    SELECT 
      a.commercial_name AS area,
      p.median_price,
      r.median_rent,
      gr.recent_price,
      go.old_price
    FROM areas a
    LEFT JOIN price p ON p.area_id = a.area_id
    LEFT JOIN rent r ON r.area_id = a.area_id
    LEFT JOIN growth_recent gr ON gr.area_id = a.area_id
    LEFT JOIN growth_old go ON go.area_id = a.area_id
  `);

  const rows = result as unknown as AreaRow[];

  console.log("RAW area rows count:", rows.length);

  const data: Record<string, any> = {};

  const toNum = (v: any) => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  for (const row of rows) {
    if (!row.area) continue;

    const medianPrice = toNum(row.median_price);
    const medianRent = toNum(row.median_rent);
    const recentPrice = toNum(row.recent_price);
    const oldPrice = toNum(row.old_price);

    const growth =
      oldPrice && recentPrice
        ? ((recentPrice - oldPrice) / oldPrice) * 100
        : 0;

    const roi =
      medianPrice && medianRent
        ? (medianRent / medianPrice) * 100
        : 0;

    data[row.area] = {
      avgPrice: medianPrice,
      avgRent: medianRent,
      roi: Number(roi.toFixed(1)),
      priceGrowth: Number(growth.toFixed(1)),
    };
  }

  console.log("FINAL areaComparisonData:", data);

  return data;
}