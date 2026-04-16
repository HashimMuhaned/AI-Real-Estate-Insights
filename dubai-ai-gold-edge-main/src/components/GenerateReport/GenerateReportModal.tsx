"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
import ReportStepPeriod from "./ReportStepPeriod";
import ReportStepScope from "./ReportStepScope";
import ReportStepInsights from "./ReportStepInsights";
import ReportStepSummary from "./ReportStepSummary";
import ReportPreviewPanel from "./ReportPreviewPanel";

const steps = [
  { id: 1, label: "Period" },
  { id: 2, label: "Scope" },
  { id: 3, label: "Insights" },
  { id: 4, label: "Review" },
];

const defaultConfig = {
  periodType: "",
  periodValue: "",
  scopeType: "",
  scopeValues: [],
  insights: [],
};

export default function GenerateReportModal({ open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState(defaultConfig);
  const [isGenerating, setIsGenerating] = useState(false);

  const canNext =
    (step === 1 && config.periodType && config.periodValue) ||
    (step === 2 && config.scopeType && (config.scopeType === "entire_dubai" || (config.scopeValues || []).length > 0)) ||
    (step === 3 && (config.insights || []).length > 0) ||
    step === 4;

  const handleGenerate = async () => {
    setIsGenerating(true);
    // placeholder
    await new Promise((r) => setTimeout(r, 2000));
    setIsGenerating(false);
    onOpenChange(false);
    setStep(1);
    setConfig(defaultConfig);
  };

  const handleClose = (val) => {
    if (!val) {
      setStep(1);
      setConfig(defaultConfig);
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden rounded-2xl border-border/50 [&>button]:hidden">
        <div className="flex h-[560px]">
          {/* Left — Preview Panel */}
          <div className="hidden lg:block w-[300px] shrink-0 p-3">
            <ReportPreviewPanel config={config} isGenerating={isGenerating} />
          </div>

          {/* Right — Stepper + Content */}
          <div className="flex-1 flex flex-col border-l border-border/30">
            {/* Stepper Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-1.5 mb-6">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-1.5 flex-1">
                    <button
                      onClick={() => s.id < step && setStep(s.id)}
                      disabled={s.id > step}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        s.id === step
                          ? "text-primary"
                          : s.id < step
                          ? "text-primary/60 cursor-pointer hover:text-primary"
                          : "text-muted-foreground/40"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          s.id === step
                            ? "bg-primary text-primary-foreground"
                            : s.id < step
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground/50"
                        }`}
                      >
                        {s.id < step ? <Check className="w-3.5 h-3.5" /> : s.id}
                      </span>
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-px ${s.id < step ? "bg-primary/30" : "bg-border/50"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              {step === 1 && <ReportStepPeriod config={config} onChange={setConfig} />}
              {step === 2 && <ReportStepScope config={config} onChange={setConfig} />}
              {step === 3 && <ReportStepInsights config={config} onChange={setConfig} />}
              {step === 4 && <ReportStepSummary config={config} />}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-border/30 flex items-center justify-between bg-card/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => step === 1 ? handleClose(false) : setStep(step - 1)}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                {step === 1 ? "Cancel" : "Back"}
              </Button>

              {step < 4 ? (
                <Button
                  size="sm"
                  onClick={() => setStep(step + 1)}
                  disabled={!canNext}
                  className="gap-1.5"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="gap-1.5 bg-primary hover:bg-primary/90"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}