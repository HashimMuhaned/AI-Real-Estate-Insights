"use client";

import { Check, Star, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const pricingPlans = [
  {
    name: "Free",
    icon: Zap,
    description: "Perfect for getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    badge: null,
    features: [
      "Access to 3 areas",
      "Basic market data",
      "5 AI insights per month",
      "Email support",
      "Mobile app access"
    ],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    popular: false
  },
  {
    name: "Pro",
    icon: Star,
    description: "For serious investors",
    monthlyPrice: 149,
    yearlyPrice: 1430,
    badge: "Most Popular",
    features: [
      "Access to all Dubai areas",
      "Real-time market data",
      "Unlimited AI insights",
      "Advanced charts & analytics",
      "Priority support",
      "Mobile app access",
      "Deal alerts & notifications",
      "ROI calculator",
      "Market trend reports"
    ],
    buttonText: "Start Pro Trial",
    buttonVariant: "default" as const,
    popular: true
  },
  {
    name: "Investor+",
    icon: Crown,
    description: "For portfolio managers",
    monthlyPrice: 349,
    yearlyPrice: 3350,
    badge: "Premium",
    features: [
      "Everything in Pro",
      "Custom investment strategies",
      "Dedicated account manager",
      "White-label reports",
      "API access",
      "Bulk property analysis",
      "Private market insights",
      "1-on-1 consultation calls",
      "Priority new features"
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    popular: false
  }
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 geometric-pattern"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Choose Your <span className="text-accent">Investment</span> Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            From first-time investors to seasoned portfolio managers, 
            we have the perfect plan to accelerate your Dubai real estate success.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-2 bg-muted rounded-xl">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                !isYearly ? 'bg-accent text-accent-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                isYearly ? 'bg-accent text-accent-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <Badge className="ml-2 bg-emerald text-emerald-foreground">Save 20%</Badge>
            </button>
          </div>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const Icon = plan.icon;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const originalYearlyPrice = plan.monthlyPrice * 12;
            
            return (
              <div 
                key={index}
                className={`luxury-card p-8 relative ${
                  plan.popular ? 'ring-2 ring-accent shadow-gold scale-105' : 'hover:shadow-luxury'
                } transition-all duration-300`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1">
                    {plan.badge}
                  </Badge>
                )}
                
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${
                    plan.name === 'Free' ? 'from-muted to-muted/80' :
                    plan.name === 'Pro' ? 'from-accent to-accent/80' :
                    'from-primary to-primary/80'
                  } flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
                
                {/* Pricing */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm text-muted-foreground">AED</span>
                    <span className="text-4xl font-bold text-foreground">{price.toLocaleString()}</span>
                    <span className="text-muted-foreground">/{isYearly ? 'year' : 'month'}</span>
                  </div>
                  {isYearly && plan.monthlyPrice > 0 && (
                    <div className="text-sm text-muted-foreground mt-2">
                      <span className="line-through">AED {originalYearlyPrice.toLocaleString()}/year</span>
                      <span className="text-emerald ml-2">Save AED {(originalYearlyPrice - price).toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <Button 
                  className={`w-full py-6 text-lg rounded-xl ${
                    plan.popular ? 'cta-gold' : ''
                  }`}
                  variant={plan.buttonVariant}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </div>
            );
          })}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            All plans include 14-day free trial • No setup fees • Cancel anytime
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Badge variant="outline" className="border-emerald text-emerald">
              🏆 Trusted by 10,000+ investors
            </Badge>
            <Badge variant="outline" className="border-accent text-accent">
              💎 A+ BBB Rating
            </Badge>
            <Badge variant="outline" className="border-primary text-primary">
              🛡️ Bank-level security
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;