import React, { useState } from "react";
import { Navigation } from "@/components/Navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type SortConfig = {
  column: string;
  direction: 'asc' | 'desc';
};

const Results = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'created_at', direction: 'desc' });

  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ['milk-tests', sortConfig],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milk_tests_view')
        .select('*')
        .order(sortConfig.column, { ascending: sortConfig.direction === 'asc' });
      
      if (error) throw error;
      return data;
    },
  });

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
      (result.product_name || "").toLowerCase().includes(searchString) ||
      (result.display_name || "").toLowerCase().includes(searchString)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Results</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <Input
              placeholder="Search by brand, product, or tester..."
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
                <TableHead>Tester</TableHead>
                <TableHead>Notes</TableHead>
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
                  <TableCell>{result.display_name || "Anonymous"}</TableCell>
                  <TableCell className="max-w-xs truncate">{result.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Results;
