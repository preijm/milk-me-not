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

type SortConfig = {
  column: string;
  direction: 'asc' | 'desc';
};

type AggregatedResult = {
  brand_id: string;
  brand_name: string;
  product_id: string;
  product_name: string;
  avg_rating: number;
  count: number;
};

type MilkTest = {
  id: string;
  created_at: string;
  brand_name: string;
  product_name: string;
  rating: number;
  username: string;
  notes?: string;
  shop_name?: string;
  picture_path?: string;
  drink_preference?: string;
};

const Results = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'avg_rating', direction: 'desc' });
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string | null>(null);

  // Fetch aggregated results with average ratings
  const { data: aggregatedResults = [], isLoading: isLoadingAggregated } = useQuery({
    queryKey: ['milk-tests-aggregated', sortConfig],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milk_tests_view')
        .select('brand_id, brand_name, product_id, product_name, rating')
        .order(sortConfig.column === 'avg_rating' ? 'rating' : sortConfig.column, { ascending: sortConfig.direction === 'asc' });
      
      if (error) throw error;

      // Group by product and calculate average
      const productMap = new Map<string, AggregatedResult>();
      
      data.forEach(item => {
        if (!item.product_id) return;
        
        const key = item.product_id;
        if (!productMap.has(key)) {
          productMap.set(key, {
            brand_id: item.brand_id || '',
            brand_name: item.brand_name || '',
            product_id: item.product_id,
            product_name: item.product_name || '',
            avg_rating: 0,
            count: 0
          });
        }
        
        const product = productMap.get(key)!;
        product.avg_rating = (product.avg_rating * product.count + (item.rating || 0)) / (product.count + 1);
        product.count += 1;
      });
      
      return Array.from(productMap.values());
    },
  });

  // Fetch individual tests for expanded product
  const { data: productTests = [], isLoading: isLoadingTests } = useQuery({
    queryKey: ['milk-tests-details', expandedProduct],
    queryFn: async () => {
      if (!expandedProduct) return [];
      
      const { data, error } = await supabase
        .from('milk_tests_view')
        .select('id, created_at, brand_name, product_name, rating, username, notes, shop_name, picture_path, drink_preference')
        .eq('product_id', expandedProduct)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MilkTest[];
    },
    enabled: !!expandedProduct
  });

  const handleSort = (column: string) => {
    setSortConfig(current => ({
      column: column === 'rating' ? 'avg_rating' : column,
      direction: current.column === column && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (column: string) => {
    const compareColumn = column === 'rating' ? 'avg_rating' : column;
    if (sortConfig.column !== compareColumn) return <ArrowUpDown className="w-4 h-4" />;
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
                <TableHead>Tests</TableHead>
                <TableHead className="hidden md:table-cell">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <React.Fragment key={result.product_id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleProductExpand(result.product_id)}
                  >
                    <TableCell>-</TableCell>
                    <TableCell className="font-medium">{result.brand_name}</TableCell>
                    <TableCell>{result.product_name}</TableCell>
                    <TableCell>
                      <div className="rounded-full h-8 w-8 flex items-center justify-center bg-cream-300">
                        <span className="font-semibold text-milk-500">{result.avg_rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{result.count}</TableCell>
                    <TableCell className="hidden md:table-cell">-</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <Collapsible open={expandedProduct === result.product_id}>
                        <CollapsibleContent>
                          <div className="bg-gray-50 p-4">
                            <h3 className="text-lg font-medium mb-4">Individual tests for {result.product_name}</h3>
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
                  <TableCell colSpan={6} className="text-center py-8">
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Image modal for enlarged view */}
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
