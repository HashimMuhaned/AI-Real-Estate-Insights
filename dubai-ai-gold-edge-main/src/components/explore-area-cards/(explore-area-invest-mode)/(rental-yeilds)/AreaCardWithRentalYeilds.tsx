"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import Link from "next/link";
import { RentalYield } from "@/types/area";

type Props = {
  area: RentalYield;
  isLast?: boolean;
  lastRef?: (node?: Element | null) => void;
  sortOption: any;
};

const AreaCardWithRentalYeilds = ({
  area,
  isLast,
  lastRef,
  sortOption,
}: Props) => {
  return (
    <Card
      ref={isLast ? lastRef : undefined}
      key={area.area_id}
      className="luxury-card group hover:shadow-luxury transition-all duration-300 hover:-translate-y-1"
    >
      {/* --- header --- */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {area.area_name}
            </CardTitle>
          </div>
          <Badge variant="secondary">Yields</Badge>
        </div>
      </CardHeader>

      {/* --- content --- */}
      <CardContent className="space-y-4">
        {/* Villa Yields */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Villa Yield</span>
          </div>
          <div className="text-sm">
            Current:{" "}
            {area.villa_yield_current_year != null
              ? Number(area.villa_yield_current_year).toFixed(2)
              : "—"}
            %
          </div>
          <div className="text-sm">
            Last Year:{" "}
            {area.villa_yield_last_year != null
              ? Number(area.villa_yield_last_year).toFixed(2)
              : "—"}
            %
          </div>
          <div
            className={`text-sm flex items-center gap-1 ${
              area.villa_yield_growth_pct != null
                ? Number(area.villa_yield_growth_pct) < 0
                  ? "text-red-600"
                  : "text-green-600"
                : "text-black"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Growth:{" "}
            {area.villa_yield_growth_pct != null
              ? `${Number(area.villa_yield_growth_pct).toFixed(2)}%`
              : "—"}
          </div>
        </div>

        {/* Apartment Yields */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Apartment Yield</span>
          </div>
          <div className="text-sm">
            Current:{" "}
            {area.apt_yield_current_year != null
              ? Number(area.apt_yield_current_year).toFixed(2)
              : "—"}
            %
          </div>
          <div className="text-sm">
            Last Year:{" "}
            {area.apt_yield_last_year != null
              ? Number(area.apt_yield_last_year).toFixed(2)
              : "—"}
            %
          </div>
          <div
            className={`text-sm flex items-center gap-1 ${
              area.apt_yield_growth_pct != null
                ? Number(area.apt_yield_growth_pct) < 0
                  ? "text-red-600"
                  : "text-green-600"
                : "text-black"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Growth:{" "}
            {area.apt_yield_growth_pct != null
              ? `${Number(area.apt_yield_growth_pct).toFixed(2)}%`
              : "—"}
          </div>
        </div>

        {/* CTA */}
        <Link href={`/explore-areas/${area.area_id}`} className="block">
          <Button className="w-full cta-primary group-hover:shadow-gold transition-all">
            View Area Insights
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default AreaCardWithRentalYeilds;
