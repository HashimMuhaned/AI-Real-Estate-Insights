export interface RentToPriceParams {
  area: string;
  viewType: "monthly" | "quarterly" | "yearly";
  dateRange: "6m" | "1y" | "2y" | "3y" | "4y" | "5y";
  propertyType: string;
  bedrooms: string;
}
