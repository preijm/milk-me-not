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
  /**
   * Keep the photo's own shape instead of cropping it to a letterbox.
   *
   * Every photo on the feed is portrait — measured across the loaded window,
   * eight of eight, mostly 3000×4000 straight off a phone. A landscape crop
   * threw away most of each one, which is a strange thing to do to the only
   * picture of the carton anybody took.
   */
  portrait?: boolean;
}

export const FeedImage = ({ picturePath, brandName, productName, compact = false, portrait = false }: FeedImageProps) => {
  const [showEnlarged, setShowEnlarged] = useState(false);

  if (!picturePath) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-xl bg-story-cream-2",
          portrait ? "aspect-[3/4] h-auto w-full" : compact ? "h-20" : "h-56 sm:h-64",
        )}
      >
        <span className="text-story-ink/8" aria-hidden>
          <MilkDrop size={compact ? 60 : 150} variant="solid" />
        </span>
        {!compact && (
          <p className="absolute bottom-3 text-[0.6875rem] font-bold uppercase tracking-widest text-story-muted-2">
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
            portrait ? "aspect-[3/4] h-auto" : compact ? "h-20" : "h-56 sm:h-64",
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
