"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CoachMarkProps = {
  communitySlug: string;
  communityName: string;
  onDismiss: () => void;
  onOpenChat: () => void;
};

const CoachMark = ({ communitySlug, communityName, onDismiss, onOpenChat }: CoachMarkProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has EVER seen the coach mark (global, not per community)
    const hasSeenCoachMark = localStorage.getItem("hasSeenAICoachMark");

    if (!hasSeenCoachMark) {
      // Show coach mark after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Prevent body scroll when coach mark is visible
        document.body.style.overflow = "hidden";
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    // Mark as seen globally (will never show again)
    localStorage.setItem("hasSeenAICoachMark", "true");
    
    // Re-enable scrolling
    document.body.style.overflow = "unset";
    
    setIsVisible(false);
    onDismiss();
  };

  const handleOpenChat = () => {
    // Mark as seen globally
    localStorage.setItem("hasSeenAICoachMark", "true");
    
    // Re-enable scrolling
    document.body.style.overflow = "unset";
    
    setIsVisible(false);
    onOpenChat();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 z-[60]"
            style={{ backdropFilter: "blur(8px)" }}
          />

          {/* Coach Mark Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
            className="fixed bottom-24 right-6 z-[70] w-80"
          >
            {/* Arrow pointing to chat button */}
            <div className="absolute -bottom-3 right-5 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white drop-shadow-lg"></div>

            {/* Card */}
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 relative">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>

              {/* Content */}
              <div className="pr-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span>💡</span>
                  <span>Did you know?</span>
                </h3>
                
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  You can ask the AI about <strong className="text-gray-900">{communityName}</strong> — prices, lifestyle,
                  infrastructure, rental demand, and hidden risks.
                </p>

                <button
                  onClick={handleOpenChat}
                  className="w-full px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 hover:shadow-md active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(45 85% 55%), hsl(40 80% 60%))",
                  }}
                >
                  Ask AI about {communityName} →
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CoachMark;