import React from "react";
import { motion } from "framer-motion";

export default function MiniBar({ value, max = 12 }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden bg-amber-200/60">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        className="h-full rounded-full"
        style={{
          background:
            "linear-gradient(90deg, hsl(45,85%,48%), hsl(40,88%,60%))",
        }}
      />
    </div>
  );
}