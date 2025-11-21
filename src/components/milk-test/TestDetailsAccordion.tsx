import { MilkTestResult } from "@/types/milk-test";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { getScoreBadgeVariant } from "@/lib/scoreUtils";
import { formatScore } from "@/lib/scoreFormatter";
import { DrinkPreferenceIcon } from "./DrinkPreferenceIcon";
import { PriceQualityBadge } from "./PriceQualityBadge";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon, MapPin, DollarSign, Globe, ChevronDown } from "lucide-react";

interface TestDetailsAccordionProps {
  productTests: MilkTestResult[];
  handleImageClick: (path: string) => void;
}

export const TestDetailsAccordion = ({ productTests, handleImageClick }: TestDetailsAccordionProps) => {
  if (productTests.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-lg mb-1 text-gray-700">No test details available</p>
        <p className="text-sm text-gray-500">Be the first to add a test for this product!</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="w-full">
      {productTests.map((test) => (
        <AccordionItem key={test.id} value={test.id} className="border-b border-gray-200">
          <AccordionTrigger className="hover:no-underline py-3 px-4 [&>svg]:hidden">
            <div className="flex items-center justify-between w-full gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Thumbnail */}
                {test.picture_path ? (
                  <div 
                    className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(test.picture_path!);
                    }}
                  >
                    <img 
                      src={`${supabase.storage.from('milk-pictures').getPublicUrl(test.picture_path).data.publicUrl}`}
                      alt="Product"
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                
                {/* Date and Tester */}
                <div className="text-left flex-1 min-w-0">
                  <div className="text-sm text-gray-500">
                    {new Date(test.created_at).toLocaleDateString()}
                  </div>
                  <div className="font-medium text-gray-900 truncate" translate="no">
                    {test.username || "Anonymous"}
                  </div>
                </div>
              </div>

              {/* Chevron aligned to right (score badge hidden on mobile) */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-4 mt-2">
              {/* Shop */}
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Shop</div>
                  <div className="font-semibold text-gray-900" translate="no">
                    {test.shop_name || "-"}
                  </div>
                </div>
              </div>

              {/* Style */}
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex-shrink-0 text-gray-400">
                  <DrinkPreferenceIcon preference={test.drink_preference} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Style</div>
                  <div className="font-semibold text-gray-900 capitalize">
                    {test.drink_preference?.replace(/_/g, ' ') || "-"}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-start gap-2">
                <DollarSign className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Price</div>
                  <div className="font-semibold text-gray-900 capitalize">
                    {test.price_quality_ratio?.replace(/_/g, ' ') || "-"}
                  </div>
                </div>
              </div>

              {/* Country */}
              <div className="flex items-start gap-2">
                <Globe className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Country</div>
                  <div className="font-semibold text-gray-900">
                    {test.country_code || "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes text (if exists) */}
            {test.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Notes</div>
                <p className="text-sm text-gray-700">{test.notes}</p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
