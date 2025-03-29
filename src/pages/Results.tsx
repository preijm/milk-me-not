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
import { ArrowUpDown, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { DrinkPreferenceIcon } from "@/components/milk-test/DrinkPreferenceIcon";
import { ImageModal } from "@/components/milk-test/ImageModal";
import { NotesPopover } from "@/components/milk-test/NotesPopover";
import { ProductPropertyBadges } from "@/components/milk-test/ProductPropertyBadges";
import { PriceQualityBadge } from "@/components/milk-test/PriceQualityBadge";
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
        .select('brand_id, brand_name, product_id, product_name, property_names, is_barista, flavor_names, rating') as unknown as {
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
    queryKey: ['milk-tests-details', expandedProduct],
    queryFn: async () => {
      if (!expandedProduct) return [];
      
      const { data, error } = await supabase
        .from('milk_tests_view')
        .select('id, created_at, brand_name, product_name, rating, username, notes, shop_name, picture_path, drink_preference, property_names, is_barista, flavor_names, price_quality_ratio')
        .eq('product_id', expandedProduct)
        .order('created_at', { ascending: false }) as unknown as {
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

  const getSortIcon = (column: string) => {
    if (sortConfig.column !== column) return <ArrowUpDown className="w-4 h-4" />;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
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
                <TableHead className="text-left">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('brand_name')}
                    className="hover:bg-transparent pl-0"
                  >
                    Brand {getSortIcon('brand_name')}
                  </Button>
                </TableHead>
                <TableHead className="text-left pr-0">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('product_name')}
                    className="hover:bg-transparent pl-0"
                  >
                    Product {getSortIcon('product_name')}
                  </Button>
                </TableHead>
                <TableHead className="w-auto pl-1">
                  {/* Badges column - no header or sorting */}
                </TableHead>
                <TableHead className="text-left">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('avg_rating')}
                    className="hover:bg-transparent pl-0"
                  >
                    Score {getSortIcon('avg_rating')}
                  </Button>
                </TableHead>
                <TableHead className="text-left">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('count')}
                    className="hover:bg-transparent pl-0"
                  >
                    Tests {getSortIcon('count')}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <React.Fragment key={result.product_id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleProductExpand(result.product_id)}
                  >
                    <TableCell className="font-medium">{result.brand_name}</TableCell>
                    <TableCell className="pr-0">{result.product_name}</TableCell>
                    <TableCell className="pl-1">
                      {/* Badges in single column with less spacing */}
                      <ProductPropertyBadges 
                        propertyNames={result.property_names}
                        isBarista={result.is_barista}
                        flavorNames={result.flavor_names}
                        compact={true}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="rounded-full h-8 w-8 flex items-center justify-center bg-cream-300">
                        <span className="font-semibold text-milk-500">{result.avg_rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{result.count}</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <Collapsible open={expandedProduct === result.product_id}>
                        <CollapsibleContent>
                          <div className="bg-gray-50 p-4">
                            <h3 className="text-lg font-medium mb-4">Individual Tests</h3>
                            {isLoadingTests ? (
                              <div className="text-center py-4">Loading test details...</div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Tester</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead className="hidden md:table-cell">Shop</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead>Style</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Image</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {productTests.map((test) => (
                                    <TableRow key={test.id}>
                                      <TableCell>{new Date(test.created_at).toLocaleDateString()}</TableCell>
                                      <TableCell>{test.username || "Anonymous"}</TableCell>
                                      <TableCell>
                                        <div className="rounded-full h-8 w-8 flex items-center justify-center bg-cream-300">
                                          <span className="font-semibold text-milk-500">{Number(test.rating).toFixed(1)}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="hidden md:table-cell">{test.shop_name || "-"}</TableCell>
                                      <TableCell className="max-w-xs">
                                        <NotesPopover notes={test.notes || "-"} />
                                      </TableCell>
                                      <TableCell>
                                        <DrinkPreferenceIcon preference={test.drink_preference} />
                                      </TableCell>
                                      <TableCell>
                                        <PriceQualityBadge priceQuality={test.price_quality_ratio} />
                                      </TableCell>
                                      <TableCell>
                                        {test.picture_path ? (
                                          <div 
                                            className="w-10 h-10 relative overflow-hidden rounded-md cursor-pointer transition-transform hover:scale-105"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleImageClick(test.picture_path!);
                                            }}
                                          >
                                            <AspectRatio ratio={1/1}>
                                              <img 
                                                src={`${supabase.storage.from('milk-pictures').getPublicUrl(test.picture_path).data.publicUrl}`} 
                                                alt="Product"
                                                className="object-cover w-full h-full"
                                                onError={(e) => {
                                                  const target = e.target as HTMLImageElement;
                                                  target.style.display = 'none';
                                                  const nextSibling = target.nextSibling as HTMLElement;
                                                  if (nextSibling) {
                                                    nextSibling.style.display = 'flex';
                                                  }
                                                }}
                                              />
                                              <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{display: 'none'}}>
                                                <ImageIcon className="w-5 h-5 text-gray-400" />
                                              </div>
                                            </AspectRatio>
                                          </div>
                                        ) : (
                                          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                                            <ImageIcon className="w-5 h-5 text-gray-400" />
                                          </div>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
              
              {filteredResults.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
