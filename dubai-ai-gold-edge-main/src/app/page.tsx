import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import MarketTools from "@/components/MarketTools";
import MarketReports from "@/components/MarketReports";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import DubaiInvestmentOpportunity from "@/components/DubaiInvestmentOpportunity";
import Developers from "@/components/ListingBestDevelopers";
import AIAdvisorCTA from "@/components/AIAdvisorCTA";

const page = () => {
  return (
    <div className="min-h-screen">
      {/* <Navbar /> */}
      <Hero />
      <Features />
      <MarketTools />
      <DubaiInvestmentOpportunity />
      <Developers />
      <MarketReports />
      <HowItWorks />
      <Pricing />
      <AIAdvisorCTA />
    </div>
  );
};

export default page;
