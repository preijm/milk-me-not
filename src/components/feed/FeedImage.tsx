import { useState } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface FeedImageProps {
  picturePath?: string;
  brandName: string;
  productName: string;
  blurred?: boolean;
}

export const FeedImage = ({ picturePath, brandName, productName, blurred }: FeedImageProps) => {
  const [showEnlarged, setShowEnlarged] = useState(false);

  if (!picturePath) {
    return (
      <div className="rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 h-64 sm:h-80 flex items-center justify-center border-2 border-dashed border-primary/20">
        <div className="text-center">
          <div className="text-4xl mb-2">🥛</div>
          <p className="text-sm font-medium text-muted-foreground">No photo available</p>
        </div>
      </div>
    );
  }

  const imageUrl = `https://jtabjndnietpewvknjrm.supabase.co/storage/v1/object/public/milk-pictures/${encodeURIComponent(picturePath)}`;

  return (
    <>
      <div className="rounded-lg overflow-hidden shadow-sm cursor-pointer" onClick={() => setShowEnlarged(true)}>
        <img 
          src={imageUrl}
          alt={`${brandName} ${productName}`}
          loading="eager"
          decoding="sync"
          className={cn(
            "w-full h-64 sm:h-80 object-cover transition-transform duration-300 hover:scale-105",
            blurred && "blur-md"
          )}
          onError={(e) => {
            console.error('Failed to load image:', picturePath);
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
          }}
          onLoad={() => {
            console.log('Successfully loaded image:', picturePath);
          }}
        />
      </div>

      <Dialog open={showEnlarged} onOpenChange={setShowEnlarged}>
        <DialogContent className="max-w-7xl w-full p-0 overflow-hidden bg-black/95 [&>button]:hidden">
          <div className="relative">
            <button
              onClick={() => setShowEnlarged(false)}
              className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
            >
              <X className="h-5 w-5 text-black" />
            </button>
            <img 
              src={imageUrl}
              alt={`${brandName} ${productName}`}
              loading="eager"
              decoding="sync"
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

