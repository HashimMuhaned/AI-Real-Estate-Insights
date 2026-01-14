"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const VillaAppartementPriceTrend = ({
  selectedArea,
}: {
  selectedArea: string;
}) => {
  const [priceStartRange, setPriceStartRange] = useState("2y"); // default 2 years
  const [chartMode, setChartMode] = useState<"price" | "change">("price"); // toggle mode
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:8080/api/get-villa-apartment-price-change-per-sqft",
          {
            params: { araeName: selectedArea, dateRange: priceStartRange },
          }
        );

        // Transform into chart-friendly format
        const grouped: Record<string, any> = {};
        res.data.forEach((row: any) => {
          if (!grouped[row.year_quarter]) {
            grouped[row.year_quarter] = { quarter: row.year_quarter };
          }
          grouped[row.year_quarter][row.property_category] =
            chartMode === "price"
              ? Number(row.avg_price_sqft) // <-- correct column
              : Number(row.price_change_pct);
        });

        setData(Object.values(grouped));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [priceStartRange, chartMode]);

  return (
    <div className="mb-9">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-xl font-semibold">
                Villa vs Apartment{" "}
                {chartMode === "price" ? "Price/sqft" : "Quarterly % Change"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {chartMode === "price"
                  ? `Average price per sqft over time (${priceStartRange} range, quarterly)`
                  : `Quarterly % change in average price (${priceStartRange} range)`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Range Selector */}
              <Select
                value={priceStartRange}
                onValueChange={setPriceStartRange}
              >
                <SelectTrigger className="h-8 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1y">Last 1Y</SelectItem>
                  <SelectItem value="2y">Last 2Y</SelectItem>
                  <SelectItem value="3y">Last 3Y</SelectItem>
                  <SelectItem value="4y">Last 4Y</SelectItem>
                  <SelectItem value="5y">Last 5Y</SelectItem>
                </SelectContent>
              </Select>

              {/* Mode Toggle */}
              <Button
                size="sm"
                variant={chartMode === "price" ? "default" : "outline"}
                onClick={() => setChartMode("price")}
              >
                AED/sqft
              </Button>
              <Button
                size="sm"
                variant={chartMode === "change" ? "default" : "outline"}
                onClick={() => setChartMode("change")}
              >
                % Change
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading data...</p>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
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
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    stroke="hsl(var(--foreground))"
                    fontSize={12}
                    label={{
                      value:
                        chartMode === "price"
                          ? "Price per Sqft (AED)"
                          : "% Change QoQ",
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
                    formatter={(value: number) =>
                      chartMode === "price"
                        ? [`${value} AED/sqft`, ""]
                        : [`${value}%`, ""]
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Apartment"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    name="Apartments"
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Villa"
                    stroke="hsl(var(--accent))"
                    strokeWidth={3}
                    name="Villas"
                    dot={{ fill: "hsl(var(--accent))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VillaAppartementPriceTrend;
