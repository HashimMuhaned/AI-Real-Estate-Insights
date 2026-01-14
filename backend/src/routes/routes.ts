// const experess = require("express");
import pool from "../dbconfig";
import axios from "axios";
import express, { Request, Response } from "express";
import {
  getAllAreas,
  getAreasRentalYield,
  getAreasPriceGrowthVacancyRisk,
  getAreasTransactionsTotalValue,
} from "../controllers/controllers";

import {
  getTopProjects,
  getAreaOverView,
  getRentToPriceRatio,
  getVillaApartementPriceChange,
  getVillaApartmentPricePerBedRoomNumber,
  getTopRentalYieldProjects,
  getRentalYieldByRoomAndYear,
} from "../controllers/area_insightsControllers";
import { summarizeRentToPriceRatio } from "../helper/aggregate_rent_to_price_ratio";

const router = express.Router();

router.get("/areas", async (req: Request, res: Response) => {
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || null;

  try {
    const areas = await getAllAreas(offset, limit, search);
    res.json(areas);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/areas-rental-yield", async (req: Request, res: Response) => {
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = parseInt(req.query.limit as string) || 5;

  try {
    const data = await getAreasRentalYield(offset, limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.get(
  "/areas-price-growth-vacancy-risk",
  async (req: Request, res: Response) => {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 5;
    const search = (req.query.search as string) || null;

    try {
      const data = await getAreasPriceGrowthVacancyRisk(offset, limit, search);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  }
);

router.get(
  "/areas-transactions-total-value",
  async (req: Request, res: Response) => {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 5;
    const search = (req.query.search as string) || null;

    try {
      const data = await getAreasTransactionsTotalValue(offset, limit, search);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  }
);

router.get("/get-top-projects", async (req: Request, res: Response) => {
  const searchRaw = (req.query.search as string) || "";
  const search = searchRaw.replace(/-/g, " ");

  const year = (req.query.year as string) || "all";
  const regType = (req.query.regType as string) || "all";
  const transferType = (req.query.transferType as string) || "Sales";
  const propertyUsage = (req.query.propertyUsage as string) || "all";
  const propertyTypes = (req.query.propertyTypes as string) || "";

  const propertyTypeArray =
    propertyTypes && propertyTypes.length > 0
      ? propertyTypes.split(",").map((t) => t.trim())
      : [];

  try {
    const data = await getTopProjects({
      search,
      year,
      regType,
      transferType,
      propertyUsage,
      propertyTypes: propertyTypeArray,
    });
    res.json(data);
  } catch (err) {
    console.error("Error in /get-top-projects:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/get-top-rent-projects", async (req: Request, res: Response) => {
  const searchRaw = (req.query.search as string) || "";
  const search = searchRaw.replace(/-/g, " ");

  const year = (req.query.year as string) || "all";
  const propertyUsage = (req.query.propertyUsage as string) || "all";
  const propertyTypes = (req.query.propertyTypes as string) || "";

  const propertyTypeArray =
    propertyTypes && propertyTypes.length > 0
      ? propertyTypes.split(",").map((t) => t.trim())
      : [];

  try {
    const data = await getTopRentalYieldProjects({
      search,
      year,
      propertyUsage,
      propertyTypes: propertyTypeArray,
    });
    res.json(data);
  } catch (err) {
    console.error("Error in /get-top-rent-projects:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/get-area-overview", async (req: Request, res: Response) => {
  try {
    // replace hyphens with spaces
    const searchRaw = (req.query.search as string) || "";
    const search = searchRaw.replace(/-/g, " ");

    const data = await getAreaOverView(search);
    res.json(data);
  } catch (err) {
    console.error("Error in /get-area-overview:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/get-rent-to-price-ratio", async (req: Request, res: Response) => {
  const areaName = (req.query.areaName as string) || null;
  const dateRange = (req.query.dateRange as string) || "5y";
  const propertyType = (req.query.propertyType as string) || "all";
  const bedrooms = (req.query.bedrooms as string) || "all";
  const detail_level = req.query.detail_level || "short";

  try {
    const data = await getRentToPriceRatio(
      areaName,
      dateRange,
      propertyType,
      bedrooms
    );

    const dataSummary = summarizeRentToPriceRatio(data);

    const context = {
      area: areaName,
      propertyType,
      bedrooms,
      dateRange,
    };

    const aiResponse = await axios.post(
      "http://localhost:8000/api/ai/generate/insights",
      {
        chart_type: "rent_to_price_ratio",
        context,
        data_summary: dataSummary?.groups, // array of objects
        detail_level,
        mode: "insight",
      }
    );

    console.log("================= ==================", aiResponse);

    res.json({
      chartData: data,
      summary: dataSummary,
      aiInsight: aiResponse.data.insight,
    });
  } catch (err) {
    console.error("Error generating AI insight:", err);
    res.status(500).json({ error: "Failed to generate insight" });
  }
});

router.get(
  "/get-villa-apartment-price-change-per-sqft",
  async (req: Request, res: Response) => {
    const areaName = (req.query.areaName as string) || null;
    const dateRange = (req.query.dateRange as string) || "5y"; // default to last 5 years

    try {
      const data = await getVillaApartementPriceChange(areaName, dateRange);
      res.json(data);
    } catch (err) {
      console.error("Error in /get-villa-apartment-price-change route:", err);
      res.status(500).json({ error: "Database error" });
    }
  }
);

router.get(
  "/get-villa-apartment-price-each-bed-room-number",
  async (req: Request, res: Response) => {
    const areaName = (req.query.areaName as string) || null;
    const dateRange = (req.query.dateRange as string) || "5y"; // default to last 5 years

    try {
      const data = await getVillaApartmentPricePerBedRoomNumber(
        areaName,
        dateRange
      );
      res.json(data);
    } catch (err) {
      console.error("Error in /get-villa-apartment-price-change route:", err);
      res.status(500).json({ error: "Database error" });
    }
  }
);

router.get("/get-rental-yield", async (req, res) => {
  try {
    const {
      area,
      year,
      room_num,
      property_type = "both",
      granularity = "yearly",
    } = req.query;

    const parsedYear =
      typeof year === "string" && year.trim() !== "" && !isNaN(Number(year))
        ? Number(year)
        : null;

    const room =
      typeof room_num === "string" && room_num.trim() !== ""
        ? String(room_num)
        : null;

    const data = await getRentalYieldByRoomAndYear(
      area ? String(area) : null,
      parsedYear,
      room,
      property_type ? String(property_type) : "both"
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("❌ Error in /get-rental-yield:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rental yield data.",
    });
  }
});

function safeNumber(
  value: unknown,
  fallback: number | null | undefined
): number | null {
  const num = Number(value);
  return isNaN(num) ? fallback ?? null : num;
}

// Normalize metrics to 0..1 for scoring (simple min-max clipters).
function normalize(value: any, min: any, max: any) {
  if (value === null || value === undefined) return null;
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

router.get("/investment-score", async (req, res) => {
  const areaName = req.query.areaName || null;
  const propertyType = req.query.propertyType || "apartments";

  try {
    // paramize areaName if you want to filter query by area_name_en
    const client = await pool.connect();

    // You can parameterize the SQL to filter by area_name_en or project_number.
    // For now run the query and then in JS filter by area if needed.
    const sql = `-- put the above investment_metrics.sql here or load it from file
    WITH tx AS (
      SELECT
        instance_date,
        project_number,
        NULLIF(regexp_replace(meter_sale_price, '[^0-9.]', '', 'g'), '')::numeric AS meter_sale_price_num,
        NULLIF(regexp_replace(meter_rent_price, '[^0-9.]', '', 'g'), '')::numeric AS meter_rent_price_num
      FROM transactions.transactions
      WHERE meter_sale_price IS NOT NULL OR meter_rent_price IS NOT NULL
    ),
    monthly AS (
      SELECT
        date_trunc('month', instance_date) AS month,
        AVG(meter_sale_price_num) AS avg_price
      FROM tx
      WHERE meter_sale_price_num IS NOT NULL
      GROUP BY 1
    ),
    monthly_12 AS (
      SELECT month, avg_price
      FROM monthly
      WHERE month >= (date_trunc('month', CURRENT_DATE) - INTERVAL '12 months')
    ),
    monthly_prev_12 AS (
      SELECT month, avg_price
      FROM monthly
      WHERE month >= (date_trunc('month', CURRENT_DATE) - INTERVAL '24 months')
        AND month <  (date_trunc('month', CURRENT_DATE) - INTERVAL '12 months')
    ),
    metrics AS (
      SELECT
        (SELECT AVG(avg_price) FROM monthly_12) AS avg_price_last_12m,
        (SELECT AVG(avg_price) FROM monthly_prev_12) AS avg_price_prev_12m,
        (SELECT STDDEV_SAMP(avg_price) FROM monthly_12) AS volatility_price,
        (SELECT COUNT(*) FROM transactions.transactions t
           WHERE t.instance_date >= (CURRENT_DATE - INTERVAL '12 months')
             AND (t.meter_sale_price IS NOT NULL OR t.meter_rent_price IS NOT NULL)
        )::int AS txn_volume
    ),
    yield_calc AS (
      SELECT
        AVG(NULLIF(regexp_replace(r.annual_amount::text, '[^0-9.]', '', 'g'), '')::numeric) as avg_annual_rent,
        AVG(NULLIF(regexp_replace(tx.meter_sale_price, '[^0-9.]', '', 'g'), '')::numeric) as avg_meter_sale_price,
        AVG(NULLIF(regexp_replace(tx.meter_rent_price, '[^0-9.]', '', 'g'), '')::numeric) as avg_meter_rent_price
      FROM transactions.rents r
      LEFT JOIN (
        SELECT project_number, meter_sale_price, meter_rent_price
        FROM transactions.transactions
        WHERE meter_sale_price IS NOT NULL OR meter_rent_price IS NOT NULL
      ) tx ON tx.project_number = r.project_number
    ),
    time_proxy AS (
  SELECT
    AVG(
      ABS(
        EXTRACT(
          EPOCH FROM (t.instance_date::timestamp - r.contract_start_date::timestamp)
        ) / 86400
      )
    )::numeric AS avg_days_proxy
  FROM transactions.transactions t
  JOIN transactions.rents r
    ON r.project_number = t.project_number
  WHERE t.instance_date IS NOT NULL
    AND r.contract_start_date IS NOT NULL
    AND t.instance_date BETWEEN r.contract_start_date - INTERVAL '180 days'
    AND r.contract_start_date + INTERVAL '365 days'
)
    SELECT
      m.avg_price_last_12m,
      m.avg_price_prev_12m,
      CASE
        WHEN m.avg_price_prev_12m IS NOT NULL AND m.avg_price_prev_12m <> 0
          THEN (m.avg_price_last_12m - m.avg_price_prev_12m) / m.avg_price_prev_12m
        ELSE NULL
      END AS yoy_change,
      COALESCE(m.volatility_price, 0) AS volatility,
      m.txn_volume,
      CASE
        WHEN y.avg_meter_sale_price IS NOT NULL AND y.avg_meter_sale_price <> 0
          THEN (y.avg_meter_rent_price * 12.0) / y.avg_meter_sale_price
        ELSE NULL
      END AS yield,
      tp.avg_days_proxy AS time_on_market_proxy,
      0::int AS supply_pipeline_count,
      0.75::numeric AS developer_reliability
    FROM metrics m
    CROSS JOIN yield_calc y
    CROSS JOIN time_proxy tp;`;

    const result = await client.query(sql);
    client.release();

    const row = result.rows[0] || {};

    // Build metrics object
    const metrics = {
      yield: safeNumber(row.yield, null),
      yoy_change: safeNumber(row.yoy_change, null),
      volatility: safeNumber(row.volatility, 0),
      txn_volume: safeNumber(row.txn_volume, 0),
      time_on_market: safeNumber(row.time_on_market_proxy, null),
      supply_pipeline_count: safeNumber(row.supply_pipeline_count, 0),
      developer_reliability: safeNumber(row.developer_reliability, 0.75),
      avg_price_last_12m: safeNumber(row.avg_price_last_12m, null),
    };

    // Send to LangGraph AI server
    const aiPayload = {
      chart_type: "investment_signals",
      context: { area: areaName, propertyType },
      metrics,
      mode: "investment_score",
    };

    const aiRes = await axios.post(
      "http://localhost:8000/api/ai/generate/insights",
      aiPayload,
    );

    return res.json({
      metrics,
      investmentScore: aiRes.data,
    });
  } catch (err) {
    console.error("Error computing investment score:", err);
    return res
      .status(500)
      .json({ error: "Failed to compute investment score" });
  }
});

export default router;
