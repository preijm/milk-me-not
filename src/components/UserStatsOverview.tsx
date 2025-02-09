
import React from "react";

interface MilkTestResult {
  rating: number;
  type: string;
  brand: string;
  created_at: string;
}

export const UserStatsOverview = ({ results }: { results: MilkTestResult[] }) => {
  const avgRating = results.length
    ? ((results.reduce((acc, curr) => acc + curr.rating, 0) / results.length) * 2).toFixed(1)
    : "0.0";

  const uniqueBrands = [...new Set(results.map((r) => r.brand))];

  return (
    <div className="bg-cream-100 rounded-lg p-6 mb-8">
      <div className="grid grid-cols-3 gap-6">
        <div className="flex flex-col">
          <p className="text-sm text-milk-500 mb-1">Average Rating</p>
          <p className="text-2xl font-semibold text-gray-900">{avgRating}/10</p>
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-milk-500 mb-1">Total Tests</p>
          <p className="text-2xl font-semibold text-gray-900">{results.length}</p>
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-milk-500 mb-1">Unique Brands</p>
          <p className="text-2xl font-semibold text-gray-900">{uniqueBrands.length}</p>
        </div>
      </div>
    </div>
  );
};
