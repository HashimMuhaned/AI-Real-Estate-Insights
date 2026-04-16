import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Globe, Building2, MapPin, Layers, Search, X } from "lucide-react";

const scopeTypes = [
  { value: "entire_dubai", label: "Entire Dubai", icon: Globe },
  { value: "property_type", label: "By Property Type", icon: Building2 },
  { value: "area", label: "By Area", icon: MapPin },
  { value: "project", label: "By Project", icon: Layers },
];

const propertyTypes = ["Apartments", "Villas", "Townhouses", "Commercial"];
const areas = ["Dubai Marina", "JVC", "Palm Jumeirah", "Downtown Dubai", "Business Bay", "JBR", "DIFC", "Dubai Hills", "Arabian Ranches", "Motor City", "Al Barsha", "Dubai South"];
const projects = ["Emaar Beachfront", "Dubai Creek Harbour", "MBR City", "Damac Lagoons", "Sobha Hartland", "Nakheel Palm", "Meraas City Walk", "Azizi Riviera", "Danube Olivz", "Binghatti Mystic"];

export default function ReportStepScope({ config, onChange }) {
  const [search, setSearch] = useState("");
  const handleScope = (val) => { setSearch(""); onChange({ ...config, scopeType: val, scopeValues: [] }); };

  const toggleValue = (val) => {
    const current = config.scopeValues || [];
    const next = current.includes(val) ? current.filter((v) => v !== val) : [...current, val];
    onChange({ ...config, scopeValues: next });
  };

  const allItems =
    config.scopeType === "property_type" ? propertyTypes :
    config.scopeType === "area" ? areas :
    config.scopeType === "project" ? projects : [];

  const items = search.trim()
    ? allItems.filter((i) => i.toLowerCase().includes(search.toLowerCase()))
    : allItems;

  const showSearch = config.scopeType === "area" || config.scopeType === "project";

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Report Scope
        </h3>
        <RadioGroup value={config.scopeType} onValueChange={handleScope} className="grid grid-cols-2 gap-3">
          {scopeTypes.map(({ value, label, icon: Icon }) => (
            <Label
              key={value}
              htmlFor={`scope-${value}`}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                config.scopeType === value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
              }`}
            >
              <RadioGroupItem value={value} id={`scope-${value}`} className="sr-only" />
              <Icon className={`w-5 h-5 shrink-0 ${config.scopeType === value ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-medium ${config.scopeType === value ? "text-primary" : "text-foreground"}`}>
                {label}
              </span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {allItems.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Select {config.scopeType === "property_type" ? "Property Types" : config.scopeType === "area" ? "Areas" : "Projects"}
            </h3>
            {(config.scopeValues || []).length > 0 && (
              <span className="text-xs text-primary font-medium">{(config.scopeValues || []).length} selected</span>
            )}
          </div>
          {showSearch && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${config.scopeType === "area" ? "areas" : "projects"}...`}
                className="pl-8 pr-8 h-9 text-sm rounded-lg border-border/50"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2.5 max-h-[200px] overflow-y-auto pr-1">
            {items.length === 0 ? (
              <div className="col-span-2 text-center py-6 text-sm text-muted-foreground">
                No results for "{search}"
              </div>
            ) : items.map((item) => {
              const checked = (config.scopeValues || []).includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all duration-150 ${
                    checked ? "border-primary/40 bg-primary/5" : "border-border/40 hover:bg-muted/30"
                  }`}
                >
                  <Checkbox checked={checked} onCheckedChange={() => toggleValue(item)} />
                  <span className="text-sm text-foreground">{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}