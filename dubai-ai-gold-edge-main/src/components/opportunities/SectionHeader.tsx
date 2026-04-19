"use client";

import React from "react";
import { motion } from "framer-motion";

export default function SectionHeader({ title, subtitle, ctaLabel, onCta }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex items-start justify-between gap-6 mb-7"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="h-px w-8 bg-accent" />
          <div className="w-1.5 h-1.5 rotate-45 bg-accent" />
        </div>
        <h2 className="m-0 text-2xl font-bold leading-tight text-foreground font-playfair">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onCta}
        className="shrink-0 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border-[1.5px] border-primary bg-transparent text-primary whitespace-nowrap cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        <span>{ctaLabel}</span>
        <span className="text-base">→</span>
      </motion.button>
    </motion.div>
  );
}
