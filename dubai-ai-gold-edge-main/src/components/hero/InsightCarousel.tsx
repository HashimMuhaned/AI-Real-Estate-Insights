"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
// import { INSIGHT_CARDS, CARD_DURATION } from "./heroData";
import FloatingCardShell from "./FloatingCardShell";
import AnimatedHeight from "./AnimatedHeight";
import InsightCardContent from "./InsightCardContent";

export const CARD_DURATION = 7000;

export default function InsightCarousel({ cards }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [isHovered, setHovered] = useState(false);

  useEffect(() => {
    if (cardIndex >= cards.length) setCardIndex(0);
  }, [cards.length]);

  const progressRef = useRef(0);
  const startOffsetRef = useRef(null);
  const rafRef = useRef(null);
  const [displayProgress, setDisplayProgress] = useState(0);

  const currentCard = cards[cardIndex];

  const goTo = useCallback((i) => {
    setCardIndex(i);
    progressRef.current = 0;
    startOffsetRef.current = null;
    setDisplayProgress(0);
  }, []);

  const goNext = useCallback(
    () => goTo((cardIndex + 1) % cards.length),
    [cardIndex, goTo],
  );
  const goPrev = useCallback(
    () => goTo((cardIndex - 1 + cards.length) % cards.length),
    [cardIndex, goTo],
  );

  useEffect(() => {
    if (isHovered) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startOffsetRef.current = null;
      return;
    }
    const saved = progressRef.current;
    const tick = (now) => {
      if (startOffsetRef.current === null)
        startOffsetRef.current = now - saved * CARD_DURATION;
      const p = Math.min((now - startOffsetRef.current) / CARD_DURATION, 1);
      progressRef.current = p;
      setDisplayProgress(p);
      if (p >= 1) {
        goNext();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isHovered, cardIndex, goNext]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 44 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.85, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col items-center"
    >
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
        className="w-full max-w-[440px]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Glow */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id + "-glow"}
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8 }}
            className="absolute -inset-10 pointer-events-none rounded-[50px] blur-[50px]"
            style={{
              background: `radial-gradient(ellipse at 50% 40%, ${currentCard.accentColor}45 0%, transparent 68%)`,
            }}
          />
        </AnimatePresence>
        <motion.div
          animate={{ opacity: [0.15, 0.28, 0.15], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -inset-4 pointer-events-none rounded-[40px] blur-[40px]"
          style={{
            background: `radial-gradient(circle at 60% 60%, ${currentCard.accentColor}30 0%, transparent 65%)`,
          }}
        />

        {/* Card */}
        <FloatingCardShell accentColor={currentCard.accentColor}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id + "-bar"}
              className="h-[3px]"
              style={{
                backgroundColor: currentCard.accentColor,
                transformOrigin: "left",
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id + "-bg"}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 85% 10%, ${currentCard.bgFrom}, ${currentCard.bgTo} 55%, transparent 80%)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65 }}
            />
          </AnimatePresence>

          <AnimatedHeight animKey={currentCard.id}>
            <InsightCardContent card={currentCard} />
          </AnimatedHeight>
        </FloatingCardShell>

        {/* Nav row */}
        <div className="mt-5 flex items-center justify-between px-1 gap-3">
          <motion.button
            whileHover={{ scale: 1.12, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={goPrev}
            className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>

          <div className="flex items-center gap-2 flex-1 justify-center">
            {cards.map((card, i) => {
              const active = i === cardIndex;
              return (
                <motion.button
                  key={card.id}
                  onClick={() => goTo(i)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.88 }}
                  className="relative flex items-center justify-center"
                  style={{ height: 32 }}
                  title={card.badge}
                >
                  <motion.div
                    animate={{
                      width: active ? 32 : 8,
                      backgroundColor: active
                        ? card.accentColor
                        : "rgba(255,255,255,0.15)",
                      borderRadius: active ? 6 : 999,
                      height: active ? 10 : 8,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                  {active && (
                    <motion.div
                      className="absolute inset-0 rounded-md blur-[6px]"
                      style={{ backgroundColor: card.accentColor + "60" }}
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          <motion.button
            whileHover={{ scale: 1.12, x: 2 }}
            whileTap={{ scale: 0.9 }}
            onClick={goNext}
            className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 mx-1 h-[3px] bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full origin-left"
            style={{
              backgroundColor: currentCard.accentColor,
              scaleX: displayProgress,
              transformOrigin: "left",
            }}
            transition={{ duration: 0 }}
          />
        </div>

        {/* Hint / counter */}
        <div className="mt-2 flex justify-between items-center px-1">
          <AnimatePresence>
            {isHovered && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                className="text-[11px] text-white/[0.22] flex items-center gap-1.5"
              >
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ⏸
                </motion.span>
                Paused — hover away to resume
              </motion.p>
            )}
          </AnimatePresence>
          <span className="text-[11px] text-white/15 ml-auto">
            {cardIndex + 1} / {cards.length}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
