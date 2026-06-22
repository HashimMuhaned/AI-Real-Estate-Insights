import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function getRentalMomentum({
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
      ? "24 months"
      : range === "5 years"
      ? "72 months"
      : "48 months";

  return await db.execute(sql`

WITH monthly_rents AS (

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

growth_calc AS (

    SELECT
        current_data.month,
        current_data.area_id,
        current_data.property_category,
        current_data.rooms,

        current_data.median_rent,

        previous_data.median_rent
        AS previous_year_rent,

        ROUND(
            (
                (
                    current_data.median_rent::numeric
                    -
                    previous_data.median_rent::numeric
                )
                /
                NULLIF(previous_data.median_rent::numeric, 0)
            ) * 100,
            2
        ) AS yoy_growth

    FROM monthly_rents current_data

    JOIN monthly_rents previous_data
        ON current_data.area_id = previous_data.area_id
        AND current_data.property_category = previous_data.property_category
        AND current_data.rooms = previous_data.rooms
        AND current_data.month =
            previous_data.month + INTERVAL '12 months'
)

SELECT *
FROM growth_calc

WHERE

    (
        COALESCE(${category}::text, '') = ''
        OR property_category = INITCAP(${category}::text)
    )

    AND (
        ${rooms}::int IS NULL
        OR rooms = ${rooms}::int
    )

ORDER BY month;

`);
}