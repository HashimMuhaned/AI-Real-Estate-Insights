"use client";

export default function AIAdvisorCTA() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-20">
      <div className="relative overflow-hidden rounded-2xl p-10 md:p-14 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))] text-primary-foreground">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 hero-pattern opacity-40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Text */}
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
              Stop guessing. Start investing with data.
            </h2>

            <p className="mt-4 text-sm text-primary-foreground/80">
              Make smarter real estate decisions in Dubai using AI-powered insights,
              market trends, and predictive analytics.
            </p>
          </div>

          {/* Button */}
          <div>
            <button className="cta-gold px-6 py-3 rounded-lg font-medium text-sm transition">
              Try AI Advisor
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}