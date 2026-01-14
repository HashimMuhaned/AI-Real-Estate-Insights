export function summarizeRentToPriceRatio(rows: any[]) {
  if (!rows || rows.length === 0) return null;

  const parseNumber = (n: any): number | null =>
    n == null || isNaN(parseFloat(n)) ? null : parseFloat(n);

  const sorted = [...rows].sort(
    (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  const groups: any[] = [];
  const groupedMap: Record<string, any[]> = {};

  // Group by property_type + bedroom_label
  for (const r of sorted) {
    const key = `${r.property_type}_${r.bedroom_label}`;
    if (!groupedMap[key]) groupedMap[key] = [];
    groupedMap[key].push(r);
  }

  for (const key in groupedMap) {
    const sub = groupedMap[key];
    if (!sub.length) continue;

    const first = parseNumber(sub[0].price_to_rent_ratio);
    const last = parseNumber(sub[sub.length - 1].price_to_rent_ratio);

    const values = sub.map((s) => parseNumber(s.price_to_rent_ratio));
    const numericValues = values.filter(
      (v): v is number => v !== null && !isNaN(v)
    );

    const avg =
      numericValues.length > 0
        ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length
        : null;

    const [property_type, bedroom_label] = key.split("_");

    let changePct: number | null = null;
    if (first != null && last != null) {
      changePct = ((last - first) / first) * 100;
    }

    let trend: "up" | "down" | "flat" | null = null;
    if (first != null && last != null) {
      trend = last > first ? "up" : last < first ? "down" : "flat";
    }

    groups.push({
      property_type,
      bedroom_label,
      avg_ratio: avg != null ? +avg.toFixed(2) : null,
      min_ratio: numericValues.length
        ? Math.min(...numericValues).toFixed(2)
        : null,
      max_ratio: numericValues.length
        ? Math.max(...numericValues).toFixed(2)
        : null,
      change_pct: changePct != null ? +changePct.toFixed(2) : null,
      trend,
    });
  }

  const period = `${sorted[0].month_label} → ${
    sorted[sorted.length - 1].month_label
  }`;

  return {
    period,
    group_count: groups.length,
    groups,
  };
}
