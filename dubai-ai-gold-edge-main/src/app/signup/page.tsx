"use client"

import { useState, useEffect, useRef } from "react";

// ─── TypeScript Types ──────────────────────────────────────────────────────────

type UserRole = "investor" | "resident" | "developer" | null;

interface InvestorProfile {
  // Step 1
  fullName: string;
  email: string;
  password: string;
  country: string;
  // Step 2
  goals: string[];
  // Step 3
  budgetRange: string;
  financing: string;
  horizon: string;
  // Step 4
  riskProfile: "conservative" | "balanced" | "aggressive";
  // Step 5
  preferredAreas: string[];
  propertyTypes: string[];
  bedrooms: string[];
  // Step 6
  aiHelpers: string[];
  // Semantic
  aiSummary?: string;
}

interface ResidentProfile {
  fullName: string;
  email: string;
  password: string;
  country: string;
  searchPurpose: string;
  householdType: string;
  lifestylePrefs: string[];
  priorityFactors: string[];
  workLocation: string;
  aiSummary?: string;
}

// Developer sub-role type
type DevSubRole = "agent" | "agency" | "developer_company" | null;

interface AgentProfile {
  // Step 1
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  country: string;
  // Step 2
  brn: string;
  agencyName: string;
  experience: string;
  markets: string[];
  // Step 3 - docs
  licenseUploaded: boolean;
  employmentUploaded: boolean;
  emiratesIdUploaded: boolean;
  // Step 4 - selfie (mock)
  selfieVerified: boolean;
  // Step 5
  specializations: string[];
  areasServed: string[];
  languages: string[];
  clientTypes: string[];
  aiSummary?: string;
}

interface AgencyProfile {
  // Step 1
  companyName: string;
  orn: string;
  tradeLicense: string;
  email: string;
  officeLocation: string;
  website: string;
  // Step 2 - docs
  tradeLicenseUploaded: boolean;
  ornCertUploaded: boolean;
  // Step 3 - representative
  repName: string;
  repTitle: string;
  repEmail: string;
  repMobile: string;
  // Step 4
  agentCount: string;
  markets: string[];
  focusTypes: string[];
  transactionVolume: string;
  // Step 5
  aiDistribution: string[];
  // Step 6 - brand
  logoUploaded: boolean;
  websiteUrl: string;
  aiSummary?: string;
}

interface DeveloperCompanyProfile {
  // Step 1
  legalName: string;
  email: string;
  hqCountry: string;
  website: string;
  yearsOperating: string;
  // Step 2 - docs
  tradeLicenseUploaded: boolean;
  devRegUploaded: boolean;
  authLetterUploaded: boolean;
  // Step 3
  projectCategories: string[];
  mainCommunities: string[];
  deliveryRecord: string;
  typicalBuyers: string[];
  // Step 4
  aiPositioning: string[];
  // Step 5
  rendersUploaded: boolean;
  brochuresUploaded: boolean;
  aiSummary?: string;
}

// Keep a union for the state
interface DeveloperProfile {
  subRole: DevSubRole;
  agent: Partial<AgentProfile>;
  agency: Partial<AgencyProfile>;
  devCompany: Partial<DeveloperCompanyProfile>;
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

// ─── Icons (inline SVG) ────────────────────────────────────────────────────────

const TrendingUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <rect x="2" y="3" width="10" height="18" />
    <rect x="12" y="8" width="10" height="13" />
    <line x1="6" y1="8" x2="6" y2="8" />
    <line x1="6" y1="12" x2="6" y2="12" />
    <line x1="6" y1="16" x2="6" y2="16" />
    <line x1="16" y1="12" x2="16" y2="12" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
    <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" />
    <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5z" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const BadgeCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

const LandmarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <line x1="3" y1="22" x2="21" y2="22"/>
    <line x1="6" y1="18" x2="6" y2="11"/>
    <line x1="10" y1="18" x2="10" y2="11"/>
    <line x1="14" y1="18" x2="14" y2="11"/>
    <line x1="18" y1="18" x2="18" y2="11"/>
    <polygon points="12 2 20 7 4 7"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ShieldCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const ScanIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
    <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
    <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <line x1="7" y1="12" x2="17" y2="12"/>
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

// ─── Animated Background ───────────────────────────────────────────────────────

const AnimatedOrbs = ({ role }: { role: UserRole }) => {
  const colors =
    role === "investor"
      ? ["hsl(45,85%,55%,0.15)", "hsl(160,75%,35%,0.1)", "hsl(210,80%,40%,0.12)"]
      : role === "resident"
      ? ["hsl(200,80%,50%,0.12)", "hsl(160,75%,40%,0.1)", "hsl(280,60%,50%,0.08)"]
      : ["hsl(45,85%,55%,0.12)", "hsl(0,70%,55%,0.08)", "hsl(210,80%,50%,0.1)"];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {colors.map((color, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-3xl animate-pulse"
          style={{
            width: `${300 + i * 80}px`,
            height: `${300 + i * 80}px`,
            background: color,
            top: `${10 + i * 25}%`,
            left: `${-10 + i * 20}%`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${4 + i}s`,
          }}
        />
      ))}
    </div>
  );
};

// ─── Floating Cards ────────────────────────────────────────────────────────────

const FloatingCard = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <div
    className={cn(
      "absolute bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-lg animate-bounce",
      className
    )}
    style={{ animationDelay: `${delay}s`, animationDuration: "3s" }}
  >
    {children}
  </div>
);

// ─── Left Panel ────────────────────────────────────────────────────────────────

const LeftPanel = ({ role }: { role: UserRole }) => {
  const content = {
    investor: {
      headline: "Your AI-Powered Dubai Investment Advisor",
      subtext:
        "Analyze millions of DLD transactions, discover high-yield communities, and uncover opportunities before the market moves.",
      bullets: [
        "AI-powered investment insights",
        "Predictive market analysis",
        "Smart community comparisons",
        "Off-plan opportunity discovery",
      ],
    },
    resident: {
      headline: "Find a Community That Matches Your Lifestyle",
      subtext:
        "Discover neighborhoods, schools, commute times, and communities personalized to your lifestyle.",
      bullets: [
        "Personalized community matching",
        "School & amenity scoring",
        "Commute time analysis",
        "Lifestyle preference mapping",
      ],
    },
    developer: {
      headline: "Let AI Match Your Projects With Investors",
      subtext:
        "Showcase developments, reach qualified investors, and let AI intelligently recommend your projects.",
      bullets: [
        "Intelligent investor matching",
        "AI recommendation badges",
        "Real-time sellout metrics",
        "Payment plan highlights",
      ],
    },
    null: {
      headline: "Dubai's Most Intelligent Real Estate Platform",
      subtext:
        "Powered by AI, trained on millions of DLD transactions. Built for investors, residents, and developers.",
      bullets: [
        "AI-powered market intelligence",
        "Personalized recommendations",
        "Real-time DLD data insights",
        "Smart portfolio management",
      ],
    },
  };

  const c = content[role ?? "null"];

  return (
    <div className="relative flex flex-col justify-between h-full p-10 overflow-hidden">
      <AnimatedOrbs role={role} />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
          <span className="text-slate-900 font-black text-sm">D</span>
        </div>
        <span className="text-white font-bold tracking-tight text-lg">DubaiAI</span>
        <span className="text-amber-400 text-xs font-medium bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full ml-1">
          PRO
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center gap-6 my-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1 mb-4">
            <SparklesIcon />
            <span className="text-amber-400 text-xs font-medium">AI-Powered Intelligence</span>
          </div>
          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-3">
            {c.headline}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">{c.subtext}</p>
        </div>

        {/* Bullets */}
        <div className="space-y-2.5">
          {c.bullets.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
                <CheckIcon />
              </div>
              <span className="text-slate-300 text-sm">{b}</span>
            </div>
          ))}
        </div>

        {/* Floating metric cards */}
        <div className="relative h-40 mt-2">
          {role === "investor" && (
            <>
              <FloatingCard className="top-0 left-0" delay={0}>
                <div className="text-xs text-slate-400">Avg. Rental Yield</div>
                <div className="text-amber-400 font-bold text-lg">7.4%</div>
                <div className="text-green-400 text-xs">↑ +0.3% this month</div>
              </FloatingCard>
              <FloatingCard className="top-4 right-0" delay={0.6}>
                <div className="text-xs text-slate-400">JVC ROI</div>
                <div className="text-white font-bold text-lg">8.2%</div>
                <div className="text-amber-400 text-xs">Top performer</div>
              </FloatingCard>
              <FloatingCard className="bottom-0 left-16" delay={1.2}>
                <div className="text-xs text-slate-400">AI Insights Today</div>
                <div className="text-white font-bold">247 new</div>
              </FloatingCard>
            </>
          )}
          {role === "resident" && (
            <>
              <FloatingCard className="top-0 left-0" delay={0}>
                <div className="text-xs text-slate-400">Dubai Hills</div>
                <div className="text-white font-bold">⭐ 9.2 / 10</div>
                <div className="text-green-400 text-xs">Family-friendly</div>
              </FloatingCard>
              <FloatingCard className="top-4 right-0" delay={0.6}>
                <div className="text-xs text-slate-400">School Rating</div>
                <div className="text-amber-400 font-bold text-lg">A+</div>
                <div className="text-slate-400 text-xs">GEMS nearby</div>
              </FloatingCard>
              <FloatingCard className="bottom-0 left-12" delay={1.2}>
                <div className="text-xs text-slate-400">Commute to DIFC</div>
                <div className="text-white font-bold">18 min</div>
              </FloatingCard>
            </>
          )}
          {role === "developer" && (
            <>
              <FloatingCard className="top-0 left-0" delay={0}>
                <div className="text-xs text-slate-400">Investor Matches</div>
                <div className="text-amber-400 font-bold text-lg">1,240+</div>
                <div className="text-green-400 text-xs">Qualified leads</div>
              </FloatingCard>
              <FloatingCard className="top-4 right-0" delay={0.6}>
                <div className="text-xs text-slate-400">AI Match Score</div>
                <div className="text-white font-bold text-lg">94%</div>
                <div className="text-amber-400 text-xs">Recommendation fit</div>
              </FloatingCard>
              <FloatingCard className="bottom-0 left-12" delay={1.2}>
                <div className="text-xs text-slate-400">Sellout Rate</div>
                <div className="text-green-400 font-bold">87% avg</div>
              </FloatingCard>
            </>
          )}
          {!role && (
            <>
              <FloatingCard className="top-0 left-0" delay={0}>
                <div className="text-xs text-slate-400">DLD Transactions</div>
                <div className="text-amber-400 font-bold text-lg">2.4M+</div>
              </FloatingCard>
              <FloatingCard className="top-4 right-0" delay={0.6}>
                <div className="text-xs text-slate-400">AI Accuracy</div>
                <div className="text-white font-bold">96.8%</div>
              </FloatingCard>
              <FloatingCard className="bottom-0 left-12" delay={1.2}>
                <div className="text-xs text-slate-400">Active Investors</div>
                <div className="text-green-400 font-bold">14,200+</div>
              </FloatingCard>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center gap-4 text-slate-500 text-xs">
        <span>© 2025 DubaiAI</span>
        <span>•</span>
        <span>Privacy</span>
        <span>•</span>
        <span>Terms</span>
      </div>
    </div>
  );
};

// ─── Progress Bar ──────────────────────────────────────────────────────────────

const ProgressBar = ({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label: string;
}) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-2">
      <span className="text-slate-400 text-xs font-medium">{label}</span>
      <span className="text-slate-500 text-xs">
        {current} / {total}
      </span>
    </div>
    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${(current / total) * 100}%` }}
      />
    </div>
  </div>
);

// ─── Input ─────────────────────────────────────────────────────────────────────

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-slate-300 text-sm font-medium">
      {label}
      {required && <span className="text-amber-400 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10 transition-all"
    />
  </div>
);

// ─── Chip ──────────────────────────────────────────────────────────────────────

const Chip = ({
  label,
  selected,
  onClick,
  emoji,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  emoji?: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer",
      selected
        ? "bg-amber-400/15 border-amber-400/60 text-amber-300 shadow-[0_0_12px_hsl(45,85%,55%,0.2)]"
        : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
    )}
  >
    {emoji && <span>{emoji}</span>}
    {label}
    {selected && (
      <span className="ml-auto w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
        <CheckIcon />
      </span>
    )}
  </button>
);

// ─── Select Card ───────────────────────────────────────────────────────────────

const SelectCard = ({
  label,
  description,
  selected,
  onClick,
  emoji,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  emoji?: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "text-left w-full p-4 rounded-xl border transition-all duration-200 cursor-pointer",
      selected
        ? "bg-amber-400/10 border-amber-400/50 shadow-[0_0_16px_hsl(45,85%,55%,0.15)]"
        : "bg-slate-800/40 border-slate-700 hover:border-slate-600"
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {emoji && <span className="text-xl">{emoji}</span>}
        <div>
          <div className={cn("font-medium text-sm", selected ? "text-amber-300" : "text-white")}>
            {label}
          </div>
          {description && (
            <div className="text-slate-500 text-xs mt-0.5">{description}</div>
          )}
        </div>
      </div>
      <div
        className={cn(
          "w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all",
          selected ? "border-amber-400 bg-amber-400" : "border-slate-600"
        )}
      />
    </div>
  </button>
);

// ─── Risk Slider ───────────────────────────────────────────────────────────────

const RiskSlider = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: "conservative" | "balanced" | "aggressive") => void;
}) => {
  const levels = ["conservative", "balanced", "aggressive"] as const;
  const idx = levels.indexOf(value as any);

  const descriptions = {
    conservative: {
      label: "Conservative",
      desc: "Stable established communities with proven yields",
      color: "text-blue-400",
      bg: "bg-blue-400/10 border-blue-400/30",
    },
    balanced: {
      label: "Balanced",
      desc: "Mix of stability and growth opportunities",
      color: "text-amber-400",
      bg: "bg-amber-400/10 border-amber-400/30",
    },
    aggressive: {
      label: "Aggressive",
      desc: "Emerging high-growth, off-plan opportunities",
      color: "text-red-400",
      bg: "bg-red-400/10 border-red-400/30",
    },
  };

  const d = descriptions[value as keyof typeof descriptions] || descriptions.balanced;

  return (
    <div className="space-y-5">
      <div className="flex justify-between text-xs text-slate-500 px-1">
        {levels.map((l) => (
          <span
            key={l}
            className={cn(
              "capitalize font-medium",
              value === l ? d.color : "text-slate-600"
            )}
          >
            {l}
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={2}
          value={idx}
          onChange={(e) => onChange(levels[+e.target.value])}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, hsl(45,85%,55%) 0%, hsl(45,85%,55%) ${(idx / 2) * 100}%, hsl(220,15%,25%) ${(idx / 2) * 100}%, hsl(220,15%,25%) 100%)`,
          }}
        />
      </div>
      <div className={cn("p-4 rounded-xl border", d.bg)}>
        <div className={cn("font-semibold text-sm mb-1", d.color)}>{d.label} Profile</div>
        <div className="text-slate-400 text-xs">{d.desc}</div>
      </div>
    </div>
  );
};

// ─── AI Summary Card ───────────────────────────────────────────────────────────

const AISummaryCard = ({
  title,
  summary,
  priorities,
  suggestions,
  onContinue,
}: {
  title: string;
  summary: string;
  priorities: string[];
  suggestions: { name: string; tag: string }[];
  onContinue: () => void;
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 mb-4 shadow-[0_0_30px_hsl(45,85%,55%,0.2)]">
        <SparklesIcon />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
    </div>

    {/* Summary */}
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-amber-400 text-xs font-medium">AI Profile Summary</span>
      </div>
      <p className="text-slate-200 text-sm leading-relaxed italic">"{summary}"</p>
    </div>

    {/* Priorities */}
    <div>
      <div className="text-slate-400 text-xs font-medium mb-3">AI will prioritize:</div>
      <div className="space-y-2">
        {priorities.map((p, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-green-400/20 border border-green-400/30 flex items-center justify-center flex-shrink-0">
              <CheckIcon />
            </div>
            <span className="text-slate-300 text-sm">{p}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Suggested */}
    {suggestions.length > 0 && (
      <div>
        <div className="text-slate-400 text-xs font-medium mb-3">Suggested for you:</div>
        <div className="grid grid-cols-3 gap-2">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-center"
            >
              <div className="text-white font-medium text-sm">{s.name}</div>
              <div className="text-amber-400 text-xs mt-0.5">{s.tag}</div>
            </div>
          ))}
        </div>
      </div>
    )}

    <button
      onClick={onContinue}
      className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold py-3.5 rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all duration-200 shadow-[0_4px_20px_hsl(45,85%,55%,0.35)] hover:shadow-[0_8px_30px_hsl(45,85%,55%,0.45)] flex items-center justify-center gap-2"
    >
      Go to Dashboard
      <ArrowRightIcon />
    </button>
  </div>
);

// ─── INVESTOR STEPS ────────────────────────────────────────────────────────────

const InvestorStep1 = ({
  data,
  onChange,
}: {
  data: Partial<InvestorProfile>;
  onChange: (d: Partial<InvestorProfile>) => void;
}) => (
  <div className="space-y-4">
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Create Your Account</h2>
      <p className="text-slate-400 text-sm">Let's start with the basics.</p>
    </div>

    <button className="w-full flex items-center justify-center gap-3 bg-slate-800/60 border border-slate-700 rounded-xl py-3 text-white text-sm font-medium hover:border-slate-600 transition-all">
      <GoogleIcon />
      Continue with Google
    </button>

    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-slate-800" />
      <span className="text-slate-600 text-xs">or</span>
      <div className="flex-1 h-px bg-slate-800" />
    </div>

    <Input
      label="Full Name"
      value={data.fullName || ""}
      onChange={(v) => onChange({ fullName: v })}
      placeholder="Ahmed Al Mansouri"
      required
    />
    <Input
      label="Email"
      type="email"
      value={data.email || ""}
      onChange={(v) => onChange({ email: v })}
      placeholder="ahmed@email.com"
      required
    />
    <Input
      label="Password"
      type="password"
      value={data.password || ""}
      onChange={(v) => onChange({ password: v })}
      placeholder="Minimum 8 characters"
      required
    />
    <Input
      label="Country of Residence"
      value={data.country || ""}
      onChange={(v) => onChange({ country: v })}
      placeholder="United Arab Emirates"
    />
  </div>
);

const InvestorStep2 = ({
  data,
  onChange,
}: {
  data: Partial<InvestorProfile>;
  onChange: (d: Partial<InvestorProfile>) => void;
}) => {
  const options = [
    { label: "Rental income", emoji: "💰" },
    { label: "Long-term appreciation", emoji: "📈" },
    { label: "Flipping / short-term gains", emoji: "🔄" },
    { label: "Golden Visa", emoji: "🏅" },
    { label: "Diversification", emoji: "🧩" },
    { label: "Off-plan opportunities", emoji: "🏗️" },
    { label: "Passive income", emoji: "💤" },
    { label: "Luxury properties", emoji: "✨" },
    { label: "Vacation homes", emoji: "🏖️" },
  ];

  const toggle = (label: string) => {
    const g = data.goals || [];
    onChange({ goals: g.includes(label) ? g.filter((x) => x !== label) : [...g, label] });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Investment Goals</h2>
        <p className="text-slate-400 text-sm">What are you primarily investing for? Select all that apply.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip
            key={o.label}
            label={o.label}
            emoji={o.emoji}
            selected={(data.goals || []).includes(o.label)}
            onClick={() => toggle(o.label)}
          />
        ))}
      </div>
    </div>
  );
};

const InvestorStep3 = ({
  data,
  onChange,
}: {
  data: Partial<InvestorProfile>;
  onChange: (d: Partial<InvestorProfile>) => void;
}) => {
  const budgets = ["Under AED 500K", "500K–1M", "1M–3M", "3M–10M", "10M+"];
  const financing = ["Cash buyer", "Mortgage", "Exploring financing"];
  const horizons = ["< 1 year", "1–3 years", "3–5 years", "5+ years"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Budget & Financial Profile</h2>
        <p className="text-slate-400 text-sm">Help AI calibrate the right opportunities for you.</p>
      </div>

      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Budget Range</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {budgets.map((b) => (
            <SelectCard
              key={b}
              label={b}
              selected={data.budgetRange === b}
              onClick={() => onChange({ budgetRange: b })}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Financing Preference</div>
        <div className="space-y-2">
          {financing.map((f) => (
            <SelectCard
              key={f}
              label={f}
              selected={data.financing === f}
              onClick={() => onChange({ financing: f })}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Investment Horizon</div>
        <div className="grid grid-cols-2 gap-2">
          {horizons.map((h) => (
            <SelectCard
              key={h}
              label={h}
              selected={data.horizon === h}
              onClick={() => onChange({ horizon: h })}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const InvestorStep4 = ({
  data,
  onChange,
}: {
  data: Partial<InvestorProfile>;
  onChange: (d: Partial<InvestorProfile>) => void;
}) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Risk Profile</h2>
      <p className="text-slate-400 text-sm">What type of opportunities are you comfortable with?</p>
    </div>
    <RiskSlider
      value={data.riskProfile || "balanced"}
      onChange={(v) => onChange({ riskProfile: v })}
    />
  </div>
);

const InvestorStep5 = ({
  data,
  onChange,
}: {
  data: Partial<InvestorProfile>;
  onChange: (d: Partial<InvestorProfile>) => void;
}) => {
  const areas = ["Dubai Marina", "JVC", "Business Bay", "Downtown Dubai", "Arjan", "Dubai Hills", "Dubai South", "Palm Jumeirah", "DIFC"];
  const propTypes = ["Apartment", "Villa", "Townhouse", "Commercial", "Office", "Hotel Apartment"];
  const bedrooms = ["Studio", "1BR", "2BR", "3BR+", "Flexible"];

  const toggleArea = (a: string) => {
    const arr = data.preferredAreas || [];
    onChange({ preferredAreas: arr.includes(a) ? arr.filter((x) => x !== a) : [...arr, a] });
  };
  const toggleProp = (a: string) => {
    const arr = data.propertyTypes || [];
    onChange({ propertyTypes: arr.includes(a) ? arr.filter((x) => x !== a) : [...arr, a] });
  };
  const toggleBed = (a: string) => {
    const arr = data.bedrooms || [];
    onChange({ bedrooms: arr.includes(a) ? arr.filter((x) => x !== a) : [...arr, a] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Area & Property Preferences</h2>
        <p className="text-slate-400 text-sm">Where and what would you like to invest in?</p>
      </div>

      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Preferred Communities</div>
        <div className="flex flex-wrap gap-2">
          {areas.map((a) => (
            <Chip key={a} label={a} selected={(data.preferredAreas || []).includes(a)} onClick={() => toggleArea(a)} />
          ))}
        </div>
      </div>

      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Property Types</div>
        <div className="flex flex-wrap gap-2">
          {propTypes.map((a) => (
            <Chip key={a} label={a} selected={(data.propertyTypes || []).includes(a)} onClick={() => toggleProp(a)} />
          ))}
        </div>
      </div>

      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Bedroom Preference</div>
        <div className="flex flex-wrap gap-2">
          {bedrooms.map((a) => (
            <Chip key={a} label={a} selected={(data.bedrooms || []).includes(a)} onClick={() => toggleBed(a)} />
          ))}
        </div>
      </div>
    </div>
  );
};

const InvestorStep6 = ({
  data,
  onChange,
}: {
  data: Partial<InvestorProfile>;
  onChange: (d: Partial<InvestorProfile>) => void;
}) => {
  const helpers = [
    { label: "Find undervalued communities", emoji: "🔍" },
    { label: "Predict future appreciation", emoji: "🔮" },
    { label: "Compare projects", emoji: "⚖️" },
    { label: "Explain market trends", emoji: "📊" },
    { label: "Detect investment risks", emoji: "⚠️" },
    { label: "Send weekly opportunities", emoji: "📬" },
    { label: "Alert me about launches", emoji: "🚀" },
    { label: "Explain neighborhoods", emoji: "🗺️" },
  ];

  const toggle = (label: string) => {
    const a = data.aiHelpers || [];
    onChange({ aiHelpers: a.includes(label) ? a.filter((x) => x !== label) : [...a, label] });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">AI Personalization</h2>
        <p className="text-slate-400 text-sm">How would you like the AI to help you? Select all that apply.</p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {helpers.map((h) => (
          <SelectCard
            key={h.label}
            label={h.label}
            emoji={h.emoji}
            selected={(data.aiHelpers || []).includes(h.label)}
            onClick={() => toggle(h.label)}
          />
        ))}
      </div>
    </div>
  );
};

const InvestorStep7 = ({
  data,
  onContinue,
}: {
  data: Partial<InvestorProfile>;
  onContinue: () => void;
}) => {
  const riskLabel = data.riskProfile || "balanced";
  const goals = data.goals?.slice(0, 2).join(" and ") || "investment growth";
  const budget = data.budgetRange || "flexible budget";
  const summary = `You are a ${riskLabel} investor focused on ${goals} with a budget of ${budget}. AI will prioritize the most fitting opportunities for your financial goals.`;

  return (
    <AISummaryCard
      title="Your AI Investor Profile Is Ready"
      summary={summary}
      priorities={["High-yield communities", "Stable appreciation areas", "Strong off-plan opportunities"]}
      suggestions={[
        { name: "JVC", tag: "8.2% yield" },
        { name: "Arjan", tag: "High growth" },
        { name: "Dubai South", tag: "Off-plan" },
      ]}
      onContinue={onContinue}
    />
  );
};

// ─── RESIDENT STEPS ────────────────────────────────────────────────────────────

const ResidentStep2 = ({
  data,
  onChange,
}: {
  data: Partial<ResidentProfile>;
  onChange: (d: Partial<ResidentProfile>) => void;
}) => {
  const options = [
    { label: "Buy a home", emoji: "🏠", desc: "Looking to purchase a property" },
    { label: "Rent a home", emoji: "🔑", desc: "Find a rental that fits my needs" },
    { label: "Relocating to Dubai", emoji: "✈️", desc: "Moving from another country" },
    { label: "Upgrade lifestyle", emoji: "⬆️", desc: "Upgrade to a better community" },
    { label: "Family move", emoji: "👨‍👩‍👧‍👦", desc: "Moving as a family unit" },
  ];
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Home Search Purpose</h2>
        <p className="text-slate-400 text-sm">Why are you searching?</p>
      </div>
      <div className="space-y-2">
        {options.map((o) => (
          <SelectCard
            key={o.label}
            label={o.label}
            description={o.desc}
            emoji={o.emoji}
            selected={data.searchPurpose === o.label}
            onClick={() => onChange({ searchPurpose: o.label })}
          />
        ))}
      </div>
    </div>
  );
};

const ResidentStep3 = ({
  data,
  onChange,
}: {
  data: Partial<ResidentProfile>;
  onChange: (d: Partial<ResidentProfile>) => void;
}) => {
  const options = [
    { label: "Single", emoji: "🧑", desc: "Just myself" },
    { label: "Couple", emoji: "👫", desc: "Me and my partner" },
    { label: "Family with kids", emoji: "👨‍👩‍👧‍👦", desc: "Family household" },
  ];
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Household Profile</h2>
        <p className="text-slate-400 text-sm">Who will be living in the new home?</p>
      </div>
      <div className="space-y-3">
        {options.map((o) => (
          <SelectCard
            key={o.label}
            label={o.label}
            description={o.desc}
            emoji={o.emoji}
            selected={data.householdType === o.label}
            onClick={() => onChange({ householdType: o.label })}
          />
        ))}
      </div>
    </div>
  );
};

const ResidentStep4 = ({
  data,
  onChange,
}: {
  data: Partial<ResidentProfile>;
  onChange: (d: Partial<ResidentProfile>) => void;
}) => {
  const tags = [
    { label: "Quiet communities", emoji: "🌿" },
    { label: "Luxury lifestyle", emoji: "💎" },
    { label: "Near downtown", emoji: "🏙️" },
    { label: "Beach access", emoji: "🏖️" },
    { label: "Family-friendly", emoji: "👨‍👩‍👧" },
    { label: "Walkability", emoji: "🚶" },
    { label: "Nightlife", emoji: "🌙" },
    { label: "Green spaces", emoji: "🌳" },
    { label: "Pet-friendly", emoji: "🐕" },
    { label: "Near metro", emoji: "🚇" },
  ];
  const toggle = (l: string) => {
    const a = data.lifestylePrefs || [];
    onChange({ lifestylePrefs: a.includes(l) ? a.filter((x) => x !== l) : [...a, l] });
  };
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Lifestyle Preferences</h2>
        <p className="text-slate-400 text-sm">What matters most to your lifestyle? Select all that apply.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <Chip key={t.label} label={t.label} emoji={t.emoji} selected={(data.lifestylePrefs || []).includes(t.label)} onClick={() => toggle(t.label)} />
        ))}
      </div>
    </div>
  );
};

const ResidentStep5 = ({
  data,
  onChange,
}: {
  data: Partial<ResidentProfile>;
  onChange: (d: Partial<ResidentProfile>) => void;
}) => {
  const allFactors = ["Price", "Schools", "Commute", "Metro access", "Safety", "Amenities", "Community vibe"];
  const factors = data.priorityFactors || allFactors;

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...factors];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    onChange({ priorityFactors: arr });
  };
  const moveDown = (idx: number) => {
    if (idx === factors.length - 1) return;
    const arr = [...factors];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    onChange({ priorityFactors: arr });
  };

  useEffect(() => {
    if (!data.priorityFactors) onChange({ priorityFactors: allFactors });
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Priority Ranking</h2>
        <p className="text-slate-400 text-sm">Rank what matters most to you — drag or use arrows to reorder.</p>
      </div>
      <div className="space-y-2">
        {factors.map((f, i) => (
          <div
            key={f}
            className="flex items-center gap-3 bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-3"
          >
            <span className="text-amber-400 font-bold text-sm w-5 text-center">{i + 1}</span>
            <span className="text-white text-sm flex-1">{f}</span>
            <div className="flex gap-1">
              <button onClick={() => moveUp(i)} className="text-slate-500 hover:text-white p-1 transition-colors" disabled={i === 0}>▲</button>
              <button onClick={() => moveDown(i)} className="text-slate-500 hover:text-white p-1 transition-colors" disabled={i === factors.length - 1}>▼</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResidentStep6 = ({
  data,
  onChange,
}: {
  data: Partial<ResidentProfile>;
  onChange: (d: Partial<ResidentProfile>) => void;
}) => {
  const areas = ["DIFC", "Dubai Marina", "Business Bay", "Deira", "JLT", "Al Barsha", "Jumeirah", "Ras Al Khaimah"];
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Workplace Location</h2>
        <p className="text-slate-400 text-sm">Where do you usually work or commute to?</p>
      </div>
      <Input
        label="Work area / office location"
        value={data.workLocation || ""}
        onChange={(v) => onChange({ workLocation: v })}
        placeholder="e.g. DIFC, Business Bay..."
      />
      <div className="flex flex-wrap gap-2 mt-1">
        {areas.map((a) => (
          <button
            key={a}
            onClick={() => onChange({ workLocation: a })}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs border transition-all",
              data.workLocation === a
                ? "bg-amber-400/15 border-amber-400/40 text-amber-300"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
            )}
          >
            {a}
          </button>
        ))}
      </div>
    </div>
  );
};

const ResidentStep7 = ({
  data,
  onContinue,
}: {
  data: Partial<ResidentProfile>;
  onContinue: () => void;
}) => {
  const prefs = data.lifestylePrefs?.slice(0, 2).join(" and ") || "lifestyle preferences";
  const household = data.householdType || "your household";
  const summary = `Based on your preference for ${prefs}, your AI profile is optimized for ${household} living. We will prioritize communities that match your unique lifestyle and commute needs.`;
  return (
    <AISummaryCard
      title="Your AI Lifestyle Profile Is Ready"
      summary={summary}
      priorities={["Family-friendly communities", "Parks & green space access", "School proximity scoring"]}
      suggestions={[
        { name: "Dubai Hills", tag: "Top-rated" },
        { name: "Arabian Ranches", tag: "Family community" },
        { name: "Jumeirah", tag: "Beach access" },
      ]}
      onContinue={onContinue}
    />
  );
};

// ─── SHARED TRUST COMPONENTS ──────────────────────────────────────────────────

const TrustBanner = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/60 rounded-xl px-4 py-2.5">
    <span className="text-green-400 flex-shrink-0"><ShieldCheckIcon /></span>
    <span className="text-slate-400 text-xs">{text}</span>
  </div>
);

const EncryptedBadge = () => (
  <div className="inline-flex items-center gap-1.5 text-slate-500 text-xs">
    <LockIcon />
    <span>256-bit encrypted · Documents stored securely</span>
  </div>
);

const VerificationBadge = ({
  label,
  status,
}: {
  label: string;
  status: "pending" | "verified" | "checking";
}) => (
  <div className={cn(
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium",
    status === "verified" ? "bg-green-400/10 border-green-400/30 text-green-400" :
    status === "checking" ? "bg-amber-400/10 border-amber-400/30 text-amber-400" :
    "bg-slate-800 border-slate-700 text-slate-500"
  )}>
    {status === "verified" && <CheckIcon />}
    {status === "checking" && <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />}
    {status === "pending" && <div className="w-2 h-2 rounded-full bg-slate-600" />}
    {label}
  </div>
);

const DocUploadRow = ({
  label,
  hint,
  required: isRequired = false,
  uploaded,
  onToggle,
  aiExtracted,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  uploaded: boolean;
  onToggle: () => void;
  aiExtracted?: string;
}) => (
  <div className={cn(
    "rounded-xl border p-4 transition-all duration-200 cursor-pointer",
    uploaded
      ? "bg-green-400/5 border-green-400/30"
      : "bg-slate-800/40 border-slate-700 hover:border-slate-600"
  )} onClick={onToggle}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium", uploaded ? "text-green-300" : "text-white")}>
            {label}
          </span>
          {isRequired && !uploaded && <span className="text-amber-400 text-xs">Required</span>}
          {uploaded && <VerificationBadge label="Uploaded" status="verified" />}
        </div>
        {hint && <div className="text-slate-500 text-xs mt-0.5">{hint}</div>}
        {uploaded && aiExtracted && (
          <div className="mt-2 flex items-center gap-2 bg-amber-400/8 border border-amber-400/20 rounded-lg px-3 py-2">
            <SparklesIcon />
            <span className="text-amber-300 text-xs">{aiExtracted}</span>
          </div>
        )}
      </div>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
        uploaded ? "bg-green-400/15 text-green-400" : "bg-slate-700 text-slate-400"
      )}>
        {uploaded ? <CheckIcon /> : <UploadIcon />}
      </div>
    </div>
    {!uploaded && (
      <div className="mt-3 flex items-center gap-2 text-slate-600 text-xs">
        <ScanIcon />
        <span>AI will auto-extract details · Click to upload</span>
      </div>
    )}
  </div>
);

const ReviewTimeline = ({
  steps,
  title,
  subtitle,
}: {
  steps: { label: string; status: "done" | "active" | "pending" }[];
  title: string;
  subtitle: string;
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 mb-4 shadow-[0_0_30px_hsl(45,85%,55%,0.15)]">
        <div className="w-6 h-6 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" style={{ borderWidth: "3px" }} />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-slate-400 text-sm">{subtitle}</p>
    </div>

    <div className="space-y-0">
      {steps.map((s, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
              s.status === "done" ? "bg-green-400/20 border-green-400 text-green-400" :
              s.status === "active" ? "bg-amber-400/20 border-amber-400 text-amber-400" :
              "bg-slate-800 border-slate-700 text-slate-600"
            )}>
              {s.status === "done" ? <CheckIcon /> :
               s.status === "active" ? <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> :
               <div className="w-2 h-2 rounded-full bg-slate-600" />}
            </div>
            {i < steps.length - 1 && (
              <div className={cn("w-px flex-1 my-1", s.status === "done" ? "bg-green-400/30" : "bg-slate-800")} style={{ minHeight: "24px" }} />
            )}
          </div>
          <div className="pb-6 flex-1">
            <span className={cn(
              "text-sm font-medium",
              s.status === "done" ? "text-green-300" :
              s.status === "active" ? "text-amber-300" :
              "text-slate-600"
            )}>{s.label}</span>
            {s.status === "active" && (
              <div className="mt-1 text-xs text-slate-500">In progress · AI-assisted review</div>
            )}
          </div>
        </div>
      ))}
    </div>

    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-start gap-3">
      <ClockIcon />
      <div>
        <div className="text-white text-sm font-medium">Estimated: Within 24 hours</div>
        <div className="text-slate-500 text-xs mt-0.5">You'll receive an email once your verification is complete.</div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2">
      <TrustBanner text="Manual compliance review" />
      <TrustBanner text="Trusted professional network" />
    </div>
  </div>
);

// ─── DEV SUB-ROLE SELECTOR ────────────────────────────────────────────────────

const DevSubRoleSelection = ({ onSelect }: { onSelect: (r: DevSubRole) => void }) => {
  const [hovered, setHovered] = useState<DevSubRole>(null);

  const subRoles = [
    {
      id: "agent" as const,
      icon: <BadgeCheckIcon />,
      title: "Licensed Agent",
      desc: "Join as a verified real estate broker or agent.",
      badges: ["BRN verified", "Company verified", "Trusted listings"],
      color: "from-blue-400/15 to-blue-600/5",
      border: "group-hover:border-blue-400/40",
      glow: "group-hover:shadow-[0_0_24px_hsl(200,80%,50%,0.12)]",
      iconBg: "bg-blue-400/15 text-blue-400",
      badgeColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    },
    {
      id: "agency" as const,
      icon: <BuildingIcon />,
      title: "Real Estate Agency",
      desc: "Manage agents, listings, and investor leads under one verified company account.",
      badges: ["ORN verified", "Trade license verified", "Agency profile verified"],
      color: "from-amber-400/15 to-amber-600/5",
      border: "group-hover:border-amber-400/40",
      glow: "group-hover:shadow-[0_0_24px_hsl(45,85%,55%,0.12)]",
      iconBg: "bg-amber-400/15 text-amber-400",
      badgeColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    },
    {
      id: "developer_company" as const,
      icon: <LandmarkIcon />,
      title: "Developer Company",
      desc: "Showcase projects and connect with qualified investors through AI-powered matching.",
      badges: ["Developer verified", "Official rep. verified", "Project authenticity"],
      color: "from-emerald-400/15 to-emerald-600/5",
      border: "group-hover:border-emerald-400/40",
      glow: "group-hover:shadow-[0_0_24px_hsl(160,75%,35%,0.12)]",
      iconBg: "bg-emerald-400/15 text-emerald-400",
      badgeColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-3 py-1 mb-4">
          <ShieldIcon />
          <span className="text-slate-300 text-xs font-medium">Verified Professional Platform</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">How do you operate in the market?</h2>
        <p className="text-slate-400 text-sm">All professionals are verified before gaining platform access.</p>
      </div>

      <div className="space-y-3">
        {subRoles.map((r) => (
          <button
            key={r.id}
            className={cn(
              "group w-full text-left p-5 rounded-2xl border border-slate-700 bg-gradient-to-br transition-all duration-300 cursor-pointer",
              r.color, r.border, r.glow
            )}
            onMouseEnter={() => setHovered(r.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(r.id)}
          >
            <div className="flex items-start gap-4">
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", r.iconBg)}>
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-base mb-1">{r.title}</div>
                <div className="text-slate-400 text-sm leading-relaxed mb-3">{r.desc}</div>
                <div className="flex flex-wrap gap-1.5">
                  {r.badges.map((b) => (
                    <span key={b} className={cn("inline-flex items-center gap-1 text-xs border rounded-full px-2 py-0.5", r.badgeColor)}>
                      <CheckIcon /> {b}
                    </span>
                  ))}
                </div>
              </div>
              <div className={cn("flex-shrink-0 text-slate-600 transition-all duration-200 mt-1", hovered === r.id ? "text-white translate-x-1" : "")}>
                <ArrowRightIcon />
              </div>
            </div>
          </button>
        ))}
      </div>

      <TrustBanner text="This platform verifies real estate professionals before granting access. Verification prevents impersonation and protects investors." />
    </div>
  );
};

// ─── AGENT STEPS ──────────────────────────────────────────────────────────────

const AgentStep1 = ({ data, onChange }: { data: Partial<AgentProfile>; onChange: (d: Partial<AgentProfile>) => void }) => {
  const isFreeEmail = (data.email || "").match(/@(gmail|yahoo|hotmail|outlook)\./i);
  return (
    <div className="space-y-4">
      <div>
        <div className="inline-flex items-center gap-2 bg-blue-400/10 border border-blue-400/20 rounded-full px-3 py-1 mb-3">
          <BadgeCheckIcon />
          <span className="text-blue-400 text-xs font-medium">Licensed Agent Verification</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Create Your Professional Account</h2>
        <p className="text-slate-400 text-sm">Use your professional credentials for faster verification.</p>
      </div>

      <button className="w-full flex items-center justify-center gap-3 bg-slate-800/60 border border-slate-700 rounded-xl py-3 text-white text-sm font-medium hover:border-slate-600 transition-all">
        <GoogleIcon /> Continue with Google
      </button>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-slate-600 text-xs">or</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <Input label="Full Legal Name" value={data.fullName || ""} onChange={(v) => onChange({ fullName: v })} placeholder="As on your RERA card" required />
      <div>
        <Input label="Work Email" type="email" value={data.email || ""} onChange={(v) => onChange({ email: v })} placeholder="name@agency.ae" required />
        {isFreeEmail && (
          <div className="mt-2 flex items-center gap-2 bg-amber-400/8 border border-amber-400/20 rounded-lg px-3 py-2">
            <span className="text-amber-400 text-xs">⚡ For faster verification, use your company email.</span>
          </div>
        )}
      </div>
      <Input label="Mobile Number" value={data.mobile || ""} onChange={(v) => onChange({ mobile: v })} placeholder="+971 50 000 0000" required />
      <Input label="Password" type="password" value={data.password || ""} onChange={(v) => onChange({ password: v })} placeholder="Minimum 8 characters" required />
      <Input label="Country" value={data.country || ""} onChange={(v) => onChange({ country: v })} placeholder="United Arab Emirates" />
    </div>
  );
};

const AgentStep2 = ({ data, onChange }: { data: Partial<AgentProfile>; onChange: (d: Partial<AgentProfile>) => void }) => {
  const markets = ["Dubai", "Abu Dhabi", "Sharjah", "Ras Al Khaimah", "Northern Emirates"];
  const experiences = ["< 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"];
  const toggleMarket = (m: string) => {
    const a = data.markets || [];
    onChange({ markets: a.includes(m) ? a.filter((x) => x !== m) : [...a, m] });
  };
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Verify Your Real Estate License</h2>
        <p className="text-slate-400 text-sm">Your broker license helps us protect investors and prevent impersonation.</p>
      </div>
      <TrustBanner text="BRN validation cross-references the RERA public registry." />
      <Input label="BRN / Broker Registration Number" value={data.brn || ""} onChange={(v) => onChange({ brn: v })} placeholder="e.g. 12345" required />
      <Input label="Agency / Company Name" value={data.agencyName || ""} onChange={(v) => onChange({ agencyName: v })} placeholder="e.g. Betterhomes" required />
      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Years of Experience</div>
        <div className="grid grid-cols-2 gap-2">
          {experiences.map((e) => (
            <SelectCard key={e} label={e} selected={data.experience === e} onClick={() => onChange({ experience: e })} />
          ))}
        </div>
      </div>
      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Primary Markets</div>
        <div className="flex flex-wrap gap-2">
          {markets.map((m) => (
            <Chip key={m} label={m} selected={(data.markets || []).includes(m)} onClick={() => toggleMarket(m)} />
          ))}
        </div>
      </div>
    </div>
  );
};

const AgentStep3 = ({ data, onChange }: { data: Partial<AgentProfile>; onChange: (d: Partial<AgentProfile>) => void }) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Document Verification</h2>
      <p className="text-slate-400 text-sm">Upload required credentials. AI will auto-extract key details.</p>
    </div>

    <div className="space-y-3">
      <DocUploadRow
        label="RERA Broker Card / DARI License"
        hint="Front and back · PDF or image"
        required
        uploaded={!!data.licenseUploaded}
        onToggle={() => onChange({ licenseUploaded: !data.licenseUploaded })}
        aiExtracted={data.licenseUploaded ? "AI detected: BRN 12345 · RERA Dubai · Exp. 12/2025" : undefined}
      />
      <DocUploadRow
        label="Employment Proof / Company ID"
        hint="HR letter or official company ID"
        required
        uploaded={!!data.employmentUploaded}
        onToggle={() => onChange({ employmentUploaded: !data.employmentUploaded })}
        aiExtracted={data.employmentUploaded ? "AI detected: Betterhomes LLC · Active employee" : undefined}
      />
      <DocUploadRow
        label="Emirates ID (Optional)"
        hint="Speeds up identity verification"
        uploaded={!!data.emiratesIdUploaded}
        onToggle={() => onChange({ emiratesIdUploaded: !data.emiratesIdUploaded })}
      />
    </div>

    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2">
      <div className="text-slate-400 text-xs font-medium mb-2">Verification Checklist</div>
      {[
        { label: "License uploaded", done: !!data.licenseUploaded },
        { label: "Company association uploaded", done: !!data.employmentUploaded },
        { label: "Identity review pending", done: false },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0", item.done ? "bg-green-400/20 border-green-400 text-green-400" : "border-slate-600")}>
            {item.done && <CheckIcon />}
          </div>
          <span className={cn("text-xs", item.done ? "text-green-300" : "text-slate-500")}>{item.label}</span>
        </div>
      ))}
    </div>
    <EncryptedBadge />
  </div>
);

const AgentStep4 = ({ data, onChange }: { data: Partial<AgentProfile>; onChange: (d: Partial<AgentProfile>) => void }) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Identity Confirmation</h2>
      <p className="text-slate-400 text-sm">To protect investors and prevent impersonation, we verify that your identity matches your professional documents.</p>
    </div>

    <div
      className={cn(
        "relative rounded-2xl border-2 p-8 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300",
        data.selfieVerified
          ? "border-green-400/50 bg-green-400/5 shadow-[0_0_30px_hsl(160,75%,35%,0.12)]"
          : "border-slate-700 bg-slate-800/30 hover:border-amber-400/30"
      )}
      onClick={() => onChange({ selfieVerified: !data.selfieVerified })}
    >
      {/* Face scan ring */}
      <div className="relative">
        <div className={cn(
          "w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all duration-500",
          data.selfieVerified
            ? "border-green-400 bg-green-400/10 shadow-[0_0_40px_hsl(160,75%,35%,0.3)]"
            : "border-amber-400/40 bg-slate-800 shadow-[0_0_20px_hsl(45,85%,55%,0.1)] animate-pulse"
        )}>
          {data.selfieVerified ? (
            <div className="text-green-400 scale-150"><CheckIcon /></div>
          ) : (
            <div className="text-slate-400"><CameraIcon /></div>
          )}
        </div>
        {/* Corner scan brackets */}
        {!data.selfieVerified && (
          <>
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-400/60 rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-400/60 rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-400/60 rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-400/60 rounded-br-sm" />
          </>
        )}
      </div>
      <div className="text-center">
        <div className={cn("font-semibold text-sm", data.selfieVerified ? "text-green-300" : "text-white")}>
          {data.selfieVerified ? "Identity Confirmed" : "Take Verification Selfie"}
        </div>
        <div className="text-slate-500 text-xs mt-1">
          {data.selfieVerified ? "Face matched to professional documents." : "Biometric match · AI-powered · Click to simulate capture"}
        </div>
      </div>
      {!data.selfieVerified && (
        <div className="flex gap-3">
          <VerificationBadge label="Face match" status="pending" />
          <VerificationBadge label="Liveness check" status="pending" />
        </div>
      )}
      {data.selfieVerified && (
        <div className="flex gap-3">
          <VerificationBadge label="Face match" status="verified" />
          <VerificationBadge label="Liveness check" status="verified" />
        </div>
      )}
    </div>

    <TrustBanner text="Biometric data is never stored. Used only for one-time identity confirmation." />
  </div>
);

const AgentStep5 = ({ data, onChange }: { data: Partial<AgentProfile>; onChange: (d: Partial<AgentProfile>) => void }) => {
  const specs = ["Luxury", "Off-plan", "Investment advisory", "Commercial", "Family homes", "Waterfront", "Ultra luxury"];
  const areas = ["Dubai Marina", "Downtown", "Palm Jumeirah", "JVC", "Business Bay", "Dubai Hills", "DIFC", "Arjan"];
  const langs = ["English", "Arabic", "Hindi", "Urdu", "Russian", "French", "Chinese"];
  const clients = ["Individual investors", "Institutional", "End-users", "International buyers", "HNW families"];

  const toggle = (key: keyof AgentProfile, val: string) => {
    const a = (data[key] as string[]) || [];
    onChange({ [key]: a.includes(val) ? a.filter((x) => x !== val) : [...a, val] } as any);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Professional Profile</h2>
        <p className="text-slate-400 text-sm">Help clients and AI understand your expertise.</p>
      </div>
      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Specializations</div>
        <div className="flex flex-wrap gap-2">
          {specs.map((s) => <Chip key={s} label={s} selected={(data.specializations || []).includes(s)} onClick={() => toggle("specializations", s)} />)}
        </div>
      </div>
      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Areas Served</div>
        <div className="flex flex-wrap gap-2">
          {areas.map((a) => <Chip key={a} label={a} selected={(data.areasServed || []).includes(a)} onClick={() => toggle("areasServed", a)} />)}
        </div>
      </div>
      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Languages</div>
        <div className="flex flex-wrap gap-2">
          {langs.map((l) => <Chip key={l} label={l} selected={(data.languages || []).includes(l)} onClick={() => toggle("languages", l)} />)}
        </div>
      </div>
      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Client Types</div>
        <div className="flex flex-wrap gap-2">
          {clients.map((c) => <Chip key={c} label={c} selected={(data.clientTypes || []).includes(c)} onClick={() => toggle("clientTypes", c)} />)}
        </div>
      </div>
    </div>
  );
};

const AgentStep6 = ({ onContinue }: { onContinue: () => void }) => (
  <ReviewTimeline
    title="Your Verification Is Under Review"
    subtitle="Our compliance team is validating your credentials. You'll be notified by email."
    steps={[
      { label: "Documents submitted", status: "done" },
      { label: "Compliance review", status: "active" },
      { label: "License validation (RERA)", status: "pending" },
      { label: "Company association verification", status: "pending" },
      { label: "Approval & profile activation", status: "pending" },
    ]}
  />
);

// ─── AGENCY STEPS ─────────────────────────────────────────────────────────────

const AgencyStep1 = ({ data, onChange }: { data: Partial<AgencyProfile>; onChange: (d: Partial<AgencyProfile>) => void }) => {
  const emailDomain = (data.email || "").split("@")[1];
  const websiteDomain = (data.website || "").replace(/https?:\/\//, "").split("/")[0];
  const domainMatch = emailDomain && websiteDomain && emailDomain === websiteDomain;
  return (
    <div className="space-y-4">
      <div>
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1 mb-3">
          <BuildingIcon />
          <span className="text-amber-400 text-xs font-medium">Agency Verification</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Company Identity</h2>
        <p className="text-slate-400 text-sm">We'll verify your agency's registration and trading credentials.</p>
      </div>
      <Input label="Legal Company Name" value={data.companyName || ""} onChange={(v) => onChange({ companyName: v })} placeholder="e.g. Betterhomes LLC" required />
      <Input label="ORN Number" value={data.orn || ""} onChange={(v) => onChange({ orn: v })} placeholder="e.g. 12345" required />
      <Input label="Trade License Number" value={data.tradeLicense || ""} onChange={(v) => onChange({ tradeLicense: v })} placeholder="e.g. DED-12345" required />
      <div>
        <Input label="Official Company Email" type="email" value={data.email || ""} onChange={(v) => onChange({ email: v })} placeholder="info@agency.ae" required />
      </div>
      <div>
        <Input label="Company Website" value={data.website || ""} onChange={(v) => onChange({ website: v })} placeholder="https://agency.ae" />
        {domainMatch && (
          <div className="mt-2 flex items-center gap-2">
            <VerificationBadge label="Domain matches email — faster verification" status="verified" />
          </div>
        )}
      </div>
      <Input label="Office Location" value={data.officeLocation || ""} onChange={(v) => onChange({ officeLocation: v })} placeholder="e.g. Business Bay, Dubai" />
    </div>
  );
};

const AgencyStep2 = ({ data, onChange }: { data: Partial<AgencyProfile>; onChange: (d: Partial<AgencyProfile>) => void }) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Verify Your Agency</h2>
      <p className="text-slate-400 text-sm">Upload your official agency credentials. AI will extract and validate key information.</p>
    </div>
    <TrustBanner text="ORN is cross-referenced with DLD's official agency registry." />
    <div className="space-y-3">
      <DocUploadRow
        label="Trade License"
        hint="Current, non-expired · PDF or clear image"
        required
        uploaded={!!data.tradeLicenseUploaded}
        onToggle={() => onChange({ tradeLicenseUploaded: !data.tradeLicenseUploaded })}
        aiExtracted={data.tradeLicenseUploaded ? "AI detected: Betterhomes LLC · DED-12345 · Exp. 06/2026" : undefined}
      />
      <DocUploadRow
        label="ORN Certificate"
        hint="DLD-issued ORN certificate"
        required
        uploaded={!!data.ornCertUploaded}
        onToggle={() => onChange({ ornCertUploaded: !data.ornCertUploaded })}
        aiExtracted={data.ornCertUploaded ? "AI detected: ORN 12345 · Active · Dubai" : undefined}
      />
    </div>
    {(data.tradeLicenseUploaded || data.ornCertUploaded) && (
      <div className="p-4 bg-amber-400/5 border border-amber-400/20 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-400 text-xs font-medium">AI is validating company details</span>
        </div>
        <div className="space-y-1 text-xs text-slate-400">
          {data.tradeLicenseUploaded && <div>✓ Company name extracted</div>}
          {data.tradeLicenseUploaded && <div>✓ Expiry date verified</div>}
          {data.ornCertUploaded && <div>✓ ORN registration number confirmed</div>}
        </div>
      </div>
    )}
    <EncryptedBadge />
  </div>
);

const AgencyStep3 = ({ data, onChange }: { data: Partial<AgencyProfile>; onChange: (d: Partial<AgencyProfile>) => void }) => (
  <div className="space-y-4">
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Admin Representative</h2>
      <p className="text-slate-400 text-sm">Who is the authorised representative managing this account?</p>
    </div>
    <TrustBanner text="The representative's identity will be verified against the company's official records." />
    <Input label="Representative Full Name" value={data.repName || ""} onChange={(v) => onChange({ repName: v })} placeholder="Full legal name" required />
    <Input label="Job Title" value={data.repTitle || ""} onChange={(v) => onChange({ repTitle: v })} placeholder="e.g. Managing Director" required />
    <Input label="Corporate Email" type="email" value={data.repEmail || ""} onChange={(v) => onChange({ repEmail: v })} placeholder="rep@agency.ae" required />
    <Input label="Mobile Number" value={data.repMobile || ""} onChange={(v) => onChange({ repMobile: v })} placeholder="+971 50 000 0000" required />
    <DocUploadRow
      label="Company ID / Authorization Letter"
      hint="Proof that representative is authorized"
      uploaded={false}
      onToggle={() => {}}
    />
  </div>
);

const AgencyStep4 = ({ data, onChange }: { data: Partial<AgencyProfile>; onChange: (d: Partial<AgencyProfile>) => void }) => {
  const volumes = ["< AED 50M/yr", "50M–200M/yr", "200M–500M/yr", "500M+/yr"];
  const focusTypes = ["Secondary", "Off-plan", "Luxury", "Commercial", "Leasing"];
  const markets = ["Dubai", "Abu Dhabi", "Sharjah", "UAE-wide", "International"];
  const agentCounts = ["1–5", "6–15", "16–50", "50+"];
  const toggleF = (v: string) => {
    const a = data.focusTypes || [];
    onChange({ focusTypes: a.includes(v) ? a.filter((x) => x !== v) : [...a, v] });
  };
  const toggleM = (v: string) => {
    const a = data.markets || [];
    onChange({ markets: a.includes(v) ? a.filter((x) => x !== v) : [...a, v] });
  };
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Team & Scale</h2>
        <p className="text-slate-400 text-sm">Help AI understand your agency's scale and focus.</p>
      </div>
      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Number of Agents</div>
        <div className="grid grid-cols-2 gap-2">
          {agentCounts.map((a) => <SelectCard key={a} label={a} selected={data.agentCount === a} onClick={() => onChange({ agentCount: a })} />)}
        </div>
      </div>
      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Markets Covered</div>
        <div className="flex flex-wrap gap-2">
          {markets.map((m) => <Chip key={m} label={m} selected={(data.markets || []).includes(m)} onClick={() => toggleM(m)} />)}
        </div>
      </div>
      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Property Focus</div>
        <div className="flex flex-wrap gap-2">
          {focusTypes.map((f) => <Chip key={f} label={f} selected={(data.focusTypes || []).includes(f)} onClick={() => toggleF(f)} />)}
        </div>
      </div>
      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Annual Transaction Volume</div>
        <div className="grid grid-cols-2 gap-2">
          {volumes.map((v) => <SelectCard key={v} label={v} selected={data.transactionVolume === v} onClick={() => onChange({ transactionVolume: v })} />)}
        </div>
      </div>
    </div>
  );
};

const AgencyStep5 = ({ data, onChange }: { data: Partial<AgencyProfile>; onChange: (d: Partial<AgencyProfile>) => void }) => {
  const options = [
    { label: "Match with investors", emoji: "💰" },
    { label: "Match with luxury buyers", emoji: "💎" },
    { label: "Highlight exclusive listings", emoji: "🏆" },
    { label: "Promote off-plan inventory", emoji: "🏗️" },
    { label: "Match with relocation clients", emoji: "✈️" },
  ];
  const toggle = (v: string) => {
    const a = data.aiDistribution || [];
    onChange({ aiDistribution: a.includes(v) ? a.filter((x) => x !== v) : [...a, v] });
  };
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">AI Distribution & Lead Matching</h2>
        <p className="text-slate-400 text-sm">How should the AI prioritize your agency?</p>
      </div>
      <div className="space-y-2">
        {options.map((o) => (
          <SelectCard key={o.label} label={o.label} emoji={o.emoji} selected={(data.aiDistribution || []).includes(o.label)} onClick={() => toggle(o.label)} />
        ))}
      </div>
    </div>
  );
};

const AgencyStep6 = ({ data, onChange }: { data: Partial<AgencyProfile>; onChange: (d: Partial<AgencyProfile>) => void }) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Brand Assets</h2>
      <p className="text-slate-400 text-sm">Add your brand media to complete your verified agency profile.</p>
    </div>
    <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:border-amber-400/40 transition-colors cursor-pointer group">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:bg-amber-400/10 transition-colors">
          <UploadIcon />
        </div>
        <div>
          <div className="text-white font-medium text-sm">Company logo, office photos, intro video</div>
          <div className="text-slate-500 text-xs mt-1">PNG, JPG, PDF, MP4 · Max 50MB</div>
        </div>
        <button className="mt-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs hover:border-amber-400/40 transition-all">
          Browse files
        </button>
      </div>
    </div>
    <Input label="Social Media / Website" value={data.websiteUrl || ""} onChange={(v) => onChange({ websiteUrl: v })} placeholder="https://instagram.com/youragency" />
    <div className="grid grid-cols-2 gap-2">
      {["Company logo", "Office photos", "Intro video", "Brochures", "Social links", "Awards"].map((item) => (
        <div key={item} className="flex items-center gap-2 bg-slate-800/40 border border-slate-700 rounded-xl p-3 text-xs text-slate-400">
          <div className="w-3 h-3 rounded border border-slate-600 flex-shrink-0" />
          {item}
        </div>
      ))}
    </div>
  </div>
);

const AgencyStep7 = ({ onContinue }: { onContinue: () => void }) => (
  <ReviewTimeline
    title="Your Agency Verification Is In Progress"
    subtitle="Our compliance team is reviewing your agency credentials."
    steps={[
      { label: "Agency documents submitted", status: "done" },
      { label: "Trade license validation", status: "active" },
      { label: "ORN verification (DLD)", status: "pending" },
      { label: "Domain & email verification", status: "pending" },
      { label: "Representative verification", status: "pending" },
      { label: "Agency profile activation", status: "pending" },
    ]}
  />
);

// ─── DEVELOPER COMPANY STEPS ──────────────────────────────────────────────────

const DevCoStep1 = ({ data, onChange }: { data: Partial<DeveloperCompanyProfile>; onChange: (d: Partial<DeveloperCompanyProfile>) => void }) => {
  const isFreeEmail = (data.email || "").match(/@(gmail|yahoo|hotmail|outlook)\./i);
  const years = ["< 2 years", "2–5 years", "5–10 years", "10–20 years", "20+ years"];
  return (
    <div className="space-y-4">
      <div>
        <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1 mb-3">
          <LandmarkIcon />
          <span className="text-emerald-400 text-xs font-medium">Developer Verification</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Company Identity</h2>
        <p className="text-slate-400 text-sm">Only verified developers are permitted on the platform.</p>
      </div>
      <TrustBanner text="Official company domain emails speed up verification significantly." />
      <Input label="Legal Developer Name" value={data.legalName || ""} onChange={(v) => onChange({ legalName: v })} placeholder="e.g. Emaar Properties PJSC" required />
      <div>
        <Input label="Official Corporate Email" type="email" value={data.email || ""} onChange={(v) => onChange({ email: v })} placeholder="representative@emaar.ae" required />
        {isFreeEmail && (
          <div className="mt-2 flex items-center gap-2 bg-red-400/8 border border-red-400/20 rounded-lg px-3 py-2">
            <span className="text-red-400 text-xs">⚠ Official company domains speed up verification. Free email providers are not accepted for developer accounts.</span>
          </div>
        )}
      </div>
      <Input label="Headquarters Country" value={data.hqCountry || ""} onChange={(v) => onChange({ hqCountry: v })} placeholder="United Arab Emirates" required />
      <Input label="Company Website" value={data.website || ""} onChange={(v) => onChange({ website: v })} placeholder="https://emaar.ae" required />
      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Years Operating</div>
        <div className="grid grid-cols-2 gap-2">
          {years.map((y) => <SelectCard key={y} label={y} selected={data.yearsOperating === y} onClick={() => onChange({ yearsOperating: y })} />)}
        </div>
      </div>
    </div>
  );
};

const DevCoStep2 = ({ data, onChange }: { data: Partial<DeveloperCompanyProfile>; onChange: (d: Partial<DeveloperCompanyProfile>) => void }) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Developer Verification</h2>
      <p className="text-slate-400 text-sm">Provide official company registration documents. AI will validate and cross-reference.</p>
    </div>
    <TrustBanner text="Documents are cross-referenced with Dubai Land Department official records." />
    <div className="space-y-3">
      <DocUploadRow
        label="Trade License"
        hint="Current, government-issued trade license"
        required
        uploaded={!!data.tradeLicenseUploaded}
        onToggle={() => onChange({ tradeLicenseUploaded: !data.tradeLicenseUploaded })}
        aiExtracted={data.tradeLicenseUploaded ? "AI detected: Emaar Properties PJSC · DED · Active" : undefined}
      />
      <DocUploadRow
        label="Developer Registration Proof"
        hint="DLD developer registration certificate"
        required
        uploaded={!!data.devRegUploaded}
        onToggle={() => onChange({ devRegUploaded: !data.devRegUploaded })}
        aiExtracted={data.devRegUploaded ? "AI detected: Developer License · Valid · Dubai" : undefined}
      />
      <DocUploadRow
        label="Corporate Authorization Letter"
        hint="Board resolution or POA for the representative"
        required
        uploaded={!!data.authLetterUploaded}
        onToggle={() => onChange({ authLetterUploaded: !data.authLetterUploaded })}
      />
    </div>
    <EncryptedBadge />
  </div>
);

const DevCoStep3 = ({ data, onChange }: { data: Partial<DeveloperCompanyProfile>; onChange: (d: Partial<DeveloperCompanyProfile>) => void }) => {
  const cats = ["Luxury", "Branded residences", "Waterfront", "Smart communities", "Family communities", "Mixed-use", "Commercial"];
  const communities = ["Dubai Marina", "Palm Jumeirah", "Downtown", "Business Bay", "Dubai Hills", "Ras Al Khaimah", "Abu Dhabi"];
  const delivery = ["Consistently early", "On-time", "Occasional delays", "Mixed track record"];
  const buyers = ["Investors", "End-users", "International", "Luxury HNW", "Families"];

  const toggleC = (v: string) => {
    const a = data.projectCategories || [];
    onChange({ projectCategories: a.includes(v) ? a.filter((x) => x !== v) : [...a, v] });
  };
  const toggleCom = (v: string) => {
    const a = data.mainCommunities || [];
    onChange({ mainCommunities: a.includes(v) ? a.filter((x) => x !== v) : [...a, v] });
  };
  const toggleB = (v: string) => {
    const a = data.typicalBuyers || [];
    onChange({ typicalBuyers: a.includes(v) ? a.filter((x) => x !== v) : [...a, v] });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Company Profile</h2>
        <p className="text-slate-400 text-sm">Help AI position your developments with the right investors.</p>
      </div>
      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Project Categories</div>
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => <Chip key={c} label={c} selected={(data.projectCategories || []).includes(c)} onClick={() => toggleC(c)} />)}
        </div>
      </div>
      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Main Communities</div>
        <div className="flex flex-wrap gap-2">
          {communities.map((c) => <Chip key={c} label={c} selected={(data.mainCommunities || []).includes(c)} onClick={() => toggleCom(c)} />)}
        </div>
      </div>
      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Delivery Track Record</div>
        <div className="space-y-2">
          {delivery.map((d) => <SelectCard key={d} label={d} selected={data.deliveryRecord === d} onClick={() => onChange({ deliveryRecord: d })} />)}
        </div>
      </div>
      <div>
        <div className="text-slate-300 text-sm font-medium mb-3">Typical Buyer Profile</div>
        <div className="flex flex-wrap gap-2">
          {buyers.map((b) => <Chip key={b} label={b} selected={(data.typicalBuyers || []).includes(b)} onClick={() => toggleB(b)} />)}
        </div>
      </div>
    </div>
  );
};

const DevCoStep4 = ({ data, onChange }: { data: Partial<DeveloperCompanyProfile>; onChange: (d: Partial<DeveloperCompanyProfile>) => void }) => {
  const options = [
    { label: "Appreciation-focused investors", emoji: "📈" },
    { label: "Yield-focused investors", emoji: "💰" },
    { label: "Luxury lifestyle seekers", emoji: "✨" },
    { label: "Golden Visa buyers", emoji: "🏅" },
    { label: "International investors", emoji: "🌍" },
    { label: "End-users / families", emoji: "👨‍👩‍👧" },
  ];
  const toggle = (v: string) => {
    const a = data.aiPositioning || [];
    onChange({ aiPositioning: a.includes(v) ? a.filter((x) => x !== v) : [...a, v] });
  };
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">AI Investor Matching</h2>
        <p className="text-slate-400 text-sm">How should AI position your developments?</p>
      </div>
      <div className="space-y-2">
        {options.map((o) => (
          <SelectCard key={o.label} label={o.label} emoji={o.emoji} selected={(data.aiPositioning || []).includes(o.label)} onClick={() => toggle(o.label)} />
        ))}
      </div>
    </div>
  );
};

const DevCoStep5 = ({ data, onChange }: { data: Partial<DeveloperCompanyProfile>; onChange: (d: Partial<DeveloperCompanyProfile>) => void }) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Media & Project Assets</h2>
      <p className="text-slate-400 text-sm">Strong media increases investor confidence and AI match quality.</p>
    </div>
    <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:border-emerald-400/30 transition-colors cursor-pointer group">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:bg-emerald-400/10 transition-colors text-slate-400">
          <UploadIcon />
        </div>
        <div>
          <div className="text-white font-medium text-sm">Project assets & media</div>
          <div className="text-slate-500 text-xs mt-1">Renders, brochures, payment plans, investor decks, videos</div>
        </div>
        <button className="mt-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs hover:border-emerald-400/30 transition-all">
          Browse files
        </button>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: "Project renders", key: "rendersUploaded" as const },
        { label: "Brochures (PDF)", key: "brochuresUploaded" as const },
      ].map((item) => (
        <div
          key={item.label}
          onClick={() => onChange({ [item.key]: !data[item.key] } as any)}
          className={cn(
            "flex items-center gap-2 rounded-xl p-3 text-xs border cursor-pointer transition-all",
            data[item.key]
              ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-300"
              : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600"
          )}
        >
          <div className={cn("w-4 h-4 rounded border flex items-center justify-center flex-shrink-0", data[item.key] ? "border-emerald-400 bg-emerald-400 text-slate-900" : "border-slate-600")}>
            {data[item.key] && <CheckIcon />}
          </div>
          {item.label}
        </div>
      ))}
    </div>
  </div>
);

const DevCoStep6 = ({ onContinue }: { onContinue: () => void }) => (
  <ReviewTimeline
    title="Your Developer Profile Is Being Verified"
    subtitle="Our compliance and legal team is reviewing your developer credentials."
    steps={[
      { label: "Corporate documents submitted", status: "done" },
      { label: "Corporate validation (DLD)", status: "active" },
      { label: "Domain & email verification", status: "pending" },
      { label: "Representative review", status: "pending" },
      { label: "Project authenticity review", status: "pending" },
      { label: "Developer profile activation", status: "pending" },
    ]}
  />
);

// ─── ROLE SELECTION ────────────────────────────────────────────────────────────

const RoleSelection = ({ onSelect }: { onSelect: (r: UserRole) => void }) => {
  const [hovered, setHovered] = useState<UserRole>(null);

  const roles = [
    {
      id: "investor" as const,
      icon: <TrendingUpIcon />,
      title: "Investor",
      desc: "Find high-performing investment opportunities powered by AI.",
      cta: "Continue as Investor",
      color: "from-amber-400/20 to-amber-600/5",
      border: "group-hover:border-amber-400/50",
      glow: "group-hover:shadow-[0_0_30px_hsl(45,85%,55%,0.15)]",
      iconBg: "bg-amber-400/15 text-amber-400",
    },
    {
      id: "resident" as const,
      icon: <HomeIcon />,
      title: "Looking for a Home",
      desc: "Find the right community, lifestyle, and property for your family.",
      cta: "Continue as Resident",
      color: "from-blue-400/20 to-blue-600/5",
      border: "group-hover:border-blue-400/50",
      glow: "group-hover:shadow-[0_0_30px_hsl(200,80%,50%,0.15)]",
      iconBg: "bg-blue-400/15 text-blue-400",
    },
    {
      id: "developer" as const,
      icon: <BuildingIcon />,
      title: "Developer / Agency",
      desc: "List projects, reach investors, and let AI recommend your developments.",
      cta: "Continue as Developer",
      color: "from-emerald-400/20 to-emerald-600/5",
      border: "group-hover:border-emerald-400/50",
      glow: "group-hover:shadow-[0_0_30px_hsl(160,75%,35%,0.15)]",
      iconBg: "bg-emerald-400/15 text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1 mb-4">
          <SparklesIcon />
          <span className="text-amber-400 text-xs font-medium">AI is ready to personalize</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">What brings you here?</h2>
        <p className="text-slate-400 text-sm">Choose your role so AI can tailor the entire platform for you.</p>
      </div>

      <div className="space-y-3">
        {roles.map((role) => (
          <button
            key={role.id}
            className={cn(
              "group w-full text-left p-5 rounded-2xl border border-slate-700 bg-gradient-to-br transition-all duration-300 cursor-pointer",
              role.color,
              role.border,
              role.glow
            )}
            onMouseEnter={() => setHovered(role.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(role.id)}
          >
            <div className="flex items-start gap-4">
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all", role.iconBg)}>
                {role.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-base mb-1">{role.title}</div>
                <div className="text-slate-400 text-sm leading-relaxed">{role.desc}</div>
              </div>
              <div className={cn(
                "flex-shrink-0 text-slate-600 transition-all duration-200 mt-1",
                hovered === role.id ? "text-white translate-x-1" : ""
              )}>
                <ArrowRightIcon />
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-slate-600 text-xs">
        Already have an account?{" "}
        <button className="text-amber-400 hover:text-amber-300 transition-colors">Sign in</button>
      </p>
    </div>
  );
};

// ─── NAV BUTTONS ───────────────────────────────────────────────────────────────

const NavButtons = ({
  onBack,
  onNext,
  nextLabel = "Continue",
  isLast = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  isLast?: boolean;
}) => (
  <div className="flex items-center gap-3 mt-8">
    {onBack && (
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700 text-slate-400 text-sm hover:border-slate-600 hover:text-white transition-all"
      >
        <ArrowLeftIcon />
        Back
      </button>
    )}
    <button
      onClick={onNext}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-200",
        isLast
          ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:from-amber-300 hover:to-amber-400 shadow-[0_4px_20px_hsl(45,85%,55%,0.35)]"
          : "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:from-amber-300 hover:to-amber-400 shadow-[0_4px_16px_hsl(45,85%,55%,0.25)]"
      )}
    >
      {nextLabel}
      <ArrowRightIcon />
    </button>
  </div>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function DubaiAIOnboarding() {
  const [role, setRole] = useState<UserRole>(null);
  const [step, setStep] = useState(0); // 0 = role selection
  const [complete, setComplete] = useState(false);

  // Dev sub-role lives inside developerData now
  const [investorData, setInvestorData] = useState<Partial<InvestorProfile>>({});
  const [residentData, setResidentData] = useState<Partial<ResidentProfile>>({});
  const [developerData, setDeveloperData] = useState<DeveloperProfile>({
    subRole: null,
    agent: {},
    agency: {},
    devCompany: {},
  });

  const rightRef = useRef<HTMLDivElement>(null);

  const scrollTop = () => rightRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  const handleRoleSelect = (r: UserRole) => {
    setRole(r);
    setStep(1);
    scrollTop();
  };

  const handleDevSubRoleSelect = (sr: DevSubRole) => {
    setDeveloperData((p) => ({ ...p, subRole: sr }));
    setStep(2);
    scrollTop();
  };

  const next = () => { setStep((s) => s + 1); scrollTop(); };
  const back = () => {
    if (step === 1) { setRole(null); setStep(0); }
    else if (role === "developer" && step === 2) { setStep(1); }
    else { setStep((s) => s - 1); scrollTop(); }
  };

  // Step counts — developer step 1 = sub-role picker, step 2+ = sub-flow
  const subRole = developerData.subRole;
  const devSubTotals: Record<string, number> = { agent: 6, agency: 7, developer_company: 6 };
  const devTotal = subRole ? devSubTotals[subRole] : 0;

  const totalSteps = {
    investor: 7,
    resident: 7,
    developer: subRole ? devTotal + 1 : 1, // +1 for sub-role picker
  };
  const total = role ? totalSteps[role] : 0;

  const agentLabels = ["Identity", "License", "Documents", "Selfie ID", "Profile", "Under Review"];
  const agencyLabels = ["Company", "Verify", "Representative", "Team", "AI Setup", "Brand", "Under Review"];
  const devCoLabels = ["Identity", "Documents", "Profile", "AI Matching", "Assets", "Under Review"];

  const getStepLabel = () => {
    if (!role || step === 0) return "Choose Role";
    if (role !== "developer") {
      const labels = {
        investor: ["Account", "Goals", "Budget", "Risk", "Areas", "AI Config", "Profile Ready"],
        resident: ["Account", "Purpose", "Household", "Lifestyle", "Priorities", "Work Area", "Profile Ready"],
      };
      return labels[role as "investor" | "resident"][step - 1] || "";
    }
    if (step === 1) return "Professional Type";
    const subStep = step - 2;
    if (subRole === "agent") return agentLabels[subStep] || "";
    if (subRole === "agency") return agencyLabels[subStep] || "";
    if (subRole === "developer_company") return devCoLabels[subStep] || "";
    return "";
  };

  const setAgent = (d: Partial<AgentProfile>) => setDeveloperData((p) => ({ ...p, agent: { ...p.agent, ...d } }));
  const setAgency = (d: Partial<AgencyProfile>) => setDeveloperData((p) => ({ ...p, agency: { ...p.agency, ...d } }));
  const setDevCo = (d: Partial<DeveloperCompanyProfile>) => setDeveloperData((p) => ({ ...p, devCompany: { ...p.devCompany, ...d } }));

  // Render step content
  const renderStep = () => {
    if (step === 0) return <RoleSelection onSelect={handleRoleSelect} />;

    if (role === "investor") {
      switch (step) {
        case 1: return <><InvestorStep1 data={investorData} onChange={(d) => setInvestorData((p) => ({ ...p, ...d }))} /><NavButtons onBack={back} onNext={next} /></>;
        case 2: return <><InvestorStep2 data={investorData} onChange={(d) => setInvestorData((p) => ({ ...p, ...d }))} /><NavButtons onBack={back} onNext={next} /></>;
        case 3: return <><InvestorStep3 data={investorData} onChange={(d) => setInvestorData((p) => ({ ...p, ...d }))} /><NavButtons onBack={back} onNext={next} /></>;
        case 4: return <><InvestorStep4 data={investorData} onChange={(d) => setInvestorData((p) => ({ ...p, ...d }))} /><NavButtons onBack={back} onNext={next} /></>;
        case 5: return <><InvestorStep5 data={investorData} onChange={(d) => setInvestorData((p) => ({ ...p, ...d }))} /><NavButtons onBack={back} onNext={next} /></>;
        case 6: return <><InvestorStep6 data={investorData} onChange={(d) => setInvestorData((p) => ({ ...p, ...d }))} /><NavButtons onBack={back} onNext={next} nextLabel="Build my AI profile" isLast /></>;
        case 7: return <InvestorStep7 data={investorData} onContinue={() => setComplete(true)} />;
      }
    }

    if (role === "resident") {
      switch (step) {
        case 1: return <><InvestorStep1 data={residentData as any} onChange={(d) => setResidentData((p) => ({ ...p, ...d }))} /><NavButtons onBack={back} onNext={next} /></>;
        case 2: return <><ResidentStep2 data={residentData} onChange={(d) => setResidentData((p) => ({ ...p, ...d }))} /><NavButtons onBack={back} onNext={next} /></>;
        case 3: return <><ResidentStep3 data={residentData} onChange={(d) => setResidentData((p) => ({ ...p, ...d }))} /><NavButtons onBack={back} onNext={next} /></>;
        case 4: return <><ResidentStep4 data={residentData} onChange={(d) => setResidentData((p) => ({ ...p, ...d }))} /><NavButtons onBack={back} onNext={next} /></>;
        case 5: return <><ResidentStep5 data={residentData} onChange={(d) => setResidentData((p) => ({ ...p, ...d }))} /><NavButtons onBack={back} onNext={next} /></>;
        case 6: return <><ResidentStep6 data={residentData} onChange={(d) => setResidentData((p) => ({ ...p, ...d }))} /><NavButtons onBack={back} onNext={next} nextLabel="Build my AI profile" isLast /></>;
        case 7: return <ResidentStep7 data={residentData} onContinue={() => setComplete(true)} />;
      }
    }

    if (role === "developer") {
      // Step 1: sub-role selection
      if (step === 1) return <DevSubRoleSelection onSelect={handleDevSubRoleSelect} />;

      const subStep = step - 2; // 0-indexed sub-flow step

      if (subRole === "agent") {
        switch (subStep) {
          case 0: return <><AgentStep1 data={developerData.agent} onChange={setAgent} /><NavButtons onBack={back} onNext={next} /></>;
          case 1: return <><AgentStep2 data={developerData.agent} onChange={setAgent} /><NavButtons onBack={back} onNext={next} /></>;
          case 2: return <><AgentStep3 data={developerData.agent} onChange={setAgent} /><NavButtons onBack={back} onNext={next} /></>;
          case 3: return <><AgentStep4 data={developerData.agent} onChange={setAgent} /><NavButtons onBack={back} onNext={next} /></>;
          case 4: return <><AgentStep5 data={developerData.agent} onChange={setAgent} /><NavButtons onBack={back} onNext={next} nextLabel="Submit for verification" isLast /></>;
          case 5: return <AgentStep6 onContinue={() => setComplete(true)} />;
        }
      }

      if (subRole === "agency") {
        switch (subStep) {
          case 0: return <><AgencyStep1 data={developerData.agency} onChange={setAgency} /><NavButtons onBack={back} onNext={next} /></>;
          case 1: return <><AgencyStep2 data={developerData.agency} onChange={setAgency} /><NavButtons onBack={back} onNext={next} /></>;
          case 2: return <><AgencyStep3 data={developerData.agency} onChange={setAgency} /><NavButtons onBack={back} onNext={next} /></>;
          case 3: return <><AgencyStep4 data={developerData.agency} onChange={setAgency} /><NavButtons onBack={back} onNext={next} /></>;
          case 4: return <><AgencyStep5 data={developerData.agency} onChange={setAgency} /><NavButtons onBack={back} onNext={next} /></>;
          case 5: return <><AgencyStep6 data={developerData.agency} onChange={setAgency} /><NavButtons onBack={back} onNext={next} nextLabel="Submit for verification" isLast /></>;
          case 6: return <AgencyStep7 onContinue={() => setComplete(true)} />;
        }
      }

      if (subRole === "developer_company") {
        switch (subStep) {
          case 0: return <><DevCoStep1 data={developerData.devCompany} onChange={setDevCo} /><NavButtons onBack={back} onNext={next} /></>;
          case 1: return <><DevCoStep2 data={developerData.devCompany} onChange={setDevCo} /><NavButtons onBack={back} onNext={next} /></>;
          case 2: return <><DevCoStep3 data={developerData.devCompany} onChange={setDevCo} /><NavButtons onBack={back} onNext={next} /></>;
          case 3: return <><DevCoStep4 data={developerData.devCompany} onChange={setDevCo} /><NavButtons onBack={back} onNext={next} /></>;
          case 4: return <><DevCoStep5 data={developerData.devCompany} onChange={setDevCo} /><NavButtons onBack={back} onNext={next} nextLabel="Submit for verification" isLast /></>;
          case 5: return <DevCoStep6 onContinue={() => setComplete(true)} />;
        }
      }
    }

    return null;
  };

  if (complete) {
    return (
      <div className="min-h-screen bg-[hsl(210,80%,8%)] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400/30 to-amber-600/10 border border-amber-400/40 mb-6 shadow-[0_0_50px_hsl(45,85%,55%,0.3)]">
            <SparklesIcon />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Welcome to DubaiAI</h1>
          <p className="text-slate-400 mb-8">Your personalized AI dashboard is being prepared. You'll be redirected shortly.</p>
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(210,80%,8%)] flex flex-col lg:flex-row">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] bg-[hsl(210,75%,10%)] relative flex-col">
        <LeftPanel role={role} />
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        ref={rightRef}
        className="flex-1 flex flex-col overflow-y-auto"
        style={{ maxHeight: "100vh" }}
      >
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-slate-900 font-black text-xs">D</span>
            </div>
            <span className="text-white font-bold">DubaiAI</span>
          </div>
          <span className="text-slate-500 text-xs">
            {step > 0 && role ? `${step} / ${total}` : ""}
          </span>
        </div>

        {/* Sticky progress on mobile */}
        {step > 0 && role && (
          <div className="sticky top-0 z-10 bg-[hsl(210,80%,8%)]/90 backdrop-blur-sm px-5 py-2 lg:hidden border-b border-slate-800/50">
            <div className="h-1 bg-slate-800 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${(step / total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Form area */}
        <div className="flex-1 flex flex-col justify-center px-6 py-10 max-w-lg mx-auto w-full">
          {step > 0 && role && (
            <ProgressBar
              current={step}
              total={total}
              label={getStepLabel()}
            />
          )}

          <div
            key={`${role}-${step}`}
            style={{
              animation: "slideIn 0.3s ease-out forwards",
            }}
          >
            {renderStep()}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: hsl(45,85%,55%);
          cursor: pointer;
          box-shadow: 0 0 0 4px hsl(45,85%,55%,0.2);
        }
        input[type=range]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: hsl(45,85%,55%);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 4px hsl(45,85%,55%,0.2);
        }
      `}</style>
    </div>
  );
}