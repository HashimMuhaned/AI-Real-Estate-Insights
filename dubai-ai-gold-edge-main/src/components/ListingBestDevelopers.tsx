"use client";

import Image from "next/image";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Developer = {
  name: string;
  projects: number;
  logo: string;
};

type DevelopersProps = {
  developers: Developer[];
};

export default function Developers({ developers }: DevelopersProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          Projects by developers in the UAE
        </h2>

        {/* Arrows */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full border border-border bg-card hover:bg-muted transition"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full border border-border bg-card hover:bg-muted transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar"
      >
        {developers.map((dev, index) => (
          <div
            key={index}
            className="min-w-[260px] h-[260px] luxury-card p-6 flex flex-col justify-between hover:scale-[1.02] transition"
          >
            {/* Logo */}
            <div className="flex items-center justify-center flex-1">
              <img
                src={dev.logo}
                alt={dev.name}
                width={140}
                height={60}
                className="object-contain"
              />
            </div>

            {/* Info */}
            <div>
              <h3 className="text-sm font-medium text-foreground">
                {dev.name}
              </h3>

              <p className="text-xs text-muted-foreground mt-1">
                {dev.projects} projects
              </p>

              {/* Gold accent line */}
              <div className="mt-3 h-[2px] w-10 bg-accent rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
