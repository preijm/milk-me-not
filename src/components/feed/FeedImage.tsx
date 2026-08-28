import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { MilkDrop } from "@/components/story";
import { cn } from "@/lib/utils";
import { thumbnailPath } from "@/lib/imageCompression";

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

const publicUrl = (path: string) =>
  `https://jtabjndnietpewvknjrm.supabase.co/storage/v1/object/public/milk-pictures/${encodeURIComponent(path)}`;

export const FeedImage = ({
  picturePath,
  brandName,
  productName,
  compact = false,
  portrait = false,
  className,
}: FeedImageProps) => {
  const [showEnlarged, setShowEnlarged] = useState(false);

  const imageUrl = picturePath ? publicUrl(picturePath) : null;
  const thumbUrl = picturePath ? publicUrl(thumbnailPath(picturePath)) : null;

  /* The card shows the thumbnail; the dialog shows the photo.
     A thumbnail is ~70KB against ~3MB, and the card it fills is 104px wide on
     a phone, so this is the whole reason the feed stopped being slow. Photos
     posted before thumbnails existed have none until the backfill script has
     run over them, and a bucket 404s rather than redirects — hence the
     fallback below, which is simply what every card used to do.

     Above the `picturePath` guard because a card can gain or lose its photo,
     and hooks after an early return would change in number when it does. */
  const [cardSrc, setCardSrc] = useState(thumbUrl);
  const [srcFor, setSrcFor] = useState(picturePath);
  if (srcFor !== picturePath) {
    setSrcFor(picturePath);
    setCardSrc(thumbUrl);
  }

  /* The dialog stacks the photo on top of the thumbnail and fades it in.
     Two layers rather than one element changing `src`, because a `src` swap
     replaces the content in a single frame — there is nothing to transition,
     so however long you make the animation the change itself is still a cut.

     There is deliberately no blur any more. The first version blurred the
     thumbnail to say "still loading", which read as broken: at 800px the
     thumbnail is *already* sharper than the box it is shown in — ~360px wide
     on a phone, and roughly 1:1 against `max-h-[88vh]` on a laptop — so the
     blur was inventing a defect and then taking a second to remove it. With
     the fade alone most readers see a photo that is simply there, and on a
     large display it quietly sharpens. */
  const [fullLoaded, setFullLoaded] = useState(false);

  /* Loaded through a bare `new Image()` rather than the visible element's
     `onLoad`, because this one cannot miss. The handler is attached before
     `src` is set, so a photo already in cache still reports itself; React
     attaches `onLoad` during commit, which is after the browser may have
     finished a cache hit, and a missed `load` leaves the photo stuck at
     opacity 0 forever. Reopening a photo is exactly that case, and it is the
     common one — measured at under 60ms to full opacity on a second open.

     By the time the state flips, the visible layer draws the same URL out of
     cache, so the fade is over content that is already there. */
  useEffect(() => {
    if (!showEnlarged || !imageUrl) return;

    const full = new Image();
    full.onload = () => setFullLoaded(true);
    full.src = imageUrl;

    return () => {
      full.onload = null;
    };
  }, [showEnlarged, imageUrl]);

  const openEnlarged = () => {
    setFullLoaded(false);
    setShowEnlarged(true);
  };

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

  return (
    <>
      <button
        type="button"
        onClick={openEnlarged}
        className={cn("block w-full overflow-hidden rounded-xl", className)}
      >
        <img
          src={cardSrc ?? undefined}
          alt={`${brandName} ${productName}`}
          /* Nothing below the fold is worth fetching before it is scrolled to,
             and `sync` decoding blocked the main thread once per card. The
             containers below reserve the photo's box by aspect ratio or fixed
             height, so deferring the fetch shifts no layout. */
          loading="lazy"
          decoding="async"
          className={cn(
            "w-full object-cover transition-transform duration-300 hover:scale-105",
            portrait ? "aspect-[3/4] h-auto" : compact ? "h-20" : "h-56 sm:h-64",
          )}
          onError={(e) => {
            if (cardSrc !== imageUrl) {
              setCardSrc(imageUrl);
              return;
            }
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
            {/* The thumbnail sizes the dialog and is what the reader actually
                sees first; it is already decoded, because the card behind is
                showing it. The photo lays over it at the same size and fades
                up once it has arrived. */}
            <div className="relative">
              <img
                src={thumbUrl ?? undefined}
                alt=""
                aria-hidden
                className="block max-h-[88vh] w-auto max-w-[96vw] rounded-2xl object-contain"
              />
              <img
                src={imageUrl ?? undefined}
                alt={`${brandName} ${productName}`}
                loading="eager"
                decoding="async"
                className={cn(
                  "absolute inset-0 h-full w-full rounded-2xl object-contain",
                  "transition-opacity duration-500 ease-out motion-reduce:transition-none",
                  fullLoaded ? "opacity-100" : "opacity-0",
                )}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
