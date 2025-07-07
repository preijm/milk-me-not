import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { EditMilkTest } from "@/components/milk-test/EditMilkTest";
import { UserStatsOverview } from "@/components/UserStatsOverview";
import { MilkTestResult } from "@/types/milk-test";
import { UserResultsContainer } from "@/components/milk-test/UserResultsContainer";
import { supabase } from "@/integrations/supabase/client";
import { useUserMilkTests, SortConfig } from "@/hooks/useUserMilkTests";
import MenuBar from "@/components/MenuBar";
import BackgroundPattern from "@/components/BackgroundPattern";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const MyResults = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTest, setEditingTest] = useState<MilkTestResult | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'created_at', direction: 'desc' });
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const { data: results = [], isLoading, error, refetch } = useUserMilkTests(sortConfig);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('milk_tests')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete test result",
        variant: "destructive",
      });
    } else {
      // Success toast removed
      refetch();
    }
  };

  const handleSort = (column: string) => {
    setSortConfig(current => ({
      column,
      direction: current.column === column && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleEdit = (test: MilkTestResult) => {
    // Pass the complete MilkTestResult object
    setEditingTest(test);
  };

  const filteredResults = results.filter((result) => {
    const searchString = searchTerm.toLowerCase();
    return (
      (result.brand_name || "").toLowerCase().includes(searchString) ||
      (result.product_name || "").toLowerCase().includes(searchString)
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <MenuBar />
        <BackgroundPattern>
          <div className="container max-w-6xl mx-auto px-4 py-8 pt-32 relative z-10">
            <div className="text-center mt-8">Loading...</div>
          </div>
        </BackgroundPattern>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <MenuBar />
        <BackgroundPattern>
          <div className="container max-w-6xl mx-auto px-4 py-8 pt-32 relative z-10">
            <div className="text-center mt-8 text-red-500">Error loading data</div>
          </div>
        </BackgroundPattern>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="container max-w-6xl mx-auto px-4 py-8 pt-32 relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Results</h1>
          
          {/* Stats Overview Card - Separated like product details page */}
          <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-6 animate-fade-in">
            <CardContent className="p-6">
              <UserStatsOverview results={results} />
            </CardContent>
          </Card>

          {/* Results Table/Grid Card - Separated like product details page */}
          <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden animate-fade-in">
            <CardHeader className="bg-white/50 backdrop-blur-sm pb-4 pt-6 px-6">
              <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 pt-0">
                <UserResultsContainer 
                  filteredResults={filteredResults}
                  sortConfig={sortConfig}
                  handleSort={handleSort}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
              </div>
            </CardContent>
          </Card>

          {editingTest && (
            <EditMilkTest
              test={editingTest}
              open={!!editingTest}
              onOpenChange={(open) => !open && setEditingTest(null)}
              onSuccess={refetch}
            />
          )}
        </div>
      </BackgroundPattern>
    </div>
  );
};

export default MyResults;
