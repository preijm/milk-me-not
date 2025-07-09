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
  const mostTestedBrand = results.length ? Object.entries(brandCounts).sort((a, b) => {
    const countDiff = b[1] - a[1];
    return countDiff !== 0 ? countDiff : a[0].localeCompare(b[0]);
  })[0]?.[0] : "None";

  // Calculate highest rated product
  const highestRatedProduct = results.length ? [...results].sort((a, b) => b.rating - a.rating)[0] : null;
  const highestRatedText = highestRatedProduct ? `${highestRatedProduct.brand_name || 'Unknown'} ${highestRatedProduct.product_name || ''}`.trim() : "None";

  // Format date for latest test
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
      <div className="bg-white border border-blue-200 rounded-lg p-2 sm:p-4 transition-all duration-200 hover:shadow-sm">
        <p className="text-xs sm:text-sm text-gray-600 mb-1">Average Rating</p>
        <p className="text-lg sm:text-2xl font-semibold text-gray-900">{avgRating}/10</p>
      </div>
      
      <div className="bg-white border border-green-200 rounded-lg p-2 sm:p-4 transition-all duration-200 hover:shadow-sm">
        <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Tests</p>
        <p className="text-lg sm:text-2xl font-semibold text-gray-900">{results.length}</p>
      </div>
      
      <div className="bg-white border border-purple-200 rounded-lg p-2 sm:p-4 transition-all duration-200 hover:shadow-sm">
        <p className="text-xs sm:text-sm text-gray-600 mb-1">Unique Brands</p>
        <p className="text-lg sm:text-2xl font-semibold text-gray-900">{uniqueBrands.length}</p>
      </div>
      
      <div className="bg-white border border-orange-200 rounded-lg p-2 sm:p-4 transition-all duration-200 hover:shadow-sm">
        <p className="text-xs sm:text-sm text-gray-600 mb-1">Latest Test</p>
        <p className="text-sm sm:text-lg font-semibold text-gray-900 leading-tight">
          {latestTest ? formatDate(latestTest.created_at) : 'None'}
        </p>
      </div>
      
      <div className="bg-white border border-indigo-200 rounded-lg p-2 sm:p-4 transition-all duration-200 hover:shadow-sm">
        <p className="text-xs sm:text-sm text-gray-600 mb-1">Most Tested Brand</p>
        <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{mostTestedBrand}</p>
      </div>
      
      <div className="bg-white border border-pink-200 rounded-lg p-2 sm:p-4 transition-all duration-200 hover:shadow-sm">
        <p className="text-xs sm:text-sm text-gray-600 mb-1">Highest Rated</p>
        <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{highestRatedText}</p>
      </div>
    </div>;
};