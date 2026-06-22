// lib/chartParams.ts
interface ChartFilters {
  areaId: string;
  category?: string;
  rooms?: number | "";
  range?: string;
}

export function buildParams(
  filters: ChartFilters,
  excludeRange = false
): URLSearchParams {
  const params = new URLSearchParams({ areaId: filters.areaId });

  if (filters.category) params.set("category", filters.category.toLowerCase());
  if (filters.rooms !== "" && filters.rooms != null)
    params.set("rooms", String(filters.rooms));
  if (!excludeRange && filters.range) params.set("range", filters.range);

  return params;
}