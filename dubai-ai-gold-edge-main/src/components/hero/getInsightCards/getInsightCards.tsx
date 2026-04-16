import { getTopYieldAreas } from "@/db/queries/hero_cards_queries/getTopYield";
import { getPriceHeatmap } from "@/db/queries/hero_cards_queries/getPriceHeatmap";
import { getTransactionMix } from "@/db/queries/hero_cards_queries/getTransactionMix";
import { getOffPlanProjects } from "@/db/queries/hero_cards_queries/getOffplanProjects";
import { getRiskIndex } from "@/db/queries/hero_cards_queries/getRiskIndex";
import { getPriceTrends } from "@/db/queries/hero_cards_queries/getPriceTrends";
import { getRentalTrend } from "@/db/queries/hero_cards_queries/getRentalTrend";

export async function getInsightCards() {
  const [
    yieldData,
    heatmapData,
    transactionData,
    offplanData,
    riskData,
    priceTrendData,
    rentalTrendData,
  ] = await Promise.all([
    getTopYieldAreas(),
    getPriceHeatmap(),
    getTransactionMix(),
    getOffPlanProjects(),
    getRiskIndex(),
    getPriceTrends(),
    getRentalTrend(),
  ]);

  return [
    // 1 ─ Yield leaderboard
    {
      id: "yield",
      type: "yield",
      badge: "Top Rental Yield 1BR Apartment",
      location: "Dubai 2026 Rankings",
      kpi: `${yieldData[0]?.roi}%`,
      kpiLabel: "Peak ROI",
      trend: "up",
      chartVariant: "leaderboard",
      chartData: yieldData,
      aiInsight: "Live rental yield ranking based on median rent vs price.",
      accentColor: "#22c55e",
      bgFrom: "rgba(34,197,94,0.13)",
      bgTo: "rgba(16,185,129,0.03)",
    },

    // 2 ─ Heatmap
    {
      id: "heatmap",
      type: "buy",
      badge: "Price Heat Map 1BR Apartment",
      location: "Dubai Districts",
      kpi: heatmapData.avg,
      kpiLabel: "Avg / sqft",
      trend: "up",
      chartVariant: "heatmap",
      chartData: heatmapData.items,
      aiInsight:
        "Premium clusters remain concentrated in waterfront districts.",
      accentColor: "#f97316",
      bgFrom: "rgba(249,115,22,0.12)",
      bgTo: "rgba(251,146,60,0.03)",
    },

    // 3 ─ Transactions mix
    {
      id: "transactions",
      type: "transactions",
      badge: "Market Activity",
      location: "Dubai Metro",
      kpi: transactionData.total,
      kpiLabel: "Total Transactions",
      trend: "neutral",
      chartVariant: "donut",
      chartData: transactionData.mix,
      aiInsight: "Apartments dominate transaction volume.",
      accentColor: "#a855f7",
      bgFrom: "rgba(168,85,247,0.13)",
      bgTo: "rgba(139,92,246,0.03)",
    },

    // // 4 ─ Offplan
    {
      id: "offplan",
      type: "offplan",
      badge: "Off-plan Hotlist",
      location: "Q2 2026",
      kpi: offplanData.bestROI,
      kpiLabel: "Best Expected ROI",
      trend: "up",
      chartVariant: "topProjects",
      chartData: offplanData.projects,
      aiInsight: "Strong developer-led pipeline in growth corridors.",
      accentColor: "#f59e0b",
      bgFrom: "rgba(245,158,11,0.13)",
      bgTo: "rgba(251,191,36,0.03)",
    },

    // 5 ─ Risk
    {
      id: "alert",
      type: "alert",
      badge: "Market Alert",
      location: riskData.areaName,
      kpi: `${riskData.index}`,
      kpiLabel: "Risk Index",
      trend: riskData.trend,
      chartVariant: "radialGauge",
      chartData: riskData.chartData,
      aiInsight: "Market cooling in selected high-supply zones.",
      accentColor: "#ef4444",
      bgFrom: "rgba(239,68,68,0.13)",
      bgTo: "rgba(248,113,113,0.03)",
    },

    // // 6 ─ Price trends
    {
      id: "pricetrend",
      type: "buy",
      badge: "Price Trends",
      location: "Top Communities",
      kpi: priceTrendData.growth,
      kpiLabel: "Best YoY Growth",
      trend: "up",
      chartVariant: "areaSparkline",
      chartData: priceTrendData,
      aiInsight: "Strong sustained appreciation across prime communities.",
      accentColor: "#3b82f6",
      bgFrom: "rgba(59,130,246,0.13)",
      bgTo: "rgba(56,189,248,0.03)",
    },

    // // 7 ─ Rental trend
    {
      id: "rental-lines",
      type: "yield",
      badge: "Rental Trend",
      location: "Dubai Avg Rent",
      kpi: rentalTrendData.growth,
      kpiLabel: "YoY Rent Growth",
      trend: "up",
      chartVariant: "singleLine",
      chartData: rentalTrendData,
      aiInsight: "Rental market continues steady upward momentum.",
      accentColor: "#06b6d4",
      bgFrom: "rgba(6,182,212,0.12)",
      bgTo: "rgba(34,211,238,0.03)",
    },
  ];
}
