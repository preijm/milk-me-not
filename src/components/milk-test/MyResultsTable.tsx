
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { MilkTestResult } from "@/types/milk-test";
import { PriceQualityBadge } from "@/components/milk-test/PriceQualityBadge";
import { SortableColumnHeader } from "@/components/milk-test/SortableColumnHeader";
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
  sortConfig: {
    column: string;
    direction: 'asc' | 'desc';
  };
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
          <TableHead>
            <SortableColumnHeader
              column="created_at"
              label="Date"
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </TableHead>
          <TableHead>
            <SortableColumnHeader
              column="brand_name"
              label="Brand"
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </TableHead>
          <TableHead>
            <SortableColumnHeader
              column="rating"
              label="Score"
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </TableHead>
          <TableHead>Price</TableHead>
          <TableHead>
            <SortableColumnHeader
              column="product_name"
              label="Style"
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </TableHead>
          <TableHead>Shop</TableHead>
          <TableHead className="w-48">Notes</TableHead>
          <TableHead>Actions</TableHead>
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
                <div className="rounded-full h-8 w-8 flex items-center justify-center bg-cream-300">
                  <span className="font-semibold text-milk-500">{Number(result.rating).toFixed(1)}</span>
                </div>
              </TableCell>
              <TableCell>
                <PriceQualityBadge priceQuality={result.price_quality_ratio} />
              </TableCell>
              <TableCell>{result.product_name}</TableCell>
              <TableCell>
                {result.shop_name}
                {result.shop_country_code && (
                  <span className="text-gray-500 text-xs ml-1">
                    ({result.shop_country_code})
                  </span>
                )}
              </TableCell>
              <TableCell className="max-w-xs w-48 truncate">{result.notes}</TableCell>
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
