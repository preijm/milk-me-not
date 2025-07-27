import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Milk, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MenuBar from "@/components/MenuBar";
import BackgroundPattern from "@/components/BackgroundPattern";
import MobileFooter from "@/components/MobileFooter";
import { HomeStatsOverview } from "@/components/UserStatsOverview";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTests: 0,
    brandsCovered: 0,
    activeMembers: 0
  });

  useEffect(() => {
    const fetchTrustIndicators = async () => {
      try {
        // Get total tests count
        const { count: totalTestsCount } = await supabase
          .from('milk_tests')
          .select('*', { count: 'exact', head: true });

        // Get brands covered count
        const { count: brandsCount } = await supabase
          .from('brands')
          .select('*', { count: 'exact', head: true });

        // Get active members count
        const { count: membersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalTests: totalTestsCount || 0,
          brandsCovered: brandsCount || 0,
          activeMembers: membersCount || 0
        });
      } catch (error) {
        console.error('Error fetching trust indicators:', error);
      }
    };

    fetchTrustIndicators();
  }, []);

  const handleStartJourney = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth', { state: { from: '/add' } });
    } else {
      navigate('/add');
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
    }
    return num.toString() + '+';
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
            
            {/* Enhanced hero title with green color */}
            <div className="mb-6 relative">
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold mb-4 max-w-4xl animate-fade-in relative" style={{ color: '#00BF63' }}>
                Ditch the Moo.
                <br />
                <span className="flex items-center justify-center gap-4">
                  Find Your New!
                  <Sparkles className="w-12 h-12 md:w-16 md:h-16 animate-pulse" style={{ color: '#00BF63' }} />
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
                className="text-lg px-8 py-4 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group" style={{ backgroundColor: '#2144ff' }}
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
                <span>{formatNumber(stats.totalTests)} Reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                <span>{formatNumber(stats.brandsCovered)} Brands</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-500"></div>
                <span>{formatNumber(stats.activeMembers)} Members</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Statistics Section */}
        <div className="relative z-10 mt-20">
          <HomeStatsOverview />
        </div>
      </BackgroundPattern>
      
      <MobileFooter />
    </div>
  );
};

export default Home;
