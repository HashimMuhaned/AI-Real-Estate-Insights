import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Lightbulb } from "lucide-react";
import { insightCategories } from "./ReportStepInsights";

export default function ReportStepSummary({ config }) {
  const selectedInsights = config.insights || [];

  const groupedInsights = insightCategories
    .map((cat) => ({
      ...cat,
      selected: cat.items.filter((i) => selectedInsights.includes(i)),
    }))
    .filter((cat) => cat.selected.length > 0);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Period</div>
            <div className="text-sm font-medium text-foreground">
              {config.periodValue || "Not selected"}{" "}
              <span className="text-muted-foreground">({config.periodType})</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Scope</div>
            <div className="text-sm font-medium text-foreground">
              {config.scopeType === "entire_dubai"
                ? "Entire Dubai"
                : (config.scopeValues || []).join(", ") || "Not selected"}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Insights ({selectedInsights.length})
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {groupedInsights.map((cat) => (
                <Badge key={cat.id} variant="secondary" className="text-xs font-normal">
                  {cat.title} ({cat.selected.length})
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {groupedInsights.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Insight Details</h4>
          {groupedInsights.map((cat) => (
            <div key={cat.id} className="text-sm">
              <span className="font-medium text-foreground">{cat.title}: </span>
              <span className="text-muted-foreground">{cat.selected.join(", ")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}