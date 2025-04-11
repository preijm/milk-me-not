
import React, { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/components/ui/use-toast";
import { EditMilkTest } from "@/components/milk-test/EditMilkTest";
import { UserStatsOverview } from "@/components/UserStatsOverview";
import { MilkTestResult } from "@/types/milk-test";
import { UserResultsContainer } from "@/components/milk-test/UserResultsContainer";
import { supabase } from "@/integrations/supabase/client";
import { useUserMilkTests, SortConfig } from "@/hooks/useUserMilkTests";

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
    // Map the MilkTestResult to the format expected by EditMilkTest
    const testForEdit: MilkTestResult = {
      ...test,
      brand: test.brand_name || '',
      shop: test.shop_name || '',
      product_type_keys: test.property_names || []
    };
    setEditingTest(testForEdit);
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
    <div className="min-h-screen bg-milk-100 py-8 px-4">
      <div className="container max-w-5xl mx-auto">
        <Navigation />
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Results</h1>
        
        <UserStatsOverview results={results} />
        
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

        {editingTest && (
          <EditMilkTest
            test={editingTest as any}
            open={!!editingTest}
            onOpenChange={(open) => !open && setEditingTest(null)}
            onSuccess={refetch}
          />
        )}
      </div>
    </div>
  );
};

export default MyResults;
