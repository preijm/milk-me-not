import React, { useState } from "react";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import { Phone, Mail, MessageSquare, Bird } from "lucide-react";
import BackgroundPattern from "@/components/BackgroundPattern";
import { ContactCard } from "@/components/contact/ContactCard";
import { FlyingBird } from "@/components/contact/FlyingBird";
import { FAQSection } from "@/components/contact/FAQSection";
import { Heading } from "@/components/ui/typography";
import { useIsMobile } from "@/hooks/use-mobile";

const faqItems = [
  {
    question: "What is Milk Me Not?",
    answer:
      "Milk Me Not is a community-driven platform for discovering and rating plant-based milk alternatives. We help you find the perfect dairy-free milk for your coffee, cereal, or cooking needs based on real user experiences.",
  },
  {
    question: "How do I add my milk test results?",
    answer:
      'Simply sign up for an account, then click on "Add Test" in the navigation menu. You can rate products, add photos, notes about taste and texture, and share your experience with the community.',
  },
  {
    question: "Can I suggest a new brand or product?",
    answer:
      "Absolutely! When adding a new test, you can create new brands and products if they don't exist in our database yet. This helps grow our community knowledge base and helps others discover new alternatives.",
  },
  {
    question: "Is the platform free to use?",
    answer:
      "Yes! Milk Me Not is completely free to use. You can browse all test results, add your own reviews, and participate in our community without any cost.",
  },
  {
    question: "How are the ratings calculated?",
    answer:
      "Ratings are aggregated from all user tests for each product. We show the average rating along with individual test details so you can see the full range of experiences and make an informed decision based on what matters most to you.",
  },
  {
    question: "Can I edit or delete my test results?",
    answer:
      "Yes! You can edit or delete your own test results at any time from your profile page. We believe in giving you full control over your contributions to the community.",
  },
];

const Contact = () => {
  const [flyingBirds, setFlyingBirds] = useState<number[]>([]);
  const isMobile = useIsMobile();

  const handlePigeonClick = () => {
    const birdId = Date.now();
    setFlyingBirds((prev) => [...prev, birdId]);
    setTimeout(() => {
      setFlyingBirds((prev) => prev.filter((id) => id !== birdId));
    }, 2000);
  };

  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="lg:flex lg:items-center lg:justify-center min-h-screen pt-16 pb-20 sm:pb-8">
          <div className="container max-w-4xl mx-auto px-4 py-8 sm:py-12 relative z-10">
            <Heading as="h1" fluid="page" className="hidden lg:block text-center mb-12 text-foreground">
              Get in Touch
            </Heading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-12 lg:mb-12 mt-0 lg:mt-0">
              <ContactCard
                icon={Phone}
                iconColorClass="bg-brand-primary/10 text-brand-primary"
                title="Phone"
                badgeText="On Vacation"
                badgeVariant="unavailable"
                description="Our phone is currently taking a well-deserved vacation in the Bermuda Triangle. It left no forwarding address."
                buttonText="Currently Unreachable"
                buttonDisabled
              />

              <ContactCard
                icon={Mail}
                iconColorClass="bg-brand-secondary/10 text-brand-secondary"
                title="Email"
                badgeText="Available"
                badgeVariant="available"
                description="Our inbox is always open. Unlike our fridge, it never runs out of oat milk or judgment."
                buttonText="Send us an Email"
                buttonHref="mailto:info@milkmenot.com"
              />

              <ContactCard
                icon={MessageSquare}
                iconColorClass="bg-purple-500/10 text-purple-600"
                title="Chat"
                badgeText="Pursuing Dreams"
                badgeVariant="neutral"
                description="Our chat bot decided to pursue its dream of becoming a stand-up comedian. We wish it the best of luck in its new career."
                buttonText="Currently Unreachable"
                buttonDisabled
              />

              <ContactCard
                icon={Bird}
                iconColorClass="bg-score-fair/10 text-score-fair"
                title="Postduif"
                badgeText="In Training"
                badgeVariant="unavailable"
                description="Our carrier pigeons are still in flight school learning the difference between your address and a bread crumb trail."
                buttonText="Currently Unreachable"
                buttonDisabled
                onClick={handlePigeonClick}
              >
                <FlyingBird birdIds={flyingBirds} />
              </ContactCard>
            </div>

            {!isMobile && (
              <FAQSection title="Frequently Asked Questions" items={faqItems} />
            )}
          </div>
        </div>
      </BackgroundPattern>

      <MobileFooter />
    </div>
  );
};

export default Contact;
