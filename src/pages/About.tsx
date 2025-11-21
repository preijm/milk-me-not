import React from "react";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import { Coffee, TrendingUp, Users } from "lucide-react";
import BackgroundPattern from "@/components/BackgroundPattern";
const About = () => {
  return <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="flex items-center justify-center min-h-screen pt-16 pb-20 sm:pb-8">
          <div className="container max-w-4xl mx-auto px-4 py-8 sm:py-12 relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-foreground">
              Our Journey
            </h1>
            
            {/* Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 bg-primary/30 -translate-x-1/2 hidden sm:block" />
              
              {/* Timeline Item 1 */}
              <div className="relative mb-12 sm:mb-16">
                <div className="flex items-start gap-4 sm:gap-8">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center relative z-10">
                    <Coffee className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                  </div>
                  <div className="flex-1 bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                      How It All Started
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Our vegan-milk taste testing journey began, ironically enough, with cow milk and a silly joke between colleagues: Soy milk? You mean you mix soy sauce with milk? Sounds terrible. After that rather horrible incident (we cannot recommend you try this at home), we wanted to test actual cow-milk alternatives and, because one of these people is a data scientist, we had to record it.
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="relative mb-12 sm:mb-16">
                <div className="flex items-start gap-4 sm:gap-8 sm:flex-row-reverse">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center relative z-10">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                  </div>
                  <div className="flex-1 bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                      How it All Escalated
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      After having recorded and rated more than 100 milk-alternatives, and showed our sheet to many friends, we knew what we had to do: make it public. Our data scientist got to work and created a website, available to all, and published all of our results so far and ready to receive more from the original founders but of course everyone else who is keen to test.
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline Item 3 */}
              <div className="relative">
                <div className="flex items-start gap-4 sm:gap-8">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center relative z-10">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                  </div>
                  <div className="flex-1 bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                      How it will (Hopefully) Continue
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Now it is on you, your friends, family and fiends to continue the deep-dive into cow milk alternatives. Help us figure out where we can find the best and price efficient milk-adjacent drinks. Help the world avoid the worst drinks and give love to the best ones.
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