
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText } from "lucide-react";

interface NotesPopoverProps {
  notes: string;
}

export const NotesPopover = ({ notes }: NotesPopoverProps) => {
  if (!notes || notes === "-") return <span className="text-gray-500">-</span>;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center text-black hover:text-gray-700 transition-colors">
          <FileText className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[300px] overflow-auto p-4">
        <p className="whitespace-pre-wrap break-words">{notes}</p>
      </PopoverContent>
    </Popover>
  );
};
