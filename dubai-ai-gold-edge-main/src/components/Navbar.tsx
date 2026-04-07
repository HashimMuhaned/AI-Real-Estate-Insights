"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import AuthButtons from "@/components/auth/AuthButtons";
import Link from "next/link";

// ─── Configure per-route navbar text color ────────────────────────────────
// When the navbar is TRANSPARENT (not scrolled), each route can show
// white or dark text depending on its background.
//
// "white" → use on pages with a dark/image hero (text needs to be light)
// "dark"  → use on pages with a white/light background (text needs to be dark)
//
// Add a new route here whenever you add a page.
// Unmatched routes fall back to "dark" by default.
const routeTextColor: Record<string, "white" | "dark"> = {
  "/":             "white",  // homepage has dark hero image
  "/locations":    "white",  // dark bg
  "/projects":     "white",   // light bg
  // add more routes as needed...
};
// ──────────────────────────────────────────────────────────────────────────

const navLinks = [
  { name: "Features",     href: "#features"      },
  { name: "How It Works", href: "#how-it-works"  },
  { name: "Pricing",      href: "#pricing"       },
  { name: "Locations",    href: "/locations"     },
  { name: "New Projects", href: "/projects"      },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Match current path — also handles dynamic routes like /locations/dubai
  const transparentTextColor =
    routeTextColor[pathname] ??
    (Object.keys(routeTextColor).find((route) =>
      route !== "/" && pathname.startsWith(route)
    )
      ? routeTextColor[
          Object.keys(routeTextColor).find((route) =>
            route !== "/" && pathname.startsWith(route)
          )!
        ]
      : "dark");

  const isWhiteText = transparentTextColor === "white";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // When scrolled: always dark text on white bg
  // When transparent: white or dark based on current route config
  const linkClass = isScrolled
    ? "text-gray-800 hover:text-accent"
    : isWhiteText
    ? "text-white hover:text-accent"
    : "text-gray-900 hover:text-accent";

  const logoClass = isScrolled
    ? "text-gray-900"
    : isWhiteText
    ? "text-white"
    : "text-gray-900";

  const menuBtnClass = isScrolled
    ? "text-gray-800"
    : isWhiteText
    ? "text-white"
    : "text-gray-900";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white border-b border-gray-200 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {!isScrolled && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}

      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className={`text-2xl font-serif font-bold transition-colors duration-300 ${logoClass}`}>
              <Link href="/">Home</Link>
            </h1>
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
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu — always white bg */}
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