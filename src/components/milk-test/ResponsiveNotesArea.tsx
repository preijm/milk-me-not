
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { PictureCapture } from "./PictureCapture";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveNotesAreaProps {
  notes: string;
  setNotes: (notes: string) => void;
  picture: File | null;
  picturePreview: string | null;
  setPicture: (file: File | null) => void;
  setPicturePreview: (url: string | null) => void;
}

export const ResponsiveNotesArea: React.FC<ResponsiveNotesAreaProps> = ({
  notes,
  setNotes,
  picture,
  picturePreview,
  setPicture,
  setPicturePreview,
}) => {
  const isMobile = useIsMobile();
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

  // Determine if we should show the picture section
  // On mobile: hide when textarea is focused
  // On desktop: always show
  const showPictureSection = !isMobile || !isTextareaFocused;

  return (
    <div className="flex gap-4 items-stretch">
      <Textarea
        placeholder="Tasting notes..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onFocus={() => setIsTextareaFocused(true)}
        onBlur={() => setIsTextareaFocused(false)}
        className={`${
          isMobile && isTextareaFocused ? "w-full" : "flex-1"
        } min-h-[120px] transition-all duration-300`}
      />
      
      {showPictureSection && (
        <div className={`w-[120px] transition-opacity duration-300 ${
          isMobile && isTextareaFocused ? "opacity-0" : "opacity-100"
        }`}>
          <PictureCapture
            picture={picture}
            picturePreview={picturePreview}
            setPicture={setPicture}
            setPicturePreview={setPicturePreview}
          />
        </div>
      )}
    </div>
  );
};
