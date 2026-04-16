import HeroBackground from "../components/hero/HeroBackground";
import HeroLeft from "../components/hero/HeroLeft";
import InsightCarousel from "../components/hero/InsightCarousel";
import { getInsightCards } from "./hero/getInsightCards/getInsightCards";

export default async function Hero() {
  const cards = await getInsightCards();

  return (
    <section className="relative min-h-screen flex items-center pt-10 bg-[#030a16] text-white overflow-hidden">
      <HeroBackground />

      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center relative z-10 py-20">
        <HeroLeft />

        <InsightCarousel cards={cards} />
      </div>
    </section>
  );
}