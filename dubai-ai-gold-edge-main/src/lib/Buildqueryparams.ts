const LIMIT = 12;

export type FilterState = {
  query: string;
  sortBy: string;
  priceRange: string;
  propertyType: string;
  deliveryStatus: string;
  selectedDeveloper: string;
  hotnessLevel: string;
};

export function buildQueryParams(
  filters: FilterState,
  offset: number,
  limit: number = LIMIT
): URLSearchParams {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (filters.query) params.set("q", filters.query);
  if (filters.sortBy !== "recent") params.set("sort", filters.sortBy);
  if (filters.propertyType !== "all") params.set("propertyType", filters.propertyType);
  if (filters.deliveryStatus !== "all") params.set("delivery", filters.deliveryStatus);
  if (filters.selectedDeveloper !== "all") params.set("developer", filters.selectedDeveloper);
  if (filters.hotnessLevel !== "all") params.set("hotnessMin", filters.hotnessLevel);

  if (filters.priceRange === "under1m") {
    params.set("priceMax", "999999");
  } else if (filters.priceRange === "1m-2m") {
    params.set("priceMin", "1000000");
    params.set("priceMax", "1999999");
  } else if (filters.priceRange === "2m-3m") {
    params.set("priceMin", "2000000");
    params.set("priceMax", "2999999");
  } else if (filters.priceRange === "over3m") {
    params.set("priceMin", "3000000");
  }

  return params;
}

export { LIMIT };