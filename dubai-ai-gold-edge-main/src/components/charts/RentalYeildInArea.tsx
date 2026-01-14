"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RentalYieldItem = {
  area_name_en: string;
  property_category: "Apartment" | "Villa";
  room_num: number;
  year: number;
  month?: number;
  quarter?: number;
  avg_sale_price: number;
  avg_annual_rent: number;
  rental_yield_percent: number;
};

const ROOM_OPTIONS = ["Studio", "1BR", "2BR", "3BR", "4BR", "5BR"];
const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const GRANULARITY_OPTIONS = ["yearly", "quarterly", "monthly"] as const;

const RentalYieldInArea = ({ areaName }: { areaName: string }) => {
  const [data, setData] = useState<RentalYieldItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartView, setChartView] = useState<"bars" | "lines" | "both">("both");
  const [selectedType, setSelectedType] = useState<
    "both" | "Apartment" | "Villa"
  >("both");

  const [filters, setFilters] = useState({
    room: "1BR",
    year: new Date().getFullYear(),
    granularity: "yearly" as (typeof GRANULARITY_OPTIONS)[number],
  });

  // 🧠 Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        area: areaName,
        year: filters.year.toString(),
        room_num: filters.room,
        property_type: selectedType,
        granularity: filters.granularity,
      });
      const res = await fetch(
        `http://localhost:8080/api/get-rental-yield?${params.toString()}`
      );
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("❌ Error fetching rental yield:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, selectedType]);

  // 🧩 Transform Data for Chart
  const chartData = data?.map((d) => {
    let label = d.year.toString();
    if (filters.granularity === "quarterly" && d.quarter)
      label = `Q${d.quarter} ${d.year}`;
    if (filters.granularity === "monthly" && d.month)
      label = `${new Date(d.year, d.month - 1).toLocaleString("default", {
        month: "short",
      })} ${d.year}`;
    return {
      label,
      Apartment:
        d.property_category === "Apartment" ? d.rental_yield_percent : null,
      Villa: d.property_category === "Villa" ? d.rental_yield_percent : null,
    };
  });

  // 🧹 Merge duplicates (same label)
  const mergedData = Object.values(
    chartData.reduce((acc: any, cur) => {
      if (!acc[cur.label]) acc[cur.label] = { label: cur.label };
      if (cur.Apartment !== null) acc[cur.label].Apartment = cur.Apartment;
      if (cur.Villa !== null) acc[cur.label].Villa = cur.Villa;
      return acc;
    }, {})
  );

  return (
    <div className="bg-background mb-6">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-semibold">
                Rental Yield Trend — {areaName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Compare yields by time, property type, and room configuration
              </p>
            </div>

            {/* 🔹 Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Year Filter */}
              <Select
                value={filters.year.toString()}
                onValueChange={(v) =>
                  setFilters((f) => ({ ...f, year: parseInt(v) }))
                }
              >
                <SelectTrigger className="w-[90px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Room Filter */}
              <Select
                value={filters.room}
                onValueChange={(v) => setFilters((f) => ({ ...f, room: v }))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Room" />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 🆕 Granularity */}
              <Select
                value={filters.granularity}
                onValueChange={(v) =>
                  setFilters((f) => ({
                    ...f,
                    granularity: v as (typeof GRANULARITY_OPTIONS)[number],
                  }))
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Granularity" />
                </SelectTrigger>
                <SelectContent>
                  {GRANULARITY_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g[0].toUpperCase() + g.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Property Type Buttons */}
              <div className="flex gap-1">
                {["Apartment", "Villa", "both"].map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type as any)}
                    className="h-7 px-2 text-xs"
                  >
                    {type}
                  </Button>
                ))}
              </div>

              {/* Chart View */}
              <div className="flex gap-1">
                {["bars", "lines", "both"].map((type) => (
                  <Button
                    key={type}
                    variant={chartView === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartView(type as any)}
                    className="h-7 px-2 text-xs"
                  >
                    {type[0].toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-sm text-muted-foreground">
              Loading data...
            </p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={mergedData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="label"
                    stroke="hsl(var(--foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--foreground))"
                    fontSize={12}
                    label={{
                      value: "Rental Yield (%)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}%`, ""]}
                  />
                  <Legend />

                  {(chartView === "bars" || chartView === "both") && (
                    <>
                      {(selectedType === "Apartment" ||
                        selectedType === "both") && (
                        <Bar
                          dataKey="Apartment"
                          fill="hsl(var(--primary))"
                          name="Apartments"
                          fillOpacity={0.7}
                        />
                      )}
                      {(selectedType === "Villa" ||
                        selectedType === "both") && (
                        <Bar
                          dataKey="Villa"
                          fill="hsl(var(--accent))"
                          name="Villas"
                          fillOpacity={0.7}
                        />
                      )}
                    </>
                  )}

                  {(chartView === "lines" || chartView === "both") && (
                    <>
                      {(selectedType === "Apartment" ||
                        selectedType === "both") && (
                        <Line
                          type="monotone"
                          dataKey="Apartment"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          name="Apartments Trend"
                          dot={{ fill: "hsl(var(--primary))", r: 4 }}
                        />
                      )}
                      {(selectedType === "Villa" ||
                        selectedType === "both") && (
                        <Line
                          type="monotone"
                          dataKey="Villa"
                          stroke="hsl(var(--accent))"
                          strokeWidth={3}
                          name="Villas Trend"
                          dot={{ fill: "hsl(var(--accent))", r: 4 }}
                        />
                      )}
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RentalYieldInArea;
