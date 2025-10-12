import React from "react";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import { Smile, Rocket, Heart } from "lucide-react";
import BackgroundPattern from "@/components/BackgroundPattern";
const About = () => {
  return <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="flex items-center justify-center min-h-screen pt-16 pb-20 sm:pb-8">
          <div className="container max-w-7xl mx-auto px-4 py-4 sm:py-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow min-h-[200px] sm:min-h-[280px] flex">
                <div className="flex flex-row sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-4 w-full">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center bg-[#00bf62] flex-shrink-0">
                    <Rocket className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFFFFF] animate-ping" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Our Crazy Mission</h2>
                    <p className="text-gray-700 text-sm sm:text-base">
                      We're on a wild adventure to rescue taste buds from boring milk! 
                      Whether you're a coffee connoisseur or a cereal enthusiast, 
                      we're here to make your dairy-free dreams come true.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow min-h-[200px] sm:min-h-[280px] flex">
                <div className="flex flex-row sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-4 w-full">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center bg-[#00bf62] flex-shrink-0">
                    <Smile className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFFFFF] animate-spin" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">How We Roll</h2>
                    <p className="text-gray-700 text-sm sm:text-base">
                      Our superhero community of milk testers dive deep into plant-based 
                      milks faster than you can say "udderly awesome"! We rate, we taste, 
                      we conquer the milk universe one sip at a time.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow min-h-[200px] sm:min-h-[280px] flex">
                <div className="flex flex-row sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-4 w-full">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center bg-[#00bf62] flex-shrink-0">
                    <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFFFFF] animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Join Our Milk Mob</h2>
                    <p className="text-gray-700 text-sm sm:text-base">
                      Create an account and become a milk detective! Share your epic 
                      taste adventures, help others find their perfect plant-based 
                      sidekick, and let's make boring milk history!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BackgroundPattern>
      
      <MobileFooter />
    </div>;
};
export default About;