"use client";

import React from "react";
import { motion } from "framer-motion";
import CardImage from "./CardImage";
import Tag from "./Tag";
import MiniBar from "./MiniBar";
import AINarrative from "./AINarrative";

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ROICard({ area }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(190,148,40,0.18)" }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl overflow-hidden flex flex-col bg-card border border-border"
      style={{ boxShadow: "0 4px 24px rgba(8,20,40,0.08)" }}
    >
      <div className="relative">
        <CardImage src={area.imageUrl} alt={area.name} />
        <div className="absolute top-3 left-3">
          <Tag label="High Yield" color="gold" />
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="m-0 mb-1 text-lg font-bold text-foreground font-playfair">
          {area.name}
        </h3>
        <p className="m-0 mb-3.5 text-[13px] text-muted-foreground">
          Avg. {area.avgPrice}
        </p>

        <div className="flex items-center gap-3 mb-2">
          <span
            className="text-3xl font-extrabold leading-none font-playfair"
            style={{ color: "hsl(45,85%,38%)" }}
          >
            {area.roi.toFixed(1)}%
          </span>
          <span className="text-[13px] leading-snug text-muted-foreground">
            Annual
            <br />
            ROI
          </span>
        </div>

        <div className="mb-1">
          <MiniBar value={area.roi} max={12} />
          <div className="flex justify-between text-[10px] mt-0.5 text-muted-foreground">
            <span>0%</span>
            <span>12%</span>
          </div>
        </div>

        <AINarrative text={area.aiNarrative} />
      </div>
    </motion.div>
  );
}
