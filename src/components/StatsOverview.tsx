
import React from "react";
import { Milk } from "lucide-react";
import { MilkTestResult } from "@/types/milk-test";
export const StatsOverview = ({
  results
}: {
  results: MilkTestResult[];
}) => {
  const avgRating = results.length ? (results.reduce((acc, curr) => acc + curr.rating, 0) / results.length).toFixed(1) : "0.0";

  // Get unique product types from the property_names array, filtering out any nulls or undefined
  const types = results.length ? [...new Set(results.flatMap(r => r.property_names || []))] : [];

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
  const avgPrice = pricesAvailable.length ? (pricesAvailable.reduce((acc, curr) => acc + (curr.price || 0), 0) / pricesAvailable.length).toFixed(2) : "N/A";
  return <div className="rounded-lg p-4 mb-6 bg-white">
      <div className="flex items-center gap-3 mb-4">
        <Milk className="w-6 h-6 text-gray-500" />
        <h2 className="text-xl font-semibold text-gray-900">Milk Taste Test Results</h2>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <div className="flex flex-col rounded-lg p-3 shadow-sm transition-transform hover:shadow-md md:hover:-translate-y-1 bg-surface-cream">
          <p className="text-xs text-muted-foreground mb-1">Average Rating</p>
          <p className="text-xl font-bold text-foreground">{avgRating}/10</p>
        </div>
        <div className="flex flex-col rounded-lg p-3 shadow-sm transition-transform hover:shadow-md md:hover:-translate-y-1 bg-surface-cream">
          <p className="text-xs text-muted-foreground mb-1">Total Tests</p>
          <p className="text-xl font-bold text-foreground">{results.length}</p>
        </div>
        <div className="flex flex-col rounded-lg p-3 shadow-sm transition-transform hover:shadow-md md:hover:-translate-y-1 bg-surface-cream">
          <p className="text-xs text-muted-foreground mb-1">Milk Types</p>
          <p className="text-xl font-bold text-foreground">{types.length}</p>
        </div>
        <div className="flex flex-col rounded-lg p-3 shadow-sm transition-transform hover:shadow-md md:hover:-translate-y-1 bg-surface-cream">
          <p className="text-xs text-muted-foreground mb-1">Most Common</p>
          <p className="text-xl font-bold text-foreground truncate">{mostCommonType}</p>
        </div>
        <div className="flex flex-col rounded-lg p-3 shadow-sm transition-transform hover:shadow-md md:hover:-translate-y-1 bg-surface-cream">
          <p className="text-xs text-muted-foreground mb-1">Avg. Price</p>
          <p className="text-xl font-bold text-foreground">{avgPrice !== "N/A" ? `$${avgPrice}` : avgPrice}</p>
        </div>
      </div>
    </div>;
};
