"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BarChart2, MapPin, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import AreaAnalyticsInsightsTab from "@/components/explore-area-tabs/AreaAnalyticsInsightsTab";
import AreaDetailsTab from "@/components/explore-area-tabs/AreaDetailsTab";

const slugify = (text: string) =>
  text
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

type TabId = "details" | "insights";

// ── Layer heights — keep in sync with Navbar & CommunitySubNav ───────────────
const NAVBAR_HEIGHT = 80; // main fixed navbar           z-50
const SUBNAV_HEIGHT = 44; // CommunitySubNav             z-40
// sticky tab bar:          z-[35]   (below both above)

const STAT_ITEMS = [
  {
    label: "Avg. Price / sqft",
    value: "AED 2,450",
    change: "+8.2%",
    positive: true,
  },
  { label: "Rental Yield", value: "6.4%", change: "+0.3%", positive: true },
  { label: "Transactions YTD", value: "1,824", change: null, positive: null },
  { label: "Occupancy Rate", value: "91%", change: "+2.1%", positive: true },
];

export default function AreaPageDetails() {
  const { areaName } = useParams<{ areaName: string }>();
  const areaId = areaName?.split("-").pop();
  const areaIdNumber = Number(areaId);

  const [area, setArea] = useState<{
    officialAreaName: string;
    commercialName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [isSticky, setIsSticky] = useState(false);

  // ── The subnav only renders when we're on the details tab ────────────────
  // Pass the LIVE isSticky value so AreaDetailsTab can forward it to
  // CommunitySubNav — the subnav should only be visible once the pill has
  // scrolled behind the navbar, i.e. exactly when isSticky is true.
  const showSubnav = activeTab === "details" && isSticky;

  // The sticky tab bar sits directly below the navbar on the insights tab,
  // and below navbar + subnav on the details tab.
  const stickyTabTop = showSubnav
    ? NAVBAR_HEIGHT + SUBNAV_HEIGHT // 124 px
    : NAVBAR_HEIGHT; //  80 px

  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchArea = async () => {
      try {
        const res = await fetch(`/api/areaNameLocation?areaId=${areaIdNumber}`);
        if (!res.ok) throw new Error("API failed");
        const data = await res.json();
        setArea(data);
      } catch (err) {
        console.error("Error fetching area:", err);
      } finally {
        setLoading(false);
      }
    };
    if (areaId) fetchArea();
  }, [areaId]);

  // Sticky fires once the pill's BOTTOM edge has scrolled fully behind the
  // main navbar. We intentionally use only NAVBAR_HEIGHT here (not + subnav)
  // because the subnav itself only appears *after* isSticky becomes true —
  // there is no chicken-and-egg: sticky → subnav shows → tab top shifts.
  const checkSticky = useCallback(() => {
    if (!pillRef.current) return;
    const rect = pillRef.current.getBoundingClientRect();
    setIsSticky(rect.bottom <= NAVBAR_HEIGHT);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", checkSticky, { passive: true });
    checkSticky();
    return () => window.removeEventListener("scroll", checkSticky);
  }, [checkSticky]);

  // Re-evaluate whenever the active tab changes so the threshold is fresh.
  useEffect(() => {
    checkSticky();
  }, [activeTab, checkSticky]);

  // ── Loading / error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#c9a84c] border-t-transparent animate-spin" />
          <p className="text-[#c9a84c] font-light tracking-[0.2em] text-sm uppercase">
            Loading
          </p>
        </div>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <p className="text-white/50 text-lg">Area not found</p>
      </div>
    );
  }

  const officialSlug = slugify(area.officialAreaName);
  const locationSlug = slugify(area.commercialName);

  const tabs = [
    { id: "details" as TabId, label: "Area Details", icon: MapPin },
    { id: "insights" as TabId, label: "Area Insights", icon: BarChart2 },
  ] as const;

  return (
    <div className="">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden"
        style={{
          minHeight: "520px",
          background:
            "linear-gradient(135deg, #0a0f1e 0%, #0f1930 50%, #0a1628 100%)",
        }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(#c9a84c 1px, transparent 1px),
              linear-gradient(90deg, #c9a84c 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
        <div
          className="absolute top-0 right-0 w-[1px] h-full opacity-20"
          style={{
            background:
              "linear-gradient(to bottom, transparent, #c9a84c, transparent)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px] opacity-15"
          style={{
            background:
              "linear-gradient(to right, transparent, #c9a84c 40%, transparent)",
          }}
        />
        <div
          className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(16,60,130,0.15) 0%, transparent 70%)",
          }}
        />

        <div className="container mx-auto px-6 lg:px-10 relative pt-32 pb-16">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-10 text-xs tracking-[0.15em] uppercase"
              style={{ color: "rgba(201,168,76,0.5)" }}
            >
              <Link
                href="/explore-areas"
                className="flex items-center gap-1.5 hover:text-[#c9a84c] transition-colors duration-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                All Areas
              </Link>
              <ChevronRight className="w-3 h-3 opacity-40" />
              <span className="text-[#c9a84c]">{area.officialAreaName}</span>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-12 items-end">
              {/* Title */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <div
                    className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-sm text-[10px] font-semibold tracking-[0.25em] uppercase"
                    style={{
                      background: "rgba(201,168,76,0.1)",
                      border: "1px solid rgba(201,168,76,0.25)",
                      color: "#c9a84c",
                    }}
                  >
                    <span className="w-1 h-1 rounded-full bg-[#c9a84c]" />
                    Dubai Real Estate
                  </div>
                  <h1
                    className="font-serif font-bold leading-[1.05] mb-4"
                    style={{
                      fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                      color: "#f0ece4",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {area.officialAreaName}
                    <br />
                    <span style={{ color: "#c9a84c", fontStyle: "italic" }}>
                      Intelligence
                    </span>
                  </h1>
                  <p
                    className="text-sm font-light leading-relaxed max-w-md tracking-wide"
                    style={{ color: "rgba(240,236,228,0.45)" }}
                  >
                    {area.commercialName} · Comprehensive investment analysis &
                    market data
                  </p>
                </motion.div>
              </div>

              {/* Stats panel */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="lg:min-w-[320px]"
              >
                <div
                  className="rounded-lg overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  {STAT_ITEMS.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-5 py-4"
                      style={{
                        borderBottom:
                          i < STAT_ITEMS.length - 1
                            ? "1px solid rgba(255,255,255,0.05)"
                            : "none",
                      }}
                    >
                      <span
                        className="text-[11px] uppercase tracking-[0.15em]"
                        style={{ color: "rgba(240,236,228,0.35)" }}
                      >
                        {s.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-base font-semibold"
                          style={{ color: "#f0ece4" }}
                        >
                          {s.value}
                        </span>
                        {s.change && (
                          <span
                            className="text-[11px] font-medium px-1.5 py-0.5 rounded-sm"
                            style={{
                              background: s.positive
                                ? "rgba(52,211,153,0.12)"
                                : "rgba(248,113,113,0.12)",
                              color: s.positive ? "#34d399" : "#f87171",
                            }}
                          >
                            {s.change}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Tab section ──────────────────────────────────────────────────── */}
      <div className="mx-auto px-6 lg:px-10 -mt-1">
        {/*
          Pill toggle — normal-flow so pillRef can track its scroll position.
          Fades out once the pill's bottom edge has scrolled behind the navbar.
        */}
        <div ref={pillRef} className="mt-8 mb-6">
          <motion.div
            animate={{ opacity: isSticky ? 0 : 1, y: isSticky ? -6 : 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ pointerEvents: isSticky ? "none" : "auto" }}
            aria-hidden={isSticky}
          >
            <div
              className="inline-flex rounded-xl p-1 gap-1"
              style={{
                background: "#1a1f35",
                boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
              }}
            >
              {tabs.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className="relative flex items-center gap-2.5 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                    style={
                      isActive
                        ? {
                            background:
                              "linear-gradient(135deg, #c9a84c, #e8c96a)",
                            color: "#0a0f1e",
                          }
                        : {
                            background: "transparent",
                            color: "rgba(255,255,255,0.45)",
                          }
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/*
          Sticky tab bar
          ─ z-[35]: above content, below CommunitySubNav (z-40) & Navbar (z-50)
          ─ `top` transitions between:
              details  tab + scrolled past subnav → 124 px  (below navbar + subnav)
              insights tab                        →  80 px  (below navbar only)
          ─ CSS `transition: top` does the smooth slide when showSubnav changes
        */}
        <AnimatePresence>
          {isSticky && (
            <motion.div
              key="sticky-tabs"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              role="tablist"
              className="sticky z-[35]"
              style={{
                top: `${stickyTabTop}px`,
                background: "#0a0f1e",
                borderBottom: "1px solid rgba(201,168,76,0.18)",
                boxShadow: "0 6px 24px rgba(0,0,0,0.28)",
                // Full-bleed beyond container padding
                marginLeft:
                  "calc(-1 * max(1.5rem, (100vw - 1280px) / 2 + 2.5rem))",
                marginRight:
                  "calc(-1 * max(1.5rem, (100vw - 1280px) / 2 + 2.5rem))",
                paddingLeft: "max(1.5rem, (100vw - 1280px) / 2 + 2.5rem)",
                paddingRight: "max(1.5rem, (100vw - 1280px) / 2 + 2.5rem)",
                // Smooth shift when subnav appears / disappears
                transition: "top 0.22s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              <div className="flex items-end">
                {tabs.map(({ id, label, icon: Icon }) => {
                  const isActive = activeTab === id;
                  return (
                    <button
                      key={id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(id)}
                      className="relative flex items-center gap-2 px-6 py-[14px] text-sm font-medium transition-colors duration-200 select-none"
                      style={{
                        color: isActive ? "#c9a84c" : "rgba(255,255,255,0.35)",
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                      {isActive && (
                        <motion.span
                          layoutId="sticky-gold-underline"
                          className="absolute bottom-0 left-0 right-0 h-[2px]"
                          style={{
                            background:
                              "linear-gradient(to right, #c9a84c, #e8c96a)",
                          }}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Content panel ── */}
        <div
          className="rounded-2xl overflow-hidden mb-16"
          style={{
            background: "#ffffff",
            boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              {activeTab === "details" && (
                // Pass the live showSubnav value — true once pill is behind navbar
                <AreaDetailsTab slug={locationSlug} showSubnav={showSubnav} />
              )}
              {activeTab === "insights" && (
                <AreaAnalyticsInsightsTab name={officialSlug} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
