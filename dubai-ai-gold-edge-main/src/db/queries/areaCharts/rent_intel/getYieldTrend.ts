import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function getYieldTrend({
  areaId,
  category,
  rooms,
  range
}: {
  areaId?: number | null;
  category?: string | null;
  rooms?: number | null;
  range: string;
}) {

  const interval =
    range === "1 year"
      ? "12 months"
      : range === "5 years"
      ? "60 months"
      : "36 months";

  return await db.execute(sql`

-- =====================================
-- MONTHLY SALE PRICE MEDIAN
-- =====================================
WITH monthly_prices AS (

    SELECT
        DATE_TRUNC('month', t.instance_date) AS month,
        t.area_id,

        CASE
            WHEN pt.property_type = 'Villa' THEN 'Villa'

            WHEN pt.property_type = 'Unit'
                 AND pst.property_sub_type = 'Flat'
            THEN 'Apartment'
        END AS property_category,

        CASE
            WHEN LEFT(t.num_rooms_en, 1) ~ '^[0-9]$'
            THEN LEFT(t.num_rooms_en, 1)::int
        END AS rooms,

        percentile_cont(0.5)
        WITHIN GROUP (ORDER BY t.actual_worth)
        AS median_sale_price

    FROM transactions t

    JOIN dim_property_type pt
        ON t.property_type_id = pt.property_type_id

    LEFT JOIN dim_property_sub_type pst
        ON t.property_sub_type_id = pst.property_sub_type_id

    WHERE
        t.actual_worth IS NOT NULL

        AND t.instance_date >= CURRENT_DATE
            - INTERVAL '${sql.raw(interval)}'

        AND (
            ${areaId}::int IS NULL
            OR t.area_id = ${areaId}::int
        )

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

        AND (
            ${rooms}::int IS NULL

            OR (
                LEFT(t.num_rooms_en, 1) ~ '^[0-9]$'
                AND LEFT(t.num_rooms_en, 1)::int = ${rooms}::int
            )
        )

    GROUP BY
        month,
        t.area_id,
        property_category,
        rooms
),

-- =====================================
-- MONTHLY RENT MEDIAN
-- =====================================
monthly_rents AS (

    SELECT
        DATE_TRUNC('month', r.contract_start_date) AS month,
        r.area_id,

        CASE
            WHEN r.ejari_bus_property_type_id = 5
                 OR r.ejari_property_type_id = 19
            THEN 'Villa'

            WHEN r.ejari_bus_property_type_id = 3
                 AND r.ejari_property_type_id = 1
            THEN 'Apartment'
        END AS property_category,

        CASE
            WHEN r.ejari_property_sub_type_en_id = 54 THEN 1
            WHEN r.ejari_property_sub_type_en_id = 17 THEN 2
            WHEN r.ejari_property_sub_type_en_id = 31 THEN 3
            WHEN r.ejari_property_sub_type_en_id = 4 THEN 4
            WHEN r.ejari_property_sub_type_en_id = 10 THEN 5
            WHEN r.ejari_property_sub_type_en_id = 8 THEN 6
        END AS rooms,

        percentile_cont(0.5)
        WITHIN GROUP (ORDER BY r.annual_amount)
        AS median_rent

    FROM rents r

    WHERE
        r.annual_amount IS NOT NULL

        AND r.contract_start_date >= CURRENT_DATE
            - INTERVAL '${sql.raw(interval)}'

        AND (
            ${areaId}::int IS NULL
            OR r.area_id = ${areaId}::int
        )

    GROUP BY
        month,
        r.area_id,
        property_category,
        rooms
),

-- =====================================
-- YIELD CALC
-- =====================================
yield_calc AS (

    SELECT
        p.month,
        p.area_id,
        p.property_category,
        p.rooms,

        p.median_sale_price,
        r.median_rent,

        ROUND(
            (
                r.median_rent::numeric
                /
                NULLIF(p.median_sale_price::numeric, 0)
            ) * 100,
            2
        ) AS yield_percent

    FROM monthly_prices p

    JOIN monthly_rents r
        ON p.month = r.month
        AND p.area_id = r.area_id
        AND p.property_category = r.property_category
        AND p.rooms = r.rooms

    WHERE
        p.median_sale_price > 0
        AND r.median_rent > 0
)

SELECT *
FROM yield_calc
ORDER BY month;

`);
}