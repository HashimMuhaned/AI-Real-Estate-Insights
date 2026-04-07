"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AreaAnalyticsInsightsTab from "@/components/explore-area-tabs/AreaAnalyticsInsightsTab";
import AreaDetailsTab from "@/components/explore-area-tabs/AreaDetailsTab";

const slugify = (text: string) =>
  text
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

export default function AreaPageDetails() {
  const { areaName } = useParams<{ areaName: string }>();
  console.log(areaName);

  const areaId = areaName?.split("-").pop();

  const areaIdNumber = Number(areaId);

  if (isNaN(areaIdNumber)) {
    console.error("Invalid areaId");
  }

  const [area, setArea] = useState<{
    officialAreaName: string;
    commercialName: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArea = async () => {
      try {
        const res = await fetch(`/api/areaNameLocation?areaId=${areaIdNumber}`);

        if (!res.ok) {
          throw new Error("API failed");
        }

        const data = await res.json();
        setArea(data);
      } catch (err) {
        console.error("Error fetching area:", err);
      } finally {
        setLoading(false);
      }
    };

    if (areaId) fetchArea();
  }, [areaId]);

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!area) {
    return <div className="p-10 text-center">Area not found</div>;
  }

  const officialSlug = slugify(area.officialAreaName);
  const locationSlug = slugify(area.commercialName);

  const displayName = `${area.officialAreaName} (${area.commercialName})`;

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
              {displayName} Insights
            </h1>

            <p className="text-xl text-primary-foreground/90 max-w-2xl">
              Comprehensive investment analysis for {displayName}
            </p>
          </div>
        </div>
      </motion.section>

      <Tabs defaultValue="details" className="p-4 md:p-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Area Details</TabsTrigger>
          <TabsTrigger value="insights">Area Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <AreaDetailsTab slug={locationSlug} />
        </TabsContent>

        <TabsContent value="insights">
          <AreaAnalyticsInsightsTab name={officialSlug} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
