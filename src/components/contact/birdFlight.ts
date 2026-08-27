/**
 * How one pigeon flies.
 *
 * Kept out of the component file so fast refresh keeps working — the same
 * reason memberNav and userMarkTone live on their own.
 *
 * The flight is a sampled curve rather than a handful of waypoints, and that
 * is the whole reason it stopped stuttering.
 *
 * It used to be five keyframes animated with `ease: "easeOut"`. Framer applies
 * an easing to *each* pair of keyframes, not across the sequence, so the bird
 * decelerated into every one of the four waypoints and then jumped back up to
 * speed — four visible hitches per flight. Between the waypoints it also
 * travelled in straight lines, so the "arc" was a polyline with corners.
 *
 * Sampling a bezier at eighteen points and walking them at a constant rate
 * fixes both: the curve is in the positions, so the motion needs no easing of
 * its own. What easing there is gets baked into *where* the samples are taken
 * — clustered towards the end, so the bird leaves fast and coasts.
 */

/**
 * Deterministic per-bird randomness.
 *
 * Not Math.random: a re-render would re-roll it and the bird would jump
 * mid-flight. Keyed off the bird's own id, every render agrees.
 */
const hash = (seed: number, salt: number) => {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Cubic bezier at t. */
const bezier = (t: number, p0: number, c1: number, c2: number, p1: number) => {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * c1 + 3 * u * t * t * c2 + t * t * t * p1;
};

/** Enough points that the corners between them stop reading as corners. */
const SAMPLES = 26;

export const planFlight = (id: number, viewport: number) => {
  const r = (salt: number) => hash(id, salt);
  const dir = r(1) < 0.5 ? -1 : 1;
  // Relative to the window, not a fixed 600px. On a phone that number flew the
  // bird clean off the screen before anyone saw it leave.
  const reach = Math.min(viewport, 960) * (0.42 + r(2) * 0.4);
  // Proportional to the reach, not an absolute 110-300px. The curve's control
  // points are fractions of both, so an absolute rise made the shape depend on
  // how far the bird happened to be going: rise-over-reach ranged from 0.14 to
  // 0.74, and the tall narrow end of that still cornered at 61 degrees a step
  // however finely it was sampled. Held between 0.30 and 0.44 the shape is the
  // same shape at every size.
  const rise = reach * (0.3 + r(3) * 0.14);
  const duration = 1.8 + r(4) * 1.0;
  const scale = 0.8 + r(5) * 0.55;
  const lost = r(7) < 0.2;

  // Out and up, then a long coast — or, one in five, out and up and then a
  // change of heart. "Learning the difference between your address and a bread
  // crumb trail."
  //
  // The change of heart is an arch that sweeps over the top, not a fold that
  // doubles back on itself. Folding the control points back produced a cusp:
  // the bird reversed inside a single sample and swung 121 degrees between two
  // frames. Sampling it more finely only sliced the same corner thinner — the
  // geometry was the problem. Over the top it is 32 degrees a step, measured,
  // and it still ends up on the wrong side, which is the joke.
  const cx = lost
    ? [0, dir * reach * 0.95, -dir * reach * 0.75, -dir * reach * 0.55]
    : [0, dir * reach * 0.3, dir * reach * 0.62, dir * reach];
  const cy = lost
    ? [0, -rise * 1.0, -rise * 1.55, -rise * 0.45]
    : [0, -rise * 1.05, -rise * 1.15, -rise * 0.82];

  const x: number[] = [];
  const y: number[] = [];
  const opacity: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t = i / (SAMPLES - 1);
    // The easing lives here rather than in the transition: sample the curve
    // more densely towards the end and the bird leaves fast and settles, with
    // no per-segment deceleration to trip over.
    // 1.35, not 1.7: the steeper curve dropped the last few steps to 8px, 6px
    // then 3px, and a ratio of 2.24 between neighbouring steps is a visible
    // hesitation at the end of the flight. This decays smoothly — measured
    // monotonic, never more than 1.53 between neighbours.
    const eased = 1 - Math.pow(1 - t, 1.35);
    x.push(bezier(eased, cx[0], cx[1], cx[2], cx[3]));
    y.push(bezier(eased, cy[0], cy[1], cy[2], cy[3]));
    opacity.push(t < 0.07 ? t / 0.07 : t > 0.78 ? Math.max(0, (1 - t) / 0.22) : 1);
  }

  // Bank into the direction of travel rather than grinding through a fixed
  // 0-to-45. A bird that climbs points up and a bird that dives points down.
  const rotate: number[] = [];
  const scaleX: number[] = [];
  for (let i = 0; i < SAMPLES - 1; i++) {
    const dx = x[i + 1] - x[i];
    const dy = y[i + 1] - y[i];
    rotate.push(clamp(((Math.atan2(dy, Math.abs(dx)) * 180) / Math.PI) * 0.7, -34, 34));
    scaleX.push(Math.sign(dx) || dir);
  }
  rotate.push(rotate[rotate.length - 1]);
  scaleX.push(scaleX[scaleX.length - 1]);

  return { x, y, rotate, scaleX, opacity, duration, scale };
};

export type Flight = ReturnType<typeof planFlight>;
