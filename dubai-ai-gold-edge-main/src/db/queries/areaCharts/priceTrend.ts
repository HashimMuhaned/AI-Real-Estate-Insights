import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function getPriceTrend({
  areaId,
  category,
  rooms,
  range
}: {
  areaId: number;
  category?: string | null;
  rooms?: number | null;
  range: string;
}) {

  return await db.execute(sql`
    WITH filtered_transactions AS (
        SELECT
            DATE_TRUNC('month', t.instance_date) AS month,
            t.actual_worth,

            CASE
                WHEN pt.property_type = 'Villa' THEN 'Villa'
                WHEN pt.property_type = 'Unit' 
                     AND pst.property_sub_type = 'Flat' THEN 'Apartment'
                ELSE NULL
            END AS property_category,

            CASE 
                WHEN LEFT(t.num_rooms_en, 1) ~ '^[0-9]$' 
                THEN LEFT(t.num_rooms_en, 1)::int
                ELSE NULL
            END AS rooms

        FROM transactions t
        JOIN dim_property_type pt 
            ON t.property_type_id = pt.property_type_id
        LEFT JOIN dim_property_sub_type pst 
            ON t.property_sub_type_id = pst.property_sub_type_id

        WHERE
            t.actual_worth IS NOT NULL
            AND t.area_id = ${areaId}

            -- 🔥 FIX 1: FORCE TEXT TYPE
            AND (
                COALESCE(${category}::text, '') = ''
                OR (
                    ${category}::text = 'villa'
                    AND pt.property_type = 'Villa'
                )
                OR (
                    ${category}::text = 'apartment'
                    AND pt.property_type = 'Unit'
                    AND pst.property_sub_type = 'Flat'
                )
            )

            -- 🔥 FIX 2: FORCE INT TYPE SAFELY
            AND (
                ${rooms}::int IS NULL
                OR (
                    LEFT(t.num_rooms_en, 1) ~ '^[0-9]$'
                    AND LEFT(t.num_rooms_en, 1)::int = ${rooms}::int
                )
            )

            -- 🔥 FIX 3: REMOVE STRING INTERVAL AMBIGUITY
            AND t.instance_date >= CURRENT_DATE -
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
            WITHIN GROUP (ORDER BY actual_worth) AS median_price
        FROM filtered_transactions
        WHERE property_category IS NOT NULL
        AND rooms IS NOT NULL
        GROUP BY month, property_category, rooms
    )

    SELECT *
    FROM monthly_median
    ORDER BY property_category, rooms, month;
  `);
}