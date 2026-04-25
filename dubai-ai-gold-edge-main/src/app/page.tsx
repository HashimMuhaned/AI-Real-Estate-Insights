import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import MarketTools from "@/components/MarketTools";
import MarketReports from "@/components/MarketReports";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import MarketOpportunities from "@/components/MarketOpportunities";
import Developers from "@/components/ListingBestDevelopers";
import AIAdvisorCTA from "@/components/AIAdvisorCTA";

import { getAreaComparisonData } from "@/db/queries/market-tools/getAreaComparison";
import { getTopProjects } from "@/db/queries/market-tools/getTopProjects";
import { getSupplyDemand } from "@/db/queries/market-tools/getSupplyDemand";
import { getYieldData } from "@/db/queries/market-tools/getYieldData";
import { getPriceTrendData } from "@/db/queries/market-tools/getPriceTrend";
import { getRoiAreas } from "@/db/queries/opportunities/getRoiAreas";
import { getOffPlanProjects } from "@/db/queries/opportunities/getOffPlanProjects";
import { getUndervaluedCommunities } from "@/db/queries/opportunities/getUndervaluedCommunities";
import { getDevelopers } from "@/db/queries/developers/getDevelopers";

export default async function Page() {
  const [
    areaComparisonData,
    topProjects,
    yieldData,
    supplyDemandData,
    priceTrend,
    roiAreas,
    offPlanProjects,
    undervaluedCommunities,
    developers,
  ] = await Promise.all([
    getAreaComparisonData(),
    getTopProjects(),
    getYieldData(),
    getSupplyDemand(),
    getPriceTrendData(),
    getRoiAreas(),
    getOffPlanProjects(),
    getUndervaluedCommunities(5),
    getDevelopers(),
  ]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Hero />
      <Features />

      <MarketTools
        areaComparisonData={areaComparisonData}
        topProjects={topProjects}
        yieldData={yieldData}
        supplyDemandData={supplyDemandData}
        priceTrendData={priceTrend}
      />

      <MarketOpportunities
        roiAreas={roiAreas}
        offPlanProjects={offPlanProjects}
        undervaluedCommunities={undervaluedCommunities}
      />
      <Developers developers={developers} />
      <MarketReports />
      <HowItWorks />
      <Pricing />
      <AIAdvisorCTA />
    </div>
  );
}