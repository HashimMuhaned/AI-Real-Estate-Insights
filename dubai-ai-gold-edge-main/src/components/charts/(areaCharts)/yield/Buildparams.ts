import type { CategoryFilter, RoomsFilter } from "./YieldHorizontalRank";

interface YieldFilters {
  areaId: number;
  category: CategoryFilter;
  rooms: RoomsFilter;
}

/**
 * Builds the query-string URL for the yield endpoint.
 *
 * `excludeRange` exists as a forward-compatible escape hatch; this chart
 * has no range param, so it defaults to true and the branch is a no-op.
 */
export function buildParams(
  { areaId, category, rooms }: YieldFilters,
  excludeRange = true,
): string {
  const params = new URLSearchParams({ areaId: String(areaId) });

  if (category !== "all") params.set("category", category);
  if (rooms !== "all") params.set("rooms", String(rooms));
  if (!excludeRange) {
    // placeholder: attach range params here for charts that need them
  }

  return `/api/areaCharts/yield?${params.toString()}`;
}