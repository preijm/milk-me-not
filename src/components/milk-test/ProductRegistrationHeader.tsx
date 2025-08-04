
import React from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ProductRegistrationHeaderProps {
  isEditMode?: boolean;
}

export const ProductRegistrationHeader = ({ isEditMode = false }: ProductRegistrationHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        {isEditMode ? 'Edit Product' : 'Register New Product'}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center" className="max-w-sm">
              <p className="font-normal">Enter product details to add a product to the database. Brand and product name are required, with the product name based on its main ingredients.
              <br /><br />
              If a product package includes flavor, barista type, or specific properties, be sure to add them! This helps make each product unique and easier to find. 😊</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTitle>
    </DialogHeader>
  );
};
