"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";
import { PriceGrowthVacancyRisk } from "@/types/area";
import { slugify } from "@/lib/slugify";

type AreaCardWithPriceGrowthVacancyRiskProps = {
  area: PriceGrowthVacancyRisk;
  isLast?: boolean;
  lastRef?: (node?: Element | null) => void;
  sortOption: any
};

const AreaCardWithROIGrowth = ({
  area,
  isLast,
  lastRef,
  sortOption
}: AreaCardWithPriceGrowthVacancyRiskProps) => {
  const getVacancyRiskLabel = (value: number) => {
    if (value === null || value === undefined)
      return { label: "-", color: "text-gray-400" };

    if (value >= 0 && value < 0.2)
      return {
        label: "Very Low Risk – Attractive Market",
        color: "text-green-600",
      };
    if (value >= 0.2 && value < 0.4)
      return { label: "Low Risk – Strong Demand", color: "text-green-500" };
    if (value >= 0.4 && value < 0.6)
      return {
        label: "Medium Risk – Balanced Market",
        color: "text-yellow-500",
      };
    if (value >= 0.6 && value < 0.8)
      return { label: "High Risk – Risky", color: "text-orange-500" };
    if (value >= 0.8 && value <= 1.0)
      return { label: "Very High Risk – Oversupply", color: "text-red-600" };

    return { label: "Invalid", color: "text-gray-400" };
  };

  const villaRisk = getVacancyRiskLabel(area.villa_vacancy_risk);
  const aptRisk = getVacancyRiskLabel(area.apt_vacancy_risk);

  return (
    <Card
      ref={isLast ? lastRef : undefined}
      key={area.area_id}
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
          <Badge variant="secondary">Insights</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Growth */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Villa Price Growth</span>
          </div>
          <div
            className={`text-sm ${
              area.villa_price_growth_pct < 0
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {area.villa_price_growth_pct
              ? `${area.villa_price_growth_pct}%`
              : "-"}
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Apartment Price Growth</span>
          </div>
          <div
            className={`text-sm ${
              area.apt_price_growth_pct < 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {area.apt_price_growth_pct ? `${area.apt_price_growth_pct}%` : "-"}
          </div>
        </div>

        {/* Vacancy Risk */}
        <div className="space-y-4">
          {/* Villa Vacancy Risk */}
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Villa Vacancy Risk</span>
            </div>
            <div className={`text-sm ${villaRisk.color}`}>
              {area.villa_vacancy_risk !== null &&
              area.villa_vacancy_risk !== undefined
                ? `${(area.villa_vacancy_risk * 100).toFixed(1)}% – ${
                    villaRisk.label
                  }`
                : "-"}
            </div>
          </div>

          {/* Apartment Vacancy Risk */}
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Apartment Vacancy Risk
              </span>
            </div>
            <div className={`text-sm ${aptRisk.color}`}>
              {area.apt_vacancy_risk !== null &&
              area.apt_vacancy_risk !== undefined
                ? `${(area.apt_vacancy_risk * 100).toFixed(1)}% – ${
                    aptRisk.label
                  }`
                : "-"}
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link href={`/area-insights/${slugify(area.area_name)}`} className="block">
          <Button className="w-full cta-primary group-hover:shadow-gold transition-all">
            View Area Insights
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default AreaCardWithROIGrowth;
