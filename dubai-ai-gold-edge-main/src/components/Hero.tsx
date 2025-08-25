import { Button } from "@/components/ui/button";
import { ChevronRight, TrendingUp, MapPin } from "lucide-react";
import heroImage from "@/assets/dubai-skyline-hero.jpg";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      >
        <Image src={heroImage} alt="Dubai"/>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent"></div>
      </div>
      
      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 hero-pattern opacity-30"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full px-6 py-2 text-accent font-medium mb-8 animate-fade-in-up">
            <TrendingUp className="w-4 h-4" />
            AI-Powered Real Estate Intelligence
          </div>
          
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground mb-6 leading-tight animate-fade-in-up">
            Invest <span className="text-accent">Smarter</span> in 
            <br />
            Dubai Real Estate
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
            AI-powered insights, real-time charts, and future-ready decisions 
            for the world's most dynamic property market
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up">
            <Button size="lg" className="cta-gold text-lg px-8 py-6 rounded-xl group">
              <MapPin className="w-5 h-5 mr-2" />
              Explore Areas
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 rounded-xl border-primary-foreground/30 hover:bg-primary-foreground/10 backdrop-blur-sm"
            >
              Try the Demo
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          
          {/* Stats */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-16 animate-fade-in-up">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">AED 2.5B+</div>
              <div className="text-primary-foreground/80">Analyzed Transactions</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-primary-foreground/30"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">50,000+</div>
              <div className="text-primary-foreground/80">Properties Tracked</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-primary-foreground/30"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">98.5%</div>
              <div className="text-primary-foreground/80">Prediction Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;