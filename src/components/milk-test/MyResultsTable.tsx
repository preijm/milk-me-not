
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { MilkTestResult } from "@/types/milk-test";
import { PriceQualityBadge } from "@/components/milk-test/PriceQualityBadge";
import { SortableColumnHeader } from "@/components/milk-test/SortableColumnHeader";
import { ProductPropertyBadges } from "@/components/milk-test/ProductPropertyBadges";
import { SortConfig } from "@/hooks/useUserMilkTests";
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
}

export const MyResultsTable = ({ 
  results, 
  sortConfig, 
  handleSort, 
  onEdit, 
  onDelete 
}: MyResultsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-left pl-4">
            <SortableColumnHeader
              column="created_at"
              label="Date"
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </TableHead>
          <TableHead className="text-left pl-4">
            <SortableColumnHeader
              column="brand_name"
              label="Brand"
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </TableHead>
          <TableHead className="text-left pl-4">
            <SortableColumnHeader
              column="product_name"
              label="Product"
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </TableHead>
          <TableHead className="text-left pl-4">
            <SortableColumnHeader
              column="rating"
              label="Score"
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </TableHead>
          <TableHead className="text-left pl-4">
            <SortableColumnHeader
              column="shop_name"
              label="Shop"
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </TableHead>
          <TableHead className="text-left pl-4">
            <SortableColumnHeader
              column="price_quality_ratio"
              label="Price"
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </TableHead>
          <TableHead className="text-left pl-4">
            <SortableColumnHeader
              column="notes"
              label="Notes"
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </TableHead>
          <TableHead className="text-left pl-4">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8">
              No results found
            </TableCell>
          </TableRow>
        ) : (
          results.map((result) => (
            <TableRow key={result.id}>
              <TableCell>{new Date(result.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="font-medium">{result.brand_name}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className="font-medium">{result.product_name}</span>
                  {(result.is_barista || (result.property_names && result.property_names.length > 0) || (result.flavor_names && result.flavor_names.length > 0)) && (
                    <div className="inline-flex">
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
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="rounded-full h-8 w-8 flex items-center justify-center bg-cream-300">
                  <span className="font-semibold text-milk-500">{Number(result.rating).toFixed(1)}</span>
                </div>
              </TableCell>
              <TableCell>
                {result.shop_name}
                {result.shop_country_code && (
                  <span className="text-gray-500 text-xs ml-1">
                    ({result.shop_country_code})
                  </span>
                )}
              </TableCell>
              <TableCell>
                <PriceQualityBadge priceQuality={result.price_quality_ratio} />
              </TableCell>
              <TableCell className="max-w-xs truncate">{result.notes}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-white hover:bg-gray-100"
                    onClick={() => onEdit(result)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-white hover:bg-gray-100"
                    onClick={() => onDelete(result.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
