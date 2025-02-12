
import React from "react";
import { StatsOverview } from "@/components/StatsOverview";
import { MilkCharts } from "@/components/MilkCharts";
import { Navigation } from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ['milk-tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milk_tests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-milk-100 py-8 px-4">
        <div className="container max-w-5xl mx-auto">
          <Navigation />
          <div className="text-center mt-8">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-milk-100 py-8 px-4">
        <div className="container max-w-5xl mx-auto">
          <Navigation />
          <div className="text-center mt-8 text-red-500">Error loading data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-milk-50 to-cream-100 py-8 px-4 overflow-y-auto">
      <div className="container max-w-6xl mx-auto space-y-8">
        <Navigation />
        <div className="space-y-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 animate-fade-in">
            Milk Insights Dashboard
          </h1>
          
          <div className="grid gap-8 animate-fade-in">
            <StatsOverview results={results} />
            <MilkCharts results={results} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
