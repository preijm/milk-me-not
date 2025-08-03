
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
import { Badge } from "@/components/ui/badge";
import { getScoreBadgeVariant } from "@/lib/scoreUtils";
import { formatScore } from "@/lib/scoreFormatter";

interface TestDetailsTableProps {
  productTests: MilkTestResult[];
  handleImageClick: (path: string) => void;
  sortConfig: {
    column: string;
    direction: 'asc' | 'desc';
  };
  handleSort: (column: string) => void;
}

export const TestDetailsTable = ({ 
  productTests, 
  handleImageClick,
  sortConfig,
  handleSort
}: TestDetailsTableProps) => {
  const getCountryFlag = (code: string) => {
    if (!code) return '';
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

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
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[12%]">
              <SortableColumnHeader
                column="created_at"
                label="Date"
                sortConfig={sortConfig}
                onSort={handleSort}
                width="100%"
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[12%]">
              <SortableColumnHeader
                column="username"
                label="Tester"
                sortConfig={sortConfig}
                onSort={handleSort}
                width="100%"
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[8%]">
              <SortableColumnHeader
                column="rating"
                label="Score"
                sortConfig={sortConfig}
                onSort={handleSort}
                width="100%"
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[8%]">
              <SortableColumnHeader
                column="drink_preference"
                label="Style"
                sortConfig={sortConfig}
                onSort={handleSort}
                width="100%"
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[8%]">
              <SortableColumnHeader
                column="price_quality_ratio"
                label="Price"
                sortConfig={sortConfig}
                onSort={handleSort}
                width="100%"
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[15%]">
              <SortableColumnHeader
                column="shop_name"
                label="Shop"
                sortConfig={sortConfig}
                onSort={handleSort}
                width="100%"
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[8%]">
              <SortableColumnHeader
                column="country_code"
                label="Country"
                sortConfig={sortConfig}
                onSort={handleSort}
                width="100%"
              />
            </TableHead>
            <TableHead className="w-[8%] font-semibold text-gray-700 text-left pl-4">
              <SortableColumnHeader
                column="notes"
                label="Note"
                sortConfig={sortConfig}
                onSort={handleSort}
                width="100%"
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[8%]">
              <SortableColumnHeader
                column="picture_path"
                label="Image"
                sortConfig={sortConfig}
                onSort={handleSort}
                width="100%"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productTests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-lg mb-1">No test details available</p>
                  <p className="text-sm">Be the first to add a test for this product!</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            productTests.map((test, index) => (
              <TableRow 
                key={test.id} 
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <TableCell className="text-sm">{new Date(test.created_at).toLocaleDateString()}</TableCell>
                <TableCell translate="no">{test.username || "Anonymous"}</TableCell>
                <TableCell>
                  <Badge variant={getScoreBadgeVariant(Number(test.rating))}>
                    {formatScore(Number(test.rating))}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <DrinkPreferenceIcon preference={test.drink_preference} />
                  </div>
                </TableCell>
                <TableCell>
                  <PriceQualityBadge priceQuality={test.price_quality_ratio} />
                </TableCell>
                <TableCell>
                  <span translate="no">{test.shop_name || "-"}</span>
                </TableCell>
                <TableCell>
                  {test.country_code ? (
                    <span className="text-sm font-medium">{test.country_code}</span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-left">
                  <NotesPopover notes={test.notes || "-"} />
                </TableCell>
                <TableCell>
                  {test.picture_path ? (
                    <div 
                      className="w-10 h-10 relative overflow-hidden rounded-lg cursor-pointer transition-transform hover:scale-105 border border-gray-200"
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
