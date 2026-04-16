import { Download, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { insightCategories } from "./ReportStepInsights";
import {
  SalesTrendChart,
  PropertyMixChart,
  RentalYieldChart,
  YoYComparisonChart,
  TopAreasChart,
} from "./DemoCharts";

const kpis = [
  { label: "Transactions", value: "3,580" },
  { label: "Total Value", value: "AED 10.2B" },
  { label: "Avg Yield", value: "6.8%" },
];

function MiniKPIs() {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {kpis.map((k) => (
        <div key={k.label} className="bg-primary/5 rounded-lg p-2 text-center">
          <div className="text-[9px] text-muted-foreground leading-tight">{k.label}</div>
          <div className="text-[11px] font-bold text-foreground mt-0.5">{k.value}</div>
        </div>
      ))}
    </div>
  );
}

function ChartBlock({ title, children }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

export default function ReportPreviewPanel({ config, isGenerating }) {
  const hasPeriod = !!config.periodValue;
  const insights = config.insights || [];

  const scopeLabel =
    config.scopeType === "entire_dubai"
      ? "Entire Dubai"
      : (config.scopeValues || []).join(", ") || "—";

  const showSales = insights.some((i) => insightCategories[0].items.includes(i));
  const showRental = insights.some((i) => insightCategories[1].items.includes(i));
  const showTrends = insights.some((i) => insightCategories[2].items.includes(i));
  const showAreas = insights.some((i) => insightCategories[3].items.includes(i));

  // Show all charts when nothing selected yet (just period chosen)
  const showAll = hasPeriod && insights.length === 0;

  return (
    <div className="h-full flex flex-col bg-card rounded-xl border border-border/40 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30 bg-gradient-to-r from-primary to-[hsl(210_60%_20%)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-primary-foreground/80" />
          <span className="text-xs font-bold text-primary-foreground">Live Preview</span>
          {hasPeriod && (
            <Badge className="text-[9px] h-4 px-1.5 bg-accent text-accent-foreground font-semibold">
              {config.periodValue}
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] gap-1 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
          disabled={!hasPeriod}
        >
          <Download className="w-2.5 h-2.5" />
          PDF
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!hasPeriod ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Configure your report</p>
              <p className="text-[10px] text-muted-foreground/50 mt-1">Select a period to see a live preview</p>
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-4">
            {/* Report title */}
            <div className="text-center pb-3 border-b border-border/30">
              <h3 className="text-xs font-bold text-foreground">Dubai Real Estate Market Report</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{config.periodValue} · {scopeLabel}</p>
            </div>

            {/* KPIs always shown */}
            <MiniKPIs />

            {/* Sales Trend */}
            {(showSales || showAll) && (
              <ChartBlock title="Sales Volume & Value">
                <SalesTrendChart compact />
              </ChartBlock>
            )}

            {/* Property Mix */}
            {(showSales || showAll) && (
              <ChartBlock title="Property Mix">
                <PropertyMixChart compact />
              </ChartBlock>
            )}

            {/* Rental */}
            {(showRental || showAll) && (
              <ChartBlock title="Rental Yield">
                <RentalYieldChart compact />
              </ChartBlock>
            )}

            {/* Trends */}
            {(showTrends || showAll) && (
              <ChartBlock title="Year-over-Year">
                <YoYComparisonChart compact />
              </ChartBlock>
            )}

            {/* Top Areas */}
            {(showAreas || showAll) && (
              <ChartBlock title="Top Areas">
                <TopAreasChart compact />
              </ChartBlock>
            )}

            <p className="text-center text-[9px] text-muted-foreground/40 pt-1">
              Demo data — real data loads on generation
            </p>
          </div>
        )}
      </div>

      {/* Generating Footer */}
      {isGenerating && (
        <div className="px-4 py-3 border-t border-border/30 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
            <span className="text-[10px] text-muted-foreground font-medium">Generating your report...</span>
          </div>
        </div>
      )}
    </div>
  );
}