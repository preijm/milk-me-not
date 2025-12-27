import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Milk, Sparkles, ArrowRight, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import MenuBar from "@/components/MenuBar";
import BackgroundPattern from "@/components/BackgroundPattern";
import MobileFooter from "@/components/MobileFooter";
import { HomeStatsOverview } from "@/components/UserStatsOverview";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";

const Home = () => {
  const navigate = useNavigate();
  const isNativeApp = Capacitor.isNativePlatform();
  const [stats, setStats] = useState({
    totalTests: 0,
    brandsCovered: 0,
    activeMembers: 0
  });
  useEffect(() => {
    const fetchTrustIndicators = async () => {
      try {
        // Get all stats using secure function
        const { data: stats } = await supabase.rpc('get_public_stats');
        if (stats && stats.length > 0) {
          const stat = stats[0];
          setStats({
            totalTests: Number(stat.total_tests) || 0,
            brandsCovered: Number(stat.total_brands) || 0,
            activeMembers: Number(stat.total_members) || 0
          });
        }
      } catch (error) {
        console.error('Error fetching trust indicators:', error);
      }
    };
    fetchTrustIndicators();
  }, []);
  const handleStartJourney = async () => {
    const {
      data: {
        session
      }
    } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth', {
        state: {
          from: '/add'
        }
      });
    } else {
      navigate('/add');
    }
  };
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };
  return <div className="min-h-dvh overflow-hidden">
      <MenuBar />
      
      {/* Enhanced Hero Section */}
      <BackgroundPattern>
        <div className="container max-w-4xl mx-auto px-4 pt-8 lg:pt-16 flex items-center justify-center min-h-[calc(100dvh-120px)] lg:min-h-[calc(100dvh-180px)]">
          <div className="flex flex-col items-center justify-center text-center relative z-10">
            
            {/* Enhanced hero title with green color */}
            <div className="mb-4 md:mb-6 relative">
              <h1 className="text-[2.625rem] md:text-7xl lg:text-8xl font-bold mb-3 md:mb-4 max-w-4xl animate-fade-in relative text-brand-primary">
                Ditch the Moo.
                <br />
                <span className="flex items-center justify-center gap-4">
                  Find Your New!
                  
                </span>
              </h1>
            </div>
            
            {/* Enhanced description with better spacing */}
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl animate-fade-in leading-relaxed">
              Tired of tasteless plant milks? Rate, discover, and share your faves with a community that{"'"}s just as obsessed. Whether it{"'"}s for coffee, cereal, or cooking—find the dairy-free match that actually delivers.
            </p>
            
            {/* Enhanced CTA button with better animation */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 animate-fade-in mb-8 md:mb-12">
              <Button onClick={handleStartJourney} size="lg" className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 text-white shadow-lg hover:shadow-xl md:hover:-translate-y-1 transition-all duration-300 group bg-brand-secondary hover:bg-brand-secondary/90">
                <Milk className="mr-2 h-6 w-6 md:group-hover:rotate-12 transition-transform duration-300" />
                Start Your Taste Journey
                <ArrowRight className="ml-2 h-5 w-5 md:group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button asChild variant="outline" size="lg" className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 border-2 md:hover:bg-primary/5 transition-all duration-300">
                <Link to="/results">
                  Explore Results
                </Link>
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground animate-fade-in">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse bg-brand-primary"></div>
                <span>{formatNumber(stats.totalTests)} Reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse delay-300 bg-brand-secondary"></div>
                <span>{formatNumber(stats.brandsCovered)} Brands</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse delay-500 bg-purple-600"></div>
                <span>{formatNumber(stats.activeMembers)} Members</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile App Banner - Visible on all screens except when running in native app */}
        {!isNativeApp && (
          <div className="pb-8">
            <div className="container max-w-3xl mx-auto px-4">
              <Link to="/mobile-app" className="block">
                <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 hover:border-brand-primary/30">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-6 w-6 flex-shrink-0 text-brand-primary" />
                      <div>
                        <p className="font-semibold text-foreground">Mobile App Available</p>
                        <p className="text-sm text-muted-foreground">Get the native experience on Android</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 flex-shrink-0 text-gray-600" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}
        
        {/* Statistics hidden on homepage to avoid scrollbar */}
      </BackgroundPattern>
      
      <MobileFooter />
    </div>;
};
export default Home;