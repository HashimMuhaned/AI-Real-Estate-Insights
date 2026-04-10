// Dubai Real Estate Market Data (Simulated)

export const AREAS = [
  "Dubai Marina", "Downtown Dubai", "JVC", "Business Bay", 
  "Palm Jumeirah", "JLT", "Dubai Hills", "Al Barsha",
  "DAMAC Hills", "Dubai Silicon Oasis"
];

export const PROPERTY_TYPES = ["Apartment", "Villa"];
export const BEDROOMS = [0, 1, 2, 3, 4];

// ROI & Yield data per area
export const yieldData = [
  { area: "JVC", avgPrice: 750000, avgRent: 65000, yield: 8.7, type: "Apartment", beds: 1 },
  { area: "Dubai Silicon Oasis", avgPrice: 620000, avgRent: 48000, yield: 7.7, type: "Apartment", beds: 1 },
  { area: "DAMAC Hills", avgPrice: 880000, avgRent: 62000, yield: 7.0, type: "Apartment", beds: 2 },
  { area: "JLT", avgPrice: 950000, avgRent: 65000, yield: 6.8, type: "Apartment", beds: 1 },
  { area: "Al Barsha", avgPrice: 1050000, avgRent: 70000, yield: 6.7, type: "Apartment", beds: 2 },
  { area: "Business Bay", avgPrice: 1350000, avgRent: 85000, yield: 6.3, type: "Apartment", beds: 1 },
  { area: "Dubai Hills", avgPrice: 1500000, avgRent: 90000, yield: 6.0, type: "Villa", beds: 3 },
  { area: "Dubai Marina", avgPrice: 1800000, avgRent: 100000, yield: 5.6, type: "Apartment", beds: 2 },
  { area: "Downtown Dubai", avgPrice: 2500000, avgRent: 120000, yield: 4.8, type: "Apartment", beds: 2 },
  { area: "Palm Jumeirah", avgPrice: 4200000, avgRent: 180000, yield: 4.3, type: "Villa", beds: 4 },
];

// Price trend data (quarterly)
export const priceTrendData = {
  "Dubai Marina": [
    { period: "Q1 2024", price: 1650000 }, { period: "Q2 2024", price: 1700000 },
    { period: "Q3 2024", price: 1720000 }, { period: "Q4 2024", price: 1750000 },
    { period: "Q1 2025", price: 1780000 }, { period: "Q2 2025", price: 1800000 },
    { period: "Q3 2025", price: 1830000 }, { period: "Q4 2025", price: 1850000 },
  ],
  "Downtown Dubai": [
    { period: "Q1 2024", price: 2200000 }, { period: "Q2 2024", price: 2280000 },
    { period: "Q3 2024", price: 2350000 }, { period: "Q4 2024", price: 2400000 },
    { period: "Q1 2025", price: 2420000 }, { period: "Q2 2025", price: 2480000 },
    { period: "Q3 2025", price: 2500000 }, { period: "Q4 2025", price: 2500000 },
  ],
  "JVC": [
    { period: "Q1 2024", price: 580000 }, { period: "Q2 2024", price: 620000 },
    { period: "Q3 2024", price: 650000 }, { period: "Q4 2024", price: 680000 },
    { period: "Q1 2025", price: 710000 }, { period: "Q2 2025", price: 730000 },
    { period: "Q3 2025", price: 745000 }, { period: "Q4 2025", price: 750000 },
  ],
  "Business Bay": [
    { period: "Q1 2024", price: 1150000 }, { period: "Q2 2024", price: 1200000 },
    { period: "Q3 2024", price: 1250000 }, { period: "Q4 2024", price: 1280000 },
    { period: "Q1 2025", price: 1300000 }, { period: "Q2 2025", price: 1320000 },
    { period: "Q3 2025", price: 1340000 }, { period: "Q4 2025", price: 1350000 },
  ],
  "Palm Jumeirah": [
    { period: "Q1 2024", price: 3800000 }, { period: "Q2 2024", price: 3900000 },
    { period: "Q3 2024", price: 4000000 }, { period: "Q4 2024", price: 4050000 },
    { period: "Q1 2025", price: 4100000 }, { period: "Q2 2025", price: 4150000 },
    { period: "Q3 2025", price: 4180000 }, { period: "Q4 2025", price: 4200000 },
  ],
  "JLT": [
    { period: "Q1 2024", price: 820000 }, { period: "Q2 2024", price: 850000 },
    { period: "Q3 2024", price: 880000 }, { period: "Q4 2024", price: 900000 },
    { period: "Q1 2025", price: 920000 }, { period: "Q2 2025", price: 935000 },
    { period: "Q3 2025", price: 945000 }, { period: "Q4 2025", price: 950000 },
  ],
  "Dubai Hills": [
    { period: "Q1 2024", price: 1280000 }, { period: "Q2 2024", price: 1320000 },
    { period: "Q3 2024", price: 1370000 }, { period: "Q4 2024", price: 1400000 },
    { period: "Q1 2025", price: 1430000 }, { period: "Q2 2025", price: 1460000 },
    { period: "Q3 2025", price: 1480000 }, { period: "Q4 2025", price: 1500000 },
  ],
  "Al Barsha": [
    { period: "Q1 2024", price: 920000 }, { period: "Q2 2024", price: 950000 },
    { period: "Q3 2024", price: 970000 }, { period: "Q4 2024", price: 990000 },
    { period: "Q1 2025", price: 1010000 }, { period: "Q2 2025", price: 1025000 },
    { period: "Q3 2025", price: 1040000 }, { period: "Q4 2025", price: 1050000 },
  ],
  "DAMAC Hills": [
    { period: "Q1 2024", price: 720000 }, { period: "Q2 2024", price: 760000 },
    { period: "Q3 2024", price: 790000 }, { period: "Q4 2024", price: 820000 },
    { period: "Q1 2025", price: 840000 }, { period: "Q2 2025", price: 855000 },
    { period: "Q3 2025", price: 870000 }, { period: "Q4 2025", price: 880000 },
  ],
  "Dubai Silicon Oasis": [
    { period: "Q1 2024", price: 480000 }, { period: "Q2 2024", price: 510000 },
    { period: "Q3 2024", price: 540000 }, { period: "Q4 2024", price: 560000 },
    { period: "Q1 2025", price: 580000 }, { period: "Q2 2025", price: 595000 },
    { period: "Q3 2025", price: 610000 }, { period: "Q4 2025", price: 620000 },
  ],
};

// Top Projects data
export const topProjects = [
  { name: "Emaar Beachfront", area: "Dubai Marina", transactions: 342, prevTransactions: 290, trend: "up" },
  { name: "Creek Harbour", area: "Business Bay", transactions: 318, prevTransactions: 280, trend: "up" },
  { name: "Sobha Hartland", area: "Dubai Hills", transactions: 295, prevTransactions: 260, trend: "up" },
  { name: "Damac Lagoons", area: "DAMAC Hills", transactions: 278, prevTransactions: 310, trend: "down" },
  { name: "Nakheel Palm", area: "Palm Jumeirah", transactions: 256, prevTransactions: 240, trend: "up" },
  { name: "JVC District", area: "JVC", transactions: 245, prevTransactions: 200, trend: "up" },
  { name: "Marina Gate", area: "Dubai Marina", transactions: 230, prevTransactions: 225, trend: "flat" },
  { name: "Burj Royale", area: "Downtown Dubai", transactions: 215, prevTransactions: 190, trend: "up" },
  { name: "Azizi Riviera", area: "Business Bay", transactions: 198, prevTransactions: 210, trend: "down" },
  { name: "Jumeirah Living", area: "JLT", transactions: 182, prevTransactions: 170, trend: "up" },
];

// Supply vs Demand data
export const supplyDemandData = [
  { year: "2022", supply: 25000, demand: 38000 },
  { year: "2023", supply: 32000, demand: 42000 },
  { year: "2024", supply: 45000, demand: 48000 },
  { year: "2025", supply: 55000, demand: 52000 },
  { year: "2026 (F)", supply: 68000, demand: 55000 },
  { year: "2027 (F)", supply: 72000, demand: 58000 },
];

// Area comparison data
export const areaComparisonData = {
  "Dubai Marina": { roi: 5.6, avgPrice: 1800000, priceGrowth: 12.1, avgRent: 100000 },
  "Downtown Dubai": { roi: 4.8, avgPrice: 2500000, priceGrowth: 13.6, avgRent: 120000 },
  "JVC": { roi: 8.7, avgPrice: 750000, priceGrowth: 29.3, avgRent: 65000 },
  "Business Bay": { roi: 6.3, avgPrice: 1350000, priceGrowth: 17.4, avgRent: 85000 },
  "Palm Jumeirah": { roi: 4.3, avgPrice: 4200000, priceGrowth: 10.5, avgRent: 180000 },
  "JLT": { roi: 6.8, avgPrice: 950000, priceGrowth: 15.9, avgRent: 65000 },
  "Dubai Hills": { roi: 6.0, avgPrice: 1500000, priceGrowth: 17.2, avgRent: 90000 },
  "Al Barsha": { roi: 6.7, avgPrice: 1050000, priceGrowth: 14.1, avgRent: 70000 },
  "DAMAC Hills": { roi: 7.0, avgPrice: 880000, priceGrowth: 22.2, avgRent: 62000 },
  "Dubai Silicon Oasis": { roi: 7.7, avgPrice: 620000, priceGrowth: 29.2, avgRent: 48000 },
};

// Helper functions
export function getYieldBadge(yieldPct) {
  if (yieldPct > 7) return { label: "High Yield", color: "emerald" };
  if (yieldPct >= 5) return { label: "Balanced", color: "accent" };
  return { label: "Low Yield", color: "destructive" };
}

export function getTrendColor(trend) {
  if (trend === "up") return "text-emerald";
  if (trend === "down") return "text-destructive";
  return "text-muted-foreground";
}

export function formatCurrency(val) {
  if (val >= 1000000) return `AED ${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `AED ${(val / 1000).toFixed(0)}K`;
  return `AED ${val.toLocaleString()}`;
}

export function computeSmartDealScore(area) {
  const comparison = areaComparisonData[area];
  if (!comparison) return 0;

  const allYields = Object.values(areaComparisonData).map(a => a.roi);
  const allGrowths = Object.values(areaComparisonData).map(a => a.priceGrowth);
  const maxYield = Math.max(...allYields);
  const minYield = Math.min(...allYields);
  const maxGrowth = Math.max(...allGrowths);
  const minGrowth = Math.min(...allGrowths);

  const normalizedYield = (comparison.roi - minYield) / (maxYield - minYield);
  const normalizedGrowth = (comparison.priceGrowth - minGrowth) / (maxGrowth - minGrowth);

  // Find demand data from top projects
  const areaProjects = topProjects.filter(p => p.area === area);
  const totalTx = areaProjects.reduce((sum, p) => sum + p.transactions, 0);
  const maxTx = 700;
  const demandScore = Math.min(totalTx / maxTx, 1);

  // Supply risk from latest year
  const latest = supplyDemandData[supplyDemandData.length - 1];
  const supplyRisk = latest.supply > latest.demand ? 0.6 : 0.2;

  const score = (normalizedYield * 0.4) + (normalizedGrowth * 0.3) + (demandScore * 0.2) - (supplyRisk * 0.1);
  return Math.round(Math.min(Math.max(score * 100, 0), 100));
}

export function getSmartDealTag(score) {
  if (score >= 75) return "Undervalued";
  if (score >= 55) return "High Growth";
  if (score >= 40) return "Stable";
  return "Watch";
}