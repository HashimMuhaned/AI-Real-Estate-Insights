import InfiniteList from "@/components/explore-area-cards/InfiniteList";
import AreaCardWithROIGrowth from "@/components/explore-area-cards/(explore-area-invest-mode)/(roi-growth)/AreaCardWithROIGrowth";
import { PriceGrowthVacancyRisk } from "@/types/area";

export default function ROIGrowthAreasList({
  filter,
  search,
}: {
  filter: string;
  search: string;
}) {
  return (
    <InfiniteList<PriceGrowthVacancyRisk>
      endpoint="http://localhost:8000/api/areas-price-growth-vacancy-risk"
      search={search}
    >
      {(allData, lastRef) => {
        const uniqueData = Array.from(
          new Map(allData.map((item) => [item.area_id, item])).values()
        );
        const sortedData = [...uniqueData].sort((a, b) => {
          switch (filter) {
            case "villa_growth_high":
              return b.villa_price_growth_pct - a.villa_price_growth_pct;
            case "villa_growth_low":
              return a.villa_price_growth_pct - b.villa_price_growth_pct;
            case "apt_growth_high":
              return b.apt_price_growth_pct - a.apt_price_growth_pct;
            case "apt_growth_low":
              return a.apt_price_growth_pct - b.apt_price_growth_pct;
            case "villa_vacancy_high":
              return b.villa_vacancy_risk - a.villa_vacancy_risk;
            case "villa_vacancy_low":
              return a.villa_vacancy_risk - b.villa_vacancy_risk;
            case "apt_vacancy_high":
              return b.apt_vacancy_risk - a.apt_vacancy_risk;
            case "apt_vacancy_low":
              return a.apt_vacancy_risk - b.apt_vacancy_risk;
            default:
              return 0;
          }
        });

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedData.map((area, i) => (
              <AreaCardWithROIGrowth
                key={area.area_id}
                area={area}
                isLast={i === sortedData.length - 1}
                lastRef={lastRef}
                sortOption={filter}
              />
            ))}
          </div>
        );
      }}
    </InfiniteList>
  );
}
