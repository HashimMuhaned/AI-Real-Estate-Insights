"use client"

import { cn } from "@/lib/utils";

export default function ToolHeader({ icon, title, subtitle, color = "primary" }) {
  const colorMap = {
    emerald: "bg-emerald/10 text-emerald",
    accent: "bg-accent/10 text-accent-foreground",
    primary: "bg-primary/10 text-primary",
    destructive: "bg-destructive/10 text-destructive",
    purple: "bg-purple-500/10 text-purple-600",
    orange: "bg-orange-500/10 text-orange-600",
  };

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-lg", colorMap[color] || colorMap.primary)}>
        {icon}
      </div>
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}