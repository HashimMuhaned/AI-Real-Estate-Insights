import { MapPin, BarChart3, TrendingUp, ChevronRight } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    number: "01",
    title: "Choose an Area",
    description: "Select from Dubai's prime locations using our interactive map with real-time market data and investment scores.",
    color: "accent"
  },
  {
    icon: BarChart3,
    number: "02", 
    title: "Explore Data & AI Insights",
    description: "Dive deep into property analytics, price trends, ROI projections, and AI-powered market predictions.",
    color: "emerald"
  },
  {
    icon: TrendingUp,
    number: "03",
    title: "Make Informed Decisions",
    description: "Get personalized investment recommendations and execute deals with confidence backed by data-driven insights.",
    color: "primary"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-muted relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 hero-pattern opacity-20"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            How It <span className="text-accent">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform your real estate investment strategy 
            with the power of artificial intelligence.
          </p>
        </div>
        
        {/* Steps */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;
              
              return (
                <div key={index} className="relative">
                  {/* Step Card */}
                  <div className="luxury-card p-8 text-center group hover:shadow-luxury transition-all duration-300">
                    {/* Step Number */}
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-accent to-accent/80 text-accent-foreground font-bold text-lg mb-6">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${
                      step.color === 'accent' ? 'from-accent to-accent/80' :
                      step.color === 'emerald' ? 'from-emerald to-emerald/80' :
                      'from-primary to-primary/80'
                    } flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-2xl font-semibold text-foreground mb-4">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Arrow (Desktop only) */}
                  {!isLast && (
                    <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                      <ChevronRight className="w-8 h-8 text-accent animate-float" />
                    </div>
                  )}
                  
                  {/* Mobile Arrow */}
                  {!isLast && (
                    <div className="lg:hidden flex justify-center mt-8 mb-8">
                      <div className="w-px h-12 bg-gradient-to-b from-accent to-transparent"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="luxury-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Ready to Start Your Investment Journey?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of successful investors who trust our AI-powered platform 
              to guide their Dubai real estate decisions.
            </p>
            <button className="cta-gold px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2 hover:shadow-gold transition-all duration-300">
              Get Started Now
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;