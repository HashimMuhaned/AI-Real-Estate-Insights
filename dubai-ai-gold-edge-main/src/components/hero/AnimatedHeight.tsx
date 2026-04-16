"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnimatedHeight({ children, animKey }) {
  const innerRef = useRef(null);
  const [height, setHeight] = useState("auto");

  useEffect(() => {
    if (!innerRef.current) return;
    const el = innerRef.current;
    const measure = () => setHeight(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [animKey]);

  return (
    <motion.div
      animate={{ height }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      style={{ overflow: "hidden", position: "relative" }}
    >
      <div
        ref={innerRef}
        style={{ visibility: "hidden", position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "none" }}
        aria-hidden
      >
        {children}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={animKey}
          initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -22, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}