import React from "react";
import { Navigation } from "@/components/Navigation";
import { Beaker, Award, Users, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-milk-100 py-8 px-4">
      <div className="container max-w-5xl mx-auto">
        <Navigation />
        <h1 className="text-3xl font-bold text-gray-900 mb-8">About Dairy Taste Trove</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-lg text-milk-500 mb-8">
            Welcome to Dairy Taste Trove, your personal companion for exploring and documenting
            the diverse world of dairy products. Our mission is to help milk enthusiasts track
            and share their tasting experiences.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="flex items-start space-x-4">
              <Beaker className="w-8 h-8 text-milk-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Methodology</h3>
                <p className="text-milk-500">
                  We use a simple yet effective 5-star rating system, combined with detailed notes
                  to capture the complete tasting experience.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Award className="w-8 h-8 text-milk-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Focus</h3>
                <p className="text-milk-500">
                  Each rating considers taste, texture, freshness, and overall drinking experience.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Users className="w-8 h-8 text-milk-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Driven</h3>
                <p className="text-milk-500">
                  Built by and for milk enthusiasts who appreciate the nuances of dairy products.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Heart className="w-8 h-8 text-milk-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Values</h3>
                <p className="text-milk-500">
                  We believe in transparency, authenticity, and sharing knowledge about dairy products.
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