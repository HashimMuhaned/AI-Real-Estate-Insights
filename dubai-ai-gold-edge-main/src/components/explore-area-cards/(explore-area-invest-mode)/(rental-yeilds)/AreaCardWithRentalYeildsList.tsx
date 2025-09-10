import InfiniteList from "@/components/explore-area-cards/InfiniteList";
import AreaCardWithRentalYeilds from "@/components/explore-area-cards/(explore-area-invest-mode)/(rental-yeilds)/AreaCardWithRentalYeilds";
import { RentalYield } from "@/types/area";

export default function RentalYeildsAreasList({
  filter,
  search,
}: {
  filter: string;
  search: string;
}) {
  return (
    <InfiniteList<RentalYield> endpoint="http://localhost:8080/api/areas-rental-yield" search={search}>
      {(allData, lastRef) => {
        const uniqueData = Array.from(
          new Map(allData.map((item) => [item.area_id, item])).values()
        );

        const val = (n?: number | null) => n ?? Number.NEGATIVE_INFINITY;

        const avg = (a?: number | null, b?: number | null) => {
          const arr = [a, b].filter((x): x is number => typeof x === "number");
          return arr.length
            ? arr.reduce((s, x) => s + x, 0) / arr.length
            : Number.NEGATIVE_INFINITY;
        };

        const sortedData = [...uniqueData].sort((a, b) => {
          switch (filter) {
            // overall yield (average of villa + apt, ignoring missing)
            case "yield_high":
              return (
                avg(b.villa_yield_current_year, b.apt_yield_current_year) -
                avg(a.villa_yield_current_year, a.apt_yield_current_year)
              );
            case "yield_low":
              return (
                avg(a.villa_yield_current_year, a.apt_yield_current_year) -
                avg(b.villa_yield_current_year, b.apt_yield_current_year)
              );

            // villa-only
            case "villa_yield_high":
              return (
                val(b.villa_yield_current_year) -
                val(a.villa_yield_current_year)
              );
            case "villa_yield_low":
              return (
                val(a.villa_yield_current_year) -
                val(b.villa_yield_current_year)
              );

            // apartment-only
            case "apt_yield_high":
              return (
                val(b.apt_yield_current_year) - val(a.apt_yield_current_year)
              );
            case "apt_yield_low":
              return (
                val(a.apt_yield_current_year) - val(b.apt_yield_current_year)
              );

            default:
              return 0;
          }
        });

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedData.map((area, i) => (
              <AreaCardWithRentalYeilds
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
