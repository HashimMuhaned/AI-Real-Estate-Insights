import { get } from "http";
import pool from "../dbconfig";
import { Area } from "../types/areas";
import { AreaRentalYield } from "../types/areaYeild";
import { AreaPriceGrowthVacancy } from "../types/AreaPriceGrowthVacancy";
import { AreaTransactions } from "../types/AreaTransactions";

export const getAllAreas = async (
  offset: number = 0,
  limit: number = 20,
  search: string | null = null
): Promise<Area[]> => {
  let client: any;
  try {
    client = await pool.connect();

    let query = `
      WITH sale_villa AS (
          SELECT 
              area_id,
              area_name_en,
              AVG(NULLIF(meter_sale_price, '')::numeric) AS villa_current_sale_price
          FROM transactions.villa
          WHERE EXTRACT(YEAR FROM instance_date)::int = EXTRACT(YEAR FROM CURRENT_DATE)::int
          GROUP BY area_id, area_name_en
      ),
      sale_appt AS (
          SELECT 
              area_id,
              area_name_en,
              AVG(NULLIF(meter_sale_price, '')::numeric) AS apt_current_sale_price
          FROM transactions.appartements
          WHERE EXTRACT(YEAR FROM instance_date)::int = EXTRACT(YEAR FROM CURRENT_DATE)::int
          GROUP BY area_id, area_name_en
      ),
      rent_villa AS (
          SELECT 
              area_id,
              area_name_en,
              AVG((annual_amount::numeric) / NULLIF(actual_area, 0)) AS villa_current_rent_price
          FROM transactions.rents_villa
          WHERE actual_area > 0
            AND EXTRACT(YEAR FROM contract_start_date)::int = EXTRACT(YEAR FROM CURRENT_DATE)::int
          GROUP BY area_id, area_name_en
      ),
      rent_appt AS (
          SELECT 
              area_id,
              area_name_en,
              AVG((annual_amount::numeric) / NULLIF(actual_area, 0)) AS apt_current_rent_price
          FROM transactions.rents_apartements
          WHERE actual_area > 0
            AND EXTRACT(YEAR FROM contract_start_date)::int = EXTRACT(YEAR FROM CURRENT_DATE)::int
          GROUP BY area_id, area_name_en
      )
      SELECT 
          COALESCE(sv.area_id, sa.area_id, rv.area_id, ra.area_id) AS area_id,
          COALESCE(sv.area_name_en, sa.area_name_en, rv.area_name_en, ra.area_name_en) AS area_name,
          sv.villa_current_sale_price,
          rv.villa_current_rent_price,
          sa.apt_current_sale_price,
          ra.apt_current_rent_price
      FROM sale_villa sv
      FULL OUTER JOIN sale_appt sa ON sv.area_id = sa.area_id
      FULL OUTER JOIN rent_villa rv ON COALESCE(sv.area_id, sa.area_id) = rv.area_id
      FULL OUTER JOIN rent_appt ra ON COALESCE(sv.area_id, sa.area_id, rv.area_id) = ra.area_id
    `;

    const params: (string | number)[] = [];
    if (search) {
      params.push(`%${search}%`);
      query += ` WHERE COALESCE(sv.area_name_en, sa.area_name_en, rv.area_name_en, ra.area_name_en) ILIKE $${params.length}`;
    }

    params.push(offset);
    params.push(limit);
    query += ` ORDER BY area_name OFFSET $${params.length - 1} LIMIT $${
      params.length
    };`;

    const result = await client.query(query, params);

    return result.rows.map(
      (row: any): Area => ({
        area_id: row.area_id ? Number(row.area_id) : null,
        area_name: row.area_name,
        villa_current_sale_price: row.villa_current_sale_price
          ? Number(row.villa_current_sale_price)
          : null,
        villa_current_rent_price: row.villa_current_rent_price
          ? Number(row.villa_current_rent_price)
          : null,
        apt_current_sale_price: row.apt_current_sale_price
          ? Number(row.apt_current_sale_price)
          : null,
        apt_current_rent_price: row.apt_current_rent_price
          ? Number(row.apt_current_rent_price)
          : null,
      })
    );
  } catch (err) {
    console.error(
      "❌ Error fetching current avg prices:",
      (err as Error).message
    );
    throw err;
  } finally {
    if (client) client.release();
  }
};

export const getAreasRentalYield = async (
  offset: number = 0,
  limit: number = 5,
  search: string | null = null
): Promise<AreaRentalYield[]> => {
  const areas: AreaRentalYield[] = [];
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  let client;

  try {
    client = await pool.connect();

    let searchFilter = "";
    const params: (string | number)[] = [
      currentYear,
      lastYear,
      currentYear,
      lastYear,
      offset,
      limit,
    ];

    if (search) {
      searchFilter =
        "WHERE COALESCE(vcy.area_name_en, vly.area_name_en, acy.area_name_en, aly.area_name_en) ILIKE $1";
      params.unshift(`%${search}%`); // search param at the start
    }

    const query = `
      WITH sale_villa AS (
        SELECT area_id, area_name_en, EXTRACT(YEAR FROM instance_date)::int AS year,
               AVG(NULLIF(meter_sale_price, '')::numeric) AS avg_sale_price_sqft
        FROM transactions.villa
        WHERE trans_group_en = 'Sales'
        GROUP BY area_id, area_name_en, year
      ),
      sale_appt AS (
        SELECT area_id, area_name_en, EXTRACT(YEAR FROM instance_date)::int AS year,
               AVG(NULLIF(meter_sale_price, '')::numeric) AS avg_sale_price_sqft
        FROM transactions.appartements
        WHERE trans_group_en = 'Sales'
        GROUP BY area_id, area_name_en, year
      ),
      rent_villa AS (
        SELECT area_id, area_name_en, EXTRACT(YEAR FROM contract_start_date)::int AS year,
               AVG((annual_amount::numeric)/NULLIF(actual_area,0)) AS avg_rent_price_sqft
        FROM transactions.rents_villa
        WHERE actual_area > 0
        GROUP BY area_id, area_name_en, year
      ),
      rent_appt AS (
        SELECT area_id, area_name_en, EXTRACT(YEAR FROM contract_start_date)::int AS year,
               AVG((annual_amount::numeric)/NULLIF(actual_area,0)) AS avg_rent_price_sqft
        FROM transactions.rents_apartements
        WHERE actual_area > 0
        GROUP BY area_id, area_name_en, year
      ),
      villa AS (
        SELECT sv.area_id, sv.area_name_en, sv.year, sv.avg_sale_price_sqft,
               rv.avg_rent_price_sqft,
               CASE WHEN sv.avg_sale_price_sqft IS NULL OR sv.avg_sale_price_sqft = 0 THEN NULL
                    ELSE ROUND((rv.avg_rent_price_sqft*100)/sv.avg_sale_price_sqft,2)
               END AS rental_yield_pct
        FROM sale_villa sv
        LEFT JOIN rent_villa rv ON sv.area_id = rv.area_id AND sv.year = rv.year
      ),
      appt AS (
        SELECT sa.area_id, sa.area_name_en, sa.year, sa.avg_sale_price_sqft,
               ra.avg_rent_price_sqft,
               CASE WHEN sa.avg_sale_price_sqft IS NULL OR sa.avg_sale_price_sqft = 0 THEN NULL
                    ELSE ROUND((ra.avg_rent_price_sqft*100)/sa.avg_sale_price_sqft,2)
               END AS rental_yield_pct
        FROM sale_appt sa
        LEFT JOIN rent_appt ra ON sa.area_id = ra.area_id AND sa.year = ra.year
      )
      SELECT 
        COALESCE(vcy.area_id, vly.area_id, acy.area_id, aly.area_id) AS area_id,
        COALESCE(vcy.area_name_en, vly.area_name_en, acy.area_name_en, aly.area_name_en) AS area_name,
        vcy.rental_yield_pct AS villa_yield_current_year,
        vly.rental_yield_pct AS villa_yield_last_year,
        CASE WHEN vly.rental_yield_pct IS NULL OR vly.rental_yield_pct=0 THEN NULL
             ELSE ROUND(((vcy.rental_yield_pct - vly.rental_yield_pct)*100)/vly.rental_yield_pct,2)
        END AS villa_yield_growth_pct,
        acy.rental_yield_pct AS apt_yield_current_year,
        aly.rental_yield_pct AS apt_yield_last_year,
        CASE WHEN aly.rental_yield_pct IS NULL OR aly.rental_yield_pct=0 THEN NULL
             ELSE ROUND(((acy.rental_yield_pct - aly.rental_yield_pct)*100)/aly.rental_yield_pct,2)
        END AS apt_yield_growth_pct
      FROM (SELECT * FROM villa WHERE year=$${search ? 2 : 1}) vcy
      FULL OUTER JOIN (SELECT * FROM villa WHERE year=$${
        search ? 3 : 2
      }) vly ON vcy.area_id=vly.area_id
      FULL OUTER JOIN (SELECT * FROM appt WHERE year=$${
        search ? 4 : 3
      }) acy ON COALESCE(vcy.area_id,vly.area_id)=acy.area_id
      FULL OUTER JOIN (SELECT * FROM appt WHERE year=$${
        search ? 5 : 4
      }) aly ON COALESCE(vcy.area_id,vly.area_id,acy.area_id)=aly.area_id
      ${searchFilter}
      ORDER BY area_name
      OFFSET $${params.length - 1} LIMIT $${params.length};
    `;

    const result = await client.query(query, params);

    for (const row of result.rows) {
      areas.push({
        area_id: row.area_id,
        area_name: row.area_name,
        villa_yield_current_year: row.villa_yield_current_year,
        villa_yield_last_year: row.villa_yield_last_year,
        villa_yield_growth_pct: row.villa_yield_growth_pct,
        apt_yield_current_year: row.apt_yield_current_year,
        apt_yield_last_year: row.apt_yield_last_year,
        apt_yield_growth_pct: row.apt_yield_growth_pct,
      });
    }

    return areas;
  } catch (err) {
    console.error("Error fetching rental yield:", (err as Error).message);
    throw err;
  } finally {
    if (client) client.release();
  }
};

export const getAreasPriceGrowthVacancyRisk = async (
  offset: number = 0,
  limit: number = 5,
  search: string | null = null
): Promise<AreaPriceGrowthVacancy[]> => {
  const areas: AreaPriceGrowthVacancy[] = [];
  const currentYear = new Date().getFullYear();

  let client;

  try {
    client = await pool.connect();

    let searchFilter = "";
    const params: (string | number)[] = [
      currentYear,
      currentYear,
      currentYear,
      currentYear,
      offset,
      limit,
    ];

    if (search) {
      searchFilter =
        "WHERE COALESCE(v_curr.area_name_en, a_curr.area_name_en) ILIKE $1";
      params.unshift(`%${search}%`); // search param at start
    }

    const query = `
      WITH 
      villa_sales AS (
        SELECT area_id, area_name_en, EXTRACT(YEAR FROM instance_date)::int AS yr,
               AVG(NULLIF(meter_sale_price, '')::numeric) AS avg_sale_price
        FROM transactions.villa
        WHERE trans_group_en = 'Sales'
        GROUP BY area_id, area_name_en, yr
      ),
      appt_sales AS (
        SELECT area_id, area_name_en, EXTRACT(YEAR FROM instance_date)::int AS yr,
               AVG(NULLIF(meter_sale_price, '')::numeric) AS avg_sale_price
        FROM transactions.appartements
        WHERE trans_group_en = 'Sales'
        GROUP BY area_id, area_name_en, yr
      ),
      villa_rent_count AS (
        SELECT area_id, COUNT(*) AS num_rentals
        FROM transactions.rents_villa
        WHERE actual_area > 0
        GROUP BY area_id
      ),
      villa_sales_count AS (
        SELECT area_id, COUNT(*) AS num_sales
        FROM transactions.villa
        WHERE trans_group_en = 'Sales'
        GROUP BY area_id
      ),
      appt_rent_count AS (
        SELECT area_id, COUNT(*) AS num_rentals
        FROM transactions.rents_apartements
        WHERE actual_area > 0
        GROUP BY area_id
      ),
      appt_sales_count AS (
        SELECT area_id, COUNT(*) AS num_sales
        FROM transactions.appartements
        WHERE trans_group_en = 'Sales'
        GROUP BY area_id
      )
      SELECT
        COALESCE(v_curr.area_id, a_curr.area_id) AS area_id,
        COALESCE(v_curr.area_name_en, a_curr.area_name_en) AS area_name,
        ROUND(
          CASE WHEN v_last.avg_sale_price IS NULL OR v_last.avg_sale_price=0 THEN NULL
          ELSE ((v_curr.avg_sale_price - v_last.avg_sale_price)/v_last.avg_sale_price)*100
          END,2
        ) AS villa_price_growth_pct,
        ROUND(
          CASE WHEN a_last.avg_sale_price IS NULL OR a_last.avg_sale_price=0 THEN NULL
          ELSE ((a_curr.avg_sale_price - a_last.avg_sale_price)/a_last.avg_sale_price)*100
          END,2
        ) AS apt_price_growth_pct,
        ROUND(
          CASE WHEN v_sales.num_sales IS NULL OR (v_sales.num_sales + COALESCE(v_rent.num_rentals,0))=0 THEN NULL
          ELSE v_sales.num_sales::numeric / (v_sales.num_sales + COALESCE(v_rent.num_rentals,0))
          END,2
        ) AS villa_vacancy_risk,
        ROUND(
          CASE WHEN a_sales.num_sales IS NULL OR (a_sales.num_sales + COALESCE(a_rent.num_rentals,0))=0 THEN NULL
          ELSE a_sales.num_sales::numeric / (a_sales.num_sales + COALESCE(a_rent.num_rentals,0))
          END,2
        ) AS apt_vacancy_risk
      FROM (SELECT * FROM villa_sales WHERE yr=$${search ? 2 : 1}) v_curr
      FULL OUTER JOIN (SELECT * FROM villa_sales WHERE yr=$${
        search ? 3 : 2
      } - 1) v_last
        ON v_curr.area_id=v_last.area_id
      LEFT JOIN villa_rent_count v_rent ON COALESCE(v_curr.area_id,v_last.area_id)=v_rent.area_id
      LEFT JOIN villa_sales_count v_sales ON COALESCE(v_curr.area_id,v_last.area_id)=v_sales.area_id
      FULL OUTER JOIN (SELECT * FROM appt_sales WHERE yr=$${
        search ? 4 : 3
      }) a_curr
        ON COALESCE(v_curr.area_id,v_last.area_id)=a_curr.area_id
      FULL OUTER JOIN (SELECT * FROM appt_sales WHERE yr=$${
        search ? 5 : 4
      } - 1) a_last
        ON a_curr.area_id=a_last.area_id
      LEFT JOIN appt_rent_count a_rent ON COALESCE(a_curr.area_id,a_last.area_id)=a_rent.area_id
      LEFT JOIN appt_sales_count a_sales ON COALESCE(a_curr.area_id,a_last.area_id)=a_sales.area_id
      ${searchFilter}
      OFFSET $${params.length - 1} LIMIT $${params.length};
    `;

    const result = await client.query(query, params);

    for (const row of result.rows) {
      areas.push({
        area_id: row.area_id,
        area_name: row.area_name,
        villa_price_growth_pct:
          row.villa_price_growth_pct != null
            ? Number(row.villa_price_growth_pct)
            : null,
        apt_price_growth_pct:
          row.apt_price_growth_pct != null
            ? Number(row.apt_price_growth_pct)
            : null,
        villa_vacancy_risk:
          row.villa_vacancy_risk != null
            ? Number(row.villa_vacancy_risk)
            : null,
        apt_vacancy_risk:
          row.apt_vacancy_risk != null ? Number(row.apt_vacancy_risk) : null,
      });
    }

    return areas;
  } catch (err) {
    console.error(
      "Error fetching price growth/vacancy risk:",
      (err as Error).message
    );
    throw err;
  } finally {
    if (client) client.release();
  }
};

export const getAreasTransactionsTotalValue = async (
  offset: number = 0,
  limit: number = 20,
  search: string | null = null
): Promise<AreaTransactions[]> => {
  const areas: AreaTransactions[] = [];
  const currentYear = new Date().getFullYear();
  let client;

  try {
    client = await pool.connect();

    let searchFilter = "";
    const params: (string | number)[] = [
      currentYear,
      currentYear,
      currentYear,
      currentYear,
    ];

    if (search) {
      searchFilter = "WHERE COALESCE(v.area_name, a.area_name) ILIKE $1";
      params.unshift(`%${search}%`); // insert search at the start
    }

    params.push(offset, limit); // add offset & limit at the end

    const query = `
      WITH villa_tx AS (
        SELECT
          area_id,
          area_name_en AS area_name,
          COUNT(*) AS villa_tx_all,
          SUM(NULLIF(meter_sale_price,'')::NUMERIC) AS villa_value_all,
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM instance_date) = $${
            search ? 2 : 1
          }) AS villa_tx_last_year,
          SUM(NULLIF(meter_sale_price,'')::NUMERIC) FILTER (WHERE EXTRACT(YEAR FROM instance_date) = $${
            search ? 3 : 2
          }) AS villa_value_last_year
        FROM transactions.villa
        WHERE trans_group_en='Sales'
        GROUP BY area_id, area_name_en
      ),
      appt_tx AS (
        SELECT
          area_id,
          area_name_en AS area_name,
          COUNT(*) AS apt_tx_all,
          SUM(NULLIF(meter_sale_price,'')::NUMERIC) AS apt_value_all,
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM instance_date) = $${
            search ? 4 : 3
          }) AS apt_tx_last_year,
          SUM(NULLIF(meter_sale_price,'')::NUMERIC) FILTER (WHERE EXTRACT(YEAR FROM instance_date) = $${
            search ? 5 : 4
          }) AS apt_value_last_year
        FROM transactions.appartements
        WHERE trans_group_en='Sales'
        GROUP BY area_id, area_name_en
      )
      SELECT
        COALESCE(v.area_id, a.area_id) AS area_id,
        COALESCE(v.area_name, a.area_name) AS area_name,
        v.villa_tx_all,
        v.villa_value_all,
        v.villa_tx_last_year,
        v.villa_value_last_year,
        a.apt_tx_all,
        a.apt_value_all,
        a.apt_tx_last_year,
        a.apt_value_last_year
      FROM villa_tx v
      FULL OUTER JOIN appt_tx a ON v.area_id = a.area_id
      ${searchFilter}
      ORDER BY area_name
      OFFSET $${params.length - 1} LIMIT $${params.length};
    `;

    const result = await client.query(query, params);

    for (const row of result.rows) {
      areas.push({
        area_id: row.area_id,
        area_name: row.area_name,
        villa_tx_all: row.villa_tx_all ?? null,
        villa_value_all:
          row.villa_value_all != null ? Number(row.villa_value_all) : null,
        villa_tx_last_year: row.villa_tx_last_year ?? null,
        villa_value_last_year:
          row.villa_value_last_year != null
            ? Number(row.villa_value_last_year)
            : null,
        apt_tx_all: row.apt_tx_all ?? null,
        apt_value_all:
          row.apt_value_all != null ? Number(row.apt_value_all) : null,
        apt_tx_last_year: row.apt_tx_last_year ?? null,
        apt_value_last_year:
          row.apt_value_last_year != null
            ? Number(row.apt_value_last_year)
            : null,
      });
    }

    return areas;
  } catch (err) {
    console.error(
      "Error fetching transactions total value:",
      (err as Error).message
    );
    throw err;
  } finally {
    if (client) client.release();
  }
};
