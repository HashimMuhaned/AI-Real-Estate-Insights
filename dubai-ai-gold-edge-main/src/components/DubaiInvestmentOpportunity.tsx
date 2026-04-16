"use client";

import { motion } from "framer-motion";
import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ROIArea {
  name: string;
  roi: number;
  avgPrice: string;
  aiNarrative: string;
  imageUrl?: string;
}

interface OffPlanProject {
  name: string;
  area: string;
  priceRange: string;
  completionYear: number;
  aiNarrative: string;
  imageUrl?: string;
}

interface UndervaluedCommunity {
  name: string;
  score: number;
  insight: string;
  aiNarrative: string;
  imageUrl?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const roiAreas: ROIArea[] = [
  {
    name: "Dubai Marina",
    roi: 7.8,
    avgPrice: "AED 1,850/sqft",
    aiNarrative:
      "Strong short-term rental demand driven by tourism and corporate housing. Waterfront premiums are stabilizing, creating a favorable entry point for long-term investors.",
    imageUrl:
      "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=400&q=80",
  },
  {
    name: "Jumeirah Village Circle",
    roi: 9.2,
    avgPrice: "AED 950/sqft",
    aiNarrative:
      "JVC continues to outperform broader market benchmarks. Family-friendly units with high occupancy rates make this area a resilient income-generating asset.",
    imageUrl:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80",
  },
  {
    name: "Business Bay",
    roi: 8.4,
    avgPrice: "AED 1,620/sqft",
    aiNarrative:
      "Corporate proximity to DIFC and Downtown creates sustained rental demand. Mixed-use developments here are attracting a new generation of digital nomads.",
    imageUrl:
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400&q=80",
  },
  {
    name: "Dubai South",
    roi: 10.1,
    avgPrice: "AED 780/sqft",
    aiNarrative:
      "Expo legacy infrastructure and Al Maktoum airport expansion are accelerating capital appreciation. Early investors are already seeing double-digit annualised returns.",
    imageUrl:
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80",
  },
];

const offPlanProjects: OffPlanProject[] = [
  {
    name: "Emaar Beachfront",
    area: "Dubai Harbour",
    priceRange: "AED 2.1M – 12M",
    completionYear: 2026,
    aiNarrative:
      "Rare private beach access in a master-planned island community. Payment plan flexibility and developer reputation make this a flagship off-plan pick.",
    imageUrl:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80",
  },
  {
    name: "Sobha Hartland II",
    area: "MBR City",
    priceRange: "AED 1.4M – 8M",
    completionYear: 2027,
    aiNarrative:
      "Green community within city limits remains a premium differentiator. Sobha's track record of on-time delivery reduces completion risk significantly.",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80",
  },
  {
    name: "Nakheel Rixos Palm",
    area: "Palm Jumeirah",
    priceRange: "AED 5M – 35M",
    completionYear: 2026,
    aiNarrative:
      "Ultra-luxury branded residences with a proven hospitality operator add a yield management layer traditional units can't match.",
    imageUrl:
      "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=400&q=80",
  },
];

const undervaluedCommunities: UndervaluedCommunity[] = [
  {
    name: "International City",
    score: 84,
    insight: "Price-to-rent ratio well below city average",
    aiNarrative:
      "Demographic demand is outpacing supply in this corridor. Recent infrastructure upgrades are yet to be fully priced into valuations — a classic delayed-reflection opportunity.",
    imageUrl:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80",
  },
  {
    name: "Discovery Gardens",
    score: 79,
    insight: "Metro connectivity boosting rental yield",
    aiNarrative:
      "Metro access has historically re-rated communities by 15–25% over a 3-year window. Discovery Gardens is mid-cycle in that repricing journey.",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  },
  {
    name: "Remraam",
    score: 76,
    insight: "Townhouse shortage driving capital gains",
    aiNarrative:
      "End-user demand for villas and townhouses in affordable corridors is compressing vacancy rates. Remraam's low base price offers significant upside asymmetry.",
    imageUrl:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80",
  },
  {
    name: "Mirdif",
    score: 88,
    insight: "Villa community with growing expat demand",
    aiNarrative:
      "Established neighborhood with strong school catchments. Corporate relocations from Europe are driving a new rental cohort, creating sustained demand pressure.",
    imageUrl:
      "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=400&q=80",
  },
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ─── Islamic Geometric SVG Background ────────────────────────────────────────

// const SceneBackground: React.FC = () => (
//   <div
//     className="absolute inset-0 pointer-events-none select-none overflow-hidden"
//     style={{ zIndex: 0 }}
//   >
//     {/* Warm golden radial glow — top left */}
//     <motion.div
//       animate={{ scale: [1, 1.1, 1], opacity: [0.18, 0.28, 0.18] }}
//       transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
//       className="absolute -top-1/3 -left-1/4 w-[75vw] h-[75vw] rounded-full"
//       style={{
//         background:
//           "radial-gradient(circle, hsl(45,85%,55%) 0%, transparent 68%)",
//       }}
//     />
//     {/* Dark navy radial glow — bottom right */}
//     <motion.div
//       animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.13, 0.06] }}
//       transition={{
//         duration: 16,
//         repeat: Infinity,
//         ease: "easeInOut",
//         delay: 4,
//       }}
//       className="absolute -bottom-1/3 -right-1/4 w-[65vw] h-[65vw] rounded-full"
//       style={{
//         background:
//           "radial-gradient(circle, hsl(210,80%,12%) 0%, transparent 68%)",
//       }}
//     />
//     {/* Small dark square grid */}
//     <div
//       className="absolute inset-0"
//       style={{
//         backgroundImage:
//           "linear-gradient(hsl(210,80%,12%) 1px, transparent 1px), linear-gradient(90deg, hsl(210,80%,12%) 1px, transparent 1px)",
//         backgroundSize: "32px 32px",
//         opacity: 0.055,
//       }}
//     />
//     {/* Shimmer sweep */}
//     <motion.div
//       animate={{ y: ["-100%", "220%"] }}
//       transition={{ duration: 11, repeat: Infinity, ease: "linear", delay: 2 }}
//       className="absolute inset-x-0 h-[25vh]"
//       style={{
//         background:
//           "linear-gradient(to bottom, transparent, rgba(210,160,40,0.045), transparent)",
//       }}
//     />
//   </div>
// );

// ─── Mini Bar ─────────────────────────────────────────────────────────────────

const MiniBar: React.FC<{ value: number; max?: number }> = ({
  value,
  max = 12,
}) => {
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
};

// ─── Score Ring ───────────────────────────────────────────────────────────────

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" className="shrink-0">
      <circle
        cx={28}
        cy={28}
        r={r}
        fill="none"
        stroke="hsl(35,25%,82%)"
        strokeWidth={4}
      />
      <motion.circle
        cx={28}
        cy={28}
        r={r}
        fill="none"
        stroke="hsl(45,85%,50%)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        whileInView={{ strokeDashoffset: circ - dash }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        transform="rotate(-90 28 28)"
      />
      <text
        x={28}
        y={33}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="hsl(210,80%,12%)"
      >
        {score}
      </text>
    </svg>
  );
};

// ─── Tag ──────────────────────────────────────────────────────────────────────

const Tag: React.FC<{ label: string; color: "gold" | "emerald" | "blue" }> = ({
  label,
  color,
}) => {
  const base =
    "text-[11px] tracking-widest uppercase px-3 py-0.5 rounded-full whitespace-nowrap font-bold";
  if (color === "gold")
    return (
      <span
        className={base}
        style={{
          background:
            "linear-gradient(135deg, hsl(45,85%,55%), hsl(40,80%,62%))",
          color: "hsl(210,80%,10%)",
        }}
      >
        {label}
      </span>
    );
  if (color === "emerald")
    return (
      <span
        className={`${base} bg-emerald-50 text-emerald-800 border border-emerald-300`}
      >
        {label}
      </span>
    );
  return (
    <span
      className={base}
      style={{ background: "hsl(210,80%,12%)", color: "hsl(35,20%,94%)" }}
    >
      {label}
    </span>
  );
};

// ─── Card Image ───────────────────────────────────────────────────────────────

const CardImage: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => (
  <div className="w-full h-44 rounded-t-2xl overflow-hidden bg-amber-100/60 relative shrink-0">
    {src && (
      <img src={src} alt={alt} className="w-full h-full object-cover block" />
    )}
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(to bottom, transparent 40%, rgba(8,20,40,0.55) 100%)",
      }}
    />
  </div>
);

// ─── AI Narrative Box ─────────────────────────────────────────────────────────

const AINarrative: React.FC<{ text: string }> = ({ text }) => (
  <div
    className="mt-3 px-3.5 py-2.5 rounded-r-lg"
    style={{
      background: "hsl(45,60%,97%)",
      border: "1px solid hsl(45,70%,82%)",
      borderLeft: "3px solid hsl(45,85%,52%)",
    }}
  >
    <p
      className="text-[10px] font-bold tracking-widest uppercase mb-1 flex items-center gap-1"
      style={{ color: "hsl(40,70%,36%)" }}
    >
      <span>✦</span> AI Insight
    </p>
    <p
      className="m-0 text-[13px] leading-relaxed"
      style={{ color: "hsl(210,40%,25%)" }}
    >
      {text}
    </p>
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCta?: () => void;
}> = ({ title, subtitle, ctaLabel, onCta }) => (
  <motion.div
    initial={{ opacity: 0, y: -12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="flex items-start justify-between gap-6 mb-7"
  >
    {/* Left: title + subtitle */}
    <div className="min-w-0">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="h-px w-8" style={{ background: "hsl(45,85%,50%)" }} />
        <div
          className="w-1.5 h-1.5 rotate-45"
          style={{ background: "hsl(45,85%,50%)" }}
        />
      </div>
      <h2
        className="m-0 text-2xl font-bold leading-tight"
        style={{
          color: "hsl(210,80%,10%)",
          fontFamily: "'Playfair Display', Georgia, serif",
        }}
      >
        {title}
      </h2>
      <p className="mt-1 text-sm" style={{ color: "hsl(210,30%,42%)" }}>
        {subtitle}
      </p>
    </div>

    {/* Right: CTA */}
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onCta}
      className="shrink-0 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl"
      style={{
        border: "1.5px solid hsl(210,80%,18%)",
        background: "transparent",
        color: "hsl(210,80%,12%)",
        whiteSpace: "nowrap",
        cursor: "pointer",
        transition: "background 0.2s, color 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "hsl(210,80%,12%)";
        (e.currentTarget as HTMLButtonElement).style.color = "hsl(45,85%,62%)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = "hsl(210,80%,12%)";
      }}
    >
      <span>{ctaLabel}</span>
      <span className="text-base">→</span>
    </motion.button>
  </motion.div>
);

// ─── Section Divider ──────────────────────────────────────────────────────────

const SectionDivider: React.FC = () => (
  <div className="flex items-center gap-4 my-14">
    <div className="flex-1 h-px" style={{ background: "hsl(40,40%,80%)" }} />
    <div
      className="w-2.5 h-2.5 rotate-45 rounded-sm"
      style={{ background: "hsl(45,85%,52%)" }}
    />
    <div className="flex-1 h-px" style={{ background: "hsl(40,40%,80%)" }} />
  </div>
);

// ─── ROI Card ─────────────────────────────────────────────────────────────────

const ROICard: React.FC<{ area: ROIArea }> = ({ area }) => (
  <motion.div
    variants={cardVariants}
    whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(190,148,40,0.18)" }}
    transition={{ duration: 0.25 }}
    className="rounded-2xl overflow-hidden flex flex-col"
    style={{
      background: "hsl(25,20%,98%)",
      border: "1px solid hsl(40,40%,85%)",
      boxShadow: "0 4px 24px rgba(8,20,40,0.08)",
    }}
  >
    <div className="relative">
      <CardImage src={area.imageUrl} alt={area.name} />
      <div className="absolute top-3 left-3">
        <Tag label="High Yield" color="gold" />
      </div>
    </div>

    <div className="p-5 flex-1 flex flex-col">
      <h3
        className="m-0 mb-1 text-lg font-bold"
        style={{
          color: "hsl(210,80%,10%)",
          fontFamily: "'Playfair Display', Georgia, serif",
        }}
      >
        {area.name}
      </h3>
      <p
        className="m-0 mb-3.5 text-[13px]"
        style={{ color: "hsl(210,30%,46%)" }}
      >
        Avg. {area.avgPrice}
      </p>

      <div className="flex items-center gap-3 mb-2">
        <span
          className="text-3xl font-extrabold leading-none"
          style={{
            color: "hsl(45,85%,38%)",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          {area.roi.toFixed(1)}%
        </span>
        <span
          className="text-[13px] leading-snug"
          style={{ color: "hsl(210,30%,52%)" }}
        >
          Annual
          <br />
          ROI
        </span>
      </div>

      <div className="mb-1">
        <MiniBar value={area.roi} max={12} />
        <div
          className="flex justify-between text-[10px] mt-0.5"
          style={{ color: "hsl(210,20%,62%)" }}
        >
          <span>0%</span>
          <span>12%</span>
        </div>
      </div>

      <AINarrative text={area.aiNarrative} />
    </div>
  </motion.div>
);

// ─── Off-Plan Card ────────────────────────────────────────────────────────────

const OffPlanCard: React.FC<{ project: OffPlanProject }> = ({ project }) => (
  <motion.div
    variants={cardVariants}
    whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(190,148,40,0.18)" }}
    transition={{ duration: 0.25 }}
    className="rounded-2xl overflow-hidden flex flex-col"
    style={{
      background: "hsl(25,20%,98%)",
      border: "1px solid hsl(40,40%,85%)",
      boxShadow: "0 4px 24px rgba(8,20,40,0.08)",
    }}
  >
    <div className="relative">
      <CardImage src={project.imageUrl} alt={project.name} />
      <div className="absolute top-3 left-3">
        <Tag label="Off-Plan" color="blue" />
      </div>
      <div
        className="absolute bottom-3 right-3 text-xs font-bold px-2.5 py-1 rounded-lg"
        style={{
          background: "rgba(8,20,40,0.72)",
          color: "hsl(45,85%,70%)",
          backdropFilter: "blur(4px)",
        }}
      >
        {project.completionYear}
      </div>
    </div>

    <div className="p-5 flex-1 flex flex-col">
      <h3
        className="m-0 mb-1 text-lg font-bold"
        style={{
          color: "hsl(210,80%,10%)",
          fontFamily: "'Playfair Display', Georgia, serif",
        }}
      >
        {project.name}
      </h3>
      <p className="m-0 mb-3 text-[13px]" style={{ color: "hsl(210,30%,46%)" }}>
        {project.area}
      </p>

      <div
        className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-lg mb-3.5"
        style={{
          background: "hsl(45,60%,94%)",
          border: "1px solid hsl(45,70%,80%)",
        }}
      >
        <span
          className="text-[11px] font-semibold"
          style={{ color: "hsl(40,50%,44%)" }}
        >
          Price
        </span>
        <span
          className="text-[13px] font-bold"
          style={{ color: "hsl(210,80%,12%)" }}
        >
          {project.priceRange}
        </span>
      </div>

      <AINarrative text={project.aiNarrative} />
    </div>
  </motion.div>
);

// ─── Undervalued Card ─────────────────────────────────────────────────────────

const UndervaluedCard: React.FC<{ community: UndervaluedCommunity }> = ({
  community,
}) => (
  <motion.div
    variants={cardVariants}
    whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(190,148,40,0.18)" }}
    transition={{ duration: 0.25 }}
    className="rounded-2xl overflow-hidden flex flex-col"
    style={{
      background: "hsl(25,20%,98%)",
      border: "1px solid hsl(40,40%,85%)",
      boxShadow: "0 4px 24px rgba(8,20,40,0.08)",
    }}
  >
    <div className="relative">
      <CardImage src={community.imageUrl} alt={community.name} />
      <div className="absolute top-3 left-3">
        <Tag label="Undervalued" color="emerald" />
      </div>
    </div>

    <div className="p-5 flex-1 flex flex-col">
      <div className="flex items-start justify-between mb-2 gap-2">
        <div>
          <h3
            className="m-0 mb-1 text-lg font-bold"
            style={{
              color: "hsl(210,80%,10%)",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            {community.name}
          </h3>
          <p className="m-0 text-[13px]" style={{ color: "hsl(210,30%,46%)" }}>
            {community.insight}
          </p>
        </div>
        <ScoreRing score={community.score} />
      </div>

      <p
        className="text-[11px] font-semibold tracking-wider uppercase mb-2"
        style={{ color: "hsl(160,60%,30%)" }}
      >
        Value Score
      </p>

      <AINarrative text={community.aiNarrative} />
    </div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const DubaiInvestmentOpportunity: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* <SceneBackground /> */}

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-16 pb-20">
        {/* ── Page Header ── */}
        <div className="mb-14 max-w-[900px] mx-auto text-center">
          {/* Title */}
          <h1 className="font-[Playfair_Display] font-bold leading-tight text-[clamp(32px,5vw,52px)] text-[hsl(var(--primary))] whitespace-nowrap">
            Market{" "}
            <em className="italic text-[hsl(var(--accent))]">Opportunities</em>{" "}
            at a Glance
          </h1>

          {/* Description */}
          <p className="mt-3.5 text-[15px] leading-relaxed text-[hsl(var(--muted-fg))] max-w-[520px] mx-auto">
            AI-curated insights across Dubai's most dynamic real estate
            corridors — ranked by yield, momentum, and value potential.
          </p>
        </div>

        {/* ── Section 1: Top ROI Areas ── */}
        <SectionHeader
          title="Top ROI Areas"
          subtitle="Highest-yielding communities ranked by net rental return, updated quarterly."
          ctaLabel="Check all areas"
        />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {roiAreas.map((area) => (
            <ROICard key={area.name} area={area} />
          ))}
        </motion.div>

        <SectionDivider />

        {/* ── Section 2: Off-Plan Opportunities ── */}
        <SectionHeader
          title="Off-Plan Opportunities"
          subtitle="Handpicked developer projects with flexible payment plans and strong appreciation potential."
          ctaLabel="Check all off-plan projects"
        />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {offPlanProjects.map((project) => (
            <OffPlanCard key={project.name} project={project} />
          ))}
        </motion.div>

        <SectionDivider />

        {/* ── Section 3: Undervalued Communities ── */}
        <SectionHeader
          title="Undervalued Communities"
          subtitle="Areas where current pricing lags fundamentals — identified by our valuation model."
          ctaLabel="Check all communities"
        />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {undervaluedCommunities.map((community) => (
            <UndervaluedCard key={community.name} community={community} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default DubaiInvestmentOpportunity;
