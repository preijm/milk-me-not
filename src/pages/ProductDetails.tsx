
import React from "react";
import { useParams, Link } from "react-router-dom";
import MenuBar from "@/components/MenuBar";
import BackgroundPattern from "@/components/BackgroundPattern";
import { SortConfig, useProductTests } from "@/hooks/useProductTests";
import { TestDetailsTable } from "@/components/milk-test/TestDetailsTable";
import { ImageModal } from "@/components/milk-test/ImageModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductPropertyBadges } from "@/components/milk-test/ProductPropertyBadges";
import { CircularStats } from "@/components/CircularStats";

type ProductDetails = {
  product_id: string;
  brand_name: string;
  product_name: string;
  property_names: string[] | null;
  is_barista: boolean;
  flavor_names: string[] | null;
  avg_rating: number;
  count: number;
}

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // Set default sort to created_at in descending order to show latest tests first
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'created_at', direction: 'desc' });
  
  // Fetch product details using milk_tests_view to aggregate the data
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product-details', productId],
    queryFn: async () => {
      if (!productId) return null;
      
      // Get all tests for this product
      const { data: testData, error: testError } = await supabase
        .from('milk_tests_view')
        .select('product_id, brand_name, product_name, property_names, is_barista, flavor_names, rating')
        .eq('product_id', productId);
      
      if (testError) throw testError;
      if (!testData || testData.length === 0) return null;
      
      // Aggregate the data
      const aggregatedData: ProductDetails = {
        product_id: productId,
        brand_name: testData[0].brand_name || '',
        product_name: testData[0].product_name || '',
        property_names: testData[0].property_names || null,
        is_barista: testData[0].is_barista || false,
        flavor_names: testData[0].flavor_names || null,
        avg_rating: 0,
        count: testData.length
      };
      
      // Calculate average rating
      const totalRating = testData.reduce((sum, test) => sum + (test.rating || 0), 0);
      aggregatedData.avg_rating = totalRating / testData.length;
      
      return aggregatedData;
    },
    enabled: !!productId
  });

  // Fetch individual tests for the product
  const { data: productTests = [], isLoading: isLoadingTests } = useProductTests(productId, sortConfig);

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

  // Handle opening the image modal
  const handleImageClick = (picturePath: string) => {
    if (!picturePath) return;
    
    const imageUrl = supabase.storage.from('milk-pictures').getPublicUrl(picturePath).data.publicUrl;
    setSelectedImage(imageUrl);
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen">
        <MenuBar />
        <BackgroundPattern>
          <div className="container max-w-5xl mx-auto px-4 py-8 pt-32 relative z-10">
            <div className="flex items-center mb-6">
              <Link to="/results">
                <Button variant="outline" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back to results
                </Button>
              </Link>
            </div>
            <div className="text-center py-12">Loading product details...</div>
          </div>
        </BackgroundPattern>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <MenuBar />
        <BackgroundPattern>
          <div className="container max-w-5xl mx-auto px-4 py-8 pt-32 relative z-10">
            <div className="flex items-center mb-6">
              <Link to="/results">
                <Button variant="outline" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back to results
                </Button>
              </Link>
            </div>
            <div className="text-center py-12">Product not found</div>
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
          <div className="flex items-center mb-6">
            <Link to="/results">
              <Button variant="outline" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back to results
              </Button>
            </Link>
          </div>

          {/* Redesigned compact header */}
          <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-6 animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Brand</div>
                    <h2 className="text-xl font-bold text-gray-900">{product.brand_name}</h2>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Product</div>
                    <div className="flex items-center">
                      <h3 className="" style={{fontSize: '20px'}}>{product.product_name}</h3>
                      <div className="flex flex-wrap gap-1 ml-2">
                        {product.is_barista && (
                          <ProductPropertyBadges 
                            isBarista={product.is_barista}
                            displayType="barista"
                            inline={true}
                            compact={true}
                          />
                        )}
                        
                        <ProductPropertyBadges 
                          propertyNames={product.property_names}
                          displayType="properties"
                          inline={true}
                          compact={true}
                        />
                        
                        <ProductPropertyBadges 
                          flavorNames={product.flavor_names}
                          displayType="flavors"
                          inline={true}
                          compact={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <CircularStats 
                  score={product.avg_rating} 
                  testCount={product.count} 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden animate-fade-in">
            <CardHeader className="bg-white/50 backdrop-blur-sm pt-6 px-6">
              <CardTitle className="text-xl">Individual Tests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingTests ? (
                <div className="text-center py-8">Loading test results...</div>
              ) : (
                <TestDetailsTable 
                  productTests={productTests} 
                  handleImageClick={handleImageClick}
                  sortConfig={sortConfig}
                  handleSort={handleSort}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </BackgroundPattern>

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

export default ProductDetails;
