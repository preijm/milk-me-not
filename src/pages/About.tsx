import React, { useState } from "react";
import MenuBar from "@/components/MenuBar";
import { ImageModal } from "@/components/milk-test/ImageModal";
import MobileFooter from "@/components/MobileFooter";
import { Coffee, TrendingUp, Users } from "lucide-react";
import BackgroundPattern from "@/components/BackgroundPattern";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import spreadsheetImage from "@/assets/milk-tests-spreadsheet.png";
import soySauceMilkPhoto from "@/assets/soy-sauce-milk-photo.jpg";
import milkSoySaucePhoto from "@/assets/milk-soy-sauce-photo.jpg";
import erwtenDrink from "@/assets/community/erwten-drink.jpg";
import gutBioBarista from "@/assets/community/gut-bio-barista.jpg";
import abbotKinneyAmandel from "@/assets/community/abbot-kinney-amandel.jpg";
import rudeHealthPotato from "@/assets/community/rude-health-potato.jpg";
import broseOat from "@/assets/community/brose-oat.jpg";
import lupineDrink from "@/assets/community/lupine-drink.jpg";
import milsaSoja from "@/assets/community/milsa-soja.jpg";
import campinaHaver from "@/assets/community/campina-haver.jpg";
import alproNotMilk from "@/assets/community/alpro-not-milk.jpg";
import sproudMilk2 from "@/assets/community/sproud-milk-2.jpg";
import beriefBarista from "@/assets/community/berief-barista.jpg";
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
              {/* Timeline line - subtle background element */}
              <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 bg-primary/10 -translate-x-1/2 hidden sm:block -z-10"></div>
              
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
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      <div className="flex-1">
                        <p className="text-muted-foreground leading-relaxed">
                          Our vegan-milk taste testing journey began, ironically enough, with cow milk and a silly joke between colleagues: Soy milk? You mean you mix soy sauce with milk? Sounds terrible. After that rather horrible incident (we cannot recommend you try this at home), we wanted to test actual cow-milk alternatives and, because one of these people is a data scientist, we had to record it.
                        </p>
                      </div>
                      <div className="flex-shrink-0 w-full sm:w-64 space-y-2">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <img 
                            src={soySauceMilkPhoto} 
                            alt="Photo of Alpro plant-based milk carton next to Shoyu soy sauce bottle with a glass showing the terrible mixture" 
                            className="rounded-lg w-full border border-border/50 shadow-sm cursor-pointer hover:shadow-lg transition-shadow object-cover aspect-[3/4]"
                            onClick={() => setSelectedImage(soySauceMilkPhoto)}
                          />
                          <img 
                            src={milkSoySaucePhoto} 
                            alt="Photo of Magere Melk dairy-free milk carton and soy sauce bottle showing the products that inspired the joke" 
                            className="rounded-lg w-full border border-border/50 shadow-sm cursor-pointer hover:shadow-lg transition-shadow object-cover aspect-[3/4]"
                            onClick={() => setSelectedImage(milkSoySaucePhoto)}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground text-center italic">
                          The actual culprits: plant milk meets soy sauce
                        </p>
                      </div>
                    </div>
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
                    <div className="space-y-2">
                      <img 
                        src={spreadsheetImage} 
                        alt="Original milk testing spreadsheet with ratings and data" 
                        className="rounded-lg w-full border border-border/50 shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedImage(spreadsheetImage)}
                      />
                      <p className="text-sm text-muted-foreground text-center italic">
                        Our original spreadsheet tracking over 100 milk alternatives
                      </p>
                    </div>
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
                <div className="flex items-start gap-4 sm:gap-8 sm:flex-row-reverse">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center relative z-10">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                  </div>
                  <div className="flex-1 bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                      How it will (Hopefully) Continue
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Now it is on you, your friends, family and fiends to continue the deep-dive into cow milk alternatives. Help us figure out where we can find the best and price efficient milk-adjacent drinks. Help the world avoid the worst drinks and give love to the best ones.
                    </p>
                    {/* Auto-playing Carousel */}
                    <Carousel
                      opts={{
                        align: "start",
                        loop: true,
                      }}
                      plugins={[
                        Autoplay({
                          delay: 3000,
                        }),
                      ]}
                      className="w-full"
                    >
                      <CarouselContent className="-ml-2 sm:-ml-4">
                        {[
                          { src: erwtenDrink, alt: "AH Erwten Drink - Pea-based milk alternative" },
                          { src: gutBioBarista, alt: "Gut Bio Barista Hafer Drink - Oat barista milk with latte" },
                          { src: abbotKinneyAmandel, alt: "Abbot Kinney's Barista Amandel and Best of Plants milk alternatives" },
                          { src: rudeHealthPotato, alt: "Rude Health Tiger Nut and Potato Barista dairy-free milk" },
                          { src: broseOat, alt: "Brose Scottish Goodness Fresh Oat Drink Barista Style" },
                          { src: lupineDrink, alt: "AH Lupine Drink - Lupin-based milk from Dutch soil" },
                          { src: milsaSoja, alt: "Milsa Soja Drink - Unsweetened soy milk alternative" },
                          { src: campinaHaver, alt: "Campina Haver Drink - Oat milk alternative" },
                          { src: alproNotMilk, alt: "Alpro Shhh This is NOT M*LK - Plant-based oat drink" },
                          { src: sproudMilk2, alt: "Sproud plant-based unsweetened pea milk" },
                          { src: beriefBarista, alt: "Berief Bio Barista - Creamy plant-based barista milk" },
                        ].map((image, index) => (
                          <CarouselItem key={index} className="pl-2 sm:pl-4 basis-1/2 sm:basis-1/3">
                            <img 
                              src={image.src} 
                              alt={image.alt}
                              className="rounded-lg w-full h-40 sm:h-48 object-cover border border-border/50 shadow-sm hover:shadow-lg hover:scale-105 transition-all"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="-left-4" />
                      <CarouselNext className="-right-4" />
                    </Carousel>
                    <p className="text-sm text-muted-foreground text-center italic mt-3">
                      A few of the OG fake-milk contenders
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