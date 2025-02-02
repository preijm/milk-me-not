import React from "react";
import { Milk } from "lucide-react";

interface MilkTestResult {
  rating: number;
  type: string;
}

export const StatsOverview = ({ results }: { results: MilkTestResult[] }) => {
  const avgRating = results.length
    ? (results.reduce((acc, curr) => acc + curr.rating, 0) / results.length).toFixed(1)
    : "0.0";

  const types = [...new Set(results.map((r) => r.type))];

  return (
    <div className="bg-cream-100 rounded-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Milk className="w-8 h-8 text-milk-400" />
        <h2 className="text-2xl font-semibold text-gray-900">Milk Taste Test Results</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-md p-4">
          <p className="text-milk-500 mb-1">Average Rating</p>
          <p className="text-2xl font-bold text-gray-900">{avgRating}/5.0</p>
        </div>
        <div className="bg-white rounded-md p-4">
          <p className="text-milk-500 mb-1">Total Tests</p>
          <p className="text-2xl font-bold text-gray-900">{results.length}</p>
        </div>
        <div className="bg-white rounded-md p-4">
          <p className="text-milk-500 mb-1">Milk Types</p>
          <p className="text-2xl font-bold text-gray-900">{types.length}</p>
        </div>
      </div>
    </div>
  );
};