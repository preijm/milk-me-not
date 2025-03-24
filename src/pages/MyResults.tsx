
import React, { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { EditMilkTest } from "@/components/milk-test/EditMilkTest";
import { UserStatsOverview } from "@/components/UserStatsOverview";
import { MilkTestResult } from "@/types/milk-test";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const getSortIcon = (column: string) => {
    if (sortConfig.column !== column) return <ArrowUpDown className="w-4 h-4" />;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
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
          <div className="mb-4">
            <Input
              placeholder="Search by brand or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('created_at')}
                    className="hover:bg-transparent"
                  >
                    Date {getSortIcon('created_at')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('brand_name')}
                    className="hover:bg-transparent"
                  >
                    Brand {getSortIcon('brand_name')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('product_name')}
                    className="hover:bg-transparent"
                  >
                    Product {getSortIcon('product_name')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('rating')}
                    className="hover:bg-transparent"
                  >
                    Score {getSortIcon('rating')}
                  </Button>
                </TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{new Date(result.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{result.brand_name}</TableCell>
                  <TableCell>{result.product_name}</TableCell>
                  <TableCell>
                    <div className="rounded-full h-8 w-8 flex items-center justify-center bg-cream-300">
                      <span className="font-semibold text-milk-500">{Number(result.rating).toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{result.notes}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="bg-white hover:bg-gray-100"
                        onClick={() => {
                          // Map the MilkTestResult to the format expected by EditMilkTest
                          const testForEdit: MilkTestResult = {
                            ...result,
                            brand: result.brand_name || '',
                            shop: result.shop_name || '',
                            product_type_keys: result.property_names || []
                          };
                          setEditingTest(testForEdit);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="bg-white hover:bg-gray-100"
                        onClick={() => handleDelete(result.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
