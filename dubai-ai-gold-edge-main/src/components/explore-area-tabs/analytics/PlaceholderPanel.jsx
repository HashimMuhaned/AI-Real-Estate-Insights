import React from "react";

export default function PlaceholderPanel({ icon: Icon, label, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-accent/10 border border-accent/20">
        {Icon && <Icon className="w-8 h-8 text-accent" />}
      </div>
      <div className="text-center max-w-xs">
        <p className="font-heading font-bold text-foreground text-xl mb-2 tracking-tight">
          {label}
        </p>
        <p className="text-sm text-muted-foreground font-body leading-relaxed">
          {sub} — coming soon
        </p>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-pulse" />
        <span className="text-[11px] text-muted-foreground font-body tracking-wide uppercase">
          In Development
        </span>
      </div>
    </div>
  );
}