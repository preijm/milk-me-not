import React, { useState } from "react";
import MenuBar from "@/components/MenuBar";
import { ImageModal } from "@/components/milk-test/ImageModal";
import MobileFooter from "@/components/MobileFooter";
import { Coffee, TrendingUp, Users } from "lucide-react";
import BackgroundPattern from "@/components/BackgroundPattern";
import { motion } from "framer-motion";
import spreadsheetImage from "@/assets/milk-tests-spreadsheet.png";
import soyMilkDrawing from "@/assets/soy-milk-drawing.jpg";
const About = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
              <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 bg-primary/30 -translate-x-1/2 hidden sm:block overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-primary to-transparent"
                  animate={{
                    y: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
              
              {/* Timeline Item 1 */}
              <motion.div 
                className="relative mb-12 sm:mb-16"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="flex items-start gap-4 sm:gap-8">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center relative z-10">
                    <Coffee className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                  </div>
                  <div className="flex-1 bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                      How It All Started
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Our vegan-milk taste testing journey began, ironically enough, with cow milk and a silly joke between colleagues: Soy milk? You mean you mix soy sauce with milk? Sounds terrible. After that rather horrible incident (we cannot recommend you try this at home), we wanted to test actual cow-milk alternatives and, because one of these people is a data scientist, we had to record it.
                    </p>
                    <img 
                      src={soyMilkDrawing} 
                      alt="Original post-it note drawing showing 'SOYAMELK' - a humorous sketch of soy sauce bottle, glass, and milk carton representing the origin joke" 
                      className="rounded-lg w-full max-w-md mx-auto border border-border/50 shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedImage(soyMilkDrawing)}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Timeline Item 2 */}
              <motion.div 
                className="relative mb-12 sm:mb-16"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              >
                <div className="flex items-start gap-4 sm:gap-8 sm:flex-row-reverse">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center relative z-10">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                  </div>
                  <div className="flex-1 bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                      How it All Escalated
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      After having recorded and rated more than 100 milk-alternatives, and showed our sheet to many friends, we knew what we had to do: make it public. Our data scientist got to work and created a website, available to all, and published all of our results so far and ready to receive more from the original founders but of course everyone else who is keen to test.
                    </p>
                    <img 
                      src={spreadsheetImage} 
                      alt="Original milk testing spreadsheet with ratings and data" 
                      className="rounded-lg w-full border border-border/50 shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedImage(spreadsheetImage)}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Timeline Item 3 */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
              >
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
              </motion.div>
            </div>
          </div>
        </div>
      </BackgroundPattern>
      
      <MobileFooter />

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ""}
      />
    </div>;
};
export default About;