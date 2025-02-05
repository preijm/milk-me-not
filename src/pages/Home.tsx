import React from "react";
import { Link } from "react-router-dom";
import { Milk, ChartPie, Table, Info } from "lucide-react";
import { AuthButton } from "@/components/AuthButton";

const Home = () => {
  return (
    <div className="min-h-screen bg-milk-50 py-16 px-4">
      <div className="container max-w-5xl mx-auto">
        <div className="flex justify-end mb-4">
          <AuthButton />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Dairy Taste Trove</h1>
        <p className="text-lg text-milk-500 text-center mb-12">
          Your personal journey through the world of dairy, one taste test at a time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/dashboard" className="group h-full">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow h-full">
              <ChartPie className="w-12 h-12 text-milk-400 mb-4 group-hover:text-milk-500 transition-colors" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h2>
              <p className="text-milk-500">Visualize your milk tasting journey with interactive charts and statistics.</p>
            </div>
          </Link>

          <Link to="/results" className="group h-full">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow h-full">
              <Table className="w-12 h-12 text-milk-400 mb-4 group-hover:text-milk-500 transition-colors" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Results</h2>
              <p className="text-milk-500">View and manage all your milk tasting results in a detailed table.</p>
            </div>
          </Link>

          <Link to="/add" className="group h-full">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow h-full">
              <Milk className="w-12 h-12 text-milk-400 mb-4 group-hover:text-milk-500 transition-colors" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Add Test</h2>
              <p className="text-milk-500">Record your latest milk tasting experience.</p>
            </div>
          </Link>

          <Link to="/about" className="group h-full">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow h-full">
              <Info className="w-12 h-12 text-milk-400 mb-4 group-hover:text-milk-500 transition-colors" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-milk-500">Learn more about our milk tasting methodology and mission.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;