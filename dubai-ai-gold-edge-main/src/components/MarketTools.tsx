import { 
  MapPin, 
  Building2, 
  TrendingUp, 
  Clock, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  FileText,
  Target,
  Zap,
  Diamond,
  DollarSign,
  Navigation,
  Layers
} from "lucide-react";

const MarketTools = () => {
  const tools = [
    { icon: MapPin, title: "Villas Market Map", color: "text-blue-400" },
    { icon: Building2, title: "Dubai Projects Analysis", color: "text-emerald-400" },
    { icon: TrendingUp, title: "Top Selling Projects", color: "text-green-400" },
    { icon: Clock, title: "Slow Moving Projects", color: "text-orange-400" },
    { icon: Users, title: "Top Real Estate Developers", color: "text-purple-400" },
    { icon: Calendar, title: "Daily Property Summary", color: "text-cyan-400" },
    { icon: BarChart3, title: "Weekly Property Summary", color: "text-indigo-400" },
    { icon: PieChart, title: "Monthly Property Sales", color: "text-pink-400" },
    { icon: Activity, title: "Monthly Property Summary", color: "text-yellow-400" },
    { icon: FileText, title: "Yearly Property Summary", color: "text-red-400" },
    { icon: Target, title: "Dubai Areas Analysis", color: "text-teal-400" },
    { icon: Zap, title: "Future Supply Analysis", color: "text-violet-400" },
    { icon: Diamond, title: "Luxury Property Tracker", color: "text-amber-400" },
    { icon: DollarSign, title: "Capital Gain Analysis", color: "text-lime-400" },
    { icon: Navigation, title: "Nearby Prices Map", color: "text-sky-400" },
    { icon: Layers, title: "Sales Volume Map", color: "text-rose-400" }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Dubai Real Estate Analytics
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore live dashboards and AI-enhanced tools to understand the market like a pro.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, index) => {
            const IconComponent = tool.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-xl bg-card border border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-luxury hover:scale-105 cursor-pointer"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors duration-300">
                    <IconComponent className={`w-8 h-8 ${tool.color} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors duration-300">
                    {tool.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MarketTools;