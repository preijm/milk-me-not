
import React, { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { EditMilkTest } from "@/components/milk-test/EditMilkTest";
import { UserStatsOverview } from "@/components/UserStatsOverview";
import { MilkTestResult } from "@/types/milk-test";
import { SearchBar } from "@/components/milk-test/SearchBar";
import { MyResultsTable } from "@/components/milk-test/MyResultsTable";

type SortConfig = {
  column: string;
  direction: 'asc' | 'desc';
};

const MyResults = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTest, setEditingTest] = useState<MilkTestResult | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'created_at', direction: 'desc' });

  const { data: results = [], isLoading, error, refetch } = useQuery({
    queryKey: ['my-milk-tests', sortConfig],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return [];
      }
      
      // Cast to unknown first, then to our specific type
      const { data, error } = await supabase
        .from('milk_tests_view')
        .select('*')
        .eq('user_id', user.id)
        .order(sortConfig.column, { ascending: sortConfig.direction === 'asc' }) as unknown as {
          data: MilkTestResult[] | null,
          error: Error | null
        };
      
      if (error) throw error;
      return data || [];
    }
  });

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
      toast({
        title: "Success",
        description: "Test result deleted",
      });
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
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            className="mb-4"
            placeholder="Search by brand or product..."
          />
          
          <MyResultsTable
            results={filteredResults}
            sortConfig={sortConfig}
            handleSort={handleSort}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

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
