"use client"

import { cn } from "@/lib/utils";

export default function YieldBadge({ label, variant = "emerald" }) {
  const variants = {
    emerald: "bg-emerald/15 text-emerald border-emerald/30",
    accent: "bg-accent/15 text-accent-foreground border-accent/30",
    destructive: "bg-destructive/15 text-destructive border-destructive/30",
    purple: "bg-purple-500/15 text-purple-600 border-purple-500/30",
    orange: "bg-orange-500/15 text-orange-600 border-orange-500/30",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      variants[variant] || variants.emerald
    )}>
      {label}
    </span>
  );
}