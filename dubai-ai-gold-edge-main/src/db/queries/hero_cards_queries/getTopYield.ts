import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function getTopYieldAreas() {
  const result = await db.execute(sql`
    WITH rent_data AS (
      SELECT
        r.area_id,
        PERCENTILE_CONT(0.5) 
          WITHIN GROUP (ORDER BY r.annual_amount)::numeric AS median_rent
      FROM rents r
      WHERE 
        r.ejari_bus_property_type_id = 3
        AND r.ejari_property_type_id = 1
        AND r.ejari_property_sub_type_en_id = 54
        AND r.annual_amount IS NOT NULL
      GROUP BY r.area_id
    ),

    transaction_data AS (
      SELECT
        t.area_id,
        PERCENTILE_CONT(0.5) 
          WITHIN GROUP (ORDER BY t.actual_worth)::numeric AS median_price
      FROM transactions t
      WHERE 
        t.property_type_id = 3
        AND t.property_sub_type_id = 60
        AND substring(t.num_rooms_en FROM '^[0-9]+') = '1'
        AND t.actual_worth IS NOT NULL
      GROUP BY t.area_id
    ),

    roi_data AS (
      SELECT
        r.area_id,
        ROUND(
          ((r.median_rent / NULLIF(t.median_price, 0)) * 100)::numeric,
          2
        ) AS roi
      FROM rent_data r
      JOIN transaction_data t ON r.area_id = t.area_id
    )

    SELECT
      ROW_NUMBER() OVER (ORDER BY roi DESC) AS rank,
      acm.commercial_name AS area,
      roi
    FROM roi_data rd
    JOIN area_commercial_mapping acm 
      ON rd.area_id = acm.area_id
    ORDER BY rank
    LIMIT 5;
  `);

  return result;
}