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
  /** Rounding, mostly — the desktop card clips the photo with its own container. */
  className?: string;
}

export const FeedImage = ({
  picturePath,
  brandName,
  productName,
  compact = false,
  portrait = false,
  className,
}: FeedImageProps) => {
  const [showEnlarged, setShowEnlarged] = useState(false);

  if (!picturePath) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-xl bg-story-cream-2",
          portrait ? "aspect-[3/4] h-auto w-full" : compact ? "h-20" : "h-56 sm:h-64",
          className,
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
      <button
        type="button"
        onClick={() => setShowEnlarged(true)}
        className={cn("block w-full overflow-hidden rounded-xl", className)}
      >
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

      {/* The enlarged photo, and nothing else.
          `w-full max-w-7xl` on a black panel meant the dialog claimed 1280px
          whatever the picture was, and every photo on this feed is portrait —
          eight of eight measured, mostly 3000x4000 straight off a phone. So an
          800px-wide box of black was painted either side of the carton, and
          `object-contain` politely centred the picture inside it. The box is
          the picture now: `w-auto` with the image's own max sizes, no ground,
          no border, no shadow. The overlay behind it already dims the page,
          which is what the black was there to do. */}
      <Dialog open={showEnlarged} onOpenChange={setShowEnlarged}>
        <DialogContent className="w-auto max-w-[96vw] border-0 bg-transparent p-0 shadow-none [&>button]:hidden">
          <div className="relative">
            <button
              onClick={() => setShowEnlarged(false)}
              className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all hover:scale-110 hover:bg-white"
              aria-label="Close the photo"
            >
              <X className="h-5 w-5 text-story-ink" />
            </button>
            <img
              src={imageUrl}
              alt={`${brandName} ${productName}`}
              loading="eager"
              decoding="sync"
              className="block max-h-[88vh] w-auto max-w-[96vw] rounded-2xl object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
