
import React, { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { SearchBar } from "@/components/milk-test/SearchBar";
import { AggregatedResultsTable } from "@/components/milk-test/AggregatedResultsTable";
import { ImageModal } from "@/components/milk-test/ImageModal";
import { MilkTestResult } from "@/types/milk-test";

type SortConfig = {
  column: string;
  direction: 'asc' | 'desc';
};

type AggregatedResult = {
  brand_id: string;
  brand_name: string;
  product_id: string;
  product_name: string;
  property_names?: string[] | null;
  is_barista?: boolean;
  flavor_names?: string[] | null;
  avg_rating: number;
  count: number;
};

const Results = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'avg_rating', direction: 'desc' });
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch aggregated results with average ratings
  const { data: aggregatedResults = [], isLoading: isLoadingAggregated } = useQuery({
    queryKey: ['milk-tests-aggregated', sortConfig],
    queryFn: async () => {
      console.log("Fetching with sort config:", sortConfig);
      
      // Get all milk test data first
      const { data, error } = await supabase
        .from('milk_tests_view')
        .select('brand_id, brand_name, product_id, product_name, property_names, is_barista, flavor_names, rating, price_quality_ratio') as unknown as {
          data: MilkTestResult[] | null,
          error: Error | null
        };
      
      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }

      console.log("Raw data length:", data?.length);
      
      // Group by product and calculate average
      const productMap = new Map<string, AggregatedResult>();
      
      data?.forEach(item => {
        if (!item.product_id) return;
        
        const key = item.product_id;
        if (!productMap.has(key)) {
          productMap.set(key, {
            brand_id: item.brand_id || '',
            brand_name: item.brand_name || '',
            product_id: item.product_id,
            product_name: item.product_name || '',
            property_names: item.property_names || null,
            is_barista: item.is_barista || false,
            flavor_names: item.flavor_names || null,
            avg_rating: 0,
            count: 0
          });
        }
        
        const product = productMap.get(key)!;
        product.avg_rating = (product.avg_rating * product.count + (item.rating || 0)) / (product.count + 1);
        product.count += 1;
      });
      
      let results = Array.from(productMap.values());
      console.log("Aggregated results before sorting:", results.length);
      
      // Manual sorting based on sortConfig
      results.sort((a, b) => {
        let comparison = 0;
        
        if (sortConfig.column === 'brand_name') {
          comparison = (a.brand_name || '').localeCompare(b.brand_name || '');
        } else if (sortConfig.column === 'product_name') {
          comparison = (a.product_name || '').localeCompare(b.product_name || '');
        } else if (sortConfig.column === 'avg_rating') {
          comparison = a.avg_rating - b.avg_rating;
        } else if (sortConfig.column === 'count') {
          comparison = a.count - b.count;
        } 
        
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
      
      console.log("Sorted results:", results.length);
      return results;
    },
  });

  // Fetch individual tests for expanded product
  const { data: productTests = [], isLoading: isLoadingTests } = useQuery({
    queryKey: ['milk-tests-details', expandedProduct, sortConfig],
    queryFn: async () => {
      if (!expandedProduct) return [];
      
      let query = supabase
        .from('milk_tests_view')
        .select('id, created_at, brand_name, product_name, rating, username, notes, shop_name, picture_path, drink_preference, property_names, is_barista, flavor_names, price_quality_ratio, shop_country_code')
        .eq('product_id', expandedProduct);
      
      // Add sorting based on sortConfig if applicable to this detail view
      const detailSortableColumns = ['created_at', 'rating', 'price_quality_ratio', 'username'];
      if (detailSortableColumns.includes(sortConfig.column)) {
        query = query.order(sortConfig.column, { ascending: sortConfig.direction === 'asc' });
      } else {
        // Default ordering if the current sort column doesn't apply to details
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query as unknown as {
        data: MilkTestResult[] | null,
        error: Error | null
      };
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!expandedProduct
  });

  const handleSort = (column: string) => {
    setSortConfig(current => {
      // If clicking on the same column, toggle direction
      if (current.column === column) {
        return {
          column,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      
      // If clicking on a different column, default to desc direction
      return {
        column,
        direction: 'desc'
      };
    });
  };

  const toggleProductExpand = (productId: string) => {
    setExpandedProduct(current => current === productId ? null : productId);
  };

  const filteredResults = aggregatedResults.filter((result) => {
    const searchString = searchTerm.toLowerCase();
    return (
      (result.brand_name || "").toLowerCase().includes(searchString) ||
      (result.product_name || "").toLowerCase().includes(searchString)
    );
  });

  // Handle opening the image modal
  const handleImageClick = (picturePath: string) => {
    if (!picturePath) return;
    
    const imageUrl = supabase.storage.from('milk-pictures').getPublicUrl(picturePath).data.publicUrl;
    setSelectedImage(imageUrl);
  };

  if (isLoadingAggregated) {
    return (
      <div className="min-h-screen bg-milk-100 py-8 px-4">
        <div className="container max-w-5xl mx-auto">
          <Navigation />
          <div className="text-center mt-8">Loading...</div>
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
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            className="mb-4"
          />
          
          <AggregatedResultsTable
            results={filteredResults}
            sortConfig={sortConfig}
            handleSort={handleSort}
            expandedProduct={expandedProduct}
            toggleProductExpand={toggleProductExpand}
            isLoadingTests={isLoadingTests}
            productTests={productTests}
            handleImageClick={handleImageClick}
          />
        </div>
      </div>

      {/* Image modal */}
      {selectedImage && (
        <ImageModal 
          imageUrl={selectedImage} 
          isOpen={!!selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  );
};

export default Results;
