import { Brain, BarChart3, Map, MessageSquare, Bell, Building2 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Investment Insights",
    description: "Advanced machine learning algorithms analyze market trends, price patterns, and investment opportunities to guide your decisions.",
    gradient: "from-accent to-accent/80"
  },
  {
    icon: BarChart3,
    title: "Smart, Interactive Charts",
    description: "Real-time data visualization with customizable charts showing price trends, ROI projections, and market comparisons.",
    gradient: "from-emerald to-emerald/80"
  },
  {
    icon: Map,
    title: "Area Explorer with Heatmaps",
    description: "Interactive Dubai map with color-coded investment zones, showing price per sqft, growth potential, and infrastructure development.",
    gradient: "from-primary to-primary/80"
  },
  {
    icon: MessageSquare,
    title: "Real Estate AI Advisor",
    description: "Chat with our AI assistant for instant property advice, market insights, and personalized investment recommendations.",
    gradient: "from-accent to-accent/80"
  },
  {
    icon: Bell,
    title: "Smart Alerts & Deal Watcher",
    description: "Get notified instantly when properties matching your criteria become available or when market conditions change.",
    gradient: "from-emerald to-emerald/80"
  },
  {
    icon: Building2,
    title: "Projects & Infrastructure Tracker",
    description: "Stay ahead with information on upcoming developments, metro extensions, and infrastructure projects affecting property values.",
    gradient: "from-primary to-primary/80"
  }
];

const Features = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 geometric-pattern"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need to 
            <span className="text-accent"> Dominate </span>
            Dubai Real Estate
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform combines cutting-edge AI technology with deep market expertise 
            to give you the competitive edge in Dubai's property market.
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="luxury-card p-8 group hover:shadow-luxury transition-all duration-300 hover:-translate-y-2"
              >
                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-accent transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover Effect Line */}
                <div className="w-0 h-0.5 bg-gradient-to-r from-accent to-emerald mt-6 group-hover:w-full transition-all duration-500"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;