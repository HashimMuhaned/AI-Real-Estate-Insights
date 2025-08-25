import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import MarketTools from "@/components/MarketTools";
import MarketReports from "@/components/MarketReports";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const page = () => {
  return (
    <div className="min-h-screen">
      {/* <Navbar /> */}
      <Hero />
      <Features />
      <MarketTools />
      <MarketReports />
      <HowItWorks />
      <Pricing />
      <Footer />
    </div>
  );
};

export default page;
