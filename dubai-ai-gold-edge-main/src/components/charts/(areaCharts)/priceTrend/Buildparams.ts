/**
 * Builds URLSearchParams for the price trend API.
 *
 * @param filters      - The active filter values.
 * @param excludeRange - Set `true` for charts that don't use the `range` param.
 */
export function buildParams(
  filters: { areaId: string | null; category: string; range?: string },
  excludeRange = false,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.areaId) params.set("areaId", filters.areaId);
  params.set("category", filters.category);
  if (!excludeRange && filters.range) params.set("range", filters.range);

  return params;
}
