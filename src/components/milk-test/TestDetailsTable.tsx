
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { DrinkPreferenceIcon } from "./DrinkPreferenceIcon";
import { PriceQualityBadge } from "./PriceQualityBadge";
import { NotesPopover } from "./NotesPopover";
import { MilkTestResult } from "@/types/milk-test";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableColumnHeader } from "./SortableColumnHeader";

interface TestDetailsTableProps {
  productTests: MilkTestResult[];
  handleImageClick: (path: string) => void;
  sortConfig?: {
    column: string;
    direction: 'asc' | 'desc';
  };
  handleSort?: (column: string) => void;
}

export const TestDetailsTable = ({ 
  productTests, 
  handleImageClick,
  sortConfig,
  handleSort
}: TestDetailsTableProps) => {
  // Default handlers if not provided (for backward compatibility)
  const onSort = handleSort || (() => {});
  const sortCfg = sortConfig || { column: '', direction: 'asc' };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Tester</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Style</TableHead>
          <TableHead>
            {handleSort ? (
              <SortableColumnHeader
                column="price_quality_ratio"
                label="Price"
                sortConfig={sortCfg}
                onSort={onSort}
              />
            ) : (
              "Price"
            )}
          </TableHead>
          <TableHead className="hidden md:table-cell">Shop</TableHead>
          <TableHead className="w-48">Notes</TableHead>
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
            <TableCell>
              <DrinkPreferenceIcon preference={test.drink_preference} />
            </TableCell>
            <TableCell>
              <PriceQualityBadge priceQuality={test.price_quality_ratio} />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {test.shop_name ? (
                <>
                  {test.shop_name} 
                  {test.shop_country_code && (
                    <span className="text-gray-500 ml-1">
                      [{test.shop_country_code}]
                    </span>
                  )}
                </>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell className="w-48">
              <NotesPopover notes={test.notes || "-"} />
            </TableCell>
            <TableCell>
              {test.picture_path ? (
                <div 
                  className="w-10 h-10 relative overflow-hidden rounded-lg cursor-pointer transition-transform hover:scale-105"
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
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
