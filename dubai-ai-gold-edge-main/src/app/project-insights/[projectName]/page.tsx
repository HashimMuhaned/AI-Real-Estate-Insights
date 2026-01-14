"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: { areaName: string };
};

export default function ProjectPageDetails({ params }: Props) {
  const slug = params.areaName; // "dubai-marina"
  const name = slug?.replace(/-/g, " "); // "dubai marina"
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
    </div>
  );
}
