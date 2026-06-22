"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { name: "Overview", href: "#overview" },
  { name: "Investor Verdict", href: "#investor-verdict" },
  { name: "Risks", href: "#risks" },
  { name: "Gallery", href: "#gallery" },
  { name: "Classifications", href: "#classifications" },
  { name: "Amenities", href: "#amenities" },
  { name: "Accessibility", href: "#accessibility" },
  { name: "Location", href: "#location" },
  { name: "Projects", href: "#projects" },
  { name: "Market Insights", href: "#market-insights" },
];

// Heights must match AreaPageDetails constants exactly.
// When the subnav is visible we are already in sticky mode, so the full
// three-bar stack is present: navbar (80) + subnav (44) + tab bar (48).
const NAVBAR_HEIGHT = 80;
const SUBNAV_HEIGHT = 44;
const TAB_BAR_HEIGHT = 48;
const SCROLL_OFFSET = NAVBAR_HEIGHT + SUBNAV_HEIGHT + TAB_BAR_HEIGHT + 8; // 180

interface Props {
  /** True when the pill toggle has scrolled behind the navbar */
  isVisible: boolean;
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export default function CommunitySubNav({
  isVisible,
  activeSection,
  onSectionChange,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Keep the active link centred inside the horizontal strip
  useEffect(() => {
    if (activeButtonRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const btn = activeButtonRef.current;
      const left =
        btn.offsetLeft - container.clientWidth / 2 + btn.clientWidth / 2;
      container.scrollTo({ left, behavior: "smooth" });
    }
  }, [activeSection]);

  const scrollToSection = (href: string) => {
    const id = href.substring(1);
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
    // Optimistically update active section so the highlight is immediate
    onSectionChange(id);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          key="community-subnav"
          initial={{ y: -(SUBNAV_HEIGHT + 4), opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -(SUBNAV_HEIGHT + 4), opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className="fixed left-0 right-0 z-40"
          style={{
            top: NAVBAR_HEIGHT, // flush under the main navbar
            height: SUBNAV_HEIGHT,
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
          }}
          aria-label="Section navigation"
        >
          <div
            ref={scrollRef}
            className="flex items-center gap-0.5 h-full overflow-x-auto px-4 sm:px-8"
            style={
              {
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              } as React.CSSProperties
            }
          >
            {NAV_LINKS.map((link) => {
              const sectionId = link.href.substring(1);
              const isActive = activeSection === sectionId;
              return (
                <button
                  key={link.name}
                  // Store ref on the active button so we can auto-scroll to it
                  ref={(el) => {
                    if (isActive) activeButtonRef.current = el;
                  }}
                  onClick={() => scrollToSection(link.href)}
                  className="relative flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-colors duration-150 rounded-lg"
                  style={{
                    color: isActive ? "#0a0f1e" : "#9ca3af",
                    background: isActive
                      ? "rgba(201,168,76,0.08)"
                      : "transparent",
                  }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="subnav-dot"
                      className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{ background: "#c9a84c" }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                      }}
                    />
                  )}
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="subnav-line"
                      className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                      style={{ background: "#c9a84c" }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
