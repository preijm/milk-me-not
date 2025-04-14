
import React from "react";
import MenuBar from "@/components/MenuBar";
import { Users, Star, MessageSquare } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <MenuBar />
      <div className="min-h-screen pt-16 bg-gradient-to-br from-emerald-50/80 via-blue-50/80 to-emerald-50/80">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">About Milk Me Not</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Star className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Our Mission</h2>
                <p className="text-gray-700">
                  Milk Me Not is dedicated to helping people find the best plant-based milk alternatives 
                  that suit their taste preferences and needs. Whether you're looking for the perfect milk 
                  for your morning coffee, cereal, or cooking, we've got you covered.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">How It Works</h2>
                <p className="text-gray-700">
                  Our community members test and review plant-based milks across different categories, considering 
                  taste, texture, performance in coffee and tea, cooking applications, and more. We aggregate these 
                  reviews to provide comprehensive insights.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Join Our Community</h2>
                <p className="text-gray-700">
                  Create an account to start contributing your own reviews. Your experiences help others 
                  make better choices when shopping for plant-based milk alternatives. The more reviews we 
                  collect, the more valuable our service becomes!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
