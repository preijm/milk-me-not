/**
 * How one pigeon flies.
 *
 * Kept out of the component file so fast refresh keeps working — the same
 * reason memberNav and userMarkTone live on their own.
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

export const planFlight = (id: number, viewport: number) => {
  const r = (salt: number) => hash(id, salt);
  const dir = r(1) < 0.5 ? -1 : 1;
  // Relative to the window, not a fixed 600px. On a phone that number flew the
  // bird clean off the screen before anyone saw it leave.
  const reach = Math.min(viewport, 960) * (0.42 + r(2) * 0.4);
  const rise = 110 + r(3) * 190;
  const duration = 1.8 + r(4) * 1.0;
  const scale = 0.7 + r(5) * 0.6;
  const flap = 0.16 + r(6) * 0.1;
  const lost = r(7) < 0.2;

  const x = lost
    ? [0, dir * reach * 0.34, dir * reach * 0.46, dir * reach * 0.06, -dir * reach * 0.55]
    : [0, dir * reach * 0.2, dir * reach * 0.46, dir * reach * 0.74, dir * reach];
  const y = lost
    ? [0, -rise * 0.55, -rise * 0.74, -rise * 0.5, -rise * 0.18]
    : [0, -rise * 0.5, -rise * 0.82, -rise * 0.98, -rise * 0.84];

  // Bank into the direction of travel rather than grinding through a fixed
  // 0-to-45. A bird that climbs points up and a bird that dives points down.
  const rotate: number[] = [];
  const scaleX: number[] = [];
  for (let i = 0; i < x.length - 1; i++) {
    const dx = x[i + 1] - x[i];
    const dy = y[i + 1] - y[i];
    rotate.push(clamp((Math.atan2(dy, Math.abs(dx)) * 180) / Math.PI * 0.7, -34, 34));
    scaleX.push(Math.sign(dx) || dir);
  }
  rotate.push(rotate[rotate.length - 1]);
  scaleX.push(scaleX[scaleX.length - 1]);

  return { x, y, rotate, scaleX, duration, scale, flap };
};

export type Flight = ReturnType<typeof planFlight>;
