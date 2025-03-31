
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DrinkPreferenceIcon } from "@/components/milk-test/DrinkPreferenceIcon";
import { PriceQualityBadge } from "@/components/milk-test/PriceQualityBadge";
import { NotesPopover } from "@/components/milk-test/NotesPopover";
import { Image } from "lucide-react";
import { ProductPropertyBadges } from "./ProductPropertyBadges";

interface TestDetailsTableProps {
  productTests: any[];
  handleImageClick: (imagePath: string) => void;
}

export const TestDetailsTable = ({ productTests, handleImageClick }: TestDetailsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Tester</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Shop</TableHead>
          <TableHead>Style</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Image</TableHead>
          <TableHead className="w-48">Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {productTests.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8">
              No results found
            </TableCell>
          </TableRow>
        ) : (
          productTests.map((test) => (
            <TableRow key={test.id}>
              <TableCell>{new Date(test.created_at).toLocaleDateString()}</TableCell>
              <TableCell>{test.username || "-"}</TableCell>
              <TableCell>
                <div className="rounded-full h-8 w-8 flex items-center justify-center bg-cream-300">
                  <span className="font-semibold text-milk-500">
                    {Number(test.rating).toFixed(1)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {test.shop_name || "-"}
                {test.shop_country_code && (
                  <span className="text-gray-500 text-xs ml-1">
                    ({test.shop_country_code})
                  </span>
                )}
              </TableCell>
              <TableCell>
                {test.property_names?.length || test.is_barista ? (
                  <div className="flex flex-wrap items-center gap-1">
                    <DrinkPreferenceIcon preference={test.drink_preference} className="h-5 w-5" />
                    <ProductPropertyBadges
                      propertyNames={test.property_names}
                      isBarista={test.is_barista}
                      flavorNames={test.flavor_names}
                      compact={true}
                    />
                  </div>
                ) : (
                  <DrinkPreferenceIcon preference={test.drink_preference} className="h-5 w-5" />
                )}
              </TableCell>
              <TableCell>
                <PriceQualityBadge priceQuality={test.price_quality_ratio} />
              </TableCell>
              <TableCell>
                {test.picture_path ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleImageClick(test.picture_path)}
                    className="p-0 h-auto"
                  >
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                      <Image className="h-5 w-5 text-gray-500" />
                    </div>
                  </Button>
                ) : (
                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                    <Image className="h-5 w-5 text-gray-300" />
                  </div>
                )}
              </TableCell>
              <TableCell className="max-w-xs w-48">
                <NotesPopover notes={test.notes || "-"} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

