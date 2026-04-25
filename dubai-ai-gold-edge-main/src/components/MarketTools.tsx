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
    <div className="min-h-screen bg-background pt-8 sm:pt-10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">

        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center px-2">
          <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Everything You Need to
            <span className="text-accent"> Dominate </span>
            Dubai Real Estate
          </h2>
          <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground">
            Our comprehensive platform combines cutting-edge AI technology with
            deep market expertise to give you the competitive edge in
            Dubai&apos;s property market.
          </p>
        </div>

        {/* Tool grid */}
        <div className="pb-10 sm:pb-14">
          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6 xl:grid-cols-2">
            <InvestmentScore
              areaComparisonData={areaComparisonData}
              topProjects={topProjects}
              supplyDemandData={supplyDemandData}
            />
            <AreaComparison areaComparisonData={areaComparisonData} />
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