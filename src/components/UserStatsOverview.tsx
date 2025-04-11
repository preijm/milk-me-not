
import React from "react";
import { MilkTestResult } from "@/types/milk-test";

export const UserStatsOverview = ({ results }: { results: MilkTestResult[] }) => {
  const avgRating = results.length
    ? (results.reduce((acc, curr) => acc + curr.rating, 0) / results.length).toFixed(1)
    : "0.0";

  const uniqueBrands = [...new Set(results.map((r) => r.brand_name).filter(Boolean))];
  
  // Calculate highest rated milk
  const highestRated = results.length 
    ? [...results].sort((a, b) => b.rating - a.rating)[0]
    : null;
    
  // Calculate most tested brand
  const brandCounts = results.reduce((acc: Record<string, number>, curr) => {
    const brand = curr.brand_name || "Unknown";
    acc[brand] = (acc[brand] || 0) + 1;
    return acc;
  }, {});
  
  const mostTestedBrand = results.length
    ? Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
    : "None";

  return (
    <div className="bg-cream-100 rounded-lg p-6 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col bg-soft-blue rounded-lg p-4 shadow-sm transition-transform hover:shadow-md hover:-translate-y-1">
          <p className="text-sm text-milk-500 mb-1">Average Rating</p>
          <p className="text-2xl font-semibold text-gray-900">{avgRating}/10</p>
        </div>
        <div className="flex flex-col bg-soft-blue rounded-lg p-4 shadow-sm transition-transform hover:shadow-md hover:-translate-y-1">
          <p className="text-sm text-milk-500 mb-1">Total Tests</p>
          <p className="text-2xl font-semibold text-gray-900">{results.length}</p>
        </div>
        <div className="flex flex-col bg-soft-blue rounded-lg p-4 shadow-sm transition-transform hover:shadow-md hover:-translate-y-1">
          <p className="text-sm text-milk-500 mb-1">Unique Brands</p>
          <p className="text-2xl font-semibold text-gray-900">{uniqueBrands.length}</p>
        </div>
        <div className="flex flex-col bg-soft-blue rounded-lg p-4 shadow-sm transition-transform hover:shadow-md hover:-translate-y-1">
          <p className="text-sm text-milk-500 mb-1">Highest Rated</p>
          <p className="text-2xl font-semibold text-gray-900">
            {highestRated ? `${highestRated.brand_name || 'Unknown'} (${highestRated.rating}/10)` : 'None'}
          </p>
        </div>
        <div className="flex flex-col bg-soft-blue rounded-lg p-4 shadow-sm transition-transform hover:shadow-md hover:-translate-y-1">
          <p className="text-sm text-milk-500 mb-1">Most Tested Brand</p>
          <p className="text-2xl font-semibold text-gray-900">{mostTestedBrand}</p>
        </div>
      </div>
    </div>
  );
};
