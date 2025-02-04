import React from "react";
import { AddMilkTest } from "@/components/AddMilkTest";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-milk-100 py-8 px-4">
      <div className="container max-w-2xl mx-auto">
        <Navigation />
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Add New Milk Test</h1>
        <AddMilkTest />
      </div>
    </div>
  );
};

export default Index;