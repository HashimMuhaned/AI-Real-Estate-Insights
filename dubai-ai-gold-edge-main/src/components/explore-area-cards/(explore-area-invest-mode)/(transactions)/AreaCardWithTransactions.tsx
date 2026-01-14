"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Users, Calendar, BarChart3 } from "lucide-react";
import Link from "next/link";
import { TransactionsTotalValue } from "@/types/area";
import { slugify } from "@/lib/slugify";

type TransactionsTotalValueCardProps = {
  area: TransactionsTotalValue;
  isLast?: boolean;
  lastRef?: (node?: Element | null) => void;
  sortOption: any;
};

const AreaCardWithTransactions = ({
  area,
  isLast,
  lastRef,
  sortOption,
}: TransactionsTotalValueCardProps) => {
  const formatCompact = (value?: number, isCurrency = false) => {
    if (value === undefined || value === null) return "-";

    // Use Intl for compact formatting
    const formatter = new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
      style: isCurrency ? "currency" : "decimal",
      currency: isCurrency ? "USD" : undefined,
    });

    return formatter.format(value);
  };

  const formatCurrency = (value?: number) => formatCompact(value, true);
  const formatNumber = (value?: number) => formatCompact(value, false);

  return (
    <Card
      ref={lastRef}
      className="luxury-card group hover:shadow-luxury transition-all duration-300 hover:-translate-y-1"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent" />
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {area.area_name}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Villas vs Apartments */}
        <div className="grid grid-cols-2 gap-6">
          {/* Villas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Villa Transactions
                </div>
                <div className="font-medium">
                  {formatNumber(area.villa_tx_all)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="font-medium">
                  {formatCurrency(area.villa_value_all)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Last Year Tx
                </div>
                <div className="font-medium">
                  {formatNumber(area.villa_tx_last_year)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Last Year Value
                </div>
                <div className="font-medium">
                  {formatCurrency(area.villa_value_last_year)}
                </div>
              </div>
            </div>
          </div>

          {/* Apartments */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Apartment Transactions
                </div>
                <div className="font-medium">
                  {formatNumber(area.apt_tx_all)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="font-medium">
                  {formatCurrency(area.apt_value_all)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Last Year Tx
                </div>
                <div className="font-medium">
                  {formatNumber(area.apt_tx_last_year)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Last Year Value
                </div>
                <div className="font-medium">
                  {formatCurrency(area.apt_value_last_year)}
                </div>
              </div>
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

export default AreaCardWithTransactions;
