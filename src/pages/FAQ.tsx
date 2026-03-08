import React from "react";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPattern from "@/components/BackgroundPattern";
import { FAQSection } from "@/components/contact/FAQSection";
import { Heading } from "@/components/ui/typography";

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

const FAQ = () => {
  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="lg:flex lg:items-center lg:justify-center min-h-screen pt-16 pb-20 sm:pb-8">
          <div className="container max-w-4xl mx-auto px-4 py-8 sm:py-12 relative z-10">
            <Heading as="h1" fluid="page" className="hidden lg:block text-center mb-12 text-foreground">
              FAQ
            </Heading>
            <FAQSection title="Frequently Asked Questions" items={faqItems} />
          </div>
        </div>
      </BackgroundPattern>
      <MobileFooter />
    </div>
  );
};

export default FAQ;
