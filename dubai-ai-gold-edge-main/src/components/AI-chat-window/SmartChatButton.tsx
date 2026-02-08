"use client";

import React, { useState, useEffect } from "react";
import { TbMessageChatbot } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";

type SmartChatButtonProps = {
  isExpanded: boolean;
  contextText: string | null;
  communityName?: string;
  onClick: () => void;
};

const SmartChatButton = ({
  isExpanded,
  contextText,
  communityName,
  onClick,
}: SmartChatButtonProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const animationDuration = prefersReducedMotion ? 0.1 : 0.5;

  return (
    <div className="relative">
      {/* Hover Tooltip - Only show when collapsed */}
      <AnimatePresence>
        {isHovering && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-3 w-72 pointer-events-none"
          >
            {/* Arrow */}
            <div className="absolute -bottom-2 right-5 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900"></div>
            
            {/* Tooltip content */}
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

      {/* Button */}
      <motion.button
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={onClick}
        initial={false}
        animate={{
          width: isExpanded && contextText ? "fit-content" : "56px",
        }}
        transition={{
          duration: animationDuration,
          ease: [0.25, 0.46, 0.45, 0.94], // Smooth ease-out
        }}
        whileHover={{ 
          scale: prefersReducedMotion ? 1 : 1.02,
        }}
        whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
        className="h-14 rounded-full flex items-center justify-center text-white relative"
        style={{
          background:
            "linear-gradient(135deg, hsl(45 85% 55%), hsl(40 80% 60%))",
          minWidth: "56px",
          maxWidth: "400px", // Prevent it from being too wide
        }}
        aria-label={contextText || "Open AI chat"}
      >
        {/* Content Container */}
        <div className="relative flex items-center justify-center h-full w-full">
          
          {/* Icon - Only visible when collapsed */}
          <AnimatePresence>
            {!isExpanded && (
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.8,
                  transition: { duration: 0.2 }
                }}
                className="flex items-center justify-center"
              >
                <TbMessageChatbot className="text-2xl" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text - Only visible when expanded */}
          <AnimatePresence mode="wait">
            {isExpanded && contextText && (
              <motion.div
                key={contextText}
                initial={{ 
                  opacity: 0,
                  filter: "blur(4px)",
                  scale: 0.95,
                }}
                animate={{ 
                  opacity: 1,
                  filter: "blur(0px)",
                  scale: 1,
                }}
                exit={{ 
                  opacity: 0,
                  filter: "blur(4px)",
                  scale: 0.95,
                }}
                transition={{ 
                  duration: animationDuration,
                  ease: "easeOut"
                }}
                className="px-6 font-medium text-sm whitespace-nowrap"
                style={{
                  maxWidth: "350px", // Prevent text from being too wide
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