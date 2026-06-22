import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function getRentHeatmap({
  category,
  range,
}: {
  category: "apartment" | "villa";
  range: string;
}) {
  const interval =
    range === "1 year"
      ? "12 months"
      : range === "5 years"
        ? "60 months"
        : "36 months";

  return await db.execute(sql`

WITH mapped_rents AS (
    SELECT
        r.area_id,
        da.area_name_en,

        CASE
            -- =========================
            -- APARTMENTS
            -- =========================
            WHEN ${category}::text = 'apartment'
                 AND r.ejari_bus_property_type_id = 3
                 AND r.ejari_property_type_id = 1
            THEN
                CASE
                    WHEN r.ejari_property_sub_type_en_id = 14 THEN 'Studio'
                    WHEN r.ejari_property_sub_type_en_id = 54 THEN '1BR'
                    WHEN r.ejari_property_sub_type_en_id = 17 THEN '2BR'
                    WHEN r.ejari_property_sub_type_en_id = 31 THEN '3BR'
                    WHEN r.ejari_property_sub_type_en_id = 4 THEN '4BR'
                END

            -- =========================
            -- VILLAS
            -- =========================
            WHEN ${category}::text = 'villa'
                 AND (
                    r.ejari_bus_property_type_id = 5
                    OR r.ejari_property_type_id = 19
                 )
            THEN
                CASE
                    WHEN r.ejari_property_sub_type_en_id = 17 THEN '2BR'
                    WHEN r.ejari_property_sub_type_en_id = 31 THEN '3BR'
                    WHEN r.ejari_property_sub_type_en_id = 4 THEN '4BR'
                    WHEN r.ejari_property_sub_type_en_id = 10 THEN '5BR'
                END
        END AS room_label,

        r.annual_amount

    FROM rents r

    -- ✅ AREA NAME JOIN
    JOIN dim_area da
        ON r.area_id = da.area_id

    WHERE
        r.annual_amount IS NOT NULL

        AND r.contract_start_date >= CURRENT_DATE
            - INTERVAL '${sql.raw(interval)}'
)

SELECT
    area_id,
    area_name_en,
    room_label,

    ROUND(
        percentile_cont(0.5)
        WITHIN GROUP (ORDER BY annual_amount)::numeric,
        0
    ) AS median_annual_rent

FROM mapped_rents

WHERE room_label IS NOT NULL

GROUP BY
    area_id,
    area_name_en,
    room_label

ORDER BY
    area_name_en,
    room_label;
`);
}