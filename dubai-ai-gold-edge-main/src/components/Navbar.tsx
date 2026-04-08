"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import AuthButtons from "@/components/auth/AuthButtons";
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
// ──────────────────────────────────────────────────────────────

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "Locations", href: "/locations" },
  { name: "New Projects", href: "/projects" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const currentConfig =
    routeConfig[pathname] ??
    routeConfig[
      Object.keys(routeConfig).find(
        (route) => route !== "/" && pathname.startsWith(route)
      ) ?? ""
    ] ?? { textColor: "dark", logo: "dark" };

  const isWhiteText = !isScrolled && currentConfig.textColor === "white";
  const showLightLogo = !isScrolled && currentConfig.logo === "light";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const linkClass = isWhiteText
    ? "text-white hover:text-accent"
    : "text-gray-800 hover:text-accent";

  const menuBtnClass = isWhiteText ? "text-white" : "text-gray-800";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white border-b border-gray-200 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* subtle line on transparent */}
      {!isScrolled && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}

      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src={
                  showLightLogo
                    ? Dubai_AI_Invest_logo_design_simple_dark
                    : Dubai_AI_Invest_logo_design_simple
                }
                alt="Dubai AI Invest"
                priority
                className="pt-4"
                height={90}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`transition-colors duration-200 font-medium ${linkClass}`}
              >
                {link.name}
              </a>
            ))}
            <AuthButtons />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 transition-colors duration-200 ${menuBtnClass}`}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 text-gray-800 hover:text-accent transition-colors duration-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="px-3 py-2">
                <AuthButtons />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;