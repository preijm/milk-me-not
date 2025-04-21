import React from "react";
import MenuBar from "@/components/MenuBar";
import { Smile, Rocket, Heart } from "lucide-react";
import BackgroundPatternWithOverlay from "@/components/BackgroundPatternWithOverlay";
const About = () => {
  return <div className="min-h-screen">
      <MenuBar />
      <BackgroundPatternWithOverlay>
        <div className="flex items-center justify-center min-h-screen">
          <div className="container max-w-7xl mx-auto px-4 py-8 pt-16 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-16 w-16 rounded-full flex items-center justify-center bg-[#00bf62]">
                    <Rocket className="w-8 h-8 text-[#FFFFFF] animate-none" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Our Crazy Mission</h2>
                  <p className="text-gray-700">
                    We're on a wild adventure to rescue taste buds from boring milk! 
                    Whether you're a coffee connoisseur or a cereal enthusiast, 
                    we're here to make your dairy-free dreams come true.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-16 w-16 rounded-full flex items-center justify-center bg-[#00bf62]">
                    <Smile className="w-8 h-8 text-[#FFFFFF] animate-none" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">How We Roll</h2>
                  <p className="text-gray-700">
                    Our superhero community of milk testers dive deep into plant-based 
                    milks faster than you can say "udderly awesome"! We rate, we taste, 
                    we conquer the milk universe one sip at a time.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-16 w-16 rounded-full flex items-center justify-center bg-[#00bf62]">
                    <Heart className="w-8 h-8 text-[#FFFFFF] animate-pulse" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Join Our Milk Mob</h2>
                  <p className="text-gray-700">
                    Create an account and become a milk detective! Share your epic 
                    taste adventures, help others find their perfect plant-based 
                    sidekick, and let's make boring milk history!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BackgroundPatternWithOverlay>
    </div>;
};
export default About;