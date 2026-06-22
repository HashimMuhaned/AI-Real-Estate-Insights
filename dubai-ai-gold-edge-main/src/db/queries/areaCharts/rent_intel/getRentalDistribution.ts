import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function getRentalDistribution({
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

WITH filtered_rents AS (

    SELECT
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

        r.annual_amount

    FROM rents r

    WHERE
        r.annual_amount IS NOT NULL

        AND r.contract_start_date >= CURRENT_DATE
            - INTERVAL '${sql.raw(interval)}'

        AND (
            ${areaId}::int IS NULL
            OR r.area_id = ${areaId}::int
        )
)

SELECT

    area_id,
    property_category,
    rooms,

    MIN(annual_amount) AS min_rent,

    percentile_cont(0.25)
    WITHIN GROUP (ORDER BY annual_amount)
    AS q1_rent,

    percentile_cont(0.50)
    WITHIN GROUP (ORDER BY annual_amount)
    AS median_rent,

    percentile_cont(0.75)
    WITHIN GROUP (ORDER BY annual_amount)
    AS q3_rent,

    MAX(annual_amount) AS max_rent,

    COUNT(*) AS sample_size

FROM filtered_rents

WHERE
    property_category IS NOT NULL
    AND rooms IS NOT NULL

    AND (
        COALESCE(${category}::text, '') = ''
        OR property_category = INITCAP(${category}::text)
    )

    AND (
        ${rooms}::int IS NULL
        OR rooms = ${rooms}::int
    )

GROUP BY
    area_id,
    property_category,
    rooms

ORDER BY
    median_rent DESC;

`);
}