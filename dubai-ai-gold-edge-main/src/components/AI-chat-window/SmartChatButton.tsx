"use client";

import React, { useState, useLayoutEffect, useRef, useEffect } from "react";
import { TbMessageChatbot } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";

type SmartChatButtonProps = {
  isExpanded: boolean;
  contextText: string | null;
  communityName?: string;
  onClick: () => void;
  maxWidth?: number;
};

const ICON_CONTAINER_WIDTH = 48; // px, reserve this much space on the right when expanded

const SmartChatButton = ({
  isExpanded,
  contextText,
  communityName,
  onClick,
  maxWidth = 500,
}: SmartChatButtonProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [measuredTextWidth, setMeasuredTextWidth] = useState(0);
  const [shouldTruncate, setShouldTruncate] = useState(false);

  // Offscreen measurement ref
  const measureRef = useRef<HTMLDivElement | null>(null);

  // reduced motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Measure synchronously before paint
  useLayoutEffect(() => {
    if (!isExpanded || !contextText) {
      setMeasuredTextWidth(0);
      setShouldTruncate(false);
      return;
    }

    const el = measureRef.current;
    if (!el) return;

    const measure = () => {
      // get bounding width of the text content
      const width = Math.ceil(el.getBoundingClientRect().width || el.scrollWidth || 0);
      // content padding we want to reserve (left + right)
      const contentPadding = 32; // 16px left + 16px right
      // Also reserve the icon container width on the right when expanded
      const reservedForIcon = ICON_CONTAINER_WIDTH;
      const maxTextWidth = Math.max(0, maxWidth - contentPadding - reservedForIcon);

      if (width > maxTextWidth) {
        setMeasuredTextWidth(maxTextWidth);
        setShouldTruncate(true);
      } else {
        setMeasuredTextWidth(width);
        setShouldTruncate(false);
      }
    };

    measure();

    // Observe changes to the measurement element (handles font load and text changes)
    let ro: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(() => measure());
      ro.observe(el);
    }

    // Also re-measure on window resize and font load
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    // font loading: re-measure when fonts finish loading
    if ((document as any).fonts && (document as any).fonts.ready) {
      (document as any).fonts.ready.then(() => measure()).catch(() => {});
    }

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [isExpanded, contextText, maxWidth]);

  const animationDuration = prefersReducedMotion ? 0.1 : 0.5;

  // final width in px (number)
  const getButtonWidth = () => {
    const iconOnly = 56; // collapsed size
    if (!isExpanded || !contextText) return iconOnly;
    // measuredTextWidth is the text-only width (clamped). Add padding and reserved icon space.
    const final = Math.min(measuredTextWidth + 32 + ICON_CONTAINER_WIDTH, maxWidth);
    return Math.max(final, iconOnly);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {isHovering && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-3 w-72 pointer-events-none"
          >
            <div className="absolute -bottom-2 right-5 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900"></div>
            <div className="bg-gray-900 text-white rounded-lg p-3 shadow-xl">
              <p className="text-xs leading-relaxed">
                {communityName ? (
                  <>
                    Ask about <strong>{communityName}</strong> — prices, lifestyle, infrastructure, rental demand, and hidden risks.
                  </>
                ) : (
                  <>
                    Ask me anything about Dubai real estate — market trends, property comparisons, investment advice, and area insights.
                  </>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offscreen measurement element */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: -9999,
          top: -9999,
          whiteSpace: "nowrap",
          visibility: "hidden",
          pointerEvents: "none",
          fontSize: "0.875rem", // match .text-sm
          fontWeight: 500, // match .font-medium
          fontFamily: "inherit",
        }}
      >
        {contextText}
      </div>

      <motion.button
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={onClick}
        whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
        whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
        animate={{ width: getButtonWidth() }}
        transition={{ duration: animationDuration, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="h-14 rounded-full flex items-center justify-center text-white overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, hsl(45 85% 55%), hsl(40 80% 60%))",
          paddingLeft: "1rem",
          // when expanded, reserve space for the right icon; otherwise keep compact
          paddingRight: isExpanded ? `${ICON_CONTAINER_WIDTH}px` : "1rem",
        }}
        aria-label={contextText || "Open AI chat"}
      >
        <div className="flex items-center justify-center w-full h-full relative">
          {/* Centered icon when collapsed */}
          <AnimatePresence mode="wait">
            {!isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: animationDuration }}
                className="flex items-center justify-center absolute inset-0"
              >
                <TbMessageChatbot className="text-2xl" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isExpanded && contextText && (
              <motion.div
                key={contextText}
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: animationDuration, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="font-medium text-sm w-full text-center"
                style={{
                  whiteSpace: "nowrap",
                  overflow: shouldTruncate ? "hidden" : "visible",
                  textOverflow: shouldTruncate ? "ellipsis" : "clip",
                  // small inner gap so text doesn't touch the reserved area
                  paddingRight: 8,
                }}
              >
                {contextText}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>
    </div>
  );
};

export default SmartChatButton;