
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

const Results = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ['milk-tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milk_tests')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const filteredResults = results.filter((result) => {
    const searchString = searchTerm.toLowerCase();
    return (
      result.brand.toLowerCase().includes(searchString) ||
      (result.type || "").toLowerCase().includes(searchString) ||
      ((result.profiles?.username || "")).toLowerCase().includes(searchString)
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
              placeholder="Search by brand, type, or tester..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Tester</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{new Date(result.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{result.brand}</TableCell>
                  <TableCell>{result.type}</TableCell>
                  <TableCell>
                    <div className="rounded-full h-8 w-8 flex items-center justify-center bg-cream-300">
                      <span className="font-semibold text-milk-500">{Number(result.rating).toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{result.profiles?.username || "Anonymous"}</TableCell>
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

