import React from "react";
import { Bot, Sparkles, ArrowRight } from "lucide-react";

export default function AIAdvisorPanel({ name }) {
  const areaLabel = name ? name.replace(/-/g, " ") : "this area";

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6">
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-luxury">
        {/* Dark header section */}
        <div className="bg-primary px-10 pt-14 pb-12 text-center relative overflow-hidden">
          {/* Subtle geometric background */}
          <div className="absolute inset-0 opacity-[0.04]">
            <div className="absolute top-4 left-8 w-32 h-32 border border-accent rounded-full" />
            <div className="absolute bottom-4 right-8 w-24 h-24 border border-accent rounded-full" />
            <div className="absolute top-12 right-16 w-16 h-16 border border-accent/50 rounded-full" />
          </div>

          <div className="relative z-10">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-7 bg-accent/10 border border-accent/25">
              <Bot className="w-9 h-9 text-accent" />
            </div>
            <h3 className="font-heading font-bold text-primary-foreground text-2xl mb-3 tracking-tight">
              AI Area Advisor
            </h3>
            <p className="text-primary-foreground/40 text-sm leading-relaxed font-body max-w-sm mx-auto">
              Ask anything about {areaLabel} — investment potential, rental demand, price forecasts, and more.
            </p>
          </div>
        </div>

        {/* Action section */}
        <div className="bg-card px-10 py-8 text-center border-t border-border/50">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-7">
            {["Yield forecast", "Price trends", "Best units"].map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-body font-medium text-muted-foreground px-3 py-1.5 rounded-full bg-muted border border-border/50"
              >
                {tag}
              </span>
            ))}
          </div>
          <button className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-body font-semibold text-accent-foreground text-sm bg-accent hover:shadow-gold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            <Sparkles className="w-4 h-4" />
            Open AI Chat
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}