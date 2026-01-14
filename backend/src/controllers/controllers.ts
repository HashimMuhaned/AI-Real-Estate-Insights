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
  let client;
  try {
    client = await pool.connect();

    const query = `
      SELECT *
      FROM analytics.area_avg_prices
      WHERE ($1::text IS NULL OR area_name ILIKE '%' || $1 || '%')
      ORDER BY area_name
      OFFSET $2 LIMIT $3;
    `;

    const params: (string | number | null)[] = [search, offset, limit];

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
  let client;

  try {
    client = await pool.connect();

    const query = `
      SELECT
        area_id,
        area_name,
        villa_yield_current_year,
        villa_yield_last_year,
        villa_yield_growth_pct,
        apt_yield_current_year,
        apt_yield_last_year,
        apt_yield_growth_pct
      FROM analytics.area_rental_yield_mv
      WHERE ($1::text IS NULL OR area_name ILIKE '%' || $1 || '%')
      ORDER BY area_name
      OFFSET $2 LIMIT $3;
    `;

    const params = [search, offset, limit];
    const result = await client.query(query, params);

    for (const row of result.rows) {
      areas.push({
        area_id: row.area_id,
        area_name: row.area_name,
        villa_yield_current_year: row.villa_yield_current_year ?? null,
        villa_yield_last_year: row.villa_yield_last_year ?? null,
        villa_yield_growth_pct: row.villa_yield_growth_pct ?? null,
        apt_yield_current_year: row.apt_yield_current_year ?? null,
        apt_yield_last_year: row.apt_yield_last_year ?? null,
        apt_yield_growth_pct: row.apt_yield_growth_pct ?? null,
      });
    }

    return areas;
  } catch (err) {
    console.error("❌ Error fetching rental yield:", (err as Error).message);
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
  let client;
  try {
    client = await pool.connect();

    let query = `
      SELECT *
      FROM analytics.area_price_growth_vacancy_mv
      WHERE ($1::text IS NULL OR area_name ILIKE '%' || $1 || '%')
      ORDER BY area_name
      OFFSET $2 LIMIT $3;
    `;

    const result = await client.query(query, [search, offset, limit]);

    return result.rows.map((row) => ({
      area_id: row.area_id,
      area_name: row.area_name,
      villa_price_growth_pct: row.villa_price_growth_pct
        ? Number(row.villa_price_growth_pct)
        : null,
      apt_price_growth_pct: row.apt_price_growth_pct
        ? Number(row.apt_price_growth_pct)
        : null,
      villa_vacancy_risk: row.villa_vacancy_risk
        ? Number(row.villa_vacancy_risk)
        : null,
      apt_vacancy_risk: row.apt_vacancy_risk
        ? Number(row.apt_vacancy_risk)
        : null,
    }));
  } catch (err) {
    console.error(
      "❌ Error fetching area price growth/vacancy risk:",
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
  let client;
  try {
    client = await pool.connect();

    const query = `
      SELECT *
      FROM analytics.area_transactions_total_value_mv
      WHERE ($1::text IS NULL OR area_name ILIKE '%' || $1 || '%')
      ORDER BY area_name
      OFFSET $2 LIMIT $3;
    `;

    const result = await client.query(query, [search, offset, limit]);

    return result.rows.map((row) => ({
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
    }));
  } catch (err) {
    console.error(
      "❌ Error fetching transactions total value:",
      (err as Error).message
    );
    throw err;
  } finally {
    if (client) client.release();
  }
};
