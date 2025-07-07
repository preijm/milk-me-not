
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { MilkTestResult } from "@/types/milk-test";
import { PriceQualityBadge } from "@/components/milk-test/PriceQualityBadge";
import { SortableColumnHeader } from "@/components/milk-test/SortableColumnHeader";
import { ProductPropertyBadges } from "@/components/milk-test/ProductPropertyBadges";
import { SortConfig } from "@/hooks/useUserMilkTests";
import { NotesPopover } from "@/components/milk-test/NotesPopover";
import { DrinkPreferenceIcon } from "@/components/milk-test/DrinkPreferenceIcon";
import { Badge } from "@/components/ui/badge";
import { getScoreBadgeVariant } from "@/lib/scoreUtils";
import { formatScore } from "@/lib/scoreFormatter";
import { ImageIcon } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MyResultsTableProps {
  results: MilkTestResult[];
  sortConfig: SortConfig;
  handleSort: (column: string) => void;
  onEdit: (result: MilkTestResult) => void;
  onDelete: (id: string) => void;
  onImageClick?: (path: string) => void;
}

export const MyResultsTable = ({ 
  results, 
  sortConfig, 
  handleSort, 
  onEdit, 
  onDelete,
  onImageClick 
}: MyResultsTableProps) => {
  const getRatingColorClass = (rating: number) => {
    if (rating >= 8.5) return "bg-green-500 text-white";
    if (rating >= 7.5) return "bg-green-400 text-white";
    if (rating >= 6.5) return "bg-blue-400 text-white";
    if (rating >= 5.5) return "bg-yellow-400 text-gray-800";
    if (rating >= 4.5) return "bg-orange-400 text-white";
    return "bg-red-400 text-white";
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 text-sm">
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[10%]">
              <SortableColumnHeader
                column="created_at"
                label="Date"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[12%]">
              <SortableColumnHeader
                column="brand_name"
                label="Brand"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[25%]">
              <SortableColumnHeader
                column="product_name"
                label="Product"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[6%]">
              <SortableColumnHeader
                column="rating"
                label="Score"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[6%]">
              <SortableColumnHeader
                column="drink_preference"
                label="Style"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[7%]">
              <SortableColumnHeader
                column="price_quality_ratio"
                label="Price"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[20%]">
              <SortableColumnHeader
                column="shop_name"
                label="Shop"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[6%]">
              <SortableColumnHeader
                column="notes"
                label="Note"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[8%]">
              <SortableColumnHeader
                column="picture_path"
                label="Image"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                No results found
              </TableCell>
            </TableRow>
          ) : (
            results.map((result) => (
              <TableRow key={result.id}>
                <TableCell>{new Date(result.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{result.brand_name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{result.product_name}</span>
                    <div className="flex flex-wrap gap-2">
                      {result.is_barista && (
                        <ProductPropertyBadges 
                          isBarista={result.is_barista}
                          compact={true}
                          displayType="barista"
                          inline={true}
                        />
                      )}
                      
                      <ProductPropertyBadges 
                        propertyNames={result.property_names}
                        compact={true}
                        displayType="properties"
                        inline={true}
                      />
                      
                      <ProductPropertyBadges 
                        flavorNames={result.flavor_names}
                        compact={true}
                        displayType="flavors"
                        inline={true}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getScoreBadgeVariant(Number(result.rating))}>
                    {formatScore(Number(result.rating))}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <DrinkPreferenceIcon preference={result.drink_preference} />
                  </div>
                </TableCell>
                <TableCell>
                  <PriceQualityBadge priceQuality={result.price_quality_ratio} />
                </TableCell>
                <TableCell>
                  {result.shop_name}
                  {result.shop_country_code && (
                    <span className="text-gray-500 text-xs ml-1">
                      ({result.shop_country_code})
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-left">
                  <NotesPopover notes={result.notes || "-"} />
                </TableCell>
                <TableCell>
                  {result.picture_path ? (
                    <div 
                      className="w-10 h-10 relative overflow-hidden rounded-lg cursor-pointer transition-transform hover:scale-105 border border-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageClick?.(result.picture_path!);
                      }}
                    >
                      <AspectRatio ratio={1/1}>
                        <img 
                          src={`${supabase.storage.from('milk-pictures').getPublicUrl(result.picture_path).data.publicUrl}`} 
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
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
