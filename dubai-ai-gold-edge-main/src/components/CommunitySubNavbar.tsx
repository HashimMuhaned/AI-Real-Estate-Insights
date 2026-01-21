"use client";

import { useState, useEffect } from "react";

const CommunitySubNav = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const navLinks = [
    { name: "Details", href: "#details" },
    { name: "Special Classifications", href: "#classifications" },
    { name: "Amenities", href: "#amenities" },
    { name: "Road Locations", href: "#roads" },
    { name: "Description", href: "#description" },
    { name: "Location", href: "#location" },
    { name: "Downloads", href: "#downloads" },
    { name: "Projects", href: "#projects" },
    { name: "Market Insights", href: "#market-insights" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Show sub-nav after scrolling past main nav
      setIsVisible(window.scrollY > 100);

      // Update active section based on scroll position
      const sections = navLinks.map((link) => link.href.substring(1));
      let current = "";

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            current = section;
            break;
          }
        }
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.getElementById(href.substring(1));
    if (element) {
      const offset = 140; // Account for both navbars
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className={`fixed top-16 left-0 right-0 z-40 transition-all duration-300 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
      } bg-background border-b border-border/50`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center overflow-x-auto scrollbar-hide">
          <div className="flex space-x-1 py-3">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-all duration-200 ${
                  activeSection === link.href.substring(1)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunitySubNav;