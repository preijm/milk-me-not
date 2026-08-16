/**
 * Story motifs — the illustrated vocabulary of the public site.
 *
 * The brand has no photography, so the milk drop from the logo does the work
 * photography would otherwise do: it is the hero shape, the section watermark,
 * the bullet, and the per-milk-type mark. Everything here is drawn in
 * `currentColor` with layered opacity so a single motif can sit on cream, on
 * brand green, or on a deep forest band without a second asset.
 */

import type { ReactElement } from "react";

type MotifProps = {
  className?: string;
  /** Rendered size in px; motifs keep their own aspect ratio. */
  size?: number;
  title?: string;
};

const hidden = { "aria-hidden": true } as const;

/** The signature shape: a milk drop with layered tints, a highlight and satellites. */
export const MilkDrop = ({ className = "", size = 160, title }: MotifProps) => (
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

/* ── Per-milk-type marks ───────────────────────────────────────────────
   One drawn mark per plant base. These replace the stock product photo on
   category tiles, so each one has to read at 40px and at 160px. */

const Oat = () => (
  <g>
    <path d="M32 58V16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    {[22, 31, 40, 49].map((y) =>
      [-1, 1].map((s) => (
        <ellipse
          key={`${y}${s}`}
          cx={32 + s * 8}
          cy={y}
          rx="7.5"
          ry="3.6"
          transform={`rotate(${s * 30} ${32 + s * 8} ${y})`}
          fill="currentColor"
          opacity="0.55"
        />
      )),
    )}
    <ellipse cx="32" cy="13" rx="3" ry="6" fill="currentColor" opacity="0.75" />
  </g>
);

const Almond = () => (
  <g>
    <path d="M32 10c12 10 17 22 17 30 0 11-8 18-17 18s-17-7-17-18c0-8 5-20 17-30Z" fill="currentColor" opacity="0.55" />
    <path d="M32 20c6 8 9 15 9 20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
  </g>
);

const Soy = () => (
  <g>
    <path d="M13 40c0-13 11-24 25-24 9 0 13 4 13 9 0 12-12 25-26 25-8 0-12-4-12-10Z" fill="currentColor" opacity="0.45" />
    <circle cx="24" cy="36" r="5" fill="currentColor" opacity="0.85" />
    <circle cx="37" cy="29" r="5" fill="currentColor" opacity="0.85" />
    <path d="M13 44c-2 6 0 10 5 12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" opacity="0.7" />
  </g>
);

const Coconut = () => (
  <g>
    <circle cx="32" cy="34" r="21" fill="currentColor" opacity="0.5" />
    <path d="M11 34a21 21 0 0 0 42 0c0-4-9-7-21-7s-21 3-21 7Z" fill="currentColor" opacity="0.75" />
    <ellipse cx="32" cy="27" rx="21" ry="6" fill="#fff" opacity="0.55" />
  </g>
);

const Rice = () => (
  <g>
    {[
      [22, 20, -24],
      [40, 24, 22],
      [26, 38, 16],
      [42, 44, -18],
      [32, 52, 4],
    ].map(([x, y, r], i) => (
      <ellipse key={i} cx={x} cy={y} rx="5" ry="10" transform={`rotate(${r} ${x} ${y})`} fill="currentColor" opacity={0.45 + i * 0.08} />
    ))}
  </g>
);

const Hazelnut = () => (
  <g>
    <circle cx="32" cy="38" r="18" fill="currentColor" opacity="0.55" />
    <path d="M14 30c4-9 11-14 18-14s14 5 18 14c-5 4-11 6-18 6s-13-2-18-6Z" fill="currentColor" opacity="0.8" />
    <path d="M32 16v-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
  </g>
);

const Pea = () => (
  <g>
    <path d="M14 30c8-11 28-13 38-4 5 5 3 13-5 18-11 7-27 5-33-3-2-4-2-8 0-11Z" fill="currentColor" opacity="0.42" />
    <circle cx="24" cy="34" r="6" fill="currentColor" opacity="0.85" />
    <circle cx="36" cy="33" r="6" fill="currentColor" opacity="0.85" />
    <circle cx="47" cy="30" r="5" fill="currentColor" opacity="0.85" />
  </g>
);

const Cashew = () => (
  <g>
    <path d="M20 18c14-4 27 4 29 17 1 10-6 17-14 15-7-2-8-10-16-12-8-2-12-16 1-20Z" fill="currentColor" opacity="0.55" />
    <path d="M27 26c8 0 13 5 15 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
  </g>
);

const Blend = () => (
  <g>
    <circle cx="24" cy="28" r="12" fill="currentColor" opacity="0.4" />
    <circle cx="40" cy="30" r="10" fill="currentColor" opacity="0.55" />
    <circle cx="32" cy="44" r="11" fill="currentColor" opacity="0.7" />
  </g>
);

const TYPE_MARKS: Record<string, () => ReactElement> = {
  oat: Oat,
  almond: Almond,
  soy: Soy,
  soya: Soy,
  coconut: Coconut,
  rice: Rice,
  hazelnut: Hazelnut,
  pea: Pea,
  cashew: Cashew,
  blend: Blend,
};

/** Look up the drawn mark for a plant base ("Oat", "almond", "Soya"…). */
export const TypeMark = ({ base, className = "", size = 64 }: MotifProps & { base: string }) => {
  const key = base.trim().toLowerCase();
  const Mark = TYPE_MARKS[key] ?? TYPE_MARKS[Object.keys(TYPE_MARKS).find((k) => key.includes(k)) ?? "blend"] ?? Blend;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" className={className} {...hidden}>
      <Mark />
    </svg>
  );
};

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
