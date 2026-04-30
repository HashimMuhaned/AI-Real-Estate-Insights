import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function getRentTrend({
  areaId,
  category,
  rooms,
  range,
}: {
  areaId: number;
  category?: string | null;
  rooms?: number | null;
  range: string;
}) {
  return await db.execute(sql`
    WITH filtered_rents AS (
        SELECT
            DATE_TRUNC('month', r.contract_start_date) AS month,
            r.annual_amount,

            -- ✅ Category mapping
            CASE
                WHEN r.ejari_bus_property_type_id = 5 
                     OR r.ejari_property_type_id = 19 THEN 'Villa'
                WHEN r.ejari_bus_property_type_id = 3 
                     AND r.ejari_property_type_id = 1 THEN 'Apartment'
                ELSE NULL
            END AS property_category,

            -- ✅ Room mapping
            CASE
                WHEN r.ejari_property_sub_type_en_id = 54 THEN 1
                WHEN r.ejari_property_sub_type_en_id = 17 THEN 2
                WHEN r.ejari_property_sub_type_en_id = 31 THEN 3
                WHEN r.ejari_property_sub_type_en_id = 4 THEN 4
                WHEN r.ejari_property_sub_type_en_id = 10 THEN 5
                WHEN r.ejari_property_sub_type_en_id = 8 THEN 6
                ELSE NULL
            END AS rooms

        FROM rents r

        WHERE
            r.annual_amount IS NOT NULL
            AND r.contract_start_date IS NOT NULL
            AND r.area_id = ${areaId}

            -- ✅ CATEGORY FILTER
            AND (
                COALESCE(${category}::text, '') = ''
                OR (
                    ${category}::text = 'villa'
                    AND (
                        r.ejari_bus_property_type_id = 5
                        OR r.ejari_property_type_id = 19
                    )
                )
                OR (
                    ${category}::text = 'apartment'
                    AND (
                        r.ejari_bus_property_type_id = 3
                        AND r.ejari_property_type_id = 1
                    )
                )
            )

            -- ✅ ROOM FILTER
            AND (
                ${rooms}::int IS NULL
                OR (
                    CASE
                        WHEN r.ejari_property_sub_type_en_id = 54 THEN 1
                        WHEN r.ejari_property_sub_type_en_id = 17 THEN 2
                        WHEN r.ejari_property_sub_type_en_id = 31 THEN 3
                        WHEN r.ejari_property_sub_type_en_id = 4 THEN 4
                        WHEN r.ejari_property_sub_type_en_id = 10 THEN 5
                        WHEN r.ejari_property_sub_type_en_id = 8 THEN 6
                        ELSE NULL
                    END = ${rooms}::int
                )
            )

            -- ✅ DATE RANGE
            AND r.contract_start_date >= CURRENT_DATE -
                CASE 
                    WHEN ${range}::text = '1 year' THEN INTERVAL '1 year'
                    WHEN ${range}::text = '5 years' THEN INTERVAL '5 years'
                    ELSE INTERVAL '3 years'
                END
    ),

    monthly_median AS (
        SELECT
            month,
            property_category,
            rooms,
            percentile_cont(0.5) 
            WITHIN GROUP (ORDER BY annual_amount) AS median_rent
        FROM filtered_rents
        WHERE property_category IS NOT NULL
        AND rooms IS NOT NULL
        GROUP BY month, property_category, rooms
    )

    SELECT *
    FROM monthly_median
    ORDER BY property_category, rooms, month;
  `);
}
