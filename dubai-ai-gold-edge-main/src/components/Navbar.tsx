"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Dubai_AI_Invest_logo_design_simple_dark from "public/Dubai_AI_Invest_logo_design_simple_dark.png";
import Dubai_AI_Invest_logo_design_simple from "public/Dubai_AI_Invest_logo_design_simple.png";

// ─── Route Config ─────────────────────────────────────────────
const routeConfig: Record<
  string,
  { textColor: "white" | "dark"; logo: "light" | "dark" }
> = {
  "/": { textColor: "white", logo: "light" },
  "/locations": { textColor: "white", logo: "light" },
  "/projects": { textColor: "white", logo: "light" },
};

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "Locations", href: "/locations" },
  { name: "New Projects", href: "/projects" },
];

// ─── Auth CTA (Desktop) ───────────────────────────────────────
const AuthCTA = ({ isWhiteText }: { isWhiteText: boolean }) => (
  <div className="flex items-center gap-2.5">
    <Link
      href="/login"
      className={`
        px-4 py-2.5 rounded-lg
        text-[15px] font-medium tracking-[-0.01em]
        transition-all duration-200
        ${
          isWhiteText
            ? "text-white/90 hover:text-white hover:bg-white/10"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        }
      `}
    >
      Sign In
    </Link>
    <Link
      href="/signup"
      className={`
        px-5 py-2.5 rounded-lg
        text-[15px] font-semibold tracking-[-0.01em]
        transition-all duration-200 shadow-sm
        ${
          isWhiteText
            ? "bg-yellow-400 hover:bg-yellow-300 text-gray-900"
            : "text-white hover:opacity-90"
        }
      `}
      style={!isWhiteText ? { background: "var(--gradient-primary)" } : {}}
    >
      Sign Up
    </Link>
  </div>
);

// ─── Mobile Auth CTA ──────────────────────────────────────────
const MobileAuthCTA = () => (
  <div className="flex flex-col gap-2.5">
    <Link
      href="/login"
      className="
        w-full text-center px-4 py-3.5 rounded-xl
        text-[15px] font-medium text-gray-700
        border border-black
        hover:bg-gray-50 active:bg-gray-100
        transition-colors duration-150  
      "
    >
      Sign In
    </Link>
    <Link
      href="/signup"
      className="
        w-full text-center px-4 py-3.5 rounded-xl
        text-[15px] font-semibold text-white
        transition-colors duration-150 shadow-sm
      "
      style={{ background: "var(--gradient-primary)" }}
    >
      Sign Up
    </Link>
  </div>
);

// ─── Navbar ───────────────────────────────────────────────────
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const currentConfig = routeConfig[pathname] ??
    routeConfig[
      Object.keys(routeConfig).find(
        (route) => route !== "/" && pathname.startsWith(route),
      ) ?? ""
    ] ?? { textColor: "dark", logo: "dark" };

  const isWhiteText = !isScrolled && currentConfig.textColor === "white";
  const showLightLogo = !isScrolled && currentConfig.logo === "light";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-500 ease-in-out
          ${
            isScrolled
              ? "bg-white/90 backdrop-blur-md border-b border-gray-100/80 shadow-[0_2px_24px_rgba(0,0,0,0.06)]"
              : "bg-transparent border-b border-transparent"
          }
        `}
      >
        <div className="w-full px-6 sm:px-8 lg:px-14">
          <div className="flex items-center justify-between h-20 lg:h-18">
            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex-shrink-0 flex items-center group"
              aria-label="Dubai AI Invest Home"
            >
              <Image
                src={
                  showLightLogo
                    ? Dubai_AI_Invest_logo_design_simple_dark
                    : Dubai_AI_Invest_logo_design_simple
                }
                alt="Dubai AI Invest"
                priority
                height={110}
                className="
                  w-auto
                  h-14 sm:h-16 lg:h-[72px]
                  transition-transform duration-300 group-hover:scale-[1.03]
                "
              />
            </Link>

            {/* ── Desktop Nav ── */}
            <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
              {navLinks.map((link, i) => (
                <a
                  key={link.name}
                  href={link.href}
                  onMouseEnter={() => setActiveLink(link.name)}
                  onMouseLeave={() => setActiveLink(null)}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className={`
                    relative px-3.5 lg:px-4 py-2.5 rounded-lg
                    text-sm lg:text-[15px] font-medium tracking-[-0.01em]
                    transition-all duration-200 whitespace-nowrap
                    ${
                      isWhiteText
                        ? "text-white/90 hover:text-white hover:bg-white/10"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                >
                  {link.name}
                  <span
                    className={`
                      absolute bottom-1.5 left-3.5 right-3.5 h-px rounded-full
                      transition-all duration-300 origin-left
                      ${activeLink === link.name ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}
                      ${isWhiteText ? "bg-white" : "bg-accent"}
                    `}
                  />
                </a>
              ))}

              {/* Divider */}
              <div
                className={`
                  w-px h-6 mx-3 flex-shrink-0
                  transition-colors duration-300
                  ${isWhiteText ? "bg-white/20" : "bg-gray-200"}
                `}
              />

              <AuthCTA isWhiteText={isWhiteText} />
            </div>

            {/* ── Mobile Hamburger ── */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                className={`
                  relative p-2.5 rounded-xl
                  transition-all duration-200
                  ${
                    isWhiteText && !isMobileMenuOpen
                      ? "text-white hover:bg-white/10"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <span className="relative block w-6 h-6">
                  <Menu
                    className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                      isMobileMenuOpen
                        ? "opacity-0 rotate-90 scale-50"
                        : "opacity-100 rotate-0 scale-100"
                    }`}
                  />
                  <X
                    className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                      isMobileMenuOpen
                        ? "opacity-100 rotate-0 scale-100"
                        : "opacity-0 -rotate-90 scale-50"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      <div
        className={`
          fixed inset-0 z-40 md:hidden
          transition-all duration-300
          ${isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}
        `}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Backdrop */}
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className={`
            absolute inset-0 bg-black/40 backdrop-blur-sm
            transition-opacity duration-300
            ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}
          `}
        />

        {/* Panel — positioned below the taller nav bar */}
        <div
          ref={mobileMenuRef}
          className={`
            absolute top-20 left-1/2 -translate-x-1/2
            w-[min(440px,92vw)]
            bg-white/95 backdrop-blur-md
            rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.18)]
            border border-gray-100 overflow-hidden
            transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${
              isMobileMenuOpen
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
            }
          `}
        >
          <nav className="px-3 pt-3 pb-2">
            <ul className="space-y-0.5">
              {navLinks.map((link, i) => (
                <li
                  key={link.name}
                  style={{
                    transitionDelay: isMobileMenuOpen ? `${i * 45}ms` : "0ms",
                    opacity: isMobileMenuOpen ? 1 : 0,
                    transform: isMobileMenuOpen
                      ? "translateY(0)"
                      : "translateY(-8px)",
                    transition: "opacity 0.25s ease, transform 0.25s ease",
                  }}
                >
                  <a
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="
                      flex items-center justify-between px-4 py-3.5 rounded-xl
                      text-[15px] font-medium text-gray-700
                      hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100
                      transition-colors duration-150 group
                    "
                  >
                    <span>{link.name}</span>
                    <span className="text-gray-300 group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-150 text-lg leading-none">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div
            className="px-4 py-4 border-t border-gray-100"
            style={{
              transitionDelay: isMobileMenuOpen
                ? `${navLinks.length * 45}ms`
                : "0ms",
              opacity: isMobileMenuOpen ? 1 : 0,
              transform: isMobileMenuOpen
                ? "translateY(0)"
                : "translateY(-8px)",
              transition: "opacity 0.25s ease, transform 0.25s ease",
            }}
          >
            <MobileAuthCTA />
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
