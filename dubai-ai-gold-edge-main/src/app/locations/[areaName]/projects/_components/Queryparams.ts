export type FilterState = {
  query: string;
  sortBy: string;
  priceRange: string;
  propertyType: string;
  deliveryStatus: string;
  selectedDeveloper: string;
  hotnessLevel: string;
};

export const DEFAULT_FILTERS: FilterState = {
  query: "",
  sortBy: "recent",
  priceRange: "all",
  propertyType: "all",
  deliveryStatus: "all",
  selectedDeveloper: "all",
  hotnessLevel: "all",
};

export const LIMIT = 12;

export function buildQueryParams(
  filters: FilterState,
  offset: number,
  community: string
): URLSearchParams {
  const params = new URLSearchParams({
    limit: LIMIT.toString(),
    offset: offset.toString(),
    community,
  });

  if (filters.query) params.set("q", filters.query);
  if (filters.sortBy !== "recent") params.set("sort", filters.sortBy);
  if (filters.propertyType !== "all") params.set("propertyType", filters.propertyType);
  if (filters.deliveryStatus !== "all") params.set("delivery", filters.deliveryStatus);
  if (filters.selectedDeveloper !== "all") params.set("developer", filters.selectedDeveloper);
  if (filters.hotnessLevel !== "all") params.set("hotnessMin", filters.hotnessLevel);

  const priceMap: Record<string, { min?: string; max?: string }> = {
    under1m: { max: "999999" },
    "1m-2m": { min: "1000000", max: "1999999" },
    "2m-3m": { min: "2000000", max: "2999999" },
    over3m: { min: "3000000" },
  };

  const priceConfig = priceMap[filters.priceRange];
  if (priceConfig) {
    if (priceConfig.min) params.set("priceMin", priceConfig.min);
    if (priceConfig.max) params.set("priceMax", priceConfig.max);
  }

  return params;
}