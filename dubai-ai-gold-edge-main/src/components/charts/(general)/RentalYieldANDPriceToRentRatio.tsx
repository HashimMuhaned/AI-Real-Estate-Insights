"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  Bot,
  BarChart3,
  Calendar,
  Lightbulb,
  Info,
  Filter,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import dynamic from "next/dynamic";

import { useModal } from "@/context/PremiumModalContext";

interface YieldData {
  month_label: string;
  property_type: string;
  num_bedrooms: number | null;
  bedroom_label?: string;
  price_to_rent_ratio: number;
  insight: string;
}

interface ChartMonthData {
  month: string;
  shortMonth: string;
  year: string;
  data: YieldData[];
  [key: string]: any;
}

interface AggregatedData {
  month: string;
  shortMonth: string;
  data: YieldData[];
  counts: Record<string, number>;
  [key: string]: any;
}

interface Props {
  selectedArea: string;
}

const RentalYieldChart = ({ selectedArea }: Props) => {
  const [data, setData] = useState<YieldData[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [bedrooms, setBedrooms] = useState("all");
  const [dateRange, setDateRange] = useState("1y");
  const [viewType, setViewType] = useState("monthly");
  const [showDubaiAverage, setShowDubaiAverage] = useState(true);
  const [chartDataSummary, setChartDataSummary] = useState([])
  const { openModal } = useModal();

  const apartmentColors = {
    "1BR Apt": "#10b981",
    "2BR Apt": "#3b82f6",
    "3BR Apt": "#8b5cf6",
    "4BR Apt": "#f59e0b",
    "5BR Apt": "#ef4444",
  };

  const villaColors = {
    "Villa 1BR": "#dc2626",
    "Villa 2BR": "#ea580c",
    "Villa 3BR": "#ca8a04",
    "Villa 4BR": "#16a34a",
    "Villa 5BR": "#9333ea",
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8080/api/get-rent-to-price-ratio",
          {
            params: {
              areaName: selectedArea,
              dateRange,
              propertyType,
              bedrooms,
              detail_level: "short",
            },
            signal: controller.signal,
          }
        );
        console.log(response)
        const chartData = response?.data?.chartData || [];
        const insight = response?.data?.aiInsight || "";
        const dataSummary = response?.data?.summary.groups || []


        const normalized = chartData.map((item: any) => ({
          month_label: item.month_label,
          property_type: item.property_type,
          num_bedrooms: item.num_bedrooms,
          bedroom_label: item.bedroom_label ?? "Unknown",
          price_to_rent_ratio: parseFloat(item.price_to_rent_ratio),
          insight: insight,
        }));

        setData(normalized);
        setAiInsight(insight);
        setChartDataSummary(dataSummary)
        console.log(dataSummary)
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [selectedArea, dateRange, propertyType, bedrooms]);

  const chartData = React.useMemo(() => {
    if (!data.length) return [];

    const grouped: Record<string, ChartMonthData> = {};
    data.forEach((item) => {
      const month = item.month_label;
      if (!grouped[month]) {
        const [year, monthNum] = month.split("-");
        grouped[month] = {
          month,
          shortMonth: monthNum,
          year,
          data: [],
        };
      }

      const key =
        item.property_type === "apartment"
          ? `${item.num_bedrooms}BR Apt`
          : `Villa ${item.num_bedrooms}BR`;

      grouped[month][key] = parseFloat(item.price_to_rent_ratio as any);
      grouped[month].data.push(item);
    });

    let chartData: any[] = Object.values(grouped);

    if (viewType === "quarterly") {
      const quarterlyData: Record<string, AggregatedData> = {};
      chartData.forEach((monthData) => {
        const month = monthData.shortMonth;
        const year = monthData.year;
        const quarter = Math.ceil(
          (new Date(Date.parse(`${month} 1, ${year}`)).getMonth() + 1) / 3
        );
        const quarterKey = `Q${quarter} ${year}`;

        if (!quarterlyData[quarterKey]) {
          quarterlyData[quarterKey] = {
            month: quarterKey,
            shortMonth: `Q${quarter}`,
            data: [],
            counts: {},
          };
        }

        Object.keys(monthData).forEach((key) => {
          if (
            !["month", "shortMonth", "year", "data"].includes(key) &&
            monthData[key] != null
          ) {
            if (!quarterlyData[quarterKey][key]) {
              quarterlyData[quarterKey][key] = 0;
              quarterlyData[quarterKey].counts[key] = 0;
            }
            quarterlyData[quarterKey][key] += monthData[key];
            quarterlyData[quarterKey].counts[key]++;
          }
        });
      });

      chartData = Object.values(quarterlyData).map((quarter) => {
        const result: Record<string, any> = {
          month: quarter.month,
          shortMonth: quarter.shortMonth,
        };
        Object.keys(quarter.counts).forEach((key) => {
          result[key] = quarter[key] / quarter.counts[key];
        });
        return result;
      });
    } else if (viewType === "yearly") {
      const yearlyData: Record<string, AggregatedData> = {};
      chartData.forEach((monthData) => {
        const year = monthData.year;

        if (!yearlyData[year]) {
          yearlyData[year] = {
            month: year,
            shortMonth: year,
            data: [],
            counts: {},
          };
        }

        Object.keys(monthData).forEach((key) => {
          if (
            !["month", "shortMonth", "year", "data"].includes(key) &&
            monthData[key] != null
          ) {
            if (!yearlyData[year][key]) {
              yearlyData[year][key] = 0;
              yearlyData[year].counts[key] = 0;
            }
            yearlyData[year][key] += monthData[key];
            yearlyData[year].counts[key]++;
          }
        });
      });

      chartData = Object.values(yearlyData).map((year) => {
        const result: Record<string, any> = {
          month: year.month,
          shortMonth: year.shortMonth,
        };
        Object.keys(year.counts).forEach((key) => {
          result[key] = year[key] / year.counts[key];
        });
        return result;
      });
    }

    return chartData.map((item) => {
      const filtered: Record<string, any> = {
        month: item.month,
        shortMonth: item.shortMonth,
      };

      Object.keys(item).forEach((key) => {
        if (key === "month" || key === "shortMonth") return;

        const isApartment = key.includes("Apt");
        const isVilla = key.includes("Villa");

        if (propertyType === "apartment" && !isApartment) return;
        if (propertyType === "villa" && !isVilla) return;

        if (bedrooms !== "all") {
          const bedroomMatch = key.match(/(\d+)BR/);
          if (!bedroomMatch || bedroomMatch[1] !== bedrooms) return;
        }

        filtered[key] = item[key];
      });

      return filtered;
    });
  }, [data, viewType, propertyType, bedrooms]);

  const availableBedrooms = React.useMemo(() => {
    const bedrooms = [...new Set(data.map((item) => item.num_bedrooms))];
    return bedrooms.filter((b) => b != null).sort((a, b) => a - b);
  }, [data]);

  const analytics = React.useMemo(() => {
    if (chartData.length < 2) return { changes: {}, averages: {} };

    const current = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];
    const changes = {};
    const averages = {};

    Object.keys(current).forEach((key) => {
      if (key === "month" || key === "shortMonth") return;

      const values = chartData.map((d) => d[key]).filter((v) => v != null);
      if (values.length > 0) {
        averages[key] = values.reduce((a, b) => a + b, 0) / values.length;

        if (current[key] != null && previous[key] != null) {
          changes[key] = ((current[key] - previous[key]) / previous[key]) * 100;
        }
      }
    });

    return { changes, averages };
  }, [chartData]);

  const chartKeys = React.useMemo(() => {
    if (!chartData.length) return { bars: [], lines: [] };

    const keys = Object.keys(chartData[0]).filter(
      (k) => k !== "month" && k !== "shortMonth"
    );
    return {
      bars: keys.filter((k) => k.includes("Apt")),
      lines: keys.filter((k) => k.includes("Villa")),
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-gray-900 text-white border rounded-lg shadow-lg p-3">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">{entry.name}:</span>
            <span>{entry.value?.toFixed(2)}%</span>
            {analytics.changes[entry.dataKey] && (
              <span
                className={
                  analytics.changes[entry.dataKey] >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                ({analytics.changes[entry.dataKey] >= 0 ? "+" : ""}
                {analytics.changes[entry.dataKey].toFixed(1)}%)
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="w-full">
      <div className="space-y-6">
        {/* Chart with AI Insights */}
        <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
          {/* Filters Header */}
          <div className="p-6 border-b bg-gray-50/50">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Rental Yield Chart
              </h3>
            </div>

            <div className="flex gap-3 items-center flex-wrap">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 uppercase">
                  View Type
                </label>
                <Select value={viewType} onValueChange={setViewType}>
                  <SelectTrigger className="h-9 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 uppercase">
                  Date Range
                </label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="h-9 w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6m">6M</SelectItem>
                    <SelectItem value="1y">1Y</SelectItem>
                    <SelectItem value="2y">2Y</SelectItem>
                    <SelectItem value="3y">3Y</SelectItem>
                    <SelectItem value="5y">5Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 uppercase">
                  Property Type
                </label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="h-9 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="apartment">Apartments</SelectItem>
                    <SelectItem value="villa">Villas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 uppercase">
                  Bedrooms
                </label>
                <Select value={bedrooms} onValueChange={setBedrooms}>
                  <SelectTrigger className="h-9 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bedrooms</SelectItem>
                    {availableBedrooms.map((b) => (
                      <SelectItem key={b} value={String(b)}>
                        {b} BR
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Switch
                  checked={showDubaiAverage}
                  onCheckedChange={setShowDubaiAverage}
                />
                <span className="text-xs font-medium">Dubai Avg</span>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* AI Insights Section */}
            <div className="bg-primary/5 rounded-lg border border-primary/10 p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-primary mb-2">
                    AI Insights
                  </h4>
                  {loading ? (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating insights...
                    </div>
                  ) : aiInsight ? (
                    <p className="text-sm text-primary leading-relaxed">
                      {aiInsight}
                    </p>
                  ) : (
                    <p className="text-sm text-primary -600 italic">
                      No insights available yet.
                    </p>
                  )}
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() =>
                      openModal({
                        chartType: "Rental Yield Chart",
                        areaName: selectedArea,
                        summary: chartDataSummary
                      })
                    }
                    className="h-auto p-0 text-xs text-primary hover:text-primary/80 mt-6"
                  >
                    View More Insights →
                  </Button>
                  {/* <PremiumModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    chartType={"Rental Yield Chart"}
                    areaName={selectedArea}
                  /> */}
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="h-[500px]">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 font-medium">
                      Loading yield data...
                    </p>
                  </div>
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="shortMonth"
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      label={{
                        value: "Yield (%)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip content={CustomTooltip} />
                    <Legend />

                    {showDubaiAverage && (
                      <ReferenceLine
                        y={6.2}
                        stroke="#6b7280"
                        strokeDasharray="5 5"
                        label={{ value: "Dubai Avg", position: "right" }}
                      />
                    )}

                    {chartKeys.bars.map((key) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        name={key}
                        fill={apartmentColors[key] || "#3b82f6"}
                        radius={[2, 2, 0, 0]}
                        maxBarSize={30}
                      />
                    ))}

                    {chartKeys.lines.map((key) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={key}
                        stroke={villaColors[key] || "#f59e0b"}
                        strokeWidth={3}
                        dot={{ r: 4, fill: villaColors[key] || "#f59e0b" }}
                        activeDot={{
                          r: 6,
                          fill: villaColors[key] || "#f59e0b",
                        }}
                      />
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-500">
                    No data available for the selected filters
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Grid */}
        {/* {Object.keys(analytics.changes).length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-amber-900">
                  Recent Changes
                </h3>
              </div>
              <div className="space-y-3">
                {Object.entries(
                  analytics.changes as Record<string, number>
                ).map(([key, change]) => (
                  <div
                    key={key}
                    className="bg-white/60 rounded-lg p-3 border border-amber-200"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-amber-800">
                        {key}
                      </span>
                      <div
                        className={`flex items-center gap-1 text-sm font-semibold ${
                          change >= 0 ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {change >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {change >= 0 ? "+" : ""}
                        {change.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-900">
                  Average Yields
                </h3>
              </div>
              <div className="space-y-3">
                {Object.entries(
                  analytics.averages as Record<string, number>
                ).map(([key, avg]) => (
                  <div
                    key={key}
                    className="bg-white/60 rounded-lg p-3 border border-green-200"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">
                        {key}
                      </span>
                      <span className="text-sm font-semibold text-green-700">
                        {avg.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )} */}

        {/* Info Section */}
        {/* <div className="bg-gray-50 rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-200 rounded-lg">
              <Info className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              About Rental Yields
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-800 mb-2">Definition</h4>
              <p className="text-sm text-gray-600">
                Annual rental income as percentage of property value
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-800 mb-2">UAE Range</h4>
              <p className="text-sm text-gray-600">
                Typically 4-8% for residential properties
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-800 mb-2">Key Factors</h4>
              <p className="text-sm text-gray-600">
                Location, property type, market conditions
              </p>
            </div>
          </div>
        </div> */}

        {/* Active Filters */}
        {(propertyType !== "all" ||
          bedrooms !== "all" ||
          dateRange !== "1y" ||
          viewType !== "monthly") && (
          <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
            <Filter className="h-3 w-3" />
            <span>Active filters:</span>
            {viewType !== "monthly" && (
              <Badge variant="outline">
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </Badge>
            )}
            {dateRange !== "1y" && <Badge variant="outline">{dateRange}</Badge>}
            {propertyType !== "all" && (
              <Badge variant="secondary">{propertyType}</Badge>
            )}
            {bedrooms !== "all" && (
              <Badge variant="secondary">{bedrooms}BR</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => {
                setPropertyType("all");
                setBedrooms("all");
                setDateRange("1y");
                setViewType("monthly");
              }}
            >
              Reset
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalYieldChart;
