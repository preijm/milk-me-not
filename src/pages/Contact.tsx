import React, { useState } from "react";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import { Phone, Mail, MessageSquare, ChevronDown, Bird } from "lucide-react";
import BackgroundPattern from "@/components/BackgroundPattern";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";

const Contact = () => {
  const [flyingBirds, setFlyingBirds] = useState<number[]>([]);

  const handlePigeonClick = () => {
    const birdId = Date.now();
    setFlyingBirds(prev => [...prev, birdId]);
    setTimeout(() => {
      setFlyingBirds(prev => prev.filter(id => id !== birdId));
    }, 2000);
  };

  return <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="flex items-center justify-center min-h-screen pt-16 pb-20 sm:pb-8">
          <div className="container max-w-4xl mx-auto px-4 py-8 sm:py-12 relative z-10">
            <h1 className="hidden lg:block text-3xl sm:text-4xl font-bold text-center mb-12 text-foreground">
              Get in Touch
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-12 lg:mb-12 mt-0 lg:mt-0">
              {/* Phone Card */}
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-all flex flex-col">
                <div className="flex flex-row items-start gap-3 sm:gap-4 flex-1">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Phone</h2>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        On Vacation
                      </Badge>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 leading-snug sm:leading-relaxed">
                      Our phone is currently taking a well-deserved vacation in the Bermuda Triangle. It left no forwarding address.
                    </p>
                  </div>
                </div>
                <Button disabled className="mt-4 w-full bg-rose-100 hover:bg-rose-100 text-rose-700 cursor-not-allowed">
                  Currently Unreachable
                </Button>
              </div>
              
              {/* Email Card */}
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-all flex flex-col">
                <div className="flex flex-row items-start gap-3 sm:gap-4 flex-1">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Email</h2>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Available
                      </Badge>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 leading-snug sm:leading-relaxed">
                      Our inbox is always open. Unlike our fridge, it never runs out of oat milk or judgment.
                    </p>
                  </div>
                </div>
                <Button asChild className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white">
                  <a href="mailto:info@milkmenot.com">Send us an Email</a>
                </Button>
              </div>
              
              {/* Chat Card */}
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-all flex flex-col">
                <div className="flex flex-row items-start gap-3 sm:gap-4 flex-1">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Chat</h2>
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Pursuing Dreams
                      </Badge>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 leading-snug sm:leading-relaxed">
                      Our chat bot decided to pursue its dream of becoming a stand-up comedian. We wish it the best of luck in its new career.
                    </p>
                  </div>
                </div>
                <Button disabled className="mt-4 w-full bg-rose-100 hover:bg-rose-100 text-rose-700 cursor-not-allowed">
                  Currently Unreachable
                </Button>
              </div>
              
              {/* Carrier Pigeon Card */}
              <div 
                onClick={handlePigeonClick}
                className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-all flex flex-col cursor-pointer relative overflow-visible"
              >
                <AnimatePresence>
                  {flyingBirds.map(birdId => (
                    <motion.div
                      key={birdId}
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{ 
                        x: [0, 100, 300, 600],
                        y: [0, -50, -150, -300],
                        opacity: [1, 1, 0.5, 0],
                        rotate: [0, 15, 30, 45]
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="absolute top-4 left-4 pointer-events-none z-50"
                    >
                      <Bird className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div className="flex flex-row items-start gap-3 sm:gap-4 flex-1">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Bird className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Postduif</h2>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        In Training
                      </Badge>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 leading-snug sm:leading-relaxed">
                      Our carrier pigeons are still in flight school learning the difference between your address and a bread crumb trail.
                    </p>
                  </div>
                </div>
                <Button disabled className="mt-4 w-full bg-rose-100 hover:bg-rose-100 text-rose-700 cursor-not-allowed">
                  Currently Unreachable
                </Button>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">What is Milk Me Not?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Milk Me Not is a community-driven platform for discovering and rating plant-based milk alternatives. 
                    We help you find the perfect dairy-free milk for your coffee, cereal, or cooking needs based on real user experiences.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">How do I add my milk test results?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Simply sign up for an account, then click on "Add Test" in the navigation menu. You can rate products, 
                    add photos, notes about taste and texture, and share your experience with the community.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">Can I suggest a new brand or product?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Absolutely! When adding a new test, you can create new brands and products if they don't exist in our database yet. 
                    This helps grow our community knowledge base and helps others discover new alternatives.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">Is the platform free to use?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Yes! Milk Me Not is completely free to use. You can browse all test results, add your own reviews, 
                    and participate in our community without any cost.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">How are the ratings calculated?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Ratings are aggregated from all user tests for each product. We show the average rating along with 
                    individual test details so you can see the full range of experiences and make an informed decision 
                    based on what matters most to you.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">Can I edit or delete my test results?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Yes! You can edit or delete your own test results at any time from your profile page. 
                    We believe in giving you full control over your contributions to the community.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </BackgroundPattern>
      
      <MobileFooter />
    </div>;
};
export default Contact;