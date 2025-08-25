// === COMPONENT ===
import InfiniteList from "@/components/explore-area-cards/InfiniteList";
import AreaCardWithTransactions from "@/components/explore-area-cards/(explore-area-invest-mode)/(transactions)/AreaCardWithTransactions";
import { TransactionsTotalValue } from "@/types/area";

export default function TransactionsAreasList({
  filter,
  search,
}: {
  filter: string;
  search: string;
}) {
  return (
    <InfiniteList<TransactionsTotalValue>
      endpoint="http://localhost:8000/api/areas-transactions-total-value"
      search={search}
    >
      {(allData, lastRef) => {
        const uniqueData = Array.from(
          new Map(allData.map((item) => [item.area_id, item])).values()
        );

        const sortedData = [...uniqueData].sort((a, b) => {
          switch (filter) {
            case "transactions_high":
              return (
                b.villa_tx_last_year +
                b.apt_tx_last_year -
                (a.villa_tx_last_year + a.apt_tx_last_year)
              );
            case "transactions_low":
              return (
                a.villa_tx_last_year +
                a.apt_tx_last_year -
                (b.villa_tx_last_year + b.apt_tx_last_year)
              );

            // 🏠 Villa only
            case "villa_transactions_high":
              return b.villa_tx_last_year - a.villa_tx_last_year;
            case "villa_transactions_low":
              return a.villa_tx_last_year - b.villa_tx_last_year;

            // 🏢 Apartment only
            case "apt_transactions_high":
              return b.apt_tx_last_year - a.apt_tx_last_year;
            case "apt_transactions_low":
              return a.apt_tx_last_year - b.apt_tx_last_year;

            default:
              return 0;
          }
        });

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedData.map((area, i) => (
              <AreaCardWithTransactions
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
