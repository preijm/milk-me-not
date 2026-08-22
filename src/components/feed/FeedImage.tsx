import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { MilkDrop } from "@/components/story";
import { cn } from "@/lib/utils";

interface FeedImageProps {
  picturePath?: string | null;
  brandName: string;
  productName: string;
  /** The mobile card's photo is a supporting detail, not the hero — shorter and quieter. */
  compact?: boolean;
}

export const FeedImage = ({ picturePath, brandName, productName, compact = false }: FeedImageProps) => {
  const [showEnlarged, setShowEnlarged] = useState(false);

  if (!picturePath) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-xl bg-story-cream-2",
          compact ? "h-20" : "h-56 sm:h-64",
        )}
      >
        <span className="text-story-ink/[0.08]" aria-hidden>
          <MilkDrop size={compact ? 60 : 150} variant="solid" />
        </span>
        {!compact && (
          <p className="absolute bottom-3 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-story-muted-2">
            No photo this time
          </p>
        )}
      </div>
    );
  }

  const imageUrl = `https://jtabjndnietpewvknjrm.supabase.co/storage/v1/object/public/milk-pictures/${encodeURIComponent(picturePath)}`;

  return (
    <>
      <button type="button" onClick={() => setShowEnlarged(true)} className="block w-full overflow-hidden rounded-xl">
        <img
          src={imageUrl}
          alt={`${brandName} ${productName}`}
          loading="eager"
          decoding="sync"
          className={cn(
            "w-full object-cover transition-transform duration-300 hover:scale-105",
            compact ? "h-20" : "h-56 sm:h-64",
          )}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = "none";
          }}
        />
      </button>

      <Dialog open={showEnlarged} onOpenChange={setShowEnlarged}>
        <DialogContent className="w-full max-w-7xl overflow-hidden bg-black/95 p-0 [&>button]:hidden">
          <div className="relative">
            <button
              onClick={() => setShowEnlarged(false)}
              className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all hover:scale-110 hover:bg-white"
            >
              <X className="h-5 w-5 text-black" />
            </button>
            <img
              src={imageUrl}
              alt={`${brandName} ${productName}`}
              loading="eager"
              decoding="sync"
              className="max-h-[90vh] w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
