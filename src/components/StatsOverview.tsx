
import React from "react";
import { Milk } from "lucide-react";

interface MilkTestResult {
  rating: number;
  product_type_keys: string[];
  created_at: string;
}

export const StatsOverview = ({ results }: { results: MilkTestResult[] }) => {
  const avgRating = results.length
    ? (results.reduce((acc, curr) => acc + curr.rating, 0) / results.length).toFixed(1)
    : "0.0";

  // Get unique product types from the product_type_keys array
  const types = results.length
    ? [...new Set(results.flatMap(r => r.product_type_keys || []))]
    : [];

  return (
    <div className="bg-cream-100 rounded-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Milk className="w-8 h-8 text-gray-500" />
        <h2 className="text-2xl font-semibold text-gray-900">Milk Taste Test Results</h2>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="flex flex-col">
          <p className="text-gray-600 mb-2">Average Rating</p>
          <p className="text-3xl font-bold text-gray-900">{avgRating}/10</p>
        </div>
        <div className="flex flex-col">
          <p className="text-gray-600 mb-2">Total Tests</p>
          <p className="text-3xl font-bold text-gray-900">{results.length}</p>
        </div>
        <div className="flex flex-col">
          <p className="text-gray-600 mb-2">Milk Types</p>
          <p className="text-3xl font-bold text-gray-900">{types.length}</p>
        </div>
      </div>
    </div>
  );
};
