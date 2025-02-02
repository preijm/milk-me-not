import React, { useState } from "react";
import { MilkCard } from "@/components/MilkCard";
import { AddMilkTest } from "@/components/AddMilkTest";
import { StatsOverview } from "@/components/StatsOverview";

// Sample initial data
const initialResults = [
  {
    id: 1,
    brand: "Happy Cows",
    type: "Whole Milk",
    rating: 4,
    notes: "Creamy and rich, with a smooth finish",
    date: "2024-02-20",
  },
  {
    id: 2,
    brand: "Green Meadows",
    type: "2% Reduced Fat",
    rating: 3,
    notes: "Light and refreshing, but lacking depth",
    date: "2024-02-19",
  },
];

const Index = () => {
  const [results, setResults] = useState(initialResults);

  const handleAddResult = (newResult: any) => {
    setResults([newResult, ...results]);
  };

  return (
    <div className="min-h-screen bg-milk-100 py-8 px-4">
      <div className="container max-w-5xl mx-auto">
        <StatsOverview results={results} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <AddMilkTest onAdd={handleAddResult} />
          </div>
          <div className="space-y-6">
            {results.map((result) => (
              <MilkCard key={result.id} result={result} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;