import React from "react";
import { motion } from "framer-motion";

export default function ScoreRing({ score }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <svg width={56} height={56} viewBox="0 0 56 56" className="shrink-0">
      <circle
        cx={28}
        cy={28}
        r={r}
        fill="none"
        stroke="hsl(35,25%,82%)"
        strokeWidth={4}
      />
      <motion.circle
        cx={28}
        cy={28}
        r={r}
        fill="none"
        stroke="hsl(45,85%,50%)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        whileInView={{ strokeDashoffset: circ - dash }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        transform="rotate(-90 28 28)"
      />
      <text
        x={28}
        y={33}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="hsl(210,80%,12%)"
      >
        {score}
      </text>
    </svg>
  );
}