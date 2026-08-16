/**
 * Band grounds — the colour a section sits on.
 *
 * Kept apart from the components so a divider can be tinted to match the band
 * it is crashing into without importing the whole primitives module.
 */

export type BandGround =
  | "cream"
  | "cream-2"
  | "paper"
  | "wash"
  | "green"
  | "forest"
  | "sky"
  | "blue"
  | "amber";

/** Background + default text colour for a band. */
export const GROUND_CLASS: Record<BandGround, string> = {
  cream: "bg-story-cream text-story-ink",
  "cream-2": "bg-story-cream-2 text-story-ink",
  paper: "bg-story-paper text-story-ink",
  wash: "bg-story-green-wash text-story-ink",
  green: "bg-story-green text-white",
  forest: "bg-story-green-deep text-story-cream",
  sky: "bg-story-blue-wash text-story-ink",
  blue: "bg-story-blue-deep text-story-cream",
  amber: "bg-story-amber-light text-story-ink",
};

/**
 * The same grounds as a *text* colour, for `currentColor`-filled dividers.
 * Set this on the divider wrapper to paint it in the neighbouring band's ground.
 */
export const GROUND_FILL: Record<BandGround, string> = {
  cream: "text-story-cream",
  "cream-2": "text-story-cream-2",
  paper: "text-story-paper",
  wash: "text-story-green-wash",
  green: "text-story-green",
  forest: "text-story-green-deep",
  sky: "text-story-blue-wash",
  blue: "text-story-blue-deep",
  amber: "text-story-amber-light",
};
