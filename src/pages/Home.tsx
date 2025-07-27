import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Milk, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MenuBar from "@/components/MenuBar";
import BackgroundPattern from "@/components/BackgroundPattern";
import MobileFooter from "@/components/MobileFooter";
import { HomeStatsOverview } from "@/components/UserStatsOverview";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorks from "@/components/HowItWorks";
import TestimonialsSection from "@/components/TestimonialsSection";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const navigate = useNavigate();

  const handleStartJourney = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth', { state: { from: '/add' } });
    } else {
      navigate('/add');
    }
  };

  return (
    <div className="min-h-screen">
      <MenuBar />
      
      {/* Enhanced Hero Section */}
      <BackgroundPattern>
        <div className="container max-w-6xl mx-auto px-4 pt-32 md:pt-40">
          <div className="flex flex-col items-center justify-center text-center relative z-10 mt-8 md:mt-16">
            {/* Floating decorative elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-full blur-xl animate-pulse delay-1000"></div>
            
            {/* Enhanced hero title with better typography */}
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-3xl transform -rotate-6"></div>
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold mb-4 max-w-4xl animate-fade-in relative">
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Ditch the Moo.
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent flex items-center justify-center gap-4">
                  Find Your New!
                  <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse" />
                </span>
              </h1>
            </div>
            
            {/* Enhanced description with better spacing */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl animate-fade-in leading-relaxed">
              Tired of tasteless plant milks? Rate, discover, and share your faves with a community that{"'"}s just as obsessed. Whether it{"'"}s for coffee, cereal, or cooking—find the dairy-free match that actually delivers.
            </p>
            
            {/* Enhanced CTA button with better animation */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in mb-12">
              <Button 
                onClick={handleStartJourney}
                size="lg" 
                className="text-lg px-8 py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <Milk className="mr-2 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                Start Your Taste Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button 
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 border-2 hover:bg-primary/5 transition-all duration-300"
              >
                <Link to="/results">
                  Explore Results
                </Link>
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>1000+ Reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                <span>50+ Brands</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-500"></div>
                <span>Growing Community</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Statistics Section */}
        <div className="relative z-10 mt-20">
          <HomeStatsOverview />
        </div>
      </BackgroundPattern>
      
      {/* New Sections */}
      <FeaturesSection />
      <HowItWorks />
      <TestimonialsSection />
      
      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Find Your Perfect Plant Milk?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community today and discover plant-based alternatives that actually taste great.
          </p>
          <Button 
            onClick={handleStartJourney}
            size="lg"
            className="text-lg px-8 py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <Milk className="mr-2 h-6 w-6" />
            Get Started Now
          </Button>
        </div>
      </section>
      
      <MobileFooter />
    </div>
  );
};

export default Home;
