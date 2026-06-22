import React from "react";

export default function ChartSection({ number, label, sub, children }) {
  return (
    <div className="border-t border-border/30 first:border-t-0">
      {/* Row header */}
      <div className="flex items-baseline gap-3 px-6 sm:px-10 pt-10 pb-4">
        <span className="font-mono text-[10px] font-bold tabular-nums text-accent/70 tracking-[0.15em] select-none">
          {number}
        </span>
        <div>
          <h3 className="font-heading font-semibold text-foreground text-base sm:text-[17px] tracking-tight leading-snug">
            {label}
          </h3>
          {sub && (
            <p className="text-[12px] text-muted-foreground font-body mt-0.5 leading-relaxed">
              {sub}
            </p>
          )}
        </div>
      </div>

      {/* Chart — full bleed, zero horizontal constraint */}
      <div className="w-full pb-14">
        {children}
      </div>
    </div>
  );
}