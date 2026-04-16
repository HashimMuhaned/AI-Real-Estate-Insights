"use client";

import { motion } from "framer-motion";

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.22, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-1/3 -left-1/4 w-[75vw] h-[75vw] rounded-full"
        style={{
          background: "radial-gradient(circle, #1e40af 0%, transparent 68%)",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.16, 0.08] }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        className="absolute -bottom-1/3 -right-1/4 w-[65vw] h-[65vw] rounded-full"
        style={{
          background: "radial-gradient(circle, #6d28d9 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />
      <motion.div
        animate={{ y: ["-100%", "220%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear", delay: 3 }}
        className="absolute inset-x-0 h-[25vh] opacity-60"
        style={{
          background:
            "linear-gradient(to bottom,transparent,rgba(255,255,255,0.012),transparent)",
        }}
      />
    </div>
  );
}
