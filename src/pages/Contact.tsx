import React from "react";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import { Phone, Mail, MessageSquare } from "lucide-react";
import BackgroundPattern from "@/components/BackgroundPattern";

const Contact = () => {
  return <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="flex items-center justify-center min-h-screen pt-16 pb-20 sm:pb-8">
          <div className="container max-w-7xl mx-auto px-4 py-4 sm:py-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow min-h-[200px] sm:min-h-[280px] flex">
                <div className="flex flex-row sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-4 w-full">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center bg-[#00bf62] flex-shrink-0">
                    <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFFFFF] animate-none" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Phone</h2>
                    <p className="text-gray-700 text-sm sm:text-base">
                      Our phone is currently taking a well-deserved vacation in the Bermuda Triangle. It left no forwarding address.
                    </p>
                  </div>
                </div>
              </div>
              
              <a href="mailto:info@milkmenot.com" className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow min-h-[200px] sm:min-h-[280px] flex block">
                <div className="flex flex-row sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-4 w-full">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center bg-[#00bf62] flex-shrink-0">
                    <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFFFFF] animate-none" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Email</h2>
                    <p className="text-gray-700 text-sm sm:text-base">Our inbox is always open. Unlike our fridge, it never runs out of oat milk or judgment.</p>
                  </div>
                </div>
              </a>
              
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow min-h-[200px] sm:min-h-[280px] flex">
                <div className="flex flex-row sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-4 w-full">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center bg-[#00bf62] flex-shrink-0">
                    <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFFFFF] animate-none" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Chat</h2>
                    <p className="text-gray-700 text-sm sm:text-base">
                      Our chat bot decided to pursue its dream of becoming a stand-up comedian. We wish it the best of luck in its new career.
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

export default Contact;
