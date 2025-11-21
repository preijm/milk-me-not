import React from "react";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import { Phone, Mail, MessageSquare } from "lucide-react";
import BackgroundPattern from "@/components/BackgroundPattern";
import { Badge } from "@/components/ui/badge";

const Contact = () => {
  return <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="flex items-center justify-center min-h-screen pt-16 pb-20 sm:pb-8">
          <div className="container max-w-7xl mx-auto px-4 py-4 sm:py-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Phone Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
                <div className="flex flex-row items-start gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">Phone</h2>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        On Vacation
                      </Badge>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Our phone is currently taking a well-deserved vacation in the Bermuda Triangle. It left no forwarding address.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Email Card */}
              <a href="mailto:info@milkmenot.com" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all block">
                <div className="flex flex-row items-start gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">Email</h2>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Available
                      </Badge>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Our inbox is always open. Unlike our fridge, it never runs out of oat milk or judgment.
                    </p>
                  </div>
                </div>
              </a>
              
              {/* Chat Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
                <div className="flex flex-row items-start gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">Chat</h2>
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Pursuing Dreams
                      </Badge>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
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
