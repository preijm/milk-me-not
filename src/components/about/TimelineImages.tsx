import React from "react";

interface TimelineImageGridProps {
  images: Array<{
    src: string;
    alt: string;
  }>;
  caption?: string;
  onImageClick?: (src: string) => void;
}

export const TimelineImageGrid = ({
  images,
  caption,
  onImageClick,
}: TimelineImageGridProps) => {
  return (
    <div className="flex-shrink-0 w-full sm:w-64 space-y-2">
      <div className="grid grid-cols-2 gap-2 mb-2">
        {images.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={image.alt}
            className="rounded-lg w-full border border-border/50 shadow-sm cursor-pointer hover:shadow-lg transition-shadow object-cover aspect-[3/4]"
            onClick={() => onImageClick?.(image.src)}
          />
        ))}
      </div>
      {caption && (
        <p className="text-sm text-muted-foreground text-center italic">
          {caption}
        </p>
      )}
    </div>
  );
};

interface TimelineSingleImageProps {
  src: string;
  alt: string;
  caption?: string;
  onImageClick?: (src: string) => void;
}

export const TimelineSingleImage = ({
  src,
  alt,
  caption,
  onImageClick,
}: TimelineSingleImageProps) => {
  return (
    <div className="space-y-2">
      <img
        src={src}
        alt={alt}
        className="rounded-lg w-full border border-border/50 shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onImageClick?.(src)}
      />
      {caption && (
        <p className="text-sm text-muted-foreground text-center italic">
          {caption}
        </p>
      )}
    </div>
  );
};
