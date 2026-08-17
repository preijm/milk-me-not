/**
 * Story motifs — the illustrated vocabulary of the public site.
 *
 * The brand has no photography, so the milk drop from the logo does the work
 * photography would otherwise do: it is the hero shape, the section watermark,
 * the bullet, and the product mark. Everything here is drawn in
 * `currentColor` with layered opacity so a single motif can sit on cream, on
 * brand green, or on a deep forest band without a second asset.
 */

type MotifProps = {
  className?: string;
  /** Rendered size in px; motifs keep their own aspect ratio. */
  size?: number;
  title?: string;
};

const hidden = { "aria-hidden": true } as const;

/**
 * The signature shape.
 *
 * `variant` decides how much of the page it is allowed to carry. `wash` is the
 * faint layered version for backgrounds; `solid` is a flat, fully opaque shape
 * meant to be used large and cropped, as the foreground object a product
 * photograph would otherwise be. Reach for `solid` by default — a motif at 10%
 * opacity adds nothing to a page that has to hold its own against photography.
 */
export const MilkDrop = ({
  className = "",
  size = 160,
  title,
  variant = "wash",
}: MotifProps & { variant?: "wash" | "solid" }) => (
  <svg
    viewBox="0 0 158 218"
    width={size}
    height={(size * 218) / 158}
    fill="none"
    className={className}
    role={title ? "img" : undefined}
    {...(title ? {} : hidden)}
  >
    {title ? <title>{title}</title> : null}
    {variant === "solid" ? (
      <>
        <path
          d="M79 8C114 58 130 100 130 138c0 37-23 58-51 62-28-4-51-25-51-62C28 100 44 58 79 8Z"
          fill="currentColor"
        />
        <ellipse cx="60" cy="118" rx="11" ry="24" fill="#fff" opacity="0.32" transform="rotate(-14 60 118)" />
        <ellipse cx="66" cy="86" rx="4.5" ry="8" fill="#fff" opacity="0.22" transform="rotate(-14 66 86)" />
        <circle cx="138" cy="168" r="11" fill="currentColor" />
        <circle cx="152" cy="148" r="6" fill="currentColor" />
        <circle cx="16" cy="176" r="8" fill="currentColor" />
      </>
    ) : (
      <>
        <path
          d="M79 8C114 58 130 100 130 138c0 37-23 58-51 62-28-4-51-25-51-62C28 100 44 58 79 8Z"
          fill="currentColor"
          opacity="0.1"
        />
        <path
          d="M79 22c31 44 45 82 45 114 0 34-21 53-45 57-24-4-45-23-45-57 0-32 14-70 45-114Z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M79 40c27 36 39 68 39 94 0 31-19 48-39 52-20-4-39-21-39-52 0-26 12-58 39-94Z"
          fill="currentColor"
          opacity="0.42"
        />
        <ellipse cx="64" cy="102" rx="7" ry="15" fill="#fff" opacity="0.5" transform="rotate(-14 64 102)" />
        <ellipse cx="68" cy="80" rx="3" ry="5.5" fill="#fff" opacity="0.32" transform="rotate(-14 68 80)" />
        <circle cx="136" cy="162" r="9" fill="currentColor" opacity="0.18" />
        <circle cx="148" cy="146" r="5.5" fill="currentColor" opacity="0.3" />
        <circle cx="20" cy="168" r="7" fill="currentColor" opacity="0.14" />
        <circle cx="139" cy="179" r="3.5" fill="currentColor" opacity="0.26" />
      </>
    )}
  </svg>
);

/** A flat drop glyph for bullets, list markers and inline marks. */
export const DropGlyph = ({ className = "", size = 16 }: MotifProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className} {...hidden}>
    <path
      d="M12 2.5c5.2 7.3 7.6 12.3 7.6 15.1 0 3.6-3.4 6.4-7.6 6.4s-7.6-2.8-7.6-6.4C4.4 14.8 6.8 9.8 12 2.5Z"
      fill="currentColor"
    />
  </svg>
);

/** A pour: milk falling from a lip into a crown splash. Used as a section hero. */
export const Pour = ({ className = "", size = 240 }: MotifProps) => (
  <svg viewBox="0 0 220 260" width={size} height={(size * 260) / 220} fill="none" className={className} {...hidden}>
    <path d="M40 26h96l-10 30a30 30 0 0 1-28 20H78a30 30 0 0 1-28-20L40 26Z" fill="currentColor" opacity="0.18" />
    <path d="M104 74c-6 34-4 62 4 92" stroke="currentColor" strokeWidth="17" strokeLinecap="round" opacity="0.5" />
    <path d="M104 74c-6 34-4 62 4 92" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.35" />
    <path
      d="M40 196c14-16 32-26 68-26s54 10 68 26c-10 24-36 38-68 38s-58-14-68-38Z"
      fill="currentColor"
      opacity="0.35"
    />
    <path d="M56 190c6-10 14 4 22-6 7-9 12 6 20-3 8-9 13 6 21-2 9-9 14 7 23-1" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.55" />
    <circle cx="46" cy="150" r="7" fill="currentColor" opacity="0.3" />
    <circle cx="172" cy="136" r="5" fill="currentColor" opacity="0.24" />
    <circle cx="164" cy="164" r="9" fill="currentColor" opacity="0.18" />
  </svg>
);

/** Botanical sprig, carried over from the prototype's watermark. */
export const Sprig = ({ className = "", size = 180 }: MotifProps) => (
  <svg viewBox="0 0 100 140" width={size} height={(size * 140) / 100} fill="none" className={className} {...hidden}>
    <path d="M50 132V10" stroke="currentColor" strokeWidth="1.6" />
    {[26, 50, 74, 98].map((y) =>
      [-1, 1].map((side) => (
        <ellipse
          key={`${y}-${side}`}
          cx={50 + side * 12}
          cy={y}
          rx="9.5"
          ry="3.4"
          transform={`rotate(${side * 22} ${50 + side * 12} ${y})`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      )),
    )}
    <ellipse cx="50" cy="8" rx="3.2" ry="6.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

/** Carton silhouette — stands in for the product shot in cards and rails. */
export const Carton = ({ className = "", size = 72 }: MotifProps) => (
  <svg viewBox="0 0 64 96" width={size} height={(size * 96) / 64} fill="none" className={className} {...hidden}>
    <path d="M12 22 32 6l20 16v62a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V22Z" fill="currentColor" opacity="0.22" />
    <path d="M12 22 32 6l20 16" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" opacity="0.55" />
    <rect x="20" y="40" width="24" height="30" rx="4" fill="currentColor" opacity="0.42" />
  </svg>
);

/** Bottle silhouette. */
export const Bottle = ({ className = "", size = 72 }: MotifProps) => (
  <svg viewBox="0 0 64 96" width={size} height={(size * 96) / 64} fill="none" className={className} {...hidden}>
    <path d="M26 6h12v12l6 12a20 20 0 0 1 2 9v45a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6V39a20 20 0 0 1 2-9l6-12V6Z" fill="currentColor" opacity="0.22" />
    <path d="M18 48h28" stroke="currentColor" strokeWidth="3" opacity="0.5" />
    <rect x="24" y="56" width="16" height="20" rx="3" fill="currentColor" opacity="0.42" />
  </svg>
);

/* ── Product mark ──────────────────────────────────────────────────────
   One carton silhouette does the work a product photograph would, tinted to
   the tier colour wherever a rating is shown. An earlier version of this file
   carried a drawn mark per plant base — oat, almond, soy and the rest — but at
   the ~32px they were used, half of them read as blobs and none of them read as
   the ingredient. The category tiles are typographic instead, which the display
   face carries far better than eight mediocre botanical glyphs did. */

/* ── Section dividers ─────────────────────────────────────────────────── */

/**
 * A soft crest between two bands. `flip` points it downward so a band can be
 * closed as well as opened. The colour comes from `fill` on the path via
 * `currentColor`, so set the text colour to the *incoming* band's ground.
 */
export const CrestDivider = ({ className = "", flip = false }: { className?: string; flip?: boolean }) => (
  <svg
    viewBox="0 0 1440 96"
    preserveAspectRatio="none"
    className={className}
    style={flip ? { transform: "rotate(180deg)" } : undefined}
    {...hidden}
  >
    <path d="M0 96V52c180-34 360-52 540-52s360 18 540 52c120 22 240 33 360 33v11H0Z" fill="currentColor" />
  </svg>
);

/** A tight torn-paper edge — busier than the crest, good above dense bands. */
export const RippleDivider = ({ className = "", flip = false }: { className?: string; flip?: boolean }) => (
  <svg
    viewBox="0 0 1440 64"
    preserveAspectRatio="none"
    className={className}
    style={flip ? { transform: "rotate(180deg)" } : undefined}
    {...hidden}
  >
    <path
      d="M0 64V26c96 18 192 24 288 18s192-26 288-30 192 10 288 20 192 12 288 0 192-24 288-36v66H0Z"
      fill="currentColor"
    />
  </svg>
);
