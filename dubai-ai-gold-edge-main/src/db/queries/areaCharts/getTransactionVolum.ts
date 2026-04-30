import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function getTransactionVolume({
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
  return await db.execute(sql`

-- =========================
-- FILTERED TRANSACTIONS
-- =========================
WITH filtered AS (
    SELECT
        DATE_TRUNC('month', t.instance_date) AS month,

        CASE
            WHEN pt.property_type = 'Villa' THEN 'Villa'
            WHEN pt.property_type = 'Unit' 
                 AND pst.property_sub_type = 'Flat' THEN 'Apartment'
        END AS property_category,

        CASE 
            WHEN LEFT(t.num_rooms_en, 1) ~ '^[0-9]$' 
            THEN LEFT(t.num_rooms_en, 1)::int
        END AS rooms

    FROM transactions t
    JOIN dim_property_type pt 
        ON t.property_type_id = pt.property_type_id
    LEFT JOIN dim_property_sub_type pst 
        ON t.property_sub_type_id = pst.property_sub_type_id

    WHERE
        t.instance_date IS NOT NULL

        -- ✅ AREA FILTER
        AND (
            ${areaId}::int IS NULL
            OR t.area_id = ${areaId}::int
        )

        -- ✅ CATEGORY FILTER
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

        -- ✅ ROOM FILTER
        AND (
            ${rooms}::int IS NULL
            OR (
                LEFT(t.num_rooms_en, 1) ~ '^[0-9]$'
                AND LEFT(t.num_rooms_en, 1)::int = ${rooms}::int
            )
        )

        -- ✅ DATE RANGE
        AND t.instance_date >= CURRENT_DATE -
            CASE 
                WHEN ${range}::text = '1 year' THEN INTERVAL '1 year'
                WHEN ${range}::text = '5 years' THEN INTERVAL '5 years'
                ELSE INTERVAL '3 years'
            END
),

-- =========================
-- MONTHLY COUNT
-- =========================
monthly_volume AS (
    SELECT
        month,
        property_category,
        rooms,
        COUNT(*) AS transaction_count
    FROM filtered
    WHERE property_category IS NOT NULL
    AND rooms IS NOT NULL
    GROUP BY month, property_category, rooms
),

-- =========================
-- ROLLING 3-MONTH AVG
-- =========================
rolling_3m AS (
    SELECT
        m1.month,
        m1.property_category,
        m1.rooms,

        (
            SELECT AVG(m2.transaction_count)
            FROM monthly_volume m2
            WHERE 
                m2.property_category = m1.property_category
                AND m2.rooms = m1.rooms
                AND m2.month BETWEEN m1.month - INTERVAL '2 months' AND m1.month
        ) AS volume_3m_avg

    FROM monthly_volume m1
)

-- =========================
-- FINAL
-- =========================
SELECT
    m.month,
    m.property_category,
    m.rooms,
    m.transaction_count,
    r.volume_3m_avg

FROM monthly_volume m
LEFT JOIN rolling_3m r
    ON m.month = r.month
    AND m.property_category = r.property_category
    AND m.rooms = r.rooms

ORDER BY m.property_category, m.rooms, m.month;
`);
}