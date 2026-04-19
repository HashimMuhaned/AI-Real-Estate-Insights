import React from "react";
import { motion } from "framer-motion";
import CardImage from "./CardImage";
import Tag from "./Tag";
import ScoreRing from "./ScoreRing";
import AINarrative from "./AINarrative";

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function UndervaluedCard({ community }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(190,148,40,0.18)" }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl overflow-hidden flex flex-col bg-card border border-border"
      style={{ boxShadow: "0 4px 24px rgba(8,20,40,0.08)" }}
    >
      <div className="relative">
        <CardImage src={community.imageUrl} alt={community.name} />
        <div className="absolute top-3 left-3">
          <Tag label="Undervalued" color="emerald" />
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2 gap-2">
          <div>
            <h3 className="m-0 mb-1 text-lg font-bold text-foreground font-playfair">
              {community.name}
            </h3>
            <p className="m-0 text-[13px] text-muted-foreground">
              {community.insight}
            </p>
          </div>
          <ScoreRing score={community.score} />
        </div>

        <p
          className="text-[11px] font-semibold tracking-wider uppercase mb-2"
          style={{ color: "hsl(160,60%,30%)" }}
        >
          Value Score
        </p>

        <AINarrative text={community.aiNarrative} />
      </div>
    </motion.div>
  );
}