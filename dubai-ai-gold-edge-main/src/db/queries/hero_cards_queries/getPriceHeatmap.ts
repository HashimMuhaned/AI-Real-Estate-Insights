import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function getPriceHeatmap() {
  const result = await db.execute(sql`
    WITH price_data AS (
      SELECT
        t.area_id,
        PERCENTILE_CONT(0.5)
          WITHIN GROUP (ORDER BY t.meter_sale_price)::numeric AS price_per_sqft
      FROM transactions t
      WHERE 
        t.property_type_id = 3
        AND t.property_sub_type_id = 60
        AND substring(t.num_rooms_en FROM '^[0-9]+') = '1'
        AND t.meter_sale_price IS NOT NULL
      GROUP BY t.area_id
    ),

    joined AS (
      SELECT
        acm.commercial_name AS label,
        p.price_per_sqft AS value
      FROM price_data p
      JOIN area_commercial_mapping acm
        ON p.area_id = acm.area_id
      WHERE acm.commercial_name IS NOT NULL
    ),

    normalized AS (
      SELECT
        label,
        value,
        value / MAX(value) OVER () AS pct
      FROM joined
    )

    SELECT
      label,
      ROUND(value, 0) AS value,
      ROUND(pct::numeric, 2) AS pct
    FROM normalized
    ORDER BY value DESC
    LIMIT 8;
  `);

  // KPI (average across selected areas)
  const avg =
    result.reduce((sum: number, r: any) => sum + Number(r.value), 0) /
    result.length;

  return {
    avg: Math.round(avg).toLocaleString("en-AE", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }),
    items: result,
  };
}