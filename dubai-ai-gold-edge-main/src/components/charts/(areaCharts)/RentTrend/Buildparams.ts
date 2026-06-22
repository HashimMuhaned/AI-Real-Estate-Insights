type RentFilters = {
  areaId: string;
  category: string; // "apartment" | "villa" | "both"
  rooms: number;
  range: string;
};

/**
 * Builds URLSearchParams for the rent trend API.
 *
 * @param filters   - Current filter state
 * @param excludeRange - Pass `true` if this endpoint does not use `range`
 */
export function buildParams(filters: RentFilters, excludeRange = false): URLSearchParams {
  const params = new URLSearchParams({ areaId: filters.areaId });

  if (filters.category !== "both") {
    params.set("category", filters.category);
  }

  params.set("rooms", String(filters.rooms));

  if (!excludeRange) {
    params.set("range", filters.range);
  }

  return params;
}