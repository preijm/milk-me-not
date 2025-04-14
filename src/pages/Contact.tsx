
import React from "react";
import MenuBar from "@/components/MenuBar";
import { Zap, Pizza, BellRing } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen">
      <MenuBar />
      <div className="min-h-screen pt-16 bg-gradient-to-br from-emerald-50/80 via-blue-50/80 to-emerald-50/80 flex items-center justify-center">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-emerald-600 animate-bounce" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Lightning Speed</h2>
                <p className="text-gray-700">
                  Our communication moves faster than a caffeinated squirrel! 
                  We're currently setting world records for silence.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Pizza className="w-8 h-8 text-emerald-600 animate-pulse" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Pizza Signals</h2>
                <p className="text-gray-700">
                  Our contact method? Morse code via pizza toppings. 
                  Pepperoni means yes, mushrooms mean no. Genius, right?
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <BellRing className="w-8 h-8 text-emerald-600 animate-pulse" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Cosmic Notifications</h2>
                <p className="text-gray-700">
                  We've outsourced our communication to intergalactic 
                  carrier pigeons. Response times may vary by light-years.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
