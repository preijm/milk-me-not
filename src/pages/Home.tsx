import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Milk } from "lucide-react";
import { Button } from "@/components/ui/button";
import MenuBar from "@/components/MenuBar";
import BackgroundPattern from "@/components/BackgroundPattern";
import MobileFooter from "@/components/MobileFooter";
import { HomeStatsOverview } from "@/components/UserStatsOverview";
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
      
      <BackgroundPattern>
        <div className="container max-w-6xl mx-auto px-4 pt-32">
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 max-w-4xl animate-fade-in" style={{ color: '#00BF63' }}>
              Ditch the Moo. <br />
              <span style={{ color: '#00BF63' }}>Find Your New!</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl animate-fade-in">
              Tired of tasteless plant milks? Rate, discover, and share your faves with a community that's just as obsessed. Whether it's for coffee, cereal, or cooking—find the dairy-free match that actually delivers.
            </p>
            
            <Button 
              onClick={handleStartJourney}
              size="lg" 
              variant="brand"
              className="text-lg px-8 animate-fade-in"
            >
              <Milk className="mr-2 h-6 w-6" />
              Start Your Taste Journey
            </Button>
          </div>
        </div>
      </BackgroundPattern>
      
      {/* Statistics Section */}
      <HomeStatsOverview />
      
      
      <MobileFooter />
    </div>
  );
};

export default Home;
