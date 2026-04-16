"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function FloatingCardShell({ children, accentColor }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const cfg = { stiffness: 130, damping: 22, mass: 0.7 };
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), cfg);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), cfg);
  const glowX = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), cfg);
  const glowY = useSpring(useTransform(my, [-0.5, 0.5], [-18, 18]), cfg);

  return (
    <motion.div
      ref={ref}
      onMouseMove={e => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      style={{
        rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d",
        boxShadow: useTransform([glowX, glowY], ([x, y]) =>
          `${x}px ${y}px 50px ${accentColor}35, 0 30px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.055)`),
      }}
      className="relative bg-[#070e1c] rounded-3xl overflow-hidden cursor-default"
    >
      {children}
    </motion.div>
  );
}