"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, DollarSign, BarChart3, Users } from "lucide-react";
import Link from "next/link";
import { Area } from "@/types/area";

type AreaCardWithProjectsNumProps = {
  area: Area;
  isLast: boolean;
  lastAreaRef: (node: HTMLDivElement | null) => void;
  sortOption: any;
  // search: string
};

const AreaCardWithProjectsNum: React.FC<AreaCardWithProjectsNumProps> = ({
  area,
  isLast,
  lastAreaRef,
  sortOption,
  // search
}) => {
  console.log(area);
  return (
    <Card
      key={area.area_id}
      ref={isLast ? lastAreaRef : null}
      className="luxury-card group hover:shadow-luxury transition-all duration-300 hover:-translate-y-1"
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {area.area_name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Villas Section */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-2">Villas</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Avg Sale Price</p>
              <p className="font-semibold">
                {area.villa_current_sale_price != null
                  ? Number(area.villa_current_sale_price).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )
                  : "-"}
              </p>
              {/* <p className="text-xs text-muted-foreground">
                Last Year:{" "}
                {area.villa_last_year_sale_price != null
                  ? Number(area.villa_last_year_sale_price).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )
                  : "—"}
              </p> */}
              {/* <p
                className={`text-xs ${
                  area.villa_sale_growth_pct != null
                    ? area.villa_sale_growth_pct < 0
                      ? "text-red-600"
                      : "text-green-600"
                    : "text-black"
                }`}
              >
                Growth:{" "}
                {area.villa_sale_growth_pct != null
                  ? `${area.villa_sale_growth_pct.toFixed(2)}%`
                  : "—"}
              </p> */}
            </div>
            <div>
              <p className="text-muted-foreground">Avg Rent Price</p>
              <p className="font-semibold">
                {area.villa_current_rent_price != null
                  ? Number(area.villa_current_rent_price).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )
                  : "—"}
              </p>
              {/* <p className="text-xs text-muted-foreground">
                Last Year:{" "}
                {area.villa_last_year_rent_price != null
                  ? Number(area.villa_last_year_rent_price).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumSignificantDigits: 2,
                      }
                    )
                  : "—"}
              </p> */}
              {/* <p
                className={`text-xs ${
                  area.villa_rent_growth_pct != null
                    ? area.villa_rent_growth_pct < 0
                      ? "text-red-600"
                      : "text-green-600"
                    : "text-black"
                }`}
              >
                Growth:{" "}
                {area.villa_rent_growth_pct != null
                  ? `${area.villa_rent_growth_pct.toFixed(2)}%`
                  : "—"}
              </p> */}
            </div>
          </div>
        </div>

        {/* Apartments Section */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-2">
            Apartments
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Avg Sale Price</p>
              <p className="font-semibold">
                {area.apt_current_sale_price != null
                  ? Number(area.apt_current_sale_price).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )
                  : "—"}
              </p>
              {/* <p className="text-xs text-muted-foreground">
                Last Year:{" "}
                {area.apt_last_year_sale_price != null
                  ? Number(area.apt_last_year_sale_price).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )
                  : "—"}
              </p> */}
              {/* <p
                className={`text-xs ${
                  area.apt_sale_growth_pct != null
                    ? area.apt_sale_growth_pct < 0
                      ? "text-red-600"
                      : "text-green-600"
                    : "text-black"
                }`}
              >
                Growth:{" "}
                {area.apt_sale_growth_pct != null
                  ? `${area.apt_sale_growth_pct.toFixed(2)}%`
                  : "—"}
              </p> */}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Rent Price</p>
              <p className="font-semibold">
                {area.apt_current_rent_price != null
                  ? Number(area.apt_current_rent_price).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )
                  : "—"}
              </p>
              {/* <p className="text-xs text-muted-foreground">
                Last Year:{" "}
                {area.apt_last_year_rent_price != null
                  ? Number(area.apt_last_year_rent_price).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )
                  : "—"}
              </p> */}
              {/* <p
                className={`text-xs ${
                  area.apt_rent_growth_pct != null
                    ? area.apt_rent_growth_pct < 0
                      ? "text-red-600"
                      : "text-green-600"
                    : "text-black"
                }`}
              >
                Growth:{" "}
                {area.apt_rent_growth_pct != null
                  ? `${area.apt_rent_growth_pct.toFixed(2)}%`
                  : "—"}
              </p> */}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Link href={`/explore-areas/${area.area_id}`} className="block">
          <Button className="w-full cta-primary group-hover:shadow-gold transition-all">
            View Area Insights
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default AreaCardWithProjectsNum;
