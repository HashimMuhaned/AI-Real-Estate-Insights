"use client";

import ROIYieldAnalyzer from "@/components/market-tools/ROIYieldAnalyzer";
import PriceTrendTool from "@/components/market-tools/PriceTrendTool";
import AreaComparison from "@/components/market-tools/AreaComparison";
import TopProjects from "@/components/market-tools/TopProjects";
import SupplyDemand from "@/components/market-tools/SupplyDemand";
import SmartDealFinder from "@/components/market-tools/SmartDealFinder";
import InvestmentScore from "@/components/market-tools/InvestmentScore";

export default function MarketTools({
  areaComparisonData,
  topProjects,
  yieldData,
  supplyDemandData,
  priceTrendData,
}) {
  return (
    <div className="min-h-screen bg-background pt-10">
      {/* Wider container + less side padding on large screens */}
      <div className="mx-auto max-w-[1600px] px-3 sm:px-4 md:px-6 lg:px-6 xl:px-4 2xl:px-2">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            Everything You Need to
            <span className="text-accent"> Dominate </span>
            Dubai Real Estate
          </h2>

          <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg md:text-xl">
            Our comprehensive platform combines cutting-edge AI technology with
            deep market expertise to give you the competitive edge in
            Dubai&apos;s property market.
          </p>
        </div>

        {/* Grid */}
        <div className="py-4 px-20 sm:py-6">
          <div className="grid grid-cols-1 gap-5 lg:gap-6 xl:grid-cols-2">
            {/* <ROIYieldAnalyzer /> */}
            <InvestmentScore
              areaComparisonData={areaComparisonData}
              topProjects={topProjects}
              supplyDemandData={supplyDemandData}
            />
            {/* <PriceTrendTool /> */}
            <AreaComparison areaComparisonData={areaComparisonData} />
            {/* <TopProjects /> */}
            <SupplyDemand supplyDemandData={supplyDemandData} />
            <SmartDealFinder
              areaComparisonData={areaComparisonData}
              topProjects={topProjects}
              supplyDemandData={supplyDemandData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
