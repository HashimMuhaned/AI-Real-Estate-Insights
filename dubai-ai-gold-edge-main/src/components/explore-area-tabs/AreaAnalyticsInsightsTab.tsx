import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  BarChart2,
  GitCompare,
  Zap,
  Package,
  Bot,
} from "lucide-react";

import InsightsTabNav, { TABS } from "./analytics/InsightsTabNav";
import InsightsSectionHeader from "./analytics/InsightsSectionHeader";
import ChartSection from "./analytics/ChartSection";
import PlaceholderPanel from "./analytics/PlaceholderPanel";
import AIAdvisorPanel from "./analytics/AIAdvisorPanel";

// Chart imports — these exist externally and are NOT being rebuilt
// import AreaOverView from "@/components/charts/(general)/AreaOverView";
import RentalYeildInArea from "@/components/charts/RentalYeildInArea";
import PriceTrendChart from "@/components/charts/(areaCharts)/priceTrend/PriceTrendChart";
import RentPriceTrend from "@/components/charts/(areaCharts)/RentTrend/RentTrendChart";
import YieldChart from "@/components/charts/(areaCharts)/yield/YieldHorizontalRank";
import VolumeChart from "@/components/charts/(areaCharts)/transactionVolume/TransactionVolume";
import GrowthComparisonChart from "@/components/charts/(areaCharts)/growthComparison/GrowthComparisonChart";
import GrossYieldChart from "@/components/charts/(areaCharts)/RentIntellegence/rental_yield_ranking/RentalYieldRanking";
import RentHeatmap from "@/components/charts/(areaCharts)/RentIntellegence/rent_heatmap/RentHeatmap";
import YieldTrendChart from "@/components/charts/(areaCharts)/RentIntellegence/yield_rent/YieldRent";
import RentalDistribution from "@/components/charts/(areaCharts)/RentIntellegence/rent_distribution/Rentaldistribution";
import RentalHistogram from "@/components/charts/(areaCharts)/RentIntellegence/rental_histogram/Rentalhistogram";
import RentalMomentumChart from "../charts/(areaCharts)/RentIntellegence/rent_momentum_chart/Rentalmomentumchart";
import InvestmentScore from "../charts/(areaCharts)/InvestmentSignals/InvestmentScore/InvestmentScore";

const ICON_MAP = { TrendingUp, BarChart2, GitCompare, Zap, Package, Bot };

const panelVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function AreaAnalyticsInsightsTab({ name }) {
  const [active, setActive] = useState("general");
  const activeTab = TABS.find((t) => t.id === active);

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Tab Navigation */}
      <InsightsTabNav active={active} setActive={setActive} icons={ICON_MAP} />

      {/* Section Header */}
      {activeTab && (
        <InsightsSectionHeader
          icon={ICON_MAP[activeTab.icon]}
          label={activeTab.label}
          sub={activeTab.sub}
        />
      )}

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          variants={panelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          {active === "general" && (
            <div>
              {/* <ChartSection
                number="01"
                label="Area Market Overview"
                sub="Price distribution, transaction activity, and supply trends"
              >
                <AreaOverView area={name} />
              </ChartSection> */}
              <ChartSection
                number="02"
                label="Price Trend"
                sub="Sales price per sqft over time"
              >
                <PriceTrendChart />
              </ChartSection>
              <ChartSection
                number="03"
                label="Rent Price Trend"
                sub="Average rent movement across unit types"
              >
                <RentPriceTrend />
              </ChartSection>
              <ChartSection
                number="04"
                label="Yield Ranking"
                sub="Gross yield across sub-communities, sorted by performance"
              >
                <YieldChart />
              </ChartSection>
              <ChartSection
                number="05"
                label="Transaction Volume"
                sub="Monthly deal count — market momentum indicator"
              >
                <VolumeChart />
              </ChartSection>
              <ChartSection
                number="06"
                label="Growth Comparison"
                sub="Year-on-year price growth vs comparable areas"
              >
                <GrowthComparisonChart />
              </ChartSection>
            </div>
          )}

          {active === "rental" && (
            <div>
              {/* <ChartSection
                number="01"
                label="Rental Intelligence"
                sub="Yield breakdown by unit type and bedroom count"
              >
                <RentalYeildInArea areaName={name} />
              </ChartSection> */}
              <ChartSection
                number="02"
                label="Gross Yield Ranking"
                sub="Top-performing communities by rental yield"
              >
                <GrossYieldChart />
              </ChartSection>
              <ChartSection
                number="03"
                label="Rent Heatmap"
                sub="Rental price intensity across the area"
              >
                <RentHeatmap />
              </ChartSection>
              <ChartSection
                number="04"
                label="Yield Trend"
                sub="Rental yield movement over time"
              >
                <YieldTrendChart />
              </ChartSection>
              <ChartSection
                number="05"
                label="Rent Distribution"
                sub="Rental price spread by property type"
              >
                <RentalDistribution />
              </ChartSection>
              <ChartSection
                number="06"
                label="Rent Distribution Histogram"
                sub="Frequency distribution of rental prices"
              >
                <RentalHistogram />
              </ChartSection>
              <ChartSection
                number="07"
                label="Rental Momentum Chart"
                sub="rent growth acceleration/deceleration"
              >
                <RentalMomentumChart />
              </ChartSection>
            </div>
          )}

          {active === "comparison" && (
            <PlaceholderPanel
              icon={GitCompare}
              label="Market Comparison"
              sub="Side-by-side area benchmarks"
            />
          )}

          {active === "signals" && (
            // <PlaceholderPanel
            //   icon={Zap}
            //   label="Investment Signals"
            //   sub="Smart buy/sell indicators"
            // />
            <div>
              <ChartSection number="01" label="investment score" sub="">
                <InvestmentScore />
              </ChartSection>
            </div>
          )}

          {active === "supply_dev" && (
            <PlaceholderPanel
              icon={Package}
              label="Supply & Development"
              sub="Pipeline and handover data"
            />
          )}

          {active === "AI" && <AIAdvisorPanel name={name} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
