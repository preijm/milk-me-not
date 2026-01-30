import React, { useState } from "react";
import MenuBar from "@/components/MenuBar";
import { ImageModal } from "@/components/milk-test/ImageModal";
import MobileFooter from "@/components/MobileFooter";
import { Coffee, TrendingUp, Users } from "lucide-react";
import BackgroundPattern from "@/components/BackgroundPattern";
import { TimelineContainer } from "@/components/about/TimelineContainer";
import { TimelineItem } from "@/components/about/TimelineItem";
import {
  TimelineImageGrid,
  TimelineSingleImage,
} from "@/components/about/TimelineImages";
import { CommunityCarousel } from "@/components/about/CommunityCarousel";

// Image imports
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

const communityImages = [
  { src: erwtenDrink, alt: "AH Erwten Drink - Pea-based milk alternative" },
  {
    src: gutBioBarista,
    alt: "Gut Bio Barista Hafer Drink - Oat barista milk with latte",
  },
  {
    src: abbotKinneyAmandel,
    alt: "Abbot Kinney's Barista Amandel and Best of Plants milk alternatives",
  },
  {
    src: rudeHealthPotato,
    alt: "Rude Health Tiger Nut and Potato Barista dairy-free milk",
  },
  {
    src: broseOat,
    alt: "Brose Scottish Goodness Fresh Oat Drink Barista Style",
  },
  {
    src: lupineDrink,
    alt: "AH Lupine Drink - Lupin-based milk from Dutch soil",
  },
  { src: milsaSoja, alt: "Milsa Soja Drink - Unsweetened soy milk alternative" },
  { src: campinaHaver, alt: "Campina Haver Drink - Oat milk alternative" },
  {
    src: alproNotMilk,
    alt: "Alpro Shhh This is NOT M*LK - Plant-based oat drink",
  },
  { src: sproudMilk2, alt: "Sproud plant-based unsweetened pea milk" },
  {
    src: beriefBarista,
    alt: "Berief Bio Barista - Creamy plant-based barista milk",
  },
];

const About = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="flex items-center justify-center min-h-screen pt-16 pb-20 sm:pb-8">
          <div className="container max-w-4xl mx-auto px-4 py-8 sm:py-12 relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-foreground">
              Our Journey
            </h1>

            <TimelineContainer>
              {/* Timeline Item 1: How It All Started */}
              <TimelineItem
                icon={Coffee}
                title="How It All Started"
                className="mb-12 sm:mb-16"
              >
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex-1">
                    <p className="text-muted-foreground leading-relaxed">
                      Our vegan-milk taste testing journey began, ironically
                      enough, with cow milk and a silly joke between colleagues:
                      Soy milk? You mean you mix soy sauce with milk? Sounds
                      terrible. After that rather horrible incident (we cannot
                      recommend you try this at home), we wanted to test actual
                      cow-milk alternatives and, because one of these people is
                      a data scientist, we had to record it.
                    </p>
                  </div>
                  <TimelineImageGrid
                    images={[
                      {
                        src: soySauceMilkPhoto,
                        alt: "Photo of Alpro plant-based milk carton next to Shoyu soy sauce bottle with a glass showing the terrible mixture",
                      },
                      {
                        src: milkSoySaucePhoto,
                        alt: "Photo of Magere Melk dairy-free milk carton and soy sauce bottle showing the products that inspired the joke",
                      },
                    ]}
                    caption="The actual culprits: milk meets soy sauce"
                    onImageClick={setSelectedImage}
                  />
                </div>
              </TimelineItem>

              {/* Timeline Item 2: How it All Escalated */}
              <TimelineItem
                icon={TrendingUp}
                title="How it All Escalated"
                delay={0.2}
                reverse
                className="mb-12 sm:mb-16"
              >
                <p className="text-muted-foreground leading-relaxed mb-4">
                  After having recorded and rated more than 100
                  milk-alternatives, and showed our sheet to many friends, we
                  knew what we had to do: make it public. Our data scientist got
                  to work and created a website, available to all, and published
                  all of our results so far and ready to receive more from the
                  original founders but of course everyone else who is keen to
                  test.
                </p>
                <TimelineSingleImage
                  src={spreadsheetImage}
                  alt="Original milk testing spreadsheet with ratings and data"
                  caption="Our original spreadsheet tracking over 100 milk alternatives"
                  onImageClick={setSelectedImage}
                />
              </TimelineItem>

              {/* Timeline Item 3: How it will Continue */}
              <TimelineItem
                icon={Users}
                title="How it will (Hopefully) Continue"
                delay={0.4}
                reverse
              >
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Now it is on you, your friends, family and fiends to continue
                  the deep-dive into cow milk alternatives. Help us figure out
                  where we can find the best and price efficient milk-adjacent
                  drinks. Help the world avoid the worst drinks and give love to
                  the best ones.
                </p>
                <CommunityCarousel
                  images={communityImages}
                  caption="A few of the OG fake-milk contenders"
                />
              </TimelineItem>
            </TimelineContainer>
          </div>
        </div>
      </BackgroundPattern>

      <MobileFooter />

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ""}
      />
    </div>
  );
};

export default About;
