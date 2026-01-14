"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TopProjectsInArea from "@/components/charts/(general)/TopProjectsInArea";
import VillaAppartementPriceTrend from "@/components/charts/(general)/VillaAppartementPriceTrend";
import AreaOverView from "@/components/charts/(general)/AreaOverView";
import { useParams } from "next/navigation";
import RentalYeildInArea from "@/components/charts/RentalYeildInArea";
import RentalYieldANDPriceToRentRatio from "@/components/charts/(general)/RentalYieldANDPriceToRentRatio";
import VillaApartmentPricePerRoom from "@/components/charts/(general)/ApartmentVillaPricePerBedRoomNumber";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  params: { areaName: string };
};

export default function AreaPageDetails() {
  const { areaName } = useParams<{ areaName: string }>();
  const name = areaName ? areaName.replace(/-/g, " ") : "";

  return (
    <div>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-28 pb-12 bg-gradient-to-br from-primary to-primary/80 geometric-pattern"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-primary-foreground">
            <Link
              href="/explore-areas"
              className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Areas
            </Link>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              {name} Insights
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl">
              Comprehensive investment analysis and market insights for {name}
            </p>
          </div>
        </div>
      </motion.section>
      <div>
        <Tabs defaultValue="general" className="p-4 md:p-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-5 my-[1rem]">
            <TabsTrigger value="general">General Insights</TabsTrigger>
            <TabsTrigger value="rental">Rental Analysis</TabsTrigger>
            <TabsTrigger value="comparison">Market Comparison</TabsTrigger>
            <TabsTrigger value="signals">Investment Signals</TabsTrigger>
            <TabsTrigger value="premium">Premium Features</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <AreaOverView area={name} />
            <VillaAppartementPriceTrend selectedArea={name} />
            <VillaApartmentPricePerRoom areaName={name} />
            <TopProjectsInArea />
            <RentalYieldANDPriceToRentRatio selectedArea={name} />
          </TabsContent>

          <TabsContent value="rental">
            <RentalYeildInArea areaName={name} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
