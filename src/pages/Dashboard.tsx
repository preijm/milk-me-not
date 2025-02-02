import React from "react";
import { StatsOverview } from "@/components/StatsOverview";
import { MilkCharts } from "@/components/MilkCharts";
import { Navigation } from "@/components/Navigation";

const Dashboard = ({ results }: { results: any[] }) => {
  return (
    <div className="min-h-screen bg-milk-100 py-8 px-4">
      <div className="container max-w-5xl mx-auto">
        <Navigation />
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <StatsOverview results={results} />
        <MilkCharts results={results} />
      </div>
    </div>
  );
};

export default Dashboard;