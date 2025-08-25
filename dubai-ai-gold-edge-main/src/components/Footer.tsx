import { Building2, Linkedin, Twitter, Send, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 hero-pattern opacity-10"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-16">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Building2 className="w-6 h-6 text-accent-foreground" />
              </div>
              <span className="text-2xl font-bold">InvestSmart Dubai</span>
            </div>
            <p className="text-primary-foreground/80 mb-6 leading-relaxed max-w-md">
              The leading AI-powered real estate investment platform for Dubai's property market. 
              Make smarter investment decisions with cutting-edge technology and deep market insights.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <MapPin className="w-5 h-5 text-accent" />
                <span>DIFC, Dubai, United Arab Emirates</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <Phone className="w-5 h-5 text-accent" />
                <span>+971 4 123 4567</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <Mail className="w-5 h-5 text-accent" />
                <span>hello@investsmart.ae</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Platform</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Area Explorer
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Market Analytics
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  AI Insights
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Deal Alerts
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  ROI Calculator
                </a>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Press
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Social Links & Legal */}
        <div className="border-t border-primary-foreground/20 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-primary-foreground/80">Follow us:</span>
              <div className="flex gap-3">
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-colors group"
                >
                  <Linkedin className="w-5 h-5 text-primary-foreground/80 group-hover:text-accent-foreground" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-colors group"
                >
                  <Twitter className="w-5 h-5 text-primary-foreground/80 group-hover:text-accent-foreground" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-colors group"
                >
                  <Send className="w-5 h-5 text-primary-foreground/80 group-hover:text-accent-foreground" />
                </a>
              </div>
            </div>
            
            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="text-center mt-8 pt-8 border-t border-primary-foreground/20">
            <p className="text-primary-foreground/80 flex items-center justify-center gap-2">
              © 2024 InvestSmart Dubai. Built in Dubai 
              <span className="text-lg">🇦🇪</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;