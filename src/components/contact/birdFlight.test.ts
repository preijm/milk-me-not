import { describe, it, expect } from "vitest";
import { planFlight } from "./birdFlight";

/**
 * The flight is the whole change and it is pure arithmetic, so it can be
 * checked directly — which matters here, because the preview browser does not
 * composite frames and so runs no animation at all.
 */
describe("planFlight", () => {
  const ids = Array.from({ length: 60 }, (_, i) => 1_700_000_000_000 + i * 137);

  it("gives every bird its own flight", () => {
    // The whole complaint: one path, one speed, one angle, so five clicks
    // produced five copies of the same bird on one diagonal.
    const flights = ids.map((id) => planFlight(id, 1200));
    const signature = (f: ReturnType<typeof planFlight>) =>
      `${f.x.at(-1)!.toFixed(1)}|${f.y.at(-1)!.toFixed(1)}|${f.duration.toFixed(2)}|${f.scale.toFixed(2)}`;
    const distinct = new Set(flights.map(signature));
    expect(distinct.size).toBe(flights.length);
  });

  it("is the same flight every time for the same bird", () => {
    // Math.random here would re-roll on any re-render and teleport the bird.
    const a = planFlight(ids[0], 1200);
    const b = planFlight(ids[0], 1200);
    expect(b).toEqual(a);
  });

  it("scales the distance to the window rather than a fixed 600px", () => {
    const phone = planFlight(ids[3], 375);
    const desktop = planFlight(ids[3], 1440);
    expect(Math.abs(phone.x.at(-1)!)).toBeLessThan(Math.abs(desktop.x.at(-1)!));
    // and it does not fly clean off a phone before anyone sees it go
    expect(Math.abs(phone.x.at(-1)!)).toBeLessThanOrEqual(375);
  });

  it("banks into the direction of travel", () => {
    // Climbing points the beak up, descending points it down — instead of
    // grinding through a fixed 0 to 45 whatever the bird is doing.
    for (const id of ids.slice(0, 12)) {
      const f = planFlight(id, 1200);
      for (let i = 0; i < f.x.length - 1; i++) {
        const climbing = f.y[i + 1] < f.y[i];
        if (Math.abs(f.y[i + 1] - f.y[i]) < 1) continue;
        expect(climbing ? f.rotate[i] < 0 : f.rotate[i] > 0).toBe(true);
      }
    }
  });

  it("faces the way it is going", () => {
    for (const id of ids.slice(0, 12)) {
      const f = planFlight(id, 1200);
      for (let i = 0; i < f.x.length - 1; i++) {
        const dx = f.x[i + 1] - f.x[i];
        if (Math.abs(dx) < 1) continue;
        expect(Math.sign(dx)).toBe(f.scaleX[i]);
      }
    }
  });

  it("sends some of them the wrong way, because that is the joke", () => {
    // "Learning the difference between your address and a bread crumb trail."
    // A bird that turns back ends up on the opposite side from where it set off.
    const lost = ids.filter((id) => {
      const f = planFlight(id, 1200);
      return Math.sign(f.x.at(-1)!) !== Math.sign(f.x[1]);
    });
    expect(lost.length).toBeGreaterThan(0);
    expect(lost.length).toBeLessThan(ids.length / 2);
  });

  /**
   * The stutter, made measurable.
   *
   * Five waypoints with `ease: "easeOut"` decelerated into every one of them,
   * because framer applies an easing per keyframe pair rather than across the
   * sequence — four hitches a flight. And the "lost" bird folded back on
   * itself, reversing 121 degrees between two consecutive samples.
   */
  const steps = (f: ReturnType<typeof planFlight>) => {
    const out: number[] = [];
    for (let i = 0; i < f.x.length - 1; i++) out.push(Math.hypot(f.x[i + 1] - f.x[i], f.y[i + 1] - f.y[i]));
    return out;
  };
  const turns = (f: ReturnType<typeof planFlight>) => {
    const out: number[] = [];
    for (let i = 0; i < f.x.length - 2; i++) {
      const a = Math.atan2(f.y[i + 1] - f.y[i], f.x[i + 1] - f.x[i]);
      const b = Math.atan2(f.y[i + 2] - f.y[i + 1], f.x[i + 2] - f.x[i + 1]);
      let d = (Math.abs(b - a) * 180) / Math.PI;
      if (d > 180) d = 360 - d;
      out.push(d);
    }
    return out;
  };

  it("never turns a corner sharp enough to read as a corner", () => {
    for (const id of ids) {
      const worst = Math.max(...turns(planFlight(id, 1200)));
      expect(worst).toBeLessThan(45);
    }
  });

  it("slows down smoothly instead of hesitating", () => {
    // Only for the birds flying straight on. A bird that turns back slows
    // through the turn and picks up afterwards, which is what a turn looks
    // like — asserting otherwise would be asserting something false.
    for (const id of ids) {
      const f = planFlight(id, 1200);
      if (Math.sign(f.x.at(-1)!) !== Math.sign(f.x[1])) continue;
      const s = steps(f);
      for (let i = 1; i < s.length; i++) expect(s[i]).toBeLessThanOrEqual(s[i - 1] + 0.01);
    }
  });

  it("keeps neighbouring frames close in length", () => {
    for (const id of ids) {
      const s = steps(planFlight(id, 1200));
      for (let i = 0; i < s.length - 1; i++) {
        if (s[i] < 2 || s[i + 1] < 2) continue; // the last pixels, where it is fading anyway
        expect(Math.max(s[i] / s[i + 1], s[i + 1] / s[i])).toBeLessThan(1.7);
      }
    }
  });

  it("samples densely enough that the curve is a curve", () => {
    expect(planFlight(ids[0], 1200).x.length).toBeGreaterThanOrEqual(20);
  });

  it("keeps the flap quick enough to read as a wingbeat", () => {
    for (const id of ids.slice(0, 20)) {
      const f = planFlight(id, 1200);
      expect(f.flap).toBeGreaterThan(0.12);
      expect(f.flap).toBeLessThan(0.3);
    }
  });
});
