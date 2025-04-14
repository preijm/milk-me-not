
import React from "react";
import { Link } from "react-router-dom";
import { ChartPie, Table, Milk, Info } from "lucide-react";
import { AuthButton } from "@/components/AuthButton";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="container max-w-5xl mx-auto">
        <div className="flex justify-end mb-8">
          <AuthButton />
        </div>

        <div className="text-center mb-16">
          <img 
            src="/lovable-uploads/9f030b65-074a-4e64-82d9-f0eba7246e1a.png"
            alt="Dairy Taste Trove Logo"
            className="w-24 h-24 mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dairy Taste Trove</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Your personal journey through the world of dairy, one taste test at a time.
          </p>
          <Link to="/add">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600">
              <Milk className="mr-2 h-5 w-5" />
              Start your first milk test
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link to="/dashboard" className="group">
            <div className="p-6 rounded-lg border border-gray-200 hover:border-emerald-500 transition-colors">
              <ChartPie className="w-12 h-12 text-emerald-500 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h2>
              <p className="text-gray-600">Track your milk tasting progress with an interactive dashboard.</p>
            </div>
          </Link>

          <Link to="/results" className="group">
            <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors">
              <Table className="w-12 h-12 text-blue-500 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Results</h2>
              <p className="text-gray-600">View and analyze your milk tasting results.</p>
            </div>
          </Link>

          <Link to="/add" className="group">
            <div className="p-6 rounded-lg border border-gray-200 hover:border-emerald-500 transition-colors">
              <Milk className="w-12 h-12 text-emerald-500 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Add Test</h2>
              <p className="text-gray-600">Begin a new milk tasting and record your impressions.</p>
            </div>
          </Link>

          <Link to="/about" className="group">
            <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors">
              <Info className="w-12 h-12 text-blue-500 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-gray-600">Learn more about our milk tasting methodology.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
