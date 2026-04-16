"use client"

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Sparkles } from "lucide-react";
import ReportGrid from "./GenerateReport/ReportGrid";
import GenerateReportModal from "./GenerateReport/GenerateReportModal";

export default function MarketReports() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Market Reports
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Dig into monthly, quarterly, and yearly reports powered by real transaction data and AI insights.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="download" className="w-full">
          <div className="flex justify-center mb-10">
            <TabsList className="h-12 p-1 bg-muted/60 rounded-xl">
              <TabsTrigger
                value="download"
                className="h-10 px-6 rounded-lg gap-2 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download Ready Reports
              </TabsTrigger>
              <TabsTrigger
                value="generate"
                className="h-10 px-6 rounded-lg gap-2 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="download" className="mt-0">
            <ReportGrid />
          </TabsContent>

          <TabsContent value="generate" className="mt-0">
            <div className="max-w-3xl mx-auto">
              {/* Main card */}
              <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[var(--shadow-luxury)]">
                {/* Gold top bar */}
                <div className="h-1 w-full" style={{ background: "var(--gradient-gold)" }} />

                {/* Background pattern */}
                <div className="absolute inset-0 hero-pattern opacity-60 pointer-events-none" />

                <div className="relative px-10 py-14 text-center space-y-8">
                  {/* Icon */}
                  <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center border border-accent/30" style={{ background: "var(--gradient-gold)" }}>
                    <Sparkles className="w-7 h-7 text-accent-foreground" />
                  </div>

                  {/* Text */}
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-foreground">
                      Create a Custom AI Report
                    </h3>
                    <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                      Choose your period, scope, and the exact insights you need. Our AI will compile
                      a comprehensive market report tailored to your requirements.
                    </p>
                  </div>

                  {/* Feature pills */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {["Sales & Rentals", "Top Areas", "YoY Trends", "AI Predictions", "Custom Scope"].map((f) => (
                      <span key={f} className="text-xs font-medium px-3 py-1.5 rounded-full border border-border/60 bg-muted/60 text-muted-foreground">
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button
                    size="lg"
                    onClick={() => setModalOpen(true)}
                    className="px-10 py-3 text-base gap-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate a Report
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <GenerateReportModal open={modalOpen} onOpenChange={setModalOpen} />
      </div>
    </section>
  );
}