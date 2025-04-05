
import React, { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { ResultsContainer } from "@/components/milk-test/ResultsContainer";
import { ImageModal } from "@/components/milk-test/ImageModal";
import { SortConfig, useAggregatedResults } from "@/hooks/useAggregatedResults";
import { useProductTests } from "@/hooks/useProductTests";
import { supabase } from "@/integrations/supabase/client";

const Results = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // Set default sort to created_at in descending order to show latest tests first
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'created_at', direction: 'desc' });
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch aggregated results with average ratings
  const { data: aggregatedResults = [], isLoading: isLoadingAggregated } = useAggregatedResults(sortConfig);

  // Fetch individual tests for expanded product
  const { data: productTests = [], isLoading: isLoadingTests } = useProductTests(expandedProduct, sortConfig);

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
        
        <ResultsContainer 
          filteredResults={filteredResults}
          sortConfig={sortConfig}
          handleSort={handleSort}
          expandedProduct={expandedProduct}
          toggleProductExpand={toggleProductExpand}
          isLoadingTests={isLoadingTests}
          productTests={productTests}
          handleImageClick={handleImageClick}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
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
