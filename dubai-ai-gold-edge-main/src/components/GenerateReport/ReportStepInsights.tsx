import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, Home, BarChart3, Trophy, Star, Globe, Brain } from "lucide-react";

const insightCategories = [
  {
    id: "sales",
    title: "Sales Metrics",
    icon: TrendingUp,
    items: [
      "Total Sale Volume & Value",
      "Transaction Breakdown by Property Type",
      "Most Expensive Sale of the Period",
    ],
  },
  {
    id: "rental",
    title: "Rental Metrics",
    icon: Home,
    items: [
      "Avg Rent by Property Type",
      "Rental Yield Estimation",
    ],
  },
  {
    id: "trends",
    title: "Trends & Comparisons",
    icon: BarChart3,
    items: [
      "Month-over-Month Changes",
      "Year-over-Year Changes",
      "Pricing vs Last Period Comparison Table",
    ],
  },
  {
    id: "top_areas",
    title: "Top Areas / Projects",
    icon: Trophy,
    items: [
      "Areas by Transaction Value",
      "Projects by Sales Volume",
      "Growth Leaders & Laggards",
    ],
  },
  {
    id: "highlights",
    title: "Market Records & Highlights",
    icon: Star,
    items: [
      "Most Expensive Villa Sold",
      "Most Expensive Apartment Sold",
      "Top Developer or Project by Sales",
    ],
  },
  {
    id: "external",
    title: "External Context & Insights",
    icon: Globe,
    items: [
      "Economic Drivers (interest rates, policy changes)",
      "Infrastructure Projects (metro expansions, Expo sites)",
      "Population & Demographics Shifts",
    ],
  },
  {
    id: "ai",
    title: "AI Forward Outlook",
    icon: Brain,
    items: [
      "Future Price Movement Prediction",
      "Buy / Hold / Rent Recommendations",
    ],
  },
];

export { insightCategories };

export default function ReportStepInsights({ config, onChange }) {
  const selected = config.insights || [];

  const toggle = (item) => {
    const next = selected.includes(item)
      ? selected.filter((i) => i !== item)
      : [...selected, item];
    onChange({ ...config, insights: next });
  };

  const toggleCategory = (category) => {
    const allSelected = category.items.every((i) => selected.includes(i));
    const next = allSelected
      ? selected.filter((i) => !category.items.includes(i))
      : [...new Set([...selected, ...category.items])];
    onChange({ ...config, insights: next });
  };

  return (
    <ScrollArea className="h-[420px] pr-2">
      <div className="space-y-5">
        {insightCategories.map((cat) => {
          const Icon = cat.icon;
          const allChecked = cat.items.every((i) => selected.includes(i));
          const someChecked = cat.items.some((i) => selected.includes(i));

          return (
            <div key={cat.id} className="rounded-xl border border-border/40 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={allChecked}
                  className={someChecked && !allChecked ? "opacity-60" : ""}
                  onCheckedChange={() => toggleCategory(cat)}
                />
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{cat.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {cat.items.filter((i) => selected.includes(i)).length}/{cat.items.length}
                </span>
              </button>
              <div className="px-4 py-2.5 space-y-1.5">
                {cat.items.map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-3 py-1.5 cursor-pointer hover:bg-muted/20 rounded-md px-1 transition-colors"
                  >
                    <Checkbox checked={selected.includes(item)} onCheckedChange={() => toggle(item)} />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}