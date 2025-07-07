
import React from "react";
import { MilkTestResult } from "@/types/milk-test";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductPropertyBadges } from "@/components/milk-test/ProductPropertyBadges";
import { Badge } from "@/components/ui/badge";
import { getScoreBadgeVariant } from "@/lib/scoreUtils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MyResultsGridProps {
  results: MilkTestResult[];
  onEdit: (result: MilkTestResult) => void;
  onDelete: (id: string) => void;
}

export const MyResultsGrid = ({ results, onEdit, onDelete }: MyResultsGridProps) => {
  const getPictureUrl = (picturePath: string | null | undefined) => {
    if (!picturePath) return null;
    return supabase.storage.from('milk-pictures').getPublicUrl(picturePath).data.publicUrl;
  };

  const getRatingColorClass = (rating: number) => {
    if (rating >= 8.5) return "bg-green-500 text-white";
    if (rating >= 7.5) return "bg-green-400 text-white";
    if (rating >= 6.5) return "bg-blue-400 text-white";
    if (rating >= 5.5) return "bg-yellow-400 text-gray-800";
    if (rating >= 4.5) return "bg-orange-400 text-white";
    return "bg-red-400 text-white";
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No test results found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {results.map((result) => {
        const imageUrl = getPictureUrl(result.picture_path);
        const ratingColorClass = getRatingColorClass(Number(result.rating));
        
        return (
          <Card key={result.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              <AspectRatio ratio={1} className="bg-gray-100">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={`${result.brand_name} ${result.product_name}`} 
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                
                {/* Rating badge */}
                <div className="absolute top-2 right-2 shadow-md">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant={getScoreBadgeVariant(Number(result.rating))}>
                          {Number(result.rating).toFixed(1)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Score: {Number(result.rating).toFixed(1)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </AspectRatio>
            </div>
            
            <CardContent className="p-3">
              <div className="space-y-2">
                {/* Date */}
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(result.created_at).toLocaleDateString()}
                </div>
                
                {/* Brand & Product */}
                <div>
                  <h3 className="font-medium text-sm truncate">{result.brand_name}</h3>
                  <div className="flex items-center flex-wrap gap-1">
                    <p className="text-xs text-gray-700 truncate">{result.product_name}</p>
                    {result.is_barista && (
                      <ProductPropertyBadges 
                        isBarista={result.is_barista}
                        compact={true}
                        displayType="barista"
                        inline={true}
                      />
                    )}
                  </div>
                </div>
                
                {/* Properties */}
                <div className="flex flex-wrap gap-1">
                  <ProductPropertyBadges 
                    propertyNames={result.property_names}
                    flavorNames={result.flavor_names}
                    compact={true}
                  />
                </div>
                
                {/* Actions */}
                <div className="flex justify-end gap-1 mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0" 
                    onClick={() => onEdit(result)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700" 
                    onClick={() => onDelete(result.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
