import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarDays, CalendarRange } from "lucide-react";

const periodTypes = [
  { value: "monthly", label: "Monthly", icon: Calendar },
  { value: "quarterly", label: "Quarterly", icon: CalendarDays },
  { value: "yearly", label: "Yearly", icon: CalendarRange },
];

const months2025 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const quarters = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"];
const years = ["2025", "2024", "2023", "2022", "2021"];

export default function ReportStepPeriod({ config, onChange }) {
  const handlePeriodType = (val) => onChange({ ...config, periodType: val, periodValue: "" });
  const handlePeriodValue = (val) => onChange({ ...config, periodValue: val });

  const options =
    config.periodType === "monthly" ? months2025.map((m) => `${m} 2025`) :
    config.periodType === "quarterly" ? quarters :
    years;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Report Frequency
        </h3>
        <RadioGroup value={config.periodType} onValueChange={handlePeriodType} className="grid grid-cols-3 gap-3">
          {periodTypes.map(({ value, label, icon: Icon }) => (
            <Label
              key={value}
              htmlFor={`period-${value}`}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 cursor-pointer transition-all duration-200 ${
                config.periodType === value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
              }`}
            >
              <RadioGroupItem value={value} id={`period-${value}`} className="sr-only" />
              <Icon className={`w-5 h-5 ${config.periodType === value ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-medium ${config.periodType === value ? "text-primary" : "text-foreground"}`}>
                {label}
              </span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {config.periodType && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Select Period
          </h3>
          <Select value={config.periodValue} onValueChange={handlePeriodValue}>
            <SelectTrigger className="w-full h-12 rounded-xl border-border/50">
              <SelectValue placeholder={`Choose ${config.periodType} period...`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}