import { getInsightCards } from "@/components/hero/getInsightCards/getInsightCards";
import InsightCarousel from "./InsightCarousel";

export default async function Page() {
  const cards = await getInsightCards();

  return <InsightCarousel cards={cards} />;
}