import React from "react";
import { MilkTestResult } from "@/types/milk-test";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductPropertyBadges } from "@/components/milk-test/ProductPropertyBadges";
import { Badge } from "@/components/ui/badge";
import { getScoreBadgeVariant } from "@/lib/scoreUtils";
import { formatScore } from "@/lib/scoreFormatter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MyResultsGridProps {
  results: MilkTestResult[];
  onEdit: (result: MilkTestResult) => void;
  onDelete: (id: string) => void;
}

export const MyResultsGrid = ({
  results,
  onEdit,
  onDelete
}: MyResultsGridProps) => {
  const getPictureUrl = (picturePath: string | null | undefined) => {
    if (!picturePath) return null;
    return supabase.storage.from('milk-pictures').getPublicUrl(picturePath).data.publicUrl;
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No test results found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {results.map(result => {
        const imageUrl = getPictureUrl(result.picture_path);
        const hasBadges = result.is_barista || 
          (result.property_names && result.property_names.length > 0) || 
          (result.flavor_names && result.flavor_names.length > 0);

        return (
          <Card key={result.id} className="overflow-hidden hover:shadow-md transition-shadow relative group">
            <div className="relative">
              <div className="bg-gray-100 aspect-square">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={`${result.brand_name} ${result.product_name}`} 
                    className="object-cover w-full h-full" 
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }} 
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
                
                {/* Rating badge */}
                <div className="absolute top-1.5 right-1.5 shadow-md rounded-lg">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant={getScoreBadgeVariant(Number(result.rating))}>
                          {formatScore(Number(result.rating))}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Score: {formatScore(Number(result.rating))}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
            
            <CardContent className={`p-2 ${!hasBadges ? 'pb-2' : ''} relative`}>
              <div className={`space-y-1.5 ${!hasBadges ? 'space-y-1' : ''}`}>
                {/* Date */}
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(result.created_at).toLocaleDateString()}
                </div>
                
                {/* Brand & Product */}
                <div>
                  <div className="mb-1">
                    <h3 className="font-medium text-sm truncate">{result.brand_name}</h3>
                    <p className="text-gray-700 truncate" style={{fontSize: '14px'}}>{result.product_name}</p>
                  </div>
                  
                  {/* Badges - only render if they exist */}
                  {hasBadges && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.is_barista && <ProductPropertyBadges isBarista={result.is_barista} compact={true} displayType="barista" />}
                      <ProductPropertyBadges propertyNames={result.property_names} flavorNames={result.flavor_names} compact={true} />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions - positioned at bottom right */}
              <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(result)}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700" onClick={() => onDelete(result.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};