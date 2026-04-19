"use client";

import React from "react";
import { motion } from "framer-motion";
import CardImage from "./CardImage";
import Tag from "./Tag";
import AINarrative from "./AINarrative";

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function OffPlanCard({ project }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(190,148,40,0.18)" }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl overflow-hidden flex flex-col bg-card border border-border"
      style={{ boxShadow: "0 4px 24px rgba(8,20,40,0.08)" }}
    >
      <div className="relative">
        <CardImage src={project.imageUrl} alt={project.name} />
        <div className="absolute top-3 left-3">
          <Tag label="Off-Plan" color="blue" />
        </div>
        <div
          className="absolute bottom-3 right-3 text-xs font-bold px-2.5 py-1 rounded-lg"
          style={{
            background: "rgba(8,20,40,0.72)",
            color: "hsl(45,85%,70%)",
            backdropFilter: "blur(4px)",
          }}
        >
          {project.completionYear}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="m-0 mb-1 text-lg font-bold text-foreground font-playfair">
          {project.name}
        </h3>
        <p className="m-0 mb-3 text-[13px] text-muted-foreground">
          {project.area}
        </p>

        <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-lg mb-3.5 bg-secondary border border-border">
          <span className="text-[11px] font-semibold text-muted-foreground">
            Price
          </span>
          <span className="text-[13px] font-bold text-foreground">
            {project.priceRange}
          </span>
        </div>

        <AINarrative text={project.aiNarrative} />
      </div>
    </motion.div>
  );
}
