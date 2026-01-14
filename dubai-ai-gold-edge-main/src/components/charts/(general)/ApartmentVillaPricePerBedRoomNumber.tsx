"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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

// Example color palettes for different room numbers
const apartmentColors = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78"];
const villaColors = ["#2ca02c", "#98df8a", "#d62728", "#ff9896"];

const VillaApartmentPricePerRoom = ({ areaName }: { areaName: string }) => {
  const [dateRange, setDateRange] = useState("2y");
  const [viewType, setViewType] = useState<"Apartment" | "Villa" | "both">(
    "both"
  );
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:8080/api/get-villa-apartment-price-each-bed-room-number",
          {
            params: { areaName, dateRange },
          }
        );

        // Transform data into chart-friendly format: each row = quarter
        const grouped: Record<string, any> = {};
        res.data.forEach((row: any) => {
          if (!grouped[row.year_quarter])
            grouped[row.year_quarter] = { quarter: row.year_quarter };
          const key = `${row.property_category}-${row.room_num}BR`;
          grouped[row.year_quarter][key] = Number(row.avg_price);
        });

        setData(Object.values(grouped));
      } catch (err) {
        console.error("Error fetching price per room data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [areaName, dateRange]);

  // Generate list of apartment and villa room keys dynamically for legend & chart
  const roomKeys = Array.from(
    new Set(
      data.flatMap((row) => Object.keys(row).filter((k) => k !== "quarter"))
    )
  );

  return (
    <div className="bg-background mb-9">
      <Card className="">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-xl font-semibold">
                Average Price per Bedroom Number
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Showing average price per sqft per quarter since 2020
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Date range filter */}
              <div className="flex gap-1">
                {["1y", "2y", "3y", "4y", "5y"].map((range) => (
                  <Button
                    key={range}
                    size="sm"
                    variant={dateRange === range ? "default" : "outline"}
                    onClick={() => setDateRange(range)}
                  >
                    {range.toUpperCase()}
                  </Button>
                ))}
              </div>

              {/* Property type filter */}
              <div className="flex gap-1">
                {["Apartment", "Villa", "both"].map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={viewType === type ? "default" : "outline"}
                    onClick={() => setViewType(type as any)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading data...</p>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="quarter"
                    stroke="hsl(var(--foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--foreground))"
                    fontSize={12}
                    label={{
                      value: "Price per Sqft (AED)",
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
                    formatter={(value: number) => [`${value} AED/sqft`, ""]}
                  />
                  <Legend />

                  {/* Apartments as bars */}
                  {viewType === "Apartment" || viewType === "both"
                    ? roomKeys
                        .filter((k) => k.startsWith("Apartment"))
                        .map((key, idx) => (
                          <Bar
                            key={key}
                            dataKey={key}
                            fill={apartmentColors[idx % apartmentColors.length]}
                            name={key}
                          />
                        ))
                    : null}

                  {/* Villas as lines */}
                  {viewType === "Villa" || viewType === "both"
                    ? roomKeys
                        .filter((k) => k.startsWith("Villa"))
                        .map((key, idx) => (
                          <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={villaColors[idx % villaColors.length]}
                            strokeWidth={3}
                            dot={{ r: 3 }}
                            name={key}
                          />
                        ))
                    : null}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VillaApartmentPricePerRoom;
