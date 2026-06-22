import React from "react";

export default function InsightsSectionHeader({ icon: Icon, label, sub }) {
  return (
    <div className="flex items-center gap-3 px-6 sm:px-10 pt-8 pb-6">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
        {Icon && <Icon className="w-3.5 h-3.5 text-accent" />}
      </div>
      <div>
        <h2 className="font-heading font-bold text-foreground text-sm leading-tight tracking-tight">
          {label}
        </h2>
        <p className="text-[11px] text-muted-foreground font-body mt-0.5 tracking-wide">
          {sub}
        </p>
      </div>
    </div>
  );
}