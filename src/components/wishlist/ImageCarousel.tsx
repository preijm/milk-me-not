import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCarouselProps {
  images: string[];
  brandName: string;
  productName: string;
}

export const ImageCarousel = ({ images, brandName, productName }: ImageCarouselProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🥛</div>
          <p className="text-sm text-muted-foreground">No photo</p>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (images.length === 1) {
    return (
      <div className="aspect-square rounded-lg overflow-hidden">
        <img
          src={`https://jtabjndnietpewvknjrm.supabase.co/storage/v1/object/public/milk-pictures/${encodeURIComponent(images[0])}`}
          alt={`${brandName} ${productName}`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-square rounded-lg overflow-hidden group">
      <img
        src={`https://jtabjndnietpewvknjrm.supabase.co/storage/v1/object/public/milk-pictures/${encodeURIComponent(images[currentImageIndex])}`}
        alt={`${brandName} ${productName} - Image ${currentImageIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      />
      
      {/* Navigation Arrows - only show on hover for cleaner look */}
      <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          variant="secondary"
          size="icon"
          onClick={goToPrevious}
          className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={goToNext}
          className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentImageIndex
                ? "bg-white shadow-lg"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Image Counter */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
        {currentImageIndex + 1} / {images.length}
      </div>
    </div>
  );
};