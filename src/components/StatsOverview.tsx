
import React from "react";
import { Milk } from "lucide-react";
import { MilkTestResult } from "@/types/milk-test";

export const StatsOverview = ({ results }: { results: MilkTestResult[] }) => {
  const avgRating = results.length
    ? (results.reduce((acc, curr) => acc + curr.rating, 0) / results.length).toFixed(1)
    : "0.0";

  // Get unique product types from the property_names array, filtering out any nulls or undefined
  const types = results.length
    ? [...new Set(results.flatMap(r => r.property_names || []))]
    : [];
    
  // Calculate most common product type
  const typeCounts = results.reduce((acc: Record<string, number>, curr) => {
    (curr.property_names || []).forEach(property => {
      acc[property] = (acc[property] || 0) + 1;
    });
    return acc;
  }, {});
  
  const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
  
  // Calculate average price if available
  const pricesAvailable = results.filter(r => r.price !== null && r.price !== undefined);
  const avgPrice = pricesAvailable.length 
    ? (pricesAvailable.reduce((acc, curr) => acc + (curr.price || 0), 0) / pricesAvailable.length).toFixed(2)
    : "N/A";

  return (
    <div className="bg-cream-100 rounded-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Milk className="w-8 h-8 text-gray-500" />
        <h2 className="text-2xl font-semibold text-gray-900">Milk Taste Test Results</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col bg-soft-blue rounded-lg p-4 shadow-sm transition-transform hover:shadow-md hover:-translate-y-1">
          <p className="text-gray-600 mb-2">Average Rating</p>
          <p className="text-3xl font-bold text-gray-900">{avgRating}/10</p>
        </div>
        <div className="flex flex-col bg-soft-blue rounded-lg p-4 shadow-sm transition-transform hover:shadow-md hover:-translate-y-1">
          <p className="text-gray-600 mb-2">Total Tests</p>
          <p className="text-3xl font-bold text-gray-900">{results.length}</p>
        </div>
        <div className="flex flex-col bg-soft-blue rounded-lg p-4 shadow-sm transition-transform hover:shadow-md hover:-translate-y-1">
          <p className="text-gray-600 mb-2">Milk Types</p>
          <p className="text-3xl font-bold text-gray-900">{types.length}</p>
        </div>
        <div className="flex flex-col bg-soft-blue rounded-lg p-4 shadow-sm transition-transform hover:shadow-md hover:-translate-y-1">
          <p className="text-gray-600 mb-2">Most Common Type</p>
          <p className="text-3xl font-bold text-gray-900">{mostCommonType}</p>
        </div>
        <div className="flex flex-col bg-soft-blue rounded-lg p-4 shadow-sm transition-transform hover:shadow-md hover:-translate-y-1">
          <p className="text-gray-600 mb-2">Avg. Price</p>
          <p className="text-3xl font-bold text-gray-900">{avgPrice !== "N/A" ? `$${avgPrice}` : avgPrice}</p>
        </div>
      </div>
    </div>
  );
};
