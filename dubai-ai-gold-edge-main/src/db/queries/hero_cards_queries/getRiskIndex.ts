import { db } from "@/db";
import { sql } from "drizzle-orm";

type RiskRow = {
  tx_count: number | string;
  price_volatility: number | string;
  rent_volatility: number | string;
  liquidity_risk: number | string;
  price_risk: number | string;
  rent_risk: number | string;
  area_name: string;
};

export async function getRiskIndex() {
  const areaId = 409;

  const result = (await db.execute(sql`
    WITH tx AS (
      SELECT
        COUNT(*)::numeric AS tx_count,
        COALESCE(STDDEV(actual_worth), 0)::numeric AS price_volatility
      FROM transactions
      WHERE area_id = ${areaId}
        AND actual_worth IS NOT NULL
        AND instance_date >= NOW() - INTERVAL '180 days'
    ),

    rent AS (
      SELECT
        COALESCE(STDDEV(annual_amount), 0)::numeric AS rent_volatility
      FROM rents
      WHERE area_id = ${areaId}
        AND annual_amount IS NOT NULL
        AND contract_start_date >= NOW() - INTERVAL '180 days'
    ),

    area AS (
      SELECT commercial_name
      FROM area_commercial_mapping
      WHERE area_id = ${areaId}
      ORDER BY confidence_score DESC NULLS LAST
      LIMIT 1
    )

    SELECT
      tx.tx_count,
      tx.price_volatility,
      r.rent_volatility,

      LEAST(100, GREATEST(0, 100 - (tx.tx_count * 2)))::numeric AS liquidity_risk,
      LEAST(100, tx.price_volatility / 1000)::numeric AS price_risk,
      LEAST(100, r.rent_volatility / 5000)::numeric AS rent_risk,

      a.commercial_name AS area_name

    FROM tx
    CROSS JOIN rent r
    LEFT JOIN area a ON TRUE;
  `)) as unknown as RiskRow[];

  const row = result[0];

  if (!row) {
    return {
      index: 0,
      trend: "up" as const,
      areaName: "Unknown",
      chartData: {
        value: 0,
        label: "Risk Index",
        zones: [
          { label: "Low", color: "#22c55e", from: 0, to: 33 },
          { label: "Moderate", color: "#f59e0b", from: 33, to: 66 },
          { label: "High", color: "#ef4444", from: 66, to: 100 },
        ],
        metrics: [
          { label: "Oversupply Risk", val: "Low" },
          { label: "Liquidity", val: "Low" },
          { label: "Outlook 12m", val: "Stable" },
        ],
      },
    };
  }

  const txCount = Number(row.tx_count);
  const liquidityRisk = Number(row.liquidity_risk);
  const priceRisk = Number(row.price_risk);
  const rentRisk = Number(row.rent_risk);

  const riskIndex = Math.round(
    liquidityRisk * 0.4 + priceRisk * 0.35 + rentRisk * 0.25
  );

  const level = riskIndex < 33 ? "Low" : riskIndex < 66 ? "Moderate" : "High";

  const liquidityLevel =
    txCount > 200 ? "High" : txCount > 80 ? "Moderate" : "Low";

  return {
    index: riskIndex,
    trend: riskIndex > 55 ? "down" as const : "up" as const,
    areaName: row.area_name || "Unknown",

    chartData: {
      value: riskIndex,
      label: "Risk Index",
      zones: [
        { label: "Low", color: "#22c55e", from: 0, to: 33 },
        { label: "Moderate", color: "#f59e0b", from: 33, to: 66 },
        { label: "High", color: "#ef4444", from: 66, to: 100 },
      ],
      metrics: [
        { label: "Oversupply Risk", val: level },
        { label: "Liquidity", val: liquidityLevel },
        { label: "Outlook 12m", val: riskIndex > 55 ? "Weakening" : "Stable" },
      ],
    },
  };
}