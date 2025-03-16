
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NotesPopoverProps {
  notes: string;
}

export const NotesPopover = ({ notes }: NotesPopoverProps) => {
  if (!notes || notes === "-") return <span className="text-gray-500">-</span>;

  // For very short notes, just show them directly
  if (notes.length < 20) return <span>{notes}</span>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Popover>
            <PopoverTrigger asChild>
              <div className="max-w-[200px] truncate cursor-pointer hover:text-blue-500 transition-colors">
                {notes}
              </div>
            </PopoverTrigger>
            <PopoverContent className="max-w-md max-h-[300px] overflow-auto p-4">
              <p className="whitespace-pre-wrap break-words">{notes}</p>
            </PopoverContent>
          </Popover>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">Click to read full note</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
