"use client";

import ROIYieldAnalyzer from "@/components/market-tools/ROIYieldAnalyzer";
import PriceTrendTool from "@/components/market-tools/PriceTrendTool";
import AreaComparison from "@/components/market-tools/AreaComparison";
import TopProjects from "@/components/market-tools/TopProjects";
import SupplyDemand from "@/components/market-tools/SupplyDemand";
import SmartDealFinder from "@/components/market-tools/SmartDealFinder";

export default function MarketTools() {
  return (
    <div className="min-h-screen bg-background pt-10">
      {/* Header */}
      <div className="text-center mb-2">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          Everything You Need to
          <span className="text-accent"> Dominate </span>
          Dubai Real Estate
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Our comprehensive platform combines cutting-edge AI technology with
          deep market expertise to give you the competitive edge in Dubai's
          property market.
        </p>
      </div>

      {/* Grid */}
      <div className="px-24 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ROIYieldAnalyzer />
          <PriceTrendTool />
          <AreaComparison />
          <TopProjects />
          <SupplyDemand />
          <SmartDealFinder />
        </div>
      </div>
    </div>
  );
}
