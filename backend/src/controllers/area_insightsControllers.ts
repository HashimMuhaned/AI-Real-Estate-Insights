import pool from "../dbconfig";
import { Project } from "../types/topProjects";
import { RentToPriceParams } from "../types/RentToPriceRation";

export const getAreaOverView = async (search: string | null = null) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT *
      FROM analytics.area_overview_mv
      WHERE area_name_en = $1
      LIMIT 1;
    `;

    // Replace hyphens with spaces
    const areaName = search ? search.replace(/-/g, " ") : null;

    const { rows } = await client.query(query, [areaName]);
    return (
      rows[0] || {
        tracked_projects: 0,
        total_transactions_12m: 0,
        avg_price_per_sqft: null,
        avg_rental_yield: null,
        yoy_price_growth: null,
      }
    );
  } catch (err) {
    console.error("getAreaOverView error:", err);
    throw err;
  } finally {
    client.release();
  }
};

interface ProjectFilters {
  search?: string | null;
  year?: string | null;
  regType?: string;
  transferType?: string;
  propertyUsage?: string;
  propertyTypes?: string[];
}

export const getTopProjects = async ({
  search = null,
  year = "all",
  regType = "all",
  transferType = "Sales",
  propertyUsage = "all",
  propertyTypes = [],
}: ProjectFilters): Promise<Project[]> => {
  const client = await pool.connect();
  try {
    const whereClauses: string[] = [];
    const params: any[] = [];

    // --- Dynamic Filters ---
    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(
        `LOWER(da.area_name_en) ILIKE LOWER($${params.length})`
      );
    }

    if (year && year !== "all") {
      params.push(parseInt(year, 10));
      whereClauses.push(
        `EXTRACT(YEAR FROM t.instance_date) = $${params.length}`
      );
    }

    if (regType && regType !== "all") {
      params.push(regType);
      whereClauses.push(`dr.reg_type_en = $${params.length}`);
    }

    if (transferType && transferType !== "all") {
      params.push(transferType);
      whereClauses.push(`dtg.trans_group_en = $${params.length}`);
    }

    if (propertyUsage && propertyUsage !== "all") {
      params.push(propertyUsage);
      whereClauses.push(`du.property_usage_en = $${params.length}`);
    }

    if (propertyTypes.length > 0) {
      const placeholders = propertyTypes
        .map((_, i) => `$${params.length + i + 1}`)
        .join(", ");
      params.push(...propertyTypes);
      whereClauses.push(`
    (
      CASE
        WHEN dpt.property_type = 'Unit' AND dps.property_sub_type = 'Flat' THEN 'Apartment'
        WHEN dpt.property_type = 'Unit' AND dps.property_sub_type = 'Stacked Townhouses' THEN 'Stacked Townhouses'
        WHEN dpt.property_type = 'Villa' THEN 'Villa'
        WHEN dpt.property_type = 'Unit' AND dps.property_sub_type = 'Shop' THEN 'Shop'
        WHEN dpt.property_type = 'Unit' AND dps.property_sub_type = 'Hotel Apartment' THEN 'Hotel Apartment'
        WHEN dpt.property_type = 'Unit' AND dps.property_sub_type = 'Hotel Rooms' THEN 'Hotel Rooms'
        WHEN dpt.property_type = 'Office' OR (dpt.property_type = 'Unit' AND dps.property_sub_type = 'Office') THEN 'Office'
      END
    ) IN (${placeholders})
  `);
    }

    // Default condition
    if (whereClauses.length === 0) {
      whereClauses.push("TRUE");
    }

    // --- Final Query ---
    const query = `
WITH agg_per_project AS (
  SELECT
    t.project_number AS id,
    dp.project_name_en AS name,
    t.num_rooms_en,
    CASE
      WHEN dpt.property_type = 'Unit' AND dps.property_sub_type = 'Flat' THEN 'Apartment'
      WHEN dpt.property_type = 'Unit' AND dps.property_sub_type = 'Stacked Townhouses' THEN 'Stacked Townhouses'
      WHEN dpt.property_type = 'Villa' THEN 'Villa'
      WHEN dpt.property_type = 'Unit' AND dps.property_sub_type = 'Shop' THEN 'Shop'
      WHEN dpt.property_type = 'Unit' AND dps.property_sub_type = 'Hotel Apartment' THEN 'Hotel Apartment'
      WHEN dpt.property_type = 'Unit' AND dps.property_sub_type = 'Hotel Rooms' THEN 'Hotel Rooms'
      WHEN dpt.property_type = 'Office' OR (dpt.property_type = 'Unit' AND dps.property_sub_type = 'Office') THEN 'Office'
      ELSE NULL
    END AS type,
    dtg.trans_group_en AS "transferType",
    du.property_usage_en AS property_usage,
    dr.reg_type_en AS reg_type,
    SUM(t.actual_worth::numeric) AS "salesVolume",
    AVG(t.meter_sale_price::numeric) AS "avgPricePerSqft",
    MAX(t.instance_date) AS latest_instance
  FROM transactions t
  JOIN dim_project dp ON t.project_number = dp.project_number
  JOIN dim_property_type dpt ON t.property_type_id = dpt.property_type_id
  JOIN dim_property_sub_type dps ON t.property_sub_type_id = dps.property_sub_type_id
  JOIN dim_trans_group dtg ON t.trans_group_id = dtg.trans_group_id
  JOIN dim_usage du ON t.property_usage_id = du.property_usage_id
  JOIN dim_reg_type dr ON t.reg_type_id = dr.reg_type_id
  JOIN dim_area da ON t.area_id = da.area_id
  WHERE ${whereClauses.join(" AND ")}
  GROUP BY
    t.project_number,
    dp.project_name_en,
    t.num_rooms_en,
    dpt.property_type,
    dps.property_sub_type,
    dtg.trans_group_en,
    du.property_usage_en,
    dr.reg_type_en
),
ranked AS (
  SELECT
    a.*,
    ROW_NUMBER() OVER (PARTITION BY a.type ORDER BY a."salesVolume" DESC NULLS LAST) AS rn
  FROM agg_per_project a
)
SELECT
  id,
  name,
  num_rooms_en,
  type,
  "transferType",
  property_usage,
  reg_type,
  "salesVolume",
  "avgPricePerSqft"
FROM ranked
WHERE rn <= 10
  AND type IS NOT NULL
ORDER BY type, "salesVolume" DESC;
    `;

    const { rows } = await client.query<Project>(query, params);

    console.log(`✅ getTopProjects returned ${rows.length} rows`);
    return rows;
  } catch (err) {
    console.error("❌ Error fetching top projects:", err);
    throw err;
  } finally {
    client.release();
  }
};

export const getTopRentalYieldProjects = async ({
  search = null,
  year = "all",
  propertyUsage = "all",
  propertyTypes = [],
}: {
  search?: string | null;
  year?: string | "all";
  propertyUsage?: string | "all";
  propertyTypes?: string[];
}) => {
  const client = await pool.connect();
  try {
    const whereClauses: string[] = [];
    const params: any[] = [];

    // 🔍 Area filter
    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(
        `LOWER(da.area_name_en) ILIKE LOWER($${params.length})`
      );
    }

    // 📅 Year filter
    if (year && year !== "all") {
      params.push(parseInt(year, 10));
      whereClauses.push(
        `EXTRACT(YEAR FROM t.instance_date) = $${params.length}`
      );
    }

    // 🏘️ Usage filter
    if (propertyUsage && propertyUsage !== "all") {
      params.push(propertyUsage);
      whereClauses.push(`du.property_usage_en = $${params.length}`);
    }

    // 🏢 Property type filter
    if (propertyTypes.length > 0) {
      const placeholders = propertyTypes
        .map((_, i) => `$${params.length + i + 1}`)
        .join(", ");
      params.push(...propertyTypes);
      whereClauses.push(`
        (
          CASE
            WHEN dpt.property_type = 'Unit' AND dps.property_sub_type = 'Flat' THEN 'Apartment'
            WHEN dpt.property_type = 'Unit' AND dps.property_sub_type = 'Stacked Townhouses' THEN 'Stacked Townhouses'
            WHEN dpt.property_type = 'Villa' THEN 'Villa'
            WHEN dpt.property_type = 'Unit' AND dps.property_sub_type = 'Shop' THEN 'Shop'
            WHEN dpt.property_type = 'Unit' AND dps.property_sub_type = 'Hotel Apartment' THEN 'Hotel Apartment'
            WHEN dpt.property_type = 'Unit' AND dps.property_sub_type = 'Hotel Rooms' THEN 'Hotel Rooms'
            WHEN dpt.property_type = 'Office' OR (dpt.property_type = 'Unit' AND dps.property_sub_type = 'Office') THEN 'Office'
          END
        ) IN (${placeholders})
      `);
    }

    if (whereClauses.length === 0) whereClauses.push("TRUE");

    const query = `
WITH filtered_tx AS (
  SELECT
    t.*,
    dp.project_name_en,
    da.area_name_en,
    du.property_usage_en,
    dpt.property_type,
    dps.property_sub_type
  FROM transactions t
  JOIN dim_project dp ON t.project_number = dp.project_number
  JOIN dim_area da ON t.area_id = da.area_id
  LEFT JOIN dim_usage du ON t.property_usage_id = du.property_usage_id
  LEFT JOIN dim_property_type dpt ON t.property_type_id = dpt.property_type_id
  LEFT JOIN dim_property_sub_type dps ON t.property_sub_type_id = dps.property_sub_type_id
  WHERE ${whereClauses.join(" AND ")}
),
classified AS (
  SELECT
    f.*,
    CASE
      WHEN f.property_type = 'Unit' AND f.property_sub_type = 'Flat' THEN 'Apartment'
      WHEN f.property_type = 'Unit' AND f.property_sub_type = 'Stacked Townhouses' THEN 'Stacked Townhouses'
      WHEN f.property_type = 'Villa' THEN 'Villa'
      WHEN f.property_type = 'Unit' AND f.property_sub_type = 'Shop' THEN 'Shop'
      WHEN f.property_type = 'Unit' AND f.property_sub_type = 'Hotel Apartment' THEN 'Hotel Apartment'
      WHEN f.property_type = 'Unit' AND f.property_sub_type = 'Hotel Rooms' THEN 'Hotel Rooms'
      WHEN f.property_type = 'Office' OR (f.property_type = 'Unit' AND f.property_sub_type = 'Office') THEN 'Office'
      ELSE NULL
    END AS property_type_label
  FROM filtered_tx f
),
agg_per_project AS (
  SELECT
    f.project_number AS id,
    dp.project_name_en AS project_name,
    da.area_name_en AS area,
    du.property_usage_en AS property_usage,
    f.property_type_label,
    COUNT(*) AS transaction_count,
    ROUND(AVG(f.actual_worth)) AS avg_sale_value,
    ROUND(AVG(f.rent_value)) AS avg_rent_value,
    ROUND((AVG(f.rent_value) / NULLIF(AVG(f.actual_worth), 0)) * 100, 2) AS yield_percentage
  FROM classified f
  JOIN dim_project dp ON f.project_number = dp.project_number
  JOIN dim_area da ON f.area_id = da.area_id
  LEFT JOIN dim_usage du ON f.property_usage_id = du.property_usage_id
  WHERE f.actual_worth IS NOT NULL AND f.rent_value IS NOT NULL
  GROUP BY 
    f.project_number, dp.project_name_en, da.area_name_en, du.property_usage_en, f.property_type_label
),
ranked AS (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY property_type_label ORDER BY yield_percentage DESC NULLS LAST) AS rn
  FROM agg_per_project
)
SELECT
  id,
  project_name,
  area,
  property_usage,
  property_type_label AS property_type,
  transaction_count,
  avg_sale_value,
  avg_rent_value,
  yield_percentage
FROM ranked
WHERE rn <= 10
  AND property_type_label IS NOT NULL
ORDER BY property_type, yield_percentage DESC;
    `;

    const { rows } = await client.query(query, params);
    console.log(`✅ getTopRentalYieldProjects returned ${rows.length} rows`);
    return rows;
  } catch (err) {
    console.error("❌ Error fetching top rental yield projects:", err);
    throw err;
  } finally {
    client.release();
  }
};

export const getRentToPriceRatio = async (
  areaName: string | null,
  dateRange: string,
  propertyType: string,
  bedrooms: string
) => {
  const client = await pool.connect();
  try {
    const rangeMap: Record<string, string> = {
      "1y": "1 year",
      "2y": "2 years",
      "3y": "3 years",
      "4y": "4 years",
      "5y": "5 years",
    };
    const interval = rangeMap[dateRange] || "5 years";

    const areaFilter = areaName
      ? `AND LOWER(area_name_en) = LOWER('${areaName}')`
      : "";

    const typeFilter =
      propertyType !== "all"
        ? `AND property_type = LOWER('${propertyType}')`
        : "";

    const bedroomFilter =
      bedrooms !== "all" ? `AND COALESCE(num_bedrooms, -1) = ${bedrooms}` : "";

    const query = `
WITH monthly_sales AS (
    SELECT 
        DATE_TRUNC('month', instance_date AT TIME ZONE 'UTC')::DATE AS month,
        area_id,
        area_name_en,
        'apartment'::TEXT AS property_type,
        NULLIF(REGEXP_REPLACE(COALESCE(num_rooms_en,''), '[^0-9]', '', 'g'), '')::INT AS num_bedrooms,
        AVG(CAST(actual_worth AS NUMERIC)) AS avg_sale_price
    FROM transactions.appartements
    WHERE instance_date >= (DATE_TRUNC('month', (CURRENT_DATE AT TIME ZONE 'UTC')) - INTERVAL '${interval}')
      AND actual_worth ~ '^[0-9]+(\\.[0-9]+)?$'
      ${areaFilter}
    GROUP BY 1,2,3,5

    UNION ALL

    SELECT 
        DATE_TRUNC('month', instance_date AT TIME ZONE 'UTC')::DATE AS month,
        area_id,
        area_name_en,
        'villa'::TEXT AS property_type,
        NULLIF(REGEXP_REPLACE(COALESCE(num_rooms_en,''), '[^0-9]', '', 'g'), '')::INT AS num_bedrooms,
        AVG(CAST(actual_worth AS NUMERIC)) AS avg_sale_price
    FROM transactions.villa
    WHERE instance_date >= (DATE_TRUNC('month', (CURRENT_DATE AT TIME ZONE 'UTC')) - INTERVAL '${interval}')
      AND actual_worth ~ '^[0-9]+(\\.[0-9]+)?$'
      ${areaFilter}
    GROUP BY 1,2,3,5
),

monthly_rents AS (
    SELECT 
        DATE_TRUNC('month', contract_start_date AT TIME ZONE 'UTC')::DATE AS month,
        area_id,
        area_name_en,
        'apartment'::TEXT AS property_type,
        NULLIF(REGEXP_REPLACE(COALESCE(ejari_property_sub_type_en,''), '[^0-9]', '', 'g'), '')::INT AS num_bedrooms,
        AVG(annual_amount) AS avg_rent_price
    FROM transactions.rents_apartements
    WHERE contract_start_date >= (DATE_TRUNC('month', (CURRENT_DATE AT TIME ZONE 'UTC')) - INTERVAL '${interval}')
      AND annual_amount > 0
      AND LOWER(COALESCE(ejari_property_sub_type_en,'')) NOT LIKE 'studio%'
      ${areaFilter}
    GROUP BY 1,2,3,5

    UNION ALL

    SELECT 
        DATE_TRUNC('month', contract_start_date AT TIME ZONE 'UTC')::DATE AS month,
        area_id,
        area_name_en,
        'villa'::TEXT AS property_type,
        NULLIF(REGEXP_REPLACE(COALESCE(ejari_property_sub_type_en,''), '[^0-9]', '', 'g'), '')::INT AS num_bedrooms,
        AVG(annual_amount) AS avg_rent_price
    FROM transactions.rents_villa
    WHERE contract_start_date >= (DATE_TRUNC('month', (CURRENT_DATE AT TIME ZONE 'UTC')) - INTERVAL '${interval}')
      AND annual_amount > 0
      ${areaFilter}
    GROUP BY 1,2,3,5
)

SELECT 
    s.month,
    TO_CHAR(s.month, 'YYYY-MM') AS month_label,
    EXTRACT(QUARTER FROM s.month) AS quarter,
    s.area_id,
    s.area_name_en,
    s.property_type,
    s.num_bedrooms,
    CASE
      WHEN s.num_bedrooms IS NULL THEN 'Unknown'
      WHEN s.num_bedrooms = 0 THEN 'Studio'
      WHEN s.num_bedrooms = 1 THEN '1BR'
      ELSE (s.num_bedrooms::TEXT || 'BR')
    END AS bedroom_label,
    ROUND(s.avg_sale_price / NULLIF(r.avg_rent_price,0), 2) AS price_to_rent_ratio
FROM monthly_sales s
JOIN monthly_rents r 
    ON s.month = r.month 
    AND s.area_id = r.area_id
    AND s.property_type = r.property_type
    AND COALESCE(s.num_bedrooms,-1) = COALESCE(r.num_bedrooms,-1)
WHERE TRUE
  ${typeFilter}
  ${bedroomFilter}
ORDER BY s.month, s.area_id, s.property_type, s.num_bedrooms;
`;

    const { rows } = await client.query(query);
    console.log("rent to price ratio", rows);
    return rows;
  } catch (err) {
    console.error("Error fetching price to rent ratio:", err);
    throw err;
  } finally {
    client.release();
  }
};

export const getVillaApartementPriceChange = async (
  areaName: string | null,
  dateRange: string
) => {
  const client = await pool.connect();

  try {
    const years = parseInt(dateRange.replace("y", ""), 10);
    if (isNaN(years))
      throw new Error("Invalid dateRange format. Use like '1y'");

    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - years);

    const params: any[] = [startDate];
    let areaFilter = "";

    if (areaName) {
      areaFilter = `AND da.area_name_en = $2`;
      params.push(areaName);
    }

    const query = `
      WITH merged AS (
        SELECT 
          da.area_name_en,
          t.instance_date,
          t.num_rooms_en,
          CASE
            WHEN dpt.property_type = 'Villa' THEN 'Villa'
            WHEN dpt.property_type = 'Unit' AND dpst.property_sub_type = 'Flat' THEN 'Apartment'
            ELSE dpt.property_type
          END AS property_category,
          (t.meter_sale_price / 10.7639) AS price_per_sqft
        FROM transactions t
        JOIN dim_area da ON da.area_id = t.area_id
        JOIN dim_property_type dpt ON dpt.property_type_id = t.property_type_id
        JOIN dim_property_sub_type dpst ON dpst.property_sub_type_id = t.property_sub_type_id
        JOIN dim_reg_type drt ON drt.reg_type_id = t.reg_type_id
        JOIN dim_trans_group dtg ON dtg.trans_group_id = t.trans_group_id
        JOIN dim_usage du ON du.property_usage_id = t.property_usage_id
        WHERE 
          t.instance_date >= $1
          AND drt.reg_type_en != 'Off-Plan Properties'
          AND dtg.trans_group_en NOT IN ('Gift', 'Mortgage')
          AND du.property_usage_en != 'Commercial'
          AND (
            dpt.property_type = 'Villa'
            OR (dpt.property_type = 'Unit' AND dpst.property_sub_type = 'Flat')
          )
          ${areaFilter}
      ),
      quarterly AS (
        SELECT 
          area_name_en,
          property_category,
          num_rooms_en,
          DATE_TRUNC('quarter', instance_date)::date AS quarter_start,
          EXTRACT(YEAR FROM instance_date) AS year,
          EXTRACT(QUARTER FROM instance_date) AS quarter,
          CONCAT(EXTRACT(YEAR FROM instance_date), '-Q', EXTRACT(QUARTER FROM instance_date)) AS year_quarter,
          AVG(price_per_sqft) AS avg_price_sqft
        FROM merged
        GROUP BY area_name_en, property_category, num_rooms_en, year, quarter, quarter_start, year_quarter
      )
      SELECT 
        q.*,
        ROUND(
          (q.avg_price_sqft - LAG(q.avg_price_sqft) OVER (
              PARTITION BY q.area_name_en, q.property_category, q.num_rooms_en 
              ORDER BY q.quarter_start
          )) / NULLIF(LAG(q.avg_price_sqft) OVER (
              PARTITION BY q.area_name_en, q.property_category, q.num_rooms_en 
              ORDER BY q.quarter_start
          ), 0) * 100, 
          2
        ) AS price_change_pct
      FROM quarterly q
      ORDER BY q.area_name_en, q.year, q.quarter, q.property_category, q.num_rooms_en;
    `;

    const result = await client.query(query, params);
    return result.rows;
  } catch (error) {
    console.error(
      "Error fetching villa/apartment quarterly price change:",
      error
    );
    throw error;
  } finally {
    client.release();
  }
};

export const getVillaApartmentPricePerBedRoomNumber = async (
  areaName: string | null,
  dateRange: string
) => {
  const client = await pool.connect();

  try {
    const years = parseInt(dateRange.replace("y", ""), 10);
    if (isNaN(years)) {
      throw new Error("Invalid dateRange format. Use like '1y', '2y', etc.");
    }

    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - years);

    const params: any[] = [startDate];
    let areaFilter = "";

    if (areaName) {
      areaFilter = `AND da.area_name_en = $2`;
      params.push(areaName);
    }

    const query = `
      WITH merged AS (
        SELECT
          da.area_name_en,
          CASE
            WHEN dpt.property_type = 'Villa' THEN 'Villa'
            WHEN dpt.property_type = 'Unit' AND dpst.property_sub_type = 'Flat' THEN 'Apartment'
            ELSE dpt.property_type
          END AS property_category,
          NULLIF(REGEXP_REPLACE(COALESCE(t.num_rooms_en,''), '[^0-9]', '', 'g'), '')::INT AS room_num,
          DATE_TRUNC('quarter', t.instance_date)::date AS quarter,
          t.actual_worth AS price_value
        FROM transactions t
        JOIN dim_area da ON da.area_id = t.area_id
        JOIN dim_property_type dpt ON dpt.property_type_id = t.property_type_id
        JOIN dim_property_sub_type dpst ON dpst.property_sub_type_id = t.property_sub_type_id
        JOIN dim_reg_type drt ON drt.reg_type_id = t.reg_type_id
        JOIN dim_trans_group dtg ON dtg.trans_group_id = t.trans_group_id
        JOIN dim_usage du ON du.property_usage_id = t.property_usage_id
        WHERE 
          t.instance_date >= $1
          AND drt.reg_type_en != 'Off-Plan Properties'
          AND dtg.trans_group_en = 'Sales'
          AND du.property_usage_en = 'Residential'
          AND (
            dpt.property_type = 'Villa'
            OR (dpt.property_type = 'Unit' AND dpst.property_sub_type = 'Flat')
          )
          AND t.num_rooms_en IS NOT NULL
          AND t.num_rooms_en ~ '^[0-9]'
          ${areaFilter}
      )
      SELECT
        area_name_en,
        property_category,
        room_num,
        TO_CHAR(quarter, 'YYYY-"Q"Q') AS year_quarter,
        ROUND(AVG(price_value), 2) AS avg_price
      FROM merged
      GROUP BY area_name_en, property_category, room_num, quarter
      ORDER BY area_name_en, property_category, room_num, quarter;
    `;

    const result = await client.query(query, params);
    console.log(
      "✅ getVillaApartmentPricePerBedRoomNumber:",
      result.rows.length,
      "rows"
    );
    return result.rows;
  } catch (error) {
    console.error(
      "❌ Error fetching villa/apartment average price per bedroom number:",
      error
    );
    throw error;
  } finally {
    client.release();
  }
};

export const getRentalYieldByRoomAndYear = async (
  area: string | null = null,
  year: number | null = null,
  room_num: string | null = null,
  property_type: string = "both",
  granularity: string = "yearly"
) => {
  const client = await pool.connect();
  try {
    const roomDigit =
      room_num && /\d+/.test(room_num)
        ? parseInt(room_num.match(/\d+/)![0])
        : null;

    const currentYear = new Date().getFullYear();
    const yearStart = year ?? currentYear - 3;

    const query = `
      WITH 
      apt_sales AS (
        SELECT 
          area_name_en,
          project_name_en,
          DATE_TRUNC('month', instance_date)::DATE AS month_date,
          EXTRACT(YEAR FROM instance_date)::INT AS year,
          EXTRACT(MONTH FROM instance_date)::INT AS month,
          REGEXP_SUBSTR(num_rooms_en, '[0-9]+')::INT AS room_num,
          NULLIF(regexp_replace(actual_worth, '[^0-9.]', '', 'g'), '')::NUMERIC AS property_price
        FROM transactions.rents_apartements
        WHERE area_name_en = $1
          AND EXTRACT(YEAR FROM instance_date)::INT BETWEEN $2 AND $3
      ),
      apt_rents AS (
        SELECT 
          area_name_en,
          project_name_en,
          DATE_TRUNC('month', contract_start_date)::DATE AS month_date,
          EXTRACT(YEAR FROM contract_start_date)::INT AS year,
          EXTRACT(MONTH FROM contract_start_date)::INT AS month,
          REGEXP_SUBSTR(ejari_property_sub_type_en, '[0-9]+')::INT AS room_num,
          annual_amount::NUMERIC AS annual_rent
        FROM transactions.rents_apartements
        WHERE area_name_en = $1
          AND EXTRACT(YEAR FROM contract_start_date)::INT BETWEEN $2 AND $3
      ),
      villa_sales AS (
        SELECT 
          area_name_en,
          project_name_en,
          DATE_TRUNC('month', instance_date)::DATE AS month_date,
          EXTRACT(YEAR FROM instance_date)::INT AS year,
          EXTRACT(MONTH FROM instance_date)::INT AS month,
          REGEXP_SUBSTR(num_rooms_en, '[0-9]+')::INT AS room_num,
          NULLIF(regexp_replace(actual_worth, '[^0-9.]', '', 'g'), '')::NUMERIC AS property_price
        FROM transactions.villa
        WHERE area_name_en = $1
          AND EXTRACT(YEAR FROM instance_date)::INT BETWEEN $2 AND $3
      ),
      villa_rents AS (
        SELECT 
          area_name_en,
          project_name_en,
          DATE_TRUNC('month', contract_start_date)::DATE AS month_date,
          EXTRACT(YEAR FROM contract_start_date)::INT AS year,
          EXTRACT(MONTH FROM contract_start_date)::INT AS month,
          REGEXP_SUBSTR(ejari_property_sub_type_en, '[0-9]+')::INT AS room_num,
          annual_amount::NUMERIC AS annual_rent
        FROM transactions.rents_villa
        WHERE area_name_en = $1
          AND EXTRACT(YEAR FROM contract_start_date)::INT BETWEEN $2 AND $3
      ),
      apt_yield AS (
        SELECT 
          'Apartment' AS property_category,
          s.area_name_en,
          s.project_name_en,
          s.month_date,
          s.year,
          s.month,
          CEIL(EXTRACT(MONTH FROM s.month_date)::NUMERIC / 3) AS quarter,
          s.room_num,
          AVG(s.property_price) AS avg_sale_price,
          AVG(r.annual_rent) AS avg_annual_rent,
          (AVG(r.annual_rent) / NULLIF(AVG(s.property_price), 0)) * 100 AS rental_yield_percent
        FROM apt_sales s
        JOIN apt_rents r
          ON s.project_name_en = r.project_name_en
          AND s.room_num = r.room_num
          AND s.year = r.year
          AND s.month = r.month
        WHERE ($4::INT IS NULL OR s.room_num = $4::INT)
        GROUP BY s.area_name_en, s.project_name_en, s.month_date, s.year, s.month, s.room_num
      ),
      villa_yield AS (
        SELECT 
          'Villa' AS property_category,
          s.area_name_en,
          s.project_name_en,
          s.month_date,
          s.year,
          s.month,
          CEIL(EXTRACT(MONTH FROM s.month_date)::NUMERIC / 3) AS quarter,
          s.room_num,
          AVG(s.property_price) AS avg_sale_price,
          AVG(r.annual_rent) AS avg_annual_rent,
          (AVG(r.annual_rent) / NULLIF(AVG(s.property_price), 0)) * 100 AS rental_yield_percent
        FROM villa_sales s
        JOIN villa_rents r
          ON s.project_name_en = r.project_name_en
          AND s.room_num = r.room_num
          AND s.year = r.year
          AND s.month = r.month
        WHERE ($4::INT IS NULL OR s.room_num = $4::INT)
        GROUP BY s.area_name_en, s.project_name_en, s.month_date, s.year, s.month, s.room_num
      )
      SELECT * FROM (
        SELECT * FROM apt_yield
        UNION ALL
        SELECT * FROM villa_yield
      ) final
      WHERE ($5 = 'both' OR property_category = $5)
      ORDER BY year, month, property_category, room_num;
    `;

    const values = [area, yearStart, currentYear, roomDigit, property_type];
    const result = await client.query(query, values);

    return result.rows;
  } catch (err) {
    console.error("❌ Error calculating rental yield:", err);
    throw err;
  } finally {
    client.release();
  }
};
