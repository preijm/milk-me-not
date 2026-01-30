import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface CommunityCarouselImage {
  src: string;
  alt: string;
}

interface CommunityCarouselProps {
  images: CommunityCarouselImage[];
  caption?: string;
}

export const CommunityCarousel = ({
  images,
  caption,
}: CommunityCarouselProps) => {
  return (
    <>
      <Carousel
        opts={{ align: "start", loop: true }}
        plugins={[Autoplay({ delay: 3000 })]}
        className="w-full"
      >
        <CarouselContent className="-ml-2 sm:-ml-4">
          {images.map((image, index) => (
            <CarouselItem
              key={index}
              className="pl-2 sm:pl-4 basis-1/2 sm:basis-1/3"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="rounded-lg w-full h-40 sm:h-48 object-cover border border-border/50 shadow-sm hover:shadow-lg hover:scale-105 transition-all"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4" />
        <CarouselNext className="-right-4" />
      </Carousel>
      {caption && (
        <p className="text-sm text-muted-foreground text-center italic mt-3">
          {caption}
        </p>
      )}
    </>
  );
};
