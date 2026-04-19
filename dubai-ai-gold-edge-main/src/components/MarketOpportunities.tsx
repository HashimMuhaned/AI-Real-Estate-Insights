"use client";

import React from "react";
import { motion } from "framer-motion";
import SectionHeader from "./opportunities/SectionHeader";
import SectionDivider from "./opportunities/SectionDivider";
import ROICard from "./opportunities/ROICard";
import OffPlanCard from "./opportunities/OffPlanCard";
import UndervaluedCard from "./opportunities/UndervaluedCard";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function MarketOpportunities({
  roiAreas,
  offPlanProjects,
  undervaluedCommunities,
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-16 pb-20">
        {/* Page Header */}
        <div className="mb-14 max-w-[900px] mx-auto text-center">
          <h1
            className="font-playfair font-bold leading-tight text-foreground"
            style={{ fontSize: "clamp(32px, 5vw, 52px)" }}
          >
            Market <em className="italic text-accent">Opportunities</em> at a
            Glance
          </h1>
          <p className="mt-3.5 text-[15px] leading-relaxed text-muted-foreground max-w-[520px] mx-auto">
            AI-curated insights across Dubai's most dynamic real estate
            corridors — ranked by yield, momentum, and value potential.
          </p>
        </div>

        {/* Section 1: Top ROI Areas */}
        <SectionHeader
          title="Top ROI Areas"
          subtitle="Highest-yielding communities ranked by net rental return, updated quarterly."
          ctaLabel="Check all areas"
          onCta={undefined}
        />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {roiAreas.map((area) => (
            <ROICard key={area.name} area={area} />
          ))}
        </motion.div>

        <SectionDivider />

        {/* Section 2: Off-Plan Opportunities */}
        <SectionHeader
          title="Off-Plan Opportunities"
          subtitle="Handpicked developer projects with flexible payment plans and strong appreciation potential."
          ctaLabel="Check all off-plan projects"
          onCta={undefined}
        />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {offPlanProjects.map((project) => (
            <OffPlanCard key={project.name} project={project} />
          ))}
        </motion.div>

        <SectionDivider />

        {/* Section 3: Undervalued Communities */}
        <SectionHeader
          title="Undervalued Communities"
          subtitle="Areas where current pricing lags fundamentals — identified by our valuation model."
          ctaLabel="Check all communities"
          onCta={undefined}
        />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {undervaluedCommunities.map((community) => (
            <UndervaluedCard key={community.name} community={community} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
