import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Photo = { src: string; alt: string };

/**
 * The carton rail, with a way to move it that does not require a trackpad.
 *
 * `.story-rail` has always been `overflow-x: auto`, so this scrolled — by
 * swipe, by trackpad, by shift-wheel. What it had was 1536px of hidden
 * photographs, a hidden scrollbar, no arrows, and a lede that said "Scroll."
 * A plain mouse has no gesture for horizontal scroll, so for anyone on one the
 * instruction was simply wrong: eleven photos, two and a half of them
 * reachable.
 *
 * Arrows rather than an auto-running marquee. The pictures are click-to-zoom,
 * and a target that drifts out from under the cursor is worse than one that
 * sits still; a marquee also needs a reduced-motion escape hatch, and the
 * honest version of that escape hatch is this.
 *
 * They hide at each end, so the control never lies about where the rail can
 * go — which is also how the reader learns the rail has ends at all.
 */
export const PhotoRail = ({
  photos,
  onZoom,
  className,
}: {
  photos: Photo[];
  onZoom: (src: string) => void;
  className?: string;
}) => {
  const rail = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [scrollable, setScrollable] = useState(false);

  /** The scrollLeft values the rail actually comes to rest at. */
  const stopsOf = (el: HTMLUListElement) =>
    ([...el.children] as HTMLElement[]).map((i) => i.offsetLeft - el.offsetLeft);

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    // A pixel of slack: scrollWidth and clientWidth disagree by fractions at
    // some zoom levels, which would leave an arrow showing at a dead end.
    const max = el.scrollWidth - el.clientWidth;
    const stops = stopsOf(el);
    // The rail rests at 40, not 0: with `scroll-padding: auto` the first snap
    // point is the first photo's own offset, which includes the rail's 40px
    // padding. Comparing against 0 meant `atStart` was never true, so the left
    // arrow and its fade never went away — an arrow pointing at nothing.
    const home = stops.length ? stops[0] : 0;
    setScrollable(max > 1);
    setAtStart(el.scrollLeft <= home + 1);
    setAtEnd(el.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  /**
   * Scroll to a snap point, never to a pixel offset.
   *
   * The rail is `scroll-snap-type: x`, so a scrollBy of "80% of the width"
   * lands wherever the snap decides, which is not where the arrow promised.
   * Aiming at a photo's own edge means the snap agrees with the scroll instead
   * of correcting it, and the arrows land cleanly on a picture rather than
   * mid-way across one.
   *
   * Those edges are the raw offsetLeft values — measured at 40, 264, 488, 712,
   * not offsets relative to the first photo. The relative version looks right
   * and leaves every press landing back at 40, because with `scroll-padding:
   * auto` the first snap point is the rail's own 40px padding and scrollLeft 0
   * is not a position this rail can hold.
   */
  const page = (direction: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const stops = stopsOf(el);
    if (stops.length === 0) return;
    const from = el.scrollLeft;
    // A touch under a full width, so the photo at the edge stays half in view
    // and the eye keeps its place.
    const budget = el.clientWidth * 0.8;
    const ahead = stops.filter((s) => (direction > 0 ? s > from + 1 : s < from - 1));
    if (ahead.length === 0) return;
    const withinBudget = ahead.filter((s) => Math.abs(s - from) <= budget);
    const target = withinBudget.length
      ? direction > 0
        ? Math.max(...withinBudget)
        : Math.min(...withinBudget)
      : direction > 0
        ? Math.min(...ahead)
        : Math.max(...ahead);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: target, behavior: still ? "auto" : "smooth" });

    // Re-measure after the scroll has had time to land, rather than waiting
    // for the `scroll` event alone. Not every engine emits one for a
    // programmatic scroll — this rail's scrollLeft was observed going 40 to
    // 936 to 1212 without firing a single one — and an arrow that does not
    // notice it has reached the end goes on pointing at a wall.
    window.setTimeout(measure, still ? 0 : 420);
  };

  const arrow = "h-11 w-11 items-center justify-center rounded-full bg-white/95 text-story-ink story-lift transition-opacity";

  return (
    <div className={cn("relative", className)}>
      <ul ref={rail} className="story-rail flex gap-4 px-5 pb-2 sm:px-8 lg:px-10">
        {photos.map((photo) => (
          <li key={photo.src} className="shrink-0">
            <button
              type="button"
              onClick={() => onZoom(photo.src)}
              className="story-lift block w-40 overflow-hidden rounded-2xl bg-white p-2 transition-transform duration-200 hover:-translate-y-1 sm:w-52"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="aspect-3/4 w-full rounded-xl object-cover"
              />
            </button>
          </li>
        ))}
      </ul>

      {/* The fade says the rail keeps going; the arrow is what does something
          about it. Both are hidden once there is nothing left that way. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-story-cream to-transparent transition-opacity sm:w-24",
          atStart && "opacity-0",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-story-cream to-transparent transition-opacity sm:w-24",
          atEnd && "opacity-0",
        )}
      />

      {scrollable && (
        <>
          <button
            type="button"
            onClick={() => page(-1)}
            aria-label="Previous cartons"
            className={cn(arrow, "absolute left-3 top-1/2 hidden -translate-y-1/2 sm:flex lg:left-5", atStart && "pointer-events-none opacity-0")}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
              <path d="M19 12H6m5.5 6.5L5 12l6.5-6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            aria-label="More cartons"
            className={cn(arrow, "absolute right-3 top-1/2 hidden -translate-y-1/2 sm:flex lg:right-5", atEnd && "pointer-events-none opacity-0")}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
              <path d="M5 12h13m-5.5-6.5L19 12l-6.5 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default PhotoRail;
