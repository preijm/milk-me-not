
import React from "react";
import { MilkTestResult } from "@/types/milk-test";
export const UserStatsOverview = ({
  results
}: {
  results: MilkTestResult[];
}) => {
  const avgRating = results.length ? (results.reduce((acc, curr) => acc + curr.rating, 0) / results.length).toFixed(1) : "0.0";
  const uniqueBrands = [...new Set(results.map(r => r.brand_name).filter(Boolean))];

  // Calculate latest test
  const latestTest = results.length ? [...results].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : null;

  // Calculate most tested brand
  const brandCounts = results.reduce((acc: Record<string, number>, curr) => {
    const brand = curr.brand_name || "Unknown";
    acc[brand] = (acc[brand] || 0) + 1;
    return acc;
  }, {});
  const mostTestedBrand = results.length ? Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] : "None";

  // Format date for latest test
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-blue-700">Average Rating</p>
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
        <p className="text-2xl font-bold text-blue-900">{avgRating}/10</p>
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-green-700">Total Tests</p>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        <p className="text-2xl font-bold text-green-900">{results.length}</p>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-purple-700">Unique Brands</p>
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
        </div>
        <p className="text-2xl font-bold text-purple-900">{uniqueBrands.length}</p>
      </div>
      
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-orange-700">Latest Test</p>
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
        </div>
        <p className="text-lg font-bold text-orange-900 leading-tight">
          {latestTest ? formatDate(latestTest.created_at) : 'None'}
        </p>
      </div>
      
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-indigo-700">Most Tested</p>
          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
        </div>
        <p className="text-lg font-bold text-indigo-900 truncate">{mostTestedBrand}</p>
      </div>
    </div>
  );
};
