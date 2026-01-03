
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon, Edit3, Trash2, MoreHorizontal } from "lucide-react";
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
import { TestDetailsAccordion } from "./TestDetailsAccordion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

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
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Detect if device is tablet or mobile (< 1024px)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsTabletOrMobile(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleEdit = (test: MilkTestResult) => {
    navigate('/add', { state: { editTest: test } });
  };

  const handleDelete = async () => {
    if (!deleteTestId) return;
    
    try {
      const { error } = await supabase
        .from('milk_tests')
        .delete()
        .eq('id', deleteTestId);
      
      if (error) throw error;
      
      toast({
        title: "Test deleted",
        description: "Your test has been deleted successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['product-tests'] });
      queryClient.invalidateQueries({ queryKey: ['product-details'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteTestId(null);
    }
  };

  // Use accordion on mobile/tablet (below 1024px)
  if (isTabletOrMobile) {
    return <TestDetailsAccordion productTests={productTests} handleImageClick={handleImageClick} />;
  }

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
            {user && (
              <TableHead className="font-semibold text-gray-700 text-center w-[5%]">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {productTests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={user ? 10 : 9} className="text-center py-8 text-gray-500">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-lg mb-1">No test details available</p>
                  <p className="text-sm">Be the first to add a test for this product!</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            productTests.map((test, index) => {
              const isOwnTest = user?.id === test.user_id;
              return (
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
                  {user && (
                    <TableCell className="text-center">
                      {isOwnTest ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(test)}>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteTestId(test.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteTestId} onOpenChange={(open) => !open && setDeleteTestId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this test? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
