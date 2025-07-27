
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  
  const getCountryFlag = (code: string) => {
    if (!code) return '';
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
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
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[10%]">
              <SortableColumnHeader
                column="brand_name"
                label="Brand"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[30%]">
              <SortableColumnHeader
                column="product_name"
                label="Product"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[8%]">
              <SortableColumnHeader
                column="rating"
                label="Score"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[8%]">
              <SortableColumnHeader
                column="drink_preference"
                label="Style"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[8%]">
              <SortableColumnHeader
                column="price_quality_ratio"
                label="Price"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="hidden md:table-cell font-semibold text-gray-700 text-left pl-4 w-[15%]">
              <SortableColumnHeader
                column="shop_name"
                label="Shop"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="hidden md:table-cell font-semibold text-gray-700 text-left pl-4 w-[8%]">
              <SortableColumnHeader
                column="country_code"
                label="Country"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="w-[8%] font-semibold text-gray-700 text-left pl-4">
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
            <TableHead className="w-[3%]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8">
                No results found
              </TableCell>
            </TableRow>
          ) : (
            results.map((result) => (
              <TableRow key={result.id} className="group">
                <TableCell>{new Date(result.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{result.brand_name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{result.product_name}</span>
                    <div className="flex flex-wrap gap-1">
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
                <TableCell className="hidden md:table-cell">
                  {result.shop_name || "-"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {result.country_code ? (
                    <div className="flex items-center gap-1">
                      <span className="text-lg">{getCountryFlag(result.country_code)}</span>
                      <span className="text-xs text-gray-600">{result.country_code}</span>
                    </div>
                  ) : (
                    "-"
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
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
                      <DropdownMenuItem
                        onClick={() => onEdit(result)}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(result.id)}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
