import InfiniteList from "@/components/explore-area-cards/InfiniteList";
import AreaCardWithProjectsNum from "@/components/explore-area-cards/(explore-area-invest-mode)/(num-of-projects)/AreaCardWithProjectsNum";
import { Area } from "@/types/area";

export default function AreasList({
  filter,
  search,
}: {
  filter: string;
  search: string;
}) {
  return (
    <InfiniteList<Area> endpoint="http://localhost:8000/api/areas" search={search}>
      {(allData, lastRef) => {
        const sortedData = [...allData].sort((a, b) => {
          switch (filter) {
            case "villa_sale_high":
              return b.villa_current_sale_price - a.villa_current_sale_price;
            case "villa_sale_low":
              return a.villa_current_sale_price - b.villa_current_sale_price;
            case "apt_rent_high":
              return b.apt_current_rent_price - a.apt_current_rent_price;
            case "apt_rent_low":
              return a.apt_current_rent_price - b.apt_current_rent_price;
            default:
              return 0;
          }
        });

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedData.map((area, i) => (
              <AreaCardWithProjectsNum
                key={area.area_id}
                area={area}
                isLast={i === sortedData.length - 1}
                lastAreaRef={lastRef}
                sortOption={filter}
              />
            ))}
          </div>
        );
      }}
    </InfiniteList>
  );
}
