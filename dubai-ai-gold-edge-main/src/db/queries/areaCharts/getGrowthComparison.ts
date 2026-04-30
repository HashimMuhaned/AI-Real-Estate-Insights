import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function getGrowthComparison({
  areaId,
  category,
  rooms,
  range,
}: {
  areaId?: number | null;
  category?: string | null;
  rooms?: number | null;
  range: string; // '1 year' | '3 years' | '5 years'
}) {
  const currentInterval =
    range === "1 year"
      ? "12 months"
      : range === "5 years"
        ? "60 months"
        : "36 months";

  const previousInterval =
    range === "1 year"
      ? "24 months"
      : range === "5 years"
        ? "120 months"
        : "72 months";
  return await db.execute(sql`

WITH price_periods AS (
    SELECT
        t.area_id,

        CASE
            WHEN pt.property_type = 'Villa' THEN 'Villa'
            WHEN pt.property_type = 'Unit' 
                 AND pst.property_sub_type = 'Flat' THEN 'Apartment'
        END AS property_category,

        CASE 
            WHEN LEFT(t.num_rooms_en, 1) ~ '^[0-9]$' 
            THEN LEFT(t.num_rooms_en, 1)::int
        END AS rooms,

        CASE
            WHEN t.instance_date >= CURRENT_DATE - INTERVAL '${sql.raw(currentInterval)}'
                THEN 'current'
            WHEN t.instance_date >= CURRENT_DATE - INTERVAL '${sql.raw(previousInterval)}'
                THEN 'previous'
        END AS period,

        t.actual_worth

    FROM transactions t
    JOIN dim_property_type pt 
        ON t.property_type_id = pt.property_type_id
    LEFT JOIN dim_property_sub_type pst 
        ON t.property_sub_type_id = pst.property_sub_type_id

    WHERE
        t.actual_worth IS NOT NULL
        AND t.instance_date >= CURRENT_DATE - INTERVAL '${sql.raw(previousInterval)}'

        AND (
            ${areaId}::int IS NULL
            OR t.area_id = ${areaId}::int
        )

        AND (
            COALESCE(${category}::text, '') = ''
            OR (${category}::text = 'villa' AND pt.property_type = 'Villa')
            OR (${category}::text = 'apartment' 
                AND pt.property_type = 'Unit'
                AND pst.property_sub_type = 'Flat')
        )

        AND (
            ${rooms}::int IS NULL
            OR (
                LEFT(t.num_rooms_en, 1) ~ '^[0-9]$'
                AND LEFT(t.num_rooms_en, 1)::int = ${rooms}::int
            )
        )
),

price_median AS (
    SELECT
        area_id,
        property_category,
        rooms,
        period,
        percentile_cont(0.5) 
        WITHIN GROUP (ORDER BY actual_worth) AS median_price
    FROM price_periods
    WHERE period IS NOT NULL
    GROUP BY area_id, property_category, rooms, period
),

rent_periods AS (
    SELECT
        r.area_id,

        CASE
            WHEN r.ejari_bus_property_type_id = 5 
                 OR r.ejari_property_type_id = 19 THEN 'Villa'
            WHEN r.ejari_bus_property_type_id = 3 
                 AND r.ejari_property_type_id = 1 THEN 'Apartment'
        END AS property_category,

        CASE
            WHEN r.ejari_property_sub_type_en_id = 54 THEN 1
            WHEN r.ejari_property_sub_type_en_id = 17 THEN 2
            WHEN r.ejari_property_sub_type_en_id = 31 THEN 3
            WHEN r.ejari_property_sub_type_en_id = 4 THEN 4
            WHEN r.ejari_property_sub_type_en_id = 10 THEN 5
            WHEN r.ejari_property_sub_type_en_id = 8 THEN 6
        END AS rooms,

        CASE
            WHEN r.contract_start_date >= CURRENT_DATE - INTERVAL '${sql.raw(currentInterval)}'
                THEN 'current'
            WHEN r.contract_start_date >= CURRENT_DATE - INTERVAL '${sql.raw(previousInterval)}'
                THEN 'previous'
        END AS period,

        r.annual_amount

    FROM rents r
    WHERE
        r.annual_amount IS NOT NULL
        AND r.contract_start_date >= CURRENT_DATE - INTERVAL '${sql.raw(previousInterval)}'

        AND (
            ${areaId}::int IS NULL
            OR r.area_id = ${areaId}::int
        )
),

rent_median AS (
    SELECT
        area_id,
        property_category,
        rooms,
        period,
        percentile_cont(0.5) 
        WITHIN GROUP (ORDER BY annual_amount) AS median_rent
    FROM rent_periods
    WHERE period IS NOT NULL
    GROUP BY area_id, property_category, rooms, period
),

growth_calc AS (
    SELECT
        p.area_id,
        p.property_category,
        p.rooms,

        MAX(CASE WHEN p.period = 'current' THEN p.median_price END) AS current_price,
        MAX(CASE WHEN p.period = 'previous' THEN p.median_price END) AS previous_price,

        MAX(CASE WHEN r.period = 'current' THEN r.median_rent END) AS current_rent,
        MAX(CASE WHEN r.period = 'previous' THEN r.median_rent END) AS previous_rent

    FROM price_median p
    JOIN rent_median r
        ON p.area_id = r.area_id
        AND p.property_category = r.property_category
        AND p.rooms = r.rooms
        AND p.period = r.period

    GROUP BY p.area_id, p.property_category, p.rooms
)

SELECT
    area_id,
    property_category,
    rooms,

    ROUND(
        (
            (current_price::numeric - previous_price::numeric)
            / NULLIF(previous_price::numeric, 0)
        ) * 100,
        2
    ) AS price_growth,

    ROUND(
        (
            (current_rent::numeric - previous_rent::numeric)
            / NULLIF(previous_rent::numeric, 0)
        ) * 100,
        2
    ) AS rent_growth

FROM growth_calc

WHERE
    previous_price IS NOT NULL
    AND previous_rent IS NOT NULL

ORDER BY price_growth DESC;
`);
}
