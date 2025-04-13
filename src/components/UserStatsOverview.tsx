
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
  
  return <div className="rounded-lg p-4 mb-6 bg-white">
      <div className="grid grid-cols-5 gap-3">
        <div className="flex flex-col rounded-lg p-3 shadow-sm transition-transform hover:shadow-md hover:-translate-y-1" style={{ backgroundColor: '#F2FCE2' }}>
          <p className="text-xs text-[#444] mb-1">Average Rating</p>
          <p className="text-xl font-semibold text-gray-900">{avgRating}/10</p>
        </div>
        <div className="flex flex-col rounded-lg p-3 shadow-sm transition-transform hover:shadow-md hover:-translate-y-1" style={{ backgroundColor: '#F2FCE2' }}>
          <p className="text-xs text-[#444] mb-1">Total Tests</p>
          <p className="text-xl font-semibold text-gray-900">{results.length}</p>
        </div>
        <div className="flex flex-col rounded-lg p-3 shadow-sm transition-transform hover:shadow-md hover:-translate-y-1" style={{ backgroundColor: '#F2FCE2' }}>
          <p className="text-xs text-[#444] mb-1">Unique Brands</p>
          <p className="text-xl font-semibold text-gray-900">{uniqueBrands.length}</p>
        </div>
        <div className="flex flex-col rounded-lg p-3 shadow-sm transition-transform hover:shadow-md hover:-translate-y-1" style={{ backgroundColor: '#F2FCE2' }}>
          <p className="text-xs text-[#444] mb-1">Latest Test</p>
          <p className="text-xl font-semibold text-gray-900 truncate">
            {latestTest ? formatDate(latestTest.created_at) : 'None'}
          </p>
        </div>
        <div className="flex flex-col rounded-lg p-3 shadow-sm transition-transform hover:shadow-md hover:-translate-y-1" style={{ backgroundColor: '#F2FCE2' }}>
          <p className="text-xs text-[#444] mb-1">Most Tested</p>
          <p className="text-xl font-semibold text-gray-900 truncate">{mostTestedBrand}</p>
        </div>
      </div>
    </div>;
};

