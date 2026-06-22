/** Filters passed to buildParams */
export interface GrowthChartFilters {
  areaId: number | null;
  category: string;
  rooms: number | null;
  range: string;
}

/**
 * Builds a URLSearchParams string for the growth-comparison endpoint.
 *
 * @param filters     - Current filter state
 * @param excludeRange - Pass `true` for chart variants that don't use the
 *                       `range` param, so it's omitted cleanly.
 */
export function buildParams(
  filters: GrowthChartFilters,
  excludeRange = false,
): string {
  const params = new URLSearchParams();

  if (filters.areaId !== null) {
    params.set("areaId", String(filters.areaId));
  }

  params.set("category", filters.category);

  if (filters.rooms !== null) {
    params.set("rooms", String(filters.rooms));
  }

  if (!excludeRange) {
    params.set("range", filters.range);
  }

  return params.toString();
}