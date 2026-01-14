"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Activity,
  ListCheck,
} from "lucide-react";
import { GrTransaction } from "react-icons/gr";

interface AreaOverviewData {
  tracked_projects: number;
  total_transactions_12m: number;
  avg_price_per_sqft: number;
  avg_rental_yield: number;
  yoy_price_growth: number;
}

const AreaOverView = ({ area }: { area: string }) => {
  const [data, setData] = useState<AreaOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAreaOverview = async () => {
      try {
        const searchParam = area.replace(/-/g, " ");
        const res = await fetch(
          `http://localhost:8080/api/get-area-overview?search=${encodeURIComponent(
            searchParam
          )}`
        );
        if (!res.ok) throw new Error("Failed to fetch area overview");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching area overview:", error);
      } finally {
        setLoading(false);
      }
    };

    if (area) fetchAreaOverview();
  }, [area]);

  if (loading) {
    return <p className="p-4 flex justify-center">Loading area overview...</p>;
  }

  if (!data) {
    return <p className="p-4 text-red-500">No data available for this area.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
      {/* Tracked Projects */}
      <Card className="luxury-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/20 rounded-xl">
              <Activity className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tracked Projects</p>
              <p className="text-2xl font-bold">
                {data.tracked_projects ?? "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Transactions (Last 12M) */}
      <Card className="luxury-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald/20 rounded-xl">
              <GrTransaction className="w-6 h-6 text-emerald" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Transactions (Last 12M)
              </p>
              <p className="text-2xl font-bold">
                {data.total_transactions_12m ?? "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Price per Sqft */}
      <Card className="luxury-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-destructive/20 rounded-xl">
              <BarChart3 className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Average Price per Sqft
              </p>
              <p className="text-2xl font-bold">
                {data.avg_price_per_sqft
                  ? `${data.avg_price_per_sqft} AED`
                  : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Rental Yield */}
      <Card className="luxury-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-destructive/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Average Rental Yield
              </p>
              <p className="text-2xl font-bold">
                {data.avg_rental_yield ? `${data.avg_rental_yield}%` : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* YoY Price Growth */}
      <Card className="luxury-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-destructive/20 rounded-xl">
              <BarChart3 className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                YoY Price Growth %
              </p>
              <p
                className={`text-2xl font-bold ${
                  data.yoy_price_growth >= 0
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                {data.yoy_price_growth ? `${data.yoy_price_growth}%` : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AreaOverView;
