import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function getInvestmentScore({
  areaId,
  category,
  rooms,
  range = "3 years"
}: {
  areaId: number;
  category?: string | null;
  rooms?: number | null;
  range?: string;
}) {

  const interval =
    range === "1 year"
      ? "12 months"
      : range === "5 years"
      ? "60 months"
      : "36 months";

  return (await db.execute(sql`

-- =========================
-- PRICE METRICS
-- =========================
WITH price_base AS (
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

        t.actual_worth,
        t.instance_date
    FROM transactions t
    JOIN dim_property_type pt
        ON t.property_type_id = pt.property_type_id
    LEFT JOIN dim_property_sub_type pst
        ON t.property_sub_type_id = pst.property_sub_type_id
    WHERE
        t.actual_worth IS NOT NULL
        AND t.instance_date >= CURRENT_DATE - INTERVAL '${sql.raw(interval)}'
        AND t.area_id = ${areaId}
),

price_stats AS (
    SELECT
        percentile_cont(0.5) WITHIN GROUP (ORDER BY actual_worth) AS median_price,
        STDDEV(actual_worth) / NULLIF(AVG(actual_worth), 0) AS price_volatility
    FROM price_base
    WHERE
        (${category}::text IS NULL OR property_category = INITCAP(${category}::text))
        AND (${rooms}::int IS NULL OR rooms = ${rooms}::int)
),

-- =========================
-- RENT METRICS
-- =========================
rent_base AS (
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

        r.annual_amount,
        r.contract_start_date
    FROM rents r
    WHERE
        r.annual_amount IS NOT NULL
        AND r.contract_start_date >= CURRENT_DATE - INTERVAL '${sql.raw(interval)}'
        AND r.area_id = ${areaId}
),

rent_stats AS (
    SELECT
        percentile_cont(0.5) WITHIN GROUP (ORDER BY annual_amount) AS median_rent,
        STDDEV(annual_amount) / NULLIF(AVG(annual_amount), 0) AS rent_volatility
    FROM rent_base
    WHERE
        (${category}::text IS NULL OR property_category = INITCAP(${category}::text))
        AND (${rooms}::int IS NULL OR rooms = ${rooms}::int)
),

-- =========================
-- TRANSACTION METRICS
-- =========================
tx_stats AS (
    SELECT
        COUNT(*) AS transaction_count
    FROM transactions t
    WHERE
        t.area_id = ${areaId}
        AND t.instance_date >= CURRENT_DATE - INTERVAL '${sql.raw(interval)}'
),

-- previous period (for growth)
tx_prev AS (
    SELECT COUNT(*) AS prev_count
    FROM transactions t
    WHERE
        t.area_id = ${areaId}
        AND t.instance_date < CURRENT_DATE - INTERVAL '${sql.raw(interval)}'
        AND t.instance_date >= CURRENT_DATE - INTERVAL '${sql.raw(interval)}' * 2
)

SELECT
    ${areaId} AS area_id,

    (SELECT median_price FROM price_stats) AS median_price,
    (SELECT median_rent FROM rent_stats) AS median_rent,

    (SELECT transaction_count FROM tx_stats) AS transaction_count,

    (SELECT prev_count FROM tx_prev) AS previous_transaction_count,

    (SELECT price_volatility FROM price_stats) AS price_volatility,
    (SELECT rent_volatility FROM rent_stats) AS rent_volatility

`)) as any[];
}